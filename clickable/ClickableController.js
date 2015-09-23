var ClickableController = function( constructor ){
    this.constructed = new ClickableCautions( constructor );
    this.extend.call( this.constructed, this )  ;
    this.constructed.init( this.constructed );
    return this.constructed;  
};
ClickableController.prototype = {
  extend: function( obj ){
    for( var attr in obj ){
      if( obj.hasOwnProperty( attr ) === false ){
        this[ attr ] = obj[ attr ];
      }
    }
  }, 
  init: function(){
    this.navigation.type = 'initial';
    this.setupEvents( );
    this.startScreen( );
    return this;
  },
  startScreen: function( ){
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
    console.log('hello')        
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
    $( this.get('navigation', 'prev') ).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs( 'prev', $(this) );
      self.prev();
      self.setNavigationType( 'linear' );
    });
    $(this.get('navigation', 'next')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs( 'next', $(this) );     
      self.next();
      self.setNavigationType( 'linear' );
    });
    $(this.get('navigation', 'clear')).click(function (e) {
      e.preventDefault();      
      self.callPreclickFuncs( 'clear', $(this) );
      self.reset();
    });
    $(this.get('navigation', 'start')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs( 'start', $(this) );
      self.goTo(0);
      self.setNavigationType( 'linear' );
    });
    $( this.get('navigation', 'targets') ).click(function(e){
        e.preventDefault();
        self.callPreclickFuncs( 'targets', $(this) );
        self.goTo( self.getIndex('navigation', 'targets', this) );
        self.setNavigationType( 'targetted');
    });
    return i;
  },
  callPreclickFuncs: function callPreclickFuncs( navType, el ){
    var buffer = this.get('navigation', navType ).preclick;
    for(let func in buffer ){
      buffer[func].call( this, el );
    }  
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
        indicators = this.get( 'indicators' ),
        count1 = areas.length || 0,
        count2 = indicators.length || 0;

    if( !this.isToggle || areas.active !== index ){
      this.addInteractionActiveClass();      
      if( areas.length > 0 ) { 
        this.addClassSVG( areas[ index ], 'active' );
        this.addClassSVG( areas[ index ], 'js-active' );
        areas.active = index ;        
      }
      if( indicators.length > 0 ){ 
        this.removeClassSVG( indicators[ index ], 'visited' );
        this.removeClassSVG( indicators[ index ], 'js-visited' );
        this.addClassSVG( indicators[ index ], 'active' );
        this.addClassSVG( indicators[ index ], 'js-active' );
      }
      if( count1 + count2 < 1 ){
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
      this.removeClassSVG( areas, 'js-active' );
    }
    if( indicators.length ){
      this.makeIndicatorVisited();   
      this.removeClassSVG( indicators, 'active' );
      this.removeClassSVG( indicators, 'js-active' );
    }
    this.removeInteractionActiveClass();
  },
  addInteractionActiveClass: function(){
    this.addClassSVG( this.interaction, 'active-' + this.indexPrefix + this.index );
  },
  removeInteractionActiveClass: function(){
    for(var i = 0; i< this.total; i++){
      this.removeClassSVG(this.interaction, 'active-'+ this.indexPrefix + i );
    }
  },
  makeIndicatorVisited: function(){
    var self = this;
    $( this.get( 'indicators' ) ).each(function(){
      if($(this).attr('class').indexOf('js-active') > 0 ) {
        self.addClassSVG(this, 'visited');
        self.addClassSVG(this, 'js-visited');
      }
    });
  },
  addClassSVG: function(elem, newClass){
    if( elem == undefined ){
      return;
    }      
    if(elem.length > 0){
      this.addMultipleClasses(elem, newClass);
    } else {
      this.addSingularClass(elem, newClass);
    }
  },
  addSingularClass: function(elem, newClass){
    if( elem === undefined ){ return; }    
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
    if( elem == undefined ){
      return;
    }    
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