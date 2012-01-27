BGV.holdMe.foo=function(){

this.update=function(){
  var nodes=BGV.nodes();
  /*
  [
    { food:'apple' },
    { food:'banana' },
    { food:'cake' },
    { food:'daikin' },
    { food:'endive' },
    { food:'fig' }
  ];
*/

  var edges=d3.values(BGV.edges);
  /*
  [
    {source:nodes[0],target:nodes[1]},
    {source:nodes[0],target:nodes[2]},
    {source:nodes[2],target:nodes[3]},
    {source:nodes[4],target:nodes[5]}
  ];
*/

  var r=((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2;

  var svg=d3.select("#bgv").append("g")
    .attr("transform","translate("+r+","+r+")");

  /*
  var bla=function(a,b){
    var A=a.food.charAt(a.food.length-1);
    var B=b.food.charAt(b.food.length-1);
    return (Math.random()<.5);
  };
*/

  var bundle=d3.layout.bundle();
  var cluster=d3.layout.cluster()
    .size([360, r-120])
    .sort(null)
//    .value(function(d){return d.size;})
  ;
  var line=d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d){return d.y;})
    .angle(function(d){return d.x / 180 * Math.PI;})
  ;

  var blank={
//    food:"",
    children:nodes
  };

  var ring=cluster.nodes(blank);

  var spline=bundle(edges);
  svg.selectAll("path.link")
    .data(spline)
    .enter().append("path")
    .attr('fill','none')
    .attr('stroke','steelblue')
    .attr('stroke-opacity','.4')
    .attr("d", line);


  svg.selectAll("g.node")
    .data(ring.filter(function(n) {
			 return !n.children; }))
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
	    return d.x < 180 ? null : "rotate(180)"; })
    .text(function(d) {
	    return d.display(); });

};
};

BGV.plugins.foo=new BGV.holdMe.foo();