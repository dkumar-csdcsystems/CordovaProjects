//tx.executeSql("CREATE TABLE IF NOT EXISTS  validchecklist ( id INTEGER PRIMARY KEY AUTOINCREMENT, country TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validprovince',
    jspname: '_ValidCountry.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'country', type: 'TEXT' }
    ]
});});