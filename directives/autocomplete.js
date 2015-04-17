(function(){
  'use strict';
  var $compile;
  var template =
    '<autocomplete-div style="display:block"></autocomplete-div>';

  var autocompleteAttrs = [
    'ng-model', 
    'autocomplete-source',
    'autocomplete-selected',
    'autocomplete-value-changed',
    'autocomplete-default-style',
    'autocomplete-value-property',
    'autocomplete-display-property'];

  var styleAutocompleteDiv = function(controlEl, containerEl) {
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
    autocompleteAttrs.map(function(attr) {
      var attrName = attr.replace(/autocomplete-/,'');
      var camelCasedAttr = attr.replace(/-([a-z])/g, 
          function(_,$1) {return $1.toUpperCase();}); 
      if (attrs[camelCasedAttr]) {
        acAttrs += ' '+attrName+'="'+attrs[camelCasedAttr]+'"';
      }
    });
    __template = __template.replace('><', acAttrs+'><');
    var autocompleteDiv = $compile(__template)(scope)[0];
    autocompleteDiv.style.display = 'none';

    /** add autocompleteDiv right next to input/select tag */
    element[0].parentNode.insertBefore(autocompleteDiv,
      element[0].nextSibling);

    /** let autocompleteDiv can access controlEl. i.e. when select value */
    autocompleteDiv.controlEl = element[0];

    /** when clicked, show autocomplete and focus to input box */
    element[0].addEventListener('click', function() {
      styleAutocompleteDiv(element[0], autocompleteDiv);
      autocompleteDiv.firstChild.focus();
    });

  };

  var autocomplete = function(_$compile_) {
    $compile = _$compile_;
    return {
      link: linkFunc 
    };
  };

  angular.module('angular-autocomplete').directive('autocomplete', autocomplete);
})();
