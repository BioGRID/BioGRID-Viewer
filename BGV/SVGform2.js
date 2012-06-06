BGV.form=function(name){
  this.name=name;
  this.forms=[];

  this.seek("formCheckbox");
  this.seek("formRadio");
//  this.seek("formSelectMulti");

  console.log(this.forms);
};

BGV.form.prototype={
  formCheckbox:function(e){
    this.e=e; // element
    this.tog=e.getElementsByTagName('tspan')[0];

    var that=this;
    e.onclick=function(){
      that.toggle(that.tog);
    }
  },

  formRadio:function(e){
    this.e=e;
    this.rad=[];

    for(var c=e.firstChild;c!=null;c=c.nextSibling){
      if('tspan'==c.nodeName){
	this.rad.push(c);
      }
    }

    var that=this;
    for(var i=0;i<that.rad.length;i++){
      that.rad[i].onclick=function(){
	if(that.isChecked(this.getElementsByTagName('tspan')[0])){
	  // do nothing if we check what is already checked
	  return;
	}

	for(var j=0;j<that.rad.length;j++){
	  var tog=that.rad[j].getElementsByTagName('tspan')[0];
	  if(that.isChecked(tog)){
	    that.toggle(tog);
	  }else if(this==that.rad[j]){
	    that.toggle(tog);
	    // plus go()
	  }
	}
      }
    }

  },

  ours:function(e){
    var name=this.name+'-';
    return e.hasAttribute('id')&&
      (e.getAttribute('id').substring(name.length,0)==name)
  },

  seek:function(type){
    var e=document.getElementsByClassName(type);
    for(var i=0;i<e.length;i++){
      if(this.ours(e[i])){
	this.forms.push(new this[type](e[i]));
      }
    }
  }


}


BGV.form.prototype.formRadio.prototype=
BGV.form.prototype.formCheckbox.prototype={
  TRUE:'☒',
  FALSE:'☐',

  isChecked:function(e){
    return e.textContent==this.TRUE;
  },

  toggle:function(e){
    if(this.isChecked(e)){
      e.textContent=this.FALSE;
      return false;
    }
    e.textContent=this.TRUE;
    return true;
  }
};