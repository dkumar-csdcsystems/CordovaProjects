
app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'defaultdeficiencystatus',
    jspname: '_DefaultDeficiencyStatus.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'deficiencycode', type: 'INTEGER' },
        { name: 'statuscode', type: 'INTEGER' }
    ]
});
});