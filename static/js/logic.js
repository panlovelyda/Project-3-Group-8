document.getElementsByClassName("jumbotron")[0].style.background = "url('https://www.worldtravelguide.net/wp-content/uploads/2017/04/Think-Australia-Victoria-Apostle-635720252-NickWilms-copy.jpg') repeat-x center";
document.getElementsByClassName("jumbotron")[0].style.color = "white";
document.getElementsByClassName("jumbotron")[0].style.textShadow = "4px 6px 5px #000000";
document.getElementsByClassName("jumbotron")[0].style.fontWeight = "bold";
document.getElementsByClassName("jumbotron")[0].style.fontVariant = "small-caps";

var myMap

function choroplethMap(value) {
// Creating the map object
if ( myMap != undefined ) {
  myMap.off();
  myMap.remove();
}
myMap = L.map("map", {
  center: [ -37.813628,  144.963058],
  zoom: 11
})

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data.
var geoData = "https://raw.githubusercontent.com/tonywr71/GeoJson-Data/e33126bb38ede356f79737a160aa16f8addfd8b3/suburb-2-vic.geojson";

// Get the data with d3.
d3.json(geoData).then(function(response) {

  // sql.js
  var config = {locateFile: () => "static/js/sql-wasm.wasm"}

  initSqlJs(config).then(function(SQL){
      const search = new XMLHttpRequest();
      search.open('GET', "static/data/house.sqlite", true);
      search.responseType = 'arraybuffer';
      search.onload = e => {
          const uInt8Array = new Uint8Array(search.response);
          //console.log("uInt8Array",uInt8Array);
          const db = new SQL.Database(uInt8Array);
          //console.log("db",db);

          if (value.length == 4){
            var table = 'median_house';
            var column = 'year';
          }
          else {
            var table = 'change';
            var column = 'period';
          }
          var SQLstmt= `SELECT * FROM ${table} where ${column} = '${value}'`;

          const contents = db.exec(SQLstmt);
          //console.log("contents",contents);

          for (var i in response.features) {
            // default is Not Avaliable
            response.features[i].properties['vic_loca_8'] = 'NA'
            //if sqllite have data, save to vic_loca_8

            for (var j in contents[0].values) { 
              if ( contents[0].values[j][0] == response.features[i].properties.vic_loca_2 ) {
//                 console.log("change suburb: ",contents[0].values[j][0], contents[0].values[j][2]) 
                response.features[i].properties['vic_loca_8'] = contents[0].values[j][2]
              }
            }
          }

          var choroplethLayer = L.choropleth(response, {
            valueProperty: 'vic_loca_8', // which property in the features to use
            scale: ['yellow', 'red'], // chroma.js scale - include as many as you like
            steps: 8, // number of breaks or steps in range
            mode: 'q', // q for quantile, e for equidistant, k for k-means
            style: {
              color: '#fff', // border color
              weight: 2,
              fillOpacity: 0.8
            },
            onEachFeature: function(feature, layer) {
              layer.bindPopup(`<b>${feature.properties.vic_loca_2}</b><br>${value}: ${feature.properties.vic_loca_8}<br>`
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
        
            // Notice
            div.innerHTML = `<div class="labels"><div class "notice">White means no data</div></div>`;

            var lastlimit;
            limits.forEach(function (limit, index) {
              if ( index == 0 )
                labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${Math.round(limit*10)/10}<br clear="all">`);
              else {
                labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${Math.round(lastlimit*10)/10} - ${Math.round(limit*10)/10}<br clear="all">`);
              }
              lastlimit=limit;
            }); 

            div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;

            return div;
          };
          legend.addTo(myMap);
      };
      search.send();
  });
})

}

// bar chart for one suburb
function suburbBar(value)
{
   // sql.js
  var config = {locateFile: () => "static/js/sql-wasm.wasm"}

  initSqlJs(config).then(function(SQL){
      const search = new XMLHttpRequest();
      //console.log("search: ",search);

      search.open('GET', "static/data/house.sqlite", true);
      //console.log("open: ",a);
      search.responseType = 'arraybuffer';
      search.onload = e => {
          const uInt8Array = new Uint8Array(search.response);
          const db = new SQL.Database(uInt8Array);

          var SQLstmt= `SELECT year, median FROM median_house where suburb = '${value}' order by year`;
          console.log("SQLstmt: ",SQLstmt);

          const contents = db.exec(SQLstmt);
          console.log("contents: ",contents);

          var xList=[];
          var yList=[];
          
          for (var j in contents[0].values) {
            xList.push(contents[0].values[j][0]);
            yList.push(contents[0].values[j][1]);
          }
//
          var plotData = [{
            x: xList,
            y: yList,
            //text: yList,
            //orientation:'h',
            marker: {
              color: 'rgba(255,153,51,0.6)',
              width: 1
            },
            type:"bar"}];

          let layout = {
            title: {
              text:`<b>${value}</b><br>House Median`},
            height: 450,
            width: 450, 
            margin: {"t": 80, "b": 80, "l": 80, "r": 10}
            }; 
          config={responsive:true};

          graphDiv = document.getElementById('bar');
          Plotly.newPlot("bar", plotData, layout,config); 
//
      };
      search.send();
  });

}

function trendLine(value){
   // sql.js
   var config = {locateFile: () => "static/js/sql-wasm.wasm"}
   var x1List=[];
   var y1List=[];
   var x2List=[];
   var y2List=[];
   var x3List=[];
   var y3List=[];

   initSqlJs(config).then(function(SQL){
       const search = new XMLHttpRequest();
       //console.log("search: ",search);
 
       search.open('GET', "static/data/interest_rate.sqlite", true);
       //console.log("open: ",a);
       search.responseType = 'arraybuffer';
       search.onload = e => {
          const uInt8Array = new Uint8Array(search.response);
          const db = new SQL.Database(uInt8Array);

          if (value.length == 4){
            var start = `${value}-01-01`;
            var end =`${value}-12-31`;
            console.log("start4: ",start, "end: ",end);
          }
          else{
            if (value == 'Growth PA') {
              value = "2011-2021"
            }
            var myArray=value.split("-",2)
            var start = `${myArray[0]}-01-01`;
            var end =`${myArray[1]}-12-31`;
            console.log("start9: ",start, "end: ",end);
          }
          // read cash_rate_target to x1,y1
          var SQLstmt= `SELECT date(date),cash_rate_target FROM interest_rate where date between'${start}' and '${end}' order by date`;
          console.log("SQLstmt: ",SQLstmt);
 
          const contents1 = db.exec(SQLstmt);
          console.log("contents interest: ",contents1);

 
          for ( var j in contents1[0].values ){
            x1List.push(contents1[0].values[j][0]);
            y1List.push(contents1[0].values[j][1]);
          }
          console.log("x1List:",x1List);
          console.log("y1List:",y1List);

          // read house_inflation to x2,y2
          var SQLstmt= `SELECT date(date),house_inflation_rate FROM house_inflation where date between'${start}' and '${end}' order by date`;
          console.log("SQLstmt: ",SQLstmt);
 
          const contents2 = db.exec(SQLstmt);
          console.log("contents inflation: ",contents2);

          for ( var j in contents2[0].values ){
            x2List.push(contents2[0].values[j][0]);
            y2List.push(contents2[0].values[j][1]);
          }
          console.log("x2List:",x2List);
          console.log("y2List:",y2List);

          // read xjo_close to x3,y3
          var SQLstmt= `SELECT date(date),close_price FROM xjo_close where date between'${start}' and '${end}' order by date`;
          console.log("SQLstmt: ",SQLstmt);
 
          const contents3 = db.exec(SQLstmt);
          console.log("contents xjo_close: ",contents3);

          for ( var j in contents3[0].values ){
            x3List.push(contents3[0].values[j][0]);
            y3List.push(contents3[0].values[j][1]);
          }
          console.log("x3List:",x3List);
          console.log("y3List:",y3List);

          //
          var trace1 = {
            x: x1List,
            y: y1List,
            name: 'Interest Rate',
            type: 'scatter'
          };

          var trace2 = {
            x: x2List,
            y: y2List,
            name: 'Inflation Rate',
            type: 'scatter'
          };
          
          var trace3 = {
            x: x3List,
            y: y3List,
            name: 'S&P/ASX 200',
            yaxis: 'y3',
            type: 'scatter'
          };
          
          var Plotdata = [trace1, trace2, trace3];

          var layout = {
            title: '<b>S&P/ASX 200, Inflation and Interest Rate',
            yaxis: {title: 'Rate %'},
            yaxis3: {
              title: 'S&P/ASX 200',
              titlefont: {color: 'rgb(148, 103, 189)'},
              tickfont: {color: 'rgb(148, 103, 189)'},
              overlaying: 'y',
              side: 'right'
            }
          };
          config={responsive:true};

          graphDiv = document.getElementById('line');
          Plotly.newPlot("line", Plotdata, layout,config); 
          
          //Plotly.newPlot('myDiv', data, layout,config);
          //
        };
       search.send();

    });
}

var element_suburb = document.getElementById("selSuburb");
var element_subject = document.getElementById("selDataset");

var selectList=['2020-2021','2011-2021','Growth PA','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021']
/* //let selectList = new Array();
var selectList = ['test'];
var selectList1 = new Array();
var selectList2 = new Array();
var len=0;
// sql.js
var config = {locateFile: () => "static/js/sql-wasm.wasm"};

initSqlJs(config).then(function(SQL){
    const search1 = new XMLHttpRequest();
    search1.open('GET', "static/data/house.sqlite", true);
    search1.responseType = 'arraybuffer';
    search1.onload = e => {
        const uInt8Array1 = new Uint8Array(search1.response);
        const db1 = new SQL.Database(uInt8Array1);
        var SQLstmt1= `SELECT DISTINCT period FROM change`
        const contents1 = db1.exec(SQLstmt1);

        console.log("contents",contents1);

        for ( var i in contents1[0].values ){


          console.log("temp1", String(contents1[0].values[i][0]));

          len = selectList.push(String(contents1[0].values[i][[0]]));
          selectList1.push("2024f");
        };
        console.log("selectList in: ",selectList);
        selectList2 = selectList.concat("aaa");
        console.log("selectList2 in: ",selectList2);
    };
    search1.send(); 
    console.log("selectList out: ",  selectList);
    console.log("selectList2 out: ",  selectList2);

  });

//var selectList1=["2020a","2021b","2023d"];

console.log("selectList1:--", selectList1);
console.log("selectList1:length", selectList1.length);

  */
 for ( var k in selectList ) {
  var subjectList = document.createElement("option");

  //subjectList.text = parseInt(select[i]);
  subjectList.text = selectList[k];
  subjectList.value = selectList[k];

  element_subject.append(subjectList, element_subject[null]); 
 };

 var value = document.getElementById("selDataset").value;
  console.log("value: ", value);

 //sql.js get suburb list
 var config = {locateFile: () => "static/js/sql-wasm.wasm"}

const suburbArray=[];
 initSqlJs(config).then(function(SQL){
  const search = new XMLHttpRequest();
  search.open('GET', "static/data/house.sqlite", true);
  search.responseType = 'arraybuffer';
  search.onload = e => {
      const uInt8Array = new Uint8Array(search.response);
      const db = new SQL.Database(uInt8Array);
      const contents = db.exec("SELECT DISTINCT suburb FROM median_house order by suburb");
      // console.log("JSON:", JSON.stringify(contents));
      console.log("contents3:", contents)
      for (var j in contents[0].values) {
        suburbArray.push(contents[0].values[j][0])
      }

      for ( var k in suburbArray ) {
        var subjectList = document.createElement("option");
      
        //subjectList.text = parseInt(select[i]);
        subjectList.text = contents[0].values[k][0];
        subjectList.value = contents[0].values[k][0];
      
        element_suburb.append(subjectList, element_suburb[null]); 
        };

      var suburb = document.getElementById("selSuburb").value;
      console.log("suburb: ", suburb);
      suburbBar(suburb);


  };
  search.send();
}); 

choroplethMap(value);
trendLine(value);


function optionChanged(value){

  choroplethMap(value);
  trendLine(value);
}

function suburbChanged(suburb){

  suburbBar(suburb)

}