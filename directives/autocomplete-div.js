(function(){
  'use strict';
  var $timeout, $filter, $http, $compile;

  var defaultStyle = {
    display:'none', width: '100%', 'overflow-y': 'auto'
  };

  var getSourceType = function(source) {
    if (Array.isArray(source) && source[0]) {           // for array source
      return source[0].constructor !== Object ? 1 : 2;  //   1: primitive elements 2: hash elements
    } else if (source.constructor === Object) {         // for hash source
      var firstKey = Object.keys(source)[0];            //   3: primitive value, 4: hash value
      return (typeof source[firstKey] === 'string') ? 3 : 4;
    }
  };

  var showLoading = function(selectEl, show) {
    if (!show) {
      selectEl.innerHTML = '<option class="loading"> Loading </option>'; 
    } else {
      selectEl.querySelector('option.loading').remove();
    }
  };

  var addListElements = function(scope, data) {
    var inputEl = scope.inputEl, selectEl = scope.selectEl;
    var sourceType = getSourceType(data);
    var key, displayText, filteredData;
    //
    //TODO: build a function 'getKeysTexts' 
    //  returns array of {key: 0(or hash key), displayText: displayText} 
    //
    //  then use 'key's to filter to build filteredData
    //
    if (typeof scope.source !== 'string') { // no filter for url source
      filteredData = $filter('filter')(data, scope.keyword);
      console.log('filteredData', filteredData);
    }
    var select = function(key, displayText, obj) {
      return function() { 
        scope.selected = { value: key, text: displayText };
        (obj.constructor == Object) && (scope.selected.object = obj);
        scope.containerEl.controlEl.setOptions(scope.selected);
        scope.valueChanged({value: scope.selected}); //user scope
        //inputEl.value = scope.selected.value;
        scope.ngModel = scope.selected.value;
        scope.$apply();
      };
    };
    while(selectEl.firstChild) { 
      selectEl.removeChild(selectEl.firstChild);
    }
    selectEl.setAttribute("size",
      filteredData.length || Object.keys(filteredData).length);
    for (var id in filteredData) {
      var el = filteredData[id];
      if (sourceType == 1) {
        key = el, displayText=el;
      } else if (sourceType == 2) {
        key = el[scope.valueProperty];
        displayText = el[scope.displayProperty];
      } else if (sourceType == 3) {
        key = id, displayText = el;
      } else if (sourceType == 4) {
        key = el[scope.valueProperty] || id;
        displayText = el[scope.displayProperty];
      }
      var optionEl = document.createElement('option');
      optionEl.setAttribute('value', key);
      optionEl.innerHTML = displayText;
      optionEl.addEventListener('click', select(key, displayText, el));
      selectEl.appendChild(optionEl);
    }
  };

  var loadList = function(scope, keyword) {
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
    scope.inputEl = document.createElement('input');
    scope.selectEl = document.createElement('select');
    scope.inputEl.style.width = '100%';
    scope.inputEl.style.backgroundColor = '#ddd';
    if (attrs.defaultStyle!== 'false') {
      scope.inputEl.style.boxSizing = 'border-box';
      angular.extend(scope.selectEl.style, defaultStyle);
    }
    element[0].appendChild(scope.inputEl);
    element[0].appendChild(scope.selectEl);
  };

  var linkFunc = function(scope, element, attrs) {
    scope.valueProperty = attrs.valueProperty || 'id';
    scope.displayProperty = attrs.displayProperty || 'value';
    addTemplate(scope, element, attrs);

    /** when input element is newly focused, reload list */
    scope.inputEl.addEventListener('focus', function() {
      scope.selectEl.style.display = '';
      scope.keyword = '';
      scope.inputEl.value = '';
      loadList(scope);
    });

    /** when enters text to search, reload the list */
    scope.inputEl.addEventListener('blur', function() {
      if (!document.hasFocus(scope.selectEl)) {
        $timeout(function() {
          scope.selectEl.style.display = 'none';
          element[0].style.display = 'none';
        }, 200);
      }
    });

    /** when enters text to search, reload the list */
    scope.inputEl.addEventListener('input', function() {
      scope.keyword = scope.inputEl.value;
      loadList(scope);
    });

    /** when presses down arrow in search box, focus to options */
    scope.inputEl.addEventListener('keydown', function(evt) {
      evt.keyCode == 40 && scope.selectEl.focus();
    });

    /** when presses enter in options, select the element */
    scope.selectEl.addEventListener('keydown', function(evt) {
      evt.keyCode == 13 && console.log(13);
    });
  };

  var autocompleteDiv =
    function(_$timeout_, _$filter_, _$http_, _$compile_) {
      $timeout = _$timeout_;
      $filter = _$filter_;
      $http = _$http_;
      $compile = _$compile_;

      return {
        restrict: 'E',
        scope: {
          ngModel : '=', 
          source : '=', 
          valueChanged : '&'
        },  //+valueProperty, +displayProperty
        link: linkFunc 
      };
    };

  angular.module('angular-autocomplete').directive('autocompleteDiv', autocompleteDiv);
})();
