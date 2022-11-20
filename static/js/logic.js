// Creating the map object
let myMap = L.map("map", {
  center: [ -37.813628,  144.963058],
  zoom: 11
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

  //features = response.features;
  //console.log("features: ",features);
 // L.geoJson(response).addTo(myMap);


  // sql.js
  let config = {locateFile: () => "static/js/sql-wasm.wasm"}

 // var value='2020-2021'
 // var value='2011-2021'
  var value='Growth PA'
  initSqlJs(config).then(function(SQL){
      const search = new XMLHttpRequest();
      search.open('GET', "static/data/house.sqlite", true);
      search.responseType = 'arraybuffer';
      search.onload = e => {
          const uInt8Array = new Uint8Array(search.response);
          const db = new SQL.Database(uInt8Array);
          var SQLstmt= `SELECT * FROM change where period = '${value}'`
          const contents = db.exec(SQLstmt);
          // console.log("JSON:", JSON.stringify(contents));
/*           console.log("contents:", contents)
          console.log("contents[0].values[i][0] suburb name",contents[0].values[0][0])
          console.log("contents[0].values[i][0] suburb change",contents[0].values[0][2])
          console.log("features: ",features) */
          for (var i in response.features) {
/*             console.log("each i, features[i].properties.vic_loca_2: ", i, features[i].properties.vic_loca_2) */
            // default is 0
            response.features[i].properties['vic_loca_8'] = 'NA'
            //response.features[i].properties['vic_loca_9'] = value
            //if sqllite have data, give it
            for (var j in contents[0].values) { 
              if ( contents[0].values[j][0] == response.features[i].properties.vic_loca_2 ) {
/*                 console.log("change suburb: ",contents[0].values[j][0], contents[0].values[j][2]) */
                response.features[i].properties['vic_loca_8'] = contents[0].values[j][2]
              }
            }
          }
          //console.log("features: ",response.features)

          var choroplethLayer = L.choropleth(response, {
            valueProperty: 'vic_loca_8', // which property in the features to use
            scale: ['yellow', 'red'], // chroma.js scale - include as many as you like
            steps: 5, // number of breaks or steps in range
            mode: 'q', // q for quantile, e for equidistant, k for k-means
            style: {
              color: '#fff', // border color
              weight: 2,
              fillOpacity: 0.8
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(`<b>${feature.properties.vic_loca_2}</b><br>${value}: ${feature.properties.vic_loca_8}%<br>`
              )
              
            }
          }).addTo(myMap); 

          // Adding the legend to the map
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
                labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${limit}<br clear="all">`);
              else {
                labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${lastlimit} - ${limit}<br clear="all">`);
              }
              lastlimit=limit;
            }); 

            div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;
            //div.innerHTML += '<div style="list-style: none;">' + labels.join('') + '</div>';
            console.log("div: ",div);
            return div;
          };
          legend.addTo(myMap);
      };
      search.send();


      
  });
  




})
