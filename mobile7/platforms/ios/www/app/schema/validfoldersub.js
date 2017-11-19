//tx.executeSql("CREATE TABLE IF NOT EXISTS  validfoldersub ( id INTEGER PRIMARY KEY AUTOINCREMENT, foldertype TEXT ,subcode INTEGER, subgroup TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfoldersub',
         jspname: '_ValidFolderSub.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'foldertype', type: 'TEXT' },
             { name: 'subcode', type: 'INTEGER' },
             { name: 'subgroup', type: 'TEXT' },
            
         ]
     });});