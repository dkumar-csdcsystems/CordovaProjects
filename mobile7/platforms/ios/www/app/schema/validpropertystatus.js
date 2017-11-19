//tx.executeSql("CREATE TABLE IF NOT EXISTS  validpropertystatus ( id INTEGER PRIMARY KEY AUTOINCREMENT, statuscode INTEGER, statusdesc TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validpropertystatus',
    jspname: '_ValidPropertyStatus.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'statuscode', type: 'INTEGER' },
        { name: 'statusdesc', type: 'TEXT' }
    ]
});});