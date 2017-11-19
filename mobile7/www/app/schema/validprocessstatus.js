//tx.executeSql("CREATE TABLE IF NOT EXISTS  validprocessstatus ( id INTEGER PRIMARY KEY AUTOINCREMENT, statuscode INTEGER, statusdesc TEXT, statusdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validprocessstatus',
    jspname: '_ValidProcessStatus.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'statuscode', type: 'INTEGER' },
        { name: 'statusdesc', type: 'TEXT' },
        { name: 'statusdesc2', type: 'TEXT' }
    ]
});});