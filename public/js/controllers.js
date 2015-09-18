app.controller('AuthController', function($scope, $location, $firebaseAuth, $firebaseArray){
  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  var usernamesRef = new Firebase("https://keenlydone.firebaseio.com/usernames");
  //use reference to create synchronized array
  $scope.usernames = $firebaseArray(usernamesRef);


  $scope.register = function(){
    $scope.accountUsername.emailRef = $scope.user.email;
    $scope.usernames.$add($scope.accountUsername).then(function(data){
    })
    authObj.$createUser($scope.user).then(function(){
      $scope.registerError = false;
      $scope.login();
    }, function(){
      $scope.registerError = true;
    })

  }



  $scope.login = function(){
    authObj.$authWithPassword($scope.user).then(function(user){
      $scope.loginError = false;
      $location.path('/main');
    },function(){
      $scope.loginError = true;
    })
  }




})

app.controller('PostsController',['$scope','$firebaseArray', '$firebaseAuth', '$location', '$sce', function($scope, $firebaseArray, $firebaseAuth, $location, $sce){


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

  var usernamesRef = new Firebase("https://keenlydone.firebaseio.com/usernames");
  $scope.usernames = $firebaseArray(usernamesRef);

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



    var authData = authObj.$getAuth();

    if (authData) {
      for (var i = 0; i < $scope.usernames.length; i++) {
        if(authData.password.email === $scope.usernames[i].emailRef)
        $scope.newPost.author = $scope.usernames[i].username;
      }
    } else {
      console.log("Logged out");
    }


    $scope.posts.$add($scope.newPost).then(function(data){
    })


    $scope.newPost.title = "";
    // $scope.newPost.author = "";
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


    var authData = authObj.$getAuth();

    if (authData) {
      for (var i = 0; i < $scope.usernames.length; i++) {
        if(authData.password.email === $scope.usernames[i].emailRef)
        commentObj.commentAuthor = $scope.usernames[i].username;
      }
    } else {
      console.log("Logged out");
    }

    // commentObj.commentAuthor = commentAuthor;
    commentObj.commentInput = commentInput;
    post.comments.push(commentObj);

    $scope.posts.$save(post);
    $scope.commentAuthor = "";
    $scope.commentInput = "";
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

app.controller('ChatController',['$scope','$firebaseArray', '$firebaseAuth', '$location', '$sce','$anchorScroll',

function($scope, $firebaseArray, $firebaseAuth, $location, $sce, $anchorScroll){

  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  var messagesRef = new Firebase("https://keenlydone.firebaseio.com/messages");
  //use reference to create synchronized array
  $scope.messages = $firebaseArray(messagesRef);

  var usernamesRef = new Firebase("https://keenlydone.firebaseio.com/usernames");
  $scope.usernames = $firebaseArray(usernamesRef);

  $scope.addMessage = function(){
    $scope.glued = true;
    $scope.newMessage.date = Date.now();
    var authData = authObj.$getAuth();

    if (authData) {
      for (var i = 0; i < $scope.usernames.length; i++) {
        if(authData.password.email === $scope.usernames[i].emailRef)
        $scope.newMessage.chatAuthor = $scope.usernames[i].username;
      }
    } else {
      console.log("Logged out");
    }
    $scope.messages.$add($scope.newMessage).then(function(data){

    })

    $scope.newMessage.chatMessage = "";
  }
}]);
