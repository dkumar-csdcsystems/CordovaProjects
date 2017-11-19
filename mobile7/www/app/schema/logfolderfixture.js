




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderfixture',
         deletedtablename: 'folderfixture',
         jspname: '_deletedFolderFixture.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER' },
             //{ name: 'logtype', type: 'TEXT' },
             //{ name: 'logdate', type: 'TEXT' },           
             { name: 'fixturecode', type: 'INTEGER' },
             { name: 'fixtureclass', type: 'TEXT' },
             { name: 'fixturesize', type: 'INTEGER' },


         ]
     });
});