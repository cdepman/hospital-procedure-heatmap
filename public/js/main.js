var procedures = {};
var addressPoints = [];
var response;
var lat;
var lng;
var data;
var intensityDivisor = 1000;
var map = L.map('map').setView([37.77, -122.419], 4);
var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

function getGeoCodedLatLngForLocations(locs, count, callback){
  if (count === 0){ return callback(); }
  var address = addressStringFromLocationObject(locs[count]);
  var intensity = loc["Average Total Payments"] || intensityDivisor;
  var r = new XMLHttpRequest();
  r.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address=" + address, true);
  r.onreadystatechange = function () {
    if (r.readyState != 4 || r.status != 200) return;
    response = JSON.parse(r.responseText);
    if (response.results[0]){
      latlng = response.results[0].geometry.location
      addressPoints.push([latlng["lat"], latlng["lng"], intensity/intensityDivisor]);
    }
    getGeoCodedLatLngForLocations(locs, count - 1, callback);
  };
  r.send();
}

function drawHeatLayer(){
  L.heatLayer(
    addressPoints,
    {
      minOpacity: 0.35,
      gradient: {
        0.15: 'brown',
        0.30: 'red',
        0.65: 'lime',
        1.00: 'blue'
      }
    }
  ).addTo(map);
}

function addressStringFromLocationObject(loc){
  return  loc["Provider Name"] + ", " +
          loc["Provider Street Address"] + ", " +
          loc["Provider City"] + ", " +
          loc["Provider State"] + ", " +
          loc["Provider Zip Code"];
}

function handleFileSelect(evt) {
  var file = evt.target.files[0];
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      handleDataArray(results.data);
    }
  });
}

function handleDataArray(dataArray){
  procedures = {};
  var addressString;
  var descriptorKey;
  for (var i = 0; i < dataArray.length; i++){
    loc = dataArray[i]
    if ( i === 345 ) { console.log(loc[i]); }
    if (loc["APC"]){
      descriptorKey = "APC";
    } else if (loc["DRG Definition"]) {
      descriptorKey = "DRG Definition";
    }
    if (!procedures[loc[descriptorKey]]){
      procedures[loc[descriptorKey]] = [];
    }
    procedures[loc[descriptorKey]].push(loc);
  }
  populateMenu();
}

function populateMenu(){
  var $secondChoice = $("#second-choice");
  $secondChoice.empty();
  var orderedProcedures = getOrderedArrayOfProcedures();
  orderedProcedures.forEach(function(procedureName) {
    $secondChoice.append("<option value='" + procedureName + "'>" + procedureName + "</option>");
  });
}

function getOrderedArrayOfProcedures(){
  return Object.keys(procedures)
  .filter(function(a){if (a) return a;})
  .sort(function(a, b){
    return parseInt(a.slice(0,4)) - parseInt(b.slice(0,4));
  });
}

$("#second-choice").change(function() {
  addressPoints = [];
	var selection = $(this);
	var key = selection.val();
  var locs = procedures[key];
  console.log('About to geocode', locs.length, 'data points');
  getGeoCodedLatLngForLocations(locs, locs.length - 1, drawHeatLayer);
});

$(document).ready(function(){
  $("#csv-file").change(handleFileSelect);
});
