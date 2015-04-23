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
    'ngModel', 'ngDisabled', 'valueChanged',
    'source', 'dataPath', 
    'defaultStyle', 'valueProperty', 'displayProperty'
  ];

  // position autocomplete-div tag
  var positionACDiv = function(controlEl, acDiv) {
    var controlBCR = controlEl.getBoundingClientRect();

    angular.extend(acDiv.style, {
      display: 'block',
      position: 'absolute',
      top: (window.scrollY + controlBCR.top) + 'px',
      left: (window.scrollX + controlBCR.left) + 'px',
      width : controlBCR.width + 'px'
    });
  };

  // build autocomplet-div tag with input and select
  var buildACDiv = function(controlEl, attrs) {
    var acDiv = document.createElement('auto-complete-div');
    var controlBCR = controlEl.getBoundingClientRect();
    acDiv.controlEl = controlEl;

    var inputEl = document.createElement('input');
    attrs.ngDisabled && 
      inputEl.setAttribute('ng-disabled', attrs.ngDisabled);
    acDiv.appendChild(inputEl);

    // for multi select, set input field length dynamic
    if (controlEl.tagName == 'SELECT' && controlEl.multiple) {
      inputEl.setAttribute('size', 2);
      inputEl.addEventListener('keydown', function(){
        this.setAttribute('size', this.value.length+1);
      });
    } else {
      inputEl.style.width = (controlBCR.width - 28) + 'px';
    }

    var ulEl = document.createElement('ul');
    acDiv.appendChild(ulEl);

    autoCompleteAttrs.map(function(attr) {
      attrs[attr] && acDiv.setAttribute(dasherize(attr), attrs[attr]);
    });
    return acDiv;
  };

  // default style autocomplete-div input and select tag
  var applyDefaultStyle = function(controlEl, acDiv) {
    var controlBCR = controlEl.getBoundingClientRect();

    var inputEl = acDiv.querySelector('input');
    var height = controlEl.multiple ? '': (controlBCR.height - 6) + 'px';
    inputEl.style.height = height;
  };

  var buildMultiACDiv = function(controlEl, attrs) {
    var deleteLink = document.createElement('button');
    deleteLink.innerHTML = 'x';
    deleteLink.className += ' delete';
    deleteLink.setAttribute('ng-click', attrs.ngModel+'.splice($index, 1)');
    console.log('attrs.ngDisabled', attrs.ngDisabled);
    if (attrs.ngDisabled) {
      deleteLink.setAttribute('ng-disabled', attrs.ngDisabled);
    }

    var ngRepeatDiv = document.createElement('span');
    ngRepeatDiv.className += ' auto-complete-repeat';
    ngRepeatDiv.setAttribute('ng-repeat', 
      'obj in '+attrs.ngModel+' track by $index');
    ngRepeatDiv.innerHTML = '{{obj["'+attrs.displayProperty+'"] || obj}}';
    ngRepeatDiv.appendChild(deleteLink);

    var multiACDiv = document.createElement('div');
    multiACDiv.style.backgroundColor = '#ddd'; //temporarily
    multiACDiv.appendChild(ngRepeatDiv);
    
    return multiACDiv;
  };

  var compileFunc = function(tElement, tAttrs)  {
    var controlEl = tElement[0];
    tAttrs.valueProperty = tAttrs.valueProperty || 'id';
    tAttrs.displayProperty = tAttrs.displayProperty || 'value';

    // 1. modify attributes for <select> tag
    if (controlEl.tagName == "SELECT" && tAttrs.ngModel) {
      var collectionStr = (controlEl.multiple)  ? 
        ''+tAttrs.ngModel : '['+tAttrs.ngModel+']';
      tAttrs.ngOptions = 
        "obj as (obj['" + tAttrs.displayProperty + "'] || obj) "+ 
        "for obj in " + collectionStr;
    }

    // 2. build <auto-complete-div>
    var acDiv = buildACDiv(controlEl, tAttrs);
    (tAttrs.defaultStyle != 'false') && 
      applyDefaultStyle(controlEl, acDiv);

    // for multiple select
    if (controlEl.tagName == "SELECT" && tAttrs.ngModel && tAttrs.multiple) {
      var multiACDiv = buildMultiACDiv(controlEl, tAttrs);
      acDiv.setAttribute("multiple","");
      multiACDiv.appendChild(acDiv);
      controlEl.parentNode.insertBefore(multiACDiv, controlEl.nextSibling);
      controlEl.style.display = 'none';
    } else { //for input and single select
      acDiv.style.display = 'none';
      controlEl.parentNode.insertBefore(acDiv, controlEl.nextSibling);
      controlEl.addEventListener('click', function() {
        positionACDiv(controlEl, acDiv);
        acDiv.firstChild.focus();
      });
    }

  }; // compileFunc

  angular.module('angular-autocomplete',[]);
  angular.module('angular-autocomplete').
    directive('autoComplete', function() {
      return { compile: compileFunc };
    });
})();
