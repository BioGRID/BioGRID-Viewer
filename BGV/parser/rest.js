BGV.parser.rest={
  load:function(){
    var that=this;

    // parse the QUERY_STRING
    window.location.href.split('?',2)[1].split('&').forEach(
      function(attr){
	var skip=['enableCaching','format'];

	var kv=attr.split('=',2);
	if(-1==skip.indexOf(kv[0])){
	  that._queryString[kv[0]]=kv[1];
	}
      }
    );

    // fetch the data
    BGV.ajax(
      this.interactionsURL(),function(t){
	that.parse(t);
	BGV.view(that._queryString.geneList);
      }
    );

    // Get the database version
    var bgv='BioGRIDVersion';
    BGV.e.BioGRIDVersion=document.getElementsByClassName(bgv);
    BGV.ajax(this.versionURL(),function(v){BGV.updateElementsText(bgv,v);});

    // for displaying data
    ["restNodeEntrez","restNodeBioGridId","restNodeSystematicName",
     "restNodeOfficialSymbol","restNodeEdges"].forEach(
       function(c){
	 BGV.e[c]=document.getElementsByClassName(c);
       }
     );

    // // // //
    // evidence list stuff
    var off='☐';
    var on='☒';

    // arrange the list
    var elt=d3.select("#evidenceList").attr('transform','translate('+(window.innerWidth-4)+')');
    var lf=0; // line feed
    elt.selectAll('.lf')
      .attr(
	'y',function(){
	  return lf+=(d3.select(this).classed('all'))?
	    this.getBBox().height*1.5:this.getBBox().height;
   	}
      )
    ;

    // returns all the siblings after tag
    var siblings=function(tag){
      var out=[];
      for(var t=tag.nextSibling;t!=null;t=t.nextSibling){
	if(undefined!=t.tagName){
	  out.push(t);
	}
      }
      return d3.selectAll(out);
    };

    // returns true if we are on
    var isOn=function(t){
      var tag=(undefined==t.length)?d3.select(t).select('tspan'):t;
      return on==tag.text();
    };

    var toggle=function(t){
      var tog=d3.select(t).select('tspan');

      if(isOn(tog)){
	tog.text(off);
	return off;
      }
      tog.text(on);
      return on;
    };

    // oh, oh, something changed, go!
    var go=function(){
      var el=[];
      var all=0;
      elt.selectAll('.select text').each(
	function(){
	  all++;
	  if(isOn(this)){
	    el.push(this.textContent.replace(on,'').trim());
	  }
	}
      );

      if(el.length==all){
	delete that._queryString.includeEvidence;
	delete that._queryString.evidenceList;
      }else{
	that._queryString.includeEvidence=true;
	that._queryString.evidenceList=el.join('|');
      }

      BGV.refresh();
    };

    // set up the toggle events
    elt.selectAll('.all')
      .call(
	function(){
	  this.each(
	    function(){
	      siblings(this).on(
		'click',function(){
		  toggle(this);
		  go();
		}
	      );
	    }
	  );
	}
      )
      .on(
	'click',function(){
	  var s=toggle(this);
	  siblings(this).select('tspan').text(s);
	  go();
	}
      )
    ;

  },

  _queryString:{},
  queryString:function(){
    var out=[];
    for(var k in this._queryString){
      out.push(k+'='+this._queryString[k]);
    }
    return out.join('&');
  },

  interactionsURL:function(){
    return BGV.config('rest','url')+'resources/interactions?enableCaching=true&'
      +this.queryString();
  },
  countURL:function(){
    return this.interactionsURL()+"&format=count";
  },
  versionURL:function(){
    return BGV.config('rest','url')+'resources/version';
  },


  parse:function(tsv){
    var lines=tsv.trim().split("\n");
    var l=lines.length;

    BGV.ajax(
      this.countURL(),function(t){
	var c=l;
	if(t!=l){
	  c+=" of "+t;
	}
	BGV.updateElementsText('InteractionCount',c);
      }
    );

    while(lines.length>0){
      var line=lines.shift();
      var edge=BGV.addEdge(new this.edge(line.split("\t"),this));
      edge.source.addEdge(edge);
      edge.target.addEdge(edge);
    }
  },


  edge:function(values,that){
    if(values.length<24){
      throw "Invalid tab2 line";
    }

    this.BioGRIDInteractionID=values[0];
    this.ExperimentalSystemName=values[11]; // |
    this.ExperimentalSystemType=values[12];
    this.PaperReference=values[13];
    this.PubmedID=values[14];
    this.InteractionThroughput=values[17];//.split('|');
    this.QuantitativeScore=values[18];
    this.PostTranslationalModification=values[19];
    this.Phenotypes=values[20]; // |
    this.Qualifications=values[21]; // |
    this.Tags=values[22];
    this.SourceDatabase=values[23];

    this.source=new that.node(values,0);
    this.target=new that.node(values,1);
  },

  node:function(values,i){
    this.data={
      Entrez:values[1+i],
      BioGridId:values[3+i],
      SystematicName:values[5+i],
      OfficialSymbol:values[7+i],
      Synonyms:values[9+i],
      OrganismID:values[15+i]
    };

    this._edges={};

    if(undefined==BGV.taxa[this.data.OrganismID]){
      throw "Taxa id " + this.data.OrganismID + " not found.";
    }
  }

};

BGV.parser.rest.edge.prototype={
  id:function(){
    return this.SourceDatabase+this.BioGRIDInteractionID;
  },
  classes:function(){
    var c=['edge', this.ExperimentalSystemType];
    return c.join(' ');
  }
};
BGV.parser.rest.node.prototype={
  id:function(){
    return this.data.BioGridId;
  },
  addEdge:function(edge){
    this._edges[edge.id()]=edge;
    return edge;
  },

  // returns a list of edges
  edges:function(){
    return d3.values(this._edges);
  },
  edgeTags:function(){
    var out=[];
    this.edges().forEach(
      function(edge){
	out.push(edge.tag);
      }
    );
    return out;
  },

  // returns a list of nodes we connect to
  nodes:function(meTo){
    out={};

    this.edges().forEach(
      function(edge){
	out[edge.source.id()]=edge.source;
	out[edge.target.id()]=edge.target;
      }
    );

    if(('boolean'!=typeof meTo)||(meTo==false)){
      delete out[this.id()];
    }

    return d3.values(out);
  },
  nodeTags:function(meTo){
    var out=[];
    this.nodes(meTo).forEach(
      function(node){
	out.push(node.tag);
      }
    );
    return out;
  },

  taxonId:function(){
    return this.data.OrganismID;
  },
  taxon:function(){
    return BGV.taxa[this.data.OrganismID];
  },
  color:function(def){
    return this.taxon().color(def);
  },
  display:function(){
    return this.data.OfficialSymbol;
  },
  cmp:function(x){
    if(this.data.OrganismID<x.data.OrganismID){
      return -1;
    }else if(this.data.OrganismID>x.data.OrganismID){
      return 1;
    }

    if(this.data.OfficialSymbol<x.data.OfficialSymbol){
      return -1;
    }else if(this.data.OfficialSymbol>x.data.OfficialSymbol){
      return 1;
    }

    return 0;
  },
  match:function(s){
    return (s.toLowerCase()==this.data.OfficialSymbol.toLowerCase());
  },
  classes:function(){
    return 'node';
  },


  select:function(){
    d3.selectAll(this.nodeTags(true)).classed('highlight',true);
    d3.selectAll(this.edgeTags(true)).classed('highlight',true);

    this.taxon().select();

    BGV.updateElementsText("restNodeEntrez",this.data.Entrez);
    BGV.updateElementsHref("restNodeEntrez",
			   'http://www.ncbi.nlm.nih.gov/gene/'+ this.data.Entrez);
    BGV.updateElementsText("restNodeBioGridId",this.data.BioGridId);
    BGV.updateElementsHref("restNodeBioGridId",
			   'http://thebiogrid.org/'+this.data.BioGridId+'/');
    BGV.updateElementsText("restNodeSystematicName",this.data.SystematicName);
    BGV.updateElementsText("restNodeOfficialSymbol",this.data.OfficialSymbol);
    BGV.updateElementsText("restNodeEdges",d3.keys(this._edges).length);
  },
  deselect:function(){
    d3.selectAll(this.nodeTags(true)).classed('highlight',false);
    d3.selectAll(this.edgeTags(true)).classed('highlight',false);

    this.taxon().deselect();

    BGV.updateElementsText("restNodeEntrez",' ');
    BGV.updateElementsText("restNodeBioGridId",' ');
    BGV.updateElementsText("restNodeSystematicName",' ');
    BGV.updateElementsText("restNodeOfficialSymbol",' ');
    BGV.updateElementsText("restNodeEdges",' ');
  }

};