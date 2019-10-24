angular.module('KRRclass', [ 'chart.js']).controller('MainCtrl', ['$scope','$http', mainCtrl]);
var marker_list = [];

function mainCtrl($scope, $http, ChartJsProvider){
  $scope.runQuery = function(){
    $scope.queries = [];
    $scope.locations = [];

    //SPARQL queries
    if (document.getElementById("Restaurants").checked) {
      console.log("Adding Restaurants");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>PREFIX fp: <http://www.semanticweb.org/group69/finalproject/>select Distinct * where { ?context rdf:type fp:Restaurants .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}")
    } if (document.getElementById("Fastfood").checked) {
      console.log("Adding Fastfood");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:FastFoodRestaurant .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("FrenchRestaurants").checked) {
      console.log("Adding French Restaurants");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:FrenchRestaurant .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Bowling").checked) {
      console.log("Adding Bowling");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:Bowling .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Gyms").checked) {
      console.log("Adding Gyms");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:Gyms .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Musea").checked) {
      console.log("Adding Musea");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:Musea .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Art").checked) {
      console.log("Adding Art");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:ArtMusea .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("History").checked) {
      console.log("Adding History");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:HistoryMusea .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("EscapeRoom").checked) {
      console.log("Adding EscapeRoom");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:EscapeRooms .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Minigolf").checked) {
      console.log("Adding Minigolf");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:MiniGolf .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    } if (document.getElementById("Shopping").checked) {
      console.log("Adding Shopping");
      $scope.queries.push("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX fp: <http://www.semanticweb.org/group69/finalproject/> select Distinct * where { ?context rdf:type fp:Shopping .?context fp:hasLatitude ?lat .?context fp:hasLongitude ?lng .}");
    }

    var counter = 0;

    //Run all queries
    for (var query in $scope.queries) {
      $http( {
        method: "GET",
        url : 'http://localhost:7200/repositories/finalproject?name=&infer=true&sameAs=true&query=' + encodeURI($scope.queries[query]).replace(/#/g, '%23'),
        headers : {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
        } )
        .success(function(data, status ) {
          console.log("success!");
          $scope.result = data;
          console.log(data);
                    
          // iterating over results
          angular.forEach(data.results.bindings, function(val) {
            var list = [];
            list.push(val.lat.value);
            list.push(val.lng.value);
            list.push(val.context.value);
            
            $scope.locations.push(list);
          });

          counter += 1;
          console.log("counter: " + counter);
          console.log("queries: " + $scope.queries.length);

          //Check whether all queries have been completed
          if (counter == $scope.queries.length) {
            console.log("ready, result:");
            console.log($scope.locations);

            var infowindow = new google.maps.InfoWindow();
            var marker, i;

            //Remove existing markers
            for (var i = 0; i < marker_list.length; i++) {
              marker_list[i].setMap(null);
            }
            marker_list = [];
            
            bounds = new google.maps.LatLngBounds();

            //Add new markers
            for (i = 0; i < $scope.locations.length; i++) {  
              marker = new google.maps.Marker({
                position: new google.maps.LatLng($scope.locations[i][0], $scope.locations[i][1]),
                map: map
              });

              loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
              bounds.extend(loc);
              
              //Add infowindow to markers
              google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                  infowindow.setContent($scope.locations[i][2]);
                  infowindow.open(map, marker);
                }
              })(marker, i));
              marker_list.push(marker);
            }
            console.log(marker_list);
            
            //Set limit to autozoom
            google.maps.event.addListener(map, 'zoom_changed', function() {
              zoomChangeBoundsListener = google.maps.event.addListener(map, 'bounds_changed', function(event) {
                      if (this.getZoom() > 15 && this.initialZoom == true) {
                          this.setZoom(15);
                          this.initialZoom = false;
                      }
                  google.maps.event.removeListener(zoomChangeBoundsListener);
              });
            });
            
            map.initialZoom = true;
            map.fitBounds(bounds);            
          }
        })
        .error(function(error ){
            console.log('Error '+error);
        });  
    };
	};
};