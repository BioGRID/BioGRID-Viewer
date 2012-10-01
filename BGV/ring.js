Math.TAU=2*Math.PI;

BGV.pplugin.ring={
  padding:.6,

  cluster:function(centerNode){
    this.centerNode=centerNode; // used in this.resize()
    var nodes=BGV.getNodes();
    nodes.forEach(function(n){delete n.parent;delete n.children;});

    var tree;
    if(null==centerNode){
      tree={children:nodes};
    }else{
      centerNode.children=nodes.filter(function(n){return n!=centerNode;});
      tree=centerNode;
    }

    var out=d3.layout.cluster()
      .size([Math.TAU,this.radius*this.padding])
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
    var w;
    var h;
    
    if(document.documentElement.nodeName==='svg'){
      w=window.innerWidth;
      h=window.innerHeight;
    }else{
      var e=document.getElementsByTagName('svg')[0];
      w=e.width.baseVal.value;
      h=e.height.baseVal.value;
    }

    this.radius=(((w<h)?w:h)/2);
    

    this.ring=d3.select("#BGVring")
      .attr("transform","translate("+(w/2)+","+this.radius+")")
    ;

    d3.select("#BGVcontrol").attr('transform','translate(10,'+(this.radius/2)+')');
  },

  d3arcPrep:function(nodes){
    var groups=[];

    nodes.forEach(
      function(node){
	var taxa=node.taxonId();
	var last=groups[groups.length-1];
	if(0==groups.length || (last.taxa!=taxa)){
	  groups.push(
	    {taxa:taxa,
	     count:1,
	     taxon:node.taxon()
	    });
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

  resize:function(){
    this.radius=(((window.innerWidth<window.innerHeight)?window.innerWidth:window.innerHeight)/2);
    this.load();
    this.purge();
    this.view(this.centerNode);
  },

  purge:function(){
    this.reload();
    BGV.getEdges().concat(BGV.getNodes()).forEach(
      function(x){
       	d3.select(x.tag).remove();
      }
    );
  },


  reload:function(){
    // Though no actual reloading takes place here, we want to delete the
    // ring durning reload as a visual sign as to what is going on.
    if(undefined!=this._speciesRing){
      this._speciesRing.remove();
    }
  },

  timeout:500,
  review:function(centerNode){
    // no animated transitions for IE :(
    if(navigator.userAgent.indexOf("Trident/5")>-1){
      this.purge();
      this.view(centerNode);
      return;
    }

    BGV.freeze('review');
    BGV.getNodes().forEach(
      function(node){
	delete node.x;
	delete node.y;
      }
    );

    var nodes=this.cluster(centerNode);

    var on=[]; // old nodes
    var nn=[]; // new nodes

    var oldNodes=[];
    nodes.forEach(
      function(node){
	if(undefined==node.tag){
	  nn.unshift(node);
	}else{
	  oldNodes.push(node.tag);
	  on.push(node);
	}
      }
    );

    var oldEdges=[];
    BGV.getEdges().forEach(
      function(e){
	if(undefined!=e.tag){
	  oldEdges.push(e.tag);
	}
      }
    );

    // Move edges around
    d3.selectAll(oldEdges)
      .data(this.bundle(BGV.getEdges()))
      .transition().duration(this.timeout)
      .attr('d',this.getLine())
    ;

    // Move nodes around
    d3.selectAll(oldNodes)
      .data(nodes.filter(function(l){return !!l.tag;}))
      .transition().duration(this.timeout)
      .attr(
	"transform",function(n){
	  var out='';
	  if(undefined==n.children){
	    out='rotate('+((n.x*(360/Math.TAU))-90)+')';
	  }
	  return out+'translate('+n.y+')';
	}
      )
    ;

    var that=this;
    setTimeout(function(){that._view(on.concat(nn));},this.timeout);
  },

  view:function(centerNode){
    BGV.freeze('view');
    this._view(this.cluster(centerNode));
  },

  _view:function(nodes){
    var that=this;
    var arcWidth=10;
    var arcWidthPad=arcWidth*1.5;

    // draw the nodes
    var tags=this.ring.select(".nodes")
      .selectAll(".node").data(nodes)
      .enter().append('g')
      .attr('class',function(n){return n.classes();})
      .each(function(n){n.tag=this;})
      .attr(
	"transform",function(n){
	  var out='';
	  if(undefined==n.children){
	    out='rotate('+((n.x*(360/Math.TAU))-90)+')';
	  }
	  out+='translate('+n.y+')';
	  return out;
	}
      )
    ;

    tags.append('title').text(function(n){return n.display();});
  
    tags
      .append('text').text(function(n){return n.display();})  
      .attr('transform','translate('+arcWidthPad+')')
      .on('mouseover',function(n,i){if(!BGV.selected()){n.select();}})
      .on('mouseout',function(n){if(!BGV.selected()){n.deselect();}})
      .on('click',function(n){BGV.select(n).select();})
      .on('dblclick',function(n){BGV.deselect();BGV.reload(n);})
      .on('touchmove',function(n){BGV.deselect();BGV.reload(n);}) // for iPads
    ;

    document.onmousedown=function(e){
      if(BGV.selected()&&('svg'==e.target.nodeName)){
	BGV.deselect();
      }
    };

    // draw the edges
    var edges=BGV.getEdges();
    this.ring.select(".edges")
      .selectAll(".edge").data(this.bundle(edges))
      .enter().append('path')
      .attr('class',function(t,i){return edges[i].classes();})
      .each(function(t,i){edges[i].tag=this;})
      .attr('d',this.getLine())
    ;

    // draw the species ring
    var groups=this.d3arcPrep(
      nodes
      .filter(function(n){return !n.children;})
      .sort(function(a,b){return a.x-b.x;})
    );

    var r=this.radius*this.padding;
    this._speciesRing=this.ring.select(".taxa")
      .selectAll(".taxon").data(groups).enter()
      .append('path').attr('class','taxon')
      .attr(
	'style',function(g){
	  return "fill:"+g.taxon.color('#fdf6e3')+";stroke:black"; // base3
	}
      )
      .attr('d',d3.svg.arc().innerRadius(r).outerRadius(r+arcWidth))
      .on('mouseover',function(g){if(!BGV.selected()){g.taxon.select();}})
      .on('mouseout',function(g){if(!BGV.selected()){g.taxon.deselect();}})
    ;

    this._speciesRing.append('title').text(function(g){return g.taxon.display();});

    if(null!=this._selected){
      this._selected.select();
    }

    BGV.melt('_view'); // matches both view and review freeze
  }



};