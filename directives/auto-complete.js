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

  var getStyle = function(el,styleProp) {
    return document.defaultView.
      getComputedStyle(el,null).
      getPropertyValue(styleProp);
  };

  var positionACDiv = function(controlEl, containerEl) {
    var controlBCR = controlEl.getBoundingClientRect();

    angular.extend(containerEl.style, {
      display: 'block',
      position: 'absolute',
      top: (window.scrollY + controlBCR.top) + 'px',
      left: (window.scrollX + controlBCR.left) + 'px',
      width : controlBCR.width + 'px'
    });
  };

  var buildACDiv = function(controlEl, containerEl) {
    var controlBCR = controlEl.getBoundingClientRect();

    var inputEl = document.createElement('input');
    containerEl.appendChild(inputEl);
    inputEl.style.height = (controlBCR.height - 6) + 'px';
    inputEl.style.outline = 'none';
    inputEl.style.border = '0';
    inputEl.style.padding = '0';
    inputEl.style.margin = '2px 0 0 3px';
    inputEl.style.backgroundColor = getStyle(inputEl, 'background-color');
    // for single select
    inputEl.style.width = (controlBCR.width - 28) + 'px';
    // for multi select
    //inputEl.setAttribute('size', 1);
    //inputEl.addEventListener('keydown', function(){
    //  this.setAttribute('size', this.value.length+1);
    //});

    var selectEl = document.createElement('select');
    containerEl.appendChild(selectEl);
    if (controlEl.getAttribute('default-style') !== 'false') {
      angular.extend(selectEl.style, {
        marginTop: '2px',
        display:'none', width: '100%', 'overflow-y': 'auto'
      });
    }
  };

  var compileFunc = function(tElement, tAttrs)  {

    // 1. add more attributes for <select> tag
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

    // 2. build <auto-complete-div>
    var acDiv = document.createElement('auto-complete-div');
    acDiv.style.display = 'none';
    buildACDiv(tElement[0], acDiv);
    autoCompleteAttrs.map(function(attr) {
      if (tAttrs[attr]) {
        acDiv.setAttribute(dasherize(attr), tAttrs[attr]);
      }
    });
    tElement[0].parentNode.insertBefore(acDiv, tElement[0].nextSibling);
    tElement[0].addEventListener('click', function() {
      if (!tElement[0].disabled) {
        positionACDiv(tElement[0], acDiv);
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
