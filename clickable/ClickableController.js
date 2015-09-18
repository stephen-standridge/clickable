'use strict';

var ClickableController = function( constructor ){
    this.constructed = new ClickableCautions( constructor );
    this.extend.call( this.constructed, this )  
    this.constructed.init( this.constructed );
    return this.constructed;  
};
ClickableController.prototype = {
  extend: function( obj ){
    for( var attr in obj.__proto__ ){
      if( obj.__proto__.hasOwnProperty( attr ) ){
        this[ attr ] = obj.__proto__[ attr ];
      }
    }
  }, 
  init: function(){
    this.navigation.type = 'initial';
    this.setupEvents(  );
    this.startScreen(  );
    return this;
  },
  startScreen: function(  ){
    if( this.navigation.start ){
      return;
    }
    this.goTo( 0 );
    return this;
  },
  goTo: function( index ){
    this.index = index;      
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

    if(this.index  > 0){
      this.index  --;
    }else if(this.infinite){
      this.index  = this.total -1;
    }
  },
  incrementIndex: function(){
    if(this.index  < this.total -1){
      this.index  ++;      
    } else if(this.infinite) {
      this.index  = 0;
    }
  },
  setupEvents: function setupEvents(i) {
    var self = this;
    $(this.get('navigation', 'prev')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'prev').preclick;
      for(let func in buffer ){
        buffer[func]()
      }
      self.prev();
      self.setNavigationType( 'linear' );
    });
    $(this.get('navigation', 'next')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'next').preclick;
      for(let func in buffer ){
        buffer[func]()
      }      
      self.next();
      self.setNavigationType( 'linear' );
    });
    $(this.get('navigation', 'clear')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'clear').preclick;
      for(let func in buffer ){
        buffer[func]()
      }      
      self.reset();
      self.setNavigationType( 'initial' );
    });
    $(this.get('navigation', 'start')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'start').preclick;
      for(let func in buffer ){
        buffer[func]()
      }
      self.goTo( 0);
      self.setNavigationType( 'linear' );
    });
    $(this.get('navigation', 'targets')).click(function (e) {      
      e.preventDefault();
      var buffer = self.get('navigation', 'targets').preclick;
      for(let func in buffer ){
        buffer[func]()
      }      
      self.goTo( self.get('navigation', 'targets').index(this) );
      self.setNavigationType( 'targetted');
    });
    return i;
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
  makeActive: function(){
    var index = this.index,
        areas = this.get( 'contentAreas' ),
        indicators = this.get( 'indicators' );

    if( !this.isToggle || areas.active !== index ){
      this.addInteractionActiveClass();      
      if( areas.length > 0 ) { 
        this.addClassSVG( areas[ index ], 'active' );
        areas.active = index ;        
      }
      if( indicators.length > 0 ){ 
        this.removeClassSVG( indicators[ index ], 'visited' );
        this.addClassSVG( indicators[ index ], 'active' );
      }
      if( !(areas.length + indicators.length > 0) ){
        this.warnings.push('no content to activate');
        this.warn();
      }
      return;
    }
    areas.active = false;
  },
  makeAllInactive: function(){
    var areas = this.get( 'contentAreas' ),
        indicators = this.get( 'indicators' );
    if( areas.length ){
      this.removeClassSVG( areas, 'active' );
    }
    if( indicators.length ){
      this.makeIndicatorVisited();   
      this.removeClassSVG( indicators, 'active' );
    }
    this.removeInteractionActiveClass();
  },
  addInteractionActiveClass: function(){
    this.addClassSVG( this.interaction, 'active-' + this.printIndex );
  },
  removeInteractionActiveClass: function(){
    for(var i = 0; i< this.total; i++){
      this.removeClassSVG(this.interaction, 'active-'+ this.printIndex );
    }
  },
  makeIndicatorVisited: function(){
    var self = this;
    $( this.get( 'indicators' ) ).each(function(){
      if($(this).attr('class').indexOf('active') > 0 ) {
        self.addClassSVG(this, 'visited');
      }
    });
  },
  addClassSVG: function(elem, newClass){
    if(elem.length > 0){
      this.addMultipleClasses(elem, newClass);
    } else {
      this.addSingularClass(elem, newClass);
    }
  },
  addSingularClass: function(elem, newClass){
    if( elem === undefined ){ return }    
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