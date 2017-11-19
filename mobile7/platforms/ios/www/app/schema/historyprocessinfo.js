




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'historyprocessinfo',
    jspname2: 'Paged_HistoryProcessInfo.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processrsn', type: 'INTEGER', keyColumn: true },
             { name: 'infocode', type: 'INTEGER', keyColumn: true },
             { name: 'infovalue', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'stampdate', type: 'TEXT' }
    ]
});
});