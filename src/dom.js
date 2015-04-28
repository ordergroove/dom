(function(doc, w, undefined) {
    'use strict';

    var _ = require('./_misc');

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
