/*
 * CREATE A NEW LEAFLET CONTROL FOR THE SCALE (used by distance grids)
 */

L.Control.GridScale = L.Control.extend({
	options: {
		position: 'bottomleft',
		gridType: 'distance',
		metric: true, // for the scale
		imperial: true, // for the scale
		showMetric: true, // true for metric, false for imperial
		updateWhenIdle: false,
		maxWidth: 100,
	},
	onAdd: function (map) {
		this._map = map;

		var mainContainer = L.DomUtil.create('div', '');
		var className = 'leaflet-control-scale',
		    container = L.DomUtil.create('div', className, mainContainer),
		    options = this.options;

		this._addScales(options, className, container);
		this._addDistanceLabel(options, mainContainer);

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
		map.whenReady(this._update, this);

		return mainContainer;
	},

	onRemove: function (map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
	},

	_addScales: function (options, className, container) {
		if (options.metric) {
			this._mScale = L.DomUtil.create('div', className + '-line', container);
		}
		if (options.imperial) {
			this._iScale = L.DomUtil.create('div', className + '-line', container);
		}
	},
	_addDistanceLabel: function(options, container){
		if (options.gridType == 'distance') {
			this._distLabel = L.DomUtil.create('div', '', container);
		}
	},

	_update: function () {
		var bounds = this._map.getBounds(),
		    centerLat = bounds.getCenter().lat,
		    halfWorldMeters = 6378137 * Math.PI * Math.cos(centerLat * Math.PI / 180),
		    dist = halfWorldMeters * (bounds.getNorthEast().lng - bounds.getSouthWest().lng) / 180,
		    options = this.options,
		    gridSize = this._gridSpacing(options),
		    size = this._map.getSize(),
		    maxMeters = 0;
		if (size.x > 0) {
			maxMeters = dist * (options.maxWidth / size.x);
		}

		if (gridSize) {
			this._updateDistance(gridSize);
		}

		this._updateScales(options, maxMeters);
	},

	_updateScales: function (options, maxMeters) {
		if (options.metric && maxMeters) {
			this._updateMetric(maxMeters);
		}

		if (options.imperial && maxMeters) {
			this._updateImperial(maxMeters);
		}
	},

	_updateDistance: function (gridSize) {	

		this._distLabel.innerHTML = 'Grid : ' + gridSize;
	},

	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters);

		this._mScale.style.width = this._getScaleWidth(meters / maxMeters) + 'px';
		this._mScale.innerHTML = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';
	},

	_updateImperial: function (maxMeters) {
		var maxFeet = maxMeters * 3.2808399,
		    scale = this._iScale,
		    maxMiles, miles, feet;

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280;
			miles = this._getRoundNum(maxMiles);

			scale.style.width = this._getScaleWidth(miles / maxMiles) + 'px';
			scale.innerHTML = miles + ' mi';

		} else {
			feet = this._getRoundNum(maxFeet);

			scale.style.width = this._getScaleWidth(feet / maxFeet) + 'px';
			scale.innerHTML = feet + ' ft';
		}
	},

	_getScaleWidth: function (ratio) {
		return Math.round(this.options.maxWidth * ratio) - 10;
	},

	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10;

		d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;

		return pow10 * d;
	}, 

	_gridSpacing: function (options) {
		var zoom = this._map.getZoom(); 
		var metricSpacing = [   
            "25,000 km", // 0 
            "10,000 km", // 1
            "5000 km", // 2
            "2500 km", // 3
            "1000 km", // 4
            "500 km", // 5
            "250 km", // 6
            "100 km", // 7
            "50 km", // 8
            "25 km", // 9
            "10 km", // 10
            "5 km", // 11
            "2.5 km", // 12
            "1 km", // 13
            "500 m", // 14
            "250 m", // 15
            "100 m", // 16
            "50 m", // 17
            "25 m", // 18
        ]; 
        var imperialSpacing = [
            "10000 mi", // 0
            "5000 mi", // 1
            "2500 mi", // 2
            "1000 mi", // 3
            "500 mi", // 4
            "250 mi", // 5
            "100 mi", // 6
            "50 mi", // 7
            "25 mi", // 8
            "10 mi", // 9
            "5 mi", // 10
            "2.5 mi", // 11
            "1 mi", // 12
            "2500 ft", // 13
            "1000 ft", // 14
            "500 ft", // 15
            "250 ft", // 16
            "100 ft ", // 17
            "50 ft", // 18
        ]; 
        if (options.gridType == 'distance'){
        	if(options.showMetric){
        		return metricSpacing[zoom];
        	}
        	if(!options.showMetric){
        		return imperialSpacing[zoom];
        	}
        }
	},
});

L.control.gridscale = function (options) {
	return new L.Control.GridScale(options);
};
