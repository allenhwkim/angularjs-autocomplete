(function(){
  'use strict';
  var $compile, $parse;

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // accepted attributes
  var autoCompleteAttrs = [
    'placeholder',
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
    acDiv.style.top = 0;
    acDiv.style.left = 0;
    acDiv.style.display = 'none';
    return acDiv;
  };

  var linkFunc = function(scope, element, attrs)  {
    element[0].style.position = 'relative';

    var controlEl = element[0].querySelector('input, select');

    attrs.valueProperty = attrs.valueProperty || 'id';
    attrs.displayProperty = attrs.displayProperty || 'value';
    attrs.ngModel = controlEl.getAttribute('ng-model');

    if (controlEl.tagName == 'SELECT') {
      var controlBCR = controlEl.getBoundingClientRect();
      var placeholderEl = document.createElement('div');
      placeholderEl.className = 'select-placeholder';
      placeholderEl.style.lineHeight = controlBCR.height + 'px';
      controlEl.placeholderEl = placeholderEl;
      element[0].appendChild(placeholderEl);
      // if ngModel value is undefined, show text with placeholder
      if ($parse(attrs.ngModel)(scope) === undefined) { 
        placeholderEl.innerHTML = attrs.placeholder;
      } 
      // if noModel has value, observe initSelectText and set text
      else {
        attrs.$observe('initSelectText', function(val) {
          val && (placeholderEl.innerHTML = val);
        });
      }
    }

    // 1. build <auto-complete-div>
    var acDiv = buildACDiv(controlEl, attrs);
    element[0].appendChild(acDiv);

    // 2. respond to click by hiding option tags
    controlEl.addEventListener('mouseover', function() {
      for (var i=0; i<controlEl.children.length; i++) {
        controlEl.children[i].style.display = 'none';
      }
    });
    controlEl.addEventListener('mouseout', function() {
      for (var i=0; i<controlEl.children.length; i++) {
        controlEl.children[i].style.display = '';
      }
    });
    controlEl.addEventListener('click', function() {
      if (!controlEl.disabled) {
        acDiv.style.display = 'block';
        var controlBCR = controlEl.getBoundingClientRect();
        var acDivInput = acDiv.querySelector('input');
        acDiv.style.width = controlBCR.width + 'px';
        acDivInput.style.width = (controlBCR.width - 30) + 'px';
        acDivInput.style.height = controlBCR.height + 'px';
        acDivInput.focus();
      }
    });

    $compile(element.contents())(scope);

  }; // linkFunc

  angular.module('angularjs-autocomplete',[]);
  angular.module('angularjs-autocomplete').
    directive('autoComplete', function(_$compile_, _$parse_) {
      $compile = _$compile_, $parse = _$parse_;
      return { 
        link: linkFunc };
    });
})();
