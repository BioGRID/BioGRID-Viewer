BGV.constructors.d3marker=function(){
  var that=this;

  var force=null;
  var g={}; // hold element

  $(window).bind(
    "resize",function(){
      that.refresh(BGV.edges);
    }
  );

  var tick=function(){
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
	return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      }
    );

  };

  var _links={};
  var _nodes={};

  // BGV edges to d3 links and nodes
  var edges2d3g=function(edges){
    for(var id in edges){
      var edge=edges[id];
      var A=edge.interactor(0);
      var B=edge.interactor(1);

      if(null==_nodes[A]){
	_nodes[A]={name:A};
      }
      if(null==_nodes[B]){
	_nodes[B]={name:B};
      }

      if(null==_links[id]){
	_links[id]={source:_nodes[A],target:_nodes[B]};
      }

    }

    return {links:d3.values(_links),nodes:d3.values(_nodes)};
  };

  this.refresh=function(edges){
    if(0==edges.length){
      return;
    }

    var d3g=edges2d3g(edges);

    var svg=d3.select("#d3marker svg");
    var svgTag=$(svg[0]);

    if(null!=that.force){
      svgTag.find('g').remove();
    }


    /*
    var ld=(svgTag.width()/Object.keys(edges).length)*20;
    console.log(svgTag.width(), Object.keys(edges).length, ld);
     */
    var ld=400;

    that.force=d3.layout.force()
      .nodes(d3g.nodes)
      .links(d3g.links)
      .size([svgTag.width(),svgTag.height()])
      .linkDistance(ld)
      .charge(-300)
      .on("tick",tick)
      .start();

    g.path = svg.append("svg:g").selectAll("path")
      .data(that.force.links())
      .enter().append("svg:path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#test)"; });


    //console.log(that.force.nodes());
    g.circle=svg.append("svg:g").selectAll("circle")
      .data(that.force.nodes())
      .enter()
      .append("svg:circle")
      .attr("r",6)
      .call(that.force.drag);

    g.text = svg.append("svg:g").selectAll("g")
      .data(that.force.nodes())
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

  };

  this.show=this.refresh;
};
BGV.constructors.d3marker.prototype=BGV.prototypes.display;
BGV.plugins.display.d3marker=new BGV.constructors.d3marker();
