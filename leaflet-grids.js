/*
 *
 * Inspired by Leaflet.Grid: https://github.com/jieter/Leaflet.Grid
 */


L.Grids = L.LayerGroup.extend({
    options: {
        redraw: 'move',
        lineStyle: {
            stroke: true,
            color: '#111',
            opacity: 0.6,
            weight: 1,
            clickable: false
        },
        zoneStyle: {
                stroke: true,
                color: '#333',
                opacity: 0.6,
                weight: 4,
                clickable: false
        },
    },

    initialize: function (options) {
        L.LayerGroup.prototype.initialize.call(this);
        L.Util.setOptions(this, options);
    },


    onAdd: function (map) {
        this._map = map;
        var grid = this.redraw();
        this._map.on('viewreset ' + this.options.redraw, function () {
            grid.redraw();
        });
        this.eachLayer(map.addLayer, this);
    },

    redraw: function () {
        this._lngCoords = [],
        this._latCoords = [],
        this._gridLabels =  [],
        this._mapZoom = this._map.getZoom();
        this._bounds =  this._map.getBounds();//.pad(0.5);
        this._gridSize = this._gridSpacing();
        this.eachLayer(this.removeLayer, this);
        var gridLines = this._gridLines();
        for (i in gridLines){
            try {
            this.addLayer(gridLines[i]);
            }
            catch (err)
            {
                console.log(err);
                console.log("*******");
                console.log(gridLines[i]);
            }
                    }
 //       var labels = this._gridLabels();
        for (i in this._gridLabels) {
            this.addLayer(this._gridLabels[i]);
        }
        return this;
    },
    
    _gridSpacing: function () {
        var zoom = this._map.getZoom();
        if (zoom > 18) {zoom = 18}
        return this.options.coordinateGridSpacing[zoom];
    },
        
    _gridLines: function () {
        var lines = [];
        var labelPt, labelText
        var labelBounds = this._map.getBounds().pad(-0.025);
        var labelNorth = labelBounds.getNorth();
        var labelWest = labelBounds.getWest();
        var latCoord = this._snap(this._bounds.getSouth());
        var northBound = this._bounds.getNorth();
        while (latCoord < northBound) {
            lines.push(this._horizontalLine(latCoord));
            labelPt = L.latLng(latCoord, labelWest) 
            labelText = this._labelFormat(latCoord, 'lat');
            this._gridLabels.push(this._label(labelPt, labelText,'lat'));
            latCoord += this._gridSize;
        }
        var lngCoord = this._snap(this._bounds.getWest());
        var eastBound = this._bounds.getEast();
        while (lngCoord < eastBound) {
            lines.push(this._verticalLine(lngCoord));
            labelPt = L.latLng(labelNorth, lngCoord) 
            labelText = this._labelFormat(lngCoord, 'lng');
            this._gridLabels.push(this._label(labelPt, labelText, 'lng'));
            lngCoord += this._gridSize;
        }
        return lines;
                },

    _snap: function (num) {
        return Math.floor(num / this._gridSize) * this._gridSize;
    },

    _snapTo: function (num, snap) {
        return Math.floor(num / snap) * snap;
    },

    _verticalLine: function (lng, options) {
        var upLimit = options.upLimit ? options.upLimit : this._bounds.getNorth();
        var downLimit = options.downLimit ? options.downLimit : this._bounds.getSouth();
        return L.polyline([
                [upLimit, lng],
                [downLimit, lng]
            ], options.style ? options.style : this.options.lineStyle);
    },

    _horizontalLine: function (lat, options) {
        return L.polyline([
                [lat, this._bounds.getWest()],
                [lat, this._bounds.getEast()]
            ], options ? options : this.options.lineStyle);
    },
    _label: function (latLng, labelText, cssClass) {
        return L.marker(latLng, {
                icon: L.divIcon({
                    iconSize: [100, 20],
                    className: 'leaflet-grids-label',
                    //html: '<div class="' + axis + '">' + this.formatCoord(num, axis) + '</div>'
                    html: '<div class="grid-label ' + cssClass + '">' + labelText+ '</div>'
                })
        });
    }

});

L.grids = {};



/*
  DECIMAL DEGREE GRIDS
 */
L.Grids.DD = L.Grids.extend({
    options: {
        coordinateGridSpacing: [
            20.0, // 0
            20.0, // 1
            20.0, // 2
            10.0, // 3
            5.0, // 4
            5.0, // 5
            2.0, // 6
            1.0, // 7
            1.0, // 8
            0.5, // 9
            0.25, // 10
            0.10, // 11
            0.05, // 12
            0.05, // 13
            0.01, // 14
            0.01, // 15
            0.01, // 16
            0.01, // 17
            0.01, // 18
        ],
    },
    _labelFormat: function (coord, dir) {
        var zoom = this._map.getZoom();

        if ( zoom <= 8 ) {
            return coord.toFixed(0);
        } else if ( zoom == 9 ){
                return coord.toFixed(1);
        } else if ( zoom == 11 ){
            return coord.toFixed(1);
        } else {
            return coord.toFixed(2);
        }
    }


});

L.grids.dd = function (options) {
    return new L.Grids.DD(options);
};


/*
  DEGREE-MINUTE-SECONDS GRIDS
 */

L.Grids.DMS = L.Grids.extend({
    options: {
        coordinateGridSpacing: [
            20.0, // 0
            20.0, // 1
            20.0, // 2
            10.0, // 3
            5.0, // 4
            5.0, // 5
            2.0, // 6
            1.0, // 7
            1.0, // 8
            0.5, // 9
            0.25, // 10
            (1.0 / 60.0) * 5.0, // 11
            (1.0 / 60.0) * 3.0, // 12
            (1.0 / 60.0) * 2.0, // 13
            (1.0 / 60.0), // 14
            (1.0 / 120.0), // 15
            (1.0 / 120.0), // 16
            (1.0 / 240.0), // 17
            (1.0 / 240.0), // 18
        ],
    },
        _labelFormat: function (coord, dir) {
            var dirLabel = "";
            if ( dir == "lat" ) {
                if ( coord > 0 ) {
                    dirLabel = "N";
                } else if ( coord < 0 ) {
                    dirLabel = "S";
                }
            }
            if ( dir == "lng" ) {
                if ( coord > 0 ) {
                    dirLabel = "E";
                } else if ( coord < 0 ) {
                    dirLabel = "W";
                }
            }

            var deg = Math.floor(coord);
            var min = Math.floor(( coord - deg ) * 60);
            var sec = Math.floor((coord - deg - (min/60)) * 3600);
            var label = Math.abs(deg) + "&deg;"
            var zoom = map.getZoom();
            if ( zoom > 8) {
                label += " " + min + "'";
            }
            if ( zoom > 14 ) {
                label += " " + sec + '"';
            }
            return label + " " + dirLabel;
        }

});

L.grids.dms = function (options) {
    return new L.Grids.DMS(options);
};

/* 
 * Mercator grid base class
 * shared by UTM and MGRS
 */

L.Grids.Mercator = L.Grids.extend({

    _cleanHorz: function (line, leftLng, rightLng) {
       var pts = line.getLatLngs(); 
       var options = line.options;
       var cleanLine;
       var pt1 = pts[0];
       var pt2 = pts[pts.length-1];
       var slope = (pt1.lat-pt2.lat)/(pt1.lng-pt2.lng);
       // Right side
       var newRightLat = pt1.lat - (slope * (leftLng - pt2.lng));
       var newPt2 = L.latLng(newRightLat,rightLng);
       // Left side
       var newLeftLat = pt2.lat + (slope * (pt1.lng - rightLng));
       var newPt1 = L.latLng(newLeftLat,leftLng);

       var cleanLine = L.polyline([newPt1, newPt2], options);

       return cleanLine;
    },

    _cleanVert: function (line, leftLng, rightLng) {
       var pts = line.getLatLngs(); 
       var options = line.options;
       var pt1 = pts[0];
       var pt2 = pts[pts.length-1];
       var slope = (pt1.lat-pt2.lat)/(pt1.lng-pt2.lng);
       if ( pt2.lng > rightLng) {
           var newLat = pt1.lat + (slope * (rightLng - pt1.lng));
           pt2 = L.latLng(newLat,rightLng);
       } 
       if ( pt2.lng < leftLng) {
           var newLat = pt1.lat + (slope * (leftLng - pt1.lng));
           pt2 = L.latLng(newLat,leftLng);
       } 
       return L.polyline([pt1, pt2], options);
    },

    /* find the intersection of two lines
     * uses the first and last point only!
     * based on line equations
     */    

    _line_intersect: function(line1, line2) {
        // Get the first and last point of the two given segments
        var line1Pts = line1.getLatLngs();
        var line2Pts = line2.getLatLngs();
        var pt1 = line1Pts[0];
        var pt2 = line1Pts[line1Pts.length - 1];
        var pt3 = line2Pts[0];
        var pt4 = line2Pts[line2Pts.length - 1];
        var x1 = pt1.lng;
        var y1 = pt1.lat;
        var x2 = pt2.lng;
        var y2 = pt2.lat;
        var x3 = pt3.lng;
        var y3 = pt3.lat;
        var x4 = pt4.lng;
        var y4 = pt4.lat;

        // Lines equation 
        var slope1 = (y2-y1)/(x2-x1); 
        var b1 = y1 - slope1*x1;
        var slope2 = (y4-y3)/(x4-x3); 
        var b2 = y3 - slope2*x3;

        // Intersection point of 2 lines
        if (slope1 != slope2){
            var x = (b2-b1)/(slope1-slope2);
        }else{
            return false; // Lines are parallels
        }

        var y = slope1 * x + b1; 

        // line1 and line2 are segments not lines so :
        // (x,y) must belong to the x-domain and y-domain of the two segments
        if (x > Math.min(x1,x2) && x < Math.max(x1,x2) && x > Math.min(x3,x4) && x < Math.max(x3,x4)){
            return L.latLng(y,x);
        }else{
            return false; // segments do not intersect
        }
    },


    _lineTrim: function(line, left, right) {
                   try{
        var newPt;
        var done = false;
        var leftBound = L.polyline([L.latLng(-90, left), L.latLng(90, left)]);
        var rightBound = L.polyline([L.latLng(-90, right), L.latLng(90, right)]);
        trimmed = [];
        for (var k = 0; k < line.length - 1; k++) {
            var l = line[k];
            var r = line[k+1];
            if (l.lon > left && r.lon < right) {
                //segment doesn't need trimming
                trimmed.push(l);
                continue;
            }
            var segment = L.polyline([l,r]);
            if (l.lon < left && r.lon > left) {
               if ( left % 6 == 0 ) {
                   newPt = this._line_intersect(segment, leftBound);
                   trimmed.push(newPt);
                   continue;
               } else {
                   // off screen, don't bother trimming
                   trimmed.push(l);
                   continue;
               }
            }
            if (l.lon < right && r.lon > right) {
               if ( right % 6 == 0 ) {
                   newPt = this._line_intersect(segment, rightBound);
                   trimmed.push(l)
                   trimmed.push(newPt);
                   done = true;
                   break;
               } else {
                   // off screen, don't bother trimming
                   trimmed.push(l)
                   trimmed.push(r)
                   continue;
               }
            }
            // edge case for vertical lines that lean left
            if (r.lon < left && l.lon > left) {
               if ( left % 6 == 0 ) {
                   newPt = this._line_intersect(segment, leftBound);
                   console.log("trim");
                   trimmed.push(l)
                   trimmed.push(newPt);
                   done = true;
                   break;
               } else {
                   // off screen, don't bother trimming
                   trimmed.push(l);
                   trimmed.push(r);
                   console.log(r);
                   continue;
               }
            }
            // don't need to test for segments outside the boundaries
        }
        // draw the last point if the line isn't trimmed 
        if ( !done ) {
            if (r.lon > left) {
                trimmed.push(r);
            }else{
                newPt = this._line_intersect(segment, leftBound);
                trimmed.push(newPt);
            }
        }
        return trimmed;
               }
catch(err){
    console.log("TRIM ERROR");
    console.log (err);
    console.log(line, left, right);
    console.log(leftBound, rightBound);
    return line;
}
    }



});

/*
  UTM GRIDS
 */

L.Grids.UTM = L.Grids.Mercator.extend({
    options: {
        coordinateGridSpacing: [
            1000000, // 0
            1000000, // 1
            1000000, // 2
            1000000, // 3
            1000000, // 4
            1000000, // 5
            1000000, // 6
            100000, // 7
            100000, // 8
            100000, // 9
            10000, // 10
            10000, // 11
            10000, // 12
            10000, // 13
            1000, // 14
            1000, // 15
            1000, // 16
            1000, // 17
            100, // 18
        ]
    },
// This is very similar to MGRS grids except for the labels so some of this
// might be able to be moved to base class for both

    _gridLines: function () {
        var lines = [];
        console.log("ZOOM" + this._mapZoom);

        // 6 deg wide grid-zone lines

        var northBound = this._bounds.getNorth();
        var southBound = this._bounds.getSouth();
        var eastBound = this._bounds.getEast();
        var westBound = this._bounds.getWest();
        var mapBounds = this._map.getBounds();
        var labelBounds = mapBounds.pad(-0.025);
        var northLabel = labelBounds.getNorth();
        var westLabel = labelBounds.getWest();
        var zoneBreaks = [];
        var zoneBreaks = [westBound];
        var lngCoord = this._snapTo(westBound, 6.0) + 6.0;
        while (lngCoord < eastBound ) {
            zoneBreaks.push(lngCoord);
            labelPt = L.latLng(northLabel, lngCoord);
            labelUTM = mgrs.LLtoUTM({lat: labelPt.lat, lon: labelPt.lng + .1});
            labelText = "Zone " + labelUTM.zoneNumber;
            this._gridLabels.push(this._label(labelPt, labelText, 'lng'));
            lngCoord += 6.0;
        }
        zoneBreaks.push(eastBound);
        console.log("BREAKS: ", zoneBreaks);

        for (var i=1; i < zoneBreaks.length-1; i++ ) {
            lines.push(this._verticalLine(zoneBreaks[i], this.options.zoneStyle));
        }
        for (i in this._latCoords) {
            lines.push(this._horizontalLine(this._latCoords[i], this.options.zoneStyle));
        }
        // show just the zone boundaries if zoomed out too far
        // 8 degrees works well visually
        if ( Math.abs(mapBounds.getWest() - mapBounds.getEast()) > 8 ) {
            return lines;
        };
        this._gridLabels = [];

        // utm grids for all other zooms
        var lngLabelLine = L.polyline([labelBounds.getNorthWest(), labelBounds.getNorthEast()]);
        var latLabelLine = L.polyline([labelBounds.getNorthWest(), labelBounds.getSouthWest()]);
        var gridSize = this._gridSize;
        var fFactor = .000001; // keeps calculations at zone boundaries inside the zone
        var labelsDrawn = false;
        var labelsInRange = false;
        var gridLine;
        for (var i=0; i < zoneBreaks.length-1; i++) {
            // are the labels on screen
            var northWestLL = L.latLng( northBound, zoneBreaks[i] + fFactor );
            var southEastLL = L.latLng( southBound, zoneBreaks[i+1] - fFactor );
            if (northWestLL.lng < westLabel && southEastLL.lng > westLabel ) {
                labelsInRange = true;
            }
            var centerLL = L.latLngBounds(northWestLL,southEastLL).getCenter();
            var center = mgrs.LLtoUTM({lon:centerLL.lng, lat:centerLL.lat});
            var southEast = mgrs.LLtoUTM({lon:southEastLL.lng, lat:southEastLL.lat});
            var northWest = mgrs.LLtoUTM({lon:northWestLL.lng, lat:northWestLL.lat});

            // build point array
            //
            var latStart = this._snap(southEast.northing);
            var latStop = this._snap(northWest.northing) + gridSize;
            var latCount = ((latStop - latStart) / gridSize) + 1;
            var lonStart = this._snap(northWest.easting) - gridSize;
            var lonStop = this._snap(southEast.easting) + gridSize;
            var lonCount = ((lonStop - lonStart) / gridSize) + 1;
            

            var utmPoints = new Array(latCount);
            for ( var j = 0; j < latCount; j++ ) {
                utmPoints[j] = new Array(lonCount);
            }
            
            
            var llPoints = new Array(latCount);
            for ( var j = 0; j < latCount; j++ ) {
                llPoints[j] = new Array(lonCount);
            }

            // draw horizontal lines and labels
            var latCoord = latStart;
            var latIndex = 0;

            while (latCoord <= latStop) {
                var lonCoord = lonStart;
                var lonIndex = 0;
                while (lonCoord <= lonStop){
                    var utmPoint = {
                        northing: latCoord,
                        easting: lonCoord,
                        zoneLetter: center.zoneLetter,
                        zoneNumber: center.zoneNumber
                    };
                    utmPoints[latIndex][lonIndex] = utmPoint;
                    llPoints[latIndex][lonIndex] =  mgrs.UTMtoLL(utmPoint);
                    lonIndex ++;
                    lonCoord += gridSize;
                }
                latIndex ++;
                latCoord += gridSize;
            }
            for ( var l = 0; l < latCount; l++) {
                var linePts = this._lineTrim(llPoints[l], zoneBreaks[i], zoneBreaks[i+1]);
                var pline = L.polyline(linePts, this.options.lineStyle);
                lines.push(pline);
            }

            
            for ( var l = 0; l < lonCount; l++) {
                var linePts = this._lineTrim(arrayColumn(llPoints, l), zoneBreaks[i], zoneBreaks[i+1]);
                var pline = L.polyline(linePts, this.options.lineStyle);
                lines.push(pline);
            }
            // draw longitude labels
            
            // a rough label buffer - 111111m is approx 1 degree
            // don't draw a label with 1/4 of the grid spacing to a zone
            // boundary
            // TODO: the fractional amount needs to change based on zoom though.
            var labelBuffer = gridSize/111111/4;

            for ( var k=0; k < llPoints.length; k++ ) {
                if ( llPoints[k][0].lat > northLabel ) {
                    for ( var m=0; m < llPoints[k].length; m++ ) {
                        labelPt = L.latLng(northLabel, llPoints[k][m].lon);
                        if ( labelPt && labelPt.lng > zoneBreaks[i] + labelBuffer && 
                            labelPt.lng < zoneBreaks[i+1] - labelBuffer) {
                                labelText = utmPoints[k][m].easting;
                                this._gridLabels.push(this._label(labelPt, labelText, 'lat'));
                        }
                    }
                    break;
                }
            }


        

            /*
            while (latCoord < northWest.northing ) {
                latCoord += gridSize;
                var leftPointUTM = {
                    northing: latCoord,
                    easting: northWest.easting,
                    zoneLetter: center.zoneLetter,
                    zoneNumber: center.zoneNumber
                };
                var leftPointLL = mgrs.UTMtoLL(leftPointUTM);
                var rightPointUTM = {
                    northing: latCoord,
                    easting: southEast.easting,
                    zoneLetter:center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var rightPointLL = mgrs.UTMtoLL(rightPointUTM);
                gridLine =  this._cleanHorz(L.polyline([leftPointLL,rightPointLL], this.options.lineStyle), zoneBreaks[i],zoneBreaks[i+1]);
                lines.push(gridLine);
                if ( labelsInRange & !labelsDrawn) {
                    labelPt = this._line_intersect(gridLine, latLabelLine);
                    labelUTM = mgrs.LLtoUTM({lat: labelPt.lat, lon: labelPt.lng });
                    labelText = latCoord;
                    this._gridLabels.push(this._label(labelPt, labelText, 'lat'));
                }
            }
            if ( this._gridLabels.length > 0 ) {
                labelsDrawn = true;
            }

            // draw vertical lines and labels

            // a rough label buffer - 111111m is approx 1 degree
            // don't draw a label with 1/4 of the grid spacing to a zone
            // boundary
            // TODO: the fractional amount needs to change based on zoom though.

            var labelBuffer = gridSize/111111/4;

            var lonCoord = this._snap(northWest.easting - gridSize);
            while (lonCoord < southEast.easting){
                lonCoord += gridSize;
                var bottomPointUTM = {
                    northing: southEast.northing,
                    easting: lonCoord,
                    zoneLetter: center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var bottomPointLL = mgrs.UTMtoLL(bottomPointUTM);
                
                var topPointUTM = {
                    northing: northWest.northing,
                    easting: lonCoord,
                    zoneLetter:center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var topPointLL = mgrs.UTMtoLL(topPointUTM);
                gridLine = this._cleanVert(L.polyline([bottomPointLL,topPointLL], this.options.lineStyle), zoneBreaks[i], zoneBreaks[i+1]);
                lines.push(gridLine);
                labelPt = this._line_intersect(gridLine, lngLabelLine);
                if ( labelPt && labelPt.lng > zoneBreaks[i] + labelBuffer && 
                    labelPt.lng < zoneBreaks[i+1] - labelBuffer) {
                        labelUTM = mgrs.LLtoUTM({lat: labelPt.lat, lon: labelPt.lng });
                        hemisphere = (labelPt.lat > 0) ? "N" : "S";
                        labelText = center.zoneNumber + hemisphere + " " + lonCoord;
                        this._gridLabels.push(this._label(labelPt, labelText, 'lng'));
                }
            }
            */
        }
        return lines;

    }
});

L.grids.utm = function (options) {
    return new L.Grids.UTM(options);
};

/*
  MILITARY GRID REFERENCE SYSTEM GRIDS
 */

L.Grids.MGRS = L.Grids.Mercator.extend({
    options: {
             },
    _gridSpacing: function () {
        if ( this._mapZoom < 10 ) {
            return 100000;
        };
        if ( this._mapZoom < 15 ) {
            return 10000;
        };
        if ( this._mapZoom < 18 ) {
            return 1000;
        };
        if ( this._mapZoom <= 20 ) {
            return 100;
        };
        return NaN;
    },
    // TO DO: Maybe group with _gridSpacing if same limit values
    _MGRSAccuracy: function () {
        if ( this._mapZoom < 10 ) {
            return 0;
        };
        if ( this._mapZoom < 15 ) {
            return 1;
        };
        if ( this._mapZoom < 18 )  {
            return 2;
        };
        if ( this._mapZoom <= 20 )  {
            return 3;
        };
        return NaN;
    },
    _gridLines: function () {
        /*
        * THIS FIRST CODE PORTION IS RESPONSIBLE FOR DRAWING 6 x 8 GRID-ZONE LINES + RESPECTIVE LABELS
        */
        // No grid for lowest map zoom
        if (this._mapZoom < 3){
        	return null;
        }
        var lines = [];
        this._bounds =  this._map.getBounds().pad(0.5); // Adding 1/2 of the current view in each direction
        var latCoord = this._snapTo(this._bounds.getSouth(), 8.0);
        if (latCoord < -80.0){
            latCoord = -80.0;
        }

        var northBound = this._bounds.getNorth();
        var southBound = this._bounds.getSouth();
        var eastBound = this._bounds.getEast();
        var westBound = this._bounds.getWest();

        var longMGRS = [];
        var latMGRS = [];

        while (latCoord < northBound && latCoord <= 84) {
            this._latCoords.push(latCoord);
            if(latCoord==72.0){
                latMGRS.push(latCoord + 6.0);
                latCoord += 12.0; // Zone X is "higher" than the rest
            }else{
                latMGRS.push(latCoord + 4.0);
                latCoord += 8.0;
            }
        }
        var zoneBreaks = [];
        var zoneBreaks = [westBound];
        var lngCoord = this._snapTo(westBound, 6.0) + 6.0;
        while (lngCoord < eastBound ) {
            zoneBreaks.push(lngCoord);
            lngCoord += 6.0;
        }
        zoneBreaks.push(eastBound);

        var options = {
            style: this.options.zoneStyle,
            upLimit: null,
            downLimit: -80.0,
        }
        for (var i=1; i < zoneBreaks.length-1; i++ ) {
            // Region of the world with no vertical grid exception
            if (zoneBreaks[i] <= 0.0 || zoneBreaks[i] >= 42.0){ 
                options.upLimit = 84;
                lines.push(this._verticalLine(zoneBreaks[i], options));
                longMGRS.push(zoneBreaks[i-1]+3);
            // Region to make Norway & Svagard happy
            }else{
                options.upLimit = 56;
                lines.push(this._verticalLine(zoneBreaks[i], options));

            }
        }

        var superThis = this;
        var labelPt;
        var handleSpecialZones = function(longArray, options){
            var centerLat = options.downLimit + Math.abs(options.upLimit - options.downLimit)/2.0;
            for (i in longArray){
                lines.push(superThis._verticalLine(longArray[i], options));
                previous = longArray[i-1] ? longArray[i-1] : 0.0;
                labelPt = L.latLng(centerLat, previous+((longArray[i]-previous)/2.0));
                gridLabel = mgrs.LLtoUTM({lat:labelPt.lat,lon:labelPt.lng});
                superThis._gridLabels.push(superThis._label(labelPt, gridLabel.zoneNumber + gridLabel.zoneLetter));
            }
        }

        // For Norway special case
        var longArray = [3.0, 12.0, 18.0, 24.0, 30.0, 36.0];
        options.upLimit = 64.0; 
        options.downLimit = 56.0;
        handleSpecialZones(longArray, options);

        // For Svagard special case 
        longArray = [9.0, 21.0, 33.0]; 
        options.upLimit = 84.0; 
        options.downLimit = 72.0; 
        handleSpecialZones(longArray, options);
        
        // For the zone in between 
        longArray = [6.0, 12.0, 18.0, 24.0, 30.0, 36.0]; 
        options.upLimit = 72.0; 
        options.downLimit = 64.0; 
        handleSpecialZones(longArray, options);

        var previousLat, 
            previousLong;
        for (i in this._latCoords) {
            lines.push(this._horizontalLine(this._latCoords[i], this.options.zoneStyle));
            // For the zone below the irregularity zone
            if(this._latCoords[i] <= 56.0 && this._latCoords[i] > -80.0){
                for (j in longArray) {
                    if(this._latCoords[i-1] === 0){
                        previousLat = 0; 
                    }else{
                        previousLat = this._latCoords[i-1] ? this._latCoords[i-1] : -80.0;
                    }
                    centerLat = previousLat + Math.abs(this._latCoords[i]-previousLat)/2.0;
                    previousLong = longArray[j-1] ? longArray[j-1] : 0.0;
                    labelPt = L.latLng(centerLat, previousLong+((longArray[j]-previousLong)/2.0));
                    gridLabel = mgrs.LLtoUTM({lat:labelPt.lat,lon:labelPt.lng});
                    this._gridLabels.push(this._label(labelPt, gridLabel.zoneNumber + gridLabel.zoneLetter));
                }
            }
        }

        var mapBounds = map.getBounds(); // show just the zone boundaries if zoomed out too far
        if ( Math.abs(mapBounds.getWest() - mapBounds.getEast()) > 8 ) {
            for(var u=0;u<longMGRS.length-1;u++){
                for(var v=0;v<latMGRS.length-1;v++){
                    labelPt = L.latLng(latMGRS[v],longMGRS[u]);
                    gridLabel = mgrs.LLtoUTM({lat:labelPt.lat,lon:labelPt.lng});
                    this._gridLabels.push(this._label(labelPt, gridLabel.zoneNumber + gridLabel.zoneLetter));
                }
            }
            return lines;
        };

        /*
        * THIS SECOND CODE PORTION USES UTM GRID-ZONE LINES + RESPECTIVE LABELS
        */
        var gridSize = this._gridSize; // depends on the zoom level
        var fFactor = .000001; // keeps calculations at zone boundaries inside the zone
        this._bounds =  this._map.getBounds().pad(0.1); // Adding 1/10 of the current view in each direction

        // Invisible gridLines for labels positionning
        var horzLines = [];
        var vertLines = [];
        var drawnFlag = false;

        // Empty the labels list
        this._gridLabels = [];

        for (var i=0; i < zoneBreaks.length-1; i++) {
            // Map corners and center
            var northWestLL = L.latLng( northBound, zoneBreaks[i] + fFactor );
            var southEastLL = L.latLng( southBound, zoneBreaks[i+1] - fFactor );
            var centerLL = L.latLngBounds(northWestLL,southEastLL).getCenter();
            var center = mgrs.LLtoUTM({lon:centerLL.lng, lat:centerLL.lat});
            var southEast = mgrs.LLtoUTM({lon:southEastLL.lng, lat:southEastLL.lat});
            var northWest = mgrs.LLtoUTM({lon:northWestLL.lng, lat:northWestLL.lat});

            var latCoord = this._snap(southEast.northing);
            console.log(northWestLL, southEastLL);
            // draw "horizontal" lines + labels horizontal positionning
            while (latCoord < northWest.northing) {
                var leftPointUTM = {
                    northing: latCoord,
                    easting: northWest.easting,
                    zoneLetter: center.zoneLetter,
                    zoneNumber: center.zoneNumber
                };
                var leftPointLL = mgrs.UTMtoLL(leftPointUTM);
                leftPointUTM.northing += gridSize/2; 
                var leftPointLabel = mgrs.UTMtoLL(leftPointUTM);

                var rightPointUTM = {
                    northing: latCoord,
                    easting: southEast.easting,
                    zoneLetter:center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var rightPointLL = mgrs.UTMtoLL(rightPointUTM);
                rightPointUTM.northing += gridSize/2; 
                var rightPointLabel = mgrs.UTMtoLL(rightPointUTM);
 
                lines.push(this._cleanHorz(L.polyline([leftPointLL,rightPointLL], this.options.lineStyle), zoneBreaks[i], zoneBreaks[i+1]));
                horzLines.push(this._cleanHorz(L.polyline([leftPointLabel,rightPointLabel], this.options.lineStyle), zoneBreaks[i], zoneBreaks[i+1]));
                latCoord += gridSize;
            }
            // draw "vertical" lines + labels vertical positionning
            var lonCoord = this._snap(northWest.easting - gridSize);
            console.log('Start point : ' + lonCoord);
            console.log('Until : ' + southEast.easting);
            while (lonCoord < southEast.easting){
            	console.log(lonCoord);
                var bottomPointUTM = {
                    northing: southEast.northing,
                    easting: lonCoord,
                    zoneLetter: center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var bottomPointLL = mgrs.UTMtoLL(bottomPointUTM);
                bottomPointUTM.easting += gridSize/2;
                bottomPointLabel = mgrs.UTMtoLL(bottomPointUTM);

                var topPointUTM = {
                    northing: northWest.northing,
                    easting: lonCoord,
                    zoneLetter:center.zoneLetter,
                    zoneNumber:center.zoneNumber
                };
                var topPointLL = mgrs.UTMtoLL(topPointUTM);
                topPointUTM.easting += gridSize/2;
                topPointLabel = mgrs.UTMtoLL(topPointUTM);

                lines.push(this._cleanVert(L.polyline([bottomPointLL,topPointLL], this.options.lineStyle), zoneBreaks[i], zoneBreaks[i+1]));
                vertLines.push(this._cleanVert(L.polyline([bottomPointLabel,topPointLabel], this.options.lineStyle), zoneBreaks[i], zoneBreaks[i+1]));
                lonCoord += gridSize;
            }
        }

        //Display the labels centered in each zone
        var labelPt;
        var h =0;
        for (x in horzLines){
            for (y in vertLines){
                labelPt = this._line_intersect(horzLines[x], vertLines[y]);
                gridLabel = mgrs.LLtoMGRS([labelPt.lng, labelPt.lat], this._MGRSAccuracy());
                if(this._bounds.contains(labelPt)){
                    this._gridLabels.push(this._label(labelPt, gridLabel));
                }        
            }
        }
        return lines;
    }

});

L.grids.mgrs = function (options) {
    return new L.Grids.MGRS(options);
};


/*
  DISTANCE GRIDS
 */

L.Grids.Distance = L.Grids.extend({

    _gridSpacing: function() {
        var zoom = this._map.getZoom();
        var lat = this._map.getCenter().lat;
        if (Math.abs(lat) > 55) {zoom += 1;}
        if (zoom > 18) {zoom = 18;}
        this.gridLabel = this.options.gridSpacingLabel[zoom];
        return this.options.coordinateGridSpacing[zoom];
    },

    _gridLines: function () {
        var lines = [];
        var zoom = this._map.getZoom();
        var metersAtEquator = metersPerPixel(0, zoom);
        var metersAtLat = metersPerPixel(this._map.getCenter().lat, zoom);
        var gridSize = this._gridSize * metersAtEquator / metersAtLat;
        console.log(this.gridLabel);
        var latCoord = LLtoSM(this._map.getCenter()).y;
        var latCoordUp = latCoord;
        var latCoordDown = latCoord;
        var eastBound = LLtoSM(this._bounds.getSouthEast()).x;
        var westBound = LLtoSM(this._bounds.getSouthWest()).x;
        var northBound = LLtoSM(this._bounds.getNorthWest()).y;
        var southBound = LLtoSM(this._bounds.getSouthWest()).y;
        // draw center horizontal line
        var leftPointCenter = SMtoLL(L.point(westBound,latCoord));
        var rightPointCenter = SMtoLL(L.point(eastBound,latCoord));
        lines.push( L.polyline([leftPointCenter,rightPointCenter], this.options.lineStyle));
        // draw horizontal lines from center out
        while (latCoordUp < northBound) {
            latCoordUp += gridSize;
            latCoordDown -= gridSize;
            var latCoords = [latCoordUp, latCoordDown];
            for ( var i = 0; i < 2; i++) {
                var leftPoint = SMtoLL(L.point(westBound,latCoords[i]));
                var rightPoint = SMtoLL(L.point(eastBound,latCoords[i]));
                lines.push( L.polyline([leftPoint,rightPoint], this.options.lineStyle));
            }
        }
        // draw center vertical line
        var lngCoord = LLtoSM(this._bounds.getCenter()).x;
        var lngCoordRight = lngCoord;
        var lngCoordLeft = lngCoord;
        var topPointCenter = SMtoLL(L.point(lngCoord,northBound));
        var bottomPointCenter = SMtoLL(L.point(lngCoord,southBound));
        lines.push(L.polyline([topPointCenter,bottomPointCenter], this.options.lineStyle));
        // draw vertical lines from center out
        while (lngCoordRight < eastBound) {
            lngCoordRight += gridSize;
            lngCoordLeft -= gridSize;
            var lngCoords = [lngCoordLeft, lngCoordRight];
            for ( var i = 0; i < 2; i++ ) {
                var topPoint = SMtoLL(L.point(lngCoords[i], northBound));
                var bottomPoint = SMtoLL(L.point(lngCoords[i], southBound));
                lines.push(L.polyline([topPoint, bottomPoint], this.options.lineStyle));
            }
        }
        return lines;
                },


});

L.grids.distance = {};

L.Grids.Distance.Metric = L.Grids.Distance.extend({
    options: {
        coordinateGridSpacing: [
            25000000, // 0
            10000000, // 1
            5000000, // 2
            2500000, // 3
            1000000, // 4
            500000, // 5
            250000, // 6
            100000, // 7
            50000, // 8
            25000, // 9
            10000, // 10
            5000, // 11
            2500, // 12
            1000, // 13
            500, // 14
            250, // 15
            100, // 16
            50, // 17
            25 // 18
            ],
        gridSpacingLabel: [
            "250,000 km", // 0 
            "100,000 km", // 1
            "50,000 km", // 2
            "25,000 km", // 3
            "10,000 km", // 4
            "5000 km", // 5
            "2500 km", // 6
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
            "10 m", // 18
             ]

        },
});

L.grids.distance.metric = function (options) {
    return new L.Grids.Distance.Metric(options);
};


L.Grids.Distance.Imperial = L.Grids.Distance.extend({
    options: {
        coordinateGridSpacing: [
            10000*5280/3.28, // 0
            5000*5280/3.28, // 1
            2500*5280/3.28, // 2
            1000*5280/3.28, // 3
            500*5280/3.28, // 4
            250*5280/3.28, // 5
            100*5280/3.28, // 6
            50*5280/3.28, // 7
            25*5280/3.28, // 8
            10*5280/3.28, // 9
            5*5280/3.28, // 10
            2.5*5280/3.28, // 11
            1*5280/3.28, // 12
            2500/3.28, // 13
            1000/3.28, // 14
            500/3.28, // 15
            250/3.28, // 16
            100/3.28, // 17
            50/3.28 // 18
            ],
        gridSpacingLabel: [
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
             ]
        }

});

L.grids.distance.imperial = function (options) {
    return new L.Grids.Distance.Imperial(options);
};

// per  http://stackoverflow.com/questions/17664327/leaflet-panto-web-mercator-coordinates-epsg-3857
// and https://en.wikipedia.org/wiki/Earth_radius#Mean_radius

var EARTH_RADIUS = 6371000;

SMtoLL = function (point) { // Spherical Mercator -> LatLng
    projectionPoint = L.point(point).divideBy(EARTH_RADIUS);
    return L.Projection.SphericalMercator.unproject(projectionPoint);

};

LLtoSM = function (point) { // LatLng -> Spherical Mercator 
    return L.Projection.SphericalMercator.project(point).multiplyBy(EARTH_RADIUS);

};

// per http://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level/31266377#31266377

metersPerPixel = function (lat,zoom) {
   return EARTH_RADIUS * Math.abs(Math.cos(lat / 180 * Math.PI)) / Math.pow(2, zoom+8);
};


// get the column of a 2d array, from
// http://stackoverflow.com/questions/7848004/get-column-from-a-two-dimensional-array-in-javascript

function arrayColumn(arr, n) {
      return arr.map(x=> x[n]);
}
