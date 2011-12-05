BGV.holdMe.d3force=function(){
  var force=null;
  var g={};
  var svg=null;

  var jQueryP=function(){
    return 'function'==typeof jQuery;
  };

  // Only needs to be called if you don't provide your own SVG tag
  // (like it bgv.svg does)
  this.load=function(){
    if(jQueryP()){
      svg=d3.select(BGV.e.display)
	.append("section").attr('class','main fullScreen')
	.append("svg:svg").attr('class','bgv');
    }else{
      svg=d3.select('svg.bgv');
    }
  };

  var tick=function(){
    if(0==Object.keys(g).length){
      return;
    }

    g.circle.attr(
      "transform", function(d) {
	return "translate(" + d.x + "," + d.y + ")";
      }
    );

    g.text.attr(
      "transform", function(d) {
	return "translate(" + d.x + "," + d.y + ")";
      }
    );

    g.path.attr(
      "d", function(d) {
	var dx = d.target.x - d.source.x,
	dy = d.target.y - d.source.y,
	dr = Math.sqrt(dx * dx + dy * dy);
	var ets=50; // edge to self

	var out = "M" + d.source.x + "," + d.source.y;
	if(d.source===d.target){
	  out+="C"
	    + (d.source.x+ets) + ',' + (d.source.y) + ' '
	    + (d.source.x) + ',' + (d.source.y+ets) + ' '
	    + d.target.x + ',' + d.target.y;
	}else{
	  out+="L" + d.target.x + "," + d.target.y;
	}
	return out;
      }
    );
  };

  var overNode=function(node){
    if(!jQueryP()){
      return;
    }

    var nd=$("#nodeDescription");

    nd.html(node.dl());

    $(document)
      .bind(
	'mousemove',function(e){
	  nd
	    .css('left',e.pageX+10)
	    .css('top',e.pageY+10)
	    .css('display','block');
	}
      )
      .bind(
	'mousedown',function(e){
	  nd.css('display','none');
	}
      );
  };

  var outNode=function(node){
    if(!jQueryP()){
      return;
    }
    $(document).unbind('mousemove');
    $('#nodeDescription').css('display','none');
  };

  this.resize=function(edges){
    var e2d=convertEdges(edges);

    // If jQuery do this, else do that.  :-P
    var size=jQueryP()                                              ?
      [$(svg[0][0]).parent().width(),$(svg[0][0]).parent().height()]:
      [window.innerWidth,window.innerHeight]                        ;
    var ld=Math.min(size[0],size[1])*0.40;

    if(null==force){
      force=d3.layout.force()
	.nodes(e2d.nodes)
	.links(e2d.links)
	.size(size)
	.charge(-300)
	.linkDistance(ld)
	.on("tick",tick)
	.gravity(0.5)
	.start();
    }else{
      force
	.size(size)
	.linkDistance(ld)
	.start();
    }

    if(e2d.fresh){

      if(null!=svg[0][0] && null!=svg[0][0].lastChild){
	while('g'==svg[0][0].lastChild.nodeName){
	  svg[0][0].removeChild(svg[0][0].lastChild);
	}
      }

      force
        .nodes(e2d.nodes)
	.links(e2d.links)
      	.start();

      g.path = svg.append("svg:g").selectAll("path")
	.data(force.links())
	.enter().append("svg:path")
	.attr("class", "link")
	.attr('stroke-width', function(d){return d.ids.length;});

      g.circle=svg.append("svg:g").selectAll("circle")
	.data(force.nodes())
	.enter()
	.append("svg:circle")
	.attr("r",6)
	.attr("fill",function(n){return n.color();})
	.on("mousemove",function(node){node.fixed=1;})
	.on("mouseover",overNode)
	.on("touchstart",overNode)
	.on("mouseout",outNode)
	.on("touchend",outNode)
	.call(force.drag);

      g.text = svg.append("svg:g").selectAll("g")
	.data(force.nodes())
	.enter()
	.append("svg:g");
      // A copy of the text with a thick white stroke for legibility.
      g.text.append("svg:text")
	.attr("x", 8)
	.attr("y", ".31em")
	.attr("class", "shadow")
	.text(function(d) { return d.name; });
      g.text.append("svg:text")
	.attr("x", 8)
	.attr("y", ".31em")
	.text(function(d) { return d.name; });




    }


  };


  var node=function(name,edge,order){
    this.name=name;
    this.count=1;

    // we make the assumption that node information is always the same
    // no matter what edge is from
    this.edge=edge;
    this.order=order;
  };
  node.prototype={
    entrez:function(){
      return this.edge.intEntrez(this.order);
    },
    bioGRIDid:function(){
      return this.edge.intBioGRIDid(this.order);
    },
    systematicName:function(){
      return this.edge.intSystematicName(this.order);
    },
    officalSymbol:function(){
      return this.edge.intOfficalSymbol(this.order);
    },
    synonyms:function(){
      return this.edge.intSynonyms(this.order);
    },

    taxa:function(){
      return this.edge.intTaxa(this.order);
    },
    color:function(){
      return this.taxa().color('silver');
    },
    species:function(){
      return this.taxa().display();
    },

    dl:function(){
      return "<dl>"
	+"<dt>Entrez</dt><dd>"+this.entrez()+"</dd>"
	+"<dt>BioGRID ID</dt><dd>"+this.bioGRIDid()+"</dd>"
	+"<dt>Systematic Name</dt><dd>"+this.systematicName()+"</dd>"
	+"<dt>Offical Symbol</dt><dd>"+this.officalSymbol()+"</dd>"
	+"<dt>Organism</dt><dd>"+this.species()+"</dd>"
	+"<dt>Edges</dt><dd>"+this.count+"</dd>"
	+"</dl>";
    }
  };

  var _links={};
  var _nodes={};

  var newNode=function(edge,order){
    var name=edge.intOfficalSymbol(order);

    if(null==_nodes[name]){
      _nodes[name]=new node(name,edge,order);
      return false;
    }
    _nodes[name].count++;
    return true;
  };

  var convertEdges=function(edges){
    var fresh=false;
    var returnLinks={};
    for(var id in edges){
      var edge=edges[id];
      var uo=edge.unorderedInteractors();

      if(newNode(edge,uo[0])){
	fresh=true;
      }
      if(newNode(edge,uo[1])){
	fresh=true;
      }

      var s=edge.intOfficalSymbol(uo[0]); // start
      var e=edge.intOfficalSymbol(uo[1]); // end

      if(null==_links[s]){
	_links[s]={};
      }

      if(null==_links[s][e]){
	_links[s][e]={
	  source:_nodes[s],
	  target:_nodes[e],
	  ids:[id]
	};
	fresh=true;
      }else if(-1==_links[s][e].ids.indexOf(id)){
	_links[s][e].ids.push(id);
      }
      returnLinks[id]=_links[s][e]; // there can be only one
    }

    return {
      links:d3.values(returnLinks),
      nodes:d3.values(_nodes),
      fresh:fresh
    };
  };


  this.update=this.resize;
};

BGV.plugins.d3force=new BGV.holdMe.d3force();