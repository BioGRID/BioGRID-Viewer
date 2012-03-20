BGV={
  viewer:{},
  parser:{},

  nodes:{},
  edges:{},

  getEdges:function(){
    return d3.values(BGV.edges);
  },
  getNodes:function(){
    return d3.values(BGV.nodes);
  },

  addEdge:function(edge){
    var id=edge.id();
    if(undefined==this.edges[id]){
      this.edges[id]=edge;
      edge.source=this.addNode(edge.source);
      edge.target=this.addNode(edge.target);
    }
    return this.edges[id];
  },
  addNode:function(node){
    var id=node.id();
    if(undefined==this.nodes[id]){
      this.nodes[id]=node;
    }
    return this.nodes[id];
  },


  // get a list of plugins
  plugins:function(){
    return d3.values(this.viewer).concat(d3.values(this.parser));
  },

  forEach:function(func,pass){
    var that=this;
    this.plugins().forEach(
      function(p){
	if('function'==typeof p[func]){
	  p[func](pass);
	}
      }
    );
  },

  // return a config value
  config:function(a,b){
    return this._config[a][b];
  },

  e:{}, // elements

  updateElementsText:function(e,text){
    d3.selectAll(this.e[e]).text(text);
  },
  updateElementsHref:function(e,url){
    d3.selectAll(this.e[e]).attr('xlink:href',url);
  },

  // Should only be called on the root tag onload() attribute
  load:function(){
    var that=this;
    d3.json(
      'config.json',function(c){
	BGV._config=c;
	that.forEach('load');
      }
    );

    this.e.InteractionCount=document.getElementsByClassName('InteractionCount');
  },
  view:function(pass){
    this.forEach('view',pass);
  },
  refresh:function(){
    this.forEach('refresh');
  },
  resize:function(){
    this.forEach('resize');
  },

  // Returns an a array	of two lists.  The first element is everything that matched s,
  // the second is everything that did not
   yesNo:function(s){
    var y=[];
    var n=[];
    for(var nID in BGV.nodes){
      var node=BGV.nodes[nID];
      if(node.match(s)){
	y.push(node);
      }else{
	n.push(node);
      }
    }
    return [y,n];
  },

  // like d3.text() but also works in IE9 for remote sites
  ajax:function(url,callback){
    if('function'==typeof window.XDomainRequest){
      ajax=new window.XDomainRequest();
      ajax.onload=function(){callback(this.responseText);};
      ajax.open('GET',url,true);
      ajax.send();
    }else{
      d3.text(url,callback);
    }
  },

  taxa:{}
};

d3.json(
  'BGV/taxa.json',function(json){
    var taxa=function(raw){
      for(var k in raw){
	this['_'+k]=raw[k];
      }
    };
    taxa.prototype={
      id:function(){
	return this._id;
      },
      display:function(){
	return this._species;
      },
      color:function(){
	if(undefined==this._color){
	  return null;
	}
	return this._color;
      }
    };

    json.forEach(
      function(raw){
	var taxon=new taxa(raw);
	BGV.taxa[taxon.id()]=taxon;
      }
    );

  }
);