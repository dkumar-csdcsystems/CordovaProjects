




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'syncinfo',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'jspname', type: 'TEXT' },
             { name: 'synctype', type: 'TEXT' },
             { name: 'exgroup', type: 'TEXT' },
             { name: 'exorder', type: 'TEXT' },
             { name: 'countfirst', type: 'TEXT' },
             { name: 'lastsyncdate', type: 'TEXT' }
         ]
     });

});