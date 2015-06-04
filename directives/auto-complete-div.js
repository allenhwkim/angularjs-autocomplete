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
