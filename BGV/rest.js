//BGV.js
var BGV={
  edges:{},
  plugins:{},
  holdMe:{},

  update:function(){
    for(var n in BGV.plugins){
      var plugin=BGV.plugins[n];
      if('function'==typeof(plugin.update)){
	plugin.update(BGV.edges);
      }
    }
  },

  resize:function(){
    for(var n in BGV.plugins){
      var plugin=BGV.plugins[n];
      if('function'==typeof(plugin.resize)){
	plugin.resize(BGV.edges);
      }
    }
  }
};



//BGV/rest.js
BGV.plugins.rest=function(kv){
  var that=this;

  var foo=function(bar){
    for(var b in bar){
      this[b]=bar[b];
    }
  };
  foo.prototype={
    taxId:4932,
    searchNames:'true',
    //max:1000,
    //start:0,
    includeInteractors:'true',
    includeInteractorInteractions:'true',
    sourceDatabaseList:'BioGRID',
    geneList:'CCC2'
  };
  kv=new foo(kv);

  var url='http://webservice.thebiogrid.org/resources/interactions/?';
  for(var k in kv){
    url+=k+'='+kv[k]+'&';
  }
  url+='enableCaching=true';

  var haveEdges=false;
  var checkAjax=function(){
    if(false==haveEdges && 4==this.readyState){
      haveEdges=parse(this.responseText);
      if(haveEdges){
	BGV.update();
      }
    }
  };

  var ajax = new window.XMLHttpRequest();
  ajax.onreadystatechange=checkAjax;
  ajax.open('GET',url,true);
  ajax.send();

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
      console.log(this,this.taxaID(i));
      return BGV.taxa.get(this.taxaID(i)).color(ifNoColor);
    }

  };

  var parse=function(tsv){
    tsv.trim().split("\n").forEach(
      function(line){
	var edge=new tab2Edge(line);
	var id=edge.id();
	if(null==BGV.edges[id]){
	  BGV.edges[id]=edge;
	}
      }
    );
    return true;
  };
};
//BGV.plugins.rest(queryString);