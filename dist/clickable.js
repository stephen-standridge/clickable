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
    indicators: '.js-clickable-content-indicator',
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
      self.setNavigationType('initial');
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
        areas.active = index;
      }
      if (indicators.length > 0) {
        this.removeClassSVG(indicators[index], 'visited');
        this.addClassSVG(indicators[index], 'active');
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
    }
    if (indicators.length) {
      this.makeIndicatorVisited();
      this.removeClassSVG(indicators, 'active');
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
      if ($(this).attr('class').indexOf('active') > 0) {
        self.addClassSVG(this, 'visited');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWNrYWJsZUNhdXRpb25zLmpzIiwiQ2xpY2thYmxlQ29uc3RydWN0b3IuanMiLCJDbGlja2FibGVDb250cm9sbGVyLmpzIiwiQ2xpY2thYmxlQ29udGV4dC5qcyIsIkNsaWNrYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQWEsV0FBVyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUM1QyxHQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdCLEdBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQU8sQ0FBQyxDQUFDO0NBQ1QsQ0FBQztBQUNGLGlCQUFpQixDQUFDLFNBQVMsR0FBRztBQUM1QixtQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixDQUFFLFdBQVcsRUFBRTtBQUMxRCxRQUFJLENBQUMsR0FBSSxXQUFXLElBQUksRUFBRSxDQUFDO0FBQ3ZCLEtBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDOUIsUUFBSSxXQUFXLEtBQUssU0FBUyxFQUFDO0FBQzVCLE9BQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7QUFDdEUsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDcEIsYUFBTyxDQUFDLENBQUM7S0FDVjtBQUNELFdBQU8sQ0FBQyxDQUFDO0dBQ2Q7QUFDRCxNQUFJLEVBQUUsU0FBUyxJQUFJLEdBQUU7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGFBQU8sQ0FBQyxJQUFJLENB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ZXNDb250ZW50IjpbInZhciBDbGlja2FibGVDYXV0aW9ucyA9IGZ1bmN0aW9uKCBjb25zdHJ1Y3RlZCApe1xuXHR2YXIgaSA9IHRoaXMuZm9ybWF0Q29uc3RydWN0ZWQoIGNvbnN0cnVjdGVkICk7XG5cdFx0XHRpLndhcm4gPSB0aGlzLndhcm4uYmluZCggaSApO1xuXHRcdFx0aS53YXJuKCk7XG5cdHJldHVybiBpO1xufTtcbkNsaWNrYWJsZUNhdXRpb25zLnByb3RvdHlwZSA9IHtcbiAgZm9ybWF0Q29uc3RydWN0ZWQ6IGZ1bmN0aW9uIGZvcm1hdENvbnN0cnVjdGVkKCBjb25zdHJ1Y3RlZCApe1xuICAgIHZhciBpICA9IGNvbnN0cnVjdGVkIHx8IHt9O1xuICAgICAgICBpLndhcm5pbmdzID0gaS53YXJuaW5ncyB8fCBbXTtcbiAgICAgICAgaWYoIGNvbnN0cnVjdGVkID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgIGkud2FybmluZ3MucHVzaCgnbmVlZHMgYSB2YWxpZCBjbGlja2FibGUgY29uc3RydWN0b3IgdG8gZG8gYW55dGhpbmcnKTtcbiAgICAgICAgICB0aGlzLndhcm4uY2FsbCggaSApO1xuICAgICAgICAgIHJldHVybiBpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTtcbiAgfSwgIFxuICB3YXJuOiBmdW5jdGlvbiB3YXJuKCl7XG4gICAgZm9yKCBsZXQgaiA9IDA7IGo8IHRoaXMud2FybmluZ3MubGVuZ3RoOyBqKysgKXtcbiAgICAgIGNvbnNvbGUud2FybiggdGhpcy53YXJuaW5nc1tqXSApO1xuICAgIH1cbiAgfVxufTsiLCJ2YXIgQ2xpY2thYmxlQ29uc3RydWN0b3IgPSBmdW5jdGlvbiggYXJncywgYXV0bz10cnVlICl7XG4gIGxldCBkZWZhdWx0cyA9IHtcbiAgICB3cmFwcGVyOiAnLmpzLWNsaWNrYWJsZS1pbnRlcmFjdGlvbicsXG4gICAgY29udGVudDogJy5qcy1jbGlja2FibGUtY29udGVudC1hcmVhJyxcbiAgICBpbmRpY2F0b3JzOiAnLmpzLWNsaWNrYWJsZS1jb250ZW50LWluZGljYXRvcicsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgdGFyZ2V0czogJy5qcy1jbGlja2FibGUtdGFyZ2V0JyxcbiAgICAgIHByZXY6ICcuanMtY2xpY2thYmxlLXByZXYnLFxuICAgICAgbmV4dDogJy5qcy1jbGlja2FibGUtbmV4dCcsXG4gICAgfSxcbiAgICBtZXRhOiB7XG4gICAgICBjbGVhcjogJy5qcy1jbGlja2FibGUtY2xlYXInLFxuICAgICAgc3RhcnQ6ICcuanMtY2xpY2thYmxlLXN0YXJ0JyxcbiAgICB9LFxuICAgIGluZmluaXRlOiB0cnVlLFxuICAgIHRvZ2dsZTogZmFsc2VcbiAgfTsgIFxuICB0aGlzLmNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNhdXRpb25zKCBkZWZhdWx0cyApO1xuICB0aGlzLmNvbnN0cnVjdGVkID0gdGhpcy5tZXJnZUFyZ3MoIHRoaXMuY29uc3RydWN0ZWQsIGFyZ3MgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuc2V0RGVmYXVsdHMoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgaWYoIGF1dG8gKXtcbiAgICB0aGlzLmNvbnN0cnVjdGVkID0gdGhpcy5pbml0KCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZC50b3RhbCA9IHRoaXMuY29uc3RydWN0ZWQuY29udGVudEFyZWFzLmxlbmd0aCB8fCAwO1xuICB9XG4gIHJldHVybiB0aGlzLmNvbnN0cnVjdGVkO1xufTtcbkNsaWNrYWJsZUNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHtcbiAgbWVyZ2VBcmdzOiBmdW5jdGlvbiBtZXJnZUFyZ3MoIGRlZmF1bHRzLCBvdmVycmlkZSApe1xuICAgIHZhciBpID0ge307XG4gICAgZm9yKCBsZXQgYXR0ciBpbiBkZWZhdWx0cyApe1xuICAgICAgaVsgYXR0ciBdID0gZGVmYXVsdHNbIGF0dHIgXTtcbiAgICB9XG4gICAgZm9yKCBsZXQgYXR0ciBpbiBvdmVycmlkZSApe1xuICAgICAgaWYoIGRlZmF1bHRzWyBhdHRyIF0gIT09IHVuZGVmaW5lZCApe1xuICAgICAgICBpWyBhdHRyIF0gPSBvdmVycmlkZVsgYXR0ciBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0RGVmYXVsdHM6IGZ1bmN0aW9uKCBjb25zdHJ1Y3RlZCApe1xuICAgIHZhciBpID0gY29uc3RydWN0ZWQ7XG4gICAgaS5faW5kZXggPSAwO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ2luZGV4Jywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gaS5faW5kZXg7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiBpLl9pbmRleCA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleFByZWZpeCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgICAgICBcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgIH0pOyAgXG4gICAgaS5fdG90YWwgPSAwO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3RvdGFsJywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLCAgICAgIFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gaS5fdG90YWw7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiBpLl90b3RhbCA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTsgICAgXG4gICAgaS5nZXQgPSB0aGlzLmdldERlcHRoO1xuICAgIGkuZ2V0SW5kZXggPSB0aGlzLmdldEluZGV4O1xuICAgIGkuaW5pdEJ1ZmZlciA9IFtdOyAgXG4gICAgcmV0dXJuIGk7ICAgIFxuICB9LFxuICBpbml0OiBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgICB2YXIgaSA9IGNvbnN0cnVjdGVkO1xuICAgICAgICBpID0gdGhpcy5zZXR1cFdyYXBwZXIoIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBDb250ZW50KCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwTmF2aWdhdGlvbiggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXR1cEluZGljYXRvcnMoIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBNZXRhQ29udHJvbHMoIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0T25DbGlja3MoIGkgKTtcbiAgICAgICAgcmV0dXJuIGk7XG4gIH0sXG4gIHNldHVwV3JhcHBlcjogZnVuY3Rpb24oIGkgKXtcbiAgICBpLmludGVyYWN0aW9uID0gJCggaS53cmFwcGVyICk7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIHNldHVwQ29udGVudDogZnVuY3Rpb24oIGkgKXtcbiAgICBpLmNvbnRlbnRBcmVhcyA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkuY29udGVudCApO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cEluZGljYXRvcnM6IGZ1bmN0aW9uKCBpICl7XG4gICAgdmFyIGNvbnRlbnRDb3VudCwgaW5kaWNhdG9yQ291bnQ7XG4gICAgaS5pbmRpY2F0b3JzID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5pbmRpY2F0b3JzICk7XG5cbiAgICBjb250ZW50Q291bnQgPSBpLmNvbnRlbnRBcmVhcy5sZW5ndGggfHwgMDtcbiAgICBpbmRpY2F0b3JDb3VudCA9IGkuaW5kaWNhdG9ycy5sZW5ndGggfHwgMDsgICAgXG5cbiAgICBpZiggY29udGVudENvdW50ICsgaW5kaWNhdG9yQ291bnQgPCAxKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbm8gY29udGVudCBmb3VuZCcpO1xuICAgIH1cbiAgICBpLndhcm4oKTtcbiAgICByZXR1cm4gaTsgXG4gIH0sXG4gIHNldHVwTmF2aWdhdGlvbjogZnVuY3Rpb24oIGkgKXtcbiAgICB2YXIgcHJldkNvdW50LCBuZXh0Q291bnQsIHRhcmdldENvdW50O1xuICAgIGkubmF2aWdhdGlvbi50YXJnZXRzPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm5hdmlnYXRpb24udGFyZ2V0cyApO1xuICAgIGkubmF2aWdhdGlvbi5wcmV2ICAgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm5hdmlnYXRpb24ucHJldiApO1xuICAgIGkubmF2aWdhdGlvbi5uZXh0ICAgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm5hdmlnYXRpb24ubmV4dCApO1xuXG4gICAgcHJldkNvdW50ID0gaS5uYXZpZ2F0aW9uLnByZXYubGVuZ3RoIHx8IDA7XG4gICAgbmV4dENvdW50ID0gaS5uYXZpZ2F0aW9uLm5leHQubGVuZ3RoIHx8IDA7IFxuICAgIHRhcmdldENvdW50ID0gaS5uYXZpZ2F0aW9uLnRhcmdldHMubGVuZ3RoIHx8IDA7IFxuXG4gICAgaWYoIHByZXZDb3VudCArIG5leHRDb3VudCArIHRhcmdldENvdW50IDwgMSApe1xuICAgICAgaS53YXJuaW5ncy5wdXNoKCdubyBuYXZpZ2F0aW9uIGZvdW5kJyk7XG4gICAgfVxuICAgIGkud2FybigpO1xuICAgIHJldHVybiBpOyBcbiAgfSxcbiAgc2V0T25DbGlja3M6IGZ1bmN0aW9uKCBpICl7XG4gICAgZm9yKCB2YXIgbmF2IGluIGkubmF2aWdhdGlvbiApIHtcbiAgICAgIGlmKCBpLm5hdmlnYXRpb25bIG5hdiBdICE9PSBmYWxzZSApe1xuICAgICAgICBpLm5hdmlnYXRpb25bIG5hdiBdLnByZWNsaWNrID0gW107ICAgICAgICBcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGdldEluZGV4OiBmdW5jdGlvbiBnZXRJbmRleCggYywgcywgZWwpe1xuICAgIHJldHVybiB0aGlzLmdldChjLCBzKS5pbmRleChlbCk7XG4gIH0sXG4gIHNldHVwTWV0YUNvbnRyb2xzOiBmdW5jdGlvbiggaSApe1xuICAgIGkubmF2aWdhdGlvbi5jbGVhciA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkubWV0YS5jbGVhciApO1xuICAgIGkubmF2aWdhdGlvbi5zdGFydCA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkubWV0YS5zdGFydCApO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBmaW5kSW5JbnRlcmFjdGlvbjogZnVuY3Rpb24oIGksIHNlbGVjdG9yICl7XG4gICAgaWYoICQoIGkuaW50ZXJhY3Rpb24gKS5maW5kKCBzZWxlY3RvciApLmxlbmd0aCA+IDAgKXtcbiAgICAgIHJldHVybiAkKCBpLmludGVyYWN0aW9uICkuZmluZCggc2VsZWN0b3IgKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBnZXREZXB0aDogZnVuY3Rpb24gZ2V0RGVwdGgoIGMsIHMgKXtcbiAgICB2YXIgY29sbGVjdGlvbiA9IHRoaXNbIGMgXTsgICAgXG4gICAgaWYoIHMgIT09IHVuZGVmaW5lZCApe1xuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25bIHMgXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH0sICBcbn07IiwidmFyIENsaWNrYWJsZUNvbnRyb2xsZXIgPSBmdW5jdGlvbiggY29uc3RydWN0b3IgKXtcbiAgICB0aGlzLmNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNhdXRpb25zKCBjb25zdHJ1Y3RvciApO1xuICAgIHRoaXMuZXh0ZW5kLmNhbGwoIHRoaXMuY29uc3RydWN0ZWQsIHRoaXMgKSAgO1xuICAgIHRoaXMuY29uc3RydWN0ZWQuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdGVkOyAgXG59O1xuQ2xpY2thYmxlQ29udHJvbGxlci5wcm90b3R5cGUgPSB7XG4gIGV4dGVuZDogZnVuY3Rpb24oIG9iaiApe1xuICAgIGZvciggdmFyIGF0dHIgaW4gb2JqICl7XG4gICAgICBpZiggb2JqLmhhc093blByb3BlcnR5KCBhdHRyICkgPT09IGZhbHNlICl7XG4gICAgICAgIHRoaXNbIGF0dHIgXSA9IG9ialsgYXR0ciBdO1xuICAgICAgfVxuICAgIH1cbiAgfSwgXG4gIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5uYXZpZ2F0aW9uLnR5cGUgPSAnaW5pdGlhbCc7XG4gICAgdGhpcy5zZXR1cEV2ZW50cyggKTtcbiAgICB0aGlzLnN0YXJ0U2NyZWVuKCApO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBzdGFydFNjcmVlbjogZnVuY3Rpb24oICl7XG4gICAgaWYoIHRoaXMubmF2aWdhdGlvbi5zdGFydCApe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdvVG8oIDAgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgZ29UbzogZnVuY3Rpb24oIGluZGV4ICl7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4OyAgICAgIFxuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIHByZXY6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kZWNyZW1lbnRJbmRleCgpO1xuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIG5leHQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5pbmNyZW1lbnRJbmRleCgpOyAgICBcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMubWFrZUFjdGl2ZSgpO1xuICB9LFxuICByZXNldDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMuY2xlYXJOYXZpZ2F0aW9uVHlwZSgpO1xuICB9LCAgXG4gIGRlY3JlbWVudEluZGV4OiBmdW5jdGlvbigpe1xuICAgIGlmKHRoaXMuaW5kZXggID4gMCl7XG4gICAgICB0aGlzLmluZGV4ICAtLTtcbiAgICB9ZWxzZSBpZih0aGlzLmluZmluaXRlKXtcbiAgICAgIHRoaXMuaW5kZXggID0gdGhpcy50b3RhbCAtMTtcbiAgICB9XG4gIH0sXG4gIGluY3JlbWVudEluZGV4OiBmdW5jdGlvbigpe1xuICAgIGlmKHRoaXMuaW5kZXggIDwgdGhpcy50b3RhbCAtMSl7XG4gICAgICB0aGlzLmluZGV4ICArKzsgICAgICBcbiAgICB9IGVsc2UgaWYodGhpcy5pbmZpbml0ZSkge1xuICAgICAgdGhpcy5pbmRleCAgPSAwO1xuICAgIH1cbiAgfSxcbiAgc2V0dXBFdmVudHM6IGZ1bmN0aW9uIHNldHVwRXZlbnRzKGkpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgJCggdGhpcy5nZXQoJ25hdmlnYXRpb24nLCAncHJldicpICkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICdwcmV2JywgJCh0aGlzKSApO1xuICAgICAgc2VsZi5wcmV2KCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQodGhpcy5nZXQoJ25hdmlnYXRpb24nLCAnbmV4dCcpKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2VsZi5jYWxsUHJlY2xpY2tGdW5jcyggJ25leHQnLCAkKHRoaXMpICk7ICAgICBcbiAgICAgIHNlbGYubmV4dCgpO1xuICAgICAgc2VsZi5zZXROYXZpZ2F0aW9uVHlwZSggJ2xpbmVhcicgKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ2NsZWFyJykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7ICAgICAgXG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCAnY2xlYXInLCAkKHRoaXMpICk7XG4gICAgICBzZWxmLnJlc2V0KCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnaW5pdGlhbCcgKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3N0YXJ0JykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCAnc3RhcnQnLCAkKHRoaXMpICk7XG4gICAgICBzZWxmLmdvVG8oMCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQoIHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnKSApLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICd0YXJnZXRzJywgJCh0aGlzKSApO1xuICAgICAgICBzZWxmLmdvVG8oIHNlbGYuZ2V0SW5kZXgoJ25hdmlnYXRpb24nLCAndGFyZ2V0cycsIHRoaXMpICk7XG4gICAgICAgIHNlbGYuc2V0TmF2aWdhdGlvblR5cGUoICd0YXJnZXR0ZWQnKTtcbiAgICB9KTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgY2FsbFByZWNsaWNrRnVuY3M6IGZ1bmN0aW9uIGNhbGxQcmVjbGlja0Z1bmNzKCBuYXZUeXBlLCBlbCApe1xuICAgIHZhciBidWZmZXIgPSB0aGlzLmdldCgnbmF2aWdhdGlvbicsIG5hdlR5cGUgKS5wcmVjbGljaztcbiAgICBmb3IobGV0IGZ1bmMgaW4gYnVmZmVyICl7XG4gICAgICBidWZmZXJbZnVuY10uY2FsbCggdGhpcywgZWwgKTtcbiAgICB9ICBcbiAgfSxcbiAgc2V0TmF2aWdhdGlvblR5cGU6IGZ1bmN0aW9uKHR5cGUpe1xuICAgIHRoaXMuY2xlYXJOYXZpZ2F0aW9uVHlwZSgpO1xuICAgIHRoaXMubmF2aWdhdGlvbi50eXBlID0gdHlwZTtcbiAgICB0aGlzLmFkZENsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sIHRoaXMubmF2aWdhdGlvbi50eXBlKTtcbiAgICBpZih0eXBlICE9PSAnc3RhcnQnKXtcbiAgICAgIHRoaXMuYWRkQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgJ25hdmlnYXRlZCcpO1xuICAgIH1cblxuICB9LFxuICBjbGVhck5hdmlnYXRpb25UeXBlOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgdGhpcy5uYXZpZ2F0aW9uLnR5cGUpO1xuICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgJ25hdmlnYXRlZCcpO1xuICB9LFxuICBtYWtlQWN0aXZlOiBmdW5jdGlvbigpe1xuICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXgsXG4gICAgICAgIGFyZWFzID0gdGhpcy5nZXQoICdjb250ZW50QXJlYXMnICksXG4gICAgICAgIGluZGljYXRvcnMgPSB0aGlzLmdldCggJ2luZGljYXRvcnMnICksXG4gICAgICAgIGNvdW50MSA9IGFyZWFzLmxlbmd0aCB8fCAwLFxuICAgICAgICBjb3VudDIgPSBpbmRpY2F0b3JzLmxlbmd0aCB8fCAwO1xuXG4gICAgaWYoICF0aGlzLmlzVG9nZ2xlIHx8IGFyZWFzLmFjdGl2ZSAhPT0gaW5kZXggKXtcbiAgICAgIHRoaXMuYWRkSW50ZXJhY3Rpb25BY3RpdmVDbGFzcygpOyAgICAgIFxuICAgICAgaWYoIGFyZWFzLmxlbmd0aCA+IDAgKSB7IFxuICAgICAgICB0aGlzLmFkZENsYXNzU1ZHKCBhcmVhc1sgaW5kZXggXSwgJ2FjdGl2ZScgKTtcbiAgICAgICAgYXJlYXMuYWN0aXZlID0gaW5kZXggOyAgICAgICAgXG4gICAgICB9XG4gICAgICBpZiggaW5kaWNhdG9ycy5sZW5ndGggPiAwICl7IFxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBpbmRpY2F0b3JzWyBpbmRleCBdLCAndmlzaXRlZCcgKTtcbiAgICAgICAgdGhpcy5hZGRDbGFzc1NWRyggaW5kaWNhdG9yc1sgaW5kZXggXSwgJ2FjdGl2ZScgKTtcbiAgICAgIH1cbiAgICAgIGlmKCBjb3VudDEgKyBjb3VudDIgPCAxICl7XG4gICAgICAgIHRoaXMud2FybmluZ3MucHVzaCgnbm8gY29udGVudCB0byBhY3RpdmF0ZScpO1xuICAgICAgICB0aGlzLndhcm4oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXJlYXMuYWN0aXZlID0gZmFsc2U7XG4gIH0sXG4gIG1ha2VBbGxJbmFjdGl2ZTogZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJlYXMgPSB0aGlzLmdldCggJ2NvbnRlbnRBcmVhcycgKSxcbiAgICAgICAgaW5kaWNhdG9ycyA9IHRoaXMuZ2V0KCAnaW5kaWNhdG9ycycgKTtcbiAgICBpZiggYXJlYXMubGVuZ3RoICl7XG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBhcmVhcywgJ2FjdGl2ZScgKTtcbiAgICB9XG4gICAgaWYoIGluZGljYXRvcnMubGVuZ3RoICl7XG4gICAgICB0aGlzLm1ha2VJbmRpY2F0b3JWaXNpdGVkKCk7ICAgXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBpbmRpY2F0b3JzLCAnYWN0aXZlJyApO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUludGVyYWN0aW9uQWN0aXZlQ2xhc3MoKTtcbiAgfSxcbiAgYWRkSW50ZXJhY3Rpb25BY3RpdmVDbGFzczogZnVuY3Rpb24oKXtcbiAgICB0aGlzLmFkZENsYXNzU1ZHKCB0aGlzLmludGVyYWN0aW9uLCAnYWN0aXZlLScgKyB0aGlzLmluZGV4UHJlZml4ICsgdGhpcy5pbmRleCApO1xuICB9LFxuICByZW1vdmVJbnRlcmFjdGlvbkFjdGl2ZUNsYXNzOiBmdW5jdGlvbigpe1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IHRoaXMudG90YWw7IGkrKyl7XG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sICdhY3RpdmUtJysgdGhpcy5pbmRleFByZWZpeCArIGkgKTtcbiAgICB9XG4gIH0sXG4gIG1ha2VJbmRpY2F0b3JWaXNpdGVkOiBmdW5jdGlvbigpe1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKCB0aGlzLmdldCggJ2luZGljYXRvcnMnICkgKS5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBpZigkKHRoaXMpLmF0dHIoJ2NsYXNzJykuaW5kZXhPZignYWN0aXZlJykgPiAwICkge1xuICAgICAgICBzZWxmLmFkZENsYXNzU1ZHKHRoaXMsICd2aXNpdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGFkZENsYXNzU1ZHOiBmdW5jdGlvbihlbGVtLCBuZXdDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT0gdW5kZWZpbmVkICl7XG4gICAgICByZXR1cm47XG4gICAgfSAgICAgIFxuICAgIGlmKGVsZW0ubGVuZ3RoID4gMCl7XG4gICAgICB0aGlzLmFkZE11bHRpcGxlQ2xhc3NlcyhlbGVtLCBuZXdDbGFzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkU2luZ3VsYXJDbGFzcyhlbGVtLCBuZXdDbGFzcyk7XG4gICAgfVxuICB9LFxuICBhZGRTaW5ndWxhckNsYXNzOiBmdW5jdGlvbihlbGVtLCBuZXdDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT09IHVuZGVmaW5lZCApeyByZXR1cm47IH0gICAgXG4gICAgdmFyIHRlbXBDbGFzcyA9ICQoZWxlbSkuYXR0cignY2xhc3MnKTtcbiAgICAkKGVsZW0pLmF0dHIoJ2NsYXNzJywgdGVtcENsYXNzICsgJyAnICtuZXdDbGFzcyk7XG4gIH0sXG4gIGFkZE11bHRpcGxlQ2xhc3NlczogZnVuY3Rpb24oZWxlbXMsIG5ld0NsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzO1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IGVsZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRlbXBDbGFzcyA9ICQoZWxlbXNbaV0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycsIHRlbXBDbGFzcyArICcgJyArbmV3Q2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlQ2xhc3NTVkc6IGZ1bmN0aW9uKGVsZW0sIHJlbW92ZWRDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT0gdW5kZWZpbmVkICl7XG4gICAgICByZXR1cm47XG4gICAgfSAgICBcbiAgICBpZihlbGVtLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy5yZW1vdmVNdWx0aXBsZUNsYXNzZXMoZWxlbSwgcmVtb3ZlZENsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVTaW5ndWxhckNsYXNzKGVsZW0sIHJlbW92ZWRDbGFzcyk7XG4gICAgfVxuICB9LFxuICByZW1vdmVTaW5ndWxhckNsYXNzOiBmdW5jdGlvbihlbGVtLCByZW1vdmVkQ2xhc3Mpe1xuICAgIHZhciB0ZW1wQ2xhc3MgPSAkKGVsZW0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgdmFyIG5ld0NsYXNzICA9IHRlbXBDbGFzcy5yZXBsYWNlKCcgJytyZW1vdmVkQ2xhc3MsICcnKTtcbiAgICAkKGVsZW0pLmF0dHIoJ2NsYXNzJywgbmV3Q2xhc3MpO1xuICB9LFxuICByZW1vdmVNdWx0aXBsZUNsYXNzZXM6IGZ1bmN0aW9uKGVsZW1zLCByZW1vdmVkQ2xhc3Mpe1xuICAgIHZhciB0ZW1wQ2xhc3MsIG5ld0NsYXNzO1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IGVsZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRlbXBDbGFzcyA9ICQoZWxlbXNbaV0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgICBuZXdDbGFzcyAgPSB0ZW1wQ2xhc3MucmVwbGFjZSgnICcrcmVtb3ZlZENsYXNzLCAnJyk7XG4gICAgICAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycsIG5ld0NsYXNzKTtcbiAgICB9XG4gIH0sICBcbn07IiwidmFyIENsaWNrYWJsZUNvbnRleHQgPSBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggY29uc3RydWN0ZWQgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICBpZiggdGhpcy5jb25zdHJ1Y3RlZC5jb250ZXh0ICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuc29ydENvbGxlY3Rpb25zKCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMub3ZlcnJpZGVEZWZhdWx0cyggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuY29uc3RydWN0ZWQ7XG59O1xuXG5DbGlja2FibGVDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCggaSApe1xuICAgIGkgPSB0aGlzLnNldEluaXRpYWxEYXRhKCBpICk7XG4gICAgaSA9IHRoaXMuc2V0VG90YWxEYXRhKCBpICk7XG4gICAgaSA9IHRoaXMuc2V0SW5kZXhEYXRhKCBpICk7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIG92ZXJyaWRlRGVmYXVsdHM6IGZ1bmN0aW9uIG92ZXJyaWRlRGVmYXVsdHMoIGkgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleCcsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4WyB0aGlzLmNvbnRleHQgXTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKCB2YWwgKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4WyB0aGlzLmNvbnRleHQgXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleFByZWZpeCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgICAgICBcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCArICctJztcbiAgICAgIH1cbiAgICB9KTsgXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAndG90YWwnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl90b3RhbFsgdGhpcy5jb250ZXh0IF07XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiB0aGlzLl90b3RhbFsgdGhpcy5jb250ZXh0IF0gPSB2YWw7XG4gICAgICB9XG4gICAgfSk7ICAgIFxuICAgIGkuZ2V0ID0gdGhpcy5nZXRDb250ZXh0RGVwdGg7XG4gICAgaS5nZXRJbmRleCA9IHRoaXMuZ2V0Q29udGV4dEluZGV4O1xuICAgIGkuaW5pdEJ1ZmZlci5wdXNoKCB0aGlzLmNvbnRleHRJbml0ICk7XG4gICAgcmV0dXJuIGk7ICBcbiAgfSxcbiAgY29udGV4dEluaXQ6IGZ1bmN0aW9uIGNvbnRleHRJbml0KCl7XG4gICAgaWYoIHRoaXMuX3RvdGFsLmhhc093blByb3BlcnR5KCdjb250ZXh0X2RlZmF1bHQnKSl7XG4gICAgICB0aGlzLmNvbnRleHQgPSAnY29udGV4dF9kZWZhdWx0JztcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yKHZhciBmaXJzdCBpbiB0aGlzLl90b3RhbCl7XG4gICAgICB0aGlzLmNvbnRleHQgPSBmaXJzdDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSxcbiAgc2V0SW5pdGlhbERhdGE6IGZ1bmN0aW9uIHNldEluaXRpYWxkYXRhKCBpICl7XG4gICAgaS5jb250ZXh0ID0gZmFsc2U7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGZpbmRDb250ZXh0Q291bnQ6IGZ1bmN0aW9uIGZpbmRDb250ZXh0Q291bnQoIGVsICl7XG4gICAgdmFyIGluZGljZXMgPSB7fSwgc2VsZiA9IHRoaXM7XG4gICAgJCggZWwgKS5lYWNoKCBmdW5jdGlvbigpe1xuICAgICAgdmFyIGMgPSAkKHRoaXMpLmRhdGEoJ2NvbnRleHQnKTtcbiAgICAgIGluZGljZXMgPSBzZWxmLmFkZFRvT3JJbml0KCBpbmRpY2VzLCBjICk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGluZGljZXM7XG4gIH0sXG4gIG1lcmdlRm9yTWF4OiBmdW5jdGlvbiBtZXJnZUZvck1heCggb2JqMSwgb2JqMiApe1xuICAgIHZhciBtZXJnZWQgPSBvYmoxO1xuICAgIGZvciggdmFyIHByb3AgaW4gb2JqMiApe1xuICAgICAgaWYoIG1lcmdlZFtwcm9wXSA9PT0gdW5kZWZpbmVkIHx8IG1lcmdlZFtwcm9wXSA8IG9iajJbcHJvcF0pe1xuICAgICAgICBtZXJnZWRbcHJvcF0gPSBvYmoyW3Byb3BdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xuICB9LFxuICBzZXRUb3RhbERhdGE6IGZ1bmN0aW9uIHNldFRvdGFsRGF0YSggaSApe1xuICAgIHZhciBjb250ZW50cyA9IHRoaXMuZmluZENvbnRleHRDb3VudCggaS5jb250ZW50QXJlYXMgKTtcbiAgICB2YXIgaW5kaWNhdG9ycyA9IHRoaXMuZmluZENvbnRleHRDb3VudCggaS5pbmRpY2F0b3JzICk7XG4gICAgdmFyIGNvbnRleHRzID0gdGhpcy5tZXJnZUZvck1heCggY29udGVudHMsIGluZGljYXRvcnMgKTtcbiAgICBmb3IoIHZhciBjb250ZXh0IGluIGNvbnRleHRzICl7XG4gICAgICBpZiggY29udGV4dCAhPT0gJ2NvbnRleHRfZGVmYXVsdCcgKXtcbiAgICAgICAgaS5jb250ZXh0ID0gdHJ1ZTtcbiAgICAgICAgaS5fdG90YWwgPSBjb250ZXh0cztcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXRJbmRleERhdGE6IGZ1bmN0aW9uIHNldEluZGV4RGF0YSggaSApe1xuICAgIGlmKCAhaS5jb250ZXh0ICl7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gICAgaS5faW5kZXggPSB7fTtcbiAgICBmb3IoIHZhciBjb250ZXh0IGluIGkudG90YWwgKXtcbiAgICAgIGkuX2luZGV4WyBjb250ZXh0IF0gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgYWRkVG9PckluaXQ6IGZ1bmN0aW9uIGFkZFRvT3JJbml0KCBvYmosIHByb3AgKXtcbiAgICB2YXIgcHJvcGVydHkgPSBwcm9wIHx8ICdkZWZhdWx0JztcbiAgICB2YXIga2V5ID0gJ2NvbnRleHRfJyArIHByb3BlcnR5O1xuICAgIGlmKCBvYmouaGFzT3duUHJvcGVydHkoIGtleSApICl7XG4gICAgICBvYmpbIGtleSBdICs9IDE7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgICBvYmpbIGtleSBdID0gMTtcbiAgICByZXR1cm4gb2JqO1xuICB9LFxuICBzb3J0Q29sbGVjdGlvbnM6IGZ1bmN0aW9uIHNvcnRDb2xsZWN0aW9ucyggaSApe1xuICAgIGkuY29udGVudEFyZWFzID0gdGhpcy5jb250ZXh0U29ydCggaSwgJ2NvbnRlbnRBcmVhcycgKTsgIFxuICAgIGkuaW5kaWNhdG9ycyA9IHRoaXMuY29udGV4dFNvcnQoIGksICdpbmRpY2F0b3JzJyApO1xuICAgIGkubmF2aWdhdGlvbi50YXJnZXRzID0gdGhpcy5jb250ZXh0U29ydCggaSwgJ25hdmlnYXRpb24nLCAndGFyZ2V0cycgKTtcbiAgICBpLm5hdmlnYXRpb24ucHJldiA9IHRoaXMuY29udGV4dFNvcnQoIGksICduYXZpZ2F0aW9uJywgJ3ByZXYnICk7ICAgIFxuICAgIGkubmF2aWdhdGlvbi5uZXh0ID0gdGhpcy5jb250ZXh0U29ydCggaSwgJ25hdmlnYXRpb24nLCAnbmV4dCcgKTtcbiAgICB0aGlzLndhcm5BYm91dE5hdmlnYXRpb24oIGkgKTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgY29udGV4dFNvcnQ6IGZ1bmN0aW9uIGNvbnRleHRTb3J0KCBpLCBjb2xsZWN0aW9uLCBzdWIgKXtcbiAgICB2YXIgYWxsID0gaS5nZXQoIGNvbGxlY3Rpb24sIHN1YiApLFxuICAgICAgICBzZWxmID0gdGhpcywgXG4gICAgICAgIG9uY2xpY2s7XG4gICAgaWYoIGFsbCApeyBvbmNsaWNrID0gYWxsLnByZWNsaWNrOyB9XG5cbiAgICAkKGFsbCkuZmlsdGVyKCBmdW5jdGlvbigpe1xuXG4gICAgICByZXR1cm4gJCh0aGlzKTtcblxuICAgIH0gKS5lYWNoKCBmdW5jdGlvbigpe1xuXG4gICAgICB2YXIgYyA9IHNlbGYuc2V0Q29udGV4dEtleSggJCh0aGlzKSApO1xuICAgICAgaWYoIGFsbFtjXSA9PT0gdW5kZWZpbmVkICl7XG4gICAgICAgIGFsbFtjXSA9ICQoKTtcbiAgICAgIH1cbiAgICAgICQodGhpcykuZGF0YSgnaW5kZXgnLCBhbGxbY10ubGVuZ3RoKTtcbiAgICAgIGFsbFtjXSA9ICQoYWxsW2NdKS5hZGQoICQodGhpcykgKTtcbiAgICB9KTtcbiAgICBpZiggb25jbGljayApeyBhbGwucHJlY2xpY2sgPSBvbmNsaWNrO1xuICAgICAgICAgICAgICAgICAgIGFsbC5wcmVjbGljay5wdXNoKHNlbGYucGFyc2VDb250ZXh0ICk7IH1cbiAgICByZXR1cm4gYWxsO1xuICB9LFxuICB3YXJuQWJvdXROYXZpZ2F0aW9uOiBmdW5jdGlvbiB3YXJuQWJvdXROYXZpZ2F0aW9uKCBpICl7XG4gICAgZm9yKCB2YXIga2V5IGluIGkuX2luZGV4ICl7XG4gICAgICBpZiggaS5uYXZpZ2F0aW9uLnRhcmdldHNbIGtleSBdID09PSB1bmRlZmluZWQgJiYgXG4gICAgICAgIGkubmF2aWdhdGlvbi5wcmV2WyBrZXkgXSA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGkubmF2aWdhdGlvbi5uZXh0WyBrZXkgXSA9PT0gdW5kZWZpbmVkICl7XG4gICAgICAgIGkud2FybmluZ3MucHVzaChgdGhlcmUgaXMgbm8gbmF2Z2F0aW9uIGZvciB0aGUgY29udGV4dCAke2tleX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaS53YXJuKCk7XG4gIH0sXG4gIHBhcnNlQ29udGV4dDogZnVuY3Rpb24gcGFyc2VDb250ZXh0KCBlbCApe1xuICAgIGlmKCBlbCAhPT0gdW5kZWZpbmVkICYmICQoIGVsICkuZGF0YSgnY29udGV4dCcpICl7XG4gICAgICB0aGlzLmNvbnRleHQgPSAnY29udGV4dF8nICsgJCggZWwgKS5kYXRhKCAnY29udGV4dCcgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5jb250ZXh0ID0gJ2NvbnRleHRfZGVmYXVsdCc7XG4gIH0sICBcbiAgZ2V0Q29udGV4dEluZGV4OiBmdW5jdGlvbiBnZXRDb250ZXh0SW5kZXgoIGMsIHMsIGVsKXtcbiAgICByZXR1cm4gJChlbCkuZGF0YSgnaW5kZXgnKTtcbiAgfSwgIFxuICBnZXRDb250ZXh0RGVwdGg6IGZ1bmN0aW9uIGdldENvbnRleHREZXB0aCggYywgcyApe1xuICAgIHZhciBjb2xsZWN0aW9uID0gdGhpc1sgYyBdWyB0aGlzLmNvbnRleHQgXTtcbiAgICBpZiggdGhpc1tjXVt0aGlzLmNvbnRleHRdID09PSB1bmRlZmluZWQgfHwgdGhpcy5jb250ZXh0ID09PSB0cnVlICl7XG4gICAgICBjb2xsZWN0aW9uID0gdGhpc1tjXTtcbiAgICAgIGlmKGNvbGxlY3Rpb24gPT09IGZhbHNlKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gICBcbiAgICBpZiggcyAhPT0gdW5kZWZpbmVkICl7XG4gICAgICBjb2xsZWN0aW9uID0gY29sbGVjdGlvblsgcyBdO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgfSxcbiAgc2V0Q29udGV4dEtleTogZnVuY3Rpb24gc2V0Q29udGV4dEtleSggZWwgKXtcbiAgICB2YXIgY3R4ID0gZWwuZGF0YSggJ2NvbnRleHQnICkgfHwgJ2RlZmF1bHQnO1xuICAgIHJldHVybiAnY29udGV4dF8nICsgY3R4O1xuICB9IFxufTsiLCIoZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcblxuXHRpZiAoIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuZG9jdW1lbnQgP1xuXHRcdFx0ZmFjdG9yeSggZ2xvYmFsLCB0cnVlICkgOlxuXHRcdFx0ZnVuY3Rpb24oIHcgKSB7XG5cdFx0XHRcdGlmICggIXcuZG9jdW1lbnQgKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCAncmVxdWlyZXMgYSB3aW5kb3cgd2l0aCBhIGRvY3VtZW50JyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWN0b3J5KCB3ICk7XG5cdFx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGZhY3RvcnkoIGdsb2JhbCApO1xuXHR9XG5cdC8vIFBhc3MgdGhpcyBpZiB3aW5kb3cgaXMgbm90IGRlZmluZWQgeWV0XG59KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oIHdpbmRvdywgbm9HbG9iYWwgKSB7XG5cdHZhciBDbGlja2FibGUgPSBmdW5jdGlvbiggYXJncyApe1xuXHRcdHZhciBjb25zdHJ1Y3RlZCA9IHt9O1xuXHQgIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnN0cnVjdG9yKCBhcmdzICk7XG5cdCAgY29uc3RydWN0ZWQgPSBuZXcgQ2xpY2thYmxlQ29udGV4dCggY29uc3RydWN0ZWQgKTtcblx0ICBjb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDb250cm9sbGVyKCBjb25zdHJ1Y3RlZCApOyBcbiAgICBmb3IoIGxldCBpID0gMDsgaTwgY29uc3RydWN0ZWQuaW5pdEJ1ZmZlci5sZW5ndGg7IGkrKyApe1xuICAgIFx0Y29uc3RydWN0ZWQuaW5pdEJ1ZmZlcltpXS5jYWxsKCBjb25zdHJ1Y3RlZCApO1xuICAgIH1cblx0ICByZXR1cm4gY29uc3RydWN0ZWQ7XG5cdH07XG5cdGlmICggdHlwZW9mIG5vR2xvYmFsID09PSAndW5kZWZpbmVkJyApIHtcblx0XHR3aW5kb3cuQ2xpY2thYmxlID0gQ2xpY2thYmxlO1xuXHR9XG5cblx0cmV0dXJuIENsaWNrYWJsZTtcblxufSkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9