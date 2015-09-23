'use strict';

var ClickableCautions = function ClickableCautions(constructed) {
  var i = this.formatConstructed(constructed);
  i.warn = this.warn.bind(i);
  i.warn();
  return i;
};
ClickableCautions.prototype = {
  formatConstructed: function formatConstructed(constructed) {
    var i = constructed || {};
    i.warnings = i.warnings || [];
    if (constructed === undefined) {
      i.warnings.push('needs a valid clickable constructor to do anything');
      this.warn.call(i);
      return i;
    }
    return i;
  },
  warn: function warn() {
    for (var j = 0; j < this.warnings.length; j++) {
      console.warn(this.warnings[j]);
    }
  }
};
'use strict';

var ClickableConstructor = function ClickableConstructor(args) {
  var auto = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var defaults = {
    wrapper: '.js-clickable-interaction',
    content: '.js-clickable-content-area',
    indicators: '.js-clickable-indicator',
    navigation: {
      targets: '.js-clickable-target',
      prev: '.js-clickable-prev',
      next: '.js-clickable-next'
    },
    meta: {
      clear: '.js-clickable-clear',
      start: '.js-clickable-start'
    },
    infinite: true,
    toggle: false
  };
  this.constructed = new ClickableCautions(defaults);
  this.constructed = this.mergeArgs(this.constructed, args);
  this.constructed = this.setDefaults(this.constructed);
  if (auto) {
    this.constructed = this.init(this.constructed);
    this.constructed.total = this.constructed.contentAreas.length || 0;
  }
  return this.constructed;
};
ClickableConstructor.prototype = {
  mergeArgs: function mergeArgs(defaults, override) {
    var i = {};
    for (var attr in defaults) {
      i[attr] = defaults[attr];
    }
    for (var attr in override) {
      if (defaults[attr] !== undefined) {
        i[attr] = override[attr];
      }
    }
    return i;
  },
  setDefaults: function setDefaults(constructed) {
    var i = constructed;
    i._index = 0;
    Object.defineProperty(i, 'index', {
      configurable: true,
      get: function get() {
        return i._index;
      },
      set: function set(val) {
        return i._index = val;
      }
    });
    Object.defineProperty(i, 'indexPrefix', {
      configurable: true,
      get: function get() {
        return '';
      }
    });
    i._total = 0;
    Object.defineProperty(i, 'total', {
      configurable: true,
      get: function get() {
        return i._total;
      },
      set: function set(val) {
        return i._total = val;
      }
    });
    i.get = this.getDepth;
    i.getIndex = this.getIndex;
    i.initBuffer = [];
    return i;
  },
  init: function init(constructed) {
    var i = constructed;
    i = this.setupWrapper(i);
    i = this.setupContent(i);
    i = this.setupNavigation(i);
    i = this.setupIndicators(i);
    i = this.setupMetaControls(i);
    i = this.setOnClicks(i);
    return i;
  },
  setupWrapper: function setupWrapper(i) {
    i.interaction = $(i.wrapper);
    var interactionCount = i.interaction.length || 0;
    if (interactionCount < 1) {
      i.warnings.push('no interaciton found');
    }
    if (interactionCount > 1) {
      i.warnings.push('multiple interactions found');
    }
    i.warn();
    return i;
  },
  setupContent: function setupContent(i) {
    i.contentAreas = this.findInInteraction(i, i.content);
    return i;
  },
  setupIndicators: function setupIndicators(i) {
    var contentCount, indicatorCount;
    i.indicators = this.findInInteraction(i, i.indicators);

    contentCount = i.contentAreas.length || 0;
    indicatorCount = i.indicators.length || 0;

    if (contentCount + indicatorCount < 1) {
      i.warnings.push('no content found');
    }
    i.warn();
    return i;
  },
  setupNavigation: function setupNavigation(i) {
    var prevCount, nextCount, targetCount;
    i.navigation.targets = this.findInInteraction(i, i.navigation.targets);
    i.navigation.prev = this.findInInteraction(i, i.navigation.prev);
    i.navigation.next = this.findInInteraction(i, i.navigation.next);

    prevCount = i.navigation.prev.length || 0;
    nextCount = i.navigation.next.length || 0;
    targetCount = i.navigation.targets.length || 0;

    if (prevCount + nextCount + targetCount < 1) {
      i.warnings.push('no navigation found');
    }
    i.warn();
    return i;
  },
  setOnClicks: function setOnClicks(i) {
    for (var nav in i.navigation) {
      if (i.navigation[nav] !== false) {
        i.navigation[nav].preclick = [];
      }
    }
    return i;
  },
  getIndex: function getIndex(c, s, el) {
    return this.get(c, s).index(el);
  },
  setupMetaControls: function setupMetaControls(i) {
    i.navigation.clear = this.findInInteraction(i, i.meta.clear);
    i.navigation.start = this.findInInteraction(i, i.meta.start);
    return i;
  },
  findInInteraction: function findInInteraction(i, selector) {
    if ($(i.interaction).find(selector).length > 0) {
      return $(i.interaction).find(selector);
    }
    return false;
  },
  getDepth: function getDepth(c, s) {
    var collection = this[c];
    if (s !== undefined) {
      collection = collection[s];
    }
    return collection;
  }
};
'use strict';

var ClickableController = function ClickableController(constructor) {
  this.constructed = new ClickableCautions(constructor);
  this.extend.call(this.constructed, this);
  this.constructed.init(this.constructed);
  return this.constructed;
};
ClickableController.prototype = {
  extend: function extend(obj) {
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr) === false) {
        this[attr] = obj[attr];
      }
    }
  },
  init: function init() {
    this.navigation.type = 'initial';
    this.setupEvents();
    this.startScreen();
    return this;
  },
  startScreen: function startScreen() {
    if (this.navigation.start) {
      return;
    }
    this.goTo(0);
    return this;
  },
  goTo: function goTo(index) {
    this.index = index;
    this.makeAllInactive();
    this.makeActive();
  },
  prev: function prev() {
    this.decrementIndex();
    this.makeAllInactive();
    this.makeActive();
  },
  next: function next() {
    this.incrementIndex();
    this.makeAllInactive();
    this.makeActive();
  },
  reset: function reset() {
    this.makeAllInactive();
    this.clearNavigationType();
    console.log('hello');
  },
  decrementIndex: function decrementIndex() {
    if (this.index > 0) {
      this.index--;
    } else if (this.infinite) {
      this.index = this.total - 1;
    }
  },
  incrementIndex: function incrementIndex() {
    if (this.index < this.total - 1) {
      this.index++;
    } else if (this.infinite) {
      this.index = 0;
    }
  },
  setupEvents: function setupEvents(i) {
    var self = this;
    $(this.get('navigation', 'prev')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs('prev', $(this));
      self.prev();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'next')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs('next', $(this));
      self.next();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'clear')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs('clear', $(this));
      self.reset();
    });
    $(this.get('navigation', 'start')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs('start', $(this));
      self.goTo(0);
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'targets')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs('targets', $(this));
      self.goTo(self.getIndex('navigation', 'targets', this));
      self.setNavigationType('targetted');
    });
    return i;
  },
  callPreclickFuncs: function callPreclickFuncs(navType, el) {
    var buffer = this.get('navigation', navType).preclick;
    for (var func in buffer) {
      buffer[func].call(this, el);
    }
  },
  setNavigationType: function setNavigationType(type) {
    this.clearNavigationType();
    this.navigation.type = type;
    this.addClassSVG(this.interaction, this.navigation.type);
    if (type !== 'start') {
      this.addClassSVG(this.interaction, 'navigated');
    }
  },
  clearNavigationType: function clearNavigationType() {
    this.removeClassSVG(this.interaction, this.navigation.type);
    this.removeClassSVG(this.interaction, 'navigated');
  },
  makeActive: function makeActive() {
    var index = this.index,
        areas = this.get('contentAreas'),
        indicators = this.get('indicators'),
        count1 = areas.length || 0,
        count2 = indicators.length || 0;

    if (!this.isToggle || areas.active !== index) {
      this.addInteractionActiveClass();
      if (areas.length > 0) {
        this.addClassSVG(areas[index], 'active');
        this.addClassSVG(areas[index], 'js-active');
        areas.active = index;
      }
      if (indicators.length > 0) {
        this.removeClassSVG(indicators[index], 'visited');
        this.removeClassSVG(indicators[index], 'js-visited');
        this.addClassSVG(indicators[index], 'active');
        this.addClassSVG(indicators[index], 'js-active');
      }
      if (count1 + count2 < 1) {
        this.warnings.push('no content to activate');
        this.warn();
      }
      return;
    }
    areas.active = false;
  },
  makeAllInactive: function makeAllInactive() {
    var areas = this.get('contentAreas'),
        indicators = this.get('indicators');
    if (areas.length) {
      this.removeClassSVG(areas, 'active');
      this.removeClassSVG(areas, 'js-active');
    }
    if (indicators.length) {
      this.makeIndicatorVisited();
      this.removeClassSVG(indicators, 'active');
      this.removeClassSVG(indicators, 'js-active');
    }
    this.removeInteractionActiveClass();
  },
  addInteractionActiveClass: function addInteractionActiveClass() {
    this.addClassSVG(this.interaction, 'active-' + this.indexPrefix + this.index);
  },
  removeInteractionActiveClass: function removeInteractionActiveClass() {
    for (var i = 0; i < this.total; i++) {
      this.removeClassSVG(this.interaction, 'active-' + this.indexPrefix + i);
    }
  },
  makeIndicatorVisited: function makeIndicatorVisited() {
    var self = this;
    $(this.get('indicators')).each(function () {
      if ($(this).attr('class').indexOf('js-active') > 0) {
        self.addClassSVG(this, 'visited');
        self.addClassSVG(this, 'js-visited');
      }
    });
  },
  addClassSVG: function addClassSVG(elem, newClass) {
    if (elem == undefined) {
      return;
    }
    if (elem.length > 0) {
      this.addMultipleClasses(elem, newClass);
    } else {
      this.addSingularClass(elem, newClass);
    }
  },
  addSingularClass: function addSingularClass(elem, newClass) {
    if (elem === undefined) {
      return;
    }
    var tempClass = $(elem).attr('class');
    $(elem).attr('class', tempClass + ' ' + newClass);
  },
  addMultipleClasses: function addMultipleClasses(elems, newClass) {
    var tempClass;
    for (var i = 0; i < elems.length; i++) {
      tempClass = $(elems[i]).attr('class');
      $(elems[i]).attr('class', tempClass + ' ' + newClass);
    }
  },
  removeClassSVG: function removeClassSVG(elem, removedClass) {
    if (elem == undefined) {
      return;
    }
    if (elem.length > 0) {
      this.removeMultipleClasses(elem, removedClass);
    } else {
      this.removeSingularClass(elem, removedClass);
    }
  },
  removeSingularClass: function removeSingularClass(elem, removedClass) {
    var tempClass = $(elem).attr('class');
    var newClass = tempClass.replace(' ' + removedClass, '');
    $(elem).attr('class', newClass);
  },
  removeMultipleClasses: function removeMultipleClasses(elems, removedClass) {
    var tempClass, newClass;
    for (var i = 0; i < elems.length; i++) {
      tempClass = $(elems[i]).attr('class');
      newClass = tempClass.replace(' ' + removedClass, '');
      $(elems[i]).attr('class', newClass);
    }
  }
};
'use strict';

var ClickableContext = function ClickableContext(constructed) {
  this.constructed = new ClickableCautions(constructed);
  this.constructed = this.init(this.constructed);
  if (this.constructed.context) {
    this.constructed = this.sortCollections(this.constructed);
    this.constructed = this.overrideDefaults(this.constructed);
  }

  return this.constructed;
};

ClickableContext.prototype = {
  init: function init(i) {
    i = this.setInitialData(i);
    i = this.setTotalData(i);
    i = this.setIndexData(i);
    return i;
  },
  overrideDefaults: function overrideDefaults(i) {
    Object.defineProperty(i, 'index', {
      get: function get() {
        return this._index[this.context];
      },
      set: function set(val) {
        return this._index[this.context] = val;
      }
    });
    Object.defineProperty(i, 'indexPrefix', {
      configurable: true,
      get: function get() {
        return this.context + '-';
      }
    });
    Object.defineProperty(i, 'total', {
      get: function get() {
        return this._total[this.context];
      },
      set: function set(val) {
        return this._total[this.context] = val;
      }
    });
    i.get = this.getContextDepth;
    i.getIndex = this.getContextIndex;
    i.initBuffer.push(this.contextInit);
    return i;
  },
  contextInit: function contextInit() {
    if (this._total.hasOwnProperty('context_default')) {
      this.context = 'context_default';
      return;
    }
    for (var first in this._total) {
      this.context = first;
      break;
    }
  },
  setInitialData: function setInitialdata(i) {
    i.context = false;
    return i;
  },
  findContextCount: function findContextCount(el) {
    var indices = {},
        self = this;
    $(el).each(function () {
      var c = $(this).data('context');
      indices = self.addToOrInit(indices, c);
    });
    return indices;
  },
  mergeForMax: function mergeForMax(obj1, obj2) {
    var merged = obj1;
    for (var prop in obj2) {
      if (merged[prop] === undefined || merged[prop] < obj2[prop]) {
        merged[prop] = obj2[prop];
      }
    }
    return merged;
  },
  setTotalData: function setTotalData(i) {
    var contents = this.findContextCount(i.contentAreas);
    var indicators = this.findContextCount(i.indicators);
    var contexts = this.mergeForMax(contents, indicators);
    for (var context in contexts) {
      if (context !== 'context_default') {
        i.context = true;
        i._total = contexts;
        return i;
      }
    }
    return i;
  },
  setIndexData: function setIndexData(i) {
    if (!i.context) {
      return i;
    }
    i._index = {};
    for (var context in i.total) {
      i._index[context] = 0;
    }
    return i;
  },
  addToOrInit: function addToOrInit(obj, prop) {
    var property = prop || 'default';
    var key = 'context_' + property;
    if (obj.hasOwnProperty(key)) {
      obj[key] += 1;
      return obj;
    }
    obj[key] = 1;
    return obj;
  },
  sortCollections: function sortCollections(i) {
    i.contentAreas = this.contextSort(i, 'contentAreas');
    i.indicators = this.contextSort(i, 'indicators');
    i.navigation.targets = this.contextSort(i, 'navigation', 'targets');
    i.navigation.prev = this.contextSort(i, 'navigation', 'prev');
    i.navigation.next = this.contextSort(i, 'navigation', 'next');
    this.warnAboutNavigation(i);
    return i;
  },
  contextSort: function contextSort(i, collection, sub) {
    var all = i.get(collection, sub),
        self = this,
        onclick;
    if (all) {
      onclick = all.preclick;
    }

    $(all).filter(function () {

      return $(this);
    }).each(function () {

      var c = self.setContextKey($(this));
      if (all[c] === undefined) {
        all[c] = $();
      }
      $(this).data('index', all[c].length);
      all[c] = $(all[c]).add($(this));
    });
    if (onclick) {
      all.preclick = onclick;
      all.preclick.push(self.parseContext);
    }
    return all;
  },
  warnAboutNavigation: function warnAboutNavigation(i) {
    for (var key in i._index) {
      if (i.navigation.targets[key] === undefined && i.navigation.prev[key] === undefined && i.navigation.next[key] === undefined) {
        i.warnings.push('there is no navgation for the context ' + key);
      }
    }
    i.warn();
  },
  parseContext: function parseContext(el) {
    if (el !== undefined && $(el).data('context')) {
      this.context = 'context_' + $(el).data('context');
      return;
    }
    this.context = 'context_default';
  },
  getContextIndex: function getContextIndex(c, s, el) {
    return $(el).data('index');
  },
  getContextDepth: function getContextDepth(c, s) {
    var collection = this[c][this.context];
    if (this[c][this.context] === undefined || this.context === true) {
      collection = this[c];
      if (collection === false) {
        return;
      }
    }
    if (s !== undefined) {
      collection = collection[s];
    }
    return collection;
  },
  setContextKey: function setContextKey(el) {
    var ctx = el.data('context') || 'default';
    return 'context_' + ctx;
  }
};
'use strict';

(function (global, factory) {

	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = global.document ? factory(global, true) : function (w) {
			if (!w.document) {
				throw new Error('requires a window with a document');
			}
			return factory(w);
		};
	} else {
		factory(global);
	}
	// Pass this if window is not defined yet
})(typeof window !== 'undefined' ? window : undefined, function (window, noGlobal) {
	var Clickable = function Clickable(args) {
		var constructed = {};
		constructed = new ClickableConstructor(args);
		constructed = new ClickableContext(constructed);
		constructed = new ClickableController(constructed);
		for (var i = 0; i < constructed.initBuffer.length; i++) {
			constructed.initBuffer[i].call(constructed);
		}
		return constructed;
	};
	if (typeof noGlobal === 'undefined') {
		window.Clickable = Clickable;
	}

	return Clickable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWNrYWJsZUNhdXRpb25zLmpzIiwiQ2xpY2thYmxlQ29uc3RydWN0b3IuanMiLCJDbGlja2FibGVDb250cm9sbGVyLmpzIiwiQ2xpY2thYmxlQ29udGV4dC5qcyIsIkNsaWNrYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQWEsV0FBVyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUM1QyxHQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdCLEdBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQU8sQ0FBQyxDQUFDO0NBQ1QsQ0FBQztBQUNGLGlCQUFpQixDQUFDLFNBQVMsR0FBRztBQUM1QixtQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixDQUFFLFdBQVcsRUFBRTtBQUMxRCxRQUFJLENBQUMsR0FBSSxXQUFXLElBQUksRUFBRSxDQUFDO0FBQ3ZCLEtBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDOUIsUUFBSSxXQUFXLEtBQUssU0FBUyxFQUFDO0FBQzVCLE9BQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7QUFDdEUsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDcEIsYUFBTyxDQUFDLENBQUM7S0FDVjtBQUNELFdBQU8sQ0FBQyxDQUFDO0dBQ2Q7QUFDRCxNQUFJLEVBQUUsU0FBUyxJQUFJLEdBQUU7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGFBQU8sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO0tBQ2xDO0dBQ0Y7Q0FDRixDQUFDOzs7QUN0QkYsSUFBSSxvQkFBb0IsR0FBRyxTQUF2QixvQkFBb0IsQ0FBYSxJQUFJLEVBQWE7TUFBWCxJQUFJLHlEQUFDLElBQUk7O0FBQ2xELE1BQUksUUFBUSxHQUFHO0FBQ2IsV0FBTyxFQUFFLDJCQUEyQjtBQUNwQyxXQUFPLEVBQUUsNEJBQTRCO0FBQ3JDLGNBQVUsRUFBRSx5QkFBeUI7QUFDckMsY0FBVSxFQUFFO0FBQ1YsYUFBTyxFQUFFLHNCQUFzQjtBQUMvQixVQUFJLEVBQUUsb0JBQW9CO0FBQzFCLFVBQUksRUFBRSxvQkFBb0I7S0FDM0I7QUFDRCxRQUFJLEVBQUU7QUFDSixXQUFLLEVBQUUscUJBQXFCO0FBQzVCLFdBQUssRUFBRSxxQkFBcUI7S0FDN0I7QUFDRCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0dBQ2QsQ0FBQztBQUNGLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBRSxRQUFRLENBQUUsQ0FBQztBQUNyRCxNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUUsQ0FBQztBQUM1RCxNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO0FBQ3hELE1BQUksSUFBSSxFQUFFO0FBQ1IsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztBQUNqRCxRQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0dBQ3BFO0FBQ0QsU0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0NBQ3pCLENBQUM7QUFDRixvQkFBb0IsQ0FBQyxTQUFTLEdBQUc7QUFDL0IsV0FBUyxFQUFFLFNBQVMsU0FBUyxDQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDakQsUUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ1gsU0FBSyxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7QUFDekIsT0FBQyxDQUFFLElBQUksQ0FBRSxHQUFHLFFBQVEsQ0FBRSxJQUFJLENBQUUsQ0FBQztLQUM5QjtBQUNELFNBQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO0FBQ3pCLFVBQUksUUFBUSxDQUFFLElBQUksQ0FBRSxLQUFLLFNBQVMsRUFBRTtBQUNsQyxTQUFDLENBQUUsSUFBSSxDQUFFLEdBQUcsUUFBUSxDQUFFLElBQUksQ0FBRSxDQUFDO09BQzlCO0tBQ0Y7QUFDRCxXQUFPLENBQUMsQ0FBQztHQUNWO0FBQ0QsYUFBVyxFQUFFLHFCQUFVLFdBQVcsRUFBRTtBQUNsQyxRQUFJLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDcEIsS0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDYixVQUFNLENBQUMsY0FBYyxDQUFFLENBQUMsRUFBRSxPQUFPLEVBQUU7QUFDakMsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLFNBQUcsRUFBRSxlQUFVO0FBQ2IsZUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDO09BQ2pCO0FBQ0QsU0FBRyxFQUFFLGFBQVUsR0FBRyxFQUFFO0FBQ2xCLGVBQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7T0FDdkI7S0FDRixDQUFDLENBQUM7QUFDSCxVQUFNLENBQUMsY0FBYyxDQUFFLENBQUMsRUFBRSxhQUFhLEVBQUU7QUFDdkMsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLFNBQUcsRUFBRSxlQUFVO0FBQ2IsZUFBTyxFQUFFLENBQUM7T0FDWDtLQUNGLENBQUMsQ0FBQztBQUNILEtBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsVUFBTSxDQUFDLGNBQWMsQ0FBRSxDQUFDLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLGtCQUFZLEVBQUUsSUFBSTtBQUNsQixTQUFHLEVBQUUsZUFBVTtBQUNiLGVBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztPQUNqQjtBQUNELFNBQUcsRUFBRSxhQUFVLEdBQUcsRUFBRTtBQUNsQixlQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO09BQ3ZCO0tBQ0YsQ0FBQyxDQUFDO0FBQ0gsS0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3RCLEtBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixLQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNsQixXQUFPLENBQUMsQ0FBQztHQUNWO0FBQ0QsTUFBSSxFQUFFLGNBQVUsV0FBVyxFQUFFO0FBQzNCLFFBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztBQUNoQixLQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUMzQixLQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUMzQixLQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUM5QixLQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUM5QixLQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQ2hDLEtBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzFCLFdBQU8sQ0FBQyxDQUFDO0dBQ2Q7QUFDRCxjQUFZLEVBQUUsc0JBQVUsQ0FBQyxFQUFFO0FBQ3pCLEtBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFFLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQztBQUMvQixRQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUNqRCxRQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRTtBQUN4QixPQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0tBQ3hDO0FBQ0QsUUFBSSxnQkFBZ0IsR0FBRyxDQUFDLEVBQUU7QUFDeEIsT0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtLQUMvQztBQUNELEtBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNULFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7QUFDRCxjQUFZLEVBQUUsc0JBQVUsQ0FBQyxFQUFFO0FBQ3pCLEtBQUMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFFLENBQUM7QUFDeEQsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELGlCQUFlLEVBQUUseUJBQVUsQ0FBQyxFQUFFO0FBQzVCLFFBQUksWUFBWSxFQUFFLGNBQWMsQ0FBQztBQUNqQyxLQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBRSxDQUFDOztBQUV6RCxnQkFBWSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUMxQyxrQkFBYyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQzs7QUFFMUMsUUFBSSxZQUFZLEdBQUcsY0FBYyxHQUFHLENBQUMsRUFBQztBQUNwQyxPQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3JDO0FBQ0QsS0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1QsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELGlCQUFlLEVBQUUseUJBQVUsQ0FBQyxFQUFFO0FBQzVCLFFBQUksU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUM7QUFDdEMsS0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBRSxDQUFDO0FBQ3hFLEtBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFLLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQztBQUNyRSxLQUFDLENBQUMsVUFBVSxDQUFDLElBQUksR0FBSyxJQUFJLENBQUMsaUJBQWlCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7O0FBRXJFLGFBQVMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQzFDLGFBQVMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQzFDLGVBQVcsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDOztBQUUvQyxRQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsV0FBVyxHQUFHLENBQUMsRUFBRTtBQUMzQyxPQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ3hDO0FBQ0QsS0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1QsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELGFBQVcsRUFBRSxxQkFBVSxDQUFDLEVBQUU7QUFDeEIsU0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFHO0FBQzdCLFVBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBRSxHQUFHLENBQUUsS0FBSyxLQUFLLEVBQUU7QUFDakMsU0FBQyxDQUFDLFVBQVUsQ0FBRSxHQUFHLENBQUUsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO09BQ25DO0tBQ0Y7QUFDRCxXQUFPLENBQUMsQ0FBQztHQUNWO0FBQ0QsVUFBUSxFQUFFLFNBQVMsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFDO0FBQ3BDLFdBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ2pDO0FBQ0QsbUJBQWlCLEVBQUUsMkJBQVUsQ0FBQyxFQUFFO0FBQzlCLEtBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQztBQUMvRCxLQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFFLENBQUM7QUFDL0QsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELG1CQUFpQixFQUFFLDJCQUFVLENBQUMsRUFBRSxRQUFRLEVBQUU7QUFDeEMsUUFBSSxDQUFDLENBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxDQUFDLElBQUksQ0FBRSxRQUFRLENBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2xELGFBQU8sQ0FBQyxDQUFFLENBQUMsQ0FBQyxXQUFXLENBQUUsQ0FBQyxJQUFJLENBQUUsUUFBUSxDQUFFLENBQUM7S0FDNUM7QUFDRCxXQUFPLEtBQUssQ0FBQztHQUNkO0FBQ0QsVUFBUSxFQUFFLFNBQVMsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUNuQixnQkFBVSxHQUFHLFVBQVUsQ0FBRSxDQUFDLENBQUUsQ0FBQztLQUM5QjtBQUNELFdBQU8sVUFBVSxDQUFDO0dBQ25CO0NBQ0YsQ0FBQzs7O0FDNUpGLElBQUksbUJBQW1CLEdBQUcsU0FBdEIsbUJBQW1CLENBQWEsV0FBVyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUN4RCxNQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBRSxDQUFHO0FBQzdDLE1BQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztBQUMxQyxTQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7Q0FDM0IsQ0FBQztBQUNGLG1CQUFtQixDQUFDLFNBQVMsR0FBRztBQUM5QixRQUFNLEVBQUUsZ0JBQVUsR0FBRyxFQUFFO0FBQ3JCLFNBQUssSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0FBQ3BCLFVBQUksR0FBRyxDQUFDLGNBQWMsQ0FBRSxJQUFJLENBQUUsS0FBSyxLQUFLLEVBQUU7QUFDeEMsWUFBSSxDQUFFLElBQUksQ0FBRSxHQUFHLEdBQUcsQ0FBRSxJQUFJLENBQUUsQ0FBQztPQUM1QjtLQUNGO0dBQ0Y7QUFDRCxNQUFJLEVBQUUsZ0JBQVU7QUFDZCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7QUFDakMsUUFBSSxDQUFDLFdBQVcsRUFBRyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxXQUFXLEVBQUcsQ0FBQztBQUNwQixXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsYUFBVyxFQUFFLHVCQUFXO0FBQ3RCLFFBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUU7QUFDekIsYUFBTztLQUNSO0FBQ0QsUUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUNmLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLEVBQUUsY0FBVSxLQUFLLEVBQUU7QUFDckIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUNuQjtBQUNELE1BQUksRUFBRSxnQkFBVTtBQUNkLFFBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN0QixRQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkIsUUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0dBQ25CO0FBQ0QsTUFBSSxFQUFFLGdCQUFVO0FBQ2QsUUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7R0FDbkI7QUFDRCxPQUFLLEVBQUUsaUJBQVU7QUFDZixRQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkIsUUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0IsV0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQjtBQUNELGdCQUFjLEVBQUUsMEJBQVU7QUFDeEIsUUFBRyxJQUFJLENBQUMsS0FBSyxHQUFJLENBQUMsRUFBQztBQUNqQixVQUFJLENBQUMsS0FBSyxFQUFJLENBQUM7S0FDaEIsTUFBSyxJQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7QUFDckIsVUFBSSxDQUFDLEtBQUssR0FBSSxJQUFJLENBQUMsS0FBSyxHQUFFLENBQUMsQ0FBQztLQUM3QjtHQUNGO0FBQ0QsZ0JBQWMsRUFBRSwwQkFBVTtBQUN4QixRQUFHLElBQUksQ0FBQyxLQUFLLEdBQUksSUFBSSxDQUFDLEtBQUssR0FBRSxDQUFDLEVBQUM7QUFDN0IsVUFBSSxDQUFDLEtBQUssRUFBSSxDQUFDO0tBQ2hCLE1BQU0sSUFBRyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLFVBQUksQ0FBQyxLQUFLLEdBQUksQ0FBQyxDQUFDO0tBQ2pCO0dBQ0Y7QUFDRCxhQUFXLEVBQUUsU0FBUyxXQUFXLENBQUMsQ0FBQyxFQUFFO0FBQ25DLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNoQixLQUFDLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDckQsT0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ25CLFVBQUksQ0FBQyxpQkFBaUIsQ0FBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUM7QUFDMUMsVUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osVUFBSSxDQUFDLGlCQUFpQixDQUFFLFFBQVEsQ0FBRSxDQUFDO0tBQ3BDLENBQUMsQ0FBQztBQUNILEtBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNuRCxPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsVUFBSSxDQUFDLGlCQUFpQixDQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztBQUMxQyxVQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixVQUFJLENBQUMsaUJBQWlCLENBQUUsUUFBUSxDQUFFLENBQUM7S0FDcEMsQ0FBQyxDQUFDO0FBQ0gsS0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3BELE9BQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNuQixVQUFJLENBQUMsaUJBQWlCLENBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDO0FBQzNDLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNkLENBQUMsQ0FBQztBQUNILEtBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNwRCxPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsVUFBSSxDQUFDLGlCQUFpQixDQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztBQUMzQyxVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2IsVUFBSSxDQUFDLGlCQUFpQixDQUFFLFFBQVEsQ0FBRSxDQUFDO0tBQ3BDLENBQUMsQ0FBQztBQUNILEtBQUMsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBRSxDQUFDLEtBQUssQ0FBQyxVQUFTLENBQUMsRUFBQztBQUNwRCxPQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDbkIsVUFBSSxDQUFDLGlCQUFpQixDQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztBQUM3QyxVQUFJLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBRSxDQUFDO0FBQzFELFVBQUksQ0FBQyxpQkFBaUIsQ0FBRSxXQUFXLENBQUMsQ0FBQztLQUN4QyxDQUFDLENBQUM7QUFDSCxXQUFPLENBQUMsQ0FBQztHQUNWO0FBQ0QsbUJBQWlCLEVBQUUsU0FBUyxpQkFBaUIsQ0FBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO0FBQzFELFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBRSxDQUFDLFFBQVEsQ0FBQztBQUN2RCxTQUFJLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUN0QixZQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFFLElBQUksRUFBRSxFQUFFLENBQUUsQ0FBQztLQUMvQjtHQUNGO0FBQ0QsbUJBQWlCLEVBQUUsMkJBQVMsSUFBSSxFQUFDO0FBQy9CLFFBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUM1QixRQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6RCxRQUFHLElBQUksS0FBSyxPQUFPLEVBQUM7QUFDbEIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ2pEO0dBRUY7QUFDRCxxQkFBbUIsRUFBRSwrQkFBVTtBQUM3QixRQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RCxRQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7R0FDcEQ7QUFDRCxZQUFVLEVBQUUsc0JBQVU7QUFDcEIsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7UUFDbEIsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsY0FBYyxDQUFFO1FBQ2xDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLFlBQVksQ0FBRTtRQUNyQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDO1FBQzFCLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQzs7QUFFcEMsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxLQUFLLEVBQUU7QUFDNUMsVUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7QUFDakMsVUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRztBQUNyQixZQUFJLENBQUMsV0FBVyxDQUFFLEtBQUssQ0FBRSxLQUFLLENBQUUsRUFBRSxRQUFRLENBQUUsQ0FBQztBQUM3QyxZQUFJLENBQUMsV0FBVyxDQUFFLEtBQUssQ0FBRSxLQUFLLENBQUUsRUFBRSxXQUFXLENBQUUsQ0FBQztBQUNoRCxhQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBRTtPQUN2QjtBQUNELFVBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekIsWUFBSSxDQUFDLGNBQWMsQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLEVBQUUsU0FBUyxDQUFFLENBQUM7QUFDdEQsWUFBSSxDQUFDLGNBQWMsQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLEVBQUUsWUFBWSxDQUFFLENBQUM7QUFDekQsWUFBSSxDQUFDLFdBQVcsQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLEVBQUUsUUFBUSxDQUFFLENBQUM7QUFDbEQsWUFBSSxDQUFDLFdBQVcsQ0FBRSxVQUFVLENBQUUsS0FBSyxDQUFFLEVBQUUsV0FBVyxDQUFFLENBQUM7T0FDdEQ7QUFDRCxVQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDN0MsWUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2I7QUFDRCxhQUFPO0tBQ1I7QUFDRCxTQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztHQUN0QjtBQUNELGlCQUFlLEVBQUUsMkJBQVU7QUFDekIsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBRSxjQUFjLENBQUU7UUFDbEMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsWUFBWSxDQUFFLENBQUM7QUFDMUMsUUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxjQUFjLENBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxjQUFjLENBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBRSxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBRSxDQUFDO0FBQzVDLFVBQUksQ0FBQyxjQUFjLENBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBRSxDQUFDO0tBQ2hEO0FBQ0QsUUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7R0FDckM7QUFDRCwyQkFBeUIsRUFBRSxxQ0FBVTtBQUNuQyxRQUFJLENBQUMsV0FBVyxDQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxDQUFDO0dBQ2pGO0FBQ0QsOEJBQTRCLEVBQUUsd0NBQVU7QUFDdEMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUM7QUFDaEMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsR0FBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBRSxDQUFDO0tBQ3pFO0dBQ0Y7QUFDRCxzQkFBb0IsRUFBRSxnQ0FBVTtBQUM5QixRQUFJLElBQUksR0FBRyxJQUFJLENBQUM7QUFDaEIsS0FBQyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUUsWUFBWSxDQUFFLENBQUUsQ0FBQyxJQUFJLENBQUMsWUFBVTtBQUMzQyxVQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRztBQUNsRCxZQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNsQyxZQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztPQUN0QztLQUNGLENBQUMsQ0FBQztHQUNKO0FBQ0QsYUFBVyxFQUFFLHFCQUFTLElBQUksRUFBRSxRQUFRLEVBQUM7QUFDbkMsUUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO0FBQ3JCLGFBQU87S0FDUjtBQUNELFFBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7QUFDakIsVUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN6QyxNQUFNO0FBQ0wsVUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2QztHQUNGO0FBQ0Qsa0JBQWdCLEVBQUUsMEJBQVMsSUFBSSxFQUFFLFFBQVEsRUFBQztBQUN4QyxRQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFBRSxhQUFPO0tBQUU7QUFDbkMsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QyxLQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLEdBQUcsR0FBRyxHQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ2xEO0FBQ0Qsb0JBQWtCLEVBQUUsNEJBQVMsS0FBSyxFQUFFLFFBQVEsRUFBQztBQUMzQyxRQUFJLFNBQVMsQ0FBQztBQUNkLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO0FBQ2xDLGVBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLE9BQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsR0FBRyxHQUFHLEdBQUUsUUFBUSxDQUFDLENBQUM7S0FDdEQ7R0FDRjtBQUNELGdCQUFjLEVBQUUsd0JBQVMsSUFBSSxFQUFFLFlBQVksRUFBQztBQUMxQyxRQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7QUFDckIsYUFBTztLQUNSO0FBQ0QsUUFBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztBQUNqQixVQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ2hELE1BQU07QUFDTCxVQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQzlDO0dBQ0Y7QUFDRCxxQkFBbUIsRUFBRSw2QkFBUyxJQUFJLEVBQUUsWUFBWSxFQUFDO0FBQy9DLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEMsUUFBSSxRQUFRLEdBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELEtBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQ2pDO0FBQ0QsdUJBQXFCLEVBQUUsK0JBQVMsS0FBSyxFQUFFLFlBQVksRUFBQztBQUNsRCxRQUFJLFNBQVMsRUFBRSxRQUFRLENBQUM7QUFDeEIsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7QUFDbEMsZUFBUyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEMsY0FBUSxHQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNwRCxPQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNyQztHQUNGO0NBQ0YsQ0FBQzs7O0FDek5GLElBQUksZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQWEsV0FBVyxFQUFFO0FBQzVDLE1BQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUN4RCxNQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDO0FBQ2pELE1BQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7QUFDNUIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztBQUM1RCxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUM7R0FDOUQ7O0FBRUQsU0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0NBQ3pCLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsU0FBUyxHQUFHO0FBQzNCLE1BQUksRUFBRSxTQUFTLElBQUksQ0FBRSxDQUFDLEVBQUU7QUFDdEIsS0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDN0IsS0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDM0IsS0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDM0IsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELGtCQUFnQixFQUFFLFNBQVMsZ0JBQWdCLENBQUUsQ0FBQyxFQUFFO0FBQzlDLFVBQU0sQ0FBQyxjQUFjLENBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRTtBQUNqQyxTQUFHLEVBQUUsZUFBVTtBQUNiLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7T0FDcEM7QUFDRCxTQUFHLEVBQUUsYUFBVSxHQUFHLEVBQUU7QUFDbEIsZUFBTyxJQUFJLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsR0FBRyxHQUFHLENBQUM7T0FDMUM7S0FDRixDQUFDLENBQUM7QUFDSCxVQUFNLENBQUMsY0FBYyxDQUFFLENBQUMsRUFBRSxhQUFhLEVBQUU7QUFDdkMsa0JBQVksRUFBRSxJQUFJO0FBQ2xCLFNBQUcsRUFBRSxlQUFVO0FBQ2IsZUFBTyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztPQUMzQjtLQUNGLENBQUMsQ0FBQztBQUNILFVBQU0sQ0FBQyxjQUFjLENBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRTtBQUNqQyxTQUFHLEVBQUUsZUFBVTtBQUNiLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7T0FDcEM7QUFDRCxTQUFHLEVBQUUsYUFBVSxHQUFHLEVBQUU7QUFDbEIsZUFBTyxJQUFJLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsR0FBRyxHQUFHLENBQUM7T0FDMUM7S0FDRixDQUFDLENBQUM7QUFDSCxLQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDN0IsS0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO0FBQ2xDLEtBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztBQUN0QyxXQUFPLENBQUMsQ0FBQztHQUNWO0FBQ0QsYUFBVyxFQUFFLFNBQVMsV0FBVyxHQUFFO0FBQ2pDLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsRUFBQztBQUNoRCxVQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0FBQ2pDLGFBQU87S0FDUjtBQUNELFNBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBQztBQUMzQixVQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixZQUFNO0tBQ1A7R0FDRjtBQUNELGdCQUFjLEVBQUUsU0FBUyxjQUFjLENBQUUsQ0FBQyxFQUFFO0FBQzFDLEtBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7QUFDRCxrQkFBZ0IsRUFBRSxTQUFTLGdCQUFnQixDQUFFLEVBQUUsRUFBRTtBQUMvQyxRQUFJLE9BQU8sR0FBRyxFQUFFO1FBQUUsSUFBSSxHQUFHLElBQUksQ0FBQztBQUM5QixLQUFDLENBQUUsRUFBRSxDQUFFLENBQUMsSUFBSSxDQUFFLFlBQVU7QUFDdEIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNoQyxhQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxPQUFPLEVBQUUsQ0FBQyxDQUFFLENBQUM7S0FDMUMsQ0FBQyxDQUFDO0FBQ0gsV0FBTyxPQUFPLENBQUM7R0FDaEI7QUFDRCxhQUFXLEVBQUUsU0FBUyxXQUFXLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtBQUM3QyxRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbEIsU0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDckIsVUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7QUFDMUQsY0FBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMzQjtLQUNGO0FBQ0QsV0FBTyxNQUFNLENBQUM7R0FDZjtBQUNELGNBQVksRUFBRSxTQUFTLFlBQVksQ0FBRSxDQUFDLEVBQUU7QUFDdEMsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFFLENBQUMsQ0FBQyxZQUFZLENBQUUsQ0FBQztBQUN2RCxRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBRSxDQUFDO0FBQ3ZELFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBRSxDQUFDO0FBQ3hELFNBQUssSUFBSSxPQUFPLElBQUksUUFBUSxFQUFFO0FBQzVCLFVBQUksT0FBTyxLQUFLLGlCQUFpQixFQUFFO0FBQ2pDLFNBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQUMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3BCLGVBQU8sQ0FBQyxDQUFDO09BQ1Y7S0FDRjtBQUNELFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7QUFDRCxjQUFZLEVBQUUsU0FBUyxZQUFZLENBQUUsQ0FBQyxFQUFFO0FBQ3RDLFFBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ2QsYUFBTyxDQUFDLENBQUM7S0FDVjtBQUNELEtBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2QsU0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO0FBQzNCLE9BQUMsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3pCO0FBQ0QsV0FBTyxDQUFDLENBQUM7R0FDVjtBQUNELGFBQVcsRUFBRSxTQUFTLFdBQVcsQ0FBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQzVDLFFBQUksUUFBUSxHQUFHLElBQUksSUFBSSxTQUFTLENBQUM7QUFDakMsUUFBSSxHQUFHLEdBQUcsVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUNoQyxRQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUUsR0FBRyxDQUFFLEVBQUU7QUFDN0IsU0FBRyxDQUFFLEdBQUcsQ0FBRSxJQUFJLENBQUMsQ0FBQztBQUNoQixhQUFPLEdBQUcsQ0FBQztLQUNaO0FBQ0QsT0FBRyxDQUFFLEdBQUcsQ0FBRSxHQUFHLENBQUMsQ0FBQztBQUNmLFdBQU8sR0FBRyxDQUFDO0dBQ1o7QUFDRCxpQkFBZSxFQUFFLFNBQVMsZUFBZSxDQUFFLENBQUMsRUFBRTtBQUM1QyxLQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBRSxDQUFDO0FBQ3ZELEtBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDLEVBQUUsWUFBWSxDQUFFLENBQUM7QUFDbkQsS0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBRSxDQUFDO0FBQ3RFLEtBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxNQUFNLENBQUUsQ0FBQztBQUNoRSxLQUFDLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFFLENBQUM7QUFDaEUsUUFBSSxDQUFDLG1CQUFtQixDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzlCLFdBQU8sQ0FBQyxDQUFDO0dBQ1Y7QUFDRCxhQUFXLEVBQUUsU0FBUyxXQUFXLENBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUU7QUFDckQsUUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBRSxVQUFVLEVBQUUsR0FBRyxDQUFFO1FBQzlCLElBQUksR0FBRyxJQUFJO1FBQ1gsT0FBTyxDQUFDO0FBQ1osUUFBSSxHQUFHLEVBQUU7QUFBRSxhQUFPLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztLQUFFOztBQUVwQyxLQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFFLFlBQVU7O0FBRXZCLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBRWhCLENBQUUsQ0FBQyxJQUFJLENBQUUsWUFBVTs7QUFFbEIsVUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztBQUN0QyxVQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDeEIsV0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO09BQ2Q7QUFDRCxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckMsU0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUM7S0FDbkMsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxPQUFPLEVBQUU7QUFBRSxTQUFHLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUN2QixTQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFFLENBQUM7S0FBRTtBQUN2RCxXQUFPLEdBQUcsQ0FBQztHQUNaO0FBQ0QscUJBQW1CLEVBQUUsU0FBUyxtQkFBbUIsQ0FBRSxDQUFDLEVBQUU7QUFDcEQsU0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3hCLFVBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUUsR0FBRyxDQUFFLEtBQUssU0FBUyxJQUMzQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUUsS0FBSyxTQUFTLElBQ3RDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxLQUFLLFNBQVMsRUFBRTtBQUN4QyxTQUFDLENBQUMsUUFBUSxDQUFDLElBQUksNENBQTBDLEdBQUcsQ0FBRyxDQUFDO09BQ2pFO0tBQ0Y7QUFDRCxLQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDVjtBQUNELGNBQVksRUFBRSxTQUFTLFlBQVksQ0FBRSxFQUFFLEVBQUU7QUFDdkMsUUFBSSxFQUFFLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBRSxFQUFFLENBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDL0MsVUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFFLEVBQUUsQ0FBRSxDQUFDLElBQUksQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUN0RCxhQUFPO0tBQ1I7QUFDRCxRQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0dBQ2xDO0FBQ0QsaUJBQWUsRUFBRSxTQUFTLGVBQWUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBQztBQUNsRCxXQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDNUI7QUFDRCxpQkFBZSxFQUFFLFNBQVMsZUFBZSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDL0MsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQztBQUMzQyxRQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO0FBQ2hFLGdCQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLFVBQUcsVUFBVSxLQUFLLEtBQUssRUFBQztBQUN0QixlQUFPO09BQ1I7S0FDRjtBQUNELFFBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUNuQixnQkFBVSxHQUFHLFVBQVUsQ0FBRSxDQUFDLENBQUUsQ0FBQztLQUM5QjtBQUNELFdBQU8sVUFBVSxDQUFDO0dBQ25CO0FBQ0QsZUFBYSxFQUFFLFNBQVMsYUFBYSxDQUFFLEVBQUUsRUFBRTtBQUN6QyxRQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFFLFNBQVMsQ0FBRSxJQUFJLFNBQVMsQ0FBQztBQUM1QyxXQUFPLFVBQVUsR0FBRyxHQUFHLENBQUM7R0FDekI7Q0FDRixDQUFDOzs7QUNuTEYsQUFBQyxDQUFBLFVBQVUsTUFBTSxFQUFFLE9BQU8sRUFBRzs7QUFFNUIsS0FBSyxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxNQUFNLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRztBQUN2RSxRQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQy9CLE9BQU8sQ0FBRSxNQUFNLEVBQUUsSUFBSSxDQUFFLEdBQ3ZCLFVBQVUsQ0FBQyxFQUFHO0FBQ2IsT0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUc7QUFDbEIsVUFBTSxJQUFJLEtBQUssQ0FBRSxtQ0FBbUMsQ0FBRSxDQUFDO0lBQ3ZEO0FBQ0QsVUFBTyxPQUFPLENBQUUsQ0FBQyxDQUFFLENBQUM7R0FDcEIsQ0FBQztFQUNILE1BQU07QUFDTixTQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7RUFDbEI7O0NBRUQsQ0FBQSxDQUFDLE9BQU8sTUFBTSxLQUFLLFdBQVcsR0FBRyxNQUFNLFlBQU8sRUFBRSxVQUFVLE1BQU0sRUFBRSxRQUFRLEVBQUc7QUFDN0UsS0FBSSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQWEsSUFBSSxFQUFFO0FBQy9CLE1BQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNwQixhQUFXLEdBQUcsSUFBSSxvQkFBb0IsQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUMvQyxhQUFXLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUNsRCxhQUFXLEdBQUcsSUFBSSxtQkFBbUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUNwRCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEQsY0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUUsV0FBVyxDQUFFLENBQUM7R0FDOUM7QUFDRixTQUFPLFdBQVcsQ0FBQztFQUNwQixDQUFDO0FBQ0YsS0FBSyxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUc7QUFDdEMsUUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7RUFDN0I7O0FBRUQsUUFBTyxTQUFTLENBQUM7Q0FFakIsQ0FBQyxDQUFFIiwiZmlsZSI6ImNsaWNrYWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBDbGlja2FibGVDYXV0aW9ucyA9IGZ1bmN0aW9uKCBjb25zdHJ1Y3RlZCApe1xuXHR2YXIgaSA9IHRoaXMuZm9ybWF0Q29uc3RydWN0ZWQoIGNvbnN0cnVjdGVkICk7XG5cdFx0XHRpLndhcm4gPSB0aGlzLndhcm4uYmluZCggaSApO1xuXHRcdFx0aS53YXJuKCk7XG5cdHJldHVybiBpO1xufTtcbkNsaWNrYWJsZUNhdXRpb25zLnByb3RvdHlwZSA9IHtcbiAgZm9ybWF0Q29uc3RydWN0ZWQ6IGZ1bmN0aW9uIGZvcm1hdENvbnN0cnVjdGVkKCBjb25zdHJ1Y3RlZCApe1xuICAgIHZhciBpICA9IGNvbnN0cnVjdGVkIHx8IHt9O1xuICAgICAgICBpLndhcm5pbmdzID0gaS53YXJuaW5ncyB8fCBbXTtcbiAgICAgICAgaWYoIGNvbnN0cnVjdGVkID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgIGkud2FybmluZ3MucHVzaCgnbmVlZHMgYSB2YWxpZCBjbGlja2FibGUgY29uc3RydWN0b3IgdG8gZG8gYW55dGhpbmcnKTtcbiAgICAgICAgICB0aGlzLndhcm4uY2FsbCggaSApO1xuICAgICAgICAgIHJldHVybiBpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTtcbiAgfSwgIFxuICB3YXJuOiBmdW5jdGlvbiB3YXJuKCl7XG4gICAgZm9yKCBsZXQgaiA9IDA7IGo8IHRoaXMud2FybmluZ3MubGVuZ3RoOyBqKysgKXtcbiAgICAgIGNvbnNvbGUud2FybiggdGhpcy53YXJuaW5nc1tqXSApO1xuICAgIH1cbiAgfVxufTsiLCJ2YXIgQ2xpY2thYmxlQ29uc3RydWN0b3IgPSBmdW5jdGlvbiggYXJncywgYXV0bz10cnVlICl7XG4gIGxldCBkZWZhdWx0cyA9IHtcbiAgICB3cmFwcGVyOiAnLmpzLWNsaWNrYWJsZS1pbnRlcmFjdGlvbicsXG4gICAgY29udGVudDogJy5qcy1jbGlja2FibGUtY29udGVudC1hcmVhJyxcbiAgICBpbmRpY2F0b3JzOiAnLmpzLWNsaWNrYWJsZS1pbmRpY2F0b3InLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIHRhcmdldHM6ICcuanMtY2xpY2thYmxlLXRhcmdldCcsXG4gICAgICBwcmV2OiAnLmpzLWNsaWNrYWJsZS1wcmV2JyxcbiAgICAgIG5leHQ6ICcuanMtY2xpY2thYmxlLW5leHQnLFxuICAgIH0sXG4gICAgbWV0YToge1xuICAgICAgY2xlYXI6ICcuanMtY2xpY2thYmxlLWNsZWFyJyxcbiAgICAgIHN0YXJ0OiAnLmpzLWNsaWNrYWJsZS1zdGFydCcsXG4gICAgfSxcbiAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICB0b2dnbGU6IGZhbHNlXG4gIH07ICBcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggZGVmYXVsdHMgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMubWVyZ2VBcmdzKCB0aGlzLmNvbnN0cnVjdGVkLCBhcmdzICk7XG4gIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLnNldERlZmF1bHRzKCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gIGlmKCBhdXRvICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICAgIHRoaXMuY29uc3RydWN0ZWQudG90YWwgPSB0aGlzLmNvbnN0cnVjdGVkLmNvbnRlbnRBcmVhcy5sZW5ndGggfHwgMDtcbiAgfVxuICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RlZDtcbn07XG5DbGlja2FibGVDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XG4gIG1lcmdlQXJnczogZnVuY3Rpb24gbWVyZ2VBcmdzKCBkZWZhdWx0cywgb3ZlcnJpZGUgKXtcbiAgICB2YXIgaSA9IHt9O1xuICAgIGZvciggbGV0IGF0dHIgaW4gZGVmYXVsdHMgKXtcbiAgICAgIGlbIGF0dHIgXSA9IGRlZmF1bHRzWyBhdHRyIF07XG4gICAgfVxuICAgIGZvciggbGV0IGF0dHIgaW4gb3ZlcnJpZGUgKXtcbiAgICAgIGlmKCBkZWZhdWx0c1sgYXR0ciBdICE9PSB1bmRlZmluZWQgKXtcbiAgICAgICAgaVsgYXR0ciBdID0gb3ZlcnJpZGVbIGF0dHIgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIHNldERlZmF1bHRzOiBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgICB2YXIgaSA9IGNvbnN0cnVjdGVkO1xuICAgIGkuX2luZGV4ID0gMDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGkuX2luZGV4O1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gaS5faW5kZXggPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXhQcmVmaXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsICAgICAgXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9KTsgIFxuICAgIGkuX3RvdGFsID0gMDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICd0b3RhbCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgICAgICBcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGkuX3RvdGFsO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gaS5fdG90YWwgPSB2YWw7XG4gICAgICB9XG4gICAgfSk7ICAgIFxuICAgIGkuZ2V0ID0gdGhpcy5nZXREZXB0aDtcbiAgICBpLmdldEluZGV4ID0gdGhpcy5nZXRJbmRleDtcbiAgICBpLmluaXRCdWZmZXIgPSBbXTsgIFxuICAgIHJldHVybiBpOyAgICBcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24oIGNvbnN0cnVjdGVkICl7XG4gICAgdmFyIGkgPSBjb25zdHJ1Y3RlZDtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBXcmFwcGVyKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwQ29udGVudCggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXR1cE5hdmlnYXRpb24oIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBJbmRpY2F0b3JzKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwTWV0YUNvbnRyb2xzKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldE9uQ2xpY2tzKCBpICk7XG4gICAgICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cFdyYXBwZXI6IGZ1bmN0aW9uKCBpICl7XG4gICAgaS5pbnRlcmFjdGlvbiA9ICQoIGkud3JhcHBlciApO1xuICAgIHZhciBpbnRlcmFjdGlvbkNvdW50ID0gaS5pbnRlcmFjdGlvbi5sZW5ndGggfHwgMDtcbiAgICBpZiggaW50ZXJhY3Rpb25Db3VudCA8IDEgKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbm8gaW50ZXJhY2l0b24gZm91bmQnKVxuICAgIH1cbiAgICBpZiggaW50ZXJhY3Rpb25Db3VudCA+IDEgKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbXVsdGlwbGUgaW50ZXJhY3Rpb25zIGZvdW5kJylcbiAgICB9XG4gICAgaS53YXJuKCk7ICAgIFxuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cENvbnRlbnQ6IGZ1bmN0aW9uKCBpICl7XG4gICAgaS5jb250ZW50QXJlYXMgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLmNvbnRlbnQgKTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0dXBJbmRpY2F0b3JzOiBmdW5jdGlvbiggaSApe1xuICAgIHZhciBjb250ZW50Q291bnQsIGluZGljYXRvckNvdW50O1xuICAgIGkuaW5kaWNhdG9ycyA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkuaW5kaWNhdG9ycyApO1xuXG4gICAgY29udGVudENvdW50ID0gaS5jb250ZW50QXJlYXMubGVuZ3RoIHx8IDA7XG4gICAgaW5kaWNhdG9yQ291bnQgPSBpLmluZGljYXRvcnMubGVuZ3RoIHx8IDA7ICAgIFxuXG4gICAgaWYoIGNvbnRlbnRDb3VudCArIGluZGljYXRvckNvdW50IDwgMSl7XG4gICAgICBpLndhcm5pbmdzLnB1c2goJ25vIGNvbnRlbnQgZm91bmQnKTtcbiAgICB9XG4gICAgaS53YXJuKCk7XG4gICAgcmV0dXJuIGk7IFxuICB9LFxuICBzZXR1cE5hdmlnYXRpb246IGZ1bmN0aW9uKCBpICl7XG4gICAgdmFyIHByZXZDb3VudCwgbmV4dENvdW50LCB0YXJnZXRDb3VudDtcbiAgICBpLm5hdmlnYXRpb24udGFyZ2V0cz0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnRhcmdldHMgKTtcbiAgICBpLm5hdmlnYXRpb24ucHJldiAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnByZXYgKTtcbiAgICBpLm5hdmlnYXRpb24ubmV4dCAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLm5leHQgKTtcblxuICAgIHByZXZDb3VudCA9IGkubmF2aWdhdGlvbi5wcmV2Lmxlbmd0aCB8fCAwO1xuICAgIG5leHRDb3VudCA9IGkubmF2aWdhdGlvbi5uZXh0Lmxlbmd0aCB8fCAwOyBcbiAgICB0YXJnZXRDb3VudCA9IGkubmF2aWdhdGlvbi50YXJnZXRzLmxlbmd0aCB8fCAwOyBcblxuICAgIGlmKCBwcmV2Q291bnQgKyBuZXh0Q291bnQgKyB0YXJnZXRDb3VudCA8IDEgKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbm8gbmF2aWdhdGlvbiBmb3VuZCcpO1xuICAgIH1cbiAgICBpLndhcm4oKTtcbiAgICByZXR1cm4gaTsgXG4gIH0sXG4gIHNldE9uQ2xpY2tzOiBmdW5jdGlvbiggaSApe1xuICAgIGZvciggdmFyIG5hdiBpbiBpLm5hdmlnYXRpb24gKSB7XG4gICAgICBpZiggaS5uYXZpZ2F0aW9uWyBuYXYgXSAhPT0gZmFsc2UgKXtcbiAgICAgICAgaS5uYXZpZ2F0aW9uWyBuYXYgXS5wcmVjbGljayA9IFtdOyAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9LFxuICBnZXRJbmRleDogZnVuY3Rpb24gZ2V0SW5kZXgoIGMsIHMsIGVsKXtcbiAgICByZXR1cm4gdGhpcy5nZXQoYywgcykuaW5kZXgoZWwpO1xuICB9LFxuICBzZXR1cE1ldGFDb250cm9sczogZnVuY3Rpb24oIGkgKXtcbiAgICBpLm5hdmlnYXRpb24uY2xlYXIgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuY2xlYXIgKTtcbiAgICBpLm5hdmlnYXRpb24uc3RhcnQgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuc3RhcnQgKTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgZmluZEluSW50ZXJhY3Rpb246IGZ1bmN0aW9uKCBpLCBzZWxlY3RvciApe1xuICAgIGlmKCAkKCBpLmludGVyYWN0aW9uICkuZmluZCggc2VsZWN0b3IgKS5sZW5ndGggPiAwICl7XG4gICAgICByZXR1cm4gJCggaS5pbnRlcmFjdGlvbiApLmZpbmQoIHNlbGVjdG9yICk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZ2V0RGVwdGg6IGZ1bmN0aW9uIGdldERlcHRoKCBjLCBzICl7XG4gICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzWyBjIF07ICAgIFxuICAgIGlmKCBzICE9PSB1bmRlZmluZWQgKXtcbiAgICAgIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uWyBzIF07XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9LCAgXG59OyIsInZhciBDbGlja2FibGVDb250cm9sbGVyID0gZnVuY3Rpb24oIGNvbnN0cnVjdG9yICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggY29uc3RydWN0b3IgKTtcbiAgICB0aGlzLmV4dGVuZC5jYWxsKCB0aGlzLmNvbnN0cnVjdGVkLCB0aGlzICkgIDtcbiAgICB0aGlzLmNvbnN0cnVjdGVkLmluaXQoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RlZDsgIFxufTtcbkNsaWNrYWJsZUNvbnRyb2xsZXIucHJvdG90eXBlID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKCBvYmogKXtcbiAgICBmb3IoIHZhciBhdHRyIGluIG9iaiApe1xuICAgICAgaWYoIG9iai5oYXNPd25Qcm9wZXJ0eSggYXR0ciApID09PSBmYWxzZSApe1xuICAgICAgICB0aGlzWyBhdHRyIF0gPSBvYmpbIGF0dHIgXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIFxuICBpbml0OiBmdW5jdGlvbigpe1xuICAgIHRoaXMubmF2aWdhdGlvbi50eXBlID0gJ2luaXRpYWwnO1xuICAgIHRoaXMuc2V0dXBFdmVudHMoICk7XG4gICAgdGhpcy5zdGFydFNjcmVlbiggKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgc3RhcnRTY3JlZW46IGZ1bmN0aW9uKCApe1xuICAgIGlmKCB0aGlzLm5hdmlnYXRpb24uc3RhcnQgKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5nb1RvKCAwICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGdvVG86IGZ1bmN0aW9uKCBpbmRleCApe1xuICAgIHRoaXMuaW5kZXggPSBpbmRleDsgICAgICBcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMubWFrZUFjdGl2ZSgpO1xuICB9LFxuICBwcmV2OiBmdW5jdGlvbigpe1xuICAgIHRoaXMuZGVjcmVtZW50SW5kZXgoKTtcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMubWFrZUFjdGl2ZSgpO1xuICB9LFxuICBuZXh0OiBmdW5jdGlvbigpe1xuICAgIHRoaXMuaW5jcmVtZW50SW5kZXgoKTsgICAgXG4gICAgdGhpcy5tYWtlQWxsSW5hY3RpdmUoKTtcbiAgICB0aGlzLm1ha2VBY3RpdmUoKTtcbiAgfSxcbiAgcmVzZXQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5tYWtlQWxsSW5hY3RpdmUoKTtcbiAgICB0aGlzLmNsZWFyTmF2aWdhdGlvblR5cGUoKTtcbiAgICBjb25zb2xlLmxvZygnaGVsbG8nKSAgICAgICAgXG4gIH0sICBcbiAgZGVjcmVtZW50SW5kZXg6IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy5pbmRleCAgPiAwKXtcbiAgICAgIHRoaXMuaW5kZXggIC0tO1xuICAgIH1lbHNlIGlmKHRoaXMuaW5maW5pdGUpe1xuICAgICAgdGhpcy5pbmRleCAgPSB0aGlzLnRvdGFsIC0xO1xuICAgIH1cbiAgfSxcbiAgaW5jcmVtZW50SW5kZXg6IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy5pbmRleCAgPCB0aGlzLnRvdGFsIC0xKXtcbiAgICAgIHRoaXMuaW5kZXggICsrOyAgICAgIFxuICAgIH0gZWxzZSBpZih0aGlzLmluZmluaXRlKSB7XG4gICAgICB0aGlzLmluZGV4ICA9IDA7XG4gICAgfVxuICB9LFxuICBzZXR1cEV2ZW50czogZnVuY3Rpb24gc2V0dXBFdmVudHMoaSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKCB0aGlzLmdldCgnbmF2aWdhdGlvbicsICdwcmV2JykgKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2VsZi5jYWxsUHJlY2xpY2tGdW5jcyggJ3ByZXYnLCAkKHRoaXMpICk7XG4gICAgICBzZWxmLnByZXYoKTtcbiAgICAgIHNlbGYuc2V0TmF2aWdhdGlvblR5cGUoICdsaW5lYXInICk7XG4gICAgfSk7XG4gICAgJCh0aGlzLmdldCgnbmF2aWdhdGlvbicsICduZXh0JykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCAnbmV4dCcsICQodGhpcykgKTsgICAgIFxuICAgICAgc2VsZi5uZXh0KCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQodGhpcy5nZXQoJ25hdmlnYXRpb24nLCAnY2xlYXInKSkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgICAgICBcbiAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICdjbGVhcicsICQodGhpcykgKTtcbiAgICAgIHNlbGYucmVzZXQoKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3N0YXJ0JykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCAnc3RhcnQnLCAkKHRoaXMpICk7XG4gICAgICBzZWxmLmdvVG8oMCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQoIHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnKSApLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICd0YXJnZXRzJywgJCh0aGlzKSApO1xuICAgICAgICBzZWxmLmdvVG8oIHNlbGYuZ2V0SW5kZXgoJ25hdmlnYXRpb24nLCAndGFyZ2V0cycsIHRoaXMpICk7XG4gICAgICAgIHNlbGYuc2V0TmF2aWdhdGlvblR5cGUoICd0YXJnZXR0ZWQnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgY2FsbFByZWNsaWNrRnVuY3M6IGZ1bmN0aW9uIGNhbGxQcmVjbGlja0Z1bmNzKCBuYXZUeXBlLCBlbCApe1xuICAgIHZhciBidWZmZXIgPSB0aGlzLmdldCgnbmF2aWdhdGlvbicsIG5hdlR5cGUgKS5wcmVjbGljaztcbiAgICBmb3IobGV0IGZ1bmMgaW4gYnVmZmVyICl7XG4gICAgICBidWZmZXJbZnVuY10uY2FsbCggdGhpcywgZWwgKTtcbiAgICB9ICBcbiAgfSxcbiAgc2V0TmF2aWdhdGlvblR5cGU6IGZ1bmN0aW9uKHR5cGUpe1xuICAgIHRoaXMuY2xlYXJOYXZpZ2F0aW9uVHlwZSgpO1xuICAgIHRoaXMubmF2aWdhdGlvbi50eXBlID0gdHlwZTtcbiAgICB0aGlzLmFkZENsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sIHRoaXMubmF2aWdhdGlvbi50eXBlKTtcbiAgICBpZih0eXBlICE9PSAnc3RhcnQnKXtcbiAgICAgIHRoaXMuYWRkQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgJ25hdmlnYXRlZCcpO1xuICAgIH1cblxuICB9LFxuICBjbGVhck5hdmlnYXRpb25UeXBlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgdGhpcy5uYXZpZ2F0aW9uLnR5cGUpO1xuICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgJ25hdmlnYXRlZCcpO1xuICB9LFxuICBtYWtlQWN0aXZlOiBmdW5jdGlvbigpe1xuICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGFyZWFzID0gdGhpcy5nZXQoICdjb250ZW50QXJlYXMnICksXG4gICAgICAgIGluZGljYXRvcnMgPSB0aGlzLmdldCggJ2luZGljYXRvcnMnICksXG4gICAgICAgIGNvdW50MSA9IGFyZWFzLmxlbmd0aCB8fCAwLFxuICAgICAgICBjb3VudDIgPSBpbmRpY2F0b3JzLmxlbmd0aCB8fCAwO1xuXG4gICAgaWYoICF0aGlzLmlzVG9nZ2xlIHx8IGFyZWFzLmFjdGl2ZSAhPT0gaW5kZXggKXtcbiAgICAgIHRoaXMuYWRkSW50ZXJhY3Rpb25BY3RpdmVDbGFzcygpOyAgICAgIFxuICAgICAgaWYoIGFyZWFzLmxlbmd0aCA+IDAgKSB7IFxuICAgICAgICB0aGlzLmFkZENsYXNzU1ZHKCBhcmVhc1sgaW5kZXggXSwgJ2FjdGl2ZScgKTtcbiAgICAgICAgdGhpcy5hZGRDbGFzc1NWRyggYXJlYXNbIGluZGV4IF0sICdqcy1hY3RpdmUnICk7XG4gICAgICAgIGFyZWFzLmFjdGl2ZSA9IGluZGV4IDsgICAgICAgIFxuICAgICAgfVxuICAgICAgaWYoIGluZGljYXRvcnMubGVuZ3RoID4gMCApeyBcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggaW5kaWNhdG9yc1sgaW5kZXggXSwgJ3Zpc2l0ZWQnICk7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcoIGluZGljYXRvcnNbIGluZGV4IF0sICdqcy12aXNpdGVkJyApO1xuICAgICAgICB0aGlzLmFkZENsYXNzU1ZHKCBpbmRpY2F0b3JzWyBpbmRleCBdLCAnYWN0aXZlJyApO1xuICAgICAgICB0aGlzLmFkZENsYXNzU1ZHKCBpbmRpY2F0b3JzWyBpbmRleCBdLCAnanMtYWN0aXZlJyApO1xuICAgICAgfVxuICAgICAgaWYoIGNvdW50MSArIGNvdW50MiA8IDEgKXtcbiAgICAgICAgdGhpcy53YXJuaW5ncy5wdXNoKCdubyBjb250ZW50IHRvIGFjdGl2YXRlJyk7XG4gICAgICAgIHRoaXMud2FybigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhcmVhcy5hY3RpdmUgPSBmYWxzZTtcbiAgfSxcbiAgbWFrZUFsbEluYWN0aXZlOiBmdW5jdGlvbigpe1xuICAgIHZhciBhcmVhcyA9IHRoaXMuZ2V0KCAnY29udGVudEFyZWFzJyApLFxuICAgICAgICBpbmRpY2F0b3JzID0gdGhpcy5nZXQoICdpbmRpY2F0b3JzJyApO1xuICAgIGlmKCBhcmVhcy5sZW5ndGggKXtcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcoIGFyZWFzLCAnYWN0aXZlJyApO1xuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggYXJlYXMsICdqcy1hY3RpdmUnICk7XG4gICAgfVxuICAgIGlmKCBpbmRpY2F0b3JzLmxlbmd0aCApe1xuICAgICAgdGhpcy5tYWtlSW5kaWNhdG9yVmlzaXRlZCgpOyAgIFxuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggaW5kaWNhdG9ycywgJ2FjdGl2ZScgKTtcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcoIGluZGljYXRvcnMsICdqcy1hY3RpdmUnICk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlSW50ZXJhY3Rpb25BY3RpdmVDbGFzcygpO1xuICB9LFxuICBhZGRJbnRlcmFjdGlvbkFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMuYWRkQ2xhc3NTVkcoIHRoaXMuaW50ZXJhY3Rpb24sICdhY3RpdmUtJyArIHRoaXMuaW5kZXhQcmVmaXggKyB0aGlzLmluZGV4ICk7XG4gIH0sXG4gIHJlbW92ZUludGVyYWN0aW9uQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCl7XG4gICAgZm9yKHZhciBpID0gMDsgaTwgdGhpcy50b3RhbDsgaSsrKXtcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgJ2FjdGl2ZS0nKyB0aGlzLmluZGV4UHJlZml4ICsgaSApO1xuICAgIH1cbiAgfSxcbiAgbWFrZUluZGljYXRvclZpc2l0ZWQ6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQoIHRoaXMuZ2V0KCAnaW5kaWNhdG9ycycgKSApLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGlmKCQodGhpcykuYXR0cignY2xhc3MnKS5pbmRleE9mKCdqcy1hY3RpdmUnKSA+IDAgKSB7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3NTVkcodGhpcywgJ3Zpc2l0ZWQnKTtcbiAgICAgICAgc2VsZi5hZGRDbGFzc1NWRyh0aGlzLCAnanMtdmlzaXRlZCcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBhZGRDbGFzc1NWRzogZnVuY3Rpb24oZWxlbSwgbmV3Q2xhc3Mpe1xuICAgIGlmKCBlbGVtID09IHVuZGVmaW5lZCApe1xuICAgICAgcmV0dXJuO1xuICAgIH0gICAgICBcbiAgICBpZihlbGVtLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy5hZGRNdWx0aXBsZUNsYXNzZXMoZWxlbSwgbmV3Q2xhc3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZFNpbmd1bGFyQ2xhc3MoZWxlbSwgbmV3Q2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgYWRkU2luZ3VsYXJDbGFzczogZnVuY3Rpb24oZWxlbSwgbmV3Q2xhc3Mpe1xuICAgIGlmKCBlbGVtID09PSB1bmRlZmluZWQgKXsgcmV0dXJuOyB9ICAgIFxuICAgIHZhciB0ZW1wQ2xhc3MgPSAkKGVsZW0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgJChlbGVtKS5hdHRyKCdjbGFzcycsIHRlbXBDbGFzcyArICcgJyArbmV3Q2xhc3MpO1xuICB9LFxuICBhZGRNdWx0aXBsZUNsYXNzZXM6IGZ1bmN0aW9uKGVsZW1zLCBuZXdDbGFzcyl7XG4gICAgdmFyIHRlbXBDbGFzcztcbiAgICBmb3IodmFyIGkgPSAwOyBpPCBlbGVtcy5sZW5ndGg7IGkrKyl7XG4gICAgICB0ZW1wQ2xhc3MgPSAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycpO1xuICAgICAgJChlbGVtc1tpXSkuYXR0cignY2xhc3MnLCB0ZW1wQ2xhc3MgKyAnICcgK25ld0NsYXNzKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUNsYXNzU1ZHOiBmdW5jdGlvbihlbGVtLCByZW1vdmVkQ2xhc3Mpe1xuICAgIGlmKCBlbGVtID09IHVuZGVmaW5lZCApe1xuICAgICAgcmV0dXJuO1xuICAgIH0gICAgXG4gICAgaWYoZWxlbS5sZW5ndGggPiAwKXtcbiAgICAgIHRoaXMucmVtb3ZlTXVsdGlwbGVDbGFzc2VzKGVsZW0sIHJlbW92ZWRDbGFzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlU2luZ3VsYXJDbGFzcyhlbGVtLCByZW1vdmVkQ2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlU2luZ3VsYXJDbGFzczogZnVuY3Rpb24oZWxlbSwgcmVtb3ZlZENsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzID0gJChlbGVtKS5hdHRyKCdjbGFzcycpO1xuICAgIHZhciBuZXdDbGFzcyAgPSB0ZW1wQ2xhc3MucmVwbGFjZSgnICcrcmVtb3ZlZENsYXNzLCAnJyk7XG4gICAgJChlbGVtKS5hdHRyKCdjbGFzcycsIG5ld0NsYXNzKTtcbiAgfSxcbiAgcmVtb3ZlTXVsdGlwbGVDbGFzc2VzOiBmdW5jdGlvbihlbGVtcywgcmVtb3ZlZENsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzLCBuZXdDbGFzcztcbiAgICBmb3IodmFyIGkgPSAwOyBpPCBlbGVtcy5sZW5ndGg7IGkrKyl7XG4gICAgICB0ZW1wQ2xhc3MgPSAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycpO1xuICAgICAgbmV3Q2xhc3MgID0gdGVtcENsYXNzLnJlcGxhY2UoJyAnK3JlbW92ZWRDbGFzcywgJycpO1xuICAgICAgJChlbGVtc1tpXSkuYXR0cignY2xhc3MnLCBuZXdDbGFzcyk7XG4gICAgfVxuICB9LCAgXG59OyIsInZhciBDbGlja2FibGVDb250ZXh0ID0gZnVuY3Rpb24oIGNvbnN0cnVjdGVkICl7XG4gIHRoaXMuY29uc3RydWN0ZWQgPSBuZXcgQ2xpY2thYmxlQ2F1dGlvbnMoIGNvbnN0cnVjdGVkICk7XG4gIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLmluaXQoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgaWYoIHRoaXMuY29uc3RydWN0ZWQuY29udGV4dCApe1xuICAgIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLnNvcnRDb2xsZWN0aW9ucyggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICAgIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLm92ZXJyaWRlRGVmYXVsdHMoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmNvbnN0cnVjdGVkO1xufTtcblxuQ2xpY2thYmxlQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoIGkgKXtcbiAgICBpID0gdGhpcy5zZXRJbml0aWFsRGF0YSggaSApO1xuICAgIGkgPSB0aGlzLnNldFRvdGFsRGF0YSggaSApO1xuICAgIGkgPSB0aGlzLnNldEluZGV4RGF0YSggaSApO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBvdmVycmlkZURlZmF1bHRzOiBmdW5jdGlvbiBvdmVycmlkZURlZmF1bHRzKCBpICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXgnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleFsgdGhpcy5jb250ZXh0IF07XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleFsgdGhpcy5jb250ZXh0IF0gPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXhQcmVmaXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsICAgICAgXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQgKyAnLSc7XG4gICAgICB9XG4gICAgfSk7IFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3RvdGFsJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdID0gdmFsO1xuICAgICAgfVxuICAgIH0pOyAgICBcbiAgICBpLmdldCA9IHRoaXMuZ2V0Q29udGV4dERlcHRoO1xuICAgIGkuZ2V0SW5kZXggPSB0aGlzLmdldENvbnRleHRJbmRleDtcbiAgICBpLmluaXRCdWZmZXIucHVzaCggdGhpcy5jb250ZXh0SW5pdCApO1xuICAgIHJldHVybiBpOyAgXG4gIH0sXG4gIGNvbnRleHRJbml0OiBmdW5jdGlvbiBjb250ZXh0SW5pdCgpe1xuICAgIGlmKCB0aGlzLl90b3RhbC5oYXNPd25Qcm9wZXJ0eSgnY29udGV4dF9kZWZhdWx0Jykpe1xuICAgICAgdGhpcy5jb250ZXh0ID0gJ2NvbnRleHRfZGVmYXVsdCc7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvcih2YXIgZmlyc3QgaW4gdGhpcy5fdG90YWwpe1xuICAgICAgdGhpcy5jb250ZXh0ID0gZmlyc3Q7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH0sXG4gIHNldEluaXRpYWxEYXRhOiBmdW5jdGlvbiBzZXRJbml0aWFsZGF0YSggaSApe1xuICAgIGkuY29udGV4dCA9IGZhbHNlO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBmaW5kQ29udGV4dENvdW50OiBmdW5jdGlvbiBmaW5kQ29udGV4dENvdW50KCBlbCApe1xuICAgIHZhciBpbmRpY2VzID0ge30sIHNlbGYgPSB0aGlzO1xuICAgICQoIGVsICkuZWFjaCggZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjID0gJCh0aGlzKS5kYXRhKCdjb250ZXh0Jyk7XG4gICAgICBpbmRpY2VzID0gc2VsZi5hZGRUb09ySW5pdCggaW5kaWNlcywgYyApO1xuICAgIH0pO1xuICAgIHJldHVybiBpbmRpY2VzO1xuICB9LFxuICBtZXJnZUZvck1heDogZnVuY3Rpb24gbWVyZ2VGb3JNYXgoIG9iajEsIG9iajIgKXtcbiAgICB2YXIgbWVyZ2VkID0gb2JqMTtcbiAgICBmb3IoIHZhciBwcm9wIGluIG9iajIgKXtcbiAgICAgIGlmKCBtZXJnZWRbcHJvcF0gPT09IHVuZGVmaW5lZCB8fCBtZXJnZWRbcHJvcF0gPCBvYmoyW3Byb3BdKXtcbiAgICAgICAgbWVyZ2VkW3Byb3BdID0gb2JqMltwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfSxcbiAgc2V0VG90YWxEYXRhOiBmdW5jdGlvbiBzZXRUb3RhbERhdGEoIGkgKXtcbiAgICB2YXIgY29udGVudHMgPSB0aGlzLmZpbmRDb250ZXh0Q291bnQoIGkuY29udGVudEFyZWFzICk7XG4gICAgdmFyIGluZGljYXRvcnMgPSB0aGlzLmZpbmRDb250ZXh0Q291bnQoIGkuaW5kaWNhdG9ycyApO1xuICAgIHZhciBjb250ZXh0cyA9IHRoaXMubWVyZ2VGb3JNYXgoIGNvbnRlbnRzLCBpbmRpY2F0b3JzICk7XG4gICAgZm9yKCB2YXIgY29udGV4dCBpbiBjb250ZXh0cyApe1xuICAgICAgaWYoIGNvbnRleHQgIT09ICdjb250ZXh0X2RlZmF1bHQnICl7XG4gICAgICAgIGkuY29udGV4dCA9IHRydWU7XG4gICAgICAgIGkuX3RvdGFsID0gY29udGV4dHM7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0SW5kZXhEYXRhOiBmdW5jdGlvbiBzZXRJbmRleERhdGEoIGkgKXtcbiAgICBpZiggIWkuY29udGV4dCApe1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICAgIGkuX2luZGV4ID0ge307XG4gICAgZm9yKCB2YXIgY29udGV4dCBpbiBpLnRvdGFsICl7XG4gICAgICBpLl9pbmRleFsgY29udGV4dCBdID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGFkZFRvT3JJbml0OiBmdW5jdGlvbiBhZGRUb09ySW5pdCggb2JqLCBwcm9wICl7XG4gICAgdmFyIHByb3BlcnR5ID0gcHJvcCB8fCAnZGVmYXVsdCc7XG4gICAgdmFyIGtleSA9ICdjb250ZXh0XycgKyBwcm9wZXJ0eTtcbiAgICBpZiggb2JqLmhhc093blByb3BlcnR5KCBrZXkgKSApe1xuICAgICAgb2JqWyBrZXkgXSArPSAxO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgb2JqWyBrZXkgXSA9IDE7XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgc29ydENvbGxlY3Rpb25zOiBmdW5jdGlvbiBzb3J0Q29sbGVjdGlvbnMoIGkgKXtcbiAgICBpLmNvbnRlbnRBcmVhcyA9IHRoaXMuY29udGV4dFNvcnQoIGksICdjb250ZW50QXJlYXMnICk7ICBcbiAgICBpLmluZGljYXRvcnMgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnaW5kaWNhdG9ycycgKTtcbiAgICBpLm5hdmlnYXRpb24udGFyZ2V0cyA9IHRoaXMuY29udGV4dFNvcnQoIGksICduYXZpZ2F0aW9uJywgJ3RhcmdldHMnICk7XG4gICAgaS5uYXZpZ2F0aW9uLnByZXYgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnbmF2aWdhdGlvbicsICdwcmV2JyApOyAgICBcbiAgICBpLm5hdmlnYXRpb24ubmV4dCA9IHRoaXMuY29udGV4dFNvcnQoIGksICduYXZpZ2F0aW9uJywgJ25leHQnICk7XG4gICAgdGhpcy53YXJuQWJvdXROYXZpZ2F0aW9uKCBpICk7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGNvbnRleHRTb3J0OiBmdW5jdGlvbiBjb250ZXh0U29ydCggaSwgY29sbGVjdGlvbiwgc3ViICl7XG4gICAgdmFyIGFsbCA9IGkuZ2V0KCBjb2xsZWN0aW9uLCBzdWIgKSxcbiAgICAgICAgc2VsZiA9IHRoaXMsIFxuICAgICAgICBvbmNsaWNrO1xuICAgIGlmKCBhbGwgKXsgb25jbGljayA9IGFsbC5wcmVjbGljazsgfVxuXG4gICAgJChhbGwpLmZpbHRlciggZnVuY3Rpb24oKXtcblxuICAgICAgcmV0dXJuICQodGhpcyk7XG5cbiAgICB9ICkuZWFjaCggZnVuY3Rpb24oKXtcblxuICAgICAgdmFyIGMgPSBzZWxmLnNldENvbnRleHRLZXkoICQodGhpcykgKTtcbiAgICAgIGlmKCBhbGxbY10gPT09IHVuZGVmaW5lZCApe1xuICAgICAgICBhbGxbY10gPSAkKCk7XG4gICAgICB9XG4gICAgICAkKHRoaXMpLmRhdGEoJ2luZGV4JywgYWxsW2NdLmxlbmd0aCk7XG4gICAgICBhbGxbY10gPSAkKGFsbFtjXSkuYWRkKCAkKHRoaXMpICk7XG4gICAgfSk7XG4gICAgaWYoIG9uY2xpY2sgKXsgYWxsLnByZWNsaWNrID0gb25jbGljaztcbiAgICAgICAgICAgICAgICAgICBhbGwucHJlY2xpY2sucHVzaChzZWxmLnBhcnNlQ29udGV4dCApOyB9XG4gICAgcmV0dXJuIGFsbDtcbiAgfSxcbiAgd2FybkFib3V0TmF2aWdhdGlvbjogZnVuY3Rpb24gd2FybkFib3V0TmF2aWdhdGlvbiggaSApe1xuICAgIGZvciggdmFyIGtleSBpbiBpLl9pbmRleCApe1xuICAgICAgaWYoIGkubmF2aWdhdGlvbi50YXJnZXRzWyBrZXkgXSA9PT0gdW5kZWZpbmVkICYmIFxuICAgICAgICBpLm5hdmlnYXRpb24ucHJldlsga2V5IF0gPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICBpLm5hdmlnYXRpb24ubmV4dFsga2V5IF0gPT09IHVuZGVmaW5lZCApe1xuICAgICAgICBpLndhcm5pbmdzLnB1c2goYHRoZXJlIGlzIG5vIG5hdmdhdGlvbiBmb3IgdGhlIGNvbnRleHQgJHtrZXl9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGkud2FybigpO1xuICB9LFxuICBwYXJzZUNvbnRleHQ6IGZ1bmN0aW9uIHBhcnNlQ29udGV4dCggZWwgKXtcbiAgICBpZiggZWwgIT09IHVuZGVmaW5lZCAmJiAkKCBlbCApLmRhdGEoJ2NvbnRleHQnKSApe1xuICAgICAgdGhpcy5jb250ZXh0ID0gJ2NvbnRleHRfJyArICQoIGVsICkuZGF0YSggJ2NvbnRleHQnICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY29udGV4dCA9ICdjb250ZXh0X2RlZmF1bHQnO1xuICB9LCAgXG4gIGdldENvbnRleHRJbmRleDogZnVuY3Rpb24gZ2V0Q29udGV4dEluZGV4KCBjLCBzLCBlbCl7XG4gICAgcmV0dXJuICQoZWwpLmRhdGEoJ2luZGV4Jyk7XG4gIH0sICBcbiAgZ2V0Q29udGV4dERlcHRoOiBmdW5jdGlvbiBnZXRDb250ZXh0RGVwdGgoIGMsIHMgKXtcbiAgICB2YXIgY29sbGVjdGlvbiA9IHRoaXNbIGMgXVsgdGhpcy5jb250ZXh0IF07XG4gICAgaWYoIHRoaXNbY11bdGhpcy5jb250ZXh0XSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuY29udGV4dCA9PT0gdHJ1ZSApe1xuICAgICAgY29sbGVjdGlvbiA9IHRoaXNbY107XG4gICAgICBpZihjb2xsZWN0aW9uID09PSBmYWxzZSl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9ICAgXG4gICAgaWYoIHMgIT09IHVuZGVmaW5lZCApe1xuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25bIHMgXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH0sXG4gIHNldENvbnRleHRLZXk6IGZ1bmN0aW9uIHNldENvbnRleHRLZXkoIGVsICl7XG4gICAgdmFyIGN0eCA9IGVsLmRhdGEoICdjb250ZXh0JyApIHx8ICdkZWZhdWx0JztcbiAgICByZXR1cm4gJ2NvbnRleHRfJyArIGN0eDtcbiAgfSBcbn07IiwiKGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG5cblx0aWYgKCB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnICkge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsLmRvY3VtZW50ID9cblx0XHRcdGZhY3RvcnkoIGdsb2JhbCwgdHJ1ZSApIDpcblx0XHRcdGZ1bmN0aW9uKCB3ICkge1xuXHRcdFx0XHRpZiAoICF3LmRvY3VtZW50ICkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggJ3JlcXVpcmVzIGEgd2luZG93IHdpdGggYSBkb2N1bWVudCcgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFjdG9yeSggdyApO1xuXHRcdFx0fTtcblx0fSBlbHNlIHtcblx0XHRmYWN0b3J5KCBnbG9iYWwgKTtcblx0fVxuXHQvLyBQYXNzIHRoaXMgaWYgd2luZG93IGlzIG5vdCBkZWZpbmVkIHlldFxufSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCB3aW5kb3csIG5vR2xvYmFsICkge1xuXHR2YXIgQ2xpY2thYmxlID0gZnVuY3Rpb24oIGFyZ3MgKXtcblx0XHR2YXIgY29uc3RydWN0ZWQgPSB7fTtcblx0ICBjb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDb25zdHJ1Y3RvciggYXJncyApO1xuXHQgIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnRleHQoIGNvbnN0cnVjdGVkICk7XG5cdCAgY29uc3RydWN0ZWQgPSBuZXcgQ2xpY2thYmxlQ29udHJvbGxlciggY29uc3RydWN0ZWQgKTsgXG4gICAgZm9yKCBsZXQgaSA9IDA7IGk8IGNvbnN0cnVjdGVkLmluaXRCdWZmZXIubGVuZ3RoOyBpKysgKXtcbiAgICBcdGNvbnN0cnVjdGVkLmluaXRCdWZmZXJbaV0uY2FsbCggY29uc3RydWN0ZWQgKTtcbiAgICB9XG5cdCAgcmV0dXJuIGNvbnN0cnVjdGVkO1xuXHR9O1xuXHRpZiAoIHR5cGVvZiBub0dsb2JhbCA9PT0gJ3VuZGVmaW5lZCcgKSB7XG5cdFx0d2luZG93LkNsaWNrYWJsZSA9IENsaWNrYWJsZTtcblx0fVxuXG5cdHJldHVybiBDbGlja2FibGU7XG5cbn0pKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==