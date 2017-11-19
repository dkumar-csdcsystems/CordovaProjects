




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiencyaction',
    jspname: '_DeficiencyAction.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'actioncode', type: 'INTEGER' },
        { name: 'actiondesc', type: 'TEXT' },
        { name: 'referenceflag', type: 'TEXT' },
        { name: 'actiondesc2', type: 'TEXT' }
    ]
});
});