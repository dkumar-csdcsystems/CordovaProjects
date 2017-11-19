//tx.executeSql("CREATE TABLE IF NOT EXISTS  validusertrusted ( id INTEGER PRIMARY KEY AUTOINCREMENT, userid TEXT, trusteduserid TEXT, 
//processdesc2 TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validusertrusted',
    jspname: '_InspectorTrusted.jsp',

    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'userid', type: 'TEXT' },
        { name: 'trusteduserid', type: 'TEXT' }
    ]
});});