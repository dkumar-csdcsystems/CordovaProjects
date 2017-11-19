




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderprocessinfo',
         deletedtablename: 'folderprocessinfo',
         jspname2: '_FolderProcessInfoDel.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'processrsn', type: 'INTEGER' },
               { name: 'infocode', type: 'INTEGER' },              
         ]
     });
});