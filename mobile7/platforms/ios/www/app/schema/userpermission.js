app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: "userpermission",
        jspname: '',
        fields: [
            { name: "id", type: "INTEGER", primary: true, serial: true },
            { name: "userid", type: "TEXT" },
            { name: "foldergroupcode", type: "INTEGER" }
        ]
    });
});