
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
    BGV.e.lastRESTLink=document.getElementsByClassName('lastRESTLink');
    BGV.e.BioGRIDVersion=document.getElementsByClassName('BioGRIDVersion');

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
    BGV.updateElement('lastSVGLink',{href:'bgv.svg?'+qs});
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

      updateRestElements:function(){
	BGV.updateElement('restNodeEntrez'        ,this.Entrez);
	BGV.updateElement('restNodeBioGridId'     ,this.BioGridId);
	BGV.updateElement('restNodeSystematicName',this.SystematicName);
	BGV.updateElement('restNodeOfficialSymbol',this.OfficialSymbol);
	BGV.updateElement('restNodeSpecies'       ,this.species());
	BGV.updateElement('restNodeEdges'         ,this.edgeCount());
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
      this.InteractionThroughput=values[17]; // |
      this.QuantitativeScore=values[18];
      this.PostTranslationalModification=values[19];
      this.Phenotypes=values[20]; // |
      this.Qualifications=values[21]; // |
      this.Tags=values[22];
      this.SourceDatabase=values[23];
      this.interactor=[];

      var that=this;
      [0,1].forEach(
	function(i){
	  var iI=new tab2node(values,i);
	  var id=iI.id();
	  if(null==nodes[id]){
	    nodes[id]=iI;
	    that.interactor[i]=iI;
	  }else{
	    that.interactor[i]=nodes[id];
	  }
	    nodes[id].addEdge(that);
	}
      );

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
	return this.interactor[0];
      },
      iB:function(){
	return this.interactor[1];
      },

      // Get the nodes for use is an unordered graph
      iUn:function(){
	var A=this.iA();
	var B=this.iB();
	return (A.id()<B.id())?[A,B]:[B,A];
      }

    };

    var parse=function(tsv){
      var edgeCount=0;
      var lines=tsv.trim().split("\n");
      while(lines.length>0){
	var line=lines.shift();
	var edge=new tab2edge(line);
	  if(edge.failed()){
	    if(!BGV.updateElement('lastCount',line)){
	      alert("error:"+line);
	    }
 	  }else{
	    var id=edge.id();
	    edgeCount++; // count em even if we already have them
	    if(null==BGV.edges[id]){
	      BGV.edges[id]=edge;
	    }
	  }
      }

      BGV.updateElement('lastCount',edgeCount);
      if(edgeCount==0){
	alert('No edges found');
	return false;
      }
      return true;
    };

    var ajax=ajaxFactory(
      function(responseText){
	if(parse(responseText)){
	  BGV.update();
	}
      }
    );

    ajax.open('GET',url,true);
    ajax.send();
  };


};

BGV.plugins.rest=new BGV.holdMe.rest();
