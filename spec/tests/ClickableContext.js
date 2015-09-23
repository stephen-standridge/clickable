/* jshint ignore:start */
'use strict';
describe('ClickableContext.js', function() {
	var contexts, constructed, depthFunc, initFunc;
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
			  	expect( contexts.indexPrefix ).to.equal( '' )
			  	expect( contexts.contentAreas ).to.equal( constructed.contentAreas )
	  		})
	  	})
	  	describe('with contexts', function(){
	  		beforeEach(function(){
			  	var clickable = fixture.load('html/nested.html');  			
			  	constructed = new ClickableConstructor();
			  	depthFunc = ClickableContext.prototype.getContextDepth;
			  	initFunc = ClickableContext.prototype.contextInit;
			  	contexts = new ClickableContext( constructed );			
	  		})
	  		it('should wrap the clickable with a multidimensional index and total', function(){
	  			let actualT = JSON.stringify(contexts._total);
	  			let expectedT = JSON.stringify({ context_default: 4, context_test: 4})
	  			let expectedI = JSON.stringify({ context_default: 0, context_test: 0})
	  			let actualI = JSON.stringify(contexts._index)
	  			expect( actualT ).to.equal( expectedT )
	  			expect( actualI ).to.equal( expectedI )
	  			expect( contexts.indexPrefix ).to.equal( contexts.context+'-' )
	  			expect( contexts.context ).to.equal( true )
	  		})
	  		it('should sort the clickable dom collections', function(){
	  			expect( contexts.contentAreas ).to.have.property('context_default')
	  			expect( contexts.contentAreas ).to.have.property('context_test')
	  		})
	  		it('should replace the #getDepth function', function(){
	  			expect( contexts.get ).to.equal(depthFunc)
	  		})
	  		it('should add a getData method to the preclick queue', function(){
	  			expect( contexts.navigation.preclick[0] ).to.equal(ClickableContext.prototype.parseContext)
	  		})
	  		it('should add contextInit to the initBuffer', function(){
	  			expect( contexts.initBuffer[0] ).to.equal( initFunc )
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
	describe('after initialization', function(){

		describe('#contextInit', function(){
			it('should change the context to context_default', function(){
		  	var clickable = fixture.load('html/nested.html');  			
		  	constructed = new ClickableConstructor();
		  	contexts = new ClickableContext( constructed );					
				expect(contexts.context).to.equal(true);
				contexts.initBuffer[0].call( contexts );
				expect(contexts.context).to.equal('context_default')
			})
		})		
		describe('with one context', function(){
			describe('and only one context', function(){
				it('should create a navigational context for only that context', function(){
					var clickable = fixture.load('html/context-solo.html');
							contexts = new Clickable()
					expect(JSON.stringify(contexts._index)).to.equal(JSON.stringify({'context_test' : 0}))
					expect(JSON.stringify(contexts._total)).to.equal(JSON.stringify({'context_test' : 4}))
					expect(contexts.context).to.equal('context_test')				
				})
			})
			describe('with elements outside of the context', function(){
				beforeEach(function(){
					var clickable = fixture.load('html/context-solo-outside.html');
							contexts = new Clickable()
				})
				it('should create a default context and a specified context', function(){
					expect(JSON.stringify(contexts._index)).to.equal(JSON.stringify({'context_test' : 0, context_default: 0}))
					expect(JSON.stringify(contexts._total)).to.equal(JSON.stringify({'context_test' : 2, context_default: 2}))
				})
				it('should start with the default context active', function(){
					expect(contexts.context).to.equal('context_default')		
				})
			})
		})
		describe('with multiple contexts', function(){
			it('should create a context for all specified', function(){
					var clickable = fixture.load('html/context-duo.html');
							contexts = new Clickable()
					expect(JSON.stringify(contexts._index)).to.equal(JSON.stringify({'context_test' : 0, context_testing: 0}))
					expect(JSON.stringify(contexts._total)).to.equal(JSON.stringify({'context_test' : 2, context_testing: 2}))							
			})
			it('should start with the first context on the page active', function(){
					var clickable = fixture.load('html/context-duo.html');
							contexts = new Clickable()
					expect(contexts.context).to.equal('context_test')							
			})
			describe('with elements outside a context', function(){
				beforeEach(function(){
					var clickable = fixture.load('html/context-duo-outside.html');
							contexts = new Clickable()
				})
				it('should create a default context', function(){
					expect(JSON.stringify(contexts._index)).to.equal(JSON.stringify({'context_test' : 0, context_testing: 0, context_default: 0}))
					expect(JSON.stringify(contexts._total)).to.equal(JSON.stringify({'context_test' : 2, context_testing: 2, context_default: 2}))		
				})
				it('should start with the default context active', function(){
					expect(contexts.context).to.equal('context_default')
				})
			})
		})
		describe('with any contexts', function(){
			it('should link the navigation controls to the content areas in the context', function(){
					var clickable = fixture.load('html/context-duo-outside.html');
							contexts = new Clickable()
							contexts.context = 'context_test'
							$(contexts.get('navigation', 'targets')[0]).click();
							expect( $(contexts.get('contentAreas')[0]) ).to.have.class('active')
							expect( $(contexts.contentAreas.context_testing[0] )).to.not.have.class('active')
							expect( $(contexts.contentAreas.context_default[0] )).to.not.have.class('active')							
			})
			it('should retain each contexts state', function(){
					var clickable = fixture.load('html/context-duo-outside.html');
							contexts = new Clickable()
							$( $(contexts.navigation.targets.context_testing[0] ) ).click();
							expect( $(contexts.contentAreas.context_test[0] ) ).not.to.have.class('active')
							expect( $(contexts.contentAreas.context_testing[0] )).to.have.class('active')
							expect( $(contexts.contentAreas.context_default[0] )).to.not.have.class('active')
							$($(contexts.navigation.targets.context_test[0] )).click();
							expect( $(contexts.contentAreas.context_test[0] )).to.have.class('active')
							expect( $(contexts.contentAreas.context_testing[0] )).to.have.class('active')
							expect( $(contexts.contentAreas.context_default[0] )).to.not.have.class('active')							

			})
		})
	})
});
/* jshint ignore:end */