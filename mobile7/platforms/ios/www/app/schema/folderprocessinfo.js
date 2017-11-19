//tx.executeSql("CREATE TABLE IF NOT EXISTS  validattachment ( id INTEGER PRIMARY KEY AUTOINCREMENT, attachmentcode INTEGER, attachmentdesc TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderprocessinfo',
         jspname2: 'Paged_FolderProcessInfo.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processrsn', type: 'INTEGER', keyColumn: true },
             { name: 'infocode', type: 'INTEGER', keyColumn: true },
             { name: 'infovalue', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'stampdate', type: 'TEXT' },
             { name: 'isnew', type: 'TEXT', notmapped: true },
             { name: 'isedited', type: 'TEXT', notmapped: true },
             { name: 'processid', type: 'INTEGER', notmapped: true }
         ]
     });
});