




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validdeficiencysubcategory',
    jspname: '_DeficiencySubCategory.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'subcategorycode', type: 'INTEGER' },
        { name: 'subcategorydesc', type: 'TEXT' },
        { name: 'subcategorydesc2', type: 'TEXT' }
    ]
});});