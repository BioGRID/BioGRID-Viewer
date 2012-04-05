BGV={
  viewer:{},
  parser:{},

  nodes:{},
  edges:{},

  cleanNodes:function(){
    // remove edges that don't exist
    for(var nId in this.nodes){
      var node=this.nodes[nId];
      for(var eId in node._edges){
	if(undefined==this.edges[eId]){
	  delete node._edges[eId];
	}
      }
    }
  },

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
    this.e.species=document.getElementsByClassName('species');
  },

  _reload:null, // store intervalID if volatile
  // Reload, likely now different data.  If we are doing something
  // volatile will try again ever half second until we are done.
  // Returns true if we did it or false if we are waiting to do it.
  reload:function(node){
    if(this.liquid()){
      this.forEach('reload',node);
      return true;
    }else if(null==this._reload){
      var that=this;
      this._reload=setInterval(
	function(){
	  if(that.reload(node)){
	    clearInterval(that._reload);
	    that._reload=null;
	  }
	},500
      );
    }
    return false;
  },
  view:function(node){
    this.forEach('view',node);
  },
  review:function(node){
    this.forEach('review',node);
  },
  resize:function(){
    this.forEach('resize');
  },
  // delete everything
  purge:function(){
    this.forEach('purge');
    BGV.nodes={};
    BGV.edges={};
  },

  // like d3.text() but also works in IE9 for remote sites
  ajax:function(url,callback){
    var that=this;
    this.freeze();
    if('function'==typeof window.XDomainRequest){
      ajax=new window.XDomainRequest();
      ajax.onload=function(){callback(this.responseText);that.melt();};
      ajax.open('GET',url,true);
      ajax.send();
    }else{
      var that=this;
      d3.text(url,function(rt){callback(rt);that.melt();});
    }
  },

  degree:0, // get colder as the number goes up

  // start doing something volatile
  freeze:function(){
    this.degree++;
    //console.log('freeze',this.degree);
  },

  // finished doing something volatile
  melt:function(){
    this.degree--;
    //console.log('melt',this.degree);
  },

  // are we doing something volatile?
  liquid:function(){
    //console.log('liquid',this.degree);
    return this.degree==0;
  },

  _selected:null,
  selected:function(){
    return null!=this._selected;
  },
  deselect:function(){
    var out=this._selected;
    if(null!=out){
      out.deselect();
      this._selected=null;
    }
    return out;
  },
  select:function(node){
    this.deselect();
    this._selected=node;
    return node;
  },

  taxa:{}
};

BGV.freeze();
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
      color:function(def){
	return (undefined==this._color)?def:this._color;
      },

      select:function(){
	BGV.updateElementsText('species',this.display());
      },
      deselect:function(){
	BGV.updateElementsText('species',' ');
      }
    };

    json.forEach(
      function(raw){
	var taxon=new taxa(raw);
	BGV.taxa[taxon.id()]=taxon;
      }
    );

    BGV.melt();
  }
);