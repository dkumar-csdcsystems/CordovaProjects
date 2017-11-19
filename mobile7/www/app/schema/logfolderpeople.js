




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderpeople',
         deletedtablename: 'folderpeople',
         jspname: '_deletedFolderPeople.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER' },
             { name: 'peoplersn', type: 'INTEGER' },
             { name: 'peoplecode', type: 'INTEGER' },
             
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },

         ]
     });
});