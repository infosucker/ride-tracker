(function(){
  angular.module("app").controller("DashboardCtrl", DashboardCtrl);

  DashboardCtrl.$inject = ['$meteorMethods', '$rootScope', '$scope', 'googleConstants', 'mapService', 'receiptService', 'utilityService'];

  function DashboardCtrl($meteorMethods, $rootScope, $scope, googleConstants, mapService, receiptService, utilityService){
    var vm = this;
    
    vm.dataTypes = ["Spending", "Rides"]; // add "Distance"
    vm.operators = ["Average", "Total"];  // add dropdown and functionality here
    vm.splits = ["Daily", "Weekly", "Monthly", "Annually"];

    vm.gmailButtonClick = gmailButtonClick;
    vm.getGmail = getGmail;
    vm.chartCount = chartCount;
    vm.chartTotal = chartTotal;
    vm.loginWithGoogle = loginWithGoogle;
    vm.refresh = refresh;

    vm.chartOptions = {};

    activate();

    
    ///////////////


    function activate(){

      $scope.chartSettings = {
        dataType: _.first(vm.dataTypes),
        operator: _.last(vm.operators),
        split: _.first(vm.splits)
      };

      $scope.$watch('chartSettings', function(chartSettings){
        if(vm.receipts && vm.receipts.length){
          setupChart(buildChartData());
        }
      }, true);

      setupChartTheme();
      // vm.receipts = [{
      //   driver: "Patrice Z",
      //   driver_photo: "https://lyftapi.s3.amazonaws.com/production/photos/320x200/176603554_driver.jpg",
      //   dropoff: "449 Webster Street, San Francisco, CA 94117, USA",
      //   pickup: "9TH St AND MARKET St, San Francisco, CA 94103, USA",
      //   receipt: "688422745700687874", 
      //   time: "January 29 at 8:06 PM",
      //   total: "2.25",
      //   totalString: "Total charged to Discover ***0439: ",
      //   messageDate: moment().toDate()
      // },
      // {
      //   driver: "Patrice Z",
      //   driver_photo: "https://lyftapi.s3.amazonaws.com/production/photos/320x200/176603554_driver.jpg",
      //   dropoff: "449 Webster Street, San Francisco, CA 94117, USA",
      //   pickup: "9TH St AND MARKET St, San Francisco, CA 94103, USA",
      //   receipt: "688422745700687874", 
      //   time: "January 29 at 8:06 PM",
      //   total: "2.25",
      //   totalString: "Total charged to Discover ***0439: ",
      //   messageDate: moment().subtract(-3, "months").toDate()
      // }];

      // console.log(vm.receipts);
      //   if(vm.receipts){
      //     setupChart(buildChartData());
      //     vm.totalSpent = _.reduce(_.map(vm.receipts, function(r){
      //       return parseFloat(r.total);
      //     }), function(x, y){
      //       return x+y;
      //     });
      //   }

      // vm.receipts = [];
      // if(vm.receipts && vm.receipts.length)
      //   setupChart(buildChartData());
      // vm.completed = true;

      $rootScope.$watch('currentUser', function(currentUser){
        vm.currentUser = currentUser;
        if(!currentUser){
          vm.receipts = null;
        }
      });

      $rootScope.$watch('loggingIn', function(loggingIn){
        vm.isLoggingIn = loggingIn;
      });
    }

    function buildChartData(){
      var data, delimiter;

      switch($scope.chartSettings.split){
        case "Daily":
          delimiter = "day";
          break;
        case "Weekly":
          delimiter = "week";
          break;
        case "Monthly":
          delimiter = "month";
          break;
        case "Annually":
          delimiter = "year";
          break;
        default:
          delimiter = "month";
          break;
      }

      switch($scope.chartSettings.dataType){
        case "Rides":
          data = vm.chartCount(vm.receipts, delimiter);
          data.pointFormat = "{point.y:f} rides";
          break;
        case "Spending":
          data = vm.chartTotal(vm.receipts, 'total', delimiter);
          data.pointFormat = "${point.y:.2f}";
          break;
        case "Distance":
          data = vm.chartTotal(vm.receipts, 'distance', delimiter);
          data.pointFormat = "{point.y:.1f} mi";
          break;
        default:
          data = vm.chartTotal(vm.receipts, 'total', delimiter);
      }

      data.title = sprintf("%s Lyft %s %s", utilityService.toTitleCase($scope.chartSettings.operator), utilityService.toTitleCase($scope.chartSettings.dataType), utilityService.toTitleCase($scope.chartSettings.split));
      data.seriesTitle = sprintf("%s %s", utilityService.toTitleCase($scope.chartSettings.operator), utilityService.toTitleCase($scope.chartSettings.dataType));
      data.yAxisTitle = sprintf("%s %s", utilityService.toTitleCase($scope.chartSettings.operator), utilityService.toTitleCase($scope.chartSettings.dataType)) + ($scope.chartSettings.dataType ==='Spending'? " ($)": "");

      return data;
    }

    function getGmail(){
      vm.loading = true;
      vm.completed = false;
      $meteorMethods.call("gmail").then(function(response){

        vm.receipts = response;
        
        vm.loading = false;
        vm.completed = true;

        if(vm.receipts && vm.receipts.length){
          setupChart(buildChartData());

          // get total spent
          vm.totalSpent = receiptService.getTotalSpent(vm.receipts);
        }
      }, function(error){

        vm.loading = false;
        vm.completed = true;
        
        console.log(error);
      });
    }

    function gmailButtonClick(){
      if($rootScope.currentUser){
        getGmail();
      }else{
        loginWithGoogle(function(error) {
          if(error) {
            console.log(error);
          }else{
            getGmail();
          }
        });
      }
    }

    function loginWithGoogle(callback){
      Meteor.loginWithGoogle({
        loginStyle: 'redirect',
        requestPermissions: 'https://www.googleapis.com/auth/gmail.readonly',
        requestOfflineToken: true,
        forceApprovalPrompt: true
      }, callback);
    }

    function refresh(){
      if(vm.chart){
        vm.chart.destroy();
        vm.chart = null;
      }
      vm.receipts = null;
      getGmail();
    }

    function chartCount(receipts, delimiter){
      return receiptService.chartCount(receipts, delimiter);
    }

    function chartTotal(receipts, dataType, delimiter){
      return receiptService.chartTotal(receipts, dataType, delimiter);
    }

    function setupChart(data){
      var maxXLabels = 10;

      vm.chartOptions = {
        chart: {
          type: 'column',
          renderTo: "highchart"
        },
        title: {
          text: data.title
        },
        subtitle: {
          text: 'Source: GMail'
        },
        xAxis: {
          categories: data.xPoints,
          labels: {
            step: Math.ceil(data.xPoints.length/maxXLabels),
            maxStaggerLines: 1,
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: data.yAxisTitle
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: sprintf('<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>%s</b></td></tr>', data.pointFormat),
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        series: [{
          name: data.seriesTitle,
          data: data.yPoints
        }]
      };

      if(vm.chart){
        vm.chart.destroy();
        vm.chart = null;
      }

      vm.chart = new Highcharts.Chart(vm.chartOptions);   
    }

    function setupChartTheme(){
      /**
       * Dark theme for Highcharts JS
       * @author Torstein Honsi
       */

      Highcharts.theme = {
         colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
            "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
         chart: {
            backgroundColor: {
               linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
               stops: [
                  [0, '#2a2a2b'],
                  [1, '#3e3e40']
               ]
            },
            style: {
               fontFamily: "'Unica One', sans-serif"
            },
            plotBorderColor: '#606063'
         },
         title: {
            style: {
               color: '#E0E0E3',
               textTransform: 'uppercase',
               fontSize: '20px'
            }
         },
         subtitle: {
            style: {
               color: '#E0E0E3',
               textTransform: 'uppercase'
            }
         },
         xAxis: {
            gridLineColor: '#707073',
            labels: {
               style: {
                  color: '#E0E0E3'
               }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            title: {
               style: {
                  color: '#A0A0A3'

               }
            }
         },
         yAxis: {
            gridLineColor: '#707073',
            labels: {
               style: {
                  color: '#E0E0E3'
               }
            },
            lineColor: '#707073',
            minorGridLineColor: '#505053',
            tickColor: '#707073',
            tickWidth: 1,
            title: {
               style: {
                  color: '#A0A0A3'
               }
            }
         },
         tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            style: {
               color: '#F0F0F0'
            }
         },
         plotOptions: {
            series: {
               dataLabels: {
                  color: '#B0B0B3'
               },
               marker: {
                  lineColor: '#333'
               }
            },
            boxplot: {
               fillColor: '#505053'
            },
            candlestick: {
               lineColor: 'white'
            },
            errorbar: {
               color: 'white'
            }
         },
         legend: {
            itemStyle: {
               color: '#E0E0E3'
            },
            itemHoverStyle: {
               color: '#FFF'
            },
            itemHiddenStyle: {
               color: '#606063'
            }
         },
         credits: {
            style: {
               color: '#666'
            }
         },
         labels: {
            style: {
               color: '#707073'
            }
         },

         drilldown: {
            activeAxisLabelStyle: {
               color: '#F0F0F3'
            },
            activeDataLabelStyle: {
               color: '#F0F0F3'
            }
         },

         navigation: {
            buttonOptions: {
               symbolStroke: '#DDDDDD',
               theme: {
                  fill: '#505053'
               }
            }
         },

         // scroll charts
         rangeSelector: {
            buttonTheme: {
               fill: '#505053',
               stroke: '#000000',
               style: {
                  color: '#CCC'
               },
               states: {
                  hover: {
                     fill: '#707073',
                     stroke: '#000000',
                     style: {
                        color: 'white'
                     }
                  },
                  select: {
                     fill: '#000003',
                     stroke: '#000000',
                     style: {
                        color: 'white'
                     }
                  }
               }
            },
            inputBoxBorderColor: '#505053',
            inputStyle: {
               backgroundColor: '#333',
               color: 'silver'
            },
            labelStyle: {
               color: 'silver'
            }
         },

         navigator: {
            handles: {
               backgroundColor: '#666',
               borderColor: '#AAA'
            },
            outlineColor: '#CCC',
            maskFill: 'rgba(255,255,255,0.1)',
            series: {
               color: '#7798BF',
               lineColor: '#A6C7ED'
            },
            xAxis: {
               gridLineColor: '#505053'
            }
         },

         scrollbar: {
            barBackgroundColor: '#808083',
            barBorderColor: '#808083',
            buttonArrowColor: '#CCC',
            buttonBackgroundColor: '#606063',
            buttonBorderColor: '#606063',
            rifleColor: '#FFF',
            trackBackgroundColor: '#404043',
            trackBorderColor: '#404043'
         },

         // special colors for some of the
         legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
         background2: '#505053',
         dataLabelsColor: '#B0B0B3',
         textColor: '#C0C0C0',
         contrastTextColor: '#F0F0F3',
         maskColor: 'rgba(255,255,255,0.3)'
      };

      // Apply the theme
      Highcharts.setOptions(Highcharts.theme);
    }
  }
})();