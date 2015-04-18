(function(){
  'use strict';

  var autoCompleteAttrs = [
    'ngModel', 'source', 'selectTo', 'valueChanged',
    'defaultStyle', 'valueProperty', 'displayProperty'
  ];

  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  var styleAutoCompleteDiv = function(controlEl, containerEl) {
    var controlBCR = controlEl.getBoundingClientRect();

    angular.extend(containerEl.style, {
      display: 'block',
      position: 'absolute',
      top: (window.scrollY + controlBCR.top) + 'px',
      left: (window.scrollX + controlBCR.left) + 'px',
      width : controlBCR.width + 'px'
    });

    var inputEl = containerEl.querySelector('input');
    inputEl.style.height = controlBCR.height + 'px';
  };

  var compileFunc = function(tElement, tAttrs)  {
    var acDiv;

    if (tElement[0].tagName == "SELECT") {
      if (!tAttrs.selectTo) {
        tAttrs.selectTo = 'obj'+Math.floor(Math.random()*100);
      }
      if (!tAttrs.ngOptions) {
        tAttrs.valueProperty = tAttrs.valueProperty || 'id';
        tAttrs.displayProperty = tAttrs.displayProperty || 'value';
        tAttrs.ngOptions = 
          "''+obj['"+tAttrs.valueProperty+"'] as " +
          "obj['"+tAttrs.displayProperty+"'] for " + 
          "obj in ["+tAttrs.selectTo+"]";
      }
    }

    acDiv = document.createElement('auto-complete-div');
    acDiv.style.display = 'none';
    autoCompleteAttrs.map(function(attr) {
      if (tAttrs[attr]) {
        acDiv.setAttribute(dasherize(attr), tAttrs[attr]);
      }
    });

    /** add autoCompleteDiv right next to input/select tag */
    tElement[0].parentNode.insertBefore(acDiv, tElement[0].nextSibling);

    tElement[0].addEventListener('click', function() {
      if (!tElement[0].disabled) {
        styleAutoCompleteDiv(tElement[0], acDiv);
        acDiv.firstChild.focus();
      }
    });
  }; // compileFunc

  var autoComplete = function() {
    return {
      compile: compileFunc 
    };
  };

  angular.module('angular-autocomplete',[]);
  angular.module('angular-autocomplete').directive('autoComplete', autoComplete);
})();
