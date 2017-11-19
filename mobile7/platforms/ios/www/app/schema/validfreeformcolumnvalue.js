




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfreeformcolumnvalue',
         jspname: '_ValidFreeformColumnValue.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'freeformcode', type: 'INTEGER' },              
                { name: 'columnname', type: 'TEXT' },               
                { name: 'columnvalue', type: 'TEXT' },               
                { name: 'columnvaluedesc', type: 'TEXT' },
                 { name: 'columnvaluedesc2', type: 'TEXT' },
                       


         ]
     });});