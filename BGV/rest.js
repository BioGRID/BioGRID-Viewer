BGV.plugin.rest={
  reload:function(node){

    if(undefined!=node){
      // when doing internal linking always use BioGRID id search

      delete this._queryString.searchNames;
      delete this._queryString.taxId;
      delete this._queryString.geneList;
      
      this._queryString.searchBiogridIds='TRUE';
      this._queryString.geneList=node.data.BioGridId;

      // geneTaxIdList is the better choice, but if we are already in
      // taxId mode lets stay there
    }

    var that=this;
    var url=this.interactionsURL();

    BGV.updateElementsHref('restTab2',url);
    BGV.updateElementsText('InteractionCount','pending');
    d3.selectAll(BGV.e.restWait).classed('restWait',true);

    BGV.ajax(
      url,function(t){
	if(that.parse(t)){
	  // can't check qs2node until after we parsed
	  BGV.review((undefined==node)?that.qs2node():node);
	}
      }
    );
  },

  // Guess what the species ID might be
  taxId:function(){
    return this._queryString.taxId||this._queryString.geneTaxIdList;
  },

  // try to get the primary node from the query string
  qs2node:function(){
    var that=this;
    var match;

    if((this._queryString.searchNames||'').toLowerCase()==='true'){
      match=function(node){
	return node.isTaxonId(that.taxId())&&node.match(that._queryString.geneList);
      }
    }else if((this._queryString.searchBiogridIds||'').toLowerCase()==='true'){
      match=function(node){
	return node.data.BioGridId===that._queryString.geneList;
      }
    }else{
      return null;
    }

    var nodes=BGV.getNodes();
    for(var l=0;l<nodes.length;l++){
      var node=nodes[l];
      if(match(node)){
	return node;
      }
    }
    return null;
  },

  // return true if should be negated
  exclude:function(id){
    var e='Excluded';
    return (id.substr(-e.length)==e);
  },

  // return _queryString suitable for SVGform input
  formDefaults:function(){
    var out={};

    for(var id in this._queryString){
      var V=this._queryString[id];
      var v=("number"==typeof(V))?V:V.toLowerCase();

      if(this.exclude(id)){
	V=!(v=='true')
      }else if(v=='true'){
	V=true;
      }else if(v=='false'){
	V=false;
      }
      out[id]=V;
    }

    return out;
  },

  resize:function(){
    var elt=d3.select("#REST-evidenceList") // tag
      .attr('transform','translate('+(window.innerWidth-4)+')');
    var lf=0; // line feed
    elt.selectAll('.lf')
      .attr(
	'y',function(){
	  return lf+=(d3.select(this).classed('all'))?
	    this.getBBox().height*1.5:this.getBBox().height;
   	}
      )
    ;

    // return values used in this.form()
    return elt;
  },

  load:function(){
    var that=this;

    // for displaying data
    ["restNodeEntrez","restNodeBioGridId","restNodeSystematicName",
     "restNodeOfficialSymbol","restNodeEdges","restTab2","restWait"].forEach(
       function(c){
	 BGV.e[c]=document.querySelectorAll('.'+c);
       }
     );

    // set QUERY_STRING defaults from config
    this._queryString=BGV.config('rest','queryStringDefaults');

    // parse the QUERY_STRING
    decodeURI(window.location.href).split('?',2)[1].split('&').forEach(
      function(attr){
	var skip=['enableCaching','format'];
	var kv=attr.split('=',2);
	if(-1==skip.indexOf(kv[0])){
	  if(undefined===that._queryString[kv[0]]){
	    that._queryString[kv[0]]=kv[1];
	  }else{
	    that._queryString[kv[0]]+='|'+kv[1];
	  }
	}
      }
    );


    var form;
    if('function'==typeof BGV.Form){
      // Read values set in the document, also sit it if we already have
      // a value.
      form=new BGV.Form
      (
	'REST',function(){
	  //form.values();
	  form.sqs();
	  BGV.reload();
	}
      );

      form.setDefaults(this.formDefaults());

      form.sqs=function(){ // set queryString
	var v=this.values();

	for(k in v){
	  if(k=='evidenceList'){
	    if((27==v[k].length)||(0==v[k].length)){
	      delete that._queryString.includeEvidence;
	      delete that._queryString[k];
	    }else{
	      that._queryString.includeEvidence='TRUE';
	      that._queryString[k]=v[k].join('|');
	    }
	  }else if('boolean'==typeof v[k]){
	    if(that.exclude(k)){
	      that._queryString[k]=v[k]?"FALSE":"TRUE";
	    }else{
	      that._queryString[k]=v[k]?"TRUE":"FALSE";
	    }
	  }else{
	    that._queryString[k]=v[k].toLowerCase();
	  }
	}
      };
      form.sqs();
    }

    // fetch the data
    var countURL=this.countURL();
    BGV.ajax
    (countURL,function(t){
      var count=parseInt(t);

      if(count>BGV.config('rest','throughputCutoff')){
	that._queryString.throughputTag='Low';
	if(form){
	  form.setDefaults({'throughputTag':'Low'});
	}
      }else{
	that.count=count;
      }
      
      var interURL=that.interactionsURL();
      BGV.updateElementsHref('restTab2',interURL);
      
      BGV.ajax
      (interURL,function(t){
	if(null==t){
	  alert("8-/ Unable to fetch data, sorry.");
	  return;
	}
	that.parse(t);
	BGV.view(that.qs2node());
      });
    });

    // Get the database version
    var bgv='BioGRIDVersion';
    BGV.e.BioGRIDVersion=document.getElementsByClassName(bgv);
    if(null===sessionStorage.getItem(bgv)){
      BGV.ajax(this.versionURL(),function(v){sessionStorage.setItem(bgv,v);});
    }
    BGV.updateElementsText(bgv,sessionStorage.getItem(bgv));

    this.resize();
  },

  _queryString:{},
  queryString:function(){
    var out=[];
    for(var k in this._queryString){
      out.push(
	escape(k)+'='+escape(
	  (null==this._queryString[k].join)?
	    this._queryString[k]:
      	    this._queryString[k].join('|')
	)
      );
    }
    return out.join('&');
  },

  interactionsURL:function(){
    return BGV.config('rest','interactions')+
      '?enableCaching=true&'+this.queryString();
  },
  countURL:function(){
    return this.interactionsURL()+"&format=count";
  },
  versionURL:function(){
    return BGV.config('rest','version');
  },

  parse:function(tsv){
    var lines=tsv.trim().split("\n");
    var linesInFile=lines.length;

    if((linesInFile==1)&&(lines[0].length==0)){
      BGV.purge();
      BGV.updateElementsText('InteractionCount',0);
      alert("No edges loaded.");
      return false;
    }

    var newNode={};
    var newEdge={};

    var usableLines=0;
    while(lines.length>0){
      var line=lines.shift();
      try{
	var edge=BGV.addEdge(new this.edge(line.split("\t"),this));
	edge.source.addEdge(edge);
	edge.target.addEdge(edge);

	newEdge[edge.id()]=true;
	newNode[edge.source.id()]=true;
	newNode[edge.target.id()]=true;

	usableLines++;
      }catch(e){
	// ignore currupt tab2 lines
	//console.log(e,line);
      }

    }

    if(this.count){
	BGV.updateElementsText('InteractionCount',this.count);
	d3.selectAll(BGV.e.restWait).classed('restWait',false);
	delete this.count;
    }else{
	var root=this.root;
	BGV.ajax
	(
	 this.countURL(),function(t){
	     var c=usableLines;
	     if(t!=usableLines){
		 c+=" of "+t;
	     }
	     BGV.updateElementsText('InteractionCount',c);
	     d3.selectAll(BGV.e.restWait).classed('restWait',false);
	 });
    }

    if(usableLines!==linesInFile){
      var d=linesInFile-usableLines;

      alert(d + " corrupt " + (d==1?"line":"lines") + 
	    " in TAB2 file ignored.");
    }

    var removeOldNodes=function(fresh,all){
      for(var id in all){
	if(true!=fresh[id]){
	  d3.select(all[id].tag).remove();
	  delete all[id];
	}
      }
    };

    removeOldNodes(newEdge,BGV.edges);
    removeOldNodes(newNode,BGV.nodes);
    BGV.cleanNodes();

    //console.log
    //('nodes:'+d3.keys(BGV.nodes).length,'edges:'+d3.keys(BGV.edges).length);

    return true;
  },


  edge:function(values,that){
    if(values.length<24){
      throw "Invalid tab2 line";
    }

    this.data={
      BioGRIDInteractionID:values[0],
      ExperimentalSystemName:values[11], // |
      ExperimentalSystemType:values[12],
      PaperReference:values[13],
      PubmedID:values[14],
      InteractionThroughput:values[17],//.split('|');
      QuantitativeScore:values[18],
      PostTranslationalModification:values[19],
      Phenotypes:values[20], // |
      Qualifications:values[21], // |
      Tags:values[22],
      SourceDatabase:values[23]
    };

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
      BGV.taxa[this.data.OrganismID]=new BGV.taxon({
	id:this.data.OrganismId,
	species:"taxId "+this.data.OrganismID
      })
    }
  }

};

BGV.plugin.rest.edge.prototype={
  id:function(){
    return this.data.SourceDatabase+this.data.BioGRIDInteractionID;
  },
  classes:function(){
    var c=['edge',this.data.ExperimentalSystemType];
    return c.join(' ');
  },
  stats:function(){
    return {
      ExperimentalSystemType:this.data.ExperimentalSystemType,
      InteractionThroughput:this.data.InteractionThroughput
    };
  }
};
BGV.plugin.rest.node.prototype={
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
  isTaxonId:function(id){
    return id==this.taxonId();
  },

  taxon:function(){
    return BGV.taxa[this.data.OrganismID];
  },
  color:function(def){
    return this.taxon().color(def);
  },
  modLink:function(){
    var p=this.taxon().officialSymbolPrefixLink();
    if(undefined===p){
      return undefined;
    }
    return p+this.data.OfficialSymbol;
  },
  display:function(){
    return this.data.OfficialSymbol;
  },
  summary:function(){
    return this.display() + ' ' + this.taxon().display();
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
    return (undefined==s)?false:(s.toLowerCase()==this.data.OfficialSymbol.toLowerCase());
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
    var ml=this.modLink();
    BGV.updateElementsHref("restNodeOfficialSymbol",undefined===ml?'':ml);

    // link to a list highlighted edges
    BGV.updateElementsText("restNodeEdges",d3.keys(this._edges).length);
    BGV.updateElementsHref
    ("restNodeEdges",BGV.config('rest','interactions') + "?sourceDatabaseIdList=" +
     d3.values(this._edges).map
     (function(e)
      {
	return e.data.BioGRIDInteractionID;
      }).join('|')
    );
			   
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