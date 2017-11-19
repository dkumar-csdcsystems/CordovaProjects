//tx.executeSql("CREATE TABLE IF NOT EXISTS  validprocess ( id INTEGER PRIMARY KEY AUTOINCREMENT, processcode INTEGER, processcode TEXT, 
//processdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validprocess',
         jspname:   '_InspectionType.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'processdesc', type: 'TEXT' },
             { name: 'processdesc2', type: 'TEXT' },

         ]
     });});