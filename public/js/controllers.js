app.controller('AuthController', function($scope, $location, $firebaseAuth){
  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  $scope.register = function(){
    authObj.$createUser($scope.user).then(function(){
      $scope.login();
    })
  }

  $scope.login = function(){
    authObj.$authWithPassword($scope.user).then(function(){
      $location.path('/main');
    },function(){
      alert('Invalid email or password');
    })
  }



})

app.controller('PostsController',['$scope','$firebaseArray', '$firebaseAuth', '$location', '$sce', function($scope, $firebaseArray, $firebaseAuth, $location, $sce){

  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);
  //create reference
  var postsRef = new Firebase("https://keenlydone.firebaseio.com/posts");
  //use reference to create synchronized array
  $scope.posts = $firebaseArray(postsRef);

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }



  // $scope.posts.$loaded()
  // .then(function(){
  //   angular.forEach($scope.posts, function(post) {
  //     console.log(post);
  //     post.videoUrl = $sce.trustAsHtml(post.videoUrl);
  //   })
  // });

  $scope.newPost = {author: "", description: "", imageUrl: "", videoUrl: "", audioUrl: ""};

  $scope.addPost = function(){

    if($scope.newPost.audioUrl){
      var n = $scope.newPost.audioUrl.split('/')
      $scope.newPost.audioUrl = 'https://embed.spotify.com/?uri=spotify:track:' + n[n.length -1];
    }

    var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
    var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;

    if(pattern1.test($scope.newPost.videoUrl)){
      var replacement = 'https://player.vimeo.com/video/$1';
      $scope.newPost.videoUrl = $scope.newPost.videoUrl.replace(pattern1, replacement);
    }


    if(pattern2.test($scope.newPost.videoUrl)){
      var replacement = 'http://www.youtube.com/embed/$1';
      $scope.newPost.videoUrl = $scope.newPost.videoUrl.replace(pattern2, replacement);
    }

    var date = new Date();
    $scope.newPost.date = date.toString();






    $scope.posts.$add($scope.newPost).then(function(data){

    })

    $scope.newPost.title = "";
    $scope.newPost.author = "";
    $scope.newPost.description = "";
    $scope.newPost.imageUrl = "";
    $scope.newPost.videoUrl = "";
    $scope.newPost.audioUrl = "";
  }

  $scope.showPost = function(post){
    $scope.title = post.title;
    $scope.author = post.author;
    $scope.description = post.description;
    $scope.imageUrl = post.imageUrl;
    $scope.videoUrl = post.videoUrl;
    $scope.audioUrl = post.audioUrl;
    $scope.id = post.$id;
  }

  $scope.saveChanges = function(post,title,author,description,imageUrl,videoUrl,audioUrl){
    //var id = $scope.id;
    //var record = $scope.todos.$getRecord(id);
    console.log(post);
    console.log(title);
    console.log(author);
    console.log(description);
    console.log(imageUrl);
    console.log(videoUrl);
    console.log(audioUrl);

    post.title = title;
    post.author = author;
    post.description = description;
    post.imageUrl = imageUrl;
    post.videoUrl = videoUrl;
    post.audioUrl = audioUrl;
    console.log(post);

    $scope.posts.$save(post);
  }

  $scope.removePost = function(post){
    $scope.posts.$remove(post);
  }




  $scope.logout = function(){
    authObj.$unauth();
    $location.path('/');
  }
}]);
