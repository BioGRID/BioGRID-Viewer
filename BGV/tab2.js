BGV.constructors.tab2=function(){
  this.insertParent = this.insert;
  var that=this;

  this.tab2edge=function(row){
    this.column=row.split("\t");
  };
  this.tab2edge.prototype={
    id:function(){
      return this.column[23] + this.column[0];
    },

    // return interactors sorted (for undirected graphs)
    unorderedInteractors:function(){
      return [this.interactor(0),this.interactor(1)].sort();
    },
    
    // when i is the argument 0==A 1==B

    interactor:function(i){
      return this.column[7+i];
    },

    taxaID:function(i){
      return this.column[15+i];
    },

    // Returns species color.
    color:function(i,ifNoColor){
      return BGV.taxa.get(this.taxaID(i)).color(ifNoColor);
    },

    styleAttr:function(i){
      var color=this.color(i);
      if(null==color){
	return '';
      }else{
	return ' style="background-color:' + color + '"';
      }
    }
  };

  this.parse=function(tsv){
    var lines=tsv.trim().split("\n");
    var count=0;
    while(lines.length>0){
      var line = lines.shift();
      var edge = new that.tab2edge(line);

      if(edge.column.length>=24){
	count++;
	BGV.edges[edge.id()]=edge;
      }else{
	console.log("Skipping: '" + line + "'");
      }
    }
    BGV.edgesUpdated(count);
    $("body").css("cursor", "auto");
  };

  this.storeURL=function(url){
    $("form[name=fetch_url] [type=url]").val(url);
  };

  this.fetchURL=function(e){
    e.preventDefault();

    var url = $(e.currentTarget).find("input[type=url]").val().trim();
    if (url.length > 0){
      $("body").css("cursor", "wait");
      $.get(url,that.parse);
    }

  };

  this.insert=function(d){
    that.insertParent(
      d,function(){
	$.getScript(
	  "form2URL.js",function(){
	    new form2URL($("form[name=rest]"),that.storeURL);
	    $("form[name=rest] [name=taxId]").html(BGV.taxa.optionTags(4932));
	    $("form[name=fetch_url]").bind("submit",that.fetchURL);
	    $("input.gen").bind(
	      "click",function(){
		$("form[name=rest] [name=taxId]").trigger("submit");
		$("form[name=fetch_url]").trigger("submit");
	      }
	    );
	  }
	);
      }
    );
  };

};
BGV.constructors.tab2.prototype=BGV.prototypes.data;
BGV.plugins.data.tab2=new BGV.constructors.tab2();

