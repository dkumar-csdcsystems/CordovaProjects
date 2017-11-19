




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validlookup',
         jspname: '_LookupCodeDeficiency.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'lookup1', type: 'TEXT' },
              { name: 'lookupstring', type: 'TEXT' },
             { name: 'lookupstring2', type: 'TEXT' },
          
         ]
     });});