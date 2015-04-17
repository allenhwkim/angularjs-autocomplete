(function(){
  'use strict';
  var $compile;
  var template =
    '<auto-complete-div style="display:block"></auto-complete-div>';

  var autoCompleteAttrs = [
    'ng-model', 
    'ac-source',
    'ac-selected',
    'ac-value-changed',
    'ac-default-style',
    'ac-value-property',
    'ac-display-property'];

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

  var linkFunc = function(scope, element, attrs) {
    var __template = template, acAttrs="";

    /** build autocompleteDiv attributes and compile it */
    autoCompleteAttrs.map(function(attr) {
      var attrName = attr.replace(/ac-/,'');
      var camelCasedAttr = attr.replace(/-([a-z])/g, 
          function(_,$1) {return $1.toUpperCase();}); 
      if (attrs[camelCasedAttr]) {
        acAttrs += ' '+attrName+'="'+attrs[camelCasedAttr]+'"';
      }
    });
    __template = __template.replace('><', acAttrs+'><');
    var autoCompleteDiv = $compile(__template)(scope)[0];
    autoCompleteDiv.style.display = 'none';

    /** add autoCompleteDiv right next to input/select tag */
    element[0].parentNode.insertBefore(autoCompleteDiv,
      element[0].nextSibling);

    /** let autoCompleteDiv can access controlEl. i.e. when select value */
    autoCompleteDiv.controlEl = element[0];

    /** when clicked, show autoComplete and focus to input box */
    element[0].addEventListener('click', function() {
      styleAutoCompleteDiv(element[0], autoCompleteDiv);
      autoCompleteDiv.firstChild.focus();
    });

  };

  var autoComplete = function(_$compile_) {
    $compile = _$compile_;
    return {
      link: linkFunc 
    };
  };

  angular.module('angular-autocomplete',[]);
  angular.module('angular-autocomplete').directive('autoComplete', autoComplete);
})();
