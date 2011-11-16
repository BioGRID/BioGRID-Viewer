BGV.holdMe.d3force=function(){
  var force=null;
  var g={};

  // Only needs to be called if you don't provide your own SVG tag
  // (like it bgv.svg does)
  this.load=function(){
    if('function'==typeof $){
      $(BGV.display).append('<section class="main fullScreen" title="D3 Force"><svg class="bgv"></svg></section>');
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


  var svg=null;
  this.resize=function(edges){
    var e2d=convertEdges(edges);
    if(null==svg){
      svg=d3.select("svg.bgv");
    }

    // If jQuery do this, else do that.  :-P
    var size=('function'==typeof $)                                 ?
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

      while(null!=svg[0][0].lastChild && 'g'==svg[0][0].lastChild.nodeName){
	svg[0][0].removeChild(svg[0][0].lastChild);
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
	.attr("fill",function(n){return n.color;})
	.on("mousedown",function(node){node.fixed=1;})
	//.on("mouseover",function(node){console.log('hovering',node);})
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


  var _links={};
  var _nodes={};

  var newNode=function(edge,order){
    var name=edge.interactor(order);

    if(null==_nodes[name]){
      _nodes[name]={
	name:name,
	color:edge.color(order,'silver')
      };
      return true;
    }
    return false;
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

      var s=edge.interactor(uo[0]); // start
      var e=edge.interactor(uo[1]); // end

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