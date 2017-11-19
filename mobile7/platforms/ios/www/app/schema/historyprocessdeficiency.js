



app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'historyprocessdeficiency',
    jspname2: 'Paged_HistoryProcessDeficiency.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
                { name: 'processrsn', type: 'INTEGER', keyColumn: true },
                { name: 'deficiencycode', type: 'INTEGER', keyColumn: true },
                { name: 'deficiencytext', type: 'TEXT' },
                { name: 'insertdate', type: 'TEXT' },
                { name: 'complybydate', type: 'TEXT' },
                { name: 'datecomplied', type: 'TEXT' },
                { name: 'locationdesc', type: 'TEXT' },
                { name: 'sublocationdesc', type: 'TEXT' },
                { name: 'statuscode', type: 'INTEGER' },
                { name: 'severitycode', type: 'INTEGER' },
                { name: 'actioncode', type: 'INTEGER' },
                { name: 'referencenum', type: 'TEXT' },
                { name: 'occurancecount', type: 'INTEGER' },
                { name: 'remedytext', type: 'TEXT' },
                { name: 'stampdate', type: 'TEXT' },
                { name: 'deficiencyid', type: 'INTEGER' }
    ]
});
});