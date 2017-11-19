//tx.executeSql("CREATE TABLE IF NOT EXISTS  validfoldergroup ( id INTEGER PRIMARY KEY AUTOINCREMENT, foldergroupcode INTEGER, foldergroupdesc TEXT, 
//foldergroupdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfoldergroup',
         jspname: '_Department.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'foldergroupcode', type: 'INTEGER' },
             { name: 'foldergroupdesc', type: 'TEXT' },
             { name: 'foldergroupdesc2', type: 'TEXT' },             

         ]
     });});