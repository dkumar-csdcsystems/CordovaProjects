//tx.executeSql("CREATE TABLE IF NOT EXISTS  validchecklist ( id INTEGER PRIMARY KEY AUTOINCREMENT, checklistcode INTEGER, checklistdesc TEXT, checklistdetail TEXT, checklistdesc2 INTEGER)", [],

// Not used 





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validchecklist',
         jspname: '_ValidChecklist.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'checklistcode', type: 'INTEGER' },
             { name: 'checklistdesc', type: 'TEXT' },
             { name: 'checklistdetail', type: 'TEXT' },
             { name: 'checklistdesc2', type: 'TEXT' },
             { name: 'checklistgroupcode', type: 'INTEGER' },
             { name: 'checklistgroupdesc', type: 'TEXT' },
             { name: 'checklistgroupdesc2', type: 'TEXT' },
             

         ]
     });
});