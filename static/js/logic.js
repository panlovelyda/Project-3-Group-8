// Creating the map object
let myMap = L.map("map", {
  center: [ -37.813628,  144.963058],
  zoom: 10
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data.
let geoData = "https://raw.githubusercontent.com/tonywr71/GeoJson-Data/e33126bb38ede356f79737a160aa16f8addfd8b3/suburb-2-vic.geojson";

// To do:

// Get the data with d3.
d3.json(geoData).then(function(response) {

  features = response.features;
  console.log("features: ",features);
  L.geoJson(response).addTo(myMap);


  
/*  var choroplethLayer = L.choropleth(response, {
    valueProperty: 'DP03_16E', // which property in the features to use
    scale: ['yellow', 'red'], // chroma.js scale - include as many as you like
    steps: 5, // number of breaks or steps in range
    mode: 'q', // q for quantile, e for equidistant, k for k-means
    style: {
      color: '#fff', // border color
      weight: 2,
      fillOpacity: 0.8
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup('<b>District ' + feature.properties.NAME + '</b><br>' +
      'Employed population with school-aged children:' + feature.properties.DP03_16E.toLocaleString() + '<br>' 
      + 'Total income and benefits:' + feature.properties.DP03_75E.toLocaleString()
      )
    }
  }).addTo(myMap);

  // Adding the legend to the map
    // Add legend (don't forget to add the CSS from index.html)
    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (myMap) {
      var div = L.DomUtil.create('div', 'info legend');
      var limits = choroplethLayer.options.limits;
      var colors = choroplethLayer.options.colors;
      var labels = [];
  
      // Add min & max
      div.innerHTML = `<div class="labels"><div class="min"> Min: ${limits[0]} </div> \
        <div class="max"> Max: ${limits[limits.length - 1]} </div></div>`;

      var lastlimit;
      limits.forEach(function (limit, index) {
        if ( index == 0 )
          labels.push(`<i style="background-color:  ${colors[index]}">......</i>  ${limit}<br>`);
        else {
          labels.push(`<i style="background-color:  ${colors[index]}">......</i>  ${lastlimit} - ${limit}<br>`);
        }
        lastlimit=limit;
      }); 

      div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;
      //div.innerHTML += '<div style="list-style: none;">' + labels.join('') + '</div>';
      console.log("div: ",div);
      return div;
    };
    legend.addTo(myMap); */
})
