//tx.executeSql("CREATE TABLE IF NOT EXISTS  validsub ( id INTEGER PRIMARY KEY AUTOINCREMENT, subcode INTEGER, subdesc TEXT, subdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validphonetype',
         jspname: '_ValidPhoneType',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'titlename', type: 'TEXT' },

         ]
     });});