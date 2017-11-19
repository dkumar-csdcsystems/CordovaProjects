




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiency',
    jspname: '_DeficiencyType.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'categorycode', type: 'INTEGER' },
        { name: 'subcategorycode', type: 'INTEGER' },
        { name: 'deficiencycode', type: 'INTEGER', keyColumn: true },
        { name: 'deficiencydesc', type: 'TEXT' },
        { name: 'deficiencytext', type: 'TEXT' },
        { name: 'deficiencydesc2', type: 'TEXT' },
        { name: 'DeficiencyText2', type: 'TEXT' }
    ]
});
});