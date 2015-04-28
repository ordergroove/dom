(function() {
    'use strict';

    var dom = require('../src/dom'),
        someFunc = function() {},
        mockDocument, mockWindow, el;

    describe('dom', function() {
        beforeEach(function() {
            mockDocument = {
                getElementById: dom._doc.getElementById,
                getElementsByClassName: function() {},
                querySelectorAll: dom._doc.querySelectorAll
            };
            mockWindow = { event: 'this is an event' };
            el = {
                getElementsByClassName: function() {},
                querySelectorAll: function() {}
            };
            spyOn(el, 'getElementsByClassName').and.callFake(function() {
                return [];
            });
            spyOn(el, 'querySelectorAll').and.callFake(function() {
                return [];
            });

            dom._doc = mockDocument;
            dom._window = mockWindow;

            spyOn(dom._doc, 'getElementById').and.callFake(function() {
                return null;
            });
            spyOn(dom._doc, 'getElementsByClassName').and.callFake(function() {
                return [];
            });
            spyOn(dom._doc, 'querySelectorAll').and.callFake(function() {
                return [];
            });
        });
        afterEach(function() {
            dom._doc = document;
            dom._window = window;
        });
        describe('$', function() {
            it('rootEl returned as the document, selector is picked up by ID', function() {
                dom.$('#selector');
                expect(dom._doc.getElementById).toHaveBeenCalledWith('selector');
            });
            it('rootEl returned as the document, selector is picked up by class name', function() {
                dom.$('.selector');
                expect(dom._doc.getElementsByClassName).toHaveBeenCalledWith('selector');
            });
            it('rootEl returned as the document, selector is picked up by selector type', function() {
                dom.$('div');
                expect(dom._doc.querySelectorAll).toHaveBeenCalledWith('div');
            });
            it('rootEl returned as the document, selector is complex .hello.world', function() {
                dom.$('.hello.world');
                expect(dom._doc.querySelectorAll).toHaveBeenCalledWith('.hello.world');
            });
            it('rootEl used, selector is complex .hello .world', function() {
                dom.$('.hello .world');
                expect(dom._doc.querySelectorAll).toHaveBeenCalledWith('.hello .world');
            });
            it('rootEl used, selector is complex hello[world="fun"]', function() {
                dom.$('hello[world="fun"]');
                expect(dom._doc.querySelectorAll).toHaveBeenCalledWith('hello[world="fun"]');
            });
            it('rootEl used, selector is complex #hello.world', function() {
                dom.$('#hello.world');
                expect(dom._doc.querySelectorAll).toHaveBeenCalledWith('#hello.world');
            });
            it('rootEl used, ID', function() {
                dom.$('#div', el);
                expect(dom._doc.getElementById).toHaveBeenCalledWith('div');
            });
            it('rootEl used, class', function() {
                dom.$('.div', el);
                expect(el.getElementsByClassName).toHaveBeenCalledWith('div');
            });
            it('rootEl used, complex', function() {
                dom.$('.div.hello', el);
                expect(el.querySelectorAll).toHaveBeenCalledWith('.div.hello');
            });
        });
        describe('addEvent', function() {
            it('attaches event to element using addEventListener', function() {
                var el = { addEventListener: jasmine.createSpy('addEventListener') };

                dom.addEvent(el, 'someEvent', someFunc);
                expect(el.addEventListener).toHaveBeenCalledWith('someEvent', someFunc, false);
            });
            it('attaches event to element using attachEvent', function() {
                var el = { attachEvent: jasmine.createSpy('attachEvent') };

                dom.addEvent(el, 'someEvent', someFunc);
                expect(el.attachEvent).toHaveBeenCalledWith('onsomeEvent', someFunc);
            });
            it('attaches event to element without native event-attaching functions', function() {
                var el = {};

                dom.addEvent(el, 'someEvent', someFunc);
                expect(el.onsomeEvent).toEqual(someFunc);
            });
        });
        describe('removeEvent', function() {
            it('removes event from element using removeEventListener', function() {
                var el = { removeEventListener: jasmine.createSpy('removeEventListener') };

                dom.removeEvent(el, 'someEvent', someFunc);
                expect(el.removeEventListener).toHaveBeenCalledWith('someEvent', someFunc, false);
            });
            it('removes event from element using detachEvent', function() {
                var el = { detachEvent: jasmine.createSpy('detachEvent') };

                dom.removeEvent(el, 'someEvent', someFunc);
                expect(el.detachEvent).toHaveBeenCalledWith('onsomeEvent', someFunc);
            });
            it('removes event from element without native event-attaching functions', function() {
                var el = { onsomeEvent: function() {} };

                dom.removeEvent(el, 'someEvent', someFunc);
                expect(el.onsomeEvent).toBe(undefined);
            });
        });
        describe('oneTimeEvent', function() {
            var normalFunc = function() {},
                el, oneTimeFunc;

            beforeEach(function() {
                el = { addEventListener: jasmine.createSpy('addEventListener') };
                oneTimeFunc = jasmine.createSpy('oneTimeFunc');
                spyOn(dom, 'addEvent');
            });
            it('check if addEvent is called with the correct params', function() {
                dom.oneTimeEvent(el, 'someEvent', oneTimeFunc, normalFunc);

                expect(dom.addEvent.calls.allArgs()[0][0]).toBe(el);
                expect(dom.addEvent.calls.allArgs()[0][1]).toBe('someEvent');
            });
            it('calls a one-time function', function() {
                dom.oneTimeEvent(el, 'someEvent', oneTimeFunc, normalFunc);

                dom.addEvent.calls.allArgs()[0][2]();
                expect(oneTimeFunc).toHaveBeenCalled();
            });
            it('calls removeEvent with the correct params', function() {
                spyOn(dom, 'removeEvent');

                dom.oneTimeEvent(el, 'someEvent', oneTimeFunc, normalFunc);

                dom.addEvent.calls.allArgs()[0][2]();
                expect(dom.removeEvent).toHaveBeenCalledWith(el, 'someEvent', dom.addEvent.calls.allArgs()[0][2]);
            });
            it('calls addEvent with the correct params', function() {
                dom.oneTimeEvent(el, 'someEvent', oneTimeFunc, normalFunc);

                dom.addEvent.calls.allArgs()[0][2]();
                expect(dom.addEvent.calls.count()).toBe(2);
                expect(dom.addEvent.calls.allArgs()[1][0]).toBe(el);
                expect(dom.addEvent.calls.allArgs()[1][1]).toBe('someEvent');
                expect(dom.addEvent.calls.allArgs()[1][2]).toBe(normalFunc);
            });
            it('calls addEvent only once, because no normalFunc was passed in', function() {
                dom.oneTimeEvent(el, 'someEvent', oneTimeFunc);

                expect(dom.addEvent.calls.count()).toBe(1);
            });
        });
        describe('getEventTarget', function() {
            var oldEvent = dom._window.event,
                someEvent;

            beforeEach(function() {
                someEvent = {};
                dom._window.event = {};
            });
            afterEach(function() {
                dom._window.event = oldEvent;
            });
            it('returns target variable as null, since the event has no properties', function() {
                someEvent = undefined;

                dom.getEventTarget(someEvent);
                expect(dom.getEventTarget(someEvent)).toEqual(null);
            });
            it('returns target variable as the event target', function() {
                someEvent.target = 'Some target';

                dom.getEventTarget(someEvent);
                expect(dom.getEventTarget(someEvent)).toEqual('Some target');
            });
            it('returns target variable as the event src element', function() {
                someEvent.srcElement = 'Some source element';

                dom.getEventTarget(someEvent);
                expect(dom.getEventTarget(someEvent)).toEqual('Some source element');
            });
            it('returns target variable as its parent node', function() {
                someEvent.target = {
                    nodeType: 3, parentNode: 'Some parent node'
                };

                dom.getEventTarget(someEvent);
                expect(dom.getEventTarget(someEvent)).toEqual('Some parent node');
            });
            it('returns target variable as event target because event target nodeType is not set to 3', function() {
                someEvent.target = {
                    nodeType: 2, parentNode: 'Some parent node'
                };

                dom.getEventTarget(someEvent);
                expect(dom.getEventTarget(someEvent)).toEqual(someEvent.target);
            });
        });
        describe('addClass', function() {
            it('adds single class to element', function() {
                var el = document.createElement('div'),
                    someClass = 'someClass';

                dom.addClass(el, someClass);
                expect(el.className.match(/someClass/)).toBeTruthy();
            });
            it('adds single class to element that already has a class set', function() {
                var el = document.createElement('div'),
                    someClass = 'some';

                el.className = 'someClass';

                dom.addClass(el, someClass);
                expect(el.className.match(/\bsome\b/)).toBeTruthy();
            });
            it('adds multiple classes to element', function() {
                var el = document.createElement('div'),
                    someClasses = [ 'oneClass', 'twoClass' ];

                el.className = 'origClass';

                dom.addClass(el, someClasses);
                expect(el.className.match(/\borigClass\b/) &&
                    el.className.match(/\boneClass\b/) &&
                    el.className.match(/\btwoClass\b/)).toBeTruthy();
            });
            it('does not re-add class to element that already has it', function() {
                var someClass = 'someClass',
                    el = document.createElement('div');

                el.className = someClass;

                dom.addClass(el, someClass);
                expect(el.className).toBe('someClass');
            });
        });
        describe('removeClass', function() {
            it('removes single class from element', function() {
                var el = document.createElement('div'),
                    someClass = 'some';

                el.className = someClass;

                dom.removeClass(el, someClass);
                expect(el.className.match(/\bsome\b/)).toBeFalsy();
            });
            it('removes multiple classes from element', function() {
                var el = document.createElement('div'),
                    someClasses = [ 'oneClass', 'twoClass' ];

                el.className = 'oneClass twoClass unrelatedClass';

                dom.removeClass(el, someClasses);
                expect(el.className.match(/\boneClass\b/) || el.className.match(/\btwoClass\b/)).toBeFalsy();
            });
        });
        describe('_addClassShim', function() {
            it('fallback that adds single class to element', function() {
                var someClass = 'someClass',
                    el = { className: '' };

                dom._addClassShim(el, someClass);
                expect(el.className.match(/someClass/)).toBeTruthy();
            });
            it('fallback that adds single class to element that already has a class set', function() {
                var someClass = 'some',
                    el = { className: 'someClass' };

                dom._addClassShim(el, someClass);
                expect(el.className.match(/\bsome\b/)).toBeTruthy();
            });
            it('testing fallback to add only one class', function() {
                var someClass = 'someClass',
                    el = { className: '' };

                dom._addClassShim(el, someClass);
                expect(el.className === someClass).toBeTruthy();
            });
            it('does not re-add an already present class', function() {
                var someClass = 'someClass',
                    el = { className: 'someClass' };

                dom._addClassShim(el, someClass);
                expect(el.className === someClass).toBeTruthy();
            });
        });
        describe('_removeClassShim', function() {
            it('fallback that removes single class from element', function() {
                var someClass = 'some',
                    el = { className: 'someClass some' };

                dom._removeClassShim(el, someClass);
                expect(el.className.match(/\bsome\b/)).toBeFalsy();
            });
            it('testing fallback to remove only one class', function() {
                var someClass = 'some',
                    el = { className: 'someClass some' };

                dom._removeClassShim(el, someClass);
                expect(el.className.match(/\bsomeClass\b/) && !!!el.className.match(/\bsome\b/)).toBeTruthy();
            });
        });
        describe('checkIsParent', function() {
            var searchEl, el;
            beforeEach(function() {
                searchEl = document.createElement('div');
                el = document.createElement('div');
                document.body.appendChild(searchEl);
                document.body.appendChild(el);
            });
            afterEach(function() {
                document.body.removeChild(searchEl);
                document.body.removeChild(el);
            });
            it('returns true if searchEl is parent', function() {
                searchEl.innerHTML = '<div class="innerEl"></div>';
                expect(dom.checkIsParent(document.querySelectorAll('.innerEl')[0], searchEl)).toBeTruthy();
            });
            it('returns false if searchEl is not parent', function() {
                expect(dom.checkIsParent(el, searchEl)).toBeFalsy();
            });
        });
        describe('centerToElement', function() {
            var target, one, two;
            beforeEach(function() {
                target = document.createElement('div');
                one = document.createElement('div');
                two = document.createElement('div');
                target.style.position = 'absolute';
                target.style.left = '0px';
                one.style.position = 'absolute';
                two.style.position = 'absolute';
                target.style.width = '10px';
                one.style.width = '30px';
                two.style.width = '50px';
                document.body.appendChild(target);
                document.body.appendChild(one);
                document.body.appendChild(two);
            });
            afterEach(function() {
                document.body.removeChild(target);
                document.body.removeChild(one);
                document.body.removeChild(two);
            });
            it('centers single element to a target', function() {
                dom.centerToElement(target, one);
                expect(one.style.left).toBe('-10px');
            });
            it('centers multiple elements to a target', function() {
                dom.centerToElement(target, [ one, two ]);
                expect(one.style.left).toBe('-10px');
                expect(two.style.left).toBe('-20px');
            });
        });
        describe('hasClass', function() {
            var el, anotherEl;
            beforeEach(function() {
                el = document.createElement('div');
                el.className = 'some-class someClass';
                anotherEl = document.createElement('div');
                anotherEl.className = '    some-class     someClass  ';
            });
            it('checks for a class separated with hyphen that is present in the element', function() {
                expect(dom.hasClass(el, 'some-class')).toBeTruthy();
            });
            it('checks for a class separated with camelCase that is present in the element', function() {
                expect(dom.hasClass(el, 'someClass')).toBeTruthy();
            });
            it('checks for a class separated with hyphen in a className attr with extra spaces', function() {
                expect(dom.hasClass(anotherEl, 'some-class')).toBeTruthy();
            });
            it('checks for a class separated with camelCase in a className attr with extra spaces', function() {
                expect(dom.hasClass(anotherEl, 'someClass')).toBeTruthy();
            });
            it('checks for a class that is not present in the element', function() {
                expect(dom.hasClass(el, 'fake-class')).toBeFalsy();
            });
            it('checks for a similar and shorter class that is not present in the element', function() {
                expect(dom.hasClass(el, 'some')).toBeFalsy();
            });
            it('checks for a similar and longer class that is not present in the element', function() {
                expect(dom.hasClass(el, 'some-class-more')).toBeFalsy();
            });
        });
        describe('findParentByClass', function() {
            var el, child;
            beforeEach(function() {
                el = document.createElement('div');
                el.className = 'one';
                el.innerHTML = '<div class="two"><div class="three"></div></div>';
                document.body.appendChild(el);
                child = document.querySelector('.three');
            });
            afterEach(function() {
                document.body.removeChild(el);
            });
            it('gets the closest parent', function() {
                var testElement = dom.findParentByClass(child, 'two');
                expect(testElement.className).toBe('two');
            });
            it('gets parent when it\'s not the closest', function() {
                var testElement = dom.findParentByClass(child, 'one');
                expect(testElement.className).toBe('one');
            });
            it('does not find a parent', function() {
                var testElement = dom.findParentByClass(child, 'zero');
                expect(testElement === null).toBeTruthy();
            });
        });
        describe('setCssProperty', function() {
            var target;
            beforeEach(function() {
                target = document.createElement('div');
            });
            describe('fake element, setProperty', function() {
                var fakeEl;
                beforeEach(function() {
                    fakeEl = {
                        style: {
                            setProperty: jasmine.createSpy('setProperty')
                        }
                    };
                });
                it('calls setProperty when defined', function() {
                    dom.setCssProperty(fakeEl, 'background', 'blue');
                    expect(fakeEl.style.setProperty).toHaveBeenCalledWith('background', 'blue', undefined);
                });
                it('calls setProperty when defined with important', function() {
                    dom.setCssProperty(fakeEl, 'background', 'yellow', 'important');
                    expect(fakeEl.style.setProperty).toHaveBeenCalledWith('background', 'yellow', 'important');
                });
            });
            describe('fake element, ie8 no setProperty', function() {
                var fakeEl;
                beforeEach(function() {
                    fakeEl = {
                        style: {
                            setAttribute: jasmine.createSpy('setAttribute').and.callFake(function(key, value) {
                                fakeEl.style.cssText += key + ':' + value + ';';
                            }),
                            cssText: ''
                        }
                    };
                });
                it('calls setAttribute', function() {
                    dom.setCssProperty(fakeEl, 'background', 'blue');
                    expect(fakeEl.style.setAttribute).toHaveBeenCalledWith('background', 'blue');
                });
                it('calls setAttribute with important', function() {
                    dom.setCssProperty(fakeEl, 'background', 'yellow', 'important');
                    expect(fakeEl.style.setAttribute).toHaveBeenCalledWith('background', 'yellow');
                    expect(fakeEl.style.cssText).toBe('background: yellow !important;');
                });
                it('calls setAttribute with important with other property', function() {
                    fakeEl.style.cssText = 'color: red; display: block;';
                    dom.setCssProperty(fakeEl, 'font-style', 'underline', 'important');
                    expect(fakeEl.style.setAttribute).toHaveBeenCalledWith('font-style', 'underline');
                    expect(fakeEl.style.cssText).toBe(
                        'color: red; display: block;font-style: underline !important;'
                    );
                });
            });
        });
    });
})();
