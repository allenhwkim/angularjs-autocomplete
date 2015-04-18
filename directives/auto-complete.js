(function(){
  'use strict';
  var $compile;
  var template =
    '<auto-complete-div style="display:block"></auto-complete-div>';

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
    if (tElement[0].tagName == "SELECT") {
      if (!tAttrs.selectTo) {
        tAttrs.selectTo = 'obj'+Math.floor(Math.random()*100);
      }
      if (!tAttrs.ngOptions) {
        var valueProp = tAttrs.valueProperty || 'id';
        var displayProp = tAttrs.displayProperty || 'value';
        tAttrs.ngOptions = 
          "''+obj['"+valueProp+"'] as " +
          "obj['"+displayProp+"'] for " + 
          "obj in ["+tAttrs.selectTo+"]";
      }
    }

    return {
      pre: function() {},
      post:  function(scope, element, attrs) {
        var __template = template, acDivAttrs="";

        /** build autoCompleteDiv attributes and compile it */
        autoCompleteAttrs.map(function(attr) {
          if (attrs[attr]) {
            acDivAttrs += ' '+dasherize(attr)+'="'+attrs[attr]+'"';
          }
        });
        __template = __template.replace('><', acDivAttrs+'><');
        var autoCompleteDiv = $compile(__template)(scope)[0];
        autoCompleteDiv.style.display = 'none';

        /** add autoCompleteDiv right next to input/select tag */
        element[0].parentNode.insertBefore(autoCompleteDiv,
          element[0].nextSibling);

        /** when clicked, show autoComplete and focus to input box */
        element[0].addEventListener('click', function() {
          if (!element[0].disabled) {
            styleAutoCompleteDiv(element[0], autoCompleteDiv);
            autoCompleteDiv.firstChild.focus();
          }
        });
      } // post
    };
  }; // compileFunc

  var autoComplete = function(_$compile_) {
    $compile = _$compile_;
    return {
      compile: compileFunc 
    };
  };

  angular.module('angular-autocomplete',[]);
  angular.module('angular-autocomplete').directive('autoComplete', autoComplete);
})();
