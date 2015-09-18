'use strict';
var Clickable = function( args ){
	var constructed = {};
  constructed = new ClickableConstructor( args );
  constructed = new ClickableContext( constructed );
  constructed = new ClickableController( constructed ); 
  return constructed;
};
Clickable.prototype = {
  unpack: function( obj ){
    for( var attr in obj ){
    	if( obj.hasOwnProperty( attr ) ){
	    	this[ attr ] = obj[ attr ];
    	}
    }
  },
  extend: function( obj ){
    for( var attr in obj.__proto__ ){
      if( obj.__proto__.hasOwnProperty( attr ) ){
        this[ attr ] = obj.__proto__[ attr ];
      }
    }
  },  
  formatConstructed: function formatConstructed( constructed ){
    var i  = constructed || {};
        i.warnings = [];
        if( constructed === undefined){
          i.warnings.push('a context needs a valid clickable constructor to do anything');
          this.warn( i );
          return i; 
        }
        return i;
  },
  warn: function warn( i ){
    for( let j = 0; j< i.warnings.length; j++ ){
      console.warn( i.warnings[j] );
    }
  },  
}


// if( $('.js-history-interaction').length > 0 ){
//   new Clickable('.js-history-interaction');

// }
// if( $('.js-principles-interaction').length > 0 ){
//   var thing = new Clickable('.js-principles-interaction', true);
// }
