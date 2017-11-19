




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validaddressdirection',
         jspname: '_ValidStreetDirection.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'addressdirection', type: 'TEXT' },
             { name: 'addressdirectiondesc', type: 'TEXT' },

         ]
     });
});