//tx.executeSql("CREATE TABLE IF NOT EXISTS  validclause ( id INTEGER PRIMARY KEY AUTOINCREMENT, clausersn INTEGER, clausegroup TEXT, clausetext TEXT, displayorder INTEGER
// clausetext2 TEXT, clausegroup2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validclause',
         jspname: '_ValidClause.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'clausersn', type: 'INTEGER' },
             { name: 'clausegroup', type: 'TEXT' },
             { name: 'clausetext', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'clausetext2', type: 'TEXT' },
             { name: 'clausegroup2', type: 'TEXT' },

         ]
     });
});