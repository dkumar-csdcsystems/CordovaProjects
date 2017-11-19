//tx.executeSql("CREATE TABLE IF NOT EXISTS  validmobileprocess ( id INTEGER PRIMARY KEY AUTOINCREMENT, processcode INTEGER, foldergroupcode TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validmobileprocess',
         jspname: '_InspectionTypeDepartment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'foldergroupcode', type: 'TEXT' },             

         ]
     });});