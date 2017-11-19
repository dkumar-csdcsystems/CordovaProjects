




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validprocesslocation',
         jspname: '_DeficiencyLocation.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'locationdesc', type: 'TEXT' },
             { name: 'locationdesc2', type: 'TEXT' },
         ]
     });});