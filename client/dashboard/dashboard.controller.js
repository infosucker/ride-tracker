(function(){
  angular.module("app").controller("DashboardCtrl", DashboardCtrl);

  DashboardCtrl.$inject = ['$meteorMethods', 'googleConstants', 'mapService'];

  function DashboardCtrl($meteorMethods, googleConstants, mapService){
    var vm = this;
    vm.getGmail = getGmail;

    activate();

    ///////////////

    function getGmail(){
      $meteorMethods.call("gmail").then(function(response){
        vm.receipts = response;
        console.log(vm.receipts);
      }, function(error){
        console.log(error);
      });
    }

    function activate(){

      // vm.receipts = [{
      //   driver: "Patrice Z",
      //   driver_photo: "https://lyftapi.s3.amazonaws.com/production/photos/320x200/176603554_driver.jpg",
      //   dropoff: "449 Webster Street, San Francisco, CA 94117, USA",
      //   pickup: "9TH St AND MARKET St, San Francisco, CA 94103, USA",
      //   receipt: "688422745700687874", 
      //   time: "January 29 at 8:06 PM",
      //   total: "2.25",
      // }];

    }
  }
})();