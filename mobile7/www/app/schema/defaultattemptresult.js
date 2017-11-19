app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
{
    tablename: 'defaultattemptresult',
    jspname: '_InspectionResults.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'processcode', type: 'INTEGER' },
        { name: 'resultcode', type: 'INTEGER' }
    ]
});
});