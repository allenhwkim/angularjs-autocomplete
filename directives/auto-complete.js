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
    'source', 'pathToData', 'minChars',
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
    } else {
      var width = controlBCR.width;
      (controlEl.tagName == 'SELECT') && (width -= 28);
      inputEl.style.width = width + 'px';
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
    var targetStyle;
    // set width/heigth of multiple select box
    if (controlEl && controlEl.multiple) {
      targetStyle = acDiv.parentElement.style;
      targetStyle.display = 'inline-block';
      targetStyle.width = controlBCR.width + 'px';
      targetStyle.minHeight = controlBCR.height + 'px';
    }
    // set width/height of input box
    else { 
      targetStyle = acDiv.querySelector('input').style;
      targetStyle.height = controlBCR.height + 'px';
    }
  };

  var buildMultiACDiv = function(controlEl, attrs) {
    var deleteLink = document.createElement('button');
    deleteLink.innerHTML = 'x';
    deleteLink.className += ' delete';
    deleteLink.setAttribute('ng-click', attrs.ngModel+'.splice($index, 1)');
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
    if (controlEl.tagName == "SELECT" && 
      tAttrs.ngModel && tAttrs.multiple) { // for multiple select
      var multiACDiv = buildMultiACDiv(controlEl, tAttrs);
      acDiv.setAttribute("multiple","");
      multiACDiv.appendChild(acDiv);
      controlEl.parentNode.insertBefore(multiACDiv, controlEl.nextSibling);
      (tAttrs.defaultStyle != 'false') && applyDefaultStyle(controlEl, acDiv);
      controlEl.style.display = 'none';
    } else { //for input and single select
      acDiv.style.display = 'none';
      controlEl.parentNode.insertBefore(acDiv, controlEl.nextSibling);
      (tAttrs.defaultStyle != 'false') && applyDefaultStyle(controlEl, acDiv);
      controlEl.addEventListener('click', function() {
        positionACDiv(controlEl, acDiv);
        acDiv.firstChild.focus();
      });
    }
  }; // compileFunc

  angular.module('angularjs-autocomplete',[]);
  angular.module('angularjs-autocomplete').
    directive('autoComplete', function() {
      return { compile: compileFunc };
    });
})();
