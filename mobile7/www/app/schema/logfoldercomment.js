




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfoldercomment',
         deletedtablename: 'foldercomment',
         jspname: '_deletedFolderComment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER' },
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },
             { name: 'comments', type: 'TEXT' },


         ]
     });
});