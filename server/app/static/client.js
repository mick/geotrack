var socket = new io.Socket();
var map = null;
var marker = null;
var locations = [];
socket.connect();
socket.on('connect', function(){ console.log("connect"); });
socket.on('newlocation', function(data){ 
    geotrack.newlocation(data.coordinates);
 });
socket.on('disconnect', function(){ console.log("disconnect"); });

var geotrack = {
    
    polylines:[],
    newlocation: function(coords){
        var lat = coords[1]; 
        var lon = coords[0];

        if(marker){
            marker.setMap(null);
        }
        locations.push({lat:lat,
                        lon:lon});
        geotrack.setPolylines();
        new aLatlng = new google.maps.LatLng(lat, lon);
        marker = new google.maps.Marker({
            position: aLatlng, 
            map: map
        });
        map.setCenter(aLatlng);

    },
    setPolylines:function(){

        for(p in geotrack.polyLines){
            geotrack.polyLines[p].setMap(null);
        }
        geotrack.polyLines = [];

        var polyoptions = {
            geodesic:true,
            map:map,
            path: [],
            strokeColor: "#48AAF8",
            strokeOpacity:0.5,
            strokeWeight:5
        };
        
        var start_g = 190;
        var start_b = 255;

        var panopoints = [];
        var loc = geotrack.locations[geotrack.locations.length-1];
        var lastpoint = new google.maps.LatLng(loc.lat, loc.lon);
        for(var i =geotrack.locations.length-2; i> 0; i--){
            var loc = geotrack.locations[i];
            if(img.geo !== undefined){
                cur_point = new google.maps.LatLng(loc.lat, loc.lon);

                start_g-=3;
                start_b-=3;
                polyoptions.strokeColor = "#00"+start_g.toString(16)+start_b.toString(16);

                polyoptions.path = [lastpoint, cur_point];
                geotrack.polyLines.push(new google.maps.Polyline(polyoptions));
                lastpoint = cur_point;
            }
        }
    }

};

$(document).ready(function(){
        
        var myLatlng = new google.maps.LatLng(40.397, -104.644);
        var myOptions = {
            zoom: 8,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(jQuery("#map")[0], myOptions);

    });

