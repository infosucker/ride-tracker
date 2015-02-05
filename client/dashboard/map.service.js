(function(){
  angular.module("app").factory("mapService", mapService);

  mapService.$inject = ["googleConstants"];

  function mapService(googleConstants){
    var color = "red";
    var size = [320, 200];

    return function(){
      this.addresses = arguments;

      var url = googleConstants.staticMapURI;
      this.params = {
        markers: _.map(this.addresses, function(address, index){
          return {
            style: {color: color},
            label: index === 0? "P":"D",
            address: address
          };
        })
      };

      this.getURI = function(){
        var uriParams = _.map(this.params.markers, function(marker){
          return sprintf("color:%s|label:%s|%s", marker.style.color, marker.label, marker.address);
        });

        return encodeURI(sprintf("%smarkers=%s&size=%dx%d&key=%s", url, uriParams.join("&markers="), size[0], size[1], googleConstants.publicAPIKey));
      };

      return this;
    };
  }
})();