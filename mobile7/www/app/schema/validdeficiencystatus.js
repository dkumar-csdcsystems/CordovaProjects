




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiencystatus',
    jspname: '_DeficiencyStatus.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'statuscode', type: 'INTEGER' },
        { name: 'statusdesc', type: 'TEXT' },
        { name: 'statusdesc2', type: 'INTEGER' }
    ]
});
});