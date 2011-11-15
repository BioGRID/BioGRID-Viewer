var BGV={
  edges:{},   // place to put edges no matter the source
  plugins:{}, // put external objects here
  holdMe:{},  // needed unused stuff here to not clobber the namespace

  // For each plugin if run is a function execute it with pass as an
  // argument.
  foreachPlugin:function(run,pass){
    for(var n in BGV.plugins){
      var plugin=BGV.plugins[n];

      if('function'==typeof(plugin[run])){
	plugin[run](pass);
      }
    }
  },


  load:function(){
    BGV.display=document.getElementById('display');
    BGV.source=document.getElementById('sources');

    BGV.rowCount=document.getElementsByClassName('rowCount');
    BGV.lastCount=document.getElementsByClassName('lastCount');

    // Hupmh, this should probably be in rest.js
    BGV.lastSVGLink=document.getElementsByClassName('lastSVGLink');
    BGV.lastRESTLink=document.getElementsByClassName('lastRESTLink');

    BGV.foreachPlugin('load');
  },

  start:function(){
    BGV.foreachPlugin('start');
  },

  update:function(){
    BGV.foreachPlugin('update',BGV.edges);
    if(null!=BGV.rowCount){
      for(var l=0;l<BGV.rowCount.length;l++){
	BGV.rowCount[l].textContent=Object.keys(BGV.edges).length;
      }
    }

  },

  resize:function(){
    BGV.foreachPlugin('resize');
  }


};



/*
var BGV={
  appendContent:function(url,to){
    var args=arguments;
    $.get(
      url,function(html){
	$(html).appendTo(to);
	for(var l=2;l<args.length;l++){
	  if('function'==typeof args[l]){
	    args[l]();
	  }
	}
      }
    );
  },

  edgesUpdated:function(recentUpdates){
    $(".rowCount").text(Object.keys(BGV.edges).length);
    $(".lastCount").text(recentUpdates);

    for(var d in BGV.plugins.display){
      BGV.plugins.display[d].show(BGV.edges);
    }
  },

  selectEdge:function(selected,edge){
    if(selected){
      edge.selected=true;
    }else{
      delete edge.selected;
    }

    for(var d in BGV.plugins.display){
      BGV.plugins.display[d].refresh(edge);
    }
  },

  // place to put plugins that get called.
  plugins:{data:{},display:{}},
  constructors:{},
  edges:{},
  prototypes:{
    data:{
      insert:function(d,also){
	BGV.appendContent(
	  "BGV/" + d + ".html",
	  "section#sources",
	  also);
      }
    },

    display:{
      insert:function(d,also){
	BGV.appendContent(
	  "BGV/" + d + ".html",
	  "section#display",
	  also,
	  function(){
	    var put = $("select[name=display]");

	    var selected='';
	    if($("section#" + d).hasClass('main')){
	      selected=' selected="selected"';
	    }

	    put.append('<option value="' + d + '"' + selected + '>' + $('section#' + d).attr('title'));
	    // if(put.children().length>1){
	    //   $('#' + d).slideUp('fast');
	    // }

	  }
	);
      },


      // Passes an array of edges to the display.
      show:function(edges){},

      // Called when existing edges change.
      refresh:function(edge){},

      // Called when this is the main view.
      makeMain:function(){}
    }
  }//prototypes

};

//window.Worker=undefined;
$(document).ready(
  function(){
    for(var d in BGV.plugins.data){
      BGV.plugins.data[d].insert(d);
    }
    for(var d in BGV.plugins.display){
      BGV.plugins.display[d].insert(d);
    }

    $("input[name=selectAll]").bind(
      "click",function(e){
	for(var id in BGV.edges){
	  BGV.selectEdge(true,BGV.edges[id]);
	}
      }
    );

    $("input[name=deselectAll]").bind(
      "click",function(e){
	for(var id in BGV.edges){
	  BGV.selectEdge(false,BGV.edges[id]);
	}
      }
    );


    var display=$("select[name=display]");
    display.bind(
      "change",function(e){
	var show = $(e.currentTarget).val();
	$("section[id=display]>section[id]").map(
	  function(ii,t){
	    var tag=$(t);

	    if(show==tag.attr('id')){
	      tag.slideDown('fast');
//	      tag.addClass("main");
	      BGV.plugins.display[show].makeMain();
	    }else{
	      tag.slideUp('fast');
//	      tag.removeClass("main");
	    }
	  }
	);
      }
    );

  }

);
*/