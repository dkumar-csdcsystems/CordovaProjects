//tx.executeSql("CREATE TABLE IF NOT EXISTS  validattachment ( id INTEGER PRIMARY KEY AUTOINCREMENT, attachmentcode INTEGER, attachmentdesc TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validattachment',
         jspname: '_ValidAttachment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'attachmentcode', type: 'TEXT' },
             { name: 'attachmentdesc', type: 'TEXT' },

         ]
     });
});