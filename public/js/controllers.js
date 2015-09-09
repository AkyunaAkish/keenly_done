app.controller('AuthController', function($scope, $location, $firebaseAuth){
  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  $scope.register = function(){
    authObj.$createUser($scope.user).then(function(){
      $scope.registerError = false;
      $scope.login();
    }, function(){
      $scope.registerError = true;
    })
  }

  // $scope.register = function(){
  //   authRef.createUser({
  //   email    : $scope.user.email,
  //   password : $scope.user.password,
  //   username: $scope.user.username
  // }, function(error, userData) {
  //   if (error) {
  //     console.log("Error creating user:", error);
  //   } else {
  //     console.log(userData);
  //     // save the user's profile into the database so we can list users,
  //     // use them in Security and Firebase Rules, and show profiles
  //     authRef.child("users").child(userData.uid).set({
  //       // provider: userData.provider,
  //       name: $scope.user.username
  //     });
  //     $scope.login();
  //   }
  // });
  // }

  // $scope.register = function(){
  //   var q = authRef.child('users').orderByChild('username').equalTo($scope.user.username);
  //   q.once('value', function(snapshot) {
  //     if (snapshot.val() === null) {
  //       // username does not yet exist, go ahead and add new user
  //       authObj.$createUser($scope.user).then(function(){
  //           $scope.login();
  //         })
  //     } else {
  //       // username already exists, ask user for a different name
  //       alert('Username taken');
  //     }
  //   });
  // }


  $scope.login = function(){
    authObj.$authWithPassword($scope.user).then(function(){
      $scope.loginError = false;
      $location.path('/main');

    },function(){
      $scope.loginError = true;
    })
  }




})

app.controller('PostsController',['$scope','$firebaseArray', '$firebaseAuth', '$location', '$sce', function($scope, $firebaseArray, $firebaseAuth, $location, $sce){
  $scope.loggedUser = {};

  function authDataCallback(authData) {
    if (authData) {
      $scope.loggedUser = authData;
    } else {
      console.log("User is logged out");
    }
  }


  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);
  //create reference
  var postsRef = new Firebase("https://keenlydone.firebaseio.com/posts");
  //use reference to create synchronized array
  $scope.posts = $firebaseArray(postsRef);

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  authRef.onAuth(authDataCallback);

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
    // if($scope.newPost.description){
    //   var urlRegex = /(https?:\/\/[^\s]+)/g;
    //   var n = $scope.newPost.description.replace(urlRegex, $sce.trustAsHtml('<a href="$1" target="_blank">$1</a>'));
    //   $scope.newPost.description = n;
    // }

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

    var date = Date.now();

    $scope.newPost.date = date;






    $scope.posts.$add($scope.newPost).then(function(data){

    })

    $scope.newPost.title = "";
    $scope.newPost.author = "";
    $scope.newPost.description = "";
    $scope.newPost.imageUrl = "";
    $scope.newPost.videoUrl = "";
    $scope.newPost.audioUrl = "";
  }

  // $scope.showPost = function(post){
  //   $scope.title = post.title;
  //   $scope.author = post.author;
  //   $scope.description = post.description;
  //   $scope.imageUrl = post.imageUrl;
  //   $scope.videoUrl = post.videoUrl;
  //   $scope.audioUrl = post.audioUrl;
  //   $scope.id = post.$id;
  // }
  //
  // $scope.saveChanges = function(post,title,author,description,imageUrl,videoUrl,audioUrl){
  //   //var id = $scope.id;
  //   //var record = $scope.todos.$getRecord(id);
  //   console.log(post);
  //   console.log(title);
  //   console.log(author);
  //   console.log(description);
  //   console.log(imageUrl);
  //   console.log(videoUrl);
  //   console.log(audioUrl);
  //
  //   post.title = title;
  //   post.author = author;
  //   post.description = description;
  //   post.imageUrl = imageUrl;
  //   post.videoUrl = videoUrl;
  //   post.audioUrl = audioUrl;
  //   console.log(post);
  //
  //   $scope.posts.$save(post);
  // }

  $scope.removePost = function(post){
    $scope.posts.$remove(post);
  }




  $scope.logout = function(){
    authObj.$unauth();
    $location.path('/');
  }



  $scope.addComment = function(post, commentAuthor, commentInput){

    if(post.comments === undefined){
      post.comments = [];
    }
    var commentObj = {};
    commentObj.commentAuthor = commentAuthor;
    commentObj.commentInput = commentInput;
    post.comments.push(commentObj);

    $scope.posts.$save(post);
  }

  $scope.like = function(post){
    if(post.likes === undefined){
      post.likes = [];
    }

    var thing = $scope.loggedUser.uid;
    if(post.likes.length == 0){
      post.likes.push(thing);
      $scope.posts.$save(post)
    }else{
      if(post.likes.indexOf(thing) > -1){
        var like = post.likes.indexOf(thing);
        post.likes.splice(like,1);
        $scope.posts.$save(post);
      }else{
        post.likes.push(thing);
        $scope.posts.$save(post)
      }

    }

  }
}]);
