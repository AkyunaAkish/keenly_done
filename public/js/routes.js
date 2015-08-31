app.config(function($routeProvider, $locationProvider){
  $routeProvider
  .when('/', {
    templateUrl: '/partials/landing.html',
    controller: 'AuthController'
  })
  .when('/main', {
    templateUrl:'/partials/main.html',
    controller: 'PostsController',
    resolve: {user: resolveUser}
  }).otherwise({redirectTo:'/'});


  // $locationProvider.html5Mode(true);
})

app.run(function($rootScope, $location){
  $rootScope.$on('$routeChangeError', function(event, next, previous, error){
    if(error === "AUTH_REQUIRED"){
      $location.path('/');
    }
  })
})

function resolveUser($firebaseAuth){
  var authRef = new Firebase("https://keenlydone.firebaseio.com");
  var authObj = $firebaseAuth(authRef);

  return authObj.$requireAuth();
}
