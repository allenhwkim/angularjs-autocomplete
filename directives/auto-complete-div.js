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
    data.forEach(function(el) {
      var liEl = document.createElement('li');
      var displayText = typeof el == 'object' ?
        el[scope.displayProperty] : el;
      liEl.innerHTML = displayText;
      liEl.object = el;
      ulEl.appendChild(liEl);
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
    var inputEl = scope.inputEl, ulEl = scope.ulEl;
    while(ulEl.firstChild) { 
      ulEl.removeChild(ulEl.firstChild);
    }
    if (scope.source.constructor.name == 'Array') { // local source
      var filteredData = $filter('filter')(scope.source, inputEl.value);
      addListElements(scope, filteredData);
    } else { // remote source
      ulEl.style.display = 'none';
      if (inputEl.value.length >= scope.minChars) {
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

  var linkFunc = function(scope, element, attrs) {
    var containerEl = element[0];
    var controlEl = element[0].controlEl;
    controlEl.readOnly = true;
    var isMultiple = containerEl.hasAttribute('multiple');
    scope.inputEl = element[0].querySelector('input');
    scope.ulEl =  element[0].querySelector('ul');

    // add default class css to head tag
    if (scope.defaultStyle !== false) {
      containerEl.className += ' default-style';
      AutoComplete.injectDefaultStyle();
    }

    var inputEl = scope.inputEl, ulEl = scope.ulEl;
    var hideAutoselect = function() {
      var elToHide = isMultiple ? containerEl : ulEl;
      $timeout(function() {
        elToHide.style.display = 'none';
      }, 200);
    };

    var focusInputEl = function(evt) {
      if (!scope.ngDisabled) {
        ulEl.style.display = 'block'; 
        inputEl.focus();
        inputEl.value = '';
        loadList(scope);
      }
    };

    if (isMultiple) {
      inputEl.parentNode.parentNode.
        addEventListener('click', focusInputEl, true);
    }

    /** listener of keydown, esc/enter, and click of OPTION */
    var select = function(evt) {
      var liEl;
      (evt.keyCode == 27) && (evt.target.style.display = 'none'); // esc
      (evt instanceof MouseEvent)  && (liEl = evt.target); // click
      (evt.keyCode == 13) && (liEl = evt.target.children[evt.target.selectedIndex]); //enter
      if (liEl) {
        liEl.tagName == "SELECT" && (liEl = liEl.firstChild);
        var elToHide = isMultiple ? ulEl : containerEl;
        elToHide.style.display = 'none';

        if (attrs.ngModel) {
          if (controlEl && controlEl.tagName == 'INPUT') {
            scope.ngModel = liEl.innerHTML ;
          } else if (isMultiple) {
            scope.ngModel.push(liEl.object);
          } else {
            scope.ngModel = liEl.object;
          }
        }

        scope.valueChanged({value: liEl.object}); //user scope
        scope.$apply();
      }
    };

    inputEl.addEventListener('blur', hideAutoselect);
    ulEl.addEventListener('blur', hideAutoselect);

    /** when input element is newly focused, reload list */
    inputEl.addEventListener('focus', focusInputEl );

    /** when enters text to search, reload the list */
    inputEl.addEventListener('input', function() {
      var delayMs = scope.source.constructor.name == 'Array' ? 10 : 500;
      delay(function() { //executing after user stopped typing
        loadList(scope);
      }, delayMs);
    });

    /** when presses down arrow in search box, focus to options */
    inputEl.addEventListener('keydown', function(evt) {
      evt.keyCode == 27 && hideAutoselect();
      //TODO: evt.keyCode == 40 && ulEl.firstChild.focus();
      if (evt.keyCode == 13 && ulEl.style.display !== 'none' ) {  
        ulEl.firstChild.dispatchEvent(
          new MouseEvent('click', {bubbles:true, view: window})
        );
        focusInputEl(); 
      }
    });

    /** when presses enter in options, select the element */
    ulEl.addEventListener('keydown', select);
    ulEl.addEventListener('click', select);
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
          ngDisabled : '=', 
          source : '=', 
          minChars : '=', 
          defaultStyle : '=', 
          pathToData : '@', 
          valueProperty: '@',
          displayProperty: '@',
          valueChanged : '&'
        },
        link: linkFunc 
      };
    };

  angular.module('angular-autocomplete').
    directive('autoCompleteDiv', autoCompleteDiv);
})();
