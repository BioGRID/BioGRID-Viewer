BGV.QueryString=function(def){
  if(undefined===def){
    this.qs={};    
  }else{
    var fixed={};
    for(var k in def){
      if('object' === typeof(def[k])){
	fixed[k]=def[k];
      }else{
	fixed[k]=[def[k]];
      }
    
      var lambda=function(){};
      lambda.prototype=fixed;
      this.qs=new lambda();
    }
  }
}
    

BGV.QueryString.prototype={
  allowed:function(chk){
    //return (-1 != this.allow.indexOf(chk));
    return true;
  },

  addObject:function(add){
    for(var k in add){
      if(this.allowed(k)){
	this.qs[k]=add[k];
      }
    }
  },
  
  addSearch:function(add){
    add.split('&').forEach(
      function(attr){
	var kv=attr.split('=',2);
	if(this.allowed(kv[0])){
	  if(undefined===this.qs[kv[0]]){
            this.qs[kv[0]]=[kv[1]];
	  }else if(-1===this.qs[kv[0]].indexOf(kv[1])){
            this.qs[kv[0]].push(kv[1]);
	  }
	}
      },this);
  },
  
  toString:function(){
    var out=[];
    for(var attr in this.qs){
      this.qs[attr].forEach(function(val){
	out.push(attr + '=' + val);
      });
    }
    return out.join('&');
  },
  
  // REST uses pipes to delineate strings instead of repeating the attribute
  toRestUrl:function(url){
    var out=[];
    for(var attr in this.qs){
      out.push(attr + '=' + this.qs[attr].join('|'));
    }
    return url+'?'+out.join('&');
  }
}