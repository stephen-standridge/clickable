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
    Object.defineProperty(i, 'printIndex', {
      configurable: true,
      get: function get() {
        return this._index;
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
    i.indicators = this.findInInteraction(i, i.indicators);
    if (!i.contentAreas.length > 0 && !i.indicators.length > 0) {
      i.warnings.push('no content found');
    }
    i.warn();
    return i;
  },
  setupNavigation: function setupNavigation(i) {
    i.navigation.targets = this.findInInteraction(i, i.navigation.targets);
    i.navigation.prev = this.findInInteraction(i, i.navigation.prev);
    i.navigation.next = this.findInInteraction(i, i.navigation.next);
    if (!i.navigation.targets.length > 0 && !i.navigation.prev.length > 0 && !i.navigation.next.length > 0) {
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
    for (var attr in obj.__proto__) {
      if (obj.__proto__.hasOwnProperty(attr)) {
        this[attr] = obj.__proto__[attr];
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
      var buffer = self.get('navigation', 'prev').preclick;
      for (var func in buffer) {
        buffer[func]();
      }
      self.prev();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'next')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'next').preclick;
      for (var func in buffer) {
        buffer[func]();
      }
      self.next();
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'clear')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'clear').preclick;
      for (var func in buffer) {
        buffer[func]();
      }
      self.reset();
      self.setNavigationType('initial');
    });
    $(this.get('navigation', 'start')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'start').preclick;
      for (var func in buffer) {
        buffer[func]();
      }
      self.goTo(0);
      self.setNavigationType('linear');
    });
    $(this.get('navigation', 'targets')).click(function (e) {
      e.preventDefault();
      var buffer = self.get('navigation', 'targets').preclick;
      for (var func in buffer) {
        buffer[func]();
      }
      self.goTo(self.get('navigation', 'targets').index(this));
      self.setNavigationType('targetted');
    });
    return i;
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
        indicators = this.get('indicators');

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
      if (!(areas.length + indicators.length > 0)) {
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
    this.addClassSVG(this.interaction, 'active-' + this.printIndex);
  },
  removeInteractionActiveClass: function removeInteractionActiveClass() {
    for (var i = 0; i < this.total; i++) {
      this.removeClassSVG(this.interaction, 'active-' + this.printIndex);
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
    Object.defineProperty(i, 'printIndex', {
      get: function get() {
        return this.context + '-' + this.index;
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
    return i;
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
  setTotalData: function setTotalData(i) {
    var contexts = this.findContextCount(i.contentAreas);
    for (var context in contexts) {
      if (context !== 'context_default') {
        i.context = 'context_default';
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
    var prop = prop || 'default';
    var key = 'context_' + prop;
    if (obj.hasOwnProperty(key)) {
      obj[key] += 1;
      return obj;
    }
    obj[key] = 0;
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

      all = $(all).not($(this));
      return $(this);
    }).each(function () {

      var c = self.setContextKey($(this));
      if (all[c] === undefined) {
        all[c] = $();
      }
      all[c] = $(all[c]).add($(this));
    });
    if (onclick) {
      all.preclick = onclick;
      all.preclick.push(self.parseContext);
    }
    return all;
  },
  warnAboutNavigation: function warnAboutNavigation(i) {
    for (var key in i.index) {
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
  getContextDepth: function getContextDepth(c, s) {
    var collection = this[c][this.context];
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
var Clickable = function Clickable(args) {
  var constructed = {};
  constructed = new ClickableConstructor(args);
  constructed = new ClickableContext(constructed);
  constructed = new ClickableController(constructed);
  return constructed;
};
Clickable.prototype = {
  unpack: function unpack(obj) {
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        this[attr] = obj[attr];
      }
    }
  },
  extend: function extend(obj) {
    for (var attr in obj.__proto__) {
      if (obj.__proto__.hasOwnProperty(attr)) {
        this[attr] = obj.__proto__[attr];
      }
    }
  },
  formatConstructed: function formatConstructed(constructed) {
    var i = constructed || {};
    i.warnings = [];
    if (constructed === undefined) {
      i.warnings.push('a context needs a valid clickable constructor to do anything');
      this.warn(i);
      return i;
    }
    return i;
  },
  warn: function warn(i) {
    for (var j = 0; j < i.warnings.length; j++) {
      console.warn(i.warnings[j]);
    }
  }
};

// if( $('.js-history-interaction').length > 0 ){
//   new Clickable('.js-history-interaction');

// }
// if( $('.js-principles-interaction').length > 0 ){
//   var thing = new Clickable('.js-principles-interaction', true);
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWNrYWJsZUNhdXRpb25zLmpzIiwiQ2xpY2thYmxlQ29uc3RydWN0b3IuanMiLCJDbGlja2FibGVDb250cm9sbGVyLmpzIiwiQ2xpY2thYmxlQ29udGV4dC5qcyIsIkNsaWNrYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQUksaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLENBQWEsV0FBVyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUM1QyxHQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRSxDQUFDO0FBQzdCLEdBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNYLFNBQU8sQ0FBQyxDQUFDO0NBQ1QsQ0FBQTtBQUNELGlCQUFpQixDQUFDLFNBQVMsR0FBRztBQUM1QixtQkFBaUIsRUFBRSxTQUFTLGlCQUFpQixDQUFFLFdBQVcsRUFBRTtBQUMxRCxRQUFJLENBQUMsR0FBSSxXQUFXLElBQUksRUFBRSxDQUFDO0FBQ3ZCLEtBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUM7QUFDOUIsUUFBSSxXQUFXLEtBQUssU0FBUyxFQUFDO0FBQzVCLE9BQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9EQUFvRCxDQUFDLENBQUM7QUFDdEUsVUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFLENBQUM7QUFDcEIsYUFBTyxDQUFDLENBQUM7S0FDVjtBQUNELFdBQU8sQ0FBQyxDQUFDO0dBQ2Q7QUFDRCxNQUFJLEVBQUUsU0FBUyxJQUFJLEdBQUU7QUFDbkIsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLGFBQU8sQ0FBQyxJQUFJLENB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O0tBQ0Y7R0FDRjtBQUNELG1CQUFpQixFQUFFLFNBQVMsaUJBQWlCLENBQUUsV0FBVyxFQUFFO0FBQzFELFFBQUksQ0FBQyxHQUFJLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDdkIsS0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxXQUFXLEtBQUssU0FBUyxFQUFDO0FBQzVCLE9BQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDhEQUE4RCxDQUFDLENBQUM7QUFDaEYsVUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUUsQ0FBQztBQUNmLGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7QUFDRCxXQUFPLENBQUMsQ0FBQztHQUNkO0FBQ0QsTUFBSSxFQUFFLFNBQVMsSUFBSSxDQUFFLENBQUMsRUFBRTtBQUN0QixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDekMsYUFBTyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7S0FDL0I7R0FDRjtDQUNGLENBQUEiLCJmaWxlIjoiY2xpY2thYmxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIENsaWNrYWJsZUNhdXRpb25zID0gZnVuY3Rpb24oIGNvbnN0cnVjdGVkICl7XG5cdHZhciBpID0gdGhpcy5mb3JtYXRDb25zdHJ1Y3RlZCggY29uc3RydWN0ZWQgKTtcblx0XHRcdGkud2FybiA9IHRoaXMud2Fybi5iaW5kKCBpICk7XG5cdFx0XHRpLndhcm4oKTtcblx0cmV0dXJuIGk7XG59XG5DbGlja2FibGVDYXV0aW9ucy5wcm90b3R5cGUgPSB7XG4gIGZvcm1hdENvbnN0cnVjdGVkOiBmdW5jdGlvbiBmb3JtYXRDb25zdHJ1Y3RlZCggY29uc3RydWN0ZWQgKXtcbiAgICB2YXIgaSAgPSBjb25zdHJ1Y3RlZCB8fCB7fTtcbiAgICAgICAgaS53YXJuaW5ncyA9IGkud2FybmluZ3MgfHwgW107XG4gICAgICAgIGlmKCBjb25zdHJ1Y3RlZCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICBpLndhcm5pbmdzLnB1c2goJ25lZWRzIGEgdmFsaWQgY2xpY2thYmxlIGNvbnN0cnVjdG9yIHRvIGRvIGFueXRoaW5nJyk7XG4gICAgICAgICAgdGhpcy53YXJuLmNhbGwoIGkgKTtcbiAgICAgICAgICByZXR1cm4gaTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGk7XG4gIH0sICBcbiAgd2FybjogZnVuY3Rpb24gd2Fybigpe1xuICAgIGZvciggbGV0IGogPSAwOyBqPCB0aGlzLndhcm5pbmdzLmxlbmd0aDsgaisrICl7XG4gICAgICBjb25zb2xlLndhcm4oIHRoaXMud2FybmluZ3Nbal0gKTtcbiAgICB9XG4gIH1cbn0iLCIndXNlIHN0cmljdCc7XG52YXIgQ2xpY2thYmxlQ29uc3RydWN0b3IgPSBmdW5jdGlvbiggYXJncywgYXV0bz10cnVlICl7XG4gIGxldCBkZWZhdWx0cyA9IHtcbiAgICB3cmFwcGVyOiAnLmpzLWNsaWNrYWJsZS1pbnRlcmFjdGlvbicsXG4gICAgY29udGVudDogJy5qcy1jbGlja2FibGUtY29udGVudC1hcmVhJyxcbiAgICBpbmRpY2F0b3JzOiAnLmpzLWNsaWNrYWJsZS1jb250ZW50LWluZGljYXRvcicsXG4gICAgbmF2aWdhdGlvbjoge1xuICAgICAgdGFyZ2V0czogJy5qcy1jbGlja2FibGUtdGFyZ2V0JyxcbiAgICAgIHByZXY6ICcuanMtY2xpY2thYmxlLXByZXYnLFxuICAgICAgbmV4dDogJy5qcy1jbGlja2FibGUtbmV4dCcsXG4gICAgfSxcbiAgICBtZXRhOiB7XG4gICAgICBjbGVhcjogJy5qcy1jbGlja2FibGUtY2xlYXInLFxuICAgICAgc3RhcnQ6ICcuanMtY2xpY2thYmxlLXN0YXJ0JyxcbiAgICB9LFxuICAgIGluZmluaXRlOiB0cnVlLFxuICAgIHRvZ2dsZTogZmFsc2VcbiAgfTsgIFxuICB0aGlzLmNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNhdXRpb25zKCBkZWZhdWx0cyApO1xuICB0aGlzLmNvbnN0cnVjdGVkID0gdGhpcy5tZXJnZUFyZ3MoIHRoaXMuY29uc3RydWN0ZWQsIGFyZ3MgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuc2V0RGVmYXVsdHMoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgaWYoIGF1dG8gKXtcbiAgICB0aGlzLmNvbnN0cnVjdGVkID0gdGhpcy5pbml0KCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZC50b3RhbCA9IHRoaXMuY29uc3RydWN0ZWQuY29udGVudEFyZWFzLmxlbmd0aCB8fCAwO1xuICB9XG4gIHJldHVybiB0aGlzLmNvbnN0cnVjdGVkO1xufTtcbkNsaWNrYWJsZUNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IHtcbiAgbWVyZ2VBcmdzOiBmdW5jdGlvbiBtZXJnZUFyZ3MoIGRlZmF1bHRzLCBvdmVycmlkZSApe1xuICAgIHZhciBpID0ge31cbiAgICBmb3IoIGxldCBhdHRyIGluIGRlZmF1bHRzICl7XG4gICAgICBpWyBhdHRyIF0gPSBkZWZhdWx0c1sgYXR0ciBdO1xuICAgIH1cbiAgICBmb3IoIGxldCBhdHRyIGluIG92ZXJyaWRlICl7XG4gICAgICBpZiggZGVmYXVsdHNbIGF0dHIgXSAhPT0gdW5kZWZpbmVkICl7XG4gICAgICAgIGlbIGF0dHIgXSA9IG92ZXJyaWRlWyBhdHRyIF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXREZWZhdWx0czogZnVuY3Rpb24oIGNvbnN0cnVjdGVkICl7XG4gICAgdmFyIGkgPSBjb25zdHJ1Y3RlZDtcbiAgICBpLl9pbmRleCA9IDA7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBpLCAnaW5kZXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBpLl9pbmRleDtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKCB2YWwgKXtcbiAgICAgICAgcmV0dXJuIGkuX2luZGV4ID0gdmFsO1xuICAgICAgfVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3ByaW50SW5kZXgnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsICAgICAgXG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbmRleDtcbiAgICAgIH1cbiAgICB9KTsgICAgICAgXG4gICAgaS5fdG90YWwgPSAwO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3RvdGFsJywge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLCAgICAgIFxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gaS5fdG90YWw7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiggdmFsICl7XG4gICAgICAgIHJldHVybiBpLl90b3RhbCA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTsgICAgXG4gICAgaS5nZXQgPSB0aGlzLmdldERlcHRoOyAgICBcbiAgICByZXR1cm4gaTsgICAgXG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uKCBjb25zdHJ1Y3RlZCApe1xuICAgIHZhciBpID0gY29uc3RydWN0ZWQ7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwV3JhcHBlciggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXR1cENvbnRlbnQoIGkgKTtcbiAgICAgICAgaSA9IHRoaXMuc2V0dXBOYXZpZ2F0aW9uKCBpICk7XG4gICAgICAgIGkgPSB0aGlzLnNldHVwSW5kaWNhdG9ycyggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXR1cE1ldGFDb250cm9scyggaSApO1xuICAgICAgICBpID0gdGhpcy5zZXRPbkNsaWNrcyggaSApO1xuICAgICAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0dXBXcmFwcGVyOiBmdW5jdGlvbiggaSApe1xuICAgIGkuaW50ZXJhY3Rpb24gPSAkKCBpLndyYXBwZXIgKTtcbiAgICByZXR1cm4gaVxuICB9LFxuICBzZXR1cENvbnRlbnQ6IGZ1bmN0aW9uKCBpICl7XG4gICAgaS5jb250ZW50QXJlYXMgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLmNvbnRlbnQgKTtcbiAgICByZXR1cm4gaSBcbiAgfSxcbiAgc2V0dXBJbmRpY2F0b3JzOiBmdW5jdGlvbiggaSApe1xuICAgIGkuaW5kaWNhdG9ycyA9IHRoaXMuZmluZEluSW50ZXJhY3Rpb24oIGksIGkuaW5kaWNhdG9ycyApO1xuICAgIGlmKCAhaS5jb250ZW50QXJlYXMubGVuZ3RoID4gMCAmJlxuICAgICAgICAhaS5pbmRpY2F0b3JzLmxlbmd0aCA+IDApe1xuICAgICAgaS53YXJuaW5ncy5wdXNoKCdubyBjb250ZW50IGZvdW5kJylcbiAgICB9XG4gICAgaS53YXJuKCk7XG4gICAgcmV0dXJuIGkgXG4gIH0sXG4gIHNldHVwTmF2aWdhdGlvbjogZnVuY3Rpb24oIGkgKXtcbiAgICBpLm5hdmlnYXRpb24udGFyZ2V0cz0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnRhcmdldHMgKTtcbiAgICBpLm5hdmlnYXRpb24ucHJldiAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLnByZXYgKTtcbiAgICBpLm5hdmlnYXRpb24ubmV4dCAgID0gdGhpcy5maW5kSW5JbnRlcmFjdGlvbiggaSwgaS5uYXZpZ2F0aW9uLm5leHQgKTtcbiAgICBpZiggIWkubmF2aWdhdGlvbi50YXJnZXRzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgIWkubmF2aWdhdGlvbi5wcmV2Lmxlbmd0aCA+IDAgJiZcbiAgICAgICAgIWkubmF2aWdhdGlvbi5uZXh0Lmxlbmd0aCA+IDApe1xuICAgICAgaS53YXJuaW5ncy5wdXNoKCdubyBuYXZpZ2F0aW9uIGZvdW5kJylcbiAgICB9XG4gICAgaS53YXJuKCk7XG4gICAgcmV0dXJuIGkgXG4gIH0sXG4gIHNldE9uQ2xpY2tzOiBmdW5jdGlvbiggaSApe1xuICAgIGZvciggdmFyIG5hdiBpbiBpLm5hdmlnYXRpb24gKSB7XG4gICAgICBpZiggaS5uYXZpZ2F0aW9uWyBuYXYgXSAhPT0gZmFsc2UgKXtcbiAgICAgICAgaS5uYXZpZ2F0aW9uWyBuYXYgXS5wcmVjbGljayA9IFtdOyAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXR1cE1ldGFDb250cm9sczogZnVuY3Rpb24oIGkgKXtcbiAgICBpLm5hdmlnYXRpb24uY2xlYXIgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuY2xlYXIgKTtcbiAgICBpLm5hdmlnYXRpb24uc3RhcnQgPSB0aGlzLmZpbmRJbkludGVyYWN0aW9uKCBpLCBpLm1ldGEuc3RhcnQgKTtcbiAgICByZXR1cm4gaVxuICB9LFxuICBmaW5kSW5JbnRlcmFjdGlvbjogZnVuY3Rpb24oIGksIHNlbGVjdG9yICl7XG4gICAgaWYoICQoIGkuaW50ZXJhY3Rpb24gKS5maW5kKCBzZWxlY3RvciApLmxlbmd0aCA+IDAgKXtcbiAgICAgIHJldHVybiAkKCBpLmludGVyYWN0aW9uICkuZmluZCggc2VsZWN0b3IgKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBnZXREZXB0aDogZnVuY3Rpb24gZ2V0RGVwdGgoIGMsIHMgKXtcbiAgICB2YXIgY29sbGVjdGlvbiA9IHRoaXNbIGMgXTsgICAgXG4gICAgaWYoIHMgIT09IHVuZGVmaW5lZCApe1xuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25bIHMgXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH0sICBcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2xpY2thYmxlQ29udHJvbGxlciA9IGZ1bmN0aW9uKCBjb25zdHJ1Y3RvciApe1xuICAgIHRoaXMuY29uc3RydWN0ZWQgPSBuZXcgQ2xpY2thYmxlQ2F1dGlvbnMoIGNvbnN0cnVjdG9yICk7XG4gICAgdGhpcy5leHRlbmQuY2FsbCggdGhpcy5jb25zdHJ1Y3RlZCwgdGhpcyApICBcbiAgICB0aGlzLmNvbnN0cnVjdGVkLmluaXQoIHRoaXMuY29uc3RydWN0ZWQgKTtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RlZDsgIFxufTtcbkNsaWNrYWJsZUNvbnRyb2xsZXIucHJvdG90eXBlID0ge1xuICBleHRlbmQ6IGZ1bmN0aW9uKCBvYmogKXtcbiAgICBmb3IoIHZhciBhdHRyIGluIG9iai5fX3Byb3RvX18gKXtcbiAgICAgIGlmKCBvYmouX19wcm90b19fLmhhc093blByb3BlcnR5KCBhdHRyICkgKXtcbiAgICAgICAgdGhpc1sgYXR0ciBdID0gb2JqLl9fcHJvdG9fX1sgYXR0ciBdO1xuICAgICAgfVxuICAgIH1cbiAgfSwgXG4gIGluaXQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5uYXZpZ2F0aW9uLnR5cGUgPSAnaW5pdGlhbCc7XG4gICAgdGhpcy5zZXR1cEV2ZW50cyggICk7XG4gICAgdGhpcy5zdGFydFNjcmVlbiggICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHN0YXJ0U2NyZWVuOiBmdW5jdGlvbiggICl7XG4gICAgaWYoIHRoaXMubmF2aWdhdGlvbi5zdGFydCApe1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdvVG8oIDAgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgZ29UbzogZnVuY3Rpb24oIGluZGV4ICl7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4OyAgICAgIFxuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIHByZXY6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kZWNyZW1lbnRJbmRleCgpO1xuICAgIHRoaXMubWFrZUFsbEluYWN0aXZlKCk7XG4gICAgdGhpcy5tYWtlQWN0aXZlKCk7XG4gIH0sXG4gIG5leHQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5pbmNyZW1lbnRJbmRleCgpOyAgICBcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMubWFrZUFjdGl2ZSgpO1xuICB9LFxuICByZXNldDogZnVuY3Rpb24oKXtcbiAgICB0aGlzLm1ha2VBbGxJbmFjdGl2ZSgpO1xuICAgIHRoaXMuY2xlYXJOYXZpZ2F0aW9uVHlwZSgpO1xuICB9LCAgXG4gIGRlY3JlbWVudEluZGV4OiBmdW5jdGlvbigpe1xuXG4gICAgaWYodGhpcy5pbmRleCAgPiAwKXtcbiAgICAgIHRoaXMuaW5kZXggIC0tO1xuICAgIH1lbHNlIGlmKHRoaXMuaW5maW5pdGUpe1xuICAgICAgdGhpcy5pbmRleCAgPSB0aGlzLnRvdGFsIC0xO1xuICAgIH1cbiAgfSxcbiAgaW5jcmVtZW50SW5kZXg6IGZ1bmN0aW9uKCl7XG4gICAgaWYodGhpcy5pbmRleCAgPCB0aGlzLnRvdGFsIC0xKXtcbiAgICAgIHRoaXMuaW5kZXggICsrOyAgICAgIFxuICAgIH0gZWxzZSBpZih0aGlzLmluZmluaXRlKSB7XG4gICAgICB0aGlzLmluZGV4ICA9IDA7XG4gICAgfVxuICB9LFxuICBzZXR1cEV2ZW50czogZnVuY3Rpb24gc2V0dXBFdmVudHMoaSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3ByZXYnKSkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBidWZmZXIgPSBzZWxmLmdldCgnbmF2aWdhdGlvbicsICdwcmV2JykucHJlY2xpY2s7XG4gICAgICBmb3IobGV0IGZ1bmMgaW4gYnVmZmVyICl7XG4gICAgICAgIGJ1ZmZlcltmdW5jXSgpXG4gICAgICB9XG4gICAgICBzZWxmLnByZXYoKTtcbiAgICAgIHNlbGYuc2V0TmF2aWdhdGlvblR5cGUoICdsaW5lYXInICk7XG4gICAgfSk7XG4gICAgJCh0aGlzLmdldCgnbmF2aWdhdGlvbicsICduZXh0JykpLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgYnVmZmVyID0gc2VsZi5nZXQoJ25hdmlnYXRpb24nLCAnbmV4dCcpLnByZWNsaWNrO1xuICAgICAgZm9yKGxldCBmdW5jIGluIGJ1ZmZlciApe1xuICAgICAgICBidWZmZXJbZnVuY10oKVxuICAgICAgfSAgICAgIFxuICAgICAgc2VsZi5uZXh0KCk7XG4gICAgICBzZWxmLnNldE5hdmlnYXRpb25UeXBlKCAnbGluZWFyJyApO1xuICAgIH0pO1xuICAgICQodGhpcy5nZXQoJ25hdmlnYXRpb24nLCAnY2xlYXInKSkuY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBidWZmZXIgPSBzZWxmLmdldCgnbmF2aWdhdGlvbicsICdjbGVhcicpLnByZWNsaWNrO1xuICAgICAgZm9yKGxldCBmdW5jIGluIGJ1ZmZlciApe1xuICAgICAgICBidWZmZXJbZnVuY10oKVxuICAgICAgfSAgICAgIFxuICAgICAgc2VsZi5yZXNldCgpO1xuICAgICAgc2VsZi5zZXROYXZpZ2F0aW9uVHlwZSggJ2luaXRpYWwnICk7XG4gICAgfSk7XG4gICAgJCh0aGlzLmdldCgnbmF2aWdhdGlvbicsICdzdGFydCcpKS5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyIGJ1ZmZlciA9IHNlbGYuZ2V0KCduYXZpZ2F0aW9uJywgJ3N0YXJ0JykucHJlY2xpY2s7XG4gICAgICBmb3IobGV0IGZ1bmMgaW4gYnVmZmVyICl7XG4gICAgICAgIGJ1ZmZlcltmdW5jXSgpXG4gICAgICB9XG4gICAgICBzZWxmLmdvVG8oIDApO1xuICAgICAgc2VsZi5zZXROYXZpZ2F0aW9uVHlwZSggJ2xpbmVhcicgKTtcbiAgICB9KTtcbiAgICAkKHRoaXMuZ2V0KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnKSkuY2xpY2soZnVuY3Rpb24gKGUpIHsgICAgICBcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciBidWZmZXIgPSBzZWxmLmdldCgnbmF2aWdhdGlvbicsICd0YXJnZXRzJykucHJlY2xpY2s7XG4gICAgICBmb3IobGV0IGZ1bmMgaW4gYnVmZmVyICl7XG4gICAgICAgIGJ1ZmZlcltmdW5jXSgpXG4gICAgICB9ICAgICAgXG4gICAgICBzZWxmLmdvVG8oIHNlbGYuZ2V0KCduYXZpZ2F0aW9uJywgJ3RhcmdldHMnKS5pbmRleCh0aGlzKSApO1xuICAgICAgc2VsZi5zZXROYXZpZ2F0aW9uVHlwZSggJ3RhcmdldHRlZCcpO1xuICAgIH0pO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBzZXROYXZpZ2F0aW9uVHlwZTogZnVuY3Rpb24odHlwZSl7XG4gICAgdGhpcy5jbGVhck5hdmlnYXRpb25UeXBlKCk7XG4gICAgdGhpcy5uYXZpZ2F0aW9uLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuYWRkQ2xhc3NTVkcodGhpcy5pbnRlcmFjdGlvbiwgdGhpcy5uYXZpZ2F0aW9uLnR5cGUpO1xuICAgIGlmKHR5cGUgIT09ICdzdGFydCcpe1xuICAgICAgdGhpcy5hZGRDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCAnbmF2aWdhdGVkJyk7XG4gICAgfVxuXG4gIH0sXG4gIGNsZWFyTmF2aWdhdGlvblR5cGU6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5yZW1vdmVDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCB0aGlzLm5hdmlnYXRpb24udHlwZSk7XG4gICAgdGhpcy5yZW1vdmVDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCAnbmF2aWdhdGVkJyk7XG4gIH0sXG4gIG1ha2VBY3RpdmU6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5pbmRleCxcbiAgICAgICAgYXJlYXMgPSB0aGlzLmdldCggJ2NvbnRlbnRBcmVhcycgKSxcbiAgICAgICAgaW5kaWNhdG9ycyA9IHRoaXMuZ2V0KCAnaW5kaWNhdG9ycycgKTtcblxuICAgIGlmKCAhdGhpcy5pc1RvZ2dsZSB8fCBhcmVhcy5hY3RpdmUgIT09IGluZGV4ICl7XG4gICAgICB0aGlzLmFkZEludGVyYWN0aW9uQWN0aXZlQ2xhc3MoKTsgICAgICBcbiAgICAgIGlmKCBhcmVhcy5sZW5ndGggPiAwICkgeyBcbiAgICAgICAgdGhpcy5hZGRDbGFzc1NWRyggYXJlYXNbIGluZGV4IF0sICdhY3RpdmUnICk7XG4gICAgICAgIGFyZWFzLmFjdGl2ZSA9IGluZGV4IDsgICAgICAgIFxuICAgICAgfVxuICAgICAgaWYoIGluZGljYXRvcnMubGVuZ3RoID4gMCApeyBcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyggaW5kaWNhdG9yc1sgaW5kZXggXSwgJ3Zpc2l0ZWQnICk7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3NTVkcoIGluZGljYXRvcnNbIGluZGV4IF0sICdhY3RpdmUnICk7XG4gICAgICB9XG4gICAgICBpZiggIShhcmVhcy5sZW5ndGggKyBpbmRpY2F0b3JzLmxlbmd0aCA+IDApICl7XG4gICAgICAgIHRoaXMud2FybmluZ3MucHVzaCgnbm8gY29udGVudCB0byBhY3RpdmF0ZScpO1xuICAgICAgICB0aGlzLndhcm4oKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXJlYXMuYWN0aXZlID0gZmFsc2U7XG4gIH0sXG4gIG1ha2VBbGxJbmFjdGl2ZTogZnVuY3Rpb24oKXtcbiAgICB2YXIgYXJlYXMgPSB0aGlzLmdldCggJ2NvbnRlbnRBcmVhcycgKSxcbiAgICAgICAgaW5kaWNhdG9ycyA9IHRoaXMuZ2V0KCAnaW5kaWNhdG9ycycgKTtcbiAgICBpZiggYXJlYXMubGVuZ3RoICl7XG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBhcmVhcywgJ2FjdGl2ZScgKTtcbiAgICB9XG4gICAgaWYoIGluZGljYXRvcnMubGVuZ3RoICl7XG4gICAgICB0aGlzLm1ha2VJbmRpY2F0b3JWaXNpdGVkKCk7ICAgXG4gICAgICB0aGlzLnJlbW92ZUNsYXNzU1ZHKCBpbmRpY2F0b3JzLCAnYWN0aXZlJyApO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUludGVyYWN0aW9uQWN0aXZlQ2xhc3MoKTtcbiAgfSxcbiAgYWRkSW50ZXJhY3Rpb25BY3RpdmVDbGFzczogZnVuY3Rpb24oKXtcbiAgICB0aGlzLmFkZENsYXNzU1ZHKCB0aGlzLmludGVyYWN0aW9uLCAnYWN0aXZlLScgKyB0aGlzLnByaW50SW5kZXggKTtcbiAgfSxcbiAgcmVtb3ZlSW50ZXJhY3Rpb25BY3RpdmVDbGFzczogZnVuY3Rpb24oKXtcbiAgICBmb3IodmFyIGkgPSAwOyBpPCB0aGlzLnRvdGFsOyBpKyspe1xuICAgICAgdGhpcy5yZW1vdmVDbGFzc1NWRyh0aGlzLmludGVyYWN0aW9uLCAnYWN0aXZlLScrIHRoaXMucHJpbnRJbmRleCApO1xuICAgIH1cbiAgfSxcbiAgbWFrZUluZGljYXRvclZpc2l0ZWQ6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICQoIHRoaXMuZ2V0KCAnaW5kaWNhdG9ycycgKSApLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGlmKCQodGhpcykuYXR0cignY2xhc3MnKS5pbmRleE9mKCdhY3RpdmUnKSA+IDAgKSB7XG4gICAgICAgIHNlbGYuYWRkQ2xhc3NTVkcodGhpcywgJ3Zpc2l0ZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgYWRkQ2xhc3NTVkc6IGZ1bmN0aW9uKGVsZW0sIG5ld0NsYXNzKXtcbiAgICBpZihlbGVtLmxlbmd0aCA+IDApe1xuICAgICAgdGhpcy5hZGRNdWx0aXBsZUNsYXNzZXMoZWxlbSwgbmV3Q2xhc3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFkZFNpbmd1bGFyQ2xhc3MoZWxlbSwgbmV3Q2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgYWRkU2luZ3VsYXJDbGFzczogZnVuY3Rpb24oZWxlbSwgbmV3Q2xhc3Mpe1xuICAgIGlmKCBlbGVtID09PSB1bmRlZmluZWQgKXsgcmV0dXJuIH0gICAgXG4gICAgdmFyIHRlbXBDbGFzcyA9ICQoZWxlbSkuYXR0cignY2xhc3MnKTtcbiAgICAkKGVsZW0pLmF0dHIoJ2NsYXNzJywgdGVtcENsYXNzICsgJyAnICtuZXdDbGFzcyk7XG4gIH0sXG4gIGFkZE11bHRpcGxlQ2xhc3NlczogZnVuY3Rpb24oZWxlbXMsIG5ld0NsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzO1xuICAgIGZvcih2YXIgaSA9IDA7IGk8IGVsZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgIHRlbXBDbGFzcyA9ICQoZWxlbXNbaV0pLmF0dHIoJ2NsYXNzJyk7XG4gICAgICAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycsIHRlbXBDbGFzcyArICcgJyArbmV3Q2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlQ2xhc3NTVkc6IGZ1bmN0aW9uKGVsZW0sIHJlbW92ZWRDbGFzcyl7XG4gICAgaWYoZWxlbS5sZW5ndGggPiAwKXtcbiAgICAgIHRoaXMucmVtb3ZlTXVsdGlwbGVDbGFzc2VzKGVsZW0sIHJlbW92ZWRDbGFzcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVtb3ZlU2luZ3VsYXJDbGFzcyhlbGVtLCByZW1vdmVkQ2xhc3MpO1xuICAgIH1cbiAgfSxcbiAgcmVtb3ZlU2luZ3VsYXJDbGFzczogZnVuY3Rpb24oZWxlbSwgcmVtb3ZlZENsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzID0gJChlbGVtKS5hdHRyKCdjbGFzcycpO1xuICAgIHZhciBuZXdDbGFzcyAgPSB0ZW1wQ2xhc3MucmVwbGFjZSgnICcrcmVtb3ZlZENsYXNzLCAnJyk7XG4gICAgJChlbGVtKS5hdHRyKCdjbGFzcycsIG5ld0NsYXNzKTtcbiAgfSxcbiAgcmVtb3ZlTXVsdGlwbGVDbGFzc2VzOiBmdW5jdGlvbihlbGVtcywgcmVtb3ZlZENsYXNzKXtcbiAgICB2YXIgdGVtcENsYXNzLCBuZXdDbGFzcztcbiAgICBmb3IodmFyIGkgPSAwOyBpPCBlbGVtcy5sZW5ndGg7IGkrKyl7XG4gICAgICB0ZW1wQ2xhc3MgPSAkKGVsZW1zW2ldKS5hdHRyKCdjbGFzcycpO1xuICAgICAgbmV3Q2xhc3MgID0gdGVtcENsYXNzLnJlcGxhY2UoJyAnK3JlbW92ZWRDbGFzcywgJycpO1xuICAgICAgJChlbGVtc1tpXSkuYXR0cignY2xhc3MnLCBuZXdDbGFzcyk7XG4gICAgfVxuICB9LCAgXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIENsaWNrYWJsZUNvbnRleHQgPSBmdW5jdGlvbiggY29uc3RydWN0ZWQgKXtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IG5ldyBDbGlja2FibGVDYXV0aW9ucyggY29uc3RydWN0ZWQgKTtcbiAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuaW5pdCggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICBpZiggdGhpcy5jb25zdHJ1Y3RlZC5jb250ZXh0ICl7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMuc29ydENvbGxlY3Rpb25zKCB0aGlzLmNvbnN0cnVjdGVkICk7XG4gICAgdGhpcy5jb25zdHJ1Y3RlZCA9IHRoaXMub3ZlcnJpZGVEZWZhdWx0cyggdGhpcy5jb25zdHJ1Y3RlZCApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuY29uc3RydWN0ZWQ7XG59O1xuXG5DbGlja2FibGVDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgaW5pdDogZnVuY3Rpb24gaW5pdCggaSApe1xuICAgIGkgPSB0aGlzLnNldEluaXRpYWxEYXRhKCBpICk7XG4gICAgaSA9IHRoaXMuc2V0VG90YWxEYXRhKCBpICk7XG4gICAgaSA9IHRoaXMuc2V0SW5kZXhEYXRhKCBpICk7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIG92ZXJyaWRlRGVmYXVsdHM6IGZ1bmN0aW9uIG92ZXJyaWRlRGVmYXVsdHMoIGkgKXtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdpbmRleCcsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4WyB0aGlzLmNvbnRleHQgXTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uKCB2YWwgKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luZGV4WyB0aGlzLmNvbnRleHQgXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGksICdwcmludEluZGV4Jywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0ICsgJy0nICsgdGhpcy5pbmRleDtcbiAgICAgIH1cbiAgICB9KTsgIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggaSwgJ3RvdGFsJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24oIHZhbCApe1xuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxbIHRoaXMuY29udGV4dCBdID0gdmFsO1xuICAgICAgfVxuICAgIH0pOyAgICBcbiAgICBpLmdldCA9IHRoaXMuZ2V0Q29udGV4dERlcHRoO1xuICAgIHJldHVybiBpOyAgXG4gIH0sXG4gIHNldEluaXRpYWxEYXRhOiBmdW5jdGlvbiBzZXRJbml0aWFsZGF0YSggaSApe1xuICAgIGkuY29udGV4dCA9IGZhbHNlO1xuICAgIHJldHVybiBpO1xuICB9LFxuICBmaW5kQ29udGV4dENvdW50OiBmdW5jdGlvbiBmaW5kQ29udGV4dENvdW50KCBlbCApe1xuICAgIHZhciBpbmRpY2VzID0ge30sIHNlbGYgPSB0aGlzO1xuICAgICQoIGVsICkuZWFjaCggZnVuY3Rpb24oKXtcbiAgICAgIHZhciBjID0gJCh0aGlzKS5kYXRhKCdjb250ZXh0Jyk7XG4gICAgICBpbmRpY2VzID0gc2VsZi5hZGRUb09ySW5pdCggaW5kaWNlcywgYyApO1xuICAgIH0pO1xuICAgIHJldHVybiBpbmRpY2VzO1xuICB9LFxuICBzZXRUb3RhbERhdGE6IGZ1bmN0aW9uIHNldFRvdGFsRGF0YSggaSApe1xuICAgIHZhciBjb250ZXh0cyA9IHRoaXMuZmluZENvbnRleHRDb3VudCggaS5jb250ZW50QXJlYXMgKTtcbiAgICBmb3IoIHZhciBjb250ZXh0IGluIGNvbnRleHRzICl7XG4gICAgICBpZiggY29udGV4dCAhPT0gJ2NvbnRleHRfZGVmYXVsdCcgKXtcbiAgICAgICAgaS5jb250ZXh0ID0gJ2NvbnRleHRfZGVmYXVsdCc7XG4gICAgICAgIGkuX3RvdGFsID0gY29udGV4dHM7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfSxcbiAgc2V0SW5kZXhEYXRhOiBmdW5jdGlvbiBzZXRJbmRleERhdGEoIGkgKXtcbiAgICBpZiggIWkuY29udGV4dCApe1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICAgIGkuX2luZGV4ID0ge307XG4gICAgZm9yKCB2YXIgY29udGV4dCBpbiBpLnRvdGFsICl7XG4gICAgICBpLl9pbmRleFsgY29udGV4dCBdID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIGFkZFRvT3JJbml0OiBmdW5jdGlvbiBhZGRUb09ySW5pdCggb2JqLCBwcm9wICl7XG4gICAgdmFyIHByb3AgPSBwcm9wIHx8ICdkZWZhdWx0JztcbiAgICB2YXIga2V5ID0gJ2NvbnRleHRfJyArIHByb3A7XG4gICAgaWYoIG9iai5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKXtcbiAgICAgIG9ialsga2V5IF0gKz0gMTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIG9ialsga2V5IF0gPSAwO1xuICAgIHJldHVybiBvYmo7XG4gIH0sXG4gIHNvcnRDb2xsZWN0aW9uczogZnVuY3Rpb24gc29ydENvbGxlY3Rpb25zKCBpICl7XG4gICAgaS5jb250ZW50QXJlYXMgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnY29udGVudEFyZWFzJyApOyAgXG4gICAgaS5pbmRpY2F0b3JzID0gdGhpcy5jb250ZXh0U29ydCggaSwgJ2luZGljYXRvcnMnICk7XG4gICAgaS5uYXZpZ2F0aW9uLnRhcmdldHMgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnbmF2aWdhdGlvbicsICd0YXJnZXRzJyApO1xuICAgIGkubmF2aWdhdGlvbi5wcmV2ID0gdGhpcy5jb250ZXh0U29ydCggaSwgJ25hdmlnYXRpb24nLCAncHJldicgKTsgICAgXG4gICAgaS5uYXZpZ2F0aW9uLm5leHQgPSB0aGlzLmNvbnRleHRTb3J0KCBpLCAnbmF2aWdhdGlvbicsICduZXh0JyApO1xuICAgIHRoaXMud2FybkFib3V0TmF2aWdhdGlvbiggaSApO1xuICAgIHJldHVybiBpXG4gIH0sXG4gIGNvbnRleHRTb3J0OiBmdW5jdGlvbiBjb250ZXh0U29ydCggaSwgY29sbGVjdGlvbiwgc3ViICl7XG4gICAgdmFyIGFsbCA9IGkuZ2V0KCBjb2xsZWN0aW9uLCBzdWIgKSxcbiAgICAgICAgc2VsZiA9IHRoaXMsIFxuICAgICAgICBvbmNsaWNrO1xuICAgIGlmKCBhbGwgKXsgb25jbGljayA9IGFsbC5wcmVjbGljazsgfVxuXG4gICAgJChhbGwpLmZpbHRlciggZnVuY3Rpb24oKXtcblxuICAgICAgYWxsID0gJChhbGwpLm5vdCggJCh0aGlzKSApOyAgICAgICAgXG4gICAgICByZXR1cm4gJCh0aGlzKTtcblxuICAgIH0gKS5lYWNoKCBmdW5jdGlvbigpe1xuXG4gICAgICB2YXIgYyA9IHNlbGYuc2V0Q29udGV4dEtleSggJCh0aGlzKSApO1xuICAgICAgaWYoIGFsbFtjXSA9PT0gdW5kZWZpbmVkICl7XG4gICAgICAgIGFsbFtjXSA9ICQoKTtcbiAgICAgIH1cbiAgICAgIGFsbFtjXSA9ICQoYWxsW2NdKS5hZGQoICQodGhpcykgKTtcbiAgICB9KTtcbiAgICBpZiggb25jbGljayApeyBhbGwucHJlY2xpY2sgPSBvbmNsaWNrO1xuICAgICAgICAgICAgICAgICAgIGFsbC5wcmVjbGljay5wdXNoKHNlbGYucGFyc2VDb250ZXh0ICk7IH1cbiAgICByZXR1cm4gYWxsO1xuICB9LFxuICB3YXJuQWJvdXROYXZpZ2F0aW9uOiBmdW5jdGlvbiB3YXJuQWJvdXROYXZpZ2F0aW9uKCBpICl7XG4gICAgZm9yKCB2YXIga2V5IGluIGkuaW5kZXggKXtcbiAgICAgIGlmKCBpLm5hdmlnYXRpb24udGFyZ2V0c1sga2V5IF0gPT09IHVuZGVmaW5lZCAmJiBcbiAgICAgICAgaS5uYXZpZ2F0aW9uLnByZXZbIGtleSBdID09PSB1bmRlZmluZWQgJiZcbiAgICAgICAgaS5uYXZpZ2F0aW9uLm5leHRbIGtleSBdID09PSB1bmRlZmluZWQgKXtcbiAgICAgICAgaS53YXJuaW5ncy5wdXNoKGB0aGVyZSBpcyBubyBuYXZnYXRpb24gZm9yIHRoZSBjb250ZXh0ICR7a2V5fWApO1xuICAgICAgfVxuICAgIH1cbiAgICBpLndhcm4oKTtcbiAgfSxcbiAgcGFyc2VDb250ZXh0OiBmdW5jdGlvbiBwYXJzZUNvbnRleHQoIGVsICl7XG4gICAgaWYoIGVsICE9PSB1bmRlZmluZWQgJiYgJCggZWwgKS5kYXRhKCdjb250ZXh0JykgKXtcbiAgICAgIHRoaXMuY29udGV4dCA9ICdjb250ZXh0XycgKyAkKCBlbCApLmRhdGEoICdjb250ZXh0JyApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmNvbnRleHQgPSAnY29udGV4dF9kZWZhdWx0JztcbiAgfSwgIFxuICBnZXRDb250ZXh0RGVwdGg6IGZ1bmN0aW9uIGdldENvbnRleHREZXB0aCggYywgcyApe1xuICAgIHZhciBjb2xsZWN0aW9uID0gdGhpc1sgYyBdWyB0aGlzLmNvbnRleHQgXTsgICAgXG4gICAgaWYoIHMgIT09IHVuZGVmaW5lZCApe1xuICAgICAgY29sbGVjdGlvbiA9IGNvbGxlY3Rpb25bIHMgXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH0sICBcbiAgc2V0Q29udGV4dEtleTogZnVuY3Rpb24gc2V0Q29udGV4dEtleSggZWwgKXtcbiAgICB2YXIgY3R4ID0gZWwuZGF0YSggJ2NvbnRleHQnICkgfHwgJ2RlZmF1bHQnO1xuICAgIHJldHVybiAnY29udGV4dF8nICsgY3R4O1xuICB9IFxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgQ2xpY2thYmxlID0gZnVuY3Rpb24oIGFyZ3MgKXtcblx0dmFyIGNvbnN0cnVjdGVkID0ge307XG4gIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnN0cnVjdG9yKCBhcmdzICk7XG4gIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnRleHQoIGNvbnN0cnVjdGVkICk7XG4gIGNvbnN0cnVjdGVkID0gbmV3IENsaWNrYWJsZUNvbnRyb2xsZXIoIGNvbnN0cnVjdGVkICk7IFxuICByZXR1cm4gY29uc3RydWN0ZWQ7XG59O1xuQ2xpY2thYmxlLnByb3RvdHlwZSA9IHtcbiAgdW5wYWNrOiBmdW5jdGlvbiggb2JqICl7XG4gICAgZm9yKCB2YXIgYXR0ciBpbiBvYmogKXtcbiAgICBcdGlmKCBvYmouaGFzT3duUHJvcGVydHkoIGF0dHIgKSApe1xuXHQgICAgXHR0aGlzWyBhdHRyIF0gPSBvYmpbIGF0dHIgXTtcbiAgICBcdH1cbiAgICB9XG4gIH0sXG4gIGV4dGVuZDogZnVuY3Rpb24oIG9iaiApe1xuICAgIGZvciggdmFyIGF0dHIgaW4gb2JqLl9fcHJvdG9fXyApe1xuICAgICAgaWYoIG9iai5fX3Byb3RvX18uaGFzT3duUHJvcGVydHkoIGF0dHIgKSApe1xuICAgICAgICB0aGlzWyBhdHRyIF0gPSBvYmouX19wcm90b19fWyBhdHRyIF07XG4gICAgICB9XG4gICAgfVxuICB9LCAgXG4gIGZvcm1hdENvbnN0cnVjdGVkOiBmdW5jdGlvbiBmb3JtYXRDb25zdHJ1Y3RlZCggY29uc3RydWN0ZWQgKXtcbiAgICB2YXIgaSAgPSBjb25zdHJ1Y3RlZCB8fCB7fTtcbiAgICAgICAgaS53YXJuaW5ncyA9IFtdO1xuICAgICAgICBpZiggY29uc3RydWN0ZWQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgaS53YXJuaW5ncy5wdXNoKCdhIGNvbnRleHQgbmVlZHMgYSB2YWxpZCBjbGlja2FibGUgY29uc3RydWN0b3IgdG8gZG8gYW55dGhpbmcnKTtcbiAgICAgICAgICB0aGlzLndhcm4oIGkgKTtcbiAgICAgICAgICByZXR1cm4gaTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGk7XG4gIH0sXG4gIHdhcm46IGZ1bmN0aW9uIHdhcm4oIGkgKXtcbiAgICBmb3IoIGxldCBqID0gMDsgajwgaS53YXJuaW5ncy5sZW5ndGg7IGorKyApe1xuICAgICAgY29uc29sZS53YXJuKCBpLndhcm5pbmdzW2pdICk7XG4gICAgfVxuICB9LCAgXG59XG5cblxuLy8gaWYoICQoJy5qcy1oaXN0b3J5LWludGVyYWN0aW9uJykubGVuZ3RoID4gMCApe1xuLy8gICBuZXcgQ2xpY2thYmxlKCcuanMtaGlzdG9yeS1pbnRlcmFjdGlvbicpO1xuXG4vLyB9XG4vLyBpZiggJCgnLmpzLXByaW5jaXBsZXMtaW50ZXJhY3Rpb24nKS5sZW5ndGggPiAwICl7XG4vLyAgIHZhciB0aGluZyA9IG5ldyBDbGlja2FibGUoJy5qcy1wcmluY2lwbGVzLWludGVyYWN0aW9uJywgdHJ1ZSk7XG4vLyB9XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=