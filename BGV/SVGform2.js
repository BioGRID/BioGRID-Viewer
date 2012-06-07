BGV.form=function(name,go){
  this.name=name;
  this.forms=[];

  this.seek("Checkbox",this,go);
  this.seek("Radio",this,go);
  this.seek("SelectMulti",this,go);
  //console.log(this.forms);
};

BGV.form.prototype={
  Checkbox:function(e,p,go){
    this.e=e; // element
    var that=this;

    var tog=this.clicker(e);
    e.onclick=function(){
      that.toggle(tog);
      go(p);
    }

    this.value=function(){
      return this.isChecked(tog);
    }

    this.set=function(v){
      tog.textContent=v?this.TRUE:this.FALSE;
    }
  },

  Radio:function(e,p,go){
    this.e=e;

    var rad=[];
    for(var c=e.firstChild;c!=null;c=c.nextSibling){
      if('tspan'==c.nodeName){
	rad.push(c);
      }
    }

    var that=this;
    for(var i=0;i<rad.length;i++){
      rad[i].onclick=function(){
	if(that.isChecked(that.clicker(this))){
	  // do nothing if we check what is already checked
	  return;
	}

	for(var j=0;j<rad.length;j++){
	  var tog=that.clicker(rad[j]);
	  if(that.isChecked(tog)){
	    that.toggle(tog);
	  }else if(this==rad[j]){
	    that.toggle(tog);
	    go(p);
	  }
	}
      }
    }


    this.value=function(){
      for(var i=0;i<rad.length;i++){
	if(that.isChecked(that.clicker(rad[i]))){
	  return that.text(rad[i]);
	}
      }
    }

    this.set=function(nv){
      nv=nv.toLowerCase();
      for(var i=0;i<rad.length;i++){
	var ov=that.text(rad[i]).toLowerCase();
	that.clicker(rad[i]).textContent=(ov==nv)?that.TRUE:that.FALSE;
      }
    }

  },

  SelectMulti:function(e,p,go){
    this.e=e;
    var that=this;

    var grp=e.getElementsByClassName("all");
    for(var i=0;i<grp.length;i++){
      grp[i].onclick=function(){
	var set=that.isChecked(that.clicker(this))?
	  that.FALSE:that.TRUE;

	var all=this.parentNode.getElementsByTagName('tspan');
	for(var j=0;j<all.length;j++){
	  all[j].textContent=set;
	}
	go(p);
      }
    }

    var cb=e.getElementsByTagName('text');
    var v=[];
    for(var i=0;i<cb.length;i++){
      if(!d3.select(cb[i]).classed('all')){ // d3.js usage!!!
	v.push(cb[i]);
	cb[i].onclick=function(){
	  that.toggle(that.clicker(this));
	  go(p);
	}
      }
    }

    this.value=function(){
      var out=[];
      for(var i=0;i<v.length;i++){
	if(that.isChecked(that.clicker(v[i]))){
	  out.push(that.text(v[i]));
	}
      }
      return out;
    }

    this.set=function(l){
      var ll=l.toLowerCase().split('|');
      v.forEach(
	function(vv){
	  that.clicker(vv).textContent=(-1==ll.indexOf(that.text(vv).toLowerCase()))?
	    that.FALSE:that.TRUE;
	}
      )
    }

  },

  values:function(){
    var out={};
    this.forms.forEach(
      function(f){
	out[f.name()]=f.value();
      }
    )
    return out;
  },

  ours:function(e){
    var name=this.name+'-';
    return e.hasAttribute('id')&&
      (e.getAttribute('id').substring(name.length,0)==name)
  },

  seek:function(type,p,go){
    var e=document.getElementsByClassName('form'+type);
    for(var i=0;i<e.length;i++){
      if(this.ours(e[i])){
	this.forms.push(new this[type](e[i],p,go));
      }
    }
  },

  setDefaults:function(d){
    this.forms.forEach(
      function(f){
	var name=f.name();
	if(undefined!=d[name]){
	  f.set(d[name]);
	}
      }
    );

  }

}

BGV.form.prototype.Checkbox.prototype=
BGV.form.prototype.SelectMulti.prototype=
BGV.form.prototype.Radio.prototype={
  TRUE:'☒',
  FALSE:'☐',

  name:function(){
    return this.e.getAttribute('id').split('-')[1];
  },


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
  },

  clicker:function(e){
    return e.getElementsByTagName('tspan')[0];
  },

  text:function(e){
    var out='';
    for(var c=e.firstChild;c!=null;c=c.nextSibling){
      if('#text'==c.nodeName){
	out+=c.textContent;
      }
    }
    return out.trim();
  },

  set:function(){}
};

