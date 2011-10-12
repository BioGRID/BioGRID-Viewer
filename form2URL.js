

var form2URL = function(form,handler){
  form2URL.handlers[form.attr("name")] = handler;
  form.bind("submit", this.generate_url);

  var togs = form.find(".toggle");
  togs.bind("change", this.toggleFields);
  togs.trigger("change");

  form.find(":reset").bind(
    "click",function(){
      togs.trigger("change");
    }
  );
};

form2URL.handlers={};

form2URL.prototype={
  generate_url:function(e){
    e.preventDefault();

    var url = $(e.currentTarget).attr("action") + '?';

    var fields = $(e.currentTarget).find(".field:enabled");

    for(var l = 0; l < fields.length; l++){
      var field = $(fields.get(l));
      var name = field.prop("name");
      var value = field.val();

      if (typeof value == "string"){
	value = value.trim();
      } else if (null == value){
	value = '';
      }else{
	value = value.join("|");
      }

      if (value.length > 0) {
	url += name + '=' + value + '&';
      }
    }
    url = url.substring(0, url.length - 1); // remove last &

    var name = $(e.currentTarget).attr("name");
    var handler = form2URL.handlers[name];
    if ('function' == typeof handler){
      handler(url,e);
    }else{
      console.log(url);
    }
  },

  // disable/enable all .field tags in a fieldset
  toggleFields:function(e){
    var tog = $(e.currentTarget);
    var fields = tog.parents("fieldset").find(".field");
    fields.attr("disabled", !tog.is(":checked"));
  }
};



