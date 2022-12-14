document.getElementsByClassName("jumbotron")[0].style.background = "url('static/image/20221014.gif') repeat-x center";
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
    zoom: 11,
    scrollWheelZoom: false
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
                //console.log("change suburb: ",contents[0].values[j][0], contents[0].values[j][2]) 
                response.features[i].properties['vic_loca_8'] = contents[0].values[j][2]
                }
              }
            }

            var choroplethLayer = L.choropleth(response, {
              valueProperty: 'vic_loca_8', // which property in the features to use
              scale: ['yellow', 'green'], // chroma.js scale - include as many as you like
              steps: 8, // number of breaks or steps in range
              mode: 'q', // q for quantile, e for equidistant, k for k-means
              style: {
                color: '#fff', // border color
                weight: 2,
                fillOpacity: 0.8
              },
              onEachFeature: function(feature, layer) {
                var popupString=`<h4><b>${feature.properties.vic_loca_2}</b></h4>`;
                if ( feature.properties.vic_loca_8 != 'NA' ) {
                  if ( value.length == 4) {
                    popupString=`${popupString}<h4><br>Median: $${feature.properties.vic_loca_8}</h4>`
                  }
                  else {
                    popupString=`${popupString}<h4><br>Growth Rate: ${feature.properties.vic_loca_8}%</h4>`
                  }
                  popupString=`${popupString}<button onclick="buttonFunction('${feature.properties.vic_loca_2}')">Median History</button>`
                } // End of != NA
                else {
                  popupString=`${popupString}<h4><br>Data Not Available</h4>`
                };
                layer.bindPopup(popupString);
    
              // when button in popup was press
              buttonFunction  = (suburb) => {

                  element_suburb = document.getElementById("selSuburb");

                  if (element_suburb) {
                    var x = element_suburb.querySelectorAll(`option[value="${suburb}"]`);
                    if (x.length === 1) {
                      //console.log(x[0].index);
                      document.getElementById("selSuburb").selectedIndex = x[0].index;
                    }
                  }
                  //document.getElementById("selSuburb").selectedIndex = -1;
                  suburbBar(suburb);
                  myMap.closePopup();
                }
              //
              } // End of function call by forEachFeature
            }).addTo(myMap); 

            // Adding the legend to the map
            var legend = L.control({ position: 'bottomright' });
            legend.onAdd = function (myMap) {
              var div = L.DomUtil.create('div', 'info legend');
              var limits = choroplethLayer.options.limits;
              var colors = choroplethLayer.options.colors;
              var labels = [];
          
              // Notice
              div.innerHTML = `<div class="labels"><div class "notice">White means NA</div></div>`;

              var lastlimit;
              limits.forEach(function (limit, index) {
                if ( index == 0 )
                  labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${Math.round(limit*10)/10}<br clear="all">`);
                else {
                  labels.push(`<i style="background-color:  ${colors[index]}"></i>  ${Math.round(lastlimit*10)/10} - ${Math.round(limit*10)/10}<br clear="all">`);
                }
                lastlimit=limit;
              }); // End of forEach()

              div.innerHTML += `<div class="info legend"> ${labels.join('')} </div>`;

              return div;
            }; // End of function (myMap)
            legend.addTo(myMap);
        }; // End of e() call by onload
        search.send();
      }); // End of initSqlJs()
  }) // End of d3.json()

} // End of function choroplethMap()

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
          //console.log("SQLstmt: ",SQLstmt);

          const contents1 = db.exec(SQLstmt);
          if ( contents1.length == 0 ) {
            return;
          }
          //console.log("contents1: ",contents1);

          var xList1=[];
          var yList1=[];
          
          for (var j in contents1[0].values) {
            xList1.push(contents1[0].values[j][0]);
            yList1.push(contents1[0].values[j][1]);
          }

          var SQLstmt= `SELECT period, change_percent FROM change where suburb = '${value}' and period != 'Growth PA' and period != '2011-2021' order by period`;
          //console.log("SQLstmt: ",SQLstmt);

          const contents2 = db.exec(SQLstmt);
          //console.log("contents: ",contents2);

          var xList2=[];
          var yList2=[];

          for (var j in contents2[0].values) {
            var str=contents2[0].values[j][0];
            //console.log("str:",str);

            var myArray=str.split("-",2);
            //console.log("myArray:",myArray);
            //var end =`${myArray[1]}`;
            xList2.push(myArray[1]);
            yList2.push(contents2[0].values[j][1]);
          } 

//
        var trace1 = {
          x: xList2,
          y: yList2,
          yaxis: 'y2',
          name: 'Growth Rate',
          type: 'scatter',
          marker: {
            //color: 'rgba(255, 127, 14, 0.8)',
            width: 4
          }
        };

        var trace2 = {
          x: xList1,
          y: yList1,
          name: 'House Median',
          type: 'bar',
          marker: {
            color: 'rgba(73, 164, 0, 0.8)',
            width: 1
          }
        };

        var plotData = [trace1, trace2];
//

          let layout = {
            title: {
              text:`<b>${value}</b>`},
/*             height: 450,
            width: 450,  */
            margin: {"t": 80, "b": 80, "l": 80, "r": 10},
            yaxis2: {
              title: 'Growth Rate %',
              titlefont: {color: 'rgb(4, 147, 114)'},
              tickfont: {color: 'rgb(4, 147, 114)'},
              overlaying: 'y',
              side: 'right'
            }
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
            //console.log("start4: ",start, "end: ",end);
          }
          else{
            if (value == 'Growth PA') {
              value = "2011-2021"
            }
            var myArray=value.split("-",2)
            var start = `${myArray[0]}-01-01`;
            var end =`${myArray[1]}-12-31`;
            //console.log("start9: ",start, "end: ",end);
          }
          // read cash_rate_target to x1,y1
          var SQLstmt= `SELECT date(date),cash_rate_target FROM interest_rate where date between'${start}' and '${end}' order by date`;
          //console.log("SQLstmt: ",SQLstmt);
 
          const contents1 = db.exec(SQLstmt);
          //console.log("contents interest: ",contents1);

 
          for ( var j in contents1[0].values ){
            x1List.push(contents1[0].values[j][0]);
            y1List.push(contents1[0].values[j][1]);
          }
          //console.log("x1List:",x1List);
          //console.log("y1List:",y1List);

          // read house_inflation to x2,y2
          var SQLstmt= `SELECT date(date),house_inflation_rate FROM house_inflation where date between'${start}' and '${end}' order by date`;
          //console.log("SQLstmt: ",SQLstmt);
 
          const contents2 = db.exec(SQLstmt);
          //console.log("contents inflation: ",contents2);

          for ( var j in contents2[0].values ){
            x2List.push(contents2[0].values[j][0]);
            y2List.push(contents2[0].values[j][1]);
          }
          //console.log("x2List:",x2List);
          //console.log("y2List:",y2List);

          // read xjo_close to x3,y3
          var SQLstmt= `SELECT date(date),close_price FROM xjo_close where date between'${start}' and '${end}' order by date`;
          //console.log("SQLstmt: ",SQLstmt);
 
          const contents3 = db.exec(SQLstmt);
          //console.log("contents xjo_close: ",contents3);

          for ( var j in contents3[0].values ){
            x3List.push(contents3[0].values[j][0]);
            y3List.push(contents3[0].values[j][1]);
          }
          //console.log("x3List:",x3List);
          //console.log("y3List:",y3List);

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
              titlefont: {color: 'rgb(34, 139, 34)'},
              tickfont: {color: 'rgb(34, 139, 34)'},
              overlaying: 'y',
              side: 'right'
            }
          };
          config={responsive:true};

          graphDiv = document.getElementById('line');
          Plotly.newPlot("line", Plotdata, layout,config); 
          
          //
        };
       search.send();

    });
}


var element_subject = document.getElementById("selDataset");

//var selectList=['2011-2021','Growth PA','2021-2022','2020-2021','2019-2020','2018-2019','2017-2018','2016-2017','2015-2016','2014-2015','2013-2014','2012-2013','2011-2012','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021']

var selectArray = [];

// sql.js
var config = {locateFile: () => "static/js/sql-wasm.wasm"};

initSqlJs(config).then(function(SQL){
  const search = new XMLHttpRequest();
  search.open('GET', "static/data/house.sqlite", true);
  search.responseType = 'arraybuffer';
  search.onload = e => {
      const uInt8Array = new Uint8Array(search.response);
      const db = new SQL.Database(uInt8Array);
      var SQLstmt= `SELECT DISTINCT period FROM change order by period DESC`
      const contents1 = db.exec(SQLstmt);

      //console.log("contents",contents1);

      for ( var i in contents1[0].values ){
        //console.log("period", String(contents1[0].values[i][0]));
        selectArray.push(String(contents1[0].values[i][[0]]));
      };
      //console.log("selectList 1: ",selectArray);

      var SQLstmt= `SELECT DISTINCT year FROM median_house order by year DESC`
      const contents2 = db.exec(SQLstmt);
      for ( var i in contents2[0].values ){
        //console.log("year", String(contents2[0].values[i][0]));
        selectArray.push(String(contents2[0].values[i][0]));
      };
      //console.log("selectList 2: ",selectArray);

      for ( var k in selectArray ) {
        var subjectList = document.createElement("option");
      
        subjectList.text = selectArray[k];
        subjectList.value = selectArray[k];
      
        element_subject.append(subjectList, element_subject[null]); 

      };

      var value = document.getElementById("selDataset").value;
        
      //console.log("value: ", value);
      choroplethMap(value);
      trendLine(value);
  };
  search.send(); 
}); 

var element_suburb = document.getElementById("selSuburb");

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
      //console.log("contents3:", contents)
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
      //console.log("suburb: ", suburb);
      suburbBar(suburb);

  };
  search.send();
}); 


function optionChanged(value){

  choroplethMap(value);
  trendLine(value);
}

function suburbChanged(suburb){
  suburbBar(suburb)
}