//tx.executeSql("CREATE TABLE IF NOT EXISTS  validsub ( id INTEGER PRIMARY KEY AUTOINCREMENT, subcode INTEGER, subdesc TEXT, subdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validsub',
         jspname: '_ValidSub.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'subcode', type: 'INTEGER' },
             { name: 'subdesc', type: 'TEXT' },
             { name: 'subdesc2', type: 'TEXT' },

         ]
     });});