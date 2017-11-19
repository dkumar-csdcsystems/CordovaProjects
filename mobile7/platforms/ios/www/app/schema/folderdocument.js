app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderdocument',
         jspname2: '_FolderDocument.jsp',
         fields: [
                    { name: 'id', type: 'INTEGER', primary: true, serial: true },
                    { name: 'folderrsn', type: 'INTEGER' },
                    { name: 'documentrsn', type: 'INTEGER' },
                    { name: 'documentcode', type: 'TEXT' },
                    { name: 'documentstatus', type: 'TEXT' },
                    { name: 'displayorder', type: 'INTEGER' },
                    { name: 'documentcomment', type: 'TEXT' },
                    { name: 'dategenerated', type: 'TEXT' },
                    { name: 'documentname', type: 'TEXT' },
                    { name: 'documentsuffix', type: 'TEXT' },
                    { name: 'documentdesc', type: 'TEXT' },
                    { name: 'documentdesc2', type: 'TEXT' }
         ]
     });
});