




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logpeople',
         deletedtablename: 'people',
         jspname: '_deletedPeople.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
               { name: 'peoplersn', type: 'INTEGER' },           
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },

         ]
     });
});