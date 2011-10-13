
var BGV={
  store_url:function(url){
    $("form[name=fetch_url] [type=url]").val(url);
  },

  config:function(key){
    if((undefined!=BGV._config) && (undefined!=BGV._config[key])){
      return BGV._config[key];
    }
    return "";
  },

  fetch_url:function(e){
    e.preventDefault();

    var url = $(e.currentTarget).find("input[type=url]").val().trim();
    $("body").css("cursor", "wait");
    if (url.length > 0){
//      $.get(BGV.config("url_prefix") + url, BGV.parse_tab2);

      $.ajax(
	{
	  url:BGV.config("url_prefix") + url,
	  cache:true,
	  success:BGV.parse_tab2
	}
      );
    }
  },

  // Add one interaction at a time, expects a tab2 row split into an
  // array as input
  addInteraction:function(i){
    var id = 'i' + i[0];
    var have = $('#' + id);
    var tr = '';

    switch(have.length){
    case 0:
      tr = '<tr id="' + id + '" class="new">' +
	'<th><input type="checkbox" value="' + id + '"/></th>';
      while(i.length > 0){
	tr += "<td>" + i.shift() + "</td>";
      }
      tr += "</tr>";
      break;
    case 1:
      have.removeClass('old');
      have.addClass('new');
      break;
    default:
      alert("Found multiple entries for: " + id);
    }

    $("table#interactions>tbody").append(tr);
  },

  removeInteractions:function(ii){
    ii.remove();
    BGV.update_tally();
  },

  update_tally:function(){
    $(".rowCount").text($("table#interactions>tbody>tr").length);
  },

  parse_tab2:function(tsv){
    $("table#interactions>tbody").children("tr").removeClass('new');
    $("table#interactions>tbody").children("tr").addClass('old');
    var lines = tsv.split("\n");

    var count = 0;
    while(lines.length > 0){
      var line = lines.shift();
      var values = line.split("\t");

      if((values.length >= 24) &&  (line.charAt(0) != '#')) {
	count++;
	BGV.addInteraction(values);
      }
    }
    if (count > 0){
      $(".lastCount").text(count);
      BGV.update_tally();
    }
    $("body").css("cursor", "auto");
    $("#interactions").trigger("change");
  },

  check:function(these){
    if($("#check_p").is(":checked")){
      these.attr("checked", "checked");
    }else{
      these.removeAttr("checked");
    }
    these.trigger("change");
  }

};

$.ajax(
  {
    url: "config.json",
    dataType: 'json',
    success:function(data){
      BGV._config = data;
    },
    error:function(a,b,c){
      console.log(a,b,c);
    }
  }
);

$(document).ready(
  function(){

    $("form[name=rest] [name=taxId]").html(BGV.taxa.optionTags(4932));
    $("form[name=fetch_url]").bind("submit", BGV.fetch_url);
    new form2URL($("form[name=rest]"),BGV.store_url);
    $("input.gen").bind(
      "click",function(){
	$("form[name=rest] [name=taxId]").trigger("submit");
	$("form[name=fetch_url]").trigger("submit");
      }
    );

    var control = $("select[name=control]");
    var controls = $(".control");
    controls.map(
      function(ii,section){
	var tag = $(section);
	control.append('<option value="' + ii + '">' + tag.attr('title') + '</option>');
	if(0!=ii){
	  tag.fadeOut('fast');
	}
      }
    );
    control.bind(
      "change",function(e){
	var show = $(e.currentTarget).val();
	controls.map(
	  function(ii,section){
	    if(ii==show){
	      $(section).slideDown("fast");
	    }else{
	      $(section).slideUp("fast");
	    }
	  }
	);
      }
    );



    // Set up control for removeing items in the interactions table
    $("#check_all").bind(
      "click",function(){
	BGV.check($("#interactions :checkbox"));
      }
    );
    $("#check_old").bind(
      "click",function(){
	BGV.check($("#interactions .old input:checkbox"));
      }
    );
    $("#check_new").bind(
      "click",function(){
	BGV.check($("#interactions .new input:checkbox"));
      }
    );
    $("#remove_checked").bind(
      "click",function(){
	BGV.removeInteractions($("#interactions input:checked").parent().parent());
      }
    );

  }
);
