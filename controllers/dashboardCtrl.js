var App = angular.module("hmisPortal");

App.config(function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
});

App.controller("dashboardCtrl",function ($rootScope, $scope, $http, $location, $routeParams, $timeout, portalService, $compile) {

	$rootScope.disaggregateBy = 'period';
  $rootScope.tempDisaggregateBy = '';
	$rootScope.selectedPe = "2073/2074";
	$rootScope.selectedOu = 'national';
  

	$scope.tempOu = '';
	$scope.level = '';
	$scope.data.pe = [];
	$scope.data.ou = [];
	$scope.jsonData = [];
	$scope.dx = [];

	$scope.data.chartSeries = [];
	$scope.baseUrl  = portalService.base;
	$rootScope.items;

	// Displaying loading during page change
  $rootScope.$on("$routeChangeStart", function (event, current, previous, rejection) {
    $rootScope.showLoader = true;
  });

	// Hide the loading after route change end
  $rootScope.$on("$routeChangeSuccess", function (event, current, previous, rejection) {
    $rootScope.showLoader = false;
  });

	//portalService.authenticateDHIS();
	$scope.prepareUrl = function(item){
    var url = $scope.baseUrl+"dhis/index.php/servedata/index/"+item.dx+"/fy/";
		//var pe = $scope.generatePeriods();
		if($scope.disaggregateBy == "period"){
      url += 'na'
		}else{
			url += $scope.selectedPe.split('/')[0]+'April';
		}

    var ou = $scope.getOu();
    url += '/'+ou;

    //alert(url);
		return url;
	}

  $scope.visualizeData = function(url, visContainer, visType, dis){
		$scope.data.chartSeries = [];
		$scope.data.pe = [];
		$scope.data.ou = [];

    if(dis == undefined || dis == null){
      dis = $scope.disaggregateBy;
    }
		$http.get(url).success(function(data){
			console.log('Creating visualization for '+visContainer);
      //alert(JSON.stringify(data,2,2));
			angular.forEach(data, function (row) {
				if($scope.data.pe.indexOf(row.period) == -1){
					$scope.data.pe.push(row.period);
				}
				if($scope.data.ou.indexOf(row.level) == -1){
					$scope.data.ou.push(row.level);
				}
			});
			$scope.data.pe.sort();
			$scope.data.ou.sort();

			var finalData = $scope.composeData(data, dis);
      //alert(JSON.stringify(finalData,2,2));
			if(visType == 'table'){
				$scope.loadTable(data, visContainer);
			}else if(visType == 'map'){
				$scope.loadMap(data, visContainer);
			}else{
				$scope.createChart(finalData, visContainer, visType, dis);
			}
		});
    }

	$scope.composeData = function(json, dis){
		var jsonData = [];
		var data = [];
		var chartSeries;

		// if by period
		if(dis == 'period'){
			angular.forEach($scope.data.pe, function (pe) {
				var tempData = {};
				tempData['period'] = pe;

				angular.forEach($scope.data.ou, function (series) {
					angular.forEach(json, function (row) {
            //alert(row.level);
						if(row.level == series && row.period == pe){
							tempData[series] = row.value;
						}
					});
				});
				data.push(tempData);
			});
		}else{
			angular.forEach($scope.data.ou, function (ou) {
				var tempData = {};
				tempData['level'] = ou;
				angular.forEach($scope.data.pe, function (series) {
					angular.forEach(json, function (row) {
						if(row.period == series && row.level == ou){
							tempData[series] = row.value;
						}
					});
				});
				data.push(tempData);
			});
		}

		jsonData.push(data);

		return jsonData[0];
	}

	// Create chart
	$scope.createChart = function(jsonData, visContainer, visType, dis){
		var dataField;

    var pe = [];
    var ou = [];

    var series = [];
    var seriesGroup = [];
    if(dis == null || dis == undefined){
      dis = $scope.disaggregateBy;
    }
		if(dis == 'period'){
			dataField = "period";
      angular.forEach($scope.data.ou, function (series) {
  			var ser = {
  				type: visType,
  				series: [{
  					dataField: series,
  					displayText: series,
  				}]
  			}
  			seriesGroup.push(ser);
        });
		}else{
			dataField = "level";
      angular.forEach($scope.data.pe, function (series) {
  			var ser = {
  				type: visType,
  				series: [{
  					dataField: series,
  					displayText: series,
  				}]
  			}
  			seriesGroup.push(ser);
        });
      //seriesGroup.push({
			//	type: visType,
			//	series: [{dataField: 'value', displayText: jsonData[0].name }]
			//});
		}
		var showLabels = false;
		//var settings = $scope.chartSettings(jsonData[0], dataField, 'value', visType, showLabels);
    var settings = {
			title: jsonData[0].name,
			description: jsonData[0].program,
			enableAnimations: true,
			showLegend: true,
			padding: { left: 10, top: 5, right: 10, bottom: 5 },
			titlePadding: { left: 50, top: 0, right: 0, bottom: 10 },
			source: jsonData,
			xAxis:{
				dataField: dataField,
        type:'basic',

				//valuesOnTicks: true,
				unitInterval: 1,
        tickMarks: {visible: true,interval: 1,color: '#ececec'},
        gridLines:{visible: false,interval: 1,color: '#ececec'},
        axisSize: 'auto',
				labels: {
					angle: -45,
					rotationPoint: 'topright',
					offset: { x: 0, y: -25 }
				}
			},
			valueAxis:{
			   visible: true,
			   minValue: 0,
			   title: { text: 'Value' },
			   tickMarks: { color: '#BCBCBC' }
			},
			colorScheme: 'scheme04',
			seriesGroups:seriesGroup
		};
    //alert(JSON.stringify(settings,2,2));
		// setup the chart
        $('#'+visContainer).jqxChart(settings);
	}

	// Chart Settings
	$scope.chartSettings = function(source, xAxisDataField, valueAxisTitle, visType, showLabels){
		var label = null;
		if(showLabels == true){
			label = {visible: true, angle:0, padding: { left: 5, right: 5, top: 0, bottom: 0 }};
		}

		var seriesGroup = [];
		//angular.forEach($scope.data.chartSeries, function (series) {
			var series = {
				type: visType,
				series: [{
					dataField: 'value',
					displayText: source.name,
					opacity: 0.7,
					labels:label
				}],
				columnsGapPercent: 50,
				seriesGapPercent: 5
			}
			//seriesGroup.push(series);
      //});

		// Empty the chartSeries for other charts
		$scope.data.chartSeries = [];

		// prepare jqxChart settings
        var settings = {
            title: null,
            description: null,
            enableAnimations: true,
            showLegend: true,
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            source: source,
            colorScheme: 'scheme02',
            borderLineColor: '',
            xAxis:{
                dataField: xAxisDataField,
                unitInterval: 1,
                tickMarks: {visible: true,interval: 1,color: '#ececec'},
                gridLines:{visible: false,interval: 1,color: '#ececec'},
                axisSize: 'auto',
				labels: {angle:-45}

            },
            valueAxis:{
                visible: true,
                title: { text: valueAxisTitle },
                tickMarks: {color: '#ececec'},
                gridLines: {color: '#ececec'},
                axisSize: 'auto'
            },
            seriesGroups:[{
				          type: 'line',
				          series: [{dataField: 'value', displayText: source.name }]
			                 }]
        };
		return settings;
	}

	$scope.loadTable = function(jsonData,visContainer){
		if($scope.disaggregateBy == 'period'){
			var temp = '<table class="table"><tr><th>Data/Period</th>';
			angular.forEach($scope.data.pe, function(pe){
				temp += '<th>'+pe+'</th>';
			});
			temp += '</tr><tr>';
			var dataTitle= '';
			var dx = [];
			angular.forEach(jsonData, function (data){
				var d = data.data;
				angular.forEach(d, function (dataItem){
					angular.forEach(dataItem, function (d,i){
						if(i != 'pe'){
							if(dx.indexOf(i) == -1){
								dx.push(i);
							}
						}
					});
				});
			});

			angular.forEach(dx, function (dx){
				temp += '<td>'+dx+'</td>';
				angular.forEach(jsonData, function (data){
					var d = data.data;
					var dataRow = '';
					angular.forEach(d, function (dataItem,index){
						angular.forEach(dataItem, function (item,index){
							if(index == dx){
								temp += '<td>'+item+'</td>';
							}
						});
					});
					temp += '</tr>';
				});

			});
			temp += '</table>';
			var $template = $(temp);

			$('#'+visContainer).html($template);
			//$compile($template)($scope);

		}else{
			var tempx = '<table class="table"><tr><th>Data/OU</th>';
			angular.forEach($scope.data.ou, function(ou){
				tempx += '<th>'+ou+'</th>';
			});
			tempx += '</tr>';
			var dataTitle= '';
			var dx = [];
			angular.forEach(jsonData, function (data){
				var d = data.data;
				angular.forEach(d, function (dataItem){
					angular.forEach(dataItem, function (d,i){
						if(i != 'ou'){
							if(dx.indexOf(i) == -1){
								dx.push(i);
							}
						}
					});
				});
			});

			angular.forEach(dx, function (dx){
				tempx += '<tr><td>'+dx+'</td>';
				angular.forEach(jsonData, function (data){
					var d = data.data;
					var dataRow = '';
					angular.forEach(d, function (dataItem,index){
						angular.forEach(dataItem, function (item,index){
							if(index == dx){
								tempx += '<td>'+item+'</td>';
							}
						});
					});
					tempx += '</tr>';
				});
			});
			tempx += '</table>';
			var $template = $(tempx);
			$('#'+visContainer).html($template);
			//$compile($template)($scope);
		}
	}

	$scope.loadMap = function(jsonData, visContainer){

		var ouInfo = $scope.getOu().split(";");

		var ou = 'cCTQiGkKcTk'; //ouInfo[1];
		var ouLevel = 3;
		if(ou == 'cCTQiGkKcTk'){
			ouLevel = 1;
		}else{
			if($scope.level != ''){
				ouLevel = $scope.level;
			}
		}

		var url = $scope.baseUrl+'api/organisationUnits.geojson?parent='+ou+'&level='+ouLevel;

		var options = {
			url: url,
			mapContainer: visContainer,
			data: jsonData
		};

		if(dis != 'period'){
			$scope.tempOu = "";
			$scope.level = "";
			portalService.renderMap(options);
		}else{
			$("#"+visContainer).html("To load the map properly, switch the category and series.");
		}
	}

	$rootScope.drillDown = function(ouId, level, mapContainer){
		$scope.tempOu = ouId;
		$scope.level = parseInt(level) + 1;
		if($scope.level >= 5){
			$scope.level = 5;
		}
		$scope.run($scope.items[mapContainer]);
	}

	$rootScope.floatUp = function(ouId, level, mapContainer){
		var ouArr = ouId.split("/");
		$scope.tempOu = ouArr[parseInt(level)-2];
		$scope.level = parseInt(level) - 1;
		if($scope.level <= 2){
			$scope.level = 2;
		}
		$scope.run($scope.items[mapContainer]);
	}

	$rootScope.changeVisType = function(item, visType){
		$("#"+item).html("<img src='images/loading.gif' style='margin:15px;padding:10px;border:1px solid #efefef;border-radius:5px;'/>");
		$scope.items[item].visType = visType;

    // Run the application
		$scope.run($scope.items[item]);
	}

  // Switch between chart categories and series
  $rootScope.switchCatSeries = function(item, current){
    $("#"+item).html("<img src='images/loading.gif' style='margin:15px;padding:10px;border:1px solid #efefef;border-radius:5px;'/>");
    var dis;
    if(current == 'period'){
      dis = 'ou';
    }else{
      dis = 'period';
    }
    $scope.items[item].dis = dis;
    // Run the application
		$scope.run($scope.items[item]);
  }

	$scope.getOu = function(){
		if($scope.selectedOu == "national"){
      return 'national';
    }else if($scope.selectedOu == "province"){
      return 'province';
		}else{
      if($scope.palika == '' || $scope.palika == undefined){
        return $scope.selectedOu;
      }else{
        alert ($scope.palika);
        return $scope.palika;
      }
		}
	}

	// Update the charts based on the new selected parameters
	$rootScope.update = function(){
		$(".vis-container").html("<img src='images/loading.gif' style='margin:15px;padding:10px;border:1px solid #efefef;border-radius:5px;'/>");
		$rootScope.run();
	}

  $rootScope.run = function(item){
		console.log('Dashboard controller initialized.');

		//Get the current route information
		var route = $location.path().split('/')[1];
		// Get the portal items based on the current route
		$rootScope.items = $scope.portalItems[route];

		if(item == undefined || item == null){
			angular.forEach($scope.items, function (item) {
				var url = $scope.prepareUrl(item);
				$scope.visualizeData(url, item.id, item.visType);
			});
		}else{
			var url = $scope.prepareUrl(item);
			$scope.visualizeData(url, item.id, item.visType, item.dis);
		}
  };

	// Initialize the application
	$rootScope.run();
});
