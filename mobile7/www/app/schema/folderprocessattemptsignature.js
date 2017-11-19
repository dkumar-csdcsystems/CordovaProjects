




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderprocessattemptsignature',
         fields: [
              { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'processrsn', type: 'INTEGER' },
              { name: 'attemptid', type: 'INTEGER' },
              { name: 'signaturetype', type: 'TEXT' },
              { name: 'signaturedata', type: 'TEXT' },
              { name: 'processid', type: 'INTEGER' },
              { name: 'attchmentcode', type: 'INTEGER' }
         ]
     });
});