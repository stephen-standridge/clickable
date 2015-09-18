var ClickableCautions = function( constructed ){
	var i = this.formatConstructed( constructed );
			i.warn = this.warn.bind( i );
			i.warn();
	return i;
}
ClickableCautions.prototype = {
  formatConstructed: function formatConstructed( constructed ){
    var i  = constructed || {};
        i.warnings = i.warnings || [];
        if( constructed === undefined){
          i.warnings.push('needs a valid clickable constructor to do anything');
          this.warn.call( i );
          return i; 
        }
        return i;
  },  
  warn: function warn(){
    for( let j = 0; j< this.warnings.length; j++ ){
      console.warn( this.warnings[j] );
    }
  }
}