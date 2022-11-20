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
