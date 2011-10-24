Math.TAU = Math.PI*2;

BGV.constructors.arborCanvas=function(){
  var that=this;

  this.arbor={
    init:function(ps){
      this.canvas = $("#arborCanvas canvas");
      this.ctx = this.canvas.get(0).getContext("2d");

      this.fontHeight = 10;
      this.font = this.fontHeight + "px Helvetica";

      this.setSize(ps);
      this.initMouseHandling();

      $(window).bind(
	"resize",function(){
	  that.arbor.setSize(ps);
	  that.ps.renderer.redraw(false);
	}
      );
    },

    setSize:function(ps){
      var w = that.arbor.canvas.width();
      var h = that.arbor.canvas.height();

      that.arbor.canvas.attr("width", w);
      that.arbor.canvas.attr("height", h);
      ps.screenSize(w,h);

      // things that get reset on resize;
      this.ctx.textAlign = "center";
      this.ctx.font = this.font;
    },


    initMouseHandling:function(){
      var dragging = null;
      var fixed_p = null;

      var getApoint = function(e){
	var pos = $(that.arbor.canvas).offset();
	var p = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
	return p;
      };

      var drag = function(e){
	var mP = getApoint(e);
	dragging.node.p = that.ps.fromScreen(mP);
      };

      var drop = function(e){
	$(that.arbor.canvas).unbind('mousemove');
	$(window).unbind('mouseup');
	dragging.node.fixed = fixed_p;
	fixed_p = null;
	dragging = null;
      };

      var click = function(e) {
	dragging = that.ps.nearest(getApoint(e));
	if (dragging == null) {
	  console.log("totally missed");
	} else if (dragging.node == null) {
	  console.log("missed node:", dragging);
	  dragging = null;
	} else {
	  fixed_p = dragging.node.fixed;
	  dragging.node.fixed = true;
	  $(that.arbor.canvas).bind('mousemove', drag);
	  $(window).bind('mouseup', drop);
	}
      };

      $(that.arbor.canvas).mousedown(click);
    },

    redraw:function(clear){
      var ctx = this.ctx;

      if(clear != false){
	var w = that.arbor.canvas.width();
	var h = that.arbor.canvas.height();
	ctx.clearRect(0,0,w,h);
      }

      that.ps.eachEdge(this.drawEdge);
      that.ps.eachNode(this.drawNode);
    },

    // // // // // // //

    drawNode:function(node,pt){
      pt.x = Math.floor(pt.x);
      pt.y = Math.floor(pt.y);

      if(0==that.ps.edgeCount(node)){
	that.ps.pruneNode(node);
      }else{
	var ctx = that.arbor.ctx;

	var h = that.arbor.fontHeight;
	var w = ctx.measureText(node.name).width;

	ctx.beginPath();
	ctx.lineCap = 'round';
	ctx.strokeStyle = node.data.color;
	ctx.moveTo(pt.x - w/2,pt.y +1);
	ctx.lineTo(pt.x + w/2,pt.y +1);
	ctx.lineWidth = that.arbor.fontHeight + 1;
	ctx.stroke();

	ctx.fillStyle = '#8b3b3b';
	ctx.fillText(node.name, pt.x,pt.y + h/2);
      }
    },

    drawEdge:function(edge,pt1,pt2){
      pt1.x = Math.floor(pt1.x);
      pt1.y = Math.floor(pt1.y);
      pt2.x = Math.floor(pt2.x);
      pt2.y = Math.floor(pt2.y);

      var ctx = that.arbor.ctx;

      // Highlight if checked
      if(edge.data.selected.length>0){
	ctx.strokeStyle = 'blue';
	ctx.lineWidth = edge.data.edges.length + 2;

	ctx.beginPath();
	ctx.moveTo(pt1.x,pt1.y);
	ctx.bezierCurveTo(pt2.x-50,pt2.y,
			  pt2.x+50,pt2.y+50,
			  pt2.x,pt2.y);
	ctx.stroke();
      }

      // draw the normal line
      ctx.strokeStyle = '#8b3b3b';
      ctx.lineWidth = edge.data.edges.length;

      ctx.beginPath();
      ctx.moveTo(pt1.x,pt1.y);
      ctx.bezierCurveTo(pt2.x-50,pt2.y,
			pt2.x+50,pt2.y+50,
			pt2.x,pt2.y);
      ctx.stroke();
    }

  };

  this.makeMain=function(){
      that.arbor.setSize(that.ps);
      that.ps.renderer.redraw(false);
  };

  this.refresh=function(edge){

    var id=edge.id();
    var cEdge=that.ps.getEdges(edge.interactor(0),edge.interactor(1))[0]; // there can be only one

    var i=cEdge.data.selected.indexOf(id);
    switch(i){
    case(-1):
      if(edge.selected){
	cEdge.data.selected.push(id);
      }
      break;
    default:
      if(!edge.selected){
	cEdge.data.selected.splice(i,1);
      }
    }

  };


  this.show=function(edges){
    for(var id in edges){
      var edge=edges[id];

      var A = that.ps.addNode(edge.interactor(0),{color:edge.color(0,'pink')});
      var B = that.ps.addNode(edge.interactor(1),{color:edge.color(1,'pink')});
      var e = that.ps.getEdges(A,B);
      switch(e.length){
      case 0:
	that.ps.addEdge(A,B,{selected:[],edges:[edge.id()]});
	break;
      case 1:
	if(-1 == e[0].data.edges.indexOf(edge.id())){
	  e[0].data.edges.push(edge.id());
	}
	break;
      default:
	alert("arborCanvas has multiple edges for:",A,B);
      }
    }
  };

  this.ps = arbor.ParticleSystem({stiffness:100});
  this.ps.renderer = this.arbor;

  // this.ps.addEdge("A","B");
  // this.ps.addEdge("B","C");
  // this.ps.addEdge("B","D");
  // this.ps.addEdge("B","E");
  // this.ps.addEdge("E","F");
  // this.ps.addEdge("E","G");
};
BGV.constructors.arborCanvas.prototype=BGV.prototypes.display;
BGV.plugins.display.arborCanvas=new BGV.constructors.arborCanvas();

