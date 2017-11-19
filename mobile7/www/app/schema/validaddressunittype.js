//tx.executeSql("CREATE TABLE IF NOT EXISTS  validaddressunittype ( id INTEGER PRIMARY KEY AUTOINCREMENT, addressunittype TEXT, addressunittypedesc TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validaddressunittype',
         jspname: '_ValidAddressUnitType.jsp',

         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'addressunittype', type: 'TEXT' },
             { name: 'addressunittypedesc', type: 'TEXT' },

         ]
     });
});