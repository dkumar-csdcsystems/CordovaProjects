




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'defaultprocessinfo',
         jspname: '_DefaultProcessInfo.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'infocode', type: 'INTEGER' },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'infovalue', type: 'TEXT' },

         ]
     });});