/* jshint ignore:start */
'use strict';
describe('ClickableController.js', function() {
	var controller, constructed;
	var test;
	beforeEach(function(){
  	var dom = fixture.load('html/mixed-no-start.html');		  	
  	controller = new Clickable();
		test = function(){
			this.happiness = true;
		}
		test = test.bind( controller )  	
	})
  afterEach(function(){
  	controller = {};
  	fixture.cleanup();
  }) 
  describe('#new ClickableController', function(){
  	it('should return a constructor with a navigation type', function(){
	  	expect( controller.navigation.type ).to.equal('initial')
  	}) 	
   	it('should bind click events to the construtor', function(){
			$( controller.navigation.next ).click()   		
	  	expect( $( controller.contentAreas[1] ) ).to.have.class('active')
  	})
  	describe('without a start button', function(){
	   	it('makes the first screen active', function(){
		  	expect( $( controller.contentAreas[0] ) ).to.have.class('active')
	  	})  
  	})
  	describe('with a start button', function(){
  		it('does not activate the first area', function(){
		  	fixture.cleanup();	
		  	controller = {}  			
 		  	var dom = fixture.load('html/mixed.html');	
		  	controller = new Clickable();		  	

		  	expect( $( controller.contentAreas[0] ) ).not.to.have.class('active')  			
  		})
  	})
  })
	describe('#goTo', function(){
		it('should be bound to navigation targets', function(){
			$(controller.navigation.targets[2]).click()
			expect(controller.contentAreas.active).to.equal(2)
			expect($(controller.contentAreas[2])).to.have.class('active')
			expect($(controller.indicators[2])).to.have.class('active')
		})
		it('should make the content at targets index active', function(){
			controller.goTo(1)
			expect(controller.contentAreas.active).to.equal(1)
		})
		it('should call targets preclick buffer before executing', function(){
			controller.navigation.targets.preclick.push(test)
			$(controller.navigation.targets[0]).click()
			expect( controller.happiness ).to.equal(true)
		})
		it('should deactivate all of the other contentAreas', function(){
			expect( $(controller.contentAreas[0]) ).to.have.class('active')
			$(controller.navigation.targets[1]).click()			
			expect( $(controller.contentAreas[0]) ).not.to.have.class('active')
			expect( $(controller.indicators[0]) ).not.to.have.class('active')
		})
	})
	describe('#prev', function(){
		it('should be bound to navigation prev', function(){
			$(controller.navigation.prev).click()
			expect($(controller.contentAreas[3])).to.have.class('active')
			expect($(controller.indicators[3])).to.have.class('active')		
		})
		it('should make the prev content active', function(){
			controller.prev()
			expect(controller.contentAreas.active).to.equal(3)
		})
		it('should call prev preclick buffer before executing', function(){
			controller.navigation.prev.preclick.push(test)
			$(controller.navigation.prev).click()
			expect( controller.happiness ).to.equal(true)
		})
		it('should deactivate all of the other contentAreas', function(){
			expect( $(controller.contentAreas[0]) ).to.have.class('active')
			$(controller.navigation.prev).click()			
			expect( $(controller.contentAreas[0]) ).not.to.have.class('active')
			expect( $(controller.indicators[0]) ).not.to.have.class('active')
		})
		describe('without infinite looping', function(){
			it('should short circuit when trying to navigate before 0', function(){
				expect(true).to.equal(false)
			})
		})		
	})
	describe('#next', function(){
		it('should be bound to navigation next', function(){
			$(controller.navigation.next).click()
			expect($(controller.contentAreas[1])).to.have.class('active')
			expect($(controller.indicators[1])).to.have.class('active')		
		})
		it('should make the next content active', function(){
			controller.next()
			expect(controller.contentAreas.active).to.equal(1)
		})
		it('should call next preclick buffer before executing', function(){
			controller.navigation.next.preclick.push(test)
			$(controller.navigation.next).click()
			expect( controller.happiness ).to.equal(true)
		})
		it('should deactivate all of the other contentAreas', function(){
			expect( $(controller.contentAreas[0]) ).to.have.class('active')
			$(controller.navigation.next).click()			
			expect( $(controller.contentAreas[0]) ).not.to.have.class('active')
			expect( $(controller.indicators[0]) ).not.to.have.class('active')
		})
		describe('without infinite looping', function(){
			it('should short circuit when trying to navigate after the last', function(){
				expect(true).to.equal(false)				
			})
		})		
	})	
	describe('#reset', function(){
		it('should be bound to navigation clear', function(){
			$(controller.navigation.clear).click()
			expect(controller.contentAreas.active).to.equal(0)
			expect($(controller.contentAreas[0])).to.not.have.class('active')			
			expect($(controller.indicators[0])).to.not.have.class('active')			
		})
		it('should make the content areas inactive', function(){
			controller.reset()
			expect($(controller.contentAreas[0])).to.not.have.class('active')
		})
		it('should call next preclick buffer before executing', function(){
			controller.navigation.next.preclick.push(test)
			$(controller.navigation.next).click()
			expect( controller.happiness ).to.equal(true)
		})
	})
	describe('#setNavigationType', function(){
		describe('when clicking a target', function(){
			it('should add a class to the interaction', function(){
				$(controller.navigation.targets[0]).click();
				expect($(controller.interaction)).to.have.class('targetted')
			})
		})
		describe('when clicking prev/next', function(){
			it('should add a class to the interaction', function(){
				$(controller.navigation.next).click();
				expect($(controller.interaction)).to.have.class('linear')				
			})
		})	
		describe('when clicking clear', function(){
			it('should add a class to the interaction', function(){
				$(controller.navigation.clear).click();
				expect($(controller.interaction)).to.have.class('initial')				
			})
		})	
		it('should add a navigated and navigation type class to the interaction', function(){
				$(controller.navigation.next).click();
				expect($(controller.interaction)).to.have.class('navigated')				
		})
	})
	describe('#clearNavigationType', function(){
		it('should remove navigated and navigation type class to the interaction', function(){
				$(controller.navigation.next).click();
				controller.clearNavigationType()
				expect($(controller.interaction)).not.to.have.class('navigated')			
				expect($(controller.interaction)).not.to.have.class('linear')			
		})
	})
		describe( '#makeActive', function(){
      describe('with all elements', function(){
        beforeEach(function(){
          var dom = fixture.load('html/linear.html');          
          constructed = new Clickable();
          constructed.index = 1;
          constructed.makeActive();          
        })
        it('should make the content area at index active', function(){
          expect( $(constructed.contentAreas[1]) ).to.have.class('active')
        });
        it('should update the active property of the contentAreas', function(){
          expect( constructed.contentAreas.active ).to.equal(1)
        })
        it('should make the content indicator at index active', function(){
            expect( $(constructed.indicators[1]) ).to.have.class('active')
        });
        it('should remove the visited class from the content indicator', function(){
            $(constructed.indicators[2]).addClass('visited')
            constructed.index = 2;
            constructed.makeActive();
            expect( $(constructed.indicators[2]) ).not.to.have.class('visited')
        })
        it('should give the interaction an index-specific class', function(){
          expect( $(constructed.interaction) ).to.have.class('active-'+constructed.printIndex)
        });
        describe('when toggleable', function(){
          describe('and the index was active', function(){
            it('should do nothing', function(){
              constructed.isToggle = true;
              $(constructed.contentAreas[1]).removeClass('active')
              $(constructed.indicators[1]).removeClass('active')
              expect( constructed.contentAreas.active ).to.equal(1)
              constructed.makeActive();
              expect( $(constructed.contentAreas[1]) ).to.not.have.class('active')
              expect( $(constructed.indicators[1]) ).to.not.have.class('active')
            })
          })
          describe('and the index was not active', function(){
            it('should activate the areas like normal', function(){
              constructed.isToggle = true;
              constructed.contentAreas.active = 2;              
              $(constructed.contentAreas[1]).removeClass('active')
              $(constructed.indicators[1]).removeClass('active')
              constructed.makeActive();
              expect( $(constructed.contentAreas[1]) ).to.have.class('active')
              expect( $(constructed.indicators[1]) ).to.have.class('active')
            })
          })
        })
      })
      describe('without content areas or indicators', function(){       
        it('should warn that there is nothing to activate', function(){
          var dom = fixture.load('html/linear.html');          
              constructed = new Clickable();
              constructed.contentAreas = {};
              constructed.contentIndicators = {};
              constructed.index = 1;
              constructed.makeActive();
              expect(constructed.warnings[0]).to.equal('no content to activate')
        })
      })
    });      
    describe( '#makeAllInactive', function(){
   
      describe('with all elements', function(){
        beforeEach(function(){
          var dom = fixture.load('html/linear.html');          
          constructed = new Clickable();
          constructed.index = 1;
          constructed.makeActive(); 
          constructed.makeAllInactive();         
        })

        it('should remove the active class from the content areas', function(){
          expect( $(constructed.contentAreas[1]) ).to.not.have.class('active')
        });
        it('should make all content indicators inactive', function(){
            expect( $(constructed.indicators[1]) ).to.not.have.class('active')
        });
        it('should add the visited class to the content indicator', function(){
            constructed.index = 2;
            constructed.makeActive();
            expect( $(constructed.indicators[1]) ).to.have.class('visited')
        })
        it('remove the interaction-specific class', function(){
          expect( $(constructed.interaction) ).not.to.have.class('active-'+constructed.printIndex)
        });
      });
    });   
});
/* jshint ignore:end */