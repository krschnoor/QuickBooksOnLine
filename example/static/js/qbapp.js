var app = angular.module('CS', [])

app.controller('CScontroller', ['$scope', '$http', '$location', '$timeout', '$window', '$rootScope', function ($scope, $http, $location, $timeout, $window, $rootScope) {

  $scope.en = false
  $scope.trialBalance
  $scope.dashBoard
  $scope.csClients
  $scope.selectedClient = { name: "No Client Open" }
  $scope.dateStartTB = {}
  $scope.dateEndTB = {}
  $scope.dateDiffTB = 0
  $scope.dateStartDB = {}
  $scope.dateEndDB = {}
  $scope.dateDiffDB = 0
  $scope.dbyears = []
  $scope.dbyear = {}
  $scope.dbmonths = [1,2,3,4,5,6,7,8,9,10,11,12]
  $scope.dbmonth = {}


  $http.get('/csclients').success(function (data, status, headers, config) {

    $scope.csClients = data


  }).error(function (data, status, headers, config) { })







  $scope.setContent = function (page) {

    $scope.content = '/static/' + page

    console.log("pp")

  }


  $scope.getQB = function () {

    var x = $window.open('http://localhost:3000/qb') //change to localhost

    $timeout(function () {
      x.close()
    }
      , 20000);

  }


  $scope.findAccounts = function () {
    $http.get('/qbAccounts').success(function (data, status, headers, config) {

      alert(data.status)

    }).error(function (data, status, headers, config) {

      alert("No QuickBooks Connection!")

    })

  }


  $scope.setClient = function (client) {


    $scope.selectedClient.name = client

  }



  $scope.setDateStartTB = function () {

    console.log($scope.dateStartTB.dt)

    var date1 = new Date($scope.dateStartTB.dt);
    var date2 = new Date($scope.dateEndTB.dt);
    var timeDiff = date2.getTime() - date1.getTime();
    timeDiff == null ? 0 : timeDiff
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    $scope.dateDiffTB = diffDays

  }


  $scope.setDateEndTB = function (dt) {

    console.log($scope.dateEndTB.dt)

    var date1 = new Date($scope.dateStartTB.dt);
    var date2 = new Date($scope.dateEndTB.dt);
    var timeDiff = (date2.getTime() - date1.getTime());
    timeDiff == null ? 0 : timeDiff
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    $scope.dateDiffTB = diffDays

  }

  $scope.setDateStartDB = function () {

    console.log($scope.dateStartTB.dt)

    var date1 = new Date($scope.dateStartDB.dt);
    var date2 = new Date($scope.dateEndDB.dt);
    var timeDiff = date2.getTime() - date1.getTime();
    timeDiff == null ? 0 : timeDiff
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    $scope.dateDiffDB = diffDays

  }


  $scope.setDateEndDB = function (dt) {

    console.log($scope.dateEndTB.dt)

    var date1 = new Date($scope.dateStartDB.dt);
    var date2 = new Date($scope.dateEndDB.dt);
    var timeDiff = (date2.getTime() - date1.getTime());
    timeDiff == null ? 0 : timeDiff
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    $scope.dateDiffDB = diffDays

  }


  $scope.getTrialBalance = function () {

    $scope.en = true

    $http.get('/tb',
      { params: { dtStart: $scope.dateStartTB.dt, dtEnd: $scope.dateEndTB.dt, client: $scope.selectedClient.name } })
      .success(function (data, status, headers, config) {

        $scope.trialBalance = data

        alert("Trial Balance Download Complete")

        $scope.en = false


      }).error(function (data, status, headers, config) {

        alert(data.status)
        $scope.en = false

      })


  }




  $scope.getDashBoard = function () {

    $scope.en = true

    $http.get('/db',
      { params: { dtStart: $scope.dateStartDB.dt, dtEnd: $scope.dateEndDB.dt, client: $scope.selectedClient.name } })
      .success(function (data, status, headers, config) {

        $scope.dashBoard = data

        alert("Dashboard Download Complete")

        $scope.en = false
        $scope.populateDashboardDates()


      }).error(function (data, status, headers, config) {

        alert(data.status)
        $scope.en = false

      })


  }



  /// totals for reports



  $scope.getTrialBalanceViewTotals = function (type) {


    var totals = {

      debits: 0,
      credits: 0
    }

    $scope.trialBalance.forEach(function (account, i) {


      totals.debits += parseFloat(account.debit) || 0
      totals.credits += parseFloat(account.credit) || 0


    })


    return type == "credit" ? totals.credits : totals.debits
  }


$scope.populateDashboardDates = function(){

     var arr2 = []
     $scope.dbyears = []

      $scope.dashBoard.forEach(function(acct,i) {
          
          var arr = arr2.filter(function(item){

           return item == acct.year

          })


          if( arr.length == 0){

            $scope.dbyears.push(acct.year)
            arr2.push(acct.year)
          }



      });

 
}



$scope.setDBMonth = function(m){

 
  
}



$scope.getDashboardData = function(type,month,mode,ex,month2){

 if(month> $scope.dbmonth.month){

   return 0
 }

else if((month==1 && ex=="gt" && month2 > $scope.dbmonth.month )){

   return 0
 }

else if(( month > $scope.dbmonth.month && ex=="gt")){

   return 0
 }

 

  if(mode=="ind"){

    var accounts  = $scope.dashBoard.filter(function(acct){

     return (acct.name == type && acct.month == month & acct.year == $scope.dbyear.year)  // && acct.m == month && acct.y == 2018


   })

  }

if(mode=="total"){

    var accounts  = $scope.dashBoard.filter(function(acct){

     return (acct.category == type && acct.month == month & acct.year == $scope.dbyear.year)  // && acct.m == month && acct.y == 2018


   })

  }

if(mode=="ltliab"){

    var accounts  = $scope.dashBoard.filter(function(acct){

     return (acct.type == type && acct.month == month & acct.year == $scope.dbyear.year)  // && acct.m == month && acct.y == 2018


   })

  }




if(mode=="totliab"){

 
  

    var accounts2  = $scope.dashBoard.filter(function(acct){

     return ((acct.type == "Long Term Liability" || acct.type == "Current Liability" 
     || acct.type == "Other Current Liability"  || acct.type == "Accounts Payable" || acct.type == "Credit Card")
      && acct.month == month & acct.year == $scope.dbyear.year)  


    })

  var accounts = []

      accounts2.forEach(function(acct,i) {
          
          var arr = accounts.filter(function(item){

           return item.id == acct.id

          })


          if( arr.length == 0){

            accounts.push(acct)
          }



      });

    

 }

 

if(mode=="assetliab"){



    var accounts2  = $scope.dashBoard.filter(function(acct){

     return ((acct.category == "Asset" || acct.category == "Liability")
      && acct.month == month & acct.year == $scope.dbyear.year)  


    })

  var accounts = []

      accounts2.forEach(function(acct,i) {
          
          var arr = accounts.filter(function(item){

           return item.id == acct.id

          })


          if( arr.length == 0){

            accounts.push(acct)
          }



      });

    

 }









var totalDR=0, totalCR =0, total

accounts.forEach(function(acct,i){

totalDR += parseFloat(acct.debit) || 0
totalCR += parseFloat(acct.credit) || 0

acct.category == "Asset" ?  total = totalDR - totalCR : total  = totalCR - totalDR


})

return (total)


}










}])