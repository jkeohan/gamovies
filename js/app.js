var movieApp = angular.module('movieApp',[])

movieApp.controller('movieCtrl',['$scope','$http',function($scope,$http){
  //connect to firebase
  var fb = firebase.database();
  //grab a ref to the movies db object
  var moviesRef = fb.ref('movies');
  //remove all obj from movies db
  //moviesRef.on('value',function(movies){
  //   movies.forEach(function(movie){
  //     console.log(movie.key)
  //     var removeObj = fb.ref('movies/' + movie.key);
  //     removeObj.remove()
  //   })
  // })
  //url for movie site
  $scope.url = 'http://www.omdbapi.com/?s='
  //makes the api call 
  var makeApiCall = function(url){  
     $http.get(url)
      .then(function(response){
       response.data.Search.forEach(function(movie){
          if(movie.Poster == "N/A") {
            movie.Poster = "http://placehold.it/300x440"
          }
          movie.votes=0;
        })//forEach
        moviesRef.once("value",function(fbRef){
          exists(response.data.Search,fbRef)
          //$scope.$apply()
        }) 
      })
  }
  //determines if the movie exists in the database and if not
  //creates it.  If it does this will update the votes
  function exists(movies,fbRef) {
   var newArr=[];
   //loop through api call results
   movies.forEach(function(movie){
      var exist = false
      movie.votes;
      //loop through movies object
      fbRef.forEach(function(obj){
        item = obj.val()
        if(item.imdbID == movie.imdbID){
          movie.votes = item.votes
          movie.id = item.key
          //console.log(movie.votes,item.key)
          exist = true
        }
      })//fbRef
      //if it exists re
      if(exist){
        //add logic to update votes here (WIP) 
        exist = false
      }
      else { 
        //create a new entry in FB
        createFB(movie)
        exist = false
      }
      newArr.push(movie)
   })
   $scope.movieSources = newArr
   console.log(newArr)
   //adding $scope.$apply() here throws non terminating errors
   //without it the page loads empty
   $scope.$apply()
   return newArr
  }
  //make another api call based on user search input
  $scope.doSearch = function(input){
    var url = $scope.url + input
    makeApiCall(url)
    $('#search input').val("")
    $('.results').html(input)
  }
  //create a new entry in FB
  function createFB(obj){
    //console.log("inside createFB: ",obj)
      moviesRef.push({
        title: obj.Title,
        poster: obj.Poster,
        imdbID: obj.imdbID,
        votes: 0
      })
  }
  //listen for like click events
  $('body').on("click","#up",function(e) {
        var likes = $(this).parent().find(".likes")
        var val = parseInt($(likes).html())
        val++
        likes.html(val)
  })
  //listen for not-like click events
  $('body').on("click","#down",function(e) {
        var likes = $(this).parent().find(".likes")
        var val = parseInt($(likes).html())
        val--
        likes.html(val)
  })
  //loop through FB objects
  fb.ref('movies').on("value",function(fbRef){
    fbRef.forEach(function(obj){
      var item = obj.val()
      var votes = item.votes
      var id = item.key
    })
  })
  //update votes for existing FB entry 
  function updateMovie (id, votes) {
    console.log(id)
    // find message whose objectId is equal to the id we're searching with
    var movieRef= fb.ref('movies/' + id);
    //console.log(movieRef,votes)
    // update votes property
    movieRef.update({
      votes: votes
    })
  }

   // when an article is clicked, show the article summary and a link to the article source
    $scope.overlay = function(source) {
      $('#popUp').removeClass()
      $('#popUp').find('h1').html(source.Title)
      $('#popUp').find('.year').html(source.Year)
    }

    $scope.closePopUp = function(source) {
      $('#popUp').addClass("hidden")
    }
 
  //make initial api call to poplate page
  makeApiCall($scope.url + 'star wars')
}])



