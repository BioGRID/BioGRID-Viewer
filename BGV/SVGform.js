BGV.form=function(prefix,defaults,go){
  this.prefix=prefix;
  this._v={};
  
  // look for radio buttons
  var radio=document.getElementsByClassName('formRadio');
  for(var i=0;i<radio.length;i++){
    var r=radio[i];
    if(this.ours(r)){
      var buttons=r.getElementsByTagName('tspan');
      var name=this.name(r);

      if(undefined==defaults[name]){
	// no defaults to set, just get the value
	for(var j=0;j<buttons.length;j++){
	  var b=buttons[j];
	  // for now just assume the frist character is the toggle
	  if(this.isChecked(b)){
	    this.set(r,b.textContent.trim().substring(1));
	  }
	}
      }else{
	// we have a default to set!
	var def=defaults[name].trim().toLowerCase();

	for(var j=0;j<buttons.length;j++){
	  var b=buttons[j];
	  var t=b.textContent.trim().substring(1);
	  if(t.toLowerCase()==def){
	    b.textContent=this._true+t;
	  }else{
	    b.textContent=this._false+t;
	  }
	}
      }
    }
  }
  
  // look for check boxes
  var checkbox=document.getElementsByClassName('formCheckbox');
  for(var i=0;i<checkbox.length;i++){
    var c=checkbox[i];

    if(this.ours(c)){
      var name=this.name(c);
      if(undefined==defaults[name]){
	this.set(c,this.isChecked(c));
      }else{
	var v=c.textContent.trim().substring(1);
	if(defaults[name]){
	  c.textContent=this._true+v;
	}else{
	  c.textContent=this._false+v;
	}
      }

      // make it clickable
      var that=this;
      c.onclick=function(){
	that.set(this,that.toggle(this));
	go(that);
      }

    }
  }

}

BGV.form.prototype={
  _true:'☒',
  _false:'☐',
  _dil:'-', // delimiter

  isChecked:function(tag){
    // for now just assume the first character is a checkbox 
    return tag.textContent.trim()[0]==this._true;
  },

  // Toggle a box, and return the status it was goggled to
  toggle:function(tag){
    var txt=tag.textContent.trim().substring(1);
    if(this.isChecked(tag)){
      tag.textContent=this._false+txt;
      return false;
    }
    tag.textContent=this._true+txt;
    return true;
  },

  name:function(tag){
    var p=this.prefix+this._dil;
    return tag.getAttribute('id').trim().substring(p.length);
  },

  set:function(tag,value){
    this._v[this.name(tag)]=value;
  },

  // Returns true if this is a tag we are worrying about
  ours:function(tag){
    var p=this.prefix+this._dil;
    if(tag.hasAttribute('id')&&
       (tag.getAttribute('id').substring(p.length,0)==p)){
      return true;
    }
    return false;
  },

  
  values:function(){
    return this._v;
  }

};