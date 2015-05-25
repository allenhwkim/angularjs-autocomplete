AngularJS Autocomplete
======================
single or multi autocomplete for INPUT and SELECT tag by static or remote source 


![Imgur](http://i.imgur.com/Fj0avbY.png?1)
![Imgur](http://i.imgur.com/46crVoI.png?1)
![Imgur](http://i.imgur.com/1BhGlVn.png)
![Imgur](http://i.imgur.com/xFxsgUY.png)

Features
--------

  * We can simply just set autocomplete feature to INPUT and SELECT tag
  * It does not require more tags such as &lt;ui-select-match>, &lt;ui-select-choices>, or &lt;autocomplete>
  * It treat SELECT element as select element, and INPUT element as INPUT element

Examples
--------

  * [Single Select](http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.single.html)
  * [Multi Select](http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.multi.html)
  * [Custom Design](http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.multi.custom.html)
  * [Google Address Complete](http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.remote.html)


To Get Started
--------------

For Bower users, 

  `$ bower install angularjs-autocomplete`

1. Include `angularjs-autocomplete.min.js`  
    `<script src="http://rawgit.com/allenhwkim/angularjs-autocomplete.min.js"></script>`

2. add it as a dependency  
    `var myApp = angular.module('myApp', ['angularjs-autocomplete']);`

3. Use it  

    `$scope.listOfChoices = ['this', 'is', 'list', 'of', 'choices];`

    `<input auto-complete source="listOfChoices">`


Attributes
--------

  * **source**(required) : scope variable or function which is identified as a source of autocomplete
    It coule be array, url, or a function

    * array example: 
      *  ["this", "is", "array", "of", "text"]
      * [{id:1, value:'One'}, {id:2, value:'Two'}, {id:3, value:'Three'}, {id:4, value:'Four'}]

    * url example
      * e.g., "http://maps.googleapis.com/maps/api/geocode/json?address=:keyword"

    * function example
      *
          function(param) { 
            return $http.get("http://maps.googleapis.com/maps/api/geocode/json?address="+param.keyword);
          }
      * `$resource("http://maps.googleapis.com/maps/api/geocode/json?address=:keyword", {keyword:'@keyword'}).get`

  * **ng-model**(optional) : ng-model for INPUT or SELECT element  
  * **value-Changed**(optional) : callback function when value is changed. Takes an argument as selected value.  In example,  

        $scope.callback = function(arg) {
          $scope.selected = arg;
        };

  * **default-style**(optional) : true as default. For your own styling, set `default-style="false"` and provide your own css.  
    The example of customized css style is found at [custom multiple select](https://rawgit.com/allenhwkim/angularjs-autocomplete/master/autocomplete.multi.custom.html).   
    You can also find [default-style](https://rawgit.com/allenhwkim/angularjs-autocomplete/master/default-style.css) for starting point.

  * **value-property**(optional): "id" as default. When you define an array of hashes as source, the key of hash for ng-model value.  
    e.g., 'key'
  * **display-property**(optional) : "value" as default. When you define an array of hashes as source, the key of hash for display.  
    e.g., 'text'
  * **min-chars**(optional): 0 as default, if defined, autocomplete won't show any until length of input is greater than minimum charaters.  


License
=======

  [MIT License](https://github.com/allenhwkim/angularjs-autocomplete/blob/master/LICENSE)
