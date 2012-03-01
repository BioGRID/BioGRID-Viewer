BGV.holdMe.restForm=function(){
  var form;

  var process=function(e){
    e.preventDefault();
    var kv={};

    form.find(".field:enabled").each(
      function(i,t){
	var tag=$(t);
	var val=tag.val();

	if (typeof val=="string"){
	  val=val.trim();
	} else if (null==val){
	  val='';
	}else{
	  val=val.join("|");
	}

	kv[$(tag).attr('name')]=val;
      }
    );
//    console.log(kv);
    BGV.plugins.rest.start(kv);
  };

  var toggleFields=function(e){
    var tog = $(e.currentTarget);
    var fields = tog.parents("fieldset").find(".field");
    fields.attr("disabled", !tog.is(":checked"));
  };

  var initForm=function(data){
    $(BGV.e.source).append(data);
    form=$("form[name=rest]");

    var togs = form.find(".toggle");
    togs.bind("change", toggleFields);
    togs.trigger("change");

    //form.find("[name=taxId]").html(BGV.taxa.optionTags(4932));
    form.find("[name=geneTaxIdList]").html(BGV.taxa.optionTags(4932));


    var sa=$("[name=selectAll]");
    var og=sa.parent().find("optgroup");
    sa.parent().find("optgroup").each(
      function(idx,tag){
	sa.append('<option value="'+idx+'">'+$(tag).attr('label')+"</option>");
      }
    );
    $(".selectAll").click(
      function(e){
	var idx=$(e.currentTarget).siblings("[name=selectAll]").val();
	var ogs=$(og[idx]).children();
	ogs.attr("selected",true);
      }
    );

    form.bind("submit",process);
  };

  this.load=function(){
    $.get("BGV/restForm.html",initForm);
  };

};
BGV.plugins.restForm=new BGV.holdMe.restForm();

