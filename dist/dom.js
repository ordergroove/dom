// dom - v1.0.0 - MIT License
// 2015 (c) OrderGroove Developers

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(doc, w, undefined) {
    'use strict';

    var _ = require('misc');

    /**
     * DOM manipulation (adding classes, events, etc.)
     * @class dom
     * @static
     */
    var dom = {
        _doc: doc,
        _window: w
    };

    // Define ua and vendor for the rest of the script
    dom._ua = dom._window.navigator.userAgent;

    /**
     * This is a generic selector function
     * @method $
     * @param {string} selector
     * @returns {Array}
     */
    dom.$ = function(selector, rootEl) {
        var matches, el;
        if (!rootEl) {
            rootEl = dom._doc;
        }

        // Check if we are working with an ID
        matches = selector.match(/^#([a-zA-Z0-9_\-]+)$/);
        if (matches) {
            el = dom._doc.getElementById(matches[1]);
            return el ? [ el ] : [];
        }

        // Check if we are working with a class
        matches = selector.match(/^\.([a-zA-Z0-9_\-]+)$/);
        if (matches && rootEl.getElementsByClassName) {
            return _.slice(rootEl.getElementsByClassName(matches[1]), 0);
        }

        return _.slice(rootEl.querySelectorAll(selector), 0);
    };

    /***
     * Add an event to HTML element
     * @method addEvent
     * @param {HTMLElement} el
     * @param {string} eventName
     * @param {function} fn
     */
    dom.addEvent = function(el, eventName, fn) {
        if (el.addEventListener) {
            el.addEventListener(eventName, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + eventName, fn);
        } else {
            el['on' + eventName] = fn;
        }
    };

    /***
     * Remove an event from an HTML element
     * @method removeEvent
     * @param {HTMLElement} el
     * @param {string} eventName
     * @param {function} fn
     */
    dom.removeEvent = function(el, eventName, fn) {
        if (el.removeEventListener) {
            el.removeEventListener(eventName, fn, false);
        } else if (el.detachEvent) {
            el.detachEvent('on' + eventName, fn);
        } else {
            el['on' + eventName] = undefined;
        }
    };

    /***
     * Attach an event and remove it after it's called. Optionally add a long term function.
     * @method oneTimeEvent
     * @param {HTMLElement} el
     * @param {function} eventName
     * @param {function} oneTimeFn
     * @param {function} [normalFn]
     */
    dom.oneTimeEvent = function(el, eventName, oneTimeFn, normalFn) {
        dom.addEvent(el, eventName, function tempFunc() {
            oneTimeFn.apply(this, arguments);
            dom.removeEvent(el, eventName, tempFunc);
            if (typeof normalFn === 'function') {
                dom.addEvent(el, eventName, normalFn);
            }
        });
    };

    /***
     * Get event target from event
     * @method getEventTarget
     * @param {Event} e
     * @returns {HTMLElement}
     */
    dom.getEventTarget = function(e) {
        var targ = null;
        if (!e) {
            e = dom._window.event;
        }
        if (e.target) {
            targ = e.target;
        } else if (e.srcElement) {
            targ = e.srcElement;
        }
        if (targ && targ.nodeType === 3) {
            targ = targ.parentNode;
        }
        /* defeat Safari bug */
        return targ;
    };

    /**
     * Scroll the window to position an element at the top of the viewport
     * @method scrollToEl
     * @param {HTMLElement} el
     */
    dom.scrollToEl = function(el) {
        window.scroll(undefined, el.offsetTop);
    };

    /**
     * Get the number of pixels the window is scrolled down
     * @method getWindowYOffset
     * @return {number}
     */
    dom.getWindowYOffset = function() {
        if (typeof window.pageYOffset !== 'undefined') {
            return window.pageYOffset;
        }

        return (dom._doc.documentElement || dom._doc.body.parentNode || dom._doc.body).scrollTop;
    };

    /**
     * Add class fallback for old browsers
     * @method _addClassShim
     * @param {HTMLElement} el
     * @param {string} className
     */
    dom._addClassShim = function(el, className) {
        if (!dom.hasClass(el, className)) {
            el.className += (el.className === '') ? className : ' ' + className;
        }
    };

    /**
     * Remove class fallback for old browsers
     * @method _removeClassShim
     * @param {HTMLElement} el
     * @param {string} className
     */
    dom._removeClassShim = function(el, className) {
        el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'gi'), '');
    };

    /**
     * Add a class to a DOM element
     * @method addClass
     * @param {HTMLElement} el
     * @param {string} className
     * @returns {dom}
     */
    dom.addClass = function(el, className) {
        if (_.isArray(className)) {
            for (var i = 0; i < className.length; i++) {
                dom.addClass(el, className[i]);
            }
        } else {
            if (document.documentElement.classList) {
                el.classList.add(className);
            } else {
                dom._addClassShim(el, className);
            }
        }
        return dom;
    };

    /**
     * Remove a class from a dom element
     * @method removeClass
     * @param {HTMLElement} el
     * @param {string} className
     * @returns {dom}
     */
    dom.removeClass = function(el, className) {
        if (_.isArray(className)) {
            for (var i = 0; i < className.length; i++) {
                dom.removeClass(el, className[i]);
            }
        } else {
            if (document.documentElement.classList) {
                el.classList.remove(className);
            } else {
                dom._removeClassShim(el, className);
            }
        }
        return dom;
    };

    /**
     * Test a HTMLElement contains a className
     * @method hasClass
     * @param {HTMLElement} el
     * @param {string} className
     * @returns {boolean}
     */
    dom.hasClass = function(el, className) {
        var cs = el.className.split(/\s+/);
        return _.indexOf(cs, className) !== -1;
    };

    dom.checkIsParent = function(el, searchEl) {
        var currentEl = el;

        while (currentEl !== document.documentElement) {
            if (currentEl === searchEl) {
                return true;
            }
            currentEl = currentEl.parentNode;
        }
        return false;
    };

    /**
     * Center one or more HTMLElement to another HTMLElement
     * @method centerToElement
     * @param {HTMLElement} target
     * @param {HTMLElement} or {Array} el
     */
    dom.centerToElement = function(target, el) {
        var targetCenter = target.getBoundingClientRect().left + target.offsetWidth / 2;

        if (_.isArray(el)) {
            for (var i = 0; i < el.length; i++) {
                dom.centerToElement(target, el[i]);
            }
            return;
        }
        el.style.left = targetCenter - el.offsetWidth / 2 + 'px';
    };

    /**
     * Finds parent element using a class
     * Goes through all the parent nodes of el and returns the first that matches the class or returns null
     * @method findParent
     * @param {HTMLElement} el
     * @param {string} className
     * @return {HTMLelement} parent or {null}
     */
    dom.findParentByClass = function(el, className) {
        var parent = el.parentNode;
        while (parent.parentNode) {
            if (dom.hasClass(parent, className)) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    };

    /**
     * IE 8 polyfill for style.setProperty for adding !important
     * @param el
     * @param property
     * @param value
     * @param priority
     */
    dom.setCssProperty = function(el, property, value, priority) {
        if (el.style.setProperty) {
            el.style.setProperty(property, value, priority);
        } else {
            el.style.setAttribute(property, value);
            if (priority) {
                // Add priority manually
                var rule = new RegExp(encodeURIComponent(property) + '\\s*:\\s*' + encodeURIComponent(value) +
                    '(\\s*;)?', 'gmi');
                el.style.cssText =
                    el.style.cssText.replace(rule, property + ': ' + value + ' !' + priority + ';');
            }
        }
    };

    dom.ready = function(fn) {
        var done = false,
            top = true,
            doc = w.document,
            root = doc.documentElement,
            modern = doc.addEventListener,

            add = modern ? 'addEventListener' : 'attachEvent',
            remove = modern ? 'removeEventListener' : 'detachEvent',
            pre = modern ? '' : 'on',

            init = function(e) {
                if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
                    return;
                }
                (e.type === 'load' ? w : doc)[remove](pre + e.type, init, false);

                if (!done && (done = true)) {
                    fn.call(w, e.type || e);
                }
            },

            poll = function() {
                try {
                    root.doScroll('left');
                } catch (e) {
                    setTimeout(poll, 50);
                    return;
                }
                init('poll');
            };

        if (doc.readyState === 'complete') {
            fn.call(w, 'lazy');
        } else {
            if (!modern && root.doScroll) {
                try {
                    top = !w.frameElement;
                } catch (e) {}

                if (top) {
                    poll();
                }
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            w[add](pre + 'load', init, false);
        }
    };

    /**
     * Determine IE version, false if not IE
     * Uses html comments to detect IE version
     * @method ieVersion
     * @return {boolean|number}
     */
    dom.ieVersion = (function() {
        var matches = dom._ua.match(/rv:([0-9\.]+)/),
            v = false;

        // IE 11, we do not even support FF11, and the UA would be different than 23-31
        if (matches && +matches[1] === 11) {
            v = +matches[1];
        }

        // IE 10 or older
        if (!v) {
            v = (dom._ua.toLowerCase().indexOf('msie') !== -1) ?
                parseInt(dom._ua.toLowerCase().split('msie')[1], 10) : false;
        }

        return v;
    }());

    module.exports = dom;
})(document, window);

},{"misc":2}],2:[function(require,module,exports){
// misc - v1.0.1 - MIT License
// 2015 (c) OrderGroove Developers

(function() {
    'use strict';

    /**
     * Miscellaneous utility functions
     * @class misc
     * @static
     */
    var _ = {};

    /* istanbul ignore next */
    /**
     * Polyfill for Array.prototype.slice
     * @method slice
     * @param {Array} arr
     * @param {number} begin
     * @param {number} end
     */
    _.slice = (function() {
        var _slice = Array.prototype.slice;
        var invalidSlice = false;

        try {
            // Can't be used with DOM elements in IE < 9
            _slice.call(document.documentElement);
        } catch (e) { // Fails in IE < 9
            invalidSlice = true;
        }

        if (invalidSlice) {
            return function(arr, begin, end) {
                var i, arrl = arr.length, a = [];

                if (arr === null) {
                    throw new TypeError('Array.prototype.slice called on null or undefined');
                }

                begin = begin === null ? 0 : (begin >= 0 ? begin : arrl - begin);
                end = end === null ? arrl : (end >= 0 ? end : arrl - end);
                // Although IE < 9 does not fail when applying Array.prototype.slice
                // to strings, here we do have to duck-type to avoid failing
                // with IE < 9's lack of support for string indexes
                if (arr.charAt) {
                    for (i = begin; i < end; i++) {
                        a.push(arr.charAt(i));
                    }
                // This will work for genuine arrays, array-like objects,
                // NamedNodeMap (attributes, entities, notations),
                // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
                // and will not fail on other DOM objects (as do DOM elements in IE < 9)
                } else {
                    // IE < 9 (at least IE < 9 mode in IE 10) does not work with
                    // node.attributes (NamedNodeMap) without a dynamically checked length here
                    for (i = begin; i < end; i++) {
                        a.push(arr[i]);
                    }
                }
                // IE < 9 gives errors here if end is allowed as undefined
                // (as opposed to just missing) so we default ourselves
                return a;
            };
        } else {
            return function(arr, begin, end) {
                return _slice.call(arr, begin, end);
            };
        }
    })();

    /* istanbul ignore next */
    /***
     * Get the keys for an object or function
     * @method keys
     * @param {object|function} obj
     * @return {Array} array of key strings
     */
    _.keys = (function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;
        return function(objOrFunc) {
            if (Object.prototype.keys) {
                return Object.keys(objOrFunc);
            }
            if (typeof objOrFunc !== 'object' && (typeof objOrFunc !== 'function' || objOrFunc === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in objOrFunc) {
                if (hasOwnProperty.call(objOrFunc, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(objOrFunc, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    })();

    /***
     * Get all the values in an object
     * @method values
     * @param {Object} obj
     * @returns {Array}
     */
    _.values = function(obj) {
        var vals = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                vals.push(obj[key]);
            }
        }
        return vals;
    };

    /***
     * Convert an array to an object map.
     * @method toMap
     * @param {Array} arr
     * @param {string|function} keyOrFunc
     * @returns {object}
     */
    _.toMap = function(arr, keyOrFunc) {
        var map = {}, i, len, item, key;
        for (i = 0, len = arr.length; i < len; i++) {
            item = arr[i];
            if (typeof keyOrFunc === 'string') {
                key = item[keyOrFunc];

                // Assuming its a function
            } else {
                key = keyOrFunc(item);
            }
            // Don't add keys that are null or undefined
            if (key !== null && key !== undefined) {
                map[key] = item;
            }
        }
        return map;
    };

    /* istanbul ignore next */
    /***
     * Return a function with optional bound this and arguments
     * @method bind
     * @param {function} func
     * @param {*} thisArg
     * @returns {function}
     */
    _.bind = function(func, thisArg /*, arguments */) {
        if (func.bind) {
            return func.bind.apply(func, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof func !== 'function') {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 2),
            fToBind = func,
            FNOP = function() {
            },
            FBound = function() {
                return fToBind.apply(this instanceof FNOP && thisArg ?
                    func
                    : thisArg,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = func.prototype;
        FBound.prototype = new FNOP();

        return FBound;
    };

    /* istanbul ignore next */
    /***
     * Return string with first character capitalized
     * @method capitalize
     * @param {string} str
     * @returns {string}
     */
    _.capitalize = function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    /* istanbul ignore next */
    /***
     * MDN Polyfill for Array.prototype.indexOf
     * @method indexOf
     * @param {Array} arr the array to search
     * @param {*} searchElement
     * @param {number} fromIndex
     * @returns {number} index of the searchElement, -1 if not found
     */
    _.indexOf = function(arr, searchElement, fromIndex) {
        if (arr.indexOf) {
            return arr.indexOf(searchElement, fromIndex);
        }

        if (arr === null) {
            throw new TypeError('"arr" is null or not defined');
        }

        /*jshint bitwise: false */
        var length = this.length >>> 0; // Hack to convert object.length to a UInt32

        fromIndex = +fromIndex || 0;

        if (Math.abs(fromIndex) === Infinity) {
            fromIndex = 0;
        }

        if (fromIndex < 0) {
            fromIndex += length;
            if (fromIndex < 0) {
                fromIndex = 0;
            }
        }

        for (; fromIndex < length; fromIndex++) {
            if (arr[fromIndex] === searchElement) {
                return fromIndex;
            }
        }

        return -1;
    };

    /**
     * Determine if searchElement is in array or string
     * @param {string|Array} arr
     * @param {*} searchElement
     * @param {number} fromIndex
     * @returns {boolean}
     */
    _.contains = function(arr, searchElement, fromIndex) {
        return _.indexOf(arr, searchElement, fromIndex) !== -1;
    };

    /***
     * Attach all the properties of other object onto the first object
     * @method extend
     * @param {object} obj
     * @returns {object}
     */
    _.extend = function(obj /*, objects...*/) {
        var i, len, source;
        for (i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        }
        return obj;
    };

    /***
     * Attach all the properties of an object onto first object, recurse if property is object
     * @method deepExtend
     * @param {object} obj
     * @returns {object}
     */
    _.deepExtend = function(obj /*, objects...*/) {
        var i, len, source;
        for (i = 1, len = arguments.length; i < len; i++) {
            source = arguments[i];
            if (source) {
                for (var prop in source) {
                    if (_.isObject(source[prop])) {
                        if (!obj.hasOwnProperty(prop)) {
                            obj[prop] = {};
                        }
                        obj[prop] = _.deepExtend(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                }
            }
        }
        return obj;
    };

    /***
     * Function that does prototypical inheritance
     * @method inherit
     * @param {function} Parent Parent constructor function
     * @param {function} Child Child constructor function
     */
    _.inherit = function(Child, Parent) {
        function Temp() {
            this.constructor = Child;
        }

        Temp.prototype = Parent.prototype;
        Child.prototype = new Temp();
    };

    /***
     * Get rid of extra whitespace at beginning or end of string
     * @method trim
     * @param {string} str
     * @returns {string}
     */
    _.trim = function(str) {
        return str.replace(/^\s+|\s+$/g, '');
    };

    /* istanbul ignore next */
    /***
     * MDN Polyfill for Array.prototype.map
     * @method map
     * @param {Array} arr
     * @param {function} iterator
     * @param {*} [thisArg]
     * @returns {Array}
     */
    _.map = function(arr, iterator, thisArg) {
        if (Array.prototype.map && arr.map === Array.prototype.map) {
            return arr.map(iterator, thisArg);
        }

        if (arr === void 0 || arr === null) {
            throw new TypeError();
        }

        var t = Object(arr);
        /*jshint bitwise: false */
        var len = t.length >>> 0;
        if (typeof iterator !== 'function') {
            throw new TypeError();
        }

        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            if (i in t) {
                res[i] = iterator.call(thisArg, t[i], i, t);
            }
        }
        return res;
    };

    /**
     * Return a new object with only the specified keys
     * @method pick
     * @param {object} obj
     * @param {Array} keyArr Array of keys to pick from object
     * @param {boolean} proxy Keep the `this` pointing to original object
     */
    _.pick = function(obj, keyArr, proxy) {
        var newObj = {};
        for (var i = 0, len = keyArr.length; i < len; i++) {
            if (proxy && typeof obj[keyArr[i]] === 'function') {
                newObj[keyArr[i]] = _.bind(obj[keyArr[i]], obj);
            } else {
                newObj[keyArr[i]] = obj[keyArr[i]];
            }
        }
        return newObj;
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not be triggered.
     * The function will be called after it stops being called for N milliseconds
     * @method debounce
     * @param {function} func
     * @param {number} wait Milliseconds to wait
     * @returns {Function}
     */
    _.debounce = function(func, wait) {
        var timeout, args, me;
        return function() {
            me = this;
            args = arguments;
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function() {
                func.apply(me, args);
                timeout = null;
            }, wait);
        };
    };

    /**
     * Check if a value is an array
     * @method isArray
     * @param {*} possibleArr
     * @returns {boolean}
     */
    _.isArray = function(possibleArr) {
        return Object.prototype.toString.call(possibleArr) === '[object Array]';
    };

    /**
     * Check if a value is a plain object, not an array or String object, etc.
     * @method isObject
     * @param {*} possibleObj
     * @returns {boolean}
     */
    _.isObject = function(possibleObj) {
        return Object.prototype.toString.call(possibleObj) === '[object Object]';
    };

    /**
     * Check testObj is in mainObj (partial object matching)
     * @method containsObj
     * @param {object} mainObj
     * @param {object} testObj
     * @returns {boolean}
     */
    _.containsObj = function(mainObj, testObj) {
        if (mainObj === testObj) {
            return true;
        }
        if (typeof mainObj !== typeof testObj) {
            return false;
        }
        if (typeof mainObj === 'function' && typeof testObj === 'function') {
            return true;
        }
        if (mainObj && typeof testObj === 'object') {
            var key;
            for (key in testObj) {
                if (!_.containsObj(mainObj[key], testObj[key])) {
                    return false;
                }
            }
            return true;
        }

        return false;
    };

    /**
     * returns a random number between a given min and max
     * @method random
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    _.random = function(min, max) {
        if (typeof max === 'undefined') {
            max = min;
            min = 0;
        }

        if (min === max) {
            return min;
        }

        return min + Math.floor(Math.random() * (max - min + 1));
    };

    /**
     * Receives an array and returns a copy of it sorted randomly
     * implementing Fisher-Yates algorithm (https://en.wikipedia.org/wiki/Fisher–Yates_shuffle)
     * @method shuffle
     * @param {array} arr
     * @returns {array}
     */
    _.shuffle = function(arr) {
        // return null if argument isn't an array
        if (!_.isArray(arr)) {
            return null;
        }

        if (arr.length > 1) {
            var len = arr.length,
                shuffled = new Array(len),
                rand;

            for (var i = 0; i < len; i++) {
                rand = _.random(0, i);
                if (rand !== i) {
                    shuffled[i] = shuffled[rand];
                }
                shuffled[rand] = arr[i];
            }
            return shuffled;
        } else {
            // if single element array return copy of it
            return arr.slice();
        }
    };

    /**
     * Wrap a function in a try, catch
     * @method safeFn
     * @param {Function} fn Function to try
     * @param {Function} errorFn Function to call on exception
     * @returns {Function}
     */
    _.safeFn = function(fn, onError) {
        return function() {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                // Call the onError, but still catch errors
                if (onError) {
                    try {
                        return onError(e);
                    } catch (error) {}
                }
                return e;
            }
        };
    };

    if (typeof define === 'function' && define.amd) {
        define([], _);
    } else if (typeof exports === 'object') {
        module.exports = _;
    } else {
        window._ = _;
    }
})();

},{}]},{},[1]);
