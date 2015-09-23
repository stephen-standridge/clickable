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
    i.navigation.preclick = [];
    prevCount = i.navigation.prev.length || 0;
    nextCount = i.navigation.next.length || 0;
    targetCount = i.navigation.targets.length || 0;

    if (prevCount + nextCount + targetCount < 1) {
      i.warnings.push('no navigation found');
    }
    i.warn();
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
  this.constructed.initBuffer.push(this.startScreen);

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
  setupEvents: function setupEvents() {
    var self = this;
    $(this.get('navigation', 'prev')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs($(this));
      self.prev();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'next')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs($(this));
      self.next();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'clear')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs($(this));
      self.reset();
    });
    $(this.get('navigation', 'start')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs($(this));
      self.goTo(0);
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'targets')).click(function (e) {
      e.preventDefault();
      self.callPreclickFuncs($(this));
      self.goTo(self.getIndex('navigation', 'targets', this));
      self.setNavigationType('targetted');
    });
  },
  callPreclickFuncs: function callPreclickFuncs(el) {
    var buffer = this.get('navigation', 'preclick');
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
        count1 = areas ? areas.length : 0,
        count2 = indicators ? indicators.length : 0;

    if (!this.toggle || areas.active !== index) {
      this.addInteractionActiveClass();
      if (count1 > 0) {
        this.addClassSVG(areas[index], 'active');
        this.addClassSVG(areas[index], 'js-active');
        areas.active = index;
      }
      if (count2 > 0) {
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
        indicators = this.get('indicators'),
        count1 = areas ? areas.length : 0,
        count2 = indicators ? indicators.length : 0;
    if (count1 > 0) {
      this.removeClassSVG(areas, 'active');
      this.removeClassSVG(areas, 'js-active');
    }
    if (count2 > 0) {
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
    this.constructed = this.establishCollections(this.constructed);
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
  establishCollections: function establishCollections(i) {
    for (var key in i._total) {
      i.contentAreas[key] = $();
      i.indicators[key] = $();
      i.navigation.targets[key] = $();
      i.navigation.prev[key] = $();
      i.navigation.next[key] = $();
    }
    return i;
  },
  sortCollections: function sortCollections(i) {
    i.contentAreas = this.contextSort(i, 'contentAreas');
    i.indicators = this.contextSort(i, 'indicators');
    this.warnAboutContent(i);
    i.navigation.targets = this.contextSort(i, 'navigation', 'targets');
    i.navigation.prev = this.contextSort(i, 'navigation', 'prev');
    i.navigation.next = this.contextSort(i, 'navigation', 'next');
    i.navigation.preclick.push(this.parseContext);
    this.warnAboutNavigation(i);
    return i;
  },
  contextSort: function contextSort(i, collection, sub) {
    var all = i.get(collection, sub),
        self = this,
        onclick;

    $(all).filter(function () {

      return $(this);
    }).each(function () {

      var c = self.setContextKey($(this));
      $(this).data('index', all[c].length);
      all[c] = $(all[c]).add($(this));
    });

    return all;
  },
  warnAboutNavigation: function warnAboutNavigation(i) {
    for (var key in i._index) {
      if (i.navigation.targets[key].length < 1 && i.navigation.prev[key].length < 1 && i.navigation.next[key].length < 1) {
        i.warnings.push('there is no navgation for the context ' + key);
      }
    }
    i.warn();
  },
  warnAboutContent: function warnAboutContent(i) {
    for (var key in i._index) {
      if (i.contentAreas[key].length < 1 && i.indicators[key].length < 1) {
        i.warnings.push('there is no content for the context ' + key);
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

    var collection = this[c];

    if (s !== undefined) {
      collection = collection[s];
      if (collection === undefined) {
        return false;
      }
      if (this.context === true) {
        return collection;
      }
    }
    if (collection[this.context] === undefined) {
      return collection;
    }
    return collection[this.context];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWNrYWJsZUNhdXRpb25zLmpzIiwiQ2xpY2thYmxlQ29uc3RydWN0b3IuanMiLCJDbGlja2FibGVDb250cm9sbGVyLmpzIiwiQ2xpY2thYmxlQ29udGV4dC5qcyIsIkNsaWNrYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQWEsV0FBVyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUM1QyxHQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdCLEdBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQU8sQ0FBQyxDQUFDO0NBQ1QsQ0FBQztBQUNGLGlCQUFpQixDQUFDLFNBQVMsR0FBRztBQUM1QixtQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixDQUFFLFdBQVcsRUFBRTtBQUMxRCxRQUFJLENBQUMsR0FBSSxXQUFXLElBQUksRUFBRSxDQUFDO0FBQ3ZCLEtBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDOUIsUUFBSSxXQUFXLEtBQUssU0FBUyxFQUFDO0FBQzVCLE9BQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7QUFDdEUsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDcEIsYUFBTyxDQUFDLENBQUM7S0FDVjtBQUNELFdBQU8sQ0FBQyxDQUFDO0dBQ2Q7QUFDRCxNQUFJLEVBQUUsU0FBUyxJQUFJLEdBQUU7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGFBQU8sQ0FBQyxJQUFJLENB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QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUUsV0FBVyxDQUFFLENBQUM7R0FDOUM7QUFDRixTQUFPLFdBQVcsQ0FBQztFQUNwQixDQUFDO0FBQ0YsS0FBSyxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUc7QUFDdEMsUUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7RUFDN0I7O0FBRUQsUUFBTyxTQUFTLENBQUM7Q0FFakIsQ0FBQyxDQUFFIiwiZmlsZSI6ImNsaWNrYWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBDbGlja2FibGVDYXV0aW9ucyA9IGZ1bmN0aW9uKCBjb25zdHJ1Y3RlZCApe1xuXHR2YXIgaSA9IHRoaXMuZm9ybWF0Q29uc3RydWN0ZWQoIGNvbnN0cnVjdGVkICk7XG5cdFx0XHRpLndhcm4gPSB0aGlzLndhcm4uYmluZCggaSApO1xuXHRcdFx0aS53YXJuKCk7XG5cdHJldHVybiBpO1xufTtcbkNsaWNrYWJsZUNhdXRpb25zLnByb3RvdHlwZSA9IHtcbiAgZm9ybWF0Q29uc3RydWN0ZWQ6IGZ1bmN0aW9uIGZvcm1hdENvbnN0cnVjdGVkKCBjb25zdHJ1Y3RlZCApe1xuICAgIHZhciBpICA9IGNvbnN0cnVjdGVkIHx8IHt9O1xuICAgICAgICBpLndhcm5pbmdzID0gaS53YXJuaW5ncyB8fCBbXTtcbiAgICAgICAgaWYoIGNvbnN0cnVjdGVkID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgIGkud2FybmluZ3MucHVzaCgnbmVlZHMgYSB2YWxpZCBjbGlja2FibGUgY29uc3RydWN0b3IgdG8gZG8gYW55dGhpbmcnKTtcbiAgICAgICAgICB0aGlzLndhcm4uY2FsbCggaSApO1xuICAgICAgICAgIHJldHVybiBpOyBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTtcbiAgfSwgIFxuICB3YXJuOiBmdW5jdGlvbiB3YXJuKCl7XG4gICAgZm9yKCBsZXQgaiA9IDA7IGo8IHRoaXMud2FybmluZ3MubGVuZ3RoOyBqKysgKXtcbiAgICAgIGNvbnNvbGUud2FybiggdGhpcy53YXJuaW5nc1tqXSApO1xuICAgIH1cbiAgfVxufTsiLCJ2YXIgQ2xpY2thYmxlQ29uc3RydWN0b3IgPSBmdW5jdGlvbiggYXJncywgYXV0bz10cnVlICl7XG4gIGxldCBkZWZhdWx0cyA9IHtcbiAgICB3cmFwcGVyOiAnLmpzLWNsaWNrYWJsZS1pbnRlcmFjdGlvbicsXG4gICAgY29udGVudDogJy5qcy1jbGlja2FibGUtY29udGVudC1hcmVhJyxcbiAgICBpbmRpY2F0b3JzOiAnLmpzLWNsaWNrYWJsZS1pbmRpY2F0b3InLFxuICAgIG5hdmlnYXRpb246IHtcbiAgICAgIHRhcmdldHM6ICcuanMtY2xpY2thYmxlLXRhcmdldCcsXG4gICAgICBwcmV2OiAnLmpzLWNsaWNrYWJsZS1wcmV2JyxcbiAgICAgIG5leHQ6ICcuanMtY2xpY2thYmxlLW5leHQnLFxuICAgIH0sXG4gICAgbWV0YToge1xuICAgICAgY2xlYXI6ICcuanMtY2xpY2thYmxlLWNsZWFyJyxcbiAgICAgIHN0YXJ0OiAnLmpzLWNsaWNrYWJsZS1zdGFydCcsXG4gICAgfSxcbiAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICB0b2dnbGU6IGZhbHNlXG4gIH07ICBcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggZGVmYXVsdHMgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMubWVyZ2VBcmdzKCB0aGlzLmNvbnN0cnVjdGVkLCBhcmdzICk7XG4gIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLnNldERlZmF1bHRzKCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gIGlmKCBhdXRvICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICAgIHRoaXMuY29uc3RydWN0ZWQudG90YWwgPSB0aGlzLmNvbnN0cnVjdGVkLmNvbnRlbnRBcmVhcy5sZW5ndGggfHwgMDtcbiAgfVxuICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RlZDtcbn07XG5DbGlja2FibGVDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSB7XG4gIG1lcmdlQXJnczogZnVuY3Rpb24gbWVyZ2VBcmdzKCBkZWZhdWx0cywgb3ZlcnJpZGUgKXtcbiAgICB2YXIgaSA9IHt9O1xuICAgIGZvciggbGV0IGF0dHIgaW4gZGVmYXVsdHMgKXtcbiAgICAgIGlbIGF0dHIgXSA9IGRlZmF1bHRzWyBhdHRyIF07XG4gICAgfVxuICAgIGZvciggbGV0IGF0dHIgaW4gb3ZlcnJpZGUgKXtcbiAgICAgIGlmKCBkZWZhdWx0c1sgYXR0ciBdICE9PSB1bmRlZmluZWQgKXtcbiAgICAgICAgaVsgYXR0ciBdID0gb3ZlcnJpZGVbIGF0dHIgXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIHNldERlZmF1bHRzOiBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgICB2YXIgaSA9IGNvbnN0cnVjdGVkO1xuICAgIGkuX2luZGV4ID0gMDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGkuX2luZGV4O1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gaS5faW5kZXggPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXhQcmVmaXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsICAgICAgXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9KTsgIFxuICAgIGkuX3RvdGFsID0gMDtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICd0b3RhbCcsIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgICAgICBcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGkuX3RvdGFsO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gaS5fdG90YWwgPSB2YWw7XG4gICAgICB9XG4gICAgfSk7ICAgIFxuICAgIGkuZ2V0ID0gdGhpcy5nZXREZXB0aDtcbiAgICBpLmdldEluZGV4ID0gdGhpcy5nZXRJbmRleDtcbiAgICBpLmluaXRCdWZmZXIgPSBbXTsgIFxuICAgIHJldHVybiBpOyAgICBcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24oIGNvbnN0cnVjdGVkICl7XG4gICAgdmFyIGkgPSBjb25zdHJ1Y3RlZDtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBXcmFwcGVyKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwQ29udGVudCggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXR1cE5hdmlnYXRpb24oIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBJbmRpY2F0b3JzKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwTWV0YUNvbnRyb2xzKCBpICk7XG4gICAgICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cFdyYXBwZXI6IGZ1bmN0aW9uKCBpICl7XG4gICAgaS5pbnRlcmFjdGlvbiA9ICQoIGkud3JhcHBlciApO1xuICAgIHZhciBpbnRlcmFjdGlvbkNvdW50ID0gaS5pbnRlcmFjdGlvbi5sZW5ndGggfHwgMDtcbiAgICBpZiggaW50ZXJhY3Rpb25Db3VudCA8IDEgKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbm8gaW50ZXJhY2l0b24gZm91bmQnKVxuICAgIH1cbiAgICBpZiggaW50ZXJhY3Rpb25Db3VudCA+IDEgKXtcbiAgICAgIGkud2FybmluZ3MucHVzaCgnbXVsdGlwbGUgaW50ZXJhY3Rpb25zIGZvdW5kJylcbiAgICB9XG4gICAgaS53YXJuKCk7ICAgIFxuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cENvbnRlbnQ6IGZ1bmN0aW9uKCBpICl7XG4gICAgaS5jb250ZW50QXJlYXMgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLmNvbnRlbnQgKTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0dXBJbmRpY2F0b3JzOiBmdW5jdGlvbiggaSApe1xuICAgIHZhciBjb250ZW50Q291bnQsIGluZGljYXRvckNvdW50O1xuICAgIGkuaW5kaWNhdG9ycyA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkuaW5kaWNhdG9ycyApO1xuXG4gICAgY29udGVudENvdW50ID0gaS5jb250ZW50QXJlYXMubGVuZ3RoIHx8IDA7XG4gICAgaW5kaWNhdG9yQ291bnQgPSBpLmluZGljYXRvcnMubGVuZ3RoIHx8IDA7ICAgIFxuXG4gICAgaWYoIGNvbnRlbnRDb3VudCArIGluZGljYXRvckNvdW50IDwgMSl7XG4gICAgICBpLndhcm5pbmdzLnB1c2goJ25vIGNvbnRlbnQgZm91bmQnKTtcbiAgICB9XG4gICAgaS53YXJuKCk7XG4gICAgcmV0dXJuIGk7IFxuICB9LFxuICBzZXR1cE5hdmlnYXRpb246IGZ1bmN0aW9uKCBpICl7XG4gICAgdmFyIHByZXZDb3VudCwgbmV4dENvdW50LCB0YXJnZXRDb3VudDtcbiAgICBpLm5hdmlnYXRpb24udGFyZ2V0cz0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnRhcmdldHMgKTtcbiAgICBpLm5hdmlnYXRpb24ucHJldiAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnByZXYgKTtcbiAgICBpLm5hdmlnYXRpb24ubmV4dCAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLm5leHQgKTtcbiAgICBpLm5hdmlnYXRpb24ucHJlY2xpY2sgPSBbXTtcbiAgICBwcmV2Q291bnQgPSBpLm5hdmlnYXRpb24ucHJldi5sZW5ndGggfHwgMDtcbiAgICBuZXh0Q291bnQgPSBpLm5hdmlnYXRpb24ubmV4dC5sZW5ndGggfHwgMDsgXG4gICAgdGFyZ2V0Q291bnQgPSBpLm5hdmlnYXRpb24udGFyZ2V0cy5sZW5ndGggfHwgMDsgXG5cbiAgICBpZiggcHJldkNvdW50ICsgbmV4dENvdW50ICsgdGFyZ2V0Q291bnQgPCAxICl7XG4gICAgICBpLndhcm5pbmdzLnB1c2goJ25vIG5hdmlnYXRpb24gZm91bmQnKTtcbiAgICB9XG4gICAgaS53YXJuKCk7XG4gICAgcmV0dXJuIGk7IFxuICB9LFxuICBnZXRJbmRleDogZnVuY3Rpb24gZ2V0SW5kZXgoIGMsIHMsIGVsKXtcbiAgICByZXR1cm4gdGhpcy5nZXQoYywgcykuaW5kZXgoZWwpO1xuICB9LFxuICBzZXR1cE1ldGFDb250cm9sczogZnVuY3Rpb24oIGkgKXtcbiAgICBpLm5hdmlnYXRpb24uY2xlYXIgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuY2xlYXIgKTtcbiAgICBpLm5hdmlnYXRpb24uc3RhcnQgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuc3RhcnQgKTtcbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgZmluZEluSW50ZXJhY3Rpb246IGZ1bmN0aW9uKCBpLCBzZWxlY3RvciApe1xuICAgIGlmKCAkKCBpLmludGVyYWN0aW9uICkuZmluZCggc2VsZWN0b3IgKS5sZW5ndGggPiAwICl7XG4gICAgICByZXR1cm4gJCggaS5pbnRlcmFjdGlvbiApLmZpbmQoIHNlbGVjdG9yICk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZ2V0RGVwdGg6IGZ1bmN0aW9uIGdldERlcHRoKCBjLCBzICl7XG4gICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzWyBjIF07ICAgIFxuICAgIGlmKCBzICE9PSB1bmRlZmluZWQgKXtcbiAgICAgIGNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uWyBzIF07XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9LCAgXG59OyIsInZhciBDbGlja2FibGVDb250cm9sbGVyID0gZnVuY3Rpb24oIGNvbnN0cnVjdG9yICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggY29uc3RydWN0b3IgKTtcbiAgICB0aGlzLmV4dGVuZC5jYWxsKCB0aGlzLmNvbnN0cnVjdGVkLCB0aGlzICkgIDtcbiAgICB0aGlzLmNvbnN0cnVjdGVkLmluaXQoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgICB0aGlzLmNvbnN0cnVjdGVkLmluaXRCdWZmZXIucHVzaCggdGhpcy5zdGFydFNjcmVlbiApO1xuXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0ZWQ7ICBcbn07XG5DbGlja2FibGVDb250cm9sbGVyLnByb3RvdHlwZSA9IHtcbiAgZXh0ZW5kOiBmdW5jdGlvbiggb2JqICl7XG4gICAgZm9yKCB2YXIgYXR0ciBpbiBvYmogKXtcbiAgICAgIGlmKCBvYmouaGFzT3duUHJvcGVydHkoIGF0dHIgKSA9PT0gZmFsc2UgKXtcbiAgICAgICAgdGhpc1sgYXR0ciBdID0gb2JqWyBhdHRyIF07XG4gICAgICB9XG4gICAgfVxuICB9LCBcbiAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLm5hdmlnYXRpb24udHlwZSA9ICdpbml0aWFsJztcbiAgICB0aGlzLnNldHVwRXZlbnRzKCApO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBzdGFydFNjcmVlbjogZnVuY3Rpb24oICl7XG4gICAgaWYoIHRoaXMubmF2aWdhdGlvbi5zdGFydCApe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdvVG8oIDAgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgZ29UbzogZnVuY3Rpb24oIGluZGV4ICl7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4OyAgICAgIFxuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIHByZXY6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kZWNyZW1lbnRJbmRleCgpO1xuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIG5leHQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5pbmNyZW1lbnRJbmRleCgpOyAgICBcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMubWFrZUFjdGl2ZSgpO1xuICB9LFxuICByZXNldDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMuY2xlYXJOYXZpZ2F0aW9uVHlwZSgpO1xuICAgIGNvbnNvbGUubG9nKCdoZWxsbycpICAgICAgICBcbiAgfSwgIFxuICBkZWNyZW1lbnRJbmRleDogZnVuY3Rpb24oKXtcbiAgICBpZih0aGlzLmluZGV4ICA+IDApe1xuICAgICAgdGhpcy5pbmRleCAgLS07XG4gICAgfWVsc2UgaWYodGhpcy5pbmZpbml0ZSl7XG4gICAgICB0aGlzLmluZGV4ICA9IHRoaXMudG90YWwgLTE7XG4gICAgfVxuICB9LFxuICBpbmNyZW1lbnRJbmRleDogZnVuY3Rpb24oKXtcbiAgICBpZih0aGlzLmluZGV4ICA8IHRoaXMudG90YWwgLTEpe1xuICAgICAgdGhpcy5pbmRleCAgKys7ICAgICAgXG4gICAgfSBlbHNlIGlmKHRoaXMuaW5maW5pdGUpIHtcbiAgICAgIHRoaXMuaW5kZXggID0gMDtcbiAgICB9XG4gIH0sXG4gIHNldHVwRXZlbnRzOiBmdW5jdGlvbiBzZXR1cEV2ZW50cyggKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQoIHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3ByZXYnKSApLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCQodGhpcykgKTtcbiAgICAgIHNlbGYucHJldigpO1xuICAgICAgc2VsZi5zZXROYXZpZ2F0aW9uVHlwZSggJ2xpbmVhcicgKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ25leHQnKSkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICQodGhpcykgKTsgICAgIFxuICAgICAgc2VsZi5uZXh0KCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQodGhpcy5nZXQoJ25hdmlnYXRpb24nLCAnY2xlYXInKSkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTsgICAgICBcbiAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICQodGhpcykgKTtcbiAgICAgIHNlbGYucmVzZXQoKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3N0YXJ0JykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZWxmLmNhbGxQcmVjbGlja0Z1bmNzKCAkKHRoaXMpICk7XG4gICAgICBzZWxmLmdvVG8oMCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQoIHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnKSApLmNsaWNrKGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHNlbGYuY2FsbFByZWNsaWNrRnVuY3MoICQodGhpcykgKTtcbiAgICAgICAgc2VsZi5nb1RvKCBzZWxmLmdldEluZGV4KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnLCB0aGlzKSApO1xuICAgICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAndGFyZ2V0dGVkJyk7XG4gICAgfSk7XG4gIH0sXG4gIGNhbGxQcmVjbGlja0Z1bmNzOiBmdW5jdGlvbiBjYWxsUHJlY2xpY2tGdW5jcyggZWwgKXtcbiAgICB2YXIgYnVmZmVyID0gdGhpcy5nZXQoJ25hdmlnYXRpb24nLCAncHJlY2xpY2snICk7XG4gICAgZm9yKGxldCBmdW5jIGluIGJ1ZmZlciApe1xuICAgICAgYnVmZmVyW2Z1bmNdLmNhbGwoIHRoaXMsIGVsICk7XG4gICAgfSAgXG4gIH0sXG4gIHNldE5hdmlnYXRpb25UeXBlOiBmdW5jdGlvbih0eXBlKXtcbiAgICB0aGlzLmNsZWFyTmF2aWdhdGlvblR5cGUoKTtcbiAgICB0aGlzLm5hdmlnYXRpb24udHlwZSA9IHR5cGU7XG4gICAgdGhpcy5hZGRDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCB0aGlzLm5hdmlnYXRpb24udHlwZSk7XG4gICAgaWYodHlwZSAhPT0gJ3N0YXJ0Jyl7XG4gICAgICB0aGlzLmFkZENsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sICduYXZpZ2F0ZWQnKTtcbiAgICB9XG5cbiAgfSxcbiAgY2xlYXJOYXZpZ2F0aW9uVHlwZTogZnVuY3Rpb24oKXtcbiAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sIHRoaXMubmF2aWdhdGlvbi50eXBlKTtcbiAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKHRoaXMuaW50ZXJhY3Rpb24sICduYXZpZ2F0ZWQnKTtcbiAgfSxcbiAgbWFrZUFjdGl2ZTogZnVuY3Rpb24oKXtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmluZGV4LFxuICAgICAgICBhcmVhcyA9IHRoaXMuZ2V0KCAnY29udGVudEFyZWFzJyApLFxuICAgICAgICBpbmRpY2F0b3JzID0gdGhpcy5nZXQoICdpbmRpY2F0b3JzJyApLFxuICAgICAgICBjb3VudDEgPSBhcmVhcyA/ICBhcmVhcy5sZW5ndGggOiAwLFxuICAgICAgICBjb3VudDIgPSBpbmRpY2F0b3JzID8gaW5kaWNhdG9ycy5sZW5ndGggOiAwO1xuXG4gICAgaWYoICF0aGlzLnRvZ2dsZSB8fCBhcmVhcy5hY3RpdmUgIT09IGluZGV4ICl7XG4gICAgICB0aGlzLmFkZEludGVyYWN0aW9uQWN0aXZlQ2xhc3MoKTsgICAgICBcbiAgICAgIGlmKCBjb3VudDEgPiAwICkgeyBcbiAgICAgICAgdGhpcy5hZGRDbGFzc1NWRyggYXJlYXNbIGluZGV4IF0sICdhY3RpdmUnICk7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NTVkcoIGFyZWFzWyBpbmRleCBdLCAnanMtYWN0aXZlJyApO1xuICAgICAgICBhcmVhcy5hY3RpdmUgPSBpbmRleCA7ICAgICAgICBcbiAgICAgIH1cbiAgICAgIGlmKCBjb3VudDIgPiAwICl7IFxuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBpbmRpY2F0b3JzWyBpbmRleCBdLCAndmlzaXRlZCcgKTtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggaW5kaWNhdG9yc1sgaW5kZXggXSwgJ2pzLXZpc2l0ZWQnICk7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NTVkcoIGluZGljYXRvcnNbIGluZGV4IF0sICdhY3RpdmUnICk7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NTVkcoIGluZGljYXRvcnNbIGluZGV4IF0sICdqcy1hY3RpdmUnICk7XG4gICAgICB9XG4gICAgICBpZiggY291bnQxICsgY291bnQyIDwgMSApe1xuICAgICAgICB0aGlzLndhcm5pbmdzLnB1c2goJ25vIGNvbnRlbnQgdG8gYWN0aXZhdGUnKTtcbiAgICAgICAgdGhpcy53YXJuKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGFyZWFzLmFjdGl2ZSA9IGZhbHNlO1xuICB9LFxuICBtYWtlQWxsSW5hY3RpdmU6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGFyZWFzID0gdGhpcy5nZXQoICdjb250ZW50QXJlYXMnICksXG4gICAgICAgIGluZGljYXRvcnMgPSB0aGlzLmdldCggJ2luZGljYXRvcnMnICksXG4gICAgICAgIGNvdW50MSA9IGFyZWFzID8gIGFyZWFzLmxlbmd0aCA6IDAsXG4gICAgICAgIGNvdW50MiA9IGluZGljYXRvcnMgPyBpbmRpY2F0b3JzLmxlbmd0aCA6IDA7XG4gICAgaWYoIGNvdW50MSA+IDAgKXtcbiAgICAgIHRoaXMucmVtb3ZlQ2xhc3NTVkcoIGFyZWFzLCAnYWN0aXZlJyApO1xuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggYXJlYXMsICdqcy1hY3RpdmUnICk7XG4gICAgfVxuICAgIGlmKCBjb3VudDIgPiAwICl7XG4gICAgICB0aGlzLm1ha2VJbmRpY2F0b3JWaXNpdGVkKCk7ICAgXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBpbmRpY2F0b3JzLCAnYWN0aXZlJyApO1xuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggaW5kaWNhdG9ycywgJ2pzLWFjdGl2ZScgKTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVJbnRlcmFjdGlvbkFjdGl2ZUNsYXNzKCk7XG4gIH0sXG4gIGFkZEludGVyYWN0aW9uQWN0aXZlQ2xhc3M6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5hZGRDbGFzc1NWRyggdGhpcy5pbnRlcmFjdGlvbiwgJ2FjdGl2ZS0nICsgdGhpcy5pbmRleFByZWZpeCArIHRoaXMuaW5kZXggKTtcbiAgfSxcbiAgcmVtb3ZlSW50ZXJhY3Rpb25BY3RpdmVDbGFzczogZnVuY3Rpb24oKXtcbiAgICBmb3IodmFyIGkgPSAwOyBpPCB0aGlzLnRvdGFsOyBpKyspe1xuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCAnYWN0aXZlLScrIHRoaXMuaW5kZXhQcmVmaXggKyBpICk7XG4gICAgfVxuICB9LFxuICBtYWtlSW5kaWNhdG9yVmlzaXRlZDogZnVuY3Rpb24oKXtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgJCggdGhpcy5nZXQoICdpbmRpY2F0b3JzJyApICkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgaWYoJCh0aGlzKS5hdHRyKCdjbGFzcycpLmluZGV4T2YoJ2pzLWFjdGl2ZScpID4gMCApIHtcbiAgICAgICAgc2VsZi5hZGRDbGFzc1NWRyh0aGlzLCAndmlzaXRlZCcpO1xuICAgICAgICBzZWxmLmFkZENsYXNzU1ZHKHRoaXMsICdqcy12aXNpdGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIGFkZENsYXNzU1ZHOiBmdW5jdGlvbihlbGVtLCBuZXdDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT0gdW5kZWZpbmVkICl7XG4gICAgICByZXR1cm47XG4gICAgfSAgICAgIFxuICAgIGlmKGVsZW0ubGVuZ3RoID4gMCl7XG4gICAgICB0aGlzLmFkZE11bHRpcGxlQ2xhc3NlcyhlbGVtLCBuZXdDbGFzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkU2luZ3VsYXJDbGFzcyhlbGVtLCBuZXdDbGFzcyk7XG4gICAgfVxuICB9LFxuICBhZGRTaW5ndWxhckNsYXNzOiBmdW5jdGlvbihlbGVtLCBuZXdDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT09IHVuZGVmaW5lZCApeyByZXR1cm47IH0gICAgXG4gICAgdmFyIHRlbXBDbGFzcyA9ICQoZWxlbSkuYXR0cignY2xhc3MnKTtcbiAgICAkKGVsZW0pLmF0dHIoJ2NsYXNzJywgdGVtcENsYXNzICsgJyAnICtuZXdDbGFzcyk7XG4gIH0sXG4gIGFkZE11bHRpcGxlQ2xhc3NlczogZnVuY3Rpb24oZWxlbXMsIG5ld0NsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzO1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IGVsZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRlbXBDbGFzcyA9ICQoZWxlbXNbaV0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycsIHRlbXBDbGFzcyArICcgJyArbmV3Q2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlQ2xhc3NTVkc6IGZ1bmN0aW9uKGVsZW0sIHJlbW92ZWRDbGFzcyl7XG4gICAgaWYoIGVsZW0gPT0gdW5kZWZpbmVkICl7XG4gICAgICByZXR1cm47XG4gICAgfSAgICBcbiAgICBpZihlbGVtLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy5yZW1vdmVNdWx0aXBsZUNsYXNzZXMoZWxlbSwgcmVtb3ZlZENsYXNzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVTaW5ndWxhckNsYXNzKGVsZW0sIHJlbW92ZWRDbGFzcyk7XG4gICAgfVxuICB9LFxuICByZW1vdmVTaW5ndWxhckNsYXNzOiBmdW5jdGlvbihlbGVtLCByZW1vdmVkQ2xhc3Mpe1xuICAgIHZhciB0ZW1wQ2xhc3MgPSAkKGVsZW0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgdmFyIG5ld0NsYXNzICA9IHRlbXBDbGFzcy5yZXBsYWNlKCcgJytyZW1vdmVkQ2xhc3MsICcnKTtcbiAgICAkKGVsZW0pLmF0dHIoJ2NsYXNzJywgbmV3Q2xhc3MpO1xuICB9LFxuICByZW1vdmVNdWx0aXBsZUNsYXNzZXM6IGZ1bmN0aW9uKGVsZW1zLCByZW1vdmVkQ2xhc3Mpe1xuICAgIHZhciB0ZW1wQ2xhc3MsIG5ld0NsYXNzO1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IGVsZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRlbXBDbGFzcyA9ICQoZWxlbXNbaV0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgICBuZXdDbGFzcyAgPSB0ZW1wQ2xhc3MucmVwbGFjZSgnICcrcmVtb3ZlZENsYXNzLCAnJyk7XG4gICAgICAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycsIG5ld0NsYXNzKTtcbiAgICB9XG4gIH0sICBcbn07IiwidmFyIENsaWNrYWJsZUNvbnRleHQgPSBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggY29uc3RydWN0ZWQgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICBpZiggdGhpcy5jb25zdHJ1Y3RlZC5jb250ZXh0ICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuZXN0YWJsaXNoQ29sbGVjdGlvbnMoIHRoaXMuY29uc3RydWN0ZWQpO1xuICAgIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLnNvcnRDb2xsZWN0aW9ucyggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICAgIHRoaXMuY29uc3RydWN0ZWQgPSB0aGlzLm92ZXJyaWRlRGVmYXVsdHMoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmNvbnN0cnVjdGVkO1xufTtcblxuQ2xpY2thYmxlQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uIGluaXQoIGkgKXtcbiAgICBpID0gdGhpcy5zZXRJbml0aWFsRGF0YSggaSApO1xuICAgIGkgPSB0aGlzLnNldFRvdGFsRGF0YSggaSApO1xuICAgIGkgPSB0aGlzLnNldEluZGV4RGF0YSggaSApO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBvdmVycmlkZURlZmF1bHRzOiBmdW5jdGlvbiBvdmVycmlkZURlZmF1bHRzKCBpICl7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXgnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleFsgdGhpcy5jb250ZXh0IF07XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleFsgdGhpcy5jb250ZXh0IF0gPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXhQcmVmaXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsICAgICAgXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQgKyAnLSc7XG4gICAgICB9XG4gICAgfSk7IFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3RvdGFsJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdID0gdmFsO1xuICAgICAgfVxuICAgIH0pOyAgICBcbiAgICBpLmdldCA9IHRoaXMuZ2V0Q29udGV4dERlcHRoO1xuICAgIGkuZ2V0SW5kZXggPSB0aGlzLmdldENvbnRleHRJbmRleDtcbiAgICBpLmluaXRCdWZmZXIucHVzaCggdGhpcy5jb250ZXh0SW5pdCApO1xuICAgIHJldHVybiBpOyAgXG4gIH0sXG4gIGNvbnRleHRJbml0OiBmdW5jdGlvbiBjb250ZXh0SW5pdCgpe1xuICAgIGlmKCB0aGlzLl90b3RhbC5oYXNPd25Qcm9wZXJ0eSgnY29udGV4dF9kZWZhdWx0Jykpe1xuICAgICAgdGhpcy5jb250ZXh0ID0gJ2NvbnRleHRfZGVmYXVsdCc7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvcih2YXIgZmlyc3QgaW4gdGhpcy5fdG90YWwpe1xuICAgICAgdGhpcy5jb250ZXh0ID0gZmlyc3Q7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH0sXG4gIHNldEluaXRpYWxEYXRhOiBmdW5jdGlvbiBzZXRJbml0aWFsZGF0YSggaSApe1xuICAgIGkuY29udGV4dCA9IGZhbHNlO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBmaW5kQ29udGV4dENvdW50OiBmdW5jdGlvbiBmaW5kQ29udGV4dENvdW50KCBlbCApe1xuICAgIHZhciBpbmRpY2VzID0ge30sIHNlbGYgPSB0aGlzO1xuICAgICQoIGVsICkuZWFjaCggZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjID0gJCh0aGlzKS5kYXRhKCdjb250ZXh0Jyk7XG4gICAgICBpbmRpY2VzID0gc2VsZi5hZGRUb09ySW5pdCggaW5kaWNlcywgYyApO1xuICAgIH0pO1xuICAgIHJldHVybiBpbmRpY2VzO1xuICB9LFxuICBtZXJnZUZvck1heDogZnVuY3Rpb24gbWVyZ2VGb3JNYXgoIG9iajEsIG9iajIgKXtcbiAgICB2YXIgbWVyZ2VkID0gb2JqMTtcbiAgICBmb3IoIHZhciBwcm9wIGluIG9iajIgKXtcbiAgICAgIGlmKCBtZXJnZWRbcHJvcF0gPT09IHVuZGVmaW5lZCB8fCBtZXJnZWRbcHJvcF0gPCBvYmoyW3Byb3BdKXtcbiAgICAgICAgbWVyZ2VkW3Byb3BdID0gb2JqMltwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfSxcbiAgc2V0VG90YWxEYXRhOiBmdW5jdGlvbiBzZXRUb3RhbERhdGEoIGkgKXtcbiAgICB2YXIgY29udGVudHMgPSB0aGlzLmZpbmRDb250ZXh0Q291bnQoIGkuY29udGVudEFyZWFzICk7XG4gICAgdmFyIGluZGljYXRvcnMgPSB0aGlzLmZpbmRDb250ZXh0Q291bnQoIGkuaW5kaWNhdG9ycyApO1xuICAgIHZhciBjb250ZXh0cyA9IHRoaXMubWVyZ2VGb3JNYXgoIGNvbnRlbnRzLCBpbmRpY2F0b3JzICk7XG4gICAgZm9yKCB2YXIgY29udGV4dCBpbiBjb250ZXh0cyApe1xuICAgICAgaWYoIGNvbnRleHQgIT09ICdjb250ZXh0X2RlZmF1bHQnICl7XG4gICAgICAgIGkuY29udGV4dCA9IHRydWU7XG4gICAgICAgIGkuX3RvdGFsID0gY29udGV4dHM7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0SW5kZXhEYXRhOiBmdW5jdGlvbiBzZXRJbmRleERhdGEoIGkgKXtcbiAgICBpZiggIWkuY29udGV4dCApe1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICAgIGkuX2luZGV4ID0ge307XG4gICAgZm9yKCB2YXIgY29udGV4dCBpbiBpLnRvdGFsICl7XG4gICAgICBpLl9pbmRleFsgY29udGV4dCBdID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGFkZFRvT3JJbml0OiBmdW5jdGlvbiBhZGRUb09ySW5pdCggb2JqLCBwcm9wICl7XG4gICAgdmFyIHByb3BlcnR5ID0gcHJvcCB8fCAnZGVmYXVsdCc7XG4gICAgdmFyIGtleSA9ICdjb250ZXh0XycgKyBwcm9wZXJ0eTtcbiAgICBpZiggb2JqLmhhc093blByb3BlcnR5KCBrZXkgKSApe1xuICAgICAgb2JqWyBrZXkgXSArPSAxO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gICAgb2JqWyBrZXkgXSA9IDE7XG4gICAgcmV0dXJuIG9iajtcbiAgfSxcbiAgZXN0YWJsaXNoQ29sbGVjdGlvbnM6IGZ1bmN0aW9uIGVzdGFibGlzaENvbGxlY3Rpb25zKCBpICl7XG4gICAgZm9yKCBsZXQga2V5IGluIGkuX3RvdGFsICl7XG4gICAgICBpLmNvbnRlbnRBcmVhc1trZXldID0gJCgpO1xuICAgICAgaS5pbmRpY2F0b3JzW2tleV0gPSAkKCk7XG4gICAgICBpLm5hdmlnYXRpb24udGFyZ2V0c1trZXldID0gJCgpO1xuICAgICAgaS5uYXZpZ2F0aW9uLnByZXZba2V5XSA9ICQoKTsgICAgXG4gICAgICBpLm5hdmlnYXRpb24ubmV4dFtrZXldID0gJCgpOyAgICAgIFxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc29ydENvbGxlY3Rpb25zOiBmdW5jdGlvbiBzb3J0Q29sbGVjdGlvbnMoIGkgKXtcbiAgICBpLmNvbnRlbnRBcmVhcyA9IHRoaXMuY29udGV4dFNvcnQoIGksICdjb250ZW50QXJlYXMnICk7ICBcbiAgICBpLmluZGljYXRvcnMgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnaW5kaWNhdG9ycycgKTtcbiAgICB0aGlzLndhcm5BYm91dENvbnRlbnQoIGkgKTtcbiAgICBpLm5hdmlnYXRpb24udGFyZ2V0cyA9IHRoaXMuY29udGV4dFNvcnQoIGksICduYXZpZ2F0aW9uJywgJ3RhcmdldHMnICk7XG4gICAgaS5uYXZpZ2F0aW9uLnByZXYgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnbmF2aWdhdGlvbicsICdwcmV2JyApOyAgICBcbiAgICBpLm5hdmlnYXRpb24ubmV4dCA9IHRoaXMuY29udGV4dFNvcnQoIGksICduYXZpZ2F0aW9uJywgJ25leHQnICk7XG4gICAgaS5uYXZpZ2F0aW9uLnByZWNsaWNrLnB1c2godGhpcy5wYXJzZUNvbnRleHQpO1xuICAgIHRoaXMud2FybkFib3V0TmF2aWdhdGlvbiggaSApO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBjb250ZXh0U29ydDogZnVuY3Rpb24gY29udGV4dFNvcnQoIGksIGNvbGxlY3Rpb24sIHN1YiApe1xuICAgIHZhciBhbGwgPSBpLmdldCggY29sbGVjdGlvbiwgc3ViICksXG4gICAgICAgIHNlbGYgPSB0aGlzLCBcbiAgICAgICAgb25jbGljaztcblxuICAgICQoYWxsKS5maWx0ZXIoIGZ1bmN0aW9uKCl7XG5cbiAgICAgIHJldHVybiAkKHRoaXMpO1xuXG4gICAgfSApLmVhY2goIGZ1bmN0aW9uKCl7XG5cbiAgICAgIHZhciBjID0gc2VsZi5zZXRDb250ZXh0S2V5KCAkKHRoaXMpICk7XG4gICAgICAkKHRoaXMpLmRhdGEoJ2luZGV4JywgYWxsW2NdLmxlbmd0aCk7XG4gICAgICBhbGxbY10gPSAkKGFsbFtjXSkuYWRkKCAkKHRoaXMpICk7ICAgXG4gICAgfSk7XG5cbiAgICByZXR1cm4gYWxsO1xuICB9LFxuICB3YXJuQWJvdXROYXZpZ2F0aW9uOiBmdW5jdGlvbiB3YXJuQWJvdXROYXZpZ2F0aW9uKCBpICl7XG4gICAgZm9yKCB2YXIga2V5IGluIGkuX2luZGV4ICl7XG4gICAgICBpZiggaS5uYXZpZ2F0aW9uLnRhcmdldHNbIGtleSBdLmxlbmd0aCA8IDEgJiYgXG4gICAgICAgIGkubmF2aWdhdGlvbi5wcmV2WyBrZXkgXS5sZW5ndGggPCAxICYmXG4gICAgICAgIGkubmF2aWdhdGlvbi5uZXh0WyBrZXkgXS5sZW5ndGggPCAxICl7XG4gICAgICAgIGkud2FybmluZ3MucHVzaChgdGhlcmUgaXMgbm8gbmF2Z2F0aW9uIGZvciB0aGUgY29udGV4dCAke2tleX1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaS53YXJuKCk7XG4gIH0sXG4gIHdhcm5BYm91dENvbnRlbnQ6IGZ1bmN0aW9uIHdhcm5BYm91dENvbnRlbnQoIGkgKXtcbiAgICBmb3IoIHZhciBrZXkgaW4gaS5faW5kZXggKXtcbiAgICAgIGlmKCBpLmNvbnRlbnRBcmVhc1sga2V5IF0ubGVuZ3RoIDwgMSAmJiBcbiAgICAgICAgaS5pbmRpY2F0b3JzWyBrZXkgXS5sZW5ndGggPCAxICl7XG4gICAgICAgIGkud2FybmluZ3MucHVzaChgdGhlcmUgaXMgbm8gY29udGVudCBmb3IgdGhlIGNvbnRleHQgJHtrZXl9YCk7XG4gICAgICB9XG4gICAgfVxuICAgIGkud2FybigpO1xuICB9LFxuICBwYXJzZUNvbnRleHQ6IGZ1bmN0aW9uIHBhcnNlQ29udGV4dCggZWwgKXtcbiAgICBpZiggZWwgIT09IHVuZGVmaW5lZCAmJiAkKCBlbCApLmRhdGEoJ2NvbnRleHQnKSApe1xuICAgICAgdGhpcy5jb250ZXh0ID0gJ2NvbnRleHRfJyArICQoIGVsICkuZGF0YSggJ2NvbnRleHQnICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY29udGV4dCA9ICdjb250ZXh0X2RlZmF1bHQnO1xuICB9LCAgXG4gIGdldENvbnRleHRJbmRleDogZnVuY3Rpb24gZ2V0Q29udGV4dEluZGV4KCBjLCBzLCBlbCl7XG4gICAgcmV0dXJuICQoZWwpLmRhdGEoJ2luZGV4Jyk7XG4gIH0sICBcbiAgZ2V0Q29udGV4dERlcHRoOiBmdW5jdGlvbiBnZXRDb250ZXh0RGVwdGgoIGMsIHMgKXtcblxuICAgIHZhciBjb2xsZWN0aW9uID0gdGhpc1sgYyBdO1xuXG4gICAgaWYoIHMgIT09IHVuZGVmaW5lZCApe1xuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25bIHMgXTtcbiAgICAgIGlmKCBjb2xsZWN0aW9uID09PSB1bmRlZmluZWQgKXtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYoIHRoaXMuY29udGV4dCA9PT0gdHJ1ZSApe1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICAgIH0gICAgICBcbiAgICB9XG4gICAgaWYoY29sbGVjdGlvblsgdGhpcy5jb250ZXh0IF0gPT09IHVuZGVmaW5lZCApe1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uWyB0aGlzLmNvbnRleHQgXTsgICAgXG4gIH0sXG5cbiAgc2V0Q29udGV4dEtleTogZnVuY3Rpb24gc2V0Q29udGV4dEtleSggZWwgKXtcbiAgICB2YXIgY3R4ID0gZWwuZGF0YSggJ2NvbnRleHQnICkgfHwgJ2RlZmF1bHQnO1xuICAgIHJldHVybiAnY29udGV4dF8nICsgY3R4O1xuICB9IFxufTsiLCIoZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcblxuXHRpZiAoIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcgKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuZG9jdW1lbnQgP1xuXHRcdFx0ZmFjdG9yeSggZ2xvYmFsLCB0cnVlICkgOlxuXHRcdFx0ZnVuY3Rpb24oIHcgKSB7XG5cdFx0XHRcdGlmICggIXcuZG9jdW1lbnQgKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCAncmVxdWlyZXMgYSB3aW5kb3cgd2l0aCBhIGRvY3VtZW50JyApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWN0b3J5KCB3ICk7XG5cdFx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGZhY3RvcnkoIGdsb2JhbCApO1xuXHR9XG5cdC8vIFBhc3MgdGhpcyBpZiB3aW5kb3cgaXMgbm90IGRlZmluZWQgeWV0XG59KHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oIHdpbmRvdywgbm9HbG9iYWwgKSB7XG5cdHZhciBDbGlja2FibGUgPSBmdW5jdGlvbiggYXJncyApe1xuXHRcdHZhciBjb25zdHJ1Y3RlZCA9IHt9O1xuXHQgIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnN0cnVjdG9yKCBhcmdzICk7XG5cdCAgY29uc3RydWN0ZWQgPSBuZXcgQ2xpY2thYmxlQ29udGV4dCggY29uc3RydWN0ZWQgKTtcblx0ICBjb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDb250cm9sbGVyKCBjb25zdHJ1Y3RlZCApOyBcbiAgICBmb3IoIGxldCBpID0gMDsgaTwgY29uc3RydWN0ZWQuaW5pdEJ1ZmZlci5sZW5ndGg7IGkrKyApe1xuICAgIFx0Y29uc3RydWN0ZWQuaW5pdEJ1ZmZlcltpXS5jYWxsKCBjb25zdHJ1Y3RlZCApO1xuICAgIH1cblx0ICByZXR1cm4gY29uc3RydWN0ZWQ7XG5cdH07XG5cdGlmICggdHlwZW9mIG5vR2xvYmFsID09PSAndW5kZWZpbmVkJyApIHtcblx0XHR3aW5kb3cuQ2xpY2thYmxlID0gQ2xpY2thYmxlO1xuXHR9XG5cblx0cmV0dXJuIENsaWNrYWJsZTtcblxufSkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9