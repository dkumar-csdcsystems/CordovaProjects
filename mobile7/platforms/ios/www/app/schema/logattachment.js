




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logattachment',
         jspname: '_QuickDeletedAttachment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'attachmentrsn', type: 'INTEGER' },
             /*{ name: 'logtype', type: 'TEXT' },
             { name: 'logdate', type: 'TEXT' },*/

         ]
     });
});