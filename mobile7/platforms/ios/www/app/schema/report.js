app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
        {
            tablename: "report",
            jspname: "",
            jspname2: "",
            fields: [
                { name: "id", type: "INTEGER", primary: true, serial: true },
                { name: "foldertype", type: "TEXT" },
                { name: "processcode", type: "TEXT" },
                { name: "reportname", type: "TEXT" },
                { name: "reportdescription", type: "TEXT" },
                { name: "displayflag", type: "TEXT" },
                { name: "reporttemplate", type: "TEXT" }
            ]
        }
        );
});