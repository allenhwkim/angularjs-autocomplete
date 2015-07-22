(function(){
  'use strict';
  var $compile;

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // accepted attributes
  var autoCompleteAttrs = [
    'placeholder', 'multiple', 'listFormatter', 'prefillFunc',
    'ngModel', 'valueChanged', 'source', 'pathToData', 'minChars',
    'defaultStyle', 'valueProperty', 'displayProperty'
  ];

  // build autocomplet-div tag with input and select
  var buildACDiv = function(attrs) {
    var acDiv = document.createElement('auto-complete-div');

    var inputEl = document.createElement('input');
    attrs.placeholder = attrs.placeholder || 'Select';
    inputEl.setAttribute('placeholder', attrs.placeholder);
    inputEl.setAttribute('size', attrs.placeholder.length);

    attrs.ngDisabled &&
      inputEl.setAttribute('ng-disabled', attrs.ngDisabled);
    acDiv.appendChild(inputEl);

    var ulEl = document.createElement('ul');
    acDiv.appendChild(ulEl);

    autoCompleteAttrs.map(function(acAttr) {
      if (attrs[acAttr]) {
        var attrValue = attrs[acAttr];
        acDiv.setAttribute(dasherize(acAttr), attrValue);
      }
    });
    acDiv.style.position = 'relative';
    //acDiv.style.display = 'none';
    return acDiv;
  };

  var buildMultiACDiv = function(attrs) {
    var deleteLink = document.createElement('button');
    deleteLink.innerHTML = 'x';
    deleteLink.className += ' delete';
    deleteLink.setAttribute('ng-click', attrs.ngModel+'.splice($index, 1); $event.stopPropagation()');

    var ngRepeatDiv = document.createElement('span');
    ngRepeatDiv.className += ' auto-complete-repeat';
    ngRepeatDiv.setAttribute('ng-repeat', 'obj in '+attrs.ngModel+' track by $index');
    if (attrs.listFormatter) {
      ngRepeatDiv.innerHTML = '<span ng-bind-html="listFormatter(obj)"></span>';
    } else {
      ngRepeatDiv.innerHTML = '<b>({{obj.'+attrs.valueProperty+'}})</b>'+
        '<span>{{obj.'+attrs.displayProperty+'}}</span>';
    }
    ngRepeatDiv.appendChild(deleteLink);

    var multiACDiv = document.createElement('div');
    multiACDiv.className = 'auto-complete-div-multi-wrapper';
    multiACDiv.appendChild(ngRepeatDiv);

    return multiACDiv;
  };

  var compileFunc = function(element, attrs)  {
    element[0].style.position = 'relative';

    var controlEl = element[0].querySelector('select');
    controlEl.style.display = 'none';

    attrs.valueProperty = attrs.valueProperty || 'id';
    attrs.displayProperty = attrs.displayProperty || 'value';
    attrs.ngModel = controlEl.getAttribute('ng-model');
    attrs.multiple = true;

    // 1. build <auto-complete-div>
    var multiACDiv = buildMultiACDiv(attrs);
    var acDiv = buildACDiv(attrs);
    multiACDiv.appendChild(acDiv);
    element[0].appendChild(multiACDiv);

  }; // compileFunc

  angular.module('angularjs-autocomplete').
    directive('autoCompleteMulti', ['$compile', function(_$compile_) {
      $compile = _$compile_;
      return { compile: compileFunc };
    }]);
})();
