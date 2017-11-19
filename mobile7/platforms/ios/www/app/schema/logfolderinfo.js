




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderinfo',
         deletedtablename: 'folderinfo',
         jspname: '_deletedFolderInfo.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER' },
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },
             { name: 'infocode', type: 'INTEGER' },


         ]
     });
});