




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfreeform',
         jspname: '_ValidFreeform.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'freeformcode', type: 'INTEGER' },
              { name: 'formdesc', type: 'INTEGER' },
             { name: 'formdesc2', type: 'TEXT' },
             { name: 'formtype', type: 'TEXT' },
              { name: 'formcode', type: 'INTEGER' },
               { name: 'tablename', type: 'TEXT' },                

         ]
     });});