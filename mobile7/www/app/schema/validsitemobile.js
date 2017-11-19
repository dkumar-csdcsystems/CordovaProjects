




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validsitemobile',
    jspname: '_MobileSiteLicense.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'systemid', type: 'TEXT' },
        { name: 'licensetype', type: 'TEXT' },
        { name: 'comments', type: 'TEXT' }
    ]
});});