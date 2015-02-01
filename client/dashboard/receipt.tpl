<div class="row">
  <div class="col-md-4 col-xs-12">
    <h3 class="text-center">receipt: {{receipt.receipt}}</h3>
    <p>total: {{receipt.total | currency}}</p>
  </div>
  <div class="col-md-4 col-xs-12">
    <h3 class="text-center">Ride</h3>
    <img class="center" ng-src="{{receipt.map}}"/>
    <p><b>Time:</b> {{receipt.time}}</p>
    <p><b>Pickup:</b> {{receipt.pickup}}</p>
    <p><b>Dropoff:</b> {{receipt.dropoff}}</p>
  </div>
  <div class="col-md-4 col-xs-12">
    <h3 class="text-center">Driver</h3>
    <img class="center" ng-src="{{receipt.driver_photo}}"/>
    <h4 class="text-center">{{receipt.driver}}</h4>
  </div>
</div>