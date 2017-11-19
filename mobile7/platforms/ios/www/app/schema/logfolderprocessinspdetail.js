




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderprocessinspdetail',
         jspname: '_DeletedProcessFreeform.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'inspdetailrsn', type: 'INTEGER' },
          

         ]
     });
});