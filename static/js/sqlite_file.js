let config = {locateFile: () => "static/js/sql-wasm.wasm"}
initSqlJs(config).then(function(SQL){
    const search = new XMLHttpRequest();
    search.open('GET', "static/data/house.sqlite", true);
    search.responseType = 'arraybuffer';
    search.onload = e => {
        const uInt8Array = new Uint8Array(search.response);
        const db = new SQL.Database(uInt8Array);
        const contents = db.exec("SELECT * FROM change where period = '2011-2021' order by change_percent DESC");
        // console.log("JSON:", JSON.stringify(contents));
        console.log("contents:", contents)
    };
    search.send();
}); 

initSqlJs(config).then(function(SQL){
    const search = new XMLHttpRequest();
    search.open('GET', "static/data/house.sqlite", true);
    search.responseType = 'arraybuffer';
    search.onload = e => {
        const uInt8Array = new Uint8Array(search.response);
        const db = new SQL.Database(uInt8Array);
        const contents = db.exec("SELECT * FROM median_house where year = '2011'");
        // console.log("JSON:", JSON.stringify(contents));
        console.log("contents2:", contents)
    };
    search.send();
}); 

initSqlJs(config).then(function(SQL){
    const search = new XMLHttpRequest();
    search.open('GET', "static/data/XJO_close.sqlite", true);
    search.responseType = 'arraybuffer';
    search.onload = e => {
        const uInt8Array = new Uint8Array(search.response);
        const db = new SQL.Database(uInt8Array);
        const contents = db.exec("SELECT * FROM xjo_close where date between '2011-01-01' and '2012-12-31'");
        // console.log("JSON:", JSON.stringify(contents));
        console.log("contents3:", contents)
    };
    search.send();
}); 