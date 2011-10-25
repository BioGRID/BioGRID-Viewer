BGV.constructors.d3marker=function(){
  var that=this;

  var force=null;
  var g={}; // hold element

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

  // BGV edges to d3 links and nodes
  var edges2d3g=function(edges){
    var links=[];
    for(var id in edges){
      var edge=edges[id];
      links.push({source:edge.interactor(0),target:edge.interactor(1)});
    }

    var nodes={};
    links.forEach(
      function(link) {
	link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
      }
    );

    return {links:links,nodes:d3.values(nodes)};
  };


  this.show=function(edges){
    var d3g=edges2d3g(edges);

    var svg=d3.select("#d3marker svg");
    var svgTag=$(svg[0]);


//    console.log(links,d3.values(nodes));
    that.force=d3.layout.force()
      .nodes(d3g.nodes)
      .links(d3g.links)
      .size([svgTag.width(),svgTag.height()])
      .linkDistance(200)
      .charge(-300)
      .on("tick",tick)
      .start();

    /*
    // Per-type markers, as they don't inherit styles.
    svg.append("svg:defs").selectAll("marker")
      .data(["suit", "licensing", "resolved"])
      .enter().append("svg:marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");
*/


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
};
BGV.constructors.d3marker.prototype=BGV.prototypes.display;
BGV.plugins.display.d3marker=new BGV.constructors.d3marker();
