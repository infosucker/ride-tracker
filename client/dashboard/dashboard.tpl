<div class="container">
  <div class="row text-center">
    <div class="col-md-offset-4 col-md-2 col-xs-6" ng-show="dashboardctrl.facebookUrl" fb-like="dashboardctrl.facebookUrl"></div>
    <div class="col-md-2 col-xs-6" ng-show="dashboardctrl.tweet" tweet="dashboardctrl.tweet"></div>
  </div>

  <br />

  <h1 class="text-center text-uppercase">Track My Lyfts</h1>
  <h4 class="text-center text-uppercase">your lyft receipts all in one place</h4>
  
  <br />
  
  <div class="row text-center">
    <div class="col-xs-12">
      <div class="btn btn-primary text-uppercase" ng-show="!dashboardctrl.currentUser || (!dashboardctrl.receipts && !dashboardctrl.loading && !dashboardctrl.completed)" ng-disabled="dashboardctrl.isLoggingIn || dashboardctrl.loading" ng-click="dashboardctrl.gmailButtonClick()"><img src="/assets/gmail-icon.png"/>Get Receipts from Gmail</div>
    </div>
  </div>

  <div ng-show="dashboardctrl.currentUser">
  
    <div class="row text-center">
      <div class="col-xs-12">
        <div id="highchart"></div>
      </div>
    </div>

    <br />

    <div class="row text-center" ng-show="dashboardctrl.completed && (!dashboardctrl.receipts || !dashboardctrl.receipts.length)">
      <div class="col-xs-12">
        <h2 class="text-uppercase">No Receipts Found</h2>
      </div>
    </div>
    
    <div class="row text-center" ng-show="dashboardctrl.receipts && dashboardctrl.receipts.length">
      <div class="col-xs-12">
        <!-- <div class="btn-group" dropdown>
          <button type="button" class="btn btn-primary dropdown-toggle" dropdown-toggle>
            {{chartSettings.operator }}<span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="o in dashboardctrl.operators">
              <a href ng-click="chartSettings.operator = o;">{{o}}</a>
            </li>
          </ul>
        </div> -->
        <div class="btn-group text-uppercase" dropdown>
          <button type="button" class="btn btn-primary dropdown-toggle" dropdown-toggle>
            {{chartSettings.dataType}}<span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="d in dashboardctrl.dataTypes">
              <a href ng-click="chartSettings.dataType = d;">{{d}}</a>
            </li>
          </ul>
        </div>
        <div class="btn-group text-uppercase" dropdown>
          <button type="button" class="btn btn-primary dropdown-toggle" dropdown-toggle>
            {{chartSettings.split}}<span class="caret"></span>
          </button>
          <ul class="dropdown-menu">
            <li ng-repeat="s in dashboardctrl.splits">
              <a href ng-click="chartSettings.split = s;">{{s}}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <br />

    <div class="row text-center" ng-show="dashboardctrl.receipts && dashboardctrl.receipts.length">
      <h1 class="col-xs-11 col-xs-offset-1 text-left text-uppercase">Total Rides: {{dashboardctrl.receipts.length}} <small ng-show="dashboardctrl.receipts.length >= 80"> (showing the last {{dashboardctrl.receipts.length}} rides in your inbox, if you crave more <a href="mailto:simon@glipcode.com?Subject=We%20Want%20More!" target="_blank">email me!</a>)</small></h1>

      <h1 class="col-xs-11 col-xs-offset-1 text-left text-uppercase">Total Spent: {{dashboardctrl.totalSpent | currency}}</h1>
    </div>

    <br />
    
    <div class="row text-center">
      <div class="col-xs-12">
        <img class="loading-gif" src="/assets/loading.gif" ng-show="dashboardctrl.loading"/>
      </div>
    </div>
    
    <div class="row text-center">
      <div class="col-xs-12 text-left">
        <accordion close-others="oneAtATime">
          <accordion-group ng-repeat="receipt in dashboardctrl.receipts" is-open="status.open">
            <accordion-heading>
              {{receipt.total? (receipt.total | currency) : "$???"}} -- {{receipt.time? receipt.time : "???"}} <span ng-show="receipt.cancelled" class="danger">(cancelled)</span>
              <i class="pull-right glyphicon" ng-class="{'glyphicon-chevron-down': status.open, 'glyphicon-chevron-right': !status.open}"></i>
            </accordion-heading>
            <receipt receipt-data="{{receipt}}" is-open="{{status.open}}"></receipt>
          </accordion-group>
        </accordion>
      </div>
    </div>
    
    <div class="row text-center">
      <div class="col-xs-12">
        <div class="btn btn-primary text-uppercase" ng-click="dashboardctrl.refresh()" ng-show="dashboardctrl.completed && !dashboardctrl.loading" ng-disabled="dashboardctrl.loading">Refresh</div>
      </div>
    </div>

  </div>
  
  <br />
</div>