var ClickableConstructor = function( args, auto=true ){
  let defaults = {
    wrapper: '.js-clickable-interaction',
    content: '.js-clickable-content-area',
    indicators: '.js-clickable-content-indicator',
    navigation: {
      targets: '.js-clickable-target',
      prev: '.js-clickable-prev',
      next: '.js-clickable-next',
    },
    meta: {
      clear: '.js-clickable-clear',
      start: '.js-clickable-start',
    },
    infinite: true,
    toggle: false
  };  
  this.constructed = new ClickableCautions( defaults );
  this.constructed = this.mergeArgs( this.constructed, args );
  this.constructed = this.setDefaults( this.constructed );
  if( auto ){
    this.constructed = this.init( this.constructed );
    this.constructed.total = this.constructed.contentAreas.length || 0;
  }
  return this.constructed;
};
ClickableConstructor.prototype = {
  mergeArgs: function mergeArgs( defaults, override ){
    var i = {};
    for( let attr in defaults ){
      i[ attr ] = defaults[ attr ];
    }
    for( let attr in override ){
      if( defaults[ attr ] !== undefined ){
        i[ attr ] = override[ attr ];
      }
    }
    return i;
  },
  setDefaults: function( constructed ){
    var i = constructed;
    i._index = 0;
    Object.defineProperty( i, 'index', {
      configurable: true,
      get: function(){
        return i._index;
      },
      set: function( val ){
        return i._index = val;
      }
    });
    Object.defineProperty( i, 'printIndex', {
      configurable: true,      
      get: function(){
        return this._index;
      }
    });       
    i._total = 0;
    Object.defineProperty( i, 'total', {
      configurable: true,      
      get: function(){
        return i._total;
      },
      set: function( val ){
        return i._total = val;
      }
    });    
    i.get = this.getDepth;    
    return i;    
  },
  init: function( constructed ){
    var i = constructed;
        i = this.setupWrapper( i );
        i = this.setupContent( i );
        i = this.setupNavigation( i );
        i = this.setupIndicators( i );
        i = this.setupMetaControls( i );
        i = this.setOnClicks( i );
        return i;
  },
  setupWrapper: function( i ){
    i.interaction = $( i.wrapper );
    return i;
  },
  setupContent: function( i ){
    i.contentAreas = this.findInInteraction( i, i.content );
    return i;
  },
  setupIndicators: function( i ){
    var contentCount, indicatorCount;
    i.indicators = this.findInInteraction( i, i.indicators );

    contentCount = i.contentAreas.length || 0;
    indicatorCount = i.indicators.length || 0;    

    if( contentCount + indicatorCount < 1){
      i.warnings.push('no content found');
    }
    i.warn();
    return i; 
  },
  setupNavigation: function( i ){
    var prevCount, nextCount, targetCount;
    i.navigation.targets= this.findInInteraction( i, i.navigation.targets );
    i.navigation.prev   = this.findInInteraction( i, i.navigation.prev );
    i.navigation.next   = this.findInInteraction( i, i.navigation.next );

    prevCount = i.navigation.prev.length || 0;
    nextCount = i.navigation.next.length || 0; 
    targetCount = i.navigation.targets.length || 0; 

    if( prevCount + nextCount + targetCount < 1 ){
      i.warnings.push('no navigation found');
    }
    i.warn();
    return i; 
  },
  setOnClicks: function( i ){
    for( var nav in i.navigation ) {
      if( i.navigation[ nav ] !== false ){
        i.navigation[ nav ].preclick = [];        
      }
    }
    return i;
  },
  setupMetaControls: function( i ){
    i.navigation.clear = this.findInInteraction( i, i.meta.clear );
    i.navigation.start = this.findInInteraction( i, i.meta.start );
    return i;
  },
  findInInteraction: function( i, selector ){
    if( $( i.interaction ).find( selector ).length > 0 ){
      return $( i.interaction ).find( selector );
    }
    return false;
  },
  getDepth: function getDepth( c, s ){
    var collection = this[ c ];    
    if( s !== undefined ){
      collection = collection[ s ];
    }
    return collection;
  },  
};