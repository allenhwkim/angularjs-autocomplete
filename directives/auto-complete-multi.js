(function(){
  'use strict';

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // accepted attributes
  var autoCompleteAttrs = [
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
    acDiv.style.display = 'none';
    return acDiv;
  };

  var buildMultiACDiv = function(controlEl, attrs) {
    var deleteLink = document.createElement('button');
    deleteLink.innerHTML = 'x';
    deleteLink.className += ' delete';
    deleteLink.setAttribute('ng-click', attrs.ngModel+'.splice($index, 1)');

    var ngRepeatDiv = document.createElement('span');
    ngRepeatDiv.className += ' auto-complete-repeat';
    ngRepeatDiv.setAttribute('ng-repeat', 
      'obj in '+attrs.ngModel+' track by $index');
    ngRepeatDiv.innerHTML = '{{obj["'+attrs.displayProperty+'"] || obj}}';
    ngRepeatDiv.appendChild(deleteLink);

    var multiACDiv = document.createElement('div');
    multiACDiv.className = 'auto-complete-div-multi-wrapper';
    multiACDiv.style.backgroundColor = '#ddd';
    multiACDiv.appendChild(ngRepeatDiv);
    
    return multiACDiv;
  };

  var compileFunc = function(tElement, tAttrs)  {
    tElement[0].style.position = 'relative';

    var controlEl = tElement[0].querySelector('select');
    controlEl.style.display = 'none';
    controlEl.multiple = true;

    tAttrs.valueProperty = tAttrs.valueProperty || 'id';
    tAttrs.displayProperty = tAttrs.displayProperty || 'value';
    tAttrs.ngModel = controlEl.getAttribute('ng-model');

    // 1. build <auto-complete-div>
    var multiACDiv = buildMultiACDiv(controlEl, tAttrs);
    var acDiv = buildACDiv(controlEl, tAttrs);
    multiACDiv.appendChild(acDiv);
    tElement[0].appendChild(multiACDiv);

    // 2. respond to click
    tElement[0].addEventListener('click', function() {
      if (!controlEl.disabled) {
        acDiv.style.display = 'inline-block';
        var acDivInput = acDiv.querySelector('input');
        acDivInput.setAttribute('size', 2);
        acDivInput.focus();
      }
    });

  }; // compileFunc

  angular.module('angularjs-autocomplete').
    directive('autoCompleteMulti', function() {
      return { compile: compileFunc };
    });
})();
