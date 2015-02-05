(function(){
  angular.module("app").factory("receiptService", receiptService);

  receiptService.$inject = [];

  function receiptService(){
    return {
      chartCount: chartCount,
      chartTotal: chartTotal,
      getTotalSpent: getTotalSpent
    };

    // chart histogram of receipts by date delimiter e.g. 'number of rides weekly'
    function chartCount(receipts, delimiter){
      var xPoints = getXPoints(receipts, delimiter);

      // group the receipts by the time delimiter e.g. 'week'
      var grouped = groupByDelimiter(receipts, delimiter);

      var yPoints = _.map(xPoints, function(x){
        return grouped[x]? grouped[x].length : 0;
      });

      // format the x-axis labels
      xPoints = formatXLabels(xPoints, delimiter);

      return {
        xPoints: xPoints,
        yPoints: yPoints
      };
    }

    // chart sum for a receipt datatype separated by date delimiter e.g. 'total dollars spent monthly'
    function chartTotal(receipts, dataType, delimiter){
      var xPoints = getXPoints(receipts, delimiter);

      // group the receipts by the time delimiter e.g. 'week'
      var grouped = groupByDelimiter(receipts, delimiter);

      // get the yPoints
      var yPoints = _.map(xPoints, function(x){
        var mapped = _.map(grouped[x], function(receipt){
          try{
            return isNaN(parseFloat(receipt[dataType]))? 0: parseFloat(receipt[dataType]);
          }catch(e){
            console.log(e);
            return 0;
          }
        });

        return mapped.length ? _.reduce(mapped, function(a, b){return a+b;}) : 0; // reduce to sum or return 0 for empty array
      });

      // format the x-axis labels
      xPoints = formatXLabels(xPoints, delimiter);

      return {
        xPoints: xPoints,
        yPoints: yPoints
      };
    }

    // format x axis labels so they're pretty
    function formatXLabels(xPoints, delimiter){
      switch(delimiter){
        case 'week':
          return _.map(xPoints, function(d){
            return moment(d).format('M/D');
          });
        case 'month':
          return _.map(xPoints, function(d){
            return moment(d).format('M/YY');
          });
        case 'day':
          return _.map(xPoints, function(d){
            return moment(d).format('M/D/YY');
          });
        default:
          return _.map(xPoints, function(d){
            return moment(d).format('YYYY');
          });
      }
    }

    function getTotalSpent(receipts){
      return _.reduce(_.map(receipts, function(r){
        try{
          return isNaN(parseFloat(r.total))? 0: parseFloat(r.total);
        }catch(e){
          console.log(e);
          return 0;
        }
      }), function(x, y){
        return x+y;
      });
    }

    function getXPoints(receipts, delimiter){
      var minDate = moment(_.min(_.pluck(receipts, "messageDate"))).startOf(delimiter).toDate();  // use start of delimeter for grouping
      var maxDate = moment(_.max(_.pluck(receipts, "messageDate"))).startOf(delimiter).toDate();  // use start of delimeter for grouping

      // get the xPoints
      var xPoints = [];
      for(var i = 0; i <= moment(maxDate).diff(minDate, delimiter); i++){
        xPoints.push(moment(minDate).add(i, delimiter).toISOString());
      }

      return xPoints;
    }

    // group the receipts by the time delimiter e.g. 'week'
    function groupByDelimiter(receipts, delimiter){
      return _.groupBy(receipts, function(receipt){
        return moment(receipt.messageDate).startOf(delimiter).toISOString();  // use the start of every delimiter, and use ISOString for key comparison
      });
    }
  }
})();