




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'logfolderprocess',
    deletedtablename: 'folderprocess',
    jspname2: '_ProcessDel.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'processrsn', type: 'INTEGER' }
        /* { name: 'logtype', type: 'TEXT' },
             { name: 'logdate', type: 'TEXT' },*/
    ]
});
});