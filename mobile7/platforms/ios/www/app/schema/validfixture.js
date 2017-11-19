//tx.executeSql("CREATE TABLE IF NOT EXISTS  validfixture ( id INTEGER PRIMARY KEY AUTOINCREMENT, fixturecode INTEGER ,fixturedesc TEXT, conversionflag TEXT,
//callflag TEXT, fixturedesc2 TEXT, fixturegroup2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validfixture',
    jspname: '_ValidFixture.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'fixturecode', type: 'INTEGER' },
        { name: 'fixturedesc', type: 'TEXT' },
        { name: 'conversionflag', type: 'TEXT' },
        { name: 'fixturegroup', type: 'TEXT' },
        { name: 'callflag', type: 'TEXT' },
        { name: 'fixturedesc2', type: 'TEXT' },
        { name: 'fixturegroup2', type: 'TEXT' }
    ]
});});