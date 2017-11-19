//tx.executeSql("CREATE TABLE IF NOT EXISTS  validfolderwork ( id INTEGER PRIMARY KEY AUTOINCREMENT, foldertype TEXT ,workcode INTEGER, peoplecode INTEGER,
//subcode INTEGER)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfolderwork',
         jspname: '_ValidFolderWork.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'foldertype', type: 'TEXT' },
             { name: 'workcode', type: 'INTEGER' },
             { name: 'peoplecode', type: 'INTEGER' },
             { name: 'subcode', type: 'INTEGER' },

         ]
     });});