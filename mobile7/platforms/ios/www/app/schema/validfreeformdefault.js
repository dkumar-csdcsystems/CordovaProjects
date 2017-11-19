




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfreeformdefault',
         jspname: '_ValidFreeformDefault.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'freeformcode', type: 'INTEGER' },
               { name: 'rownumber', type: 'INTEGER' },
                { name: 'columnname', type: 'TEXT' },
                { name: 'columnvalue', type: 'TEXT' },
               
               


         ]
     });});