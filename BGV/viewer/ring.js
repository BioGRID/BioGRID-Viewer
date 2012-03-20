Math.TAU=2*Math.PI;

BGV.viewer.ring={
  radius:(((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2),
  padding:100,

  cluster:function(match){
    var tree={children:BGV.getNodes()};

    var yn=BGV.yesNo(match);
    if(yn[0].length==1){
      yn[0][0].children=yn[1];
      tree=yn[0][0];
    }


    var out=d3.layout.cluster()
      .size([Math.TAU,this.radius-this.padding])
      .sort(function(a,b){return a.cmp(b);})
      .nodes(tree)
      .filter(function(l){return !!l.id;})
    ;
    return out;
  },
  bundle:d3.layout.bundle(),
  getLine:function(){
    if(null==this.line){
      var d3line=d3.svg.line.radial()
	.interpolate("bundle")
	.tension(.3)
	.radius(function(d){return d.y;})
	.angle(function(d){return d.x;});

      this.line=function(n){
	if(n.length==1){
	  var p1={x:n[0].x+30,y:n[0].y-100};
	  var p2={x:n[0].x-30,y:n[0].y-100};
	  out=d3line([n[0],p1,p2,n[0]]);
	}else{
	  out=d3line(n);
	}
	return out;
      };
    }
    return this.line;
  },

  load:function(){
    this.ring=d3.select("#BGVring")
      .attr("transform","translate("+(window.innerWidth/2)+","+this.radius+")")
    ;
  },

  d3arcPrep:function(nodes){
    var groups=[];

    nodes.forEach(
      function(node){
//	console.log(node);
	var taxa=node.taxonId();
	var last=groups[groups.length-1];
	if(0==groups.length || (last.taxa!=taxa)){
	  groups.push({taxa:taxa,count:1,color:node.color('#fdf6e3')}); // base3;
	}else{
	  last.count++;
	}
      }
    );

    if(groups.length==1){
      groups[0].startAngle=0;
      groups[0].endAngle=Math.TAU;
    }else{
      var gap=Math.TAU/500;
      var slice=Math.TAU/nodes.length;
      var rad=gap/2;
      groups.forEach(
	function(group){

	  group.startAngle=rad;
	  group.endAngle=(rad+(group.count*slice))-gap;
	  rad=group.endAngle;
	  rad+=gap;
	}
      );
    }

    return groups;
  },

  view:function(match){
    var arcWidth=10;
    var arcWidthPad=arcWidth*1.5;

    nodes=this.cluster(match);
    this.ring.select(".nodes")
      .selectAll(".node").data(nodes)
      .enter().append('g')
      .attr('class',function(n){return n.classes();})
      .each(function(n){n.tag=this;})
      .attr("transform",function(n){return "rotate("+((n.x*(360/Math.TAU))-90)+")translate("+n.y+")";})
      .append('text').text(function(n){return n.display();})
      .attr('transform','translate('+arcWidthPad+')')
    ;
    var edges=BGV.getEdges();
    this.ring.select(".edges")
      .selectAll(".edge").data(this.bundle(edges))
      .enter().append('path')
      .attr('class',function(t,i){return edges[i].classes();})
      .each(function(t,i){edges[i].tag=this;})
      .attr('d',this.getLine())
    ;



    var groups=this.d3arcPrep(
      nodes
      .filter(function(n){return !(n.children);})
      .sort(function(a,b){return a.x-b.x;})
    );


    var r=this.radius-this.padding;
    this.ring.select(".taxa")
      .selectAll(".taxon").data(groups)
      .enter().append('path').attr('class','taxon')
      .attr('style',function(g){return "fill:"+g.color+";stroke:black";})
      .attr('d',d3.svg.arc().innerRadius(r).outerRadius(r+arcWidth))
    ;
  }



};