app.controller('AuthController', function($scope, $location, $firebaseAuth, $firebaseArray, $q){
  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  var usernamesRef = new Firebase("https://keenlydone.firebaseio.com/usernames");
  $scope.usernames = $firebaseArray(usernamesRef);


  $scope.register = function(){
    $scope.registerUsernameError = false;


    if($scope.usernames.length === 0){
      $scope.user.email = $scope.user.email.toLowerCase();
      $scope.accountUsername.emailRef = $scope.user.email;
      $scope.accountUsername.username = $scope.accountUsername.username.toLowerCase();
      $scope.usernames.$add($scope.accountUsername).then(function(data){
      })
      authObj.$createUser($scope.user).then(function(){
        $scope.registerError = false;
        $scope.login();
      }, function(){
        $scope.registerUsernameError = true;
      })
    }
    else{
      var promise = new Promise(function(resolve, reject) {

        for (var i = 0; i < $scope.usernames.length; i++) {
          if($scope.usernames[i].username === $scope.accountUsername.username && $scope.usernames[i].emailRef === $scope.user.email ||  $scope.usernames[i].emailRef === $scope.user.email || $scope.usernames[i].username === $scope.accountUsername.username){
            var hasAMatch = true;
            break;
          }
        }
        if (!hasAMatch) {
          resolve("");
        }
        else {
          $scope.registerUsernameError = true;
          reject(Error(""));
        }
      });

      promise.then(function(result) {
        $scope.user.email = $scope.user.email.toLowerCase();
        $scope.accountUsername.emailRef = $scope.user.email;
        $scope.accountUsername.username = $scope.accountUsername.username.toLowerCase();
        $scope.usernames.$add($scope.accountUsername).then(function(data){
        })

        authObj.$createUser($scope.user).then(function(){
          $scope.registerError = false;
          $scope.login();
        }, function(){
          $scope.registerUsernameError = true;
        })
        console.log('Result',result);
      }, function(err) {
        console.log('Error',err);
      });



    }

    // $scope.accountUsername.emailRef = $scope.user.email;
    // $scope.usernames.$add($scope.accountUsername).then(function(data){
    // })
    // authObj.$createUser($scope.user).then(function(){
    //   $scope.registerError = false;
    //   $scope.login();
    // }, function(){
    //   $scope.registerError = true;
    // })
    //
    // }


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
  var postsRef = new Firebase("https://keenlydone.firebaseio.com/posts");
  $scope.posts = $firebaseArray(postsRef);

  var usernamesRef = new Firebase("https://keenlydone.firebaseio.com/usernames");
  $scope.usernames = $firebaseArray(usernamesRef);

  var authData = authObj.$getAuth();
  $scope.currentUserEmail = authData.password.email;
  console.log(authData);
  // if (authData) {
  //   console.log('in if');
  //   console.log('usernames', $scope.usernames);
  //   for (var i = 0; i < $scope.usernames.length; i++) {
  //     console.log('in for loop');
  //     console.log($scope.usernames[i]);
  //     if(authData.password.email === $scope.usernames[i].emailRef)
  //     $scope.currentUserEmail = $scope.usernames[i].username;
  //   }
  // } else {
  //   console.log("Logged out");
  // }
  $scope.addPostError = false;

  $scope.trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }

  authRef.onAuth(authDataCallback);

  $scope.newPost = {author: "", description: "", imageUrl: "", videoUrl: "", audioUrl: ""};

  $scope.addPost = function(){

    // if($scope.newPost.description){
    //   console.log('Description',$scope.newPost.description);
    //
    //   function linkify(inputText) {
    //     var replacedText, replacePattern1, replacePattern2, replacePattern3;
    //
    //     //URLs starting with http://, https://, or ftp://
    //     replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    //     replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
    //
    //     //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    //     replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    //     replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
    //
    //     //Change email addresses to mailto:: links.
    //     replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    //     replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    //
    //     return replacedText;
    //   }
    //   $scope.newPost.description = linkify($scope.newPost.description);
    //
    // }


    if ($scope.newPost.audioUrl === "" && $scope.newPost.videoUrl === "" && $scope.newPost.description === "" && $scope.newPost.imageUrl === "" || $scope.newPost.audioUrl === null && $scope.newPost.videoUrl === null && $scope.newPost.description === null && $scope.newPost.imageUrl === null|| !$scope.newPost.audioUrl && !$scope.newPost.videoUrl && !$scope.newPost.description && !$scope.newPost.imageUrl) {
      $scope.addPostError = true;
      $scope.showHideForm = true;
      $scope.addPostButton = false;
      $scope.showPostForm = true;
      $scope.newPost.audioUrl = "";
      $scope.newPost.videoUrl = "";
      $scope.newPost.description = "";
      $scope.newPost.imageUrl = "";
    }
    else{
      if($scope.newPost.audioUrl){
        var n = $scope.newPost.audioUrl.split('/')
        $scope.newPost.audioUrl = 'https://embed.spotify.com/?uri=spotify:track:' + n[n.length -1];
      }

      if($scope.newPost.videoUrl){
        var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
        var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
        var splitUrl = $scope.newPost.videoUrl.split('/');

        if(splitUrl[3] === "embed"){
          console.log('already embedded');
          $scope.newPost.videoUrl = $scope.newPost.videoUrl;
        }else{
          console.log('embedding Url');
          if(pattern1.test($scope.newPost.videoUrl)){
            var replacement = 'https://player.vimeo.com/video/$1';
            $scope.newPost.videoUrl = $scope.newPost.videoUrl.replace(pattern1, replacement);
          }


          if(pattern2.test($scope.newPost.videoUrl)){
            var replacement = 'http://www.youtube.com/embed/$1';
            $scope.newPost.videoUrl = $scope.newPost.videoUrl.replace(pattern2, replacement);
          }
        }
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
      $scope.newPost.emailReference = authData.password.email;

      $scope.posts.$add($scope.newPost).then(function(data){
        $scope.showPostForm = false;
        $scope.showHideForm = false;
        $scope.addPostButton = true;
      })

    }
    $scope.newPost.audioUrl = "";
    $scope.newPost.videoUrl = "";
    $scope.newPost.description = "";
    $scope.newPost.imageUrl = "";
  }



  // $scope.showPost = function(post){
  //   $scope.editPostEmptyError = false;
  //   $scope.editPostError = false;
  //   $scope.text = post.description;
  //   $scope.imageGifUrl = post.imageUrl;
  //   $scope.ytVmUrl = post.videoUrl;
  //   $scope.spotUrl = post.audioUrl;
  // }
  // $scope.cancelEditPost = function(post){
  //   $scope.editPostEmptyError = false;
  //   $scope.editPostError = false;
  //   $scope.text = post.description;
  //   $scope.imageGifUrl = post.imageUrl;
  //   $scope.ytVmUrl = post.videoUrl;
  //   $scope.spotUrl = post.audioUrl;
  //   $scope.activeItem = null;
  // }
  //
  // $scope.setActive=function(item) {
  //   if($scope.activeItem){
  //     $scope.activeItem = null;
  //   }
  //   else{
  //     $scope.activeItem=item;
  //   }
  //
  // }

  // $scope.saveChanges = function(post,text,imageGifUrl,ytVmUrl,spotUrl){
  //   var tempObj = post;
  //   console.log('tempObj',tempObj);
  //
  //   $scope.activeItem = null;
  //   $scope.editPostEmptyError = false;
  //   $scope.editPostError = false;
  //   // var t = text;
  //   // var imgGif = imageGifUrl;
  //   // var ytVm = ytVmUrl;
  //   // var spotU = spotUrl;
  //   // console.log('t',t,'imgGif',imgGif,'ytVm',ytVm,'spotU',spotU);
  //   // console.log('t', t === "");
  //   // console.log('imgGif',imgGif === "");
  //   // console.log('ytVm',ytVm === "");
  //   // console.log('spotU',spotU === "");
  //
  //   if(text === "" && imageGifUrl === "" && ytVmUrl === "" && spotUrl === ""){
  //     $scope.showPost(post);
  //     console.log('tempObj in IF',tempObj);
  //     console.log('tempObj description in IF',tempObj.description);
  //     console.log('scope text',text);
  //     console.log('post',post);
  //     $scope.editPostEmptyError = true;
  //
  //     // text = post.description;
  //     // imageGifUrl = post.imageUrl;
  //     // ytVmUrl = post.videoUrl;
  //     // spotUrl = post.audioUrl;
  //     // post.text = tempObj.description;
  //     // post.imageGifUrl = tempObj.imageUrl;
  //     // post.ytVmUrl = tempObj.videoUrl;
  //     // post.spotUrl = tempObj.audioUrl;
  //     // console.log('audio URL',post.audioUrl);
  //     console.log('text with post',post.description);
  //     //
  //     // $scope.posts.$save(post).then(function(){
  //     // })
  //     console.log('showPost', $scope.showPost);
  //     $scope.setActive(post);
  //     // $scope.showPost(post);
  //   }
  //   else{
  //     if(spotUrl){
  //       console.log('Spot URL',spotUrl);
  //       var n = spotUrl.split('/')
  //       post.audioUrl = 'https://embed.spotify.com/?uri=spotify:track:' + n[n.length -1];
  //       console.log('Post Audio Url',post.audioUr);
  //     }
  //
  //
  //
  //     var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
  //     var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
  //     var splitUrl = ytVmUrl.split('/');
  //     if(splitUrl[3] === "embed"){
  //       console.log('already embedded');
  //       post.videoUrl = ytVmUrl;
  //     }else{
  //       console.log('embedding url');
  //
  //
  //       if(pattern1.test(ytVmUrl)){
  //         console.log('Vimeo Video');
  //         var replacement = 'https://player.vimeo.com/video/$1';
  //         post.videoUrl = ytVmUrl.replace(pattern1, replacement);
  //       }
  //
  //
  //       if(pattern2.test(ytVmUrl)){
  //         console.log('Youtube Video');
  //         var replacement = 'http://www.youtube.com/embed/$1';
  //         post.videoUrl = ytVmUrl.replace(pattern2, replacement);
  //       }
  //     }
  //
  //
  //     post.description = text;
  //     post.imageUrl = imageGifUrl;
  //
  //
  //     $scope.posts.$save(post).then(function(){
  //     })
  //
  //   }
  //
  // }

  $scope.removePost = function(post){
    if(confirm("Are you sure you want to delete this post?")){
      $scope.posts.$remove(post);
    }

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
