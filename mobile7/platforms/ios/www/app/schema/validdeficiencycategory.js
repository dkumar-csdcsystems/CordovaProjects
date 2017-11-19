




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiencycategory',
    jspname: '_DeficiencyCategory.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'categorycode', type: 'INTEGER' },
        { name: 'categorydesc', type: 'TEXT' },
        { name: 'categorydesc2', type: 'TEXT' }
    ]
});
});