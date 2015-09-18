// describe("WB.LessonBehaviorClickModule", function() {
//   beforeEach(function() {
//     loadFixtures("lessons-show-interactions.html");
//   });
//   describe("targetted clickable", function() {
//     beforeEach(function() {
//       this.clickable = new WB.Clickable('.js-clickable-target-test');
//     });
//     context("initializing the page", function() {
//       it("should generate an actual instance", function() {
//         expect(this.clickable).toBeDefined();
//       });
//     });
//     context("when clicking on a target", function() {
//       it("should make the corresponding content area active", function() {
//         $(this.clickable.navigation.targets[1]).click();
//         expect(this.clickable.contentAreas[1]).toHaveClass('active');
//       });
//       it("should make itself active", function() {
//         $(this.clickable.navigation.targets[1]).click();
//         expect(this.clickable.contentIndicators[1]).toHaveClass('active');
//       });
//       it("should indicate it was navigated", function() {
//         $(this.clickable.navigation.targets[1]).click();
//         expect(this.clickable.interaction).toHaveClass('navigated');
//       });
//       it("should indicate it was navigated via targeting", function() {
//         $(this.clickable.navigation.targets[1]).click();
//         expect(this.clickable.interaction).toHaveClass('targetted');
//         expect(this.clickable.navigation.type).toEqual('targetted');
//       });
//     });
//   });
//   describe("linear clickable", function() {
//     beforeEach(function() {
//       var y;
//       y = $('.js-clickable-linear-test').find('.js-clickable-constructor');
//       this.linearClickable = new WB.Clickable('.js-clickable-linear-test', void 0, void 0, void 0, void 0, true);
//     });
//     it("should start with the first area active", function() {
//       expect(this.linearClickable.contentAreas[0]).toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[0]).toHaveClass('active');
//     });
//     it("should navigate forward on next click", function() {
//       $(this.linearClickable.navigation.next).click();
//       expect(this.linearClickable.contentAreas[1]).toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).toHaveClass('active');
//     });
//     it("should only allow one active section", function() {
//       $(this.linearClickable.navigation.next).click();
//       expect(this.linearClickable.contentAreas.active).toEqual(1);
//       expect(this.linearClickable.contentAreas[1]).toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).toHaveClass('active');
//       expect(this.linearClickable.contentAreas[0]).not.toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[0]).not.toHaveClass('active');
//     });
//     it("should navigate backward on prev click", function() {
//       $(this.linearClickable.navigation.next).click();
//       $(this.linearClickable.navigation.next).click();
//       $(this.linearClickable.navigation.prev).click();
//       expect(this.linearClickable.contentAreas.active).toEqual(1);
//       expect(this.linearClickable.contentAreas[1]).toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).toHaveClass('active');
//     });
//     it("should indicate on the content indicator that a section has been visited", function() {
//       $(this.linearClickable.navigation.next).click();
//       $(this.linearClickable.navigation.next).click();
//       expect(this.linearClickable.contentAreas[1]).not.toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).not.toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).toHaveClass('visited');
//     });
//     it("should not indicate on the content area that it has been visited", function() {
//       $(this.linearClickable.navigation.next).click();
//       $(this.linearClickable.navigation.next).click();
//       expect(this.linearClickable.contentAreas[1]).not.toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[1]).not.toHaveClass('active');
//       expect(this.linearClickable.contentAreas[1]).not.toHaveClass('visited');
//     });
//     it("should not indicate both a visited and active state", function() {
//       $(this.linearClickable.navigation.next).click();
//       $(this.linearClickable.navigation.prev).click();
//       expect(this.linearClickable.contentAreas[0]).toHaveClass('active');
//       expect(this.linearClickable.contentIndicators[0]).not.toHaveClass('visited');
//       expect(this.linearClickable.contentIndicators[0]).toHaveClass('active');
//     });
//     it("should loop forwards", function() {
//       var i, j, ref, totalClicks;
//       totalClicks = this.linearClickable.total;
//       for (i = j = 0, ref = totalClicks - 1; j <= ref; i = j += 1) {
//         $(this.linearClickable.navigation.next).click();
//       }
//       expect(this.linearClickable.contentAreas[0]).toHaveClass('active');
//     });
//     it("should loop backwards", function() {
//       var i, j, ref, totalClicks;
//       totalClicks = this.linearClickable.contentAreas.length - 1;
//       for (i = j = 0, ref = totalClicks; j <= ref; i = j += 1) {
//         $(this.linearClickable.navigation.prev).click();
//       }
//       expect(this.linearClickable.contentAreas[0]).toHaveClass('active');
//     });
//     it("should indicate it was navigated", function() {
//       $(this.linearClickable.navigation.prev).click();
//       expect(this.linearClickable.interaction).toHaveClass('navigated');
//     });
//     it("should indicate it was navigated via targeting", function() {
//       $(this.linearClickable.navigation.next).click();
//       expect(this.linearClickable.interaction).toHaveClass('linear');
//       expect(this.linearClickable.navigation.type).toEqual('linear');
//     });
//   });
//   describe("mixed clickable", function() {
//     beforeEach(function() {
//       this.mixedClickable = new WB.Clickable('.js-clickable-mixed-test', void 0, void 0, void 0, void 0, true);
//     });
//     it("should have a back button", function() {
//       expect(this.mixedClickable.navigation.clear).toExist();
//     });
//     it("should have a start button", function() {
//       expect(this.mixedClickable.navigation.start).toExist();
//     });
//     context("having a start button", function() {
//       it("should not have any active content areas", function() {
//         expect(this.mixedClickable.contentAreas[0]).not.toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[0]).not.toHaveClass('active');
//       });
//       it("clicking should start the navigation in a linear way", function() {
//         $(this.mixedClickable.navigation.start).click();
//         expect(this.mixedClickable.contentAreas.active).toEqual(0);
//         expect(this.mixedClickable.interaction).toHaveClass('linear');
//         expect(this.mixedClickable.navigation.type).toEqual('linear');
//         expect(this.mixedClickable.interaction).toHaveClass('navigated');
//         expect(this.mixedClickable.contentAreas[0]).toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[0]).toHaveClass('active');
//       });
//     });
//     context("clicking the back button", function() {
//       it("should reset targetted navigation", function() {
//         $(this.mixedClickable.navigation.targets[2]).click();
//         expect(this.mixedClickable.interaction).toHaveClass('targetted');
//         expect(this.mixedClickable.navigation.type).toEqual('targetted');
//         expect(this.mixedClickable.interaction).toHaveClass('navigated');
//         expect(this.mixedClickable.contentAreas[2]).toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[2]).toHaveClass('active');
//         expect(this.mixedClickable.contentAreas.active).toEqual(2);
//         $(this.mixedClickable.navigation.clear).click();
//         expect(this.mixedClickable.interaction).not.toHaveClass('targetted');
//         expect(this.mixedClickable.navigation.type).not.toEqual('targetted');
//         expect(this.mixedClickable.interaction).not.toHaveClass('navigated');
//         expect(this.mixedClickable.contentAreas[2]).not.toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[2]).toHaveClass('visited');
//         expect(this.mixedClickable.contentAreas[0]).not.toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[0]).not.toHaveClass('active');
//         expect(this.mixedClickable.contentAreas.active).toEqual(void 0);
//       });
//       it("should reset linear navigation", function() {
//         $(this.mixedClickable.navigation.start).click();
//         expect(this.mixedClickable.interaction).toHaveClass('linear');
//         expect(this.mixedClickable.navigation.type).toEqual('linear');
//         expect(this.mixedClickable.interaction).toHaveClass('navigated');
//         expect(this.mixedClickable.contentAreas[0]).toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[0]).toHaveClass('active');
//         expect(this.mixedClickable.contentAreas.active).toEqual(0);
//         $(this.mixedClickable.navigation.clear).click();
//         expect(this.mixedClickable.interaction).not.toHaveClass('linear');
//         expect(this.mixedClickable.navigation.type).not.toEqual('linear');
//         expect(this.mixedClickable.interaction).not.toHaveClass('navigated');
//         expect(this.mixedClickable.contentAreas[0]).not.toHaveClass('active');
//         expect(this.mixedClickable.contentIndicators[0]).toHaveClass('visited');
//         expect(this.mixedClickable.contentAreas.active).toEqual(void 0);
//       });
//     });
//   });
//   describe("multiple clickables", function() {
//     beforeEach(function() {
//       this.clickable = new WB.Clickable('.js-clickable-target-test');
//       this.linearClickable = new WB.Clickable('.js-clickable-linear-test');
//     });
//     it("should not have pollution between the objects", function() {
//       $(this.clickable.navigation.targets[2]).click();
//       expect(this.clickable.contentAreas[2]).toHaveClass('active');
//       expect(this.linearClickable.contentAreas[2]).not.toHaveClass('active');
//     });
//   });
// });

// // ---
// // generated by coffee-script 1.9.2