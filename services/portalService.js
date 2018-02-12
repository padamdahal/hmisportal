var App = angular.module("hmisPortal");

App.service('portalService',function($http, $resource, $rootScope) {
	var self = this;
    this.periodType = 'year';
	var base;

  this.base = 'http://'+window.location.hostname+'/hmisportal/';
	this.map = "";
	this.tempMap = "";
	this.authenticated = false;

	this.renderMap = function(options){
		if(this.authenticateDHIS()){
			$http.get(options.url).success(function(geoFeatureData){
				var mapDiv = L.DomUtil.create('div', 'mapDiv');
				$("#"+options.mapContainer).append(mapDiv);

				this.tempMap = new L.map(mapDiv);
				//this.map = tempMap;

				this.tempMap.off();
				this.tempMap.remove();

				this.map = new L.map(mapDiv);
				this.map.setView([28.3, 84.3], 7);
				var geojson = L.geoJson(geoFeatureData, {
					style: {
						weight: 2,
						opacity: 1,
						color: 'black',
						dashArray: '1',
						fillOpacity: 0.6,
						fillColor: "#fff"
					},
					onEachFeature: function(feature, layer){
						layer.on({
							click: function(e){

							},
							mouseover:function(e){
								info.update(e.target.feature.properties.name, 'na');
							},
							contextmenu: function(e){
								$rootScope.floatUp(e.target.feature.properties.parentGraph, e.target.feature.properties.level,options.mapContainer);
							}
						});
					}
				}).addTo(this.map);

				// Plot data
				var dataValues = [];
				var obj = JSON.parse(JSON.stringify(options.data[0].data),function(key,value){
					if(key != 'ou' && typeof(value) != 'object'){
						dataValues.push(value);
					}

				});

				var max = Math.max.apply(Math, dataValues);
				var min = Math.min.apply(Math, dataValues);

				angular.forEach(options.data[0].data, function (dataItem,i) {
					angular.forEach(geoFeatureData.features, function (feature,index) {
						if(dataItem.ou == feature.properties.name){
							var f = L.geoJson(geoFeatureData.features[index], {
								style: {
									weight: 2,
									opacity: 1,
									color: 'black',
									dashArray: '1',
									fillOpacity: 1,
									fillColor: getColor(dataValues[i])
								},
								onEachFeature: function(feature, layer){
									layer.on({
										mouseover:function(e){
											info.update(e.target.feature.properties.name,dataValues[i]);
										},
										click: function(e){
											$rootScope.drillDown(e.target.feature.id,  e.target.feature.properties.level, options.mapContainer);
										},
										contextmenu: function(e){
											$rootScope.floatUp(e.target.feature.properties.parentGraph, e.target.feature.properties.level,options.mapContainer);
										}
									});
								}
							}).addTo(this.map);
						}

					});
				});
				this.map.fitBounds(geojson.getBounds(),{padding:[10,10]});

				var legend = L.control({position: 'bottomleft'});
				legend.onAdd = function (map) {
					var div = L.DomUtil.create('div', 'info legend');
					var labels = "<table style='font-size:10px;'><tr><td colspan='2'>Legend</td></tr>";
					var lb;
					var ub;
					ub = min-1;
					for (var i = 0; i < 5; i++) {
						lb = parseInt(ub + 1);
						ub = parseInt(lb + (parseInt(max - min)/5));
						labels += '<tr><td style="width:10px;background:' + getColor(parseInt((lb+ub)/2)) + '"></td><td style="padding-left:5px;text-align:left;">'+lb+'&ndash;' + ub+'</td></tr>';
					}
					div.innerHTML = labels+'</table>';
					return div;
				};
				legend.addTo(map);

				var info = L.control();
				info.onAdd = function (map) {
					this._div = L.DomUtil.create('div', 'info');
					this.update();
					return this._div;
				};
				info.update = function (featureName,value) {
					if(featureName == undefined || value == undefined){
						this._div.innerHTML = "";
					}else{
						this._div.innerHTML = "<div>"+featureName+" ("+value+") </div>";
					}
				};
				info.addTo(map);

				// End of Plot data
				function getColor(value){
					var color = ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A'];

					var diff = max - min;
					var rangeValue = parseInt(diff/5);

					var range = parseInt(value/rangeValue)-1;
					if(range > 4){
						range = 4;
					}
					if(range < 0){
						range = 0;
					}
					return color[range];
				}
			});
		}
		$("#"+options.mapContainer).html("");
	}
});
