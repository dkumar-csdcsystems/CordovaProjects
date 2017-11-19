




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderproperty',
         deletedtablename: 'folderproperty',
         jspname: '_deletedFolderProperty.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
               { name: 'folderrsn', type: 'INTEGER' },
               { name: 'propertyrsn', type: 'INTEGER' },           
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },

         ]
     });
});