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

app.controller('PostsController', function($scope, $firebaseArray, $firebaseAuth, $location){

  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);
  //create reference
  var postsRef = new Firebase("https://keenlydone.firebaseio.com/posts");
  //use reference to create synchronized array
  $scope.posts = $firebaseArray(postsRef);
  $scope.newPost = {text: "", completed: false};

  $scope.addPost = function(){
    $scope.posts.$add($scope.newPost).then(function(data){
      $scope.newPost.text = "";
    })
  }

  $scope.showPost = function(post){
    $scope.text = todo.text;
    $scope.id = todo.$id;
  }

  $scope.saveChanges = function(post,text,completed){
    //var id = $scope.id;
    //var record = $scope.todos.$getRecord(id);
    console.log(post);
    console.log(text);
    console.log(completed);
    post.text = text;
    if (completed == 'completed') {
      post.completed = true;
    } else {
      post.completed = false;
    }

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
});
