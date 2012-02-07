BGV.holdMe.foo=function(){
  var radius=((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2;
  var arcWidth=10;
  var svg,nodes;

  // @#$% Firefox
  var mozPadding='';
  if('function'==typeof window.navigator.mozIsLocallyAvailable){
    var nbsp=String.fromCharCode(0x00a0);
    mozPadding=nbsp+nbsp+nbsp+nbsp+nbsp;
  }


  this.speciesRing=function(r){
    var groups=this.groups(nodes);
    svg
      .selectAll("path.species")
      .data(groups)
      .enter().append("path")
      .style("fill",function(g){return g.taxa.color();})
      .style("stroke",'black')
      .attr("d",d3.svg.arc().innerRadius(r-arcWidth).outerRadius(r))
//      .on("mouseover",function(x,i){console.log(groups[i]);})
    ;


  };

  this.update=function(){
    var edges=d3.values(BGV.edges);

    nodes=BGV.nodes();
    svg=d3.select("#bgv").append("g")
      .attr("transform","translate("+(window.innerWidth/2)+","+radius+")");

    var bundle=d3.layout.bundle();
    var cluster=d3.layout.cluster()
      .size([360,radius-120])
      .sort(null)
    ;
    var line=d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.3)
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


    this.speciesRing(radius-110);

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
	'class',function(n,i){
	  return edges[i].ExperimentalSystemType;
	}
      )
      .attr(
	'd',
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
	    var p1={x:n[0].x+10,y:n[0].y-100};
	    var p2={x:n[0].x-10,y:n[0].y-100};
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
//      .attr("fill",function(n){return n.taxa().color();})
      .attr("dx",function(n){return (n.x<180)?15:-15;})
      .attr("dy",".31em")
      .attr("text-anchor",function(n){return (n.x<180)?"start":"end";})
      .attr(
	"transform", function(n,i) {

	  n.SVGText=this;
	  if(!!n.children){
	    // center the middle node
	    return "rotate(-90)";
	  }else if(n.x>=180){
//	    return 'translate('+arcWidth+')rotate(180)';
	    return 'rotate(180)';
	  }else{
	    return null;
	  }
	}
      )
      .text(function(d){return d.display()+mozPadding;})
    ;



  };
};
BGV.holdMe.foo.prototype=BGV.holdMe.d3;
BGV.plugins.foo=new BGV.holdMe.foo();