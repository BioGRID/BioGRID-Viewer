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
	  "BGV/" + d + "/source.html",
	  "section#sources",
	  also);
      }
    },

    display:{
      insert:function(d,also){
	BGV.appendContent(
	  "BGV/" + d + "/display.html",
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

      // Called when existing edges change
      refresh:function(edges){},
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
//	      tag.slideDown('fast');
	      tag.addClass("main");
	      console.log(show, BGV.plugins.display[show]);
	      BGV.plugins.display[show].makeMain();
	    }else{
//	      tag.slideUp('fast');
	      tag.removeClass("main");
	    }
	  }
	);
      }
    );

  }

);