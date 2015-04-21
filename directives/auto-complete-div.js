(function(){
  'use strict';
  var $timeout, $filter, $http, $compile, AutoComplete;

  var showLoading = function(selectEl, show) {
    if (!show) {
      selectEl.innerHTML = '<option class="loading"> Loading </option>'; 
    } else {
      selectEl.querySelector('option.loading').remove();
    }
  };

  var addListElements = function(scope, data) {
    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    var displayText, filteredData = data;
    if (typeof scope.source !== 'string') { // no filter for url source
      filteredData = $filter('filter')(data, scope.inputEl.value);
    }
    while(selectEl.firstChild) { 
      selectEl.removeChild(selectEl.firstChild);
    }
    selectEl.setAttribute("size", filteredData.length);
    filteredData.forEach(function(el) {
      var optionEl = document.createElement('option');
      var displayText = typeof el == 'object' ?
        el[scope.displayProperty] : el;
      optionEl.innerHTML = displayText;
      optionEl.object = el;
      selectEl.appendChild(optionEl);
    });
  };

  var loadList = function(scope) {
    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    if (typeof scope.source == 'string') {     // url
       var url= scope.source.replace(/:[a-z]+/i, inputEl.value); 
       showLoading(selectEl, true);
       $http.get(url).success(function(data){
         addListElements(scope, data);
         showLoading(selectEl, false);
       }).error(function(){
         showLoading(selectEl, false);
       });
    } else {
      addListElements(scope, scope.source);
    }
  };

  var linkFunc = function(scope, element, attrs) {
    var containerEl = element[0];
    var controlEl = element[0].controlEl;
    var isMultiple = containerEl.hasAttribute('multiple');
    scope.inputEl = element[0].querySelector('input');
    scope.selectEl =  element[0].querySelector('select');

    // add default class css to head tag
    if (scope.defaultStyle !== false) {
      console.log('scope.defaultStyle', scope.defaultStyle);
      containerEl.className += ' default-style';
      AutoComplete.injectDefaultStyle();
    }

    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    var hideAutoselect = function() {
      $timeout(function() {
        var focusedEl = document.querySelector(':focus');
        if (focusedEl != inputEl && focusedEl != selectEl) {
          var elToHide = isMultiple ? selectEl : containerEl;
          elToHide.style.display = 'none';
        } 
      }, 100);
    };

    var focusInputEl = function(evt) {
      selectEl.style.display = 'inline-block'; 
      inputEl.focus();
      inputEl.value = '';
      loadList(scope);
    };
    if (isMultiple) {
      inputEl.parentNode.parentNode.addEventListener('click', focusInputEl, true);
    }

    /** listener of keydown, esc/enter, and click of OPTION */
    var select = function(evt) {
      var optionEl;
      (evt.keyCode == 27) && (evt.target.style.display = 'none'); // esc
      (evt instanceof MouseEvent)  && (optionEl = evt.target); // click
      (evt.keyCode == 13) && (optionEl = evt.target.children[evt.target.selectedIndex]); //enter
      if (optionEl) {
        optionEl.tagName == "SELECT" && (optionEl = optionEl.firstChild);
        var elToHide = isMultiple ? selectEl : containerEl;
        elToHide.style.display = 'none';

        if (attrs.ngModel) {
          if (controlEl && controlEl.tagName == 'INPUT') {
            scope.ngModel = optionEl.innerHTML ;
          } else if (isMultiple) {
            scope.ngModel.push(optionEl.object);
          } else {
            scope.ngModel = optionEl.object;
          }
        }

        scope.valueChanged({value: optionEl.object}); //user scope
        scope.$apply();
      }
    };

    inputEl.addEventListener('blur', hideAutoselect);
    selectEl.addEventListener('blur', hideAutoselect);

    /** when input element is newly focused, reload list */
    inputEl.addEventListener('focus', focusInputEl );

    /** when enters text to search, reload the list */
    inputEl.addEventListener('input', function() {
      loadList(scope);
    });

    /** when presses down arrow in search box, focus to options */
    inputEl.addEventListener('keydown', function(evt) {
      evt.keyCode == 27 && hideAutoselect();
      evt.keyCode == 40 && selectEl.focus();
      if (evt.keyCode == 13 && selectEl.style.display !== 'none' ) {  
        selectEl.firstChild.dispatchEvent(
          new MouseEvent('click', {bubbles:true, view: window})
        );
        focusInputEl(); 
      }
    });

    /** when presses enter in options, select the element */
    selectEl.addEventListener('keydown', select);
    selectEl.addEventListener('click', select);
  };

  var autoCompleteDiv =
    function(_$timeout_, _$filter_, _$http_, _$compile_, _AutoComplete_) {
      $timeout = _$timeout_;
      $filter = _$filter_;
      $http = _$http_; 
      $compile = _$compile_;
      AutoComplete = _AutoComplete_;

      return {
        restrict: 'E',
        scope: {
          ngModel : '=', 
          source : '=', 
          defaultStyle : '=', 
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
