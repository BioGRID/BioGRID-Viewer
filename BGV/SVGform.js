BGV.form=function(prefix,go){
  this.prefix=prefix; // kinda like the form name
  this._v={};

  // look for radio buttons
  this.radio=[];
  var tags=document.getElementsByClassName('formRadio');
  for(var i=0;i<tags.length;i++){
    var rb=tags[i];
    if(this.ours(rb)){
      this.radio.push(rb);
      var name=this.name(rb);
      var radio=[];
      for(var n=rb.firstChild;n!=null;n=n.nextSibling){
	if('tspan'==n.nodeName){
	  radio.push(n);
	}
      }

      // get the textContent sans the ballot box
      var value=function(tag){
	var out='';
	for(var n=tag.firstChild;n!=null;n=n.nextSibling){
	  if('#text'==n.nodeName){
	    out+=n.textContent;
	  }
	}
	return out.trim();
      }

      for(var j=0;j<radio.length;j++){
	var b=radio[j].getElementsByTagName('tspan')[0];
	if(this.isChecked(b)){
	  this.set(rb,value(radio[j]));
	}
      }


      // make it clickable
      var that=this;
      for(var j=0;j<radio.length;j++){
	radio[j].onclick=function(){
	  if(that.isChecked(this.getElementsByTagName('tspan')[0])){
	    // if we are checked, do nothing
	    return;
	  }
	  for(var k=0;k<radio.length;k++){
	    var b=radio[k].getElementsByTagName('tspan')[0];
	    if(that.isChecked(b)){
	      that.toggle(b);
	    }else if(this==radio[k]){
	      that.toggle(b);
	      that.set(rb,value(radio[k]));
	      go(that);
	    }
	  }

	}//function
      }
    }
  }

  
  // look for check boxes
  this.checkbox=[];
  var tags=document.getElementsByClassName('formCheckbox');
  for(var i=0;i<tags.length;i++){
    var cb=tags[i];

    if(this.ours(cb)){
      this.checkbox.push(cb);
      var name=this.name(cb);
      var tog=cb.getElementsByTagName('tspan')[0];

      // record SVG says if set
      this.set(cb,this.isChecked(tog));

      // make it clickable
      var that=this;
      cb.onclick=function(){
	var tog=this.getElementsByTagName('tspan')[0];
	that.set(this,that.toggle(tog));
	go(that);
      }

    }
  }

}

BGV.form.prototype={
  _true:'☒',
  _false:'☐',
  _dil:'-', // delimiter


  // change the SVG to reflecta given values
  setForm:function(from){
    var that=this;

    this.checkbox.forEach(
      function(l){
	var name=that.name(l);
	if(undefined!=from[name]){
	  var b=l.getElementsByTagName('tspan')[0];
	  b.textContent=from[name]?that._true:that._false;
	  that.set(l,from[name]);
	}
      }
    );

    this.radio.forEach(
      function(r){

	var l2b={}; // label to button
	for(var i=r.firstChild;null!=i;i=i.nextSibling){
	  if('tspan'==i.nodeName){
	    var l=''; // label
	    var b;    // button
	    for(var j=i.firstChild;null!=j;j=j.nextSibling){
	      if('tspan'==j.nodeName){
		b=j; // hopefully there is only one
	      }else if('#text'==j.nodeName){
		l+=j.textContent;
	      }
	    }
	    l2b[l.trim().toLowerCase()]=b;
	  }
	}

	var name=that.name(r);
	if(undefined!=from[name]){
	  for(var l in l2b){
	    var b=l2b[l];
	    if(l==from[name]){
	      b.textContent=that._true;
	      that.set(r,l);
	    }else{
	      b.textContent=that._false;
	    }
	  }
	}

      }
    );



  },

  values:function(){
    return this._v;
  },

  // // //
  // tag in these functions means where class="form*"

  // Returns true if this is a tag we are worrying about
  ours:function(tag){
    var p=this.prefix+this._dil;
    return tag.hasAttribute('id')&&
      (tag.getAttribute('id').substring(p.length,0)==p)
  },

  name:function(tag){
    var p=this.prefix+this._dil;
    return tag.getAttribute('id').substring(p.length);
  },

  set:function(tag,value){
    this._v[this.name(tag)]=value;
  },

  // // //
  // The rest of the functions take the tspan with the Unicode ballot
  // box in it, not the ane wich class="form*"

  isChecked:function(tag){
    return tag.textContent==this._true;
  },

  // Toggle a box, and return the status it was toggled to
  toggle:function(tag){
    if(this.isChecked(tag)){
      tag.textContent=this._false;
      return false;
    }
    tag.textContent=this._true;
    return true;
  }

};