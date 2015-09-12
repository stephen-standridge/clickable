'use strict';
var Clickable = function(wrapper, isToggle, content, indicators, navigation, controls, infinite){
  this.index = { default: 0 };
  this.total = { default: 0 };
  this.infinite = infinite || true;
  this.navigation = { type: 'start' };
  this.isToggle = isToggle || false;  
  this.setupDom({
    wrapper:wrapper,
    content:content,
    navigation:navigation,
    indicators:indicators,
    controls:controls
  });
  this.setupEvents();
  this.sortAll();
  this.initDomains();
  // this.startScreen();
};
Clickable.prototype = {
  setupDom: function( args ){
    this.setupWrapper( args.wrapper );
    this.setupContent( args.content );
    this.setupNavigation( args.navigation );
    this.setupIndicators( args.indicators );
    this.setupControls( args.controls );
  },
  setupWrapper: function(selector = false ){
    if( selector ){
      this.wrapperName = selector.split( '.js-' )[ 1 ];      
    }
    this.interaction = $( selector ).length > 0 ? $( selector ) : $( '.js-interaction' );
  },
  setupContent: function(selector){
    this.contentAreas = this.findInInteraction( selector, '.js-content-area' );
    this.findDomains( this.contentAreas );
    this.totalDomains( this.contentAreas );
  },
  setupIndicators: function(selector){
    this.contentIndicators = this.findInInteraction( selector, '.js-content-indicator' );
  },
  setupNavigation: function( selectorObject ){
    var selectors = selectorObject === undefined ? {} : selectorObject;
    this.navigation.targets= this.findInInteraction( selectors.target, '.js-target' );
    this.navigation.prev   = this.findInInteraction( selectors.prev, '.js-prev' );
    this.navigation.next   = this.findInInteraction( selectors.next, '.js-next' );
  },
  setupControls: function( selectorObject ){
    var selectors = selectorObject === undefined ? {} : selectorObject;
    this.navigation.clear = this.findInInteraction( selectors.clear, '.js-back') ;
    this.navigation.start = this.findInInteraction( selectors.start, '.js-start' );
  },
  sortAll: function(){
    this.sortCollection( 'contentAreas' );  
    this.sortCollection( 'contentIndicators' );
    this.sortMultidimensionalCollection( 'navigation', 'targets' );
    this.sortMultidimensionalCollection( 'navigation', 'prev' );    
    this.sortMultidimensionalCollection( 'navigation', 'next' );
  },
  sortCollection: function( collection ){
    var self = this;
    $( self[ collection ] ).filter(function(){
      self[ collection ] = $(self[ collection ]).not( $(this) );        
      return $(this);          
    }).each( function(){
      var d = $(this).data('domain') ? 'domain' + $(this).data('domain') : 'default';
      if( self[ collection ][ d ] === undefined ){
        self[ collection ][ d ] = $();
      }
      self[ collection ][ d ] = $(self[ collection ][ d ]).add( $(this) );
    });
  },
  sortMultidimensionalCollection: function( name, collection ){
    var self = this;
    $( self[ name ][ collection ] ).filter(function(){
      self[ name ][ collection ] = $(self[ name ][ collection ]).not( $(this) );        
      return $(this);          
    }).each( function(){
      var d = $(this).data('domain') ? 'domain' + $(this).data('domain') : 'default';
      if( self[ name ][ collection ][ d ] === undefined ){
        self[ name ][ collection ][ d ] = $();
      }
      self[ name ][ collection ][ d ] = $(self[ name ][ collection ][ d ]).add( $(this) );
    });
  },  
  setupEvents: function(){
    var self = this;
    $( this.navigation.prev ).click(function( e ){
      e.preventDefault();
      self.parseDomain( $( this ) );
      self.prev();
      self.setNavigationType('linear');
    });
    $( this.navigation.next ).click(function( e ){
      e.preventDefault();
      self.parseDomain( $( this ) );
      self.next();
      self.setNavigationType('linear');
    });
    $( this.navigation.clear ).click(function( e ){
      e.preventDefault();
      self.parseDomain( $( this ) );
      self.reset();
      self.setNavigationType('start');
    });
    $( this.navigation.start ).click(function( e ){
      e.preventDefault();      
      self.parseDomain( $( this ) );
      self.goTo( 0 );
      self.setNavigationType('linear');
    });
    $( this.navigation.targets ).click(function( e ){
      e.preventDefault();   
      self.parseDomain( $( this ) );
      var dom = self.domain ? 'domain'+self.domain : 'default';
      self.goTo( self.navigation.targets[ dom ].index( this ) );
      self.setNavigationType( 'targetted' );
    });
  },
  findInInteraction: function(selector, fallback){
    if(selector !== undefined){
      return $(this.interaction).find(selector);
    }
    if($(this.interaction).find(fallback).length > 0){
      return $(this.interaction).find(fallback);
    }
    return false;
  },
  startScreen: function(){
    if( this.navigation.start ){
      return;
    }
    this.goTo( 0 );
  },
  goTo: function( index ){
    if( this.domain ){
      this.index[ this.domain ] = index;
    } else {
      this.index[ 'default' ] = index;      
    }
    this.makeAllInactive();
    this.makeActive();
  },
  prev: function(){
    this.decrementIndex();
    this.makeAllInactive();
    this.makeActive();
  },
  next: function(){
    this.incrementIndex();    
    this.makeAllInactive();
    this.makeActive();
  },
  reset: function(){
    this.makeAllInactive();
    this.clearNavigationType();
  },
  decrementIndex: function(){
    var key = 'default';
    if( this.domain ){
      key = this.domain;
    }
    if(this.index[ key ]  > 0){
      this.index[ key ]  --;
    }else if(this.infinite){
      this.index[ key ]  = this.total[ key ] -1;
    }
  },
  incrementIndex: function(){
    var key = 'default';
    if( this.domain ){
      key = this.domain;
    }
    if(this.index[ key ]  < this.total[ key ] -1){
      this.index[ key ]  ++;      
    } else if(this.infinite) {
      this.index[ key ]  = 0;
    }
  },
  parseDomain: function( el ){
    if( el !== undefined ){
      this.domain = $( el ).data( 'domain' ) ? $( el ).data( 'domain' ) : false;
      return;
    }
    this.domain = false;
  },
  findDomains: function( el ){
    var self = this;
    $( el ).each(function(){
      var d = $(this).data('domain');
      if( d ){
        self.index[ d ] = 0;
      }
    }); 
  },
  totalDomains: function( el ){
    var self = this;
    $( el ).each(function(){
      var d = $(this).data('domain');
      if( d ){
        self.total[ d ] =  self.total[ d ] === undefined ? 0 : self.total[ d ];
        self.total[ d ] += 1;
      } else {
        self.total.default += 1;
      }
    });
  },
  initDomains: function(){
    this.domain = false;
  },
  makeActive: function(){
    var key = this.domain ? 'domain'+ this.domain : 'default';
    var index = this.domain ? this.index[this.domain] : this.index['default'];
    if( !this.isToggle || this.contentAreas[ key ].active !== index ){
      this.addClassSVG( this.contentAreas[ key ][ index ], 'active' );
      this.removeClassSVG( this.contentIndicators[ key ][ index ], 'visited' );
      this.addClassSVG( this.contentIndicators[ key ][ index ], 'active' );

      this.addInteractionActiveClass();
      this.contentAreas[ key ].active = index ;
      return
    }
    this.contentAreas[ key ].active = false;
  },
  makeAllInactive: function(){
    var key = this.domain ? 'domain' + this.domain : 'default';
    this.makeIndicatorVisited();
    this.removeClassSVG( this.contentAreas[ key ], 'active' );
    this.removeClassSVG( this.contentIndicators[ key ], 'active' );
    this.removeInteractionActiveClass();
    this.contentAreas.active = undefined;
  },
  addInteractionActiveClass: function(){
    var d = this.domain ? this.domain : 'default';
    this.addClassSVG( this.interaction, 'active-'+d+'-'+this.index[ d ] );
  },
  removeInteractionActiveClass: function(){
    var d = this.domain ? this.domain : 'default';
    for(var i = 0; i< this.total[d]; i++){
      this.removeClassSVG(this.interaction, 'active-'+d+'-'+i);
    }
  },
  makeIndicatorVisited: function(){
    var self = this;
    $(this.contentIndicators).filter(function(){
      if( self.domain ){
        if( $( this ).data( 'domain' ) === self.domain ){
          return $( this );
        }
      } else {
        if( !$(this).data('domain') ){
          return $(this);          
        }
      }
    }).each(function(){
      if($(this).attr('class').indexOf('active') > 0 ) {
        self.addClassSVG(this, 'visited');
      }
    });
  },
  activateInDomain: function( cache, klass ){
    var self = this;
    $( cache ).filter( function(){
      if( self.domain ){
        if( $(this).data('domain') === self.domain ){
          return $( this );
        }
      } else {
        if( !$(this).data('domain') ){
          return $(this);          
        }
      }
    } ).each(function(){
      self.addClassSVG( $(this), klass );
    });
  },
  deactivateInDomain: function( cache, klass ){
    var self = this;
    $( cache ).filter( function(){
      if( self.domain ){
        if( $(this).data('domain') === self.domain ){
          return $( this );
        }
      } else {
        if( !$(this).data('domain') ){        
          return $(this);
        }
      }
    } ).each(function(){
      self.removeClassSVG( $(this), klass );
    });
  },
  setNavigationType: function(type){
    this.clearNavigationType();
    this.navigation.type = type;
    this.addClassSVG(this.interaction, this.navigation.type);
    if(type !== 'start'){
      this.addClassSVG(this.interaction, 'navigated');
    }

  },
  clearNavigationType: function(){
    this.removeClassSVG(this.interaction, this.navigation.type);
    this.removeClassSVG(this.interaction, 'navigated');
  },
  addClassSVG: function(elem, newClass){
    if(elem.length > 0){
      this.addMultipleClasses(elem, newClass);
    } else {
      this.addSingularClass(elem, newClass);
    }
  },
  addSingularClass: function(elem, newClass){
    var tempClass = $(elem).attr('class');
    $(elem).attr('class', tempClass + ' ' +newClass);
  },
  addMultipleClasses: function(elems, newClass){
    var tempClass;
    for(var i = 0; i< elems.length; i++){
      tempClass = $(elems[i]).attr('class');
      $(elems[i]).attr('class', tempClass + ' ' +newClass);
    }
  },
  removeClassSVG: function(elem, removedClass){
    if(elem.length > 0){
      this.removeMultipleClasses(elem, removedClass);
    } else {
      this.removeSingularClass(elem, removedClass);
    }
  },
  removeSingularClass: function(elem, removedClass){
    var tempClass = $(elem).attr('class');
    var newClass  = tempClass.replace(' '+removedClass, '');
    $(elem).attr('class', newClass);
  },
  removeMultipleClasses: function(elems, removedClass){
    var tempClass, newClass;
    for(var i = 0; i< elems.length; i++){
      tempClass = $(elems[i]).attr('class');
      newClass  = tempClass.replace(' '+removedClass, '');
      $(elems[i]).attr('class', newClass);
    }
  },
};

if( $('.js-history-interaction').length > 0 ){
  new Clickable('.js-history-interaction');

}
if( $('.js-principles-interaction').length > 0 ){
  var thing = new Clickable('.js-principles-interaction', true);
}
