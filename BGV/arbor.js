Math.TAU = Math.PI*2;

BGV.arbor={
  init:function(ps){
    this.canvas = $("canvas#graph");
    this.ctx = this.canvas.get(0).getContext("2d");

    this.fontHeight = 10;
    this.font = this.fontHeight + "px Helvetica";
//    this.font = this.fontHeight + "px Fantasy";

    this.setSize(ps);
    this.initMouseHandling();


    $(window).bind
    ("resize",function(){
       BGV.arbor.setSize(BG.arbor.ps);
       BGV.arbor.ps.renderer.redraw(false);
     }
    );

  },

  setSize:function(ps){
    var w = this.canvas.width();
    var h = this.canvas.height();

    this.canvas.attr("width", w);
    this.canvas.attr("height", h);
    ps.screenSize(w,h);

    // things that get reset on resize;
    this.ctx.textAlign = "center";
    this.ctx.font = this.font;
  },


  initMouseHandling:function(){
    var that = this;
    var dragging = null;
    var fixed_p = null;

    var getApoint = function(e){
      var pos = $(that.canvas).offset();
      var p = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
      return p;
    };

    var drag = function(e){
      var mP = getApoint(e);
      dragging.node.p = that.ps.fromScreen(mP);
    };

    var drop = function(e){
      $(that.canvas).unbind('mousemove');
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
	$(that.canvas).bind('mousemove', drag);
	$(window).bind('mouseup', drop);
      }
    };

    $(this.canvas).mousedown(click);
  },


  redraw:function(clear){
    var ctx = this.ctx;

    if (clear != false){
      var w = this.canvas.width();
      var h = this.canvas.height();
      ctx.clearRect(0,0,w,h);
    }

    BGV.arbor.ps.eachEdge(this.drawEdge);
    BGV.arbor.ps.eachNode(this.drawNode);
  },

  // // // // // // //

  drawNode:function(node,pt){
    pt.x = Math.floor(pt.x);
    pt.y = Math.floor(pt.y);

    if(0==BGV.arbor.ps.edgeCount(node)){
      BGV.arbor.ps.pruneNode(node);
    }else{
      var ctx = BGV.arbor.ctx;

      var h = BGV.arbor.fontHeight;
      var w = ctx.measureText(node.name).width;

      /*
      ctx.beginPath();
      ctx.fillStyle = 'pink';
      ctx.arc(pt.x,pt.y, 3+(w/2), 0, Math.TAU, false);
      ctx.closePath();
      ctx.fill();
       */


      /*
      ctx.lineWidth = 2;
//      ctx.strokeStyle = 'white';
      ctx.strokeStyle = node.data.taxa.color;
      ctx.strokeText(node.name, pt.x,pt.y + h/2);
      */

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.strokeStyle = node.data.taxa.color;
      ctx.moveTo(pt.x - w/2,pt.y +1);
      ctx.lineTo(pt.x + w/2,pt.y +1);
      ctx.lineWidth = BGV.arbor.fontHeight + 1;
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

    var ctx = BGV.arbor.ctx;

    // Highlight if checked
    if(edge.data.checked.length>0){
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = edge.data.ids.length + 2;

      ctx.beginPath();
      ctx.moveTo(pt1.x,pt1.y);
      ctx.bezierCurveTo(pt2.x-50,pt2.y,
			pt2.x+50,pt2.y+50,
			pt2.x,pt2.y);
      ctx.stroke();
    }


    // draw the normal line
    ctx.strokeStyle = '#8b3b3b';
    ctx.lineWidth = edge.data.ids.length;

    ctx.beginPath();
    ctx.moveTo(pt1.x,pt1.y);
    ctx.bezierCurveTo(pt2.x-50,pt2.y,
		      pt2.x+50,pt2.y+50,
		      pt2.x,pt2.y);
    ctx.stroke();


  }

};

// Direct from the TSV files so, so offsets start at zero.
BGV.arbor.parentAddInteraction = BGV.addInteraction;
BGV.addInteraction=function(i){
  var ps = BGV.arbor.ps;
  var id = i[0];
  var A = ps.addNode(i[7],{taxa:BGV.taxa.get(i[15])});
  var B = ps.addNode(i[8],{taxa:BGV.taxa.get(i[16])});
  var edge = ps.getEdges(A,B);

  switch(edge.length){
  case 0:
    var ids=[id];
    edge=ps.addEdge(
      A,B,{
	ids:ids,
	checked:[]
      });
    break;
  case 1:
    edge=edge[0];
    var ids=edge.data.ids;
    if (-1 == ids.indexOf(id)){
      ids.push(id);
    }
    break;
  default:
    alert("Multiple Edges found for " + A + "," + B);
  }

  BGV.arbor.parentAddInteraction(i);

  var cb = $("input:checkbox[value=i" + id + "]");
  cb.unbind("change");
  cb.bind(
    "change",function(e){

      var checked = edge.data.checked;
      if($(e.currentTarget).is(":checked") && (-1 == checked.indexOf(id))){
	checked.push(id);
      }else{
	checked.splice(checked.indexOf(ids), 1);
      }
      ps.start();
    }
  );
};

BGV.arbor.parentRemoveInteractions = BGV.removeInteractions;
BGV.removeInteractions=function(ii){
  var ps = BGV.arbor.ps;

  for(var l=0;l<ii.length;l++){
    var i=ii.get(l);
    var A = $(i.children[8]).text();
    var B = $(i.children[9]).text();
    var edges = ps.getEdges(A,B);

    var edge = edges[0];
    if(1 == edge.data.ids.length){
      var source=edge.source;
      var target=edge.target;
      ps.pruneEdge(edge);
    }else{
      var id = i.id.substring(1);

      var ids = edge.data.ids;
      ids.splice(ids.indexOf(id), 1);

      var checked = edge.data.checked;
      var ci = checked.indexOf(id);
      if(ci != -1){
	checked.splice(ci, 1);
      }
    }
  }
  BGV.arbor.parentRemoveInteractions(ii);
  ps.start();
};


$(document).ready(
  function(){

    var arborParamTags = $("form[name=arbor] input[name]");
    arborParamTags.bind(
      "change",function(e){
	var t = $(e.currentTarget);
	var v = t.val();
	if((-1!=v.indexOf(".")) && (v.length>10)){
	  var v2 = parseFloat(v).toFixed(3);
	  console.log(v, "=>", v2);
	  v = v2;
	}
	t.parent().find("span").text(v);

	if(undefined!=BGV.arbor.ps){
	  var changed={};
	  changed[t.attr("name")]=v;
	  BGV.arbor.ps.parameters(changed);
	  BGV.arbor.ps.start();
	}
      }
    );
    arborParamTags.trigger("change");


    $("form[name=arbor]").bind(
      "reset",function(){
	arborParamTags.trigger("change");
      }
    );

    /*
    $("form[name=arbor] input[type=reset]").bind(
      "click",function(){
	arborParamTags.map(function(ii,t){$(t).reset()});
	arborParamTags.trigger("change");
      }
    );
     */


    var arborParam={};
    arborParamTags.map(
      function(ii,t){
	var tag = $(t);
	arborParam[tag.attr("name")] = tag.val();
      }
    );

    //     onchange="BG.arbor.ps.parameters({'repulsion':$(this).val()});"

    BGV.arbor.ps = arbor.ParticleSystem(arborParam);
//    BG.arbor.ps = arbor.ParticleSystem({stiffness:100});
    BGV.arbor.ps.renderer = BGV.arbor;



    /*
    BG.arbor.ps.addEdge("A","B");
    BG.arbor.ps.addEdge("B","C");
    BG.arbor.ps.addEdge("B","D");
    BG.arbor.ps.addEdge("B","E");
    BG.arbor.ps.addEdge("E","F");
    BG.arbor.ps.addEdge("E","G");
     */

  }
);