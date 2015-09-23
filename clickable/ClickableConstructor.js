var ClickableConstructor = function( args, auto=true ){
  let defaults = {
    wrapper: '.js-clickable-interaction',
    content: '.js-clickable-content-area',
    indicators: '.js-clickable-indicator',
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
    Object.defineProperty( i, 'indexPrefix', {
      configurable: true,      
      get: function(){
        return '';
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
    i.getIndex = this.getIndex;
    i.initBuffer = [];  
    return i;    
  },
  init: function( constructed ){
    var i = constructed;
        i = this.setupWrapper( i );
        i = this.setupContent( i );
        i = this.setupNavigation( i );
        i = this.setupIndicators( i );
        i = this.setupMetaControls( i );
        return i;
  },
  setupWrapper: function( i ){
    i.interaction = $( i.wrapper );
    var interactionCount = i.interaction.length || 0;
    if( interactionCount < 1 ){
      i.warnings.push('no interaciton found')
    }
    if( interactionCount > 1 ){
      i.warnings.push('multiple interactions found')
    }
    i.warn();    
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
    i.navigation.preclick = [];
    prevCount = i.navigation.prev.length || 0;
    nextCount = i.navigation.next.length || 0; 
    targetCount = i.navigation.targets.length || 0; 

    if( prevCount + nextCount + targetCount < 1 ){
      i.warnings.push('no navigation found');
    }
    i.warn();
    return i; 
  },
  getIndex: function getIndex( c, s, el){
    return this.get(c, s).index(el);
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