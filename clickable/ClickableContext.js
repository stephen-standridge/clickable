var ClickableContext = function( constructed ){
  this.constructed = new ClickableCautions( constructed );
  this.constructed = this.init( this.constructed );
  if( this.constructed.context ){
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
  sortCollections: function sortCollections( i ){
    i.contentAreas = this.contextSort( i, 'contentAreas' );  
    i.indicators = this.contextSort( i, 'indicators' );
    i.navigation.targets = this.contextSort( i, 'navigation', 'targets' );
    i.navigation.prev = this.contextSort( i, 'navigation', 'prev' );    
    i.navigation.next = this.contextSort( i, 'navigation', 'next' );
    this.warnAboutNavigation( i );
    return i;
  },
  contextSort: function contextSort( i, collection, sub ){
    var all = i.get( collection, sub ),
        self = this, 
        onclick;
    if( all ){ onclick = all.preclick; }

    $(all).filter( function(){

      return $(this);

    } ).each( function(){

      var c = self.setContextKey( $(this) );
      if( all[c] === undefined ){
        all[c] = $();
      }
      $(this).data('index', all[c].length);
      all[c] = $(all[c]).add( $(this) );
    });
    if( onclick ){ all.preclick = onclick;
                   all.preclick.push(self.parseContext ); }
    return all;
  },
  warnAboutNavigation: function warnAboutNavigation( i ){
    for( var key in i._index ){
      if( i.navigation.targets[ key ] === undefined && 
        i.navigation.prev[ key ] === undefined &&
        i.navigation.next[ key ] === undefined ){
        i.warnings.push(`there is no navgation for the context ${key}`);
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
    var collection = this[ c ][ this.context ];
    if( this[c][this.context] === undefined || this.context === true ){
      collection = this[c];
      if(collection === false){
        return;
      }
    }   
    if( s !== undefined ){
      collection = collection[ s ];
    }
    return collection;
  },
  setContextKey: function setContextKey( el ){
    var ctx = el.data( 'context' ) || 'default';
    return 'context_' + ctx;
  } 
};