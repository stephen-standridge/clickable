/* jshint ignore:start */
'use strict';
describe('ClickableConstructor.js', function() {
	var constructor;
  afterEach(function(){
  	constructor = {};
  	fixture.cleanup();
  }) 
  describe('#new ClickableConstructor', function(){
	  describe('with no arguments', function() {
	  	it('should return a constructor with default values', function(){
		  	var args = fixture.load('json/arguments.json');
		  	constructor = new ClickableConstructor()
		  	expect(constructor.wrapper).to.equal(args.defaults.wrapper)
	  	})
	  	it('should set default values', function(){
	  		constructor = new ClickableConstructor()
	  		expect( constructor.index ).to.equal( 0 );
	  		expect( constructor.total ).to.equal( 0 );
	  		expect( constructor.indexPrefix ).to.equal( '' );
	  		expect( constructor.hasOwnProperty('get') ).to.equal(true)
	  	})
	  	it('should add an onclick queue to the clickable elements', function(){
	  		var dom = fixture.load('html/linear.html');
	  		constructor = new ClickableConstructor()
	  		expect( JSON.stringify(constructor.navigation.prev.preclick ) ).to.equal(JSON.stringify([]) )
	  	})
	  	it('should add an initBuffer', function(){
	  		var dom = fixture.load('html/linear.html');
	  		constructor = new ClickableConstructor()
	  		expect( JSON.stringify(constructor.initBuffer) ).to.equal(JSON.stringify([]))	  		
	  	})
	  });
 	  describe('with any arguments', function() {
	  	it('should override the defaults only for that argument', function(){
		  	var args = fixture.load('json/arguments.json');
		  	constructor = new ClickableConstructor( args.contentWrapper, false )
		  	expect(constructor.wrapper).to.equal('.test-interaction')
		  	expect(constructor.indicators).to.equal(args.defaults.indicators)
	  	})
	  });  	
  })
  describe('#init', function(){
  	it('should replace the constructor values with dom elements', function(){
  		var dom = fixture.load('html/linear.html');
  		constructor = new ClickableConstructor();
  		expect(constructor.navigation.prev[0]).to.equal($('.js-clickable-prev')[0])
  	})
		describe('without content areas', function(){
			it('should warn that it needs content', function(){
	  		var dom = fixture.load('html/linear-no-content.html');
	  		constructor = new ClickableConstructor();				
				expect(constructor.warnings[0]).to.equal('no content found')
			})
		})
		describe('without navigation', function(){
			it('should warn that it needs navigation', function(){
	  		var dom = fixture.load('html/linear-no-nav.html');
	  		constructor = new ClickableConstructor();						
				expect(constructor.warnings[0]).to.equal('no navigation found')
			})
		})  	
  })
});
/* jshint ignore:end */