//tx.executeSql("CREATE TABLE IF NOT EXISTS  validwork ( id INTEGER PRIMARY KEY AUTOINCREMENT, workcode INTEGER, workdesc TEXT, workdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validwork',
    jspname: '_ValidWork.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'workcode', type: 'INTEGER' },
        { name: 'workdesc', type: 'TEXT' },
        { name: 'workdesc2', type: 'TEXT' }
    ]
});});