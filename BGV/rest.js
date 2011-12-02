
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
  },

  this.start=function(kv){
    var url=BGV.config.rest.url+'resources/version';
    var ajax=ajaxFactory(
      function(rt){
	console.log(rt)
	BGV.updateElement('BioGRIDVersion',rt);
      }
    );
    console.log(url);
    ajax.open('GET',url,true);
    ajax.send();



    if(null==kv && 'undefined'!=typeof(queryString)){
      kv=queryString;
    }

    qs='';
    for(var k in kv){
      qs+=k+'='+kv[k]+'&';
    }

    var url=BGV.config.rest.url
      +'BiogridRestService/resources/interactions/?'+qs+'enableCaching=true';
    qs=qs.slice(0,-1);

    BGV.updateElement('lastCount','pending');
    BGV.updateElement('lastSVGLink',{href:'bgv.svg?'+qs});
    BGV.updateElement('lastRESTLink',{href:url});

    tab2Edge=function(values){
      this.values=values.split("\t");
    };
    tab2Edge.prototype={
      id:function(){
	return this.values[23] + this.values[0];
      },
      unorderedInteractors:function(){
	var A=this.intBioGRIDid(0);
	var B=this.intBioGRIDid(1);
	return (A<B)?[0,1]:[1,0];
      },

      // All functions starting with 'int' you have to provide an
      // interactor number: 0=A, 1=B

      intEntrez:function(i){
	return this.values[1+i];
      },
      intBioGRIDid:function(i){
	return this.values[3+i];
      },
      intSystematicName:function(i){
	return this.values[5+i];
      },
      intOfficalSymbol:function(i){
	return this.values[7+i];
      },
      intSynonyms:function(i){
	return this.values[9+i];
      },

      intTaxaID:function(i){
	return this.values[15+i];
      },
      intTaxa:function(i){
	return BGV.taxa.get(this.intTaxaID(i));
      },
      intColor:function(i,ifNoColor){
	//console.log(this,this.taxaID(i),ifNoColor);
	return this.intTaxa(i).color(ifNoColor);
      }
    };

    var parse=function(tsv){
      var edgeCount=0;
      var noError=true; // if error holds message
      var lines=tsv.trim().split("\n");
      while(lines.length>0 && noError){
	var line=lines.shift();
	var edge=new tab2Edge(line);
	  if(edge.values.length<24){
	    if(!BGV.updateElement('lastCount',line)){
	      alert("error:"+line);
	    }
	    noError=line;
 	  }else{
	    var id=edge.id();
	    edgeCount++; // count em even if we already have them
	    if(null==BGV.edges[id]){
	      BGV.edges[id]=edge;
	    }
	  }
      }

      if(noError){
	BGV.updateElement('lastCount',edgeCount);
	if(edgeCount==0){
	  alert('No edges found');
	}
      }else{
	BGV.updateElement('lastCount',noErrer);
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

    /*
    var ajax;
    if('function'==typeof window.XDomainRequest){
      ajax=new window.XDomainRequest();
      ajax.onload=function(){
	parse(this.responseText);
	BGV.update();
      };
    }else{
      var haveEdges=false;
      ajax=new window.XMLHttpRequest();
      ajax.onreadystatechange=function(){
	if(false==haveEdges && 4==this.readyState){
	  haveEdges=parse(this.responseText);
	  if(haveEdges){
	    BGV.update();
	  }
	}
      };
    }
     */

    ajax.open('GET',url,true);
    ajax.send();
  };


};

BGV.plugins.rest=new BGV.holdMe.rest();
