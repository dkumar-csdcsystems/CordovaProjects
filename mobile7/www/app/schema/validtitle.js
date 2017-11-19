//tx.executeSql("CREATE TABLE IF NOT EXISTS  validsub ( id INTEGER PRIMARY KEY AUTOINCREMENT, subcode INTEGER, subdesc TEXT, subdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validtitle',
         jspname: '_ValidTitle.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'titleid', type: 'TEXT' },
             { name: 'desc', type: 'TEXT' },
             { name: 'desc2', type: 'TEXT' },

         ]
     });});