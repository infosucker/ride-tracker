<div class="container">
  <div class="row text-center">
    <div class="col-xs-12">
      <div class="btn btn-primary" ng-click="dashboardctrl.getGmail()">get email</div>
    </div>
  <div class="row text-center">
    <div class="col-xs-12 text-left">
      <accordion close-others="oneAtATime">
        <accordion-group heading="{{receipt.total | currency}}" ng-repeat="receipt in dashboardctrl.receipts">
          <receipt receipt-data="{{receipt}}"></receipt>
        </accordion-group>
      </accordion>
    </div>
  </div>
</div>