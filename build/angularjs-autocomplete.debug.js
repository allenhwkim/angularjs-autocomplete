(function(){
  'use strict';
  var $compile, $parse;

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // accepted attributes
  var autoCompleteAttrs = [
    'placeholder',
    'ngModel', 'valueChanged', 'source', 'pathToData', 'minChars',
    'defaultStyle', 'valueProperty', 'displayProperty'
  ];

  // build autocomplet-div tag with input and select
  var buildACDiv = function(controlEl, attrs) {
    var acDiv = document.createElement('auto-complete-div');
    var controlBCR = controlEl.getBoundingClientRect();
    acDiv.controlEl = controlEl;

    var inputEl = document.createElement('input');
    attrs.ngDisabled && 
      inputEl.setAttribute('ng-disabled', attrs.ngDisabled);
    acDiv.appendChild(inputEl);

    var ulEl = document.createElement('ul');
    acDiv.appendChild(ulEl);

    autoCompleteAttrs.map(function(attr) {
      attrs[attr] && acDiv.setAttribute(dasherize(attr), attrs[attr]);
    });
    acDiv.style.position = 'absolute';
    acDiv.style.top = 0;
    acDiv.style.left = 0;
    acDiv.style.display = 'none';
    return acDiv;
  };

  var linkFunc = function(scope, element, attrs)  {
    element[0].style.position = 'relative';

    var controlEl = element[0].querySelector('input, select');

    attrs.valueProperty = attrs.valueProperty || 'id';
    attrs.displayProperty = attrs.displayProperty || 'value';
    attrs.ngModel = controlEl.getAttribute('ng-model');

    if (controlEl.tagName == 'SELECT') {
      var controlBCR = controlEl.getBoundingClientRect();
      var placeholderEl = document.createElement('div');
      placeholderEl.className = 'select-placeholder';
      placeholderEl.style.lineHeight = controlBCR.height + 'px';
      controlEl.placeholderEl = placeholderEl;
      element[0].appendChild(placeholderEl);
      // if ngModel value is undefined, show text with placeholder
      if ($parse(attrs.ngModel)(scope) === undefined) { 
        placeholderEl.innerHTML = attrs.placeholder;
      } 
      // if noModel has value, observe initSelectText and set text
      else {
        attrs.$observe('initSelectText', function(val) {
          val && (placeholderEl.innerHTML = val);
        });
      }
    }

    // 1. build <auto-complete-div>
    var acDiv = buildACDiv(controlEl, attrs);
    element[0].appendChild(acDiv);

    // 2. respond to click by hiding option tags
    controlEl.addEventListener('mouseover', function() {
      for (var i=0; i<controlEl.children.length; i++) {
        controlEl.children[i].style.display = 'none';
      }
    });
    controlEl.addEventListener('mouseout', function() {
      for (var i=0; i<controlEl.children.length; i++) {
        controlEl.children[i].style.display = '';
      }
    });
    controlEl.addEventListener('click', function() {
      if (!controlEl.disabled) {
        acDiv.style.display = 'block';
        var controlBCR = controlEl.getBoundingClientRect();
        var acDivInput = acDiv.querySelector('input');
        acDiv.style.width = controlBCR.width + 'px';
        acDivInput.style.width = (controlBCR.width - 30) + 'px';
        acDivInput.style.height = controlBCR.height + 'px';
        acDivInput.focus();
      }
    });

    $compile(element.contents())(scope);

  }; // linkFunc

  angular.module('angularjs-autocomplete',[]);
  angular.module('angularjs-autocomplete').
    directive('autoComplete', function(_$compile_, _$parse_) {
      $compile = _$compile_, $parse = _$parse_;
      return { 
        link: linkFunc };
    });
})();

(function(){
  'use strict';
  var $timeout, $filter, $compile, AutoComplete;

  var showLoading = function(ulEl, show) {
    if (show) {
      ulEl.innerHTML = '<li class="loading"> Loading </li>'; 
    } else {
      ulEl.querySelector('li.loading') &&
        ulEl.querySelector('li.loading').remove();
    }
  };

  var addListElements = function(scope, data) {
    var inputEl = scope.inputEl, ulEl = scope.ulEl;
    var displayText;
    var getLiEl = function(modelValue, viewValue, el) {
      var liEl = document.createElement('li');
      liEl.innerHTML = viewValue;
      liEl.model = el;
      liEl.modelValue = modelValue;
      liEl.viewValue = viewValue;
      return liEl;
    };
    if (scope.placeholder &&
        !scope.isMultiple &&
        scope.controlEl.tagName == 'SELECT') {
      ulEl.appendChild(getLiEl(undefined, scope.placeholder));
    }
    data.forEach(function(el) {
      var viewValue = typeof el == 'object' ? el[scope.displayProperty] : el;
      var modelValue = typeof el == 'object' ? el[scope.valueProperty] : el;
      ulEl.appendChild(getLiEl(modelValue, viewValue, el));
    });
  };

  var delay = (function(){
    var timer = 0;
    return function(callback, ms){
      $timeout.cancel(timer);
      timer = $timeout(callback, ms);
    };
  })();

  var loadList = function(scope) {
    console.log(111111111111);
    var inputEl = scope.inputEl, ulEl = scope.ulEl;
    while(ulEl.firstChild) { 
      ulEl.removeChild(ulEl.firstChild);
    }
    if (scope.source.constructor.name == 'Array') { // local source
      var filteredData = $filter('filter')(scope.source, inputEl.value);
      ulEl.style.display = 'block';
      addListElements(scope, filteredData);
    } else { // remote source
      ulEl.style.display = 'none';
      if (inputEl.value.length >= (scope.minChars||0)) {
        ulEl.style.display = 'block';
        showLoading(ulEl, true);
        AutoComplete.getRemoteData(
          scope.source, {keyword: inputEl.value}, scope.pathToData).then(
          function(data) {
            showLoading(ulEl, false);
            addListElements(scope, data);
          }, function(){
            showLoading(ulEl, false);
          });
      } // if
    } // else remote source
  };

  var hideAutoselect = function(scope) {
    var elToHide = scope.isMultiple ? scope.ulEl : scope.containerEl;
    elToHide.style.display = 'none';
  };

  var focusInputEl = function(scope) {
    scope.ulEl.style.display = 'block'; 
    scope.inputEl.focus();
    scope.inputEl.value = '';
    console.log(2222222222);
    loadList(scope);
  };

  var inputElKeyHandler = function(scope, keyCode) {
    var selected = scope.ulEl.querySelector('.selected');
    switch(keyCode) {
      case 27: // ESC
        selected.className = '';
        hideAutoselect(scope); 
        break;
      case 38: // UP
        if (selected.previousSibling) {
          selected.className = '';
          selected.previousSibling.className = 'selected';
        }
        break;
      case 40: // DOWN
        scope.ulEl.style.display = 'block';
        if (selected && selected.nextSibling) {
          selected.className = '';
          selected.nextSibling.className = 'selected';
        } else if (!selected) {
          scope.ulEl.firstChild.className = 'selected';
        }
        break;
      case 13: // ENTER
        selected && scope.select(selected);
        break;
      case 8: // BACKSPACE
        // remove the last element for multiple and empty input
        if (scope.isMultiple && scope.inputEl.value === '') {
          $timeout(function() {
            scope.ngModel.pop();
          });
        }
    }
  };

  var linkFunc = function(scope, element, attrs) {
    var inputEl, ulEl, isMultiple, containerEl, controlEl;
    containerEl = element[0];
    controlEl = element[0].controlEl;
    scope.containerEl = containerEl;
    scope.controlEl   = controlEl;
    scope.isMultiple = isMultiple = controlEl.multiple;
    scope.inputEl = inputEl = element[0].querySelector('input');
    scope.ulEl = ulEl = element[0].querySelector('ul');

    controlEl && (controlEl.readOnly = true);

    // add default class css to head tag
    if (scope.defaultStyle !== false) {
      containerEl.className += ' default-style';
      AutoComplete.injectDefaultStyle();
    }

    isMultiple && 
      inputEl.parentNode.parentNode.addEventListener('click', function() {
        !controlEl.disabled && focusInputEl(scope);
      });

    scope.select = function(liEl) {
      liEl.className = '';
      hideAutoselect(scope);
      $timeout(function() {
        if (attrs.ngModel) {
          if (controlEl.tagName == 'INPUT') {
            scope.ngModel = liEl.innerHTML ;
          } else if (isMultiple) {
            scope.ngModel.push(liEl.model);
          } else if (controlEl.tagName == 'SELECT') {
            scope.ngModel = liEl.modelValue;
            controlEl.placeholderEl.innerHTML = liEl.viewValue;
          } 
        }
        inputEl.value = '';
        scope.valueChanged({value: liEl.model}); //user scope
      });
    };

    inputEl.addEventListener('focus', function(evt) {
      !controlEl.disabled && focusInputEl(scope);
    }); 

    inputEl.addEventListener('blur', function() {
      hideAutoselect(scope);
    }); // hide list

    inputEl.addEventListener('keydown', function(evt) {
      inputElKeyHandler(scope, evt.keyCode);
    });

    ulEl.addEventListener('mousedown', function(evt) { 
      evt.target.tagName == 'LI' && scope.select(evt.target);
    });

    /** when enters text to search, reload the list */
    inputEl.addEventListener('input', function() {
      var delayMs = scope.source.constructor.name == 'Array' ? 10 : 500;
      delay(function() { //executing after user stopped typing
        console.log(33333333333);
        loadList(scope);
      }, delayMs);

      isMultiple && inputEl.setAttribute('size', inputEl.value.length+1);
    });

  };

  var autoCompleteDiv =
    function(_$timeout_, _$filter_, _$compile_, _AutoComplete_) {
      $timeout = _$timeout_;
      $filter = _$filter_;
      $compile = _$compile_;
      AutoComplete = _AutoComplete_;

      return {
        restrict: 'E',
        scope: {
          ngModel : '=', 
          source : '=', 
          minChars : '=', 
          defaultStyle : '=', 
          pathToData : '@', 
          valueProperty: '@',
          displayProperty: '@',
          placeholder: '@',
          valueChanged : '&'
        },
        link: linkFunc 
      };
    };

  angular.module('angularjs-autocomplete').
    directive('autoCompleteDiv', autoCompleteDiv);
})();

(function(){
  'use strict';
  var $q, $http;

  var defaultStyle = 
    'div[auto-complete] select ~ div.select-placeholder {'+
    '  position: absolute; '+
    '  padding-left: 12px;'+
    '  top: 0;'+
    '  left: 0;'+
    '  pointer-events: none;'+
    '}' + 

    'auto-complete-div.default-style input {'+
    '  outline: none; '+
    '  border: 2px solid transparent;'+
    '  border-width: 3px 2px;'+
    '  margin: 0;'+
    '  box-sizing: border-box;'+
    '  background-clip: content-box;'+
    '}' + 

    'select ~ auto-complete-div.default-style input {'+
    '  border-width: 3px 3px;'+
    '}' + 

    'auto-complete-div.default-style ul {'+
    '  background-color: #fff;'+
    '  margin-top: 2px;'+
    '  display : none;'+
    '  width : 100%;'+
    '  overflow-y: auto;'+
    '  list-style-type: none;'+
    '  margin: 0;'+
    '  padding: 0;'+
    '  border: 1px solid #ccc;'+
    '  box-sizing: border-box;'+
    '}' + 

    'auto-complete-div.default-style ul li {'+
    '  padding: 2px 5px;'+
    '  border-bottom: 1px solid #eee;'+
    '}' + 

    'auto-complete-div.default-style ul li.selected {'+
    '  background-color: #ccc;'+
    '}' + 

    'auto-complete-div.default-style ul li:last-child {'+
    '  border-bottom: none;'+
    '}' + 

    'auto-complete-div.default-style ul li:hover {'+
    '  background-color: #ccc;'+
    '}' + 

    'div .auto-complete-repeat {'+
    '  display: inline-block;'+
    '  padding: 3px; '+
    '  background : #fff;'+
    '  margin: 3px;' +
    '  border: 1px solid #ccc;' +
    '  border-radius: 5px;' +
    '}' +

    'div .auto-complete-repeat .delete {'+
    '  margin: 0 3px;' +
    '  color: red;' +
    '  border: none;' +
    '  background-color: transparent; ' +
    '}' +

    'div .auto-complete-repeat .delete[disabled] {'+
    '  display: none;' +
    '}' +

    '.auto-complete-div-multi-wrapper {'+
    '  background-color: #ddd;'+
    '  min-height: 2em;'+
    '}'+

    '.auto-complete-div-multi-wrapper auto-complete-div.default-style {'+
    '  position: relative;'+
    '  display: inline-block;'+
    '  margin: 3px;'+
    '  padding: 3px;'+
    '}'+

    '.auto-complete-div-multi-wrapper auto-complete-div.default-style input {'+
    '  background: transparent;'+
    '  border-radius: 0;'+
    '  border: none;'+
    '}'+

    '.auto-complete-div-multi-wrapper auto-complete-div.default-style ul {'+
    '  position: absolute;'+
    '  top: 1.5em;'+
    '  left: 0;'+
    '  width: auto;'+
    '  min-width: 10em;'+
    '}'+

    '';

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // get style string of an element
  var getStyle = function(el,styleProp) {
    return document.defaultView.
      getComputedStyle(el,null).
      getPropertyValue(styleProp);
  };

  var injectDefaultStyleToHead = function() {
    if (!document.querySelector('style#auto-complete-style')) {
      var htmlDiv = document.createElement('div');
      htmlDiv.innerHTML = '<b>1</b>'+ 
        '<style id="auto-complete-style">' +
        defaultStyle +
        '</style>';
      document.getElementsByTagName('head')[0].
        appendChild(htmlDiv.childNodes[1]);
    }
  };

  var getRemoteData = function(source, query, pathToData) {
    var deferred = $q.defer(), httpGet;
    if (typeof source == 'string') {
      var keyValues = []; 
      for (var key in query) { // replace all keyword to value
        var regexp = new RegExp(key, 'g');
        if (source.match(regexp)) {
          source = source.replace(regexp, query[key]);
        } else {
          keyValues.push(key + "=" + query[key]);
        }
      }
      if (keyValues.length) {
        var qs = keyValues.join("&");
        source += source.match(/\?[a-z]/i) ? qs : ('?' + qs);
      }
      httpGet = $http.get(source);
    } else if (source.$promise) { 
      httpGet = source(query).$promise;
    } else if (typeof source == 'function') {
      httpGet = source(query);
      httpGet.$promise && (httpGet = source(query).$promise);
      if (!httpGet.then) {
        throw "source function must return a promise";
      }
    }

    httpGet.then(
      function(resp) {
        var list = resp.constructor.name == 'Resource' ? resp : resp.data;
        if (pathToData) {
          var paths = pathToData.split('.');
          paths.forEach(function(el) {
            list = list[el];
          });
        }
        deferred.resolve(list);
      }, 
      function(error) {
        deferred.reject(error);
      }
    );

    return deferred.promise;
  };

  angular.module('angularjs-autocomplete').
    factory('AutoComplete', function(_$q_, _$http_) {
      $q = _$q_, $http = _$http_;
      return {
        defaultStyle: defaultStyle,
        dasherize: dasherize,
        getStyle: getStyle,
        getRemoteData: getRemoteData,
        injectDefaultStyle: injectDefaultStyleToHead
      };
    });
})();
