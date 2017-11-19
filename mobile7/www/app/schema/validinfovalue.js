//tx.executeSql("CREATE TABLE IF NOT EXISTS  validinfovalue ( id INTEGER PRIMARY KEY AUTOINCREMENT, infocode INTEGER ,infovalue TEXT, peoplecode TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validinfovalue',
         jspname: '_ValidInfoValue.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'infocode', type: 'INTEGER' },
             { name: 'infovalue', type: 'TEXT' },
             { name: 'infodesc', type: 'TEXT' },
             { name: 'infodesc2', type: 'TEXT' },
             

         ]
     });});