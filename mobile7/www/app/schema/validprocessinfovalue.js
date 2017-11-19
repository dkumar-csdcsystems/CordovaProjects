//tx.executeSql("CREATE TABLE IF NOT EXISTS  validprocessinfovalue ( id INTEGER PRIMARY KEY AUTOINCREMENT, infocode INTEGER, infovalue TEXT, infovalue2 TEXT)", [],





app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: 'validprocessinfovalue',
        jspname: '_ValidProcessInfoValue.jsp',
        fields: [
            { name: 'id', type: 'INTEGER', primary: true, serial: true },
            { name: 'infocode', type: 'INTEGER' },
            { name: 'infovalue', type: 'TEXT' },
            { name: 'infovalue2', type: 'TEXT' },
            { name: 'infodesc', type: 'TEXT' },
            { name: 'infodesc2', type: 'TEXT' }
        ]
    });
});