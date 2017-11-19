




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderfreeform',
         jspname: '_DeletedFolderFreeform.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
               { name: 'freeformrsn', type: 'INTEGER' },
             //{ name: 'folderrsn', type: 'INTEGER' },
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },

         ]
     });
});