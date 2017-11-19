



app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'historyprocesschecklist',
    jspname2: 'Paged_HistoryProcessChecklist.jsp',
    fields: [
       { name: 'id', type: 'INTEGER', primary: true, serial: true },
                { name: 'processrsn', type: 'INTEGER', keyColumn: true },
                { name: 'checklistcode', type: 'INTEGER', keyColumn: true },
                { name: 'checklistcomment', type: 'TEXT' },
                { name: 'passed', type: 'TEXT' },
                { name: 'notapplicableflag', type: 'TEXT' },
                { name: 'mandatory', type: 'TEXT' },
                { name: 'chacklistdisplayorder', type: 'INTEGER' },
                { name: 'startdate', type: 'TEXT' },
                { name: 'enddate', type: 'TEXT' }
    ]
});
});