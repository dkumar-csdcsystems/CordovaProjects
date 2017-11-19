app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
{
    tablename: 'defaultchecklist',
    jspname: '_InspectionTypeItem.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'processcode', type: 'INTEGER' },
        { name: 'checklistcode', type: 'INTEGER' },
        { name: 'mandatory', type: 'TEXT' },
        { name: 'displayorder', type: 'INTEGER' }
    ]
});
});