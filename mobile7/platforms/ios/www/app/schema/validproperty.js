//tx.executeSql("CREATE TABLE IF NOT EXISTS  validproperty ( id INTEGER PRIMARY KEY AUTOINCREMENT, propcode INTEGER, propdesc TEXT, propdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validproperty',
    jspname: '_ValidProperty.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'propcode', type: 'INTEGER' },
        { name: 'propdesc', type: 'TEXT' },
        { name: 'propdesc2', type: 'TEXT' }
    ]
});});