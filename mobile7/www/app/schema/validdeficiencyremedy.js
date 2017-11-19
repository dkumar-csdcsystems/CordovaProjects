




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiencyremedy',
    jspname: '_DeficiencyRemedy.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'deficiencycode', type: 'INTEGER', keyColumn: true },
        { name: 'remedycode', type: 'INTEGER', keyColumn: true },
        { name: 'remedydesc', type: 'TEXT' },
        { name: 'remedytext', type: 'TEXT' },
        { name: 'remedydesc2', type: 'TEXT' },
        { name: 'remedytext2', type: 'TEXT' }
    ]
});
});