
BGV.holdMe.rest=function(){
  var qs;

  this.load=function(){
    // you need to provide these elements
    BGV.e.lastSVGLink=document.getElementsByClassName('lastSVGLink');
    BGV.e.lastRESTLink=document.getElementsByClassName('lastRESTLink');
  },

  this.start=function(kv){
    if(null==kv && 'undefined'!=typeof(queryString)){
      kv=queryString;
    }

    qs='';
    for(var k in kv){
      qs+=k+'='+kv[k]+'&';
    }

    var url=BGV.config.rest.url+qs+'enableCaching=true';
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
      interactor:function(i){
	return this.values[7+i];
      },
      unorderedInteractors:function(){
	var A=this.interactor(0);
	var B=this.interactor(1);
	return (A<B)?[0,1]:[1,0];
      },
      taxaID:function(i){
	return this.values[15+i];
      },
      color:function(i,ifNoColor){
	//console.log(this,this.taxaID(i),ifNoColor);
	return BGV.taxa.get(this.taxaID(i)).color(ifNoColor);
      }
    };

    var parse=function(tsv){
      var edgeCount=0;
      var noError=true; // if error holds message
      var lines=tsv.trim().split("\n");
      while(lines.length>1 && noError){
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

    ajax.open('GET',url,true);
    ajax.send();
  };


};

BGV.plugins.rest=new BGV.holdMe.rest();
