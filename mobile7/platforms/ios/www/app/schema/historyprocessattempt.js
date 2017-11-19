




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: "historyprocessattempt",
    jspname2: "_AllProcessAtm.jsp",
    fields: [
        { name: "id", type: "INTEGER", primary: true, serial: true },
        { name: "processcode", type: "INTEGER" },
        { name: "displayorder", type: "INTEGER" },
        { name: "statuscode", type: "INTEGER" },
        { name: "scheduledate", type: "TEXT" },
        { name: "enddate", type: "TEXT" },
        { name: "processcomment", type: "TEXT" },
        { name: "assigneduser", type: "TEXT" },
        { name: "folderrsn", type: "INTEGER", keyColumn: true },
        { name: "processrsn", type: "INTEGER", keyColumn: true },
        { name: "attemptrsn", type: "INTEGER", keyColumn: true },
        { name: "attemptby", type: "TEXT" },
        { name: "attemptdate", type: "TEXT" },
        { name: "resultcode", type: "INTEGER" },
        { name: "attemptcomment", type: "TEXT" }
       
    ],

    quickSyncColumns: [
        { name: "processcode" },
        { name: "displayorder" },
        { name: "statuscode" },
        { name: "scheduledate" },
        { name: "enddate" },
        { name: "processcomment" },
        { name: "assigneduser" },
        { name: "folderrsn",  keyColumn: true },
        { name: "processrsn",  keyColumn: true },
        { name: "attemptrsn",  keyColumn: true },
        { name: "attemptby" },
        { name: "attemptdate" },
        { name: "resultcode" },
        { name: "attemptcomment" }
    ]
});
});