




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'folderfixture',
    jspname: '_FolderFixture.jsp',
    jspname2: '_NewFolderFixture.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
        { name: 'fixturecode', type: 'INTEGER', keyColumn: true },
        { name: 'fixtureclass', type: 'TEXT', keyColumn: true },
        { name: 'fixturesize', type: 'INTEGER', keyColumn: true },
        { name: 'quantity', type: 'INTEGER' },
        { name: 'displayorder', type: 'INTEGER' },
        { name: 'fixtureunit', type: 'TEXT' },
        { name: 'remark', type: 'TEXT' },
        { name: 'securitycode', type: 'INTEGER' }
    ]
});
});