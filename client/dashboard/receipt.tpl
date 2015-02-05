<div class="row">
  <div class="col-md-4 col-xs-12">
    <h3 class="text-center text-uppercase">Receipt</h3>
    <div class="panel panel-default detail-element center">
      <div class="panel-heading">Receipt #{{receipt.receipt}}</div>
      <div class="panel-body">
        <hr/>
        <p class="col-xs-9 text-left"><b class="text-uppercase">{{receipt.totalString? receipt.totalString: "Total: "}}</b></p>
        <p class="col-xs-3 text-right"><b class="text-uppercase">{{(receipt.total | currency) || "???"}}<b></p>
      </div>
    </div>
  </div>
  <div class="col-md-4 col-xs-12">
    <div class="row">
      <div class="col-xs-12">
        <h3 class="text-center text-uppercase">Ride</h3>
        <img class="receipt-photo center" ng-src="{{isOpen && receipt.map}}"/>
      </div>
    </div>
    <br />
    <div class="row">
      <div class="col-xs-10 col-xs-offset-1 detail-element">
        <p><b class="text-uppercase">Time:</b> {{receipt.time || '???'}}</p>
        <p><b class="text-uppercase">Pickup:</b> {{receipt.pickup || '???'}}</p>
        <p><b class="text-uppercase">Dropoff:</b> {{receipt.dropoff || '???'}}</p>
      </div>
    </div>
  </div>
  <div class="col-md-4 col-xs-12">
    <h3 class="text-center text-uppercase">Driver</h3>
    <img class="receipt-photo center" ng-src="{{isOpen && receipt.driver_photo}}"/>
    <h4 class="text-center">{{receipt.driver || '???'}}</h4>
  </div>
</div>