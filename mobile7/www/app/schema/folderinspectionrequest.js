




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'folderinspectionrequest',
    jspname2: '_InspectionRequest.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'folderrsn', type: 'INTEGER' },
        { name: 'processrsn', type: 'INTEGER' },
        { name: 'comments', type: 'TEXT' },
        { name: 'stampdate', type: 'TEXT' }
    ]
});
});