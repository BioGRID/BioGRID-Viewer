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
    ;
    var line=d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.5)
      .radius(function(d){return d.y;})
      .angle(function(d){return d.x/180*Math.PI;})
    ;

    var blank={children:nodes};
    if((queryString.geneList.length>2) && (-1==queryString.geneList.indexOf('|'))){
      var node=BGV.node(queryString.geneList);
      if(node!=null){
    	nodes.splice(nodes.indexOf(node),1);
    	node.children=nodes;
    	blank=node;
      }
    }

    var ring=cluster.nodes(blank);

    var splines=bundle(edges);
    svg.selectAll("path")//.link")
      .data(splines)
      .enter().append("path")
      // .on(
      // 	'mouseover',function(n){
      // 	  var out=[];
      // 	  n.forEach(
      // 	    function(node){
      // 	      if(undefined!=node.OfficialSymbol){
      // 		out.push(node.OfficialSymbol);
      // 	      }
      // 	    }
      // 	  );
      // 	  console.log(out);
      // 	}
      // )
      .attr(
	'd',//line
	function(n){
	  var that=this;

	  // skip the center point
	  ((n.length==3)?[n[0],n[2]]:n).forEach(
	    function(node){
	      if(null==node.SVGPath){
		node.SVGPath=[that];
	      }else if(-1==node.SVGPath.indexOf(that)){
		node.SVGPath.push(that);
	      }
	    }
	  );
	  var out=null;
	  if(n.length==1){
	    var p1={x:n[0].x+10,y:n[0].y+100};
	    var p2={x:n[0].x-10,y:n[0].y+100};
	    out=line([n[0],p1,p2,n[0]]);
	  }else{
	    out=line(n);
	  }
	  return out;
	}
      );

    var toggleClass=function(nodes,also,clazz,tf){
      nodes.forEach(
	function(node){
	  also.push(node.SVGText);
	}
      );
      d3.selectAll(also).classed(clazz,tf);
    };

    svg.selectAll("g.node")
      .data(
	ring
	  .filter(function(n){
		    return !!n.BioGridId;
		  })
      )
      .enter().append("g")
//      .attr("class", "node")
      .attr(
	"transform",function(n){
	  return "rotate("+(n.x-90)+")translate("+n.y+")";
	})
      .append("text")
      .on(
	'mouseover',function(n){
	  toggleClass(n.nodes(),n.SVGPath,'foo',true);
	}
      ).on(
	'mouseout',function(n){
	  toggleClass(n.nodes(),n.SVGPath,'foo',false);
	}
      )
      .attr("fill",function(n){return n.taxa().color();})
      .attr("dx",function(n){return (n.x<180)?8:-8;})
      .attr("dy", ".31em")
      .attr("text-anchor",function(n){return (n.x<180)?"start":"end";})
      .attr(
	"transform", function(n,i) {
	  n.SVGText=this;
	  if(!!n.children){
	    // center the middle node
	    return "rotate(-90)";
	  }else if(n.x>=180){
	    return "rotate(180)";
	  }else{
	    return null;
	  }
	}
      )
      .text(function(d) {
	      return d.display(); });

    var arc=d3.svg.arc();
    console.log(arc(r,r+10));
  };
};

BGV.plugins.foo=new BGV.holdMe.foo();