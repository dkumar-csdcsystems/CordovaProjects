//tx.executeSql("CREATE TABLE IF NOT EXISTS  validpeople ( id INTEGER PRIMARY KEY AUTOINCREMENT, peoplecode INTEGER ,peopledesc TEXT, webdisplayflag TEXT,
//peopledesc2 TEXT)", [],

app.config(function(schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: "validpeople",
        jspname: "_ValidPeople.jsp",
        fields: [
            { name: "id", type: "INTEGER", primary: true, serial: true },
            { name: "peoplecode", type: "INTEGER" },
            { name: "peopledesc", type: "TEXT" },
            { name: "webdisplayflag", type: "TEXT" },
            { name: "peopledesc2", type: "TEXT" }
        ]
    });
});