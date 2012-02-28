BGV.holdMe.d3bundle=function(){
  var radius=((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2;
  var padding=90;
  var arcWidth=10;

  var nodes;

  var hover=null;
  var hoverp=true;

  this.checkboxes={
    phy:{match:'path.phy',toggle:'hidden',do:this.unicodeCheckboxNot},
    gen:{match:'path.gen',toggle:'hidden',do:this.unicodeCheckboxNot},
    color:{match:'.phy,.gen',toggle:'color',do:this.unicodeCheckbox}
  };

  // @#$% Firefox
  var mozPadding='';
  if('function'==typeof window.navigator.mozIsLocallyAvailable){
    var nbsp=String.fromCharCode(0x00a0);
    mozPadding=nbsp+nbsp+nbsp+nbsp+nbsp;
  }

  // draw the species ring
  this.speciesRing=function(r){
    var that=this;

    this.svg.select("g#speciesRing")
      .selectAll("path")
      .data(this.groups(nodes))
      .enter().append("path")
      .style("fill",function(g){return g.taxa.color('#fdf6e3');}) // base3
      .style("stroke",'black')
      .attr("d",d3.svg.arc().innerRadius(r-arcWidth).outerRadius(r))
      .on(
	"mouseover",function(a){
	  if(hoverp){
	    BGV.updateElement('restNodeSpecies',a.taxa.display());
	  }
	}
      )
      .on(
	"mouseout",function(){
	  if(hoverp){
	    BGV.updateElement('restNodeSpecies','');
	  }
	}
      )
    ;
  };


  this.update=function(){
    var that=this;
    var edges=d3.values(BGV.edges);

    // clear the links box and makes mouseover work again
    document.onmousedown=function(e){
      if(!hoverp&&('svg'==e.target.nodeName)){
	hoverp=true;
	dehoverNode();
      }
    };

    nodes=BGV.nodes();
    this.svg=d3.select("#bgv")
      .attr("transform","translate("+(window.innerWidth/2)+","+radius+")");

    var bundle=d3.layout.bundle();
    var line=d3.svg.line.radial()
      .interpolate("bundle")
      .tension(.3)
      .radius(function(d){return d.y;})
      .angle(function(d){return (d.x/180)*Math.PI;})
    ;


    this.speciesRing((radius-padding)+arcWidth);
    var labelRing=d3.layout.cluster()
      .size([360,radius-padding])
      .sort(null)
      .nodes(this.tree(nodes,queryString.geneList))
    ;

    var splineCount=0;
    var splines=bundle(edges);
    this.svg.select("g#edges").selectAll("path")
      .data(splines)
      .enter().append("path")
      //.on('mouseover',function(n,i){console.log(edges[i]);})
      .attr(
	'class',function(n,i){
	  //return edges[i].ExperimentalSystemType;
	  if(edges[i].genetic()){
	    return 'gen';
	  }else if(edges[i].physical()){
	    return 'phy';
	  }
	  return null;
	}
      )
      .attr(
	'd',
	function(n){
	  var that=this;

	  splineCount++;

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
	    var p1={x:n[0].x+30,y:n[0].y-100};
	    var p2={x:n[0].x-30,y:n[0].y-100};
	    out=line([n[0],p1,p2,n[0]]);
	  }else{
	    out=line(n);
	  }
	  return out;
	}
      );
    if (splines.length!=splineCount){
      alert("Warning: Drew "+splineCount+" of "+splines.length+" splines.");
    }


    var toggleClass=function(nodes,also,clazz,tf){
      nodes.forEach(
	function(node){
	  also.push(node.SVGText);
	}
      );

      if(BGV.IOSp()){
	// d3's classed doesn't seem to work correctly on an iPad
	also.forEach(
	  function(node){
	    var cl=node.getAttribute('class');
	    if(null==cl){
	      cl=[];
	    }else{
	      cl=cl.split(' ');
	    }
	    var i=cl.indexOf(clazz);

	    if(-1==i){
	      if(tf){
		cl.push(clazz);
	      }else{
		return;
	      }
	    }else{
	      if(tf){
		return;
	      }else{
		cl.splice(i,1);
	      }
	    }
	    node.setAttribute('class',cl.join(' '));
	  }
	);
      }else{
	d3.selectAll(also).classed(clazz,tf);
      }

    };

    var hoverNode=function(n){
      if(hoverp){
	n.updateRestElements();
	toggleClass(n.nodes(),n.SVGPath,'over',true);
	hover=n;
      }
    };
    var dehoverNode=function(){
      if(hoverp&&hover!=null){
	hover.clearRestElements();
	toggleClass(hover.nodes(),hover.SVGPath,'over',false);
      }
    };

    this.svg.select("g#nodeLabels")
      .selectAll('g.label')
      .data(labelRing.filter(function(n){return !!n.BioGridId;}))
      .enter().append("g")
      .attr('class','label')
      .attr(
	"transform",function(n){
	  return "rotate("+(n.x-90)+")translate("+n.y+")";
	})
      .append("text")
      .on('mouseover',hoverNode)
      .on('mouseout',dehoverNode)
      .on(
	'click',function(n){
	  hoverp=true;
	  dehoverNode();
	  hoverNode(n);
	  hoverp=false;
	}
      )
      //.attr("fill",function(n){return n.taxa().color();})
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
BGV.holdMe.d3bundle.prototype=BGV.holdMe.d3;
BGV.plugins.d3bundle=new BGV.holdMe.d3bundle();
