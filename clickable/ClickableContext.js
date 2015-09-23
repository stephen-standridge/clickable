var ClickableContext = function( constructed ){
  this.constructed = new ClickableCautions( constructed );
  this.constructed = this.init( this.constructed );
  if( this.constructed.context ){
    this.constructed = this.establishCollections( this.constructed);
    this.constructed = this.sortCollections( this.constructed );
    this.constructed = this.overrideDefaults( this.constructed );
  }

  return this.constructed;
};

ClickableContext.prototype = {
  init: function init( i ){
    i = this.setInitialData( i );
    i = this.setTotalData( i );
    i = this.setIndexData( i );
    return i;
  },
  overrideDefaults: function overrideDefaults( i ){
    Object.defineProperty( i, 'index', {
      get: function(){
        return this._index[ this.context ];
      },
      set: function( val ){
        return this._index[ this.context ] = val;
      }
    });
    Object.defineProperty( i, 'indexPrefix', {
      configurable: true,      
      get: function(){
        return this.context + '-';
      }
    }); 
    Object.defineProperty( i, 'total', {
      get: function(){
        return this._total[ this.context ];
      },
      set: function( val ){
        return this._total[ this.context ] = val;
      }
    });    
    i.get = this.getContextDepth;
    i.getIndex = this.getContextIndex;
    i.initBuffer.push( this.contextInit );
    return i;  
  },
  contextInit: function contextInit(){
    if( this._total.hasOwnProperty('context_default')){
      this.context = 'context_default';
      return;
    }
    for(var first in this._total){
      this.context = first;
      break;
    }
  },
  setInitialData: function setInitialdata( i ){
    i.context = false;
    return i;
  },
  findContextCount: function findContextCount( el ){
    var indices = {}, self = this;
    $( el ).each( function(){
      var c = $(this).data('context');
      indices = self.addToOrInit( indices, c );
    });
    return indices;
  },
  mergeForMax: function mergeForMax( obj1, obj2 ){
    var merged = obj1;
    for( var prop in obj2 ){
      if( merged[prop] === undefined || merged[prop] < obj2[prop]){
        merged[prop] = obj2[prop];
      }
    }
    return merged;
  },
  setTotalData: function setTotalData( i ){
    var contents = this.findContextCount( i.contentAreas );
    var indicators = this.findContextCount( i.indicators );
    var contexts = this.mergeForMax( contents, indicators );
    for( var context in contexts ){
      if( context !== 'context_default' ){
        i.context = true;
        i._total = contexts;
        return i;
      }
    }
    return i;
  },
  setIndexData: function setIndexData( i ){
    if( !i.context ){
      return i;
    }
    i._index = {};
    for( var context in i.total ){
      i._index[ context ] = 0;
    }
    return i;
  },
  addToOrInit: function addToOrInit( obj, prop ){
    var property = prop || 'default';
    var key = 'context_' + property;
    if( obj.hasOwnProperty( key ) ){
      obj[ key ] += 1;
      return obj;
    }
    obj[ key ] = 1;
    return obj;
  },
  establishCollections: function establishCollections( i ){
    for( let key in i._total ){
      i.contentAreas[key] = $();
      i.indicators[key] = $();
      i.navigation.targets[key] = $();
      i.navigation.prev[key] = $();    
      i.navigation.next[key] = $();      
    }
    return i;
  },
  sortCollections: function sortCollections( i ){
    i.contentAreas = this.contextSort( i, 'contentAreas' );  
    i.indicators = this.contextSort( i, 'indicators' );
    this.warnAboutContent( i );
    i.navigation.targets = this.contextSort( i, 'navigation', 'targets' );
    i.navigation.prev = this.contextSort( i, 'navigation', 'prev' );    
    i.navigation.next = this.contextSort( i, 'navigation', 'next' );
    i.navigation.preclick.push(this.parseContext);
    this.warnAboutNavigation( i );
    return i;
  },
  contextSort: function contextSort( i, collection, sub ){
    var all = i.get( collection, sub ),
        self = this, 
        onclick;

    $(all).filter( function(){

      return $(this);

    } ).each( function(){

      var c = self.setContextKey( $(this) );
      $(this).data('index', all[c].length);
      all[c] = $(all[c]).add( $(this) );   
    });

    return all;
  },
  warnAboutNavigation: function warnAboutNavigation( i ){
    for( var key in i._index ){
      if( i.navigation.targets[ key ].length < 1 && 
        i.navigation.prev[ key ].length < 1 &&
        i.navigation.next[ key ].length < 1 ){
        i.warnings.push(`there is no navgation for the context ${key}`);
      }
    }
    i.warn();
  },
  warnAboutContent: function warnAboutContent( i ){
    for( var key in i._index ){
      if( i.contentAreas[ key ].length < 1 && 
        i.indicators[ key ].length < 1 ){
        i.warnings.push(`there is no content for the context ${key}`);
      }
    }
    i.warn();
  },
  parseContext: function parseContext( el ){
    if( el !== undefined && $( el ).data('context') ){
      this.context = 'context_' + $( el ).data( 'context' );
      return;
    }
    this.context = 'context_default';
  },  
  getContextIndex: function getContextIndex( c, s, el){
    return $(el).data('index');
  },  
  getContextDepth: function getContextDepth( c, s ){

    var collection = this[ c ];

    if( s !== undefined ){
      collection = collection[ s ];
      if( collection === undefined ){
        return false;
      }
      if( this.context === true ){
        return collection;
      }      
    }
    if(collection[ this.context ] === undefined ){
      return collection;
    }
    return collection[ this.context ];    
  },

  setContextKey: function setContextKey( el ){
    var ctx = el.data( 'context' ) || 'default';
    return 'context_' + ctx;
  } 
};