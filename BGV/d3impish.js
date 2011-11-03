BGV.constructors.d3impish=function(){
  var that=this;

  var force=null;
  var g={}; // hold element

  $(window).bind(
    "resize",function(){
      that.show(BGV.edges);
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

  var _links={};
  var _nodes={};

  // BGV edges to d3 links and nodes
  var edges2d3g=function(edges){
    var returnLinks={};;
    for(var id in edges){
      var edge=edges[id];
      var ui=edge.unorderedInteractors();

      if(null==_nodes[ui[0]]){
	_nodes[ui[0]]={name:ui[0]};
      }
      if(null==_nodes[ui[1]]){
	_nodes[ui[1]]={name:ui[1]};
      }

      if(null==_links[ui[0]]){
	_links[ui[0]]={};
      }

      if(null==_links[ui[0]][ui[1]]){
	_links[ui[0]][ui[1]]={
	  source:_nodes[ui[0]],
	  target:_nodes[ui[1]],
	  ids:[id]
	};

      }else if(-1==_links[ui[0]][ui[1]].ids.indexOf(id)){
	_links[ui[0]][ui[1]].ids.push(id);
      }
      returnLinks[id]=_links[ui[0]][ui[1]]; // there can be only one
    }

    return {links:d3.values(returnLinks),nodes:d3.values(_nodes)};
  };

  this.show=function(edges){
    if(0==edges.length){
      return;
    }

    var d3g=edges2d3g(edges);

    var svg=d3.select("#d3impish svg");
    var svgTag=$(svg[0]);

    if(null!=that.force){
      svgTag.find('g').remove();
    }


    /*
    var ld=(svgTag.width()/Object.keys(edges).length)*20;
    console.log(svgTag.width(), Object.keys(edges).length, ld);
     */
    var ld=250;
    var size=[svgTag.width(),svgTag.height()];


    that.force=d3.layout.force()
      .nodes(d3g.nodes)
      .links(d3g.links)
      .size(size)
      .linkDistance(ld)
      .charge(-300)
      .on("tick",tick)
      .start();

    g.path = svg.append("svg:g").attr('class','thePath').selectAll("path")
      .data(that.force.links())
      .enter().append("svg:path")
      .attr(
	"class", function(d) {
	  return "link";// + d.type;
	})
      .attr('stroke-width', function(d){return d.ids.length})
//      .attr("marker-end", function(d) { return "url(#test)"; })
    ;


    //console.log(that.force.nodes());
    g.circle=svg.append("svg:g").selectAll("circle")
      .data(that.force.nodes())
      .enter()
      .append("svg:circle")
      .attr("r",6)
      .on("mousedown",function(node){
	    node.fixed=1;
	  })
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

  this.refresh=function(edge){
    console.log(edge);
  };
};
BGV.constructors.d3impish.prototype=BGV.prototypes.display;
BGV.plugins.display.d3impish=new BGV.constructors.d3impish();
