d3.html('rest/pmid.cgi?selected=20093466',function(html){
  var datalist=document.getElementById('pmids');
  datalist.appendChild(html);
  document.getElementsByTagName('body')[0].removeAttribute('class');
});

d3.json('BGV/taxa.json',function(taxa){
  var geneTaxIdList=d3.select('[name=geneTaxIdList]');
  taxa.forEach(function(taxon){
    if(taxon.display){
      geneTaxIdList.append('option').attr('value',taxon.id)
	.attr('selected',function(){
	  // pick yeast
	  return taxon.id===4932?'selected':undefined;
	}).text(taxon.species);
    }
  });

});
	      


var toggleFieldset=function(){
  var disabled=!this.checked;
  var inputs=this.inputs;
  
  for(var j=0;j<inputs.length;j++){
    inputs[j].disabled=disabled;
  }
}

var togs=document.getElementsByClassName('toggle');
for(var i=0;i<togs.length;i++){
  var fieldset=togs[i];
  var toggle=fieldset.querySelector('legend input');
  var inputs=fieldset.querySelectorAll('[name]');
  
  toggle.inputs=inputs;
  toggle.onclick=toggleFieldset;
  toggleFieldset.call(toggle);  
}

