app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validuser',
    jspname: '_Inspector.jsp',
    deletedtablename:'validuser',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'userid', type: 'TEXT' },
        { name: 'username', type: 'TEXT' },
        { name: 'userphone', type: 'TEXT' },
        { name: 'roletype', type: 'TEXT' },
        { name: 'licensekey', type: 'TEXT' },
        { name: 'emailaddress', type: 'TEXT' },
        { name: 'password', type: 'TEXT' }
    ]
});
});