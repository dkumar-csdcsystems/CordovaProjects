




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logproperty',
         deletedtablename: 'property',
         jspname: '_deletedProperty.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },          
               { name: 'propertyrsn', type: 'INTEGER' },
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },

         ]
     });
});