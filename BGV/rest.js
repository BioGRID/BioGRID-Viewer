BGV.holdMe.rest=function(){
  var qs;

  var ajaxFactory=function(whenDone){
    var ajax;
    if('function'==typeof window.XDomainRequest){
      ajax=new window.XDomainRequest();
      ajax.onload=function(){
	whenDone(this.responseText);
      };
    }else{
      var haveEdges=false;
      ajax=new window.XMLHttpRequest();
      ajax.onreadystatechange=function(){
	if(false==haveEdges && 4==this.readyState){
	  whenDone(this.responseText);
	}
      };
    }
    return ajax;
  };


  this.load=function(){
    // you need to provide these elements
    BGV.e.lastSVGLink=document.getElementsByClassName('lastSVGLink');
    BGV.e.lastBundleLink=document.getElementsByClassName('lastBundleLink');
    BGV.e.lastRESTLink=document.getElementsByClassName('lastRESTLink');
    BGV.e.BioGRIDVersion=document.getElementsByClassName('BioGRIDVersion');

    BGV.e.lastPhy=document.getElementsByClassName('lastPhy');
    BGV.e.lastGen=document.getElementsByClassName('lastGen');

    BGV.e.restNodeEntrez        =document.getElementsByClassName("restNodeEntrez");
    BGV.e.restNodeBioGridId     =document.getElementsByClassName("restNodeBioGridId");
    BGV.e.restNodeSystematicName=document.getElementsByClassName("restNodeSystematicName");
    BGV.e.restNodeOfficialSymbol=document.getElementsByClassName("restNodeOfficialSymbol");
    BGV.e.restNodeSpecies       =document.getElementsByClassName("restNodeSpecies");
    BGV.e.restNodeEdges         =document.getElementsByClassName("restNodeEdges");
  },

  this.start=function(kv){
    if(BGV.e.BioGRIDVersion.length>0){
      var url=BGV.config.rest.url+'resources/version';
      var ajax=ajaxFactory(
	function(rt){
	  BGV.updateElement('BioGRIDVersion',rt);
	}
      );
      ajax.open('GET',url,true);
      ajax.send();
    }


    if(null==kv && 'undefined'!=typeof(queryString)){
      kv=queryString;
    }

    qs='';
    for(var k in kv){
      qs+=k+'='+kv[k]+'&';
    }

    var url=BGV.config.rest.url+'resources/interactions/?'+qs+'enableCaching=true';
    qs=qs.slice(0,-1);

    BGV.updateElement('lastCount','pending');
    BGV.updateElement('lastSVGLink',{href:'force.svg?'+qs});
    BGV.updateElement('lastBundleLink',{href:'bundle.svg?'+qs});
    BGV.updateElement('lastRESTLink',{href:url});

    // i==0 means A, i==1 B
    var tab2node=function(values,i){
      this.Entrez=values[1+i];
      this.BioGridId=values[3+i];
      this.SystematicName=values[5+i];
      this.OfficialSymbol=values[7+i];
      this.Synonyms=values[9+i];
      this.OrganismID=values[15+i];
      this.edges={};
    };
    tab2node.prototype={
      id:function(){
	// need to change if we get another source
	return this.BioGridId;
      },
      addEdge:function(edge){
	this.edges[edge.id()]=edge;
      },
      edgeCount:function(){
	return Object.keys(this.edges).length;
      },

      display:function(){
	return this.OfficialSymbol;
      },
      taxa:function(){
	return BGV.taxa.get(this.OrganismID);
      },
      species:function(){
	return this.taxa().display();
      },
      color:function(ifNoColor){
	return this.taxa().color(ifNoColor);
      },

      // returns a list of nodes are connected to, with this is
      // element zero
      nodes:function(){
	var out=[this];
	for(id in this.edges){
	  var edge=this.edges[id];
	  if(-1==out.indexOf(edge.iA())){
	    out.push(edge.iA());
	  }
	  if(-1==out.indexOf(edge.iB())){
	    out.push(edge.iB());
	  }
	}
	return out
      },

      updateRestElements:function(){
	var url='http://thebiogrid.org/'+this.BioGridId+'/';
	BGV.updateElement(
	  'restNodeBioGridId',
	  {href:url,'xlink:href':url},
	  this.BioGridId);

	url='http://www.ncbi.nlm.nih.gov/gene/'+this.Entrez;
	BGV.updateElement(
	  'restNodeEntrez',
	  {href:url,'xlink:href':url},
          this.Entrez);

	BGV.updateElement('restNodeSystematicName',this.SystematicName);
	BGV.updateElement('restNodeOfficialSymbol',this.OfficialSymbol);
	BGV.updateElement('restNodeSpecies'       ,this.species());
	BGV.updateElement('restNodeEdges'         ,this.edgeCount());
      },


      clearRestElements:function(){
	['restNodeBioGridId', 'restNodeEntrez',
	 'restNodeSystematicName', 'restNodeOfficialSymbol',
	 'restNodeSpecies', 'restNodeEdges'].forEach(
	   function(clear){
	     BGV.updateElement(clear,' ');
	   }
	 );
      }

    };

    var nodes={};
    var tab2edge=function(line){
      var values=line.split("\t");

      if(values.length<24){
	return null;
      }

      this.BioGRIDInteractionID=values[0];
      this.ExperimentalSystemName=values[11]; // |
      this.ExperimentalSystemType=values[12];
      this.PaperReference=values[13];
      this.PubmedID=values[14];
      this.InteractionThroughput=values[17].split('|');
      this.QuantitativeScore=values[18];
      this.PostTranslationalModification=values[19];
      this.Phenotypes=values[20]; // |
      this.Qualifications=values[21]; // |
      this.Tags=values[22];
      this.SourceDatabase=values[23];

      // interactions
      var s=new tab2node(values,0);
      var t=new tab2node(values,1);

      if(null==nodes[s.id()]){
	nodes[s.id()]=s;
      }
      this.source=nodes[s.id()];

      if(null==nodes[t.id()]){
	nodes[t.id()]=t;
      }
      this.target=nodes[t.id()];

      return this;
    };
    tab2edge.prototype={
      id:function(){
	return this.SourceDatabase + this.BioGRIDInteractionID;
      },
      failed:function(){
	return (Object.keys(this).length==0);
      },
      iA:function(){
	return this.source;
      },
      iB:function(){
	return this.target;
      },

      // Get the nodes for use is an unordered graph
      iUn:function(){
	var A=this.iA();
	var B=this.iB();
	return (A.id()<B.id())?[A,B]:[B,A];
      },

      _match:function(field,seek){
	return this[field].indexOf(seek)!=-1;
      },

      highThroughput:function(){
	return this._match('InteractionThroughput','High Throughput');
      },
      lowThroughput:function(){
	return this._match('InteractionThroughput','Low Throughput');
      },

      genetic:function(){
	return (this.ExperimentalSystemType=='genetic');
      },
      physical:function(){
	return (this.ExperimentalSystemType=='physical');
      }
    };

    var parse=function(tsv){
      var edgeCount=0;
      var lastPhy=0;
      var lastGen=0;

      var lines=tsv.trim().split("\n");
      while(lines.length>0){
	var line=lines.shift();
	var edge=new tab2edge(line);
	  if(edge.failed()){
	    if(!BGV.updateElement('lastCount',line)){
	      alert("error:"+line);
	    }
 	  }else{
	    edge.source.addEdge(edge);
	    edge.target.addEdge(edge);
	    var id=edge.id();
	    edgeCount++; // count em even if we already have them
	    if(edge.genetic()){
	      lastGen++;
	    }else if(edge.physical()){
	      lastPhy++;
	    }

	    if(null==BGV.edges[id]){
	      BGV.edges[id]=edge;
	    }
	  }
      }

      if(this.totalEdges!=edgeCount){
	edgeCount+=' of '+this.totalEdges;
      };

      BGV.updateElement('lastCount',edgeCount);
      BGV.updateElement('lastGen',lastPhy);
      BGV.updateElement('lastPhy',lastGen);
      if(edgeCount==0){
	alert('No edges found');
	return false;
      }
      return true;
    };


    var fetchCount=ajaxFactory(
      function(responseText){
	this.totalEdges=responseText;

	var fetchTab2=ajaxFactory(
	  function(responseText){
	    if(parse(responseText)){
	      BGV.update();
	    }
	  }
	);

	fetchTab2.open('GET',url,true);
	fetchTab2.send();
      }
    );

    fetchCount.open('GET',url+"&format=count",true);
    fetchCount.send();

  };
};

BGV.plugins.rest=new BGV.holdMe.rest();
