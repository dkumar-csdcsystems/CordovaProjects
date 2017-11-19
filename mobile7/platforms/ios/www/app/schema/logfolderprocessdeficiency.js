




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderprocessdeficiency',
         jspname: '_QuickDeletedProcessDeficiency.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
               { name: 'folderrsn', type: 'INTEGER' },
               { name: 'processrsn', type: 'INTEGER' },
               { name: 'deficiencyid', type: 'INTEGER' },
           /*  { name: 'logtype', type: 'TEXT' },
             { name: 'logdate', type: 'TEXT' },*/

         ]
     });
});