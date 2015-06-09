AngularJS Autocomplete
======================
autocomplete for INPUT and SELECT tag for single/multi, local/remote



Features
--------

  * We can simply just set autocomplete feature to INPUT and SELECT tag
  * It does not require more tags such as &lt;ui-select-match>, &lt;ui-select-choices>, or &lt;autocomplete>
  * It treat SELECT element as select element, and INPUT element as INPUT element

Examples
----------
<table>
<tr>
 <td>
  <a href="http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.single.html">
   <img style="box-shadow:0 0 5px #000" src="http://imgur.com/pNye3wo.png" />
  </a>
 <td>
  Auto Complete INPUT tag
  <pre>
   &lt;div auto-complete  source="source">
     &lt;input ng-model="foo" placeholder="Select">
   &lt;/div>
  </pre>
 </td>
</tr>
<tr>
 <td>
  <a href="http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.single.html">
   <img style="box-shadow:0 0 5px #000" src="http://i.imgur.com/B30s4vN.png" />
  </a>
 <td>
  Auto Complete SELECT tag
  <pre>
   &lt;div auto-complete source="source" 
     placeholder="Select Bar">
     &lt;select ng-model="bar">&lt;/select>
   &lt;/div>
  </pre>
 </td>
</tr>
<tr>
 <td>
  <a href="http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.remote.html">
   <img style="box-shadow:0 0 5px #000" src="http://i.imgur.com/eYiaGAJ.png" />
  </a>
 <td>
  Google Address Complete Example
  <pre>
   &lt;div auto-complete source="source" 
     path-to-data="results" min-chars="2"
     display-property="formatted_address" 
     placeholder="Enter Address">
     &lt;input id="ip" ng-model="addressText" name="addressText">
   &lt;/div>
  </pre>
 </td>
</tr>
<tr>
 <td>
  <a href="http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.multi.html">
   <img style="box-shadow:0 0 5px #000" src="http://i.imgur.com/5rwjTaG.png" />
  </a>
 <td>
  Multiple Autocomplete
  <pre>
   &lt;div auto-complete-multi 
     placeholder="Select One" source="source"> 
     &lt;select ng-model="foo">&lt;/select>
   &lt;/div>
  </pre>
 </td>
</tr>
<tr>
 <td>
  <a href="http://rawgit.com/allenhwkim/angularjs-autocomplete/master/test/autocomplete.multi.custom.html">
   <img style="box-shadow:0 0 5px #000" src="http://i.imgur.com/Iq3RbcR.png" />
  </a>
 <td>
  Custom Multi-Autocomplete
  <pre>
   &lt;div>
    &lt;span ng-repeat="obj in foo5 track by $index">
      {{'('+obj.key+') '+obj.text}})
      &lt;a href="" ng-click="foo5.splice($index, 1)">x&lt;/a>
    &lt;/span>
    &lt;auto-complete-div multiple ng-model="foo5"
      default-style="false"  source="source3">
      &lt;input size="2" />
      &lt;ul>&lt;/ul>
    &lt;/auto-complete-div>
  &lt;/div>
  </pre>
 </td>
</tr>
</table>

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
