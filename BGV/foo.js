BGV.holdMe.foo=function(){

  this.update=function(){
    var nodes=BGV.nodes();
    var edges=d3.values(BGV.edges);
    var r=((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2;

    var svg=d3.select("#bgv").append("g")
      .attr("transform","translate("+(window.innerWidth/2)+","+r+")");

    var bundle=d3.layout.bundle();
    var cluster=d3.layout.cluster()
      .size([360, r-120])
      .sort(null)
    //    .value(function(d){return d.size;})
    ;
    var line=d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.5)
      .radius(function(d){return d.y;})
      .angle(function(d){return d.x / 180 * Math.PI;})
    ;

    var blank={children:nodes};
    if((queryString.geneList.length>2) && (-1==queryString.geneList.indexOf('|'))){
      var node=BGV.node(queryString.geneList);
      nodes.splice(nodes.indexOf(node),1);
      node.children=nodes;
      blank=node;
    }

    var ring=cluster.nodes(blank);

    var spline=bundle(edges);
    svg.selectAll("path.link")
      .data(spline)
      .enter().append("path")
      .attr('fill','none')
      .attr('stroke','steelblue')
      .attr('stroke-opacity','.1')
      .attr("d", line);

    svg.selectAll("g.node")
      .data(
	ring
	  .filter(function(n){
		    return !!n.BioGridId;
		  })
      )
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
	      return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .append("text")
      .attr("dx", function(d) {
	      return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) {
	      return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) {
	      if(!!d.children){
		// center the middle node
		return "rotate(-90)";
	      }else if(d.x >= 180){
		return "rotate(180)";
	      }else{
		return null;
	      }
	    }
	   )
      .text(function(d) {
	      return d.display(); });

  };
};

BGV.plugins.foo=new BGV.holdMe.foo();