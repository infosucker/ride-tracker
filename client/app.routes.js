angular.module("app").run(function($rootScope, $state) {

  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){ 
    console.log(event);
    console.log(toState);
    console.log(toParams);
    console.log(fromState);
    console.log(fromParams);
    console.log(error);

    if(error.status === 401){
      $state.go('401');
    }else{
      $state.go('404');
    }
  });
});

angular.module("app").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function($urlRouterProvider, $stateProvider, $locationProvider){

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: 'client/dashboard/dashboard.tpl',
        controller: 'DashboardCtrl',
        controllerAs: 'dashboardctrl'
      })
      .state('unauthorized', {
        url: '/401',
        templateUrl: 'client/error/views/401.tpl',
      })
      .state('404', {
        url: '/404',
        template: "<div>404</div>",
      });

    $urlRouterProvider.otherwise("/404");
  }]);