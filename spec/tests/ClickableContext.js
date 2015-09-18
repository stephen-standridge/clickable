/* jshint ignore:start */
'use strict';
describe('ClickableContext.js', function() {
	var contexts;
	var constructed;
	var depthFunc;
	beforeEach(function(){
  	constructed = {};
  	contexts = {};
  	fixture.cleanup();
	})
  afterEach(function(){
  	constructed = {};
  	contexts = {};
  	fixture.cleanup();
  }) 
  describe('#new ClickableContext', function(){
  	describe('with a constructed clickable', function(){
	  	describe('without any contexts specified', function(){
	  		it('should do nothing', function(){
			  	var clickable = fixture.load('html/linear.html');  			
			  	constructed = new ClickableConstructor();
			  	contexts = new ClickableContext( constructed );
			  	expect( contexts.total ).to.equal( 4 )
			  	expect( contexts.index ).to.equal( 0 )
			  	expect( contexts.printIndex ).to.equal( 0 )
			  	expect( contexts.contentAreas ).to.equal( constructed.contentAreas )
	  		})
	  	})
	  	describe('with contexts', function(){
	  		beforeEach(function(){
			  	var clickable = fixture.load('html/nested.html');  			
			  	constructed = new ClickableConstructor();
			  	depthFunc = ClickableContext.prototype.getContextDepth;
			  	contexts = new ClickableContext( constructed );	  			
	  		})
	  		it('should wrap the clickable with a multidimensional index and total', function(){
	  			let actualT = JSON.stringify(contexts._total);
	  			let expectedT = JSON.stringify({ context_default: 3, context_test: 3})
	  			let expectedI = JSON.stringify({ context_default: 0, context_test: 0})
	  			let actualI = JSON.stringify(contexts._index)
	  			expect( actualT ).to.equal( expectedT )
	  			expect( actualI ).to.equal( expectedI )
	  			expect( contexts.printIndex ).to.equal( 'context_default-0' )
	  			expect( contexts.context ).to.equal( 'context_default' )
	  		})
	  		it('should sort the clickable dom collections', function(){
	  			expect( contexts.contentAreas ).to.have.property('context_default')
	  			expect( contexts.contentAreas ).to.have.property('context_test')
	  		})
	  		it('should replace the #getDepth function', function(){
	  			expect( contexts.get ).to.equal(depthFunc)
	  		})
	  		it('should add a getData method to the preclick queue', function(){
	  			expect( contexts.navigation.targets.preclick[0] ).to.equal(ClickableContext.prototype.parseContext)
	  		})
	  	})
	  	describe('with partially-complete contexts', function(){
	  		beforeEach( function(){fixture.cleanup()} )
	  		it('should warn that there is nothing controlling the contexts', function(){
	  			fixture.cleanup()
			  	var clickable = fixture.load('html/nested-no-navigation.html');
			  	constructed = new ClickableConstructor();
			  	contexts = new ClickableContext( constructed );		
			  	expect( contexts.warnings[0] ).to.equal('there is no navgation for the context context_test' )
	  		}) 		
	  	});
  	})
  })
});
/* jshint ignore:end */