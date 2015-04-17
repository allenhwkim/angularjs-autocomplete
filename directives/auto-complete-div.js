(function(){
  'use strict';
  var $timeout, $filter, $http, $compile;

  var defaultStyle = {
    display:'none', width: '100%', 'overflow-y': 'hidden'
  };
  
  var showLoading = function(selectEl, show) {
    if (!show) {
      selectEl.innerHTML = '<option class="loading"> Loading </option>'; 
    } else {
      selectEl.querySelector('option.loading').remove();
    }
  };

  var addListElements = function(scope, data) {
// .............. data .................
    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    var key, displayText, filteredData = data;
    if (typeof scope.source !== 'string') { // no filter for url source
      filteredData = $filter('filter')(data, scope.inputEl.value);
    }
    while(selectEl.firstChild) { 
      selectEl.removeChild(selectEl.firstChild);
    }
    selectEl.setAttribute("size", filteredData.length);
    filteredData.forEach(function(el) {
      var key=el, displayText=el;
      var optionEl = document.createElement('option');
      if (typeof el == 'object') {
        key = el[scope.valueProperty];
        displayText = el[scope.displayProperty];
        optionEl.object = el;
      } 
      optionEl.setAttribute('value', key);
      optionEl.innerHTML = displayText;
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

  var addTemplate = function(scope, element, attrs) {
    scope.containerEl = element[0];
    var inputEl = document.createElement('input');
    var selectEl = document.createElement('select');
    inputEl.style.width = '100%';
    inputEl.style.backgroundColor = '#ddd';
    if (attrs.defaultStyle!== 'false') {
      inputEl.style.boxSizing = 'border-box';
      angular.extend(selectEl.style, defaultStyle);
    }
    element[0].appendChild(inputEl);
    element[0].appendChild(selectEl);
    scope.inputEl = inputEl;
    scope.selectEl = selectEl;
  };

  var linkFunc = function(scope, element, attrs) {
    scope.valueProperty = attrs.valueProperty || 'id';
    scope.displayProperty = attrs.displayProperty || 'value';
    addTemplate(scope, element, attrs);

    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    var hideAutoselect = function() {
      $timeout(function() {
        var focusedEl = document.querySelector(':focus');
        if (focusedEl != inputEl && focusedEl != selectEl) {
          element[0].style.display = 'none';
        } 
      }, 100);
    };

    /** listener of keydown, esc/enter, and click */
    var selectOption = function(evt) {
      var optionEl;
      (evt.keyCode == 27) && (evt.target.style.display = 'none'); // esc
      (evt instanceof MouseEvent)  && (optionEl = evt.target); // click
      (evt.keyCode == 13) && (optionEl = evt.target.children[evt.target.selectedIndex]); //enter
      if (optionEl) {
        console.log('selected optionEl', optionEl);
        var selected = optionEl.object || optionEl.value;
        scope.valueChanged({value: selected}); //user scope
        scope.ngModel = optionEl.value;
        attrs.selected && (scope.selected = selected);
        scope.$apply();
        scope.containerEl.style.display='none';
      }
    };

    inputEl.addEventListener('blur', hideAutoselect);
    selectEl.addEventListener('blur', hideAutoselect);

    /** when input element is newly focused, reload list */
    inputEl.addEventListener('focus', function() {
      selectEl.style.display = '', inputEl.value = '';
      loadList(scope);
    });

    /** when enters text to search, reload the list */
    inputEl.addEventListener('input', function() {
      loadList(scope);
    });

    /** when presses down arrow in search box, focus to options */
    inputEl.addEventListener('keydown', function(evt) {
      evt.keyCode == 40 && selectEl.focus();
    });

    /** when presses enter in options, select the element */
    selectEl.addEventListener('keydown', selectOption);
    selectEl.addEventListener('click', selectOption);
  };

  var autoCompleteDiv =
    function(_$timeout_, _$filter_, _$http_, _$compile_) {
      $timeout = _$timeout_, $filter = _$filter_;
      $http = _$http_, $compile = _$compile_;

      return {
        restrict: 'E',
        scope: {
          ngModel : '=', 
          source : '=', 
          selected : '=', 
          valueChanged : '&'
        },  //+valueProperty, +displayProperty
        link: linkFunc 
      };
    };

  angular.module('angular-autocomplete').directive('autoCompleteDiv', autoCompleteDiv);
})();
