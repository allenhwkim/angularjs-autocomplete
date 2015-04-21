(function(){
  'use strict';

  var defaultStyle = 
    'auto-complete-div.default-style input {'+
    '  outline: none; '+
    '  border: 0;'+
    '  padding: 0;'+
    '  margin: 2px 0 0 3px;'+
    '  background-color: #fff'+
    '}' + 

    'auto-complete-div.default-style select {'+
    '  margin-top: 2px;'+
    '  display : none;'+
    '  width : 100%;'+
    '  overflow-y: auto'+
    '}' + 

    'div .auto-complete-repeat {'+
    '  display: inline-block;'+
    '  padding: 3px; '+
    '  background : #fff;'+
    '  margin: 3px;' +
    '  border: 1px solid #ccc;' +
    '  border-radius: 5px;' +
    '}' +

    'div .auto-complete-repeat .delete {'+
    '  margin: 0 3px;' +
    '  text-decoration: none;' +
    '  color: red;' +
    '}' +

    'auto-complete-div[multiple].default-style {'+
    '  position: relative;' +
    '}' +

    'auto-complete-div[multiple].default-style input {'+
    '  background-color: transparent;'+
    '  border: none;' +
    '  border-radius: 0;' +
    '}' +

    'auto-complete-div[multiple].default-style select {'+
    '  position: absolute;'+
    '  top: 1.5em;'+
    '  left: 0;'+
    '  width: auto;' +
    '  min-width: 10em;'+
    '}' +
    '';

  // return dasherized from  underscored/camelcased string
  var dasherize = function(string) {
    return string.replace(/_/g, '-').
      replace(/([a-z])([A-Z])/g, function(_,$1, $2) {
        return $1+'-'+$2.toLowerCase();
      });
  };

  // get style string of an element
  var getStyle = function(el,styleProp) {
    return document.defaultView.
      getComputedStyle(el,null).
      getPropertyValue(styleProp);
  };

  var injectDefaultStyleToHead = function() {
    if (!document.querySelector('style#auto-complete-style')) {
      var htmlDiv = document.createElement('div');
      htmlDiv.innerHTML = '<b>1</b>'+ 
        '<style id="auto-complete-style">' +
        defaultStyle +
        '</style>';
      document.getElementsByTagName('head')[0].
        appendChild(htmlDiv.childNodes[1]);
    }
  };

  angular.module('angular-autocomplete').
    factory('AutoComplete', function() {
      return {
        defaultStyle: defaultStyle,
        dasherize: dasherize,
        getStyle: getStyle,
        injectDefaultStyle: injectDefaultStyleToHead
      };
    });
})();
