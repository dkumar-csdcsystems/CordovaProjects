//tx.executeSql("CREATE TABLE IF NOT EXISTS  validprocessinfo ( id INTEGER PRIMARY KEY AUTOINCREMENT, infocode INTEGER, infodesc TEXT, infotype TEXT, infogroup TEXT,
//infodesc2 TEXT, infogroup2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validprocessinfo',
    jspname: '_ValidProcessInfo.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'infocode', type: 'INTEGER' },
        { name: 'infodesc', type: 'TEXT' },
        { name: 'infotype', type: 'TEXT' },
        { name: 'infogroup', type: 'TEXT' },
        { name: 'infodesc2', type: 'TEXT' },
        { name: 'infogroup2', type: 'TEXT' }
    ]
});});