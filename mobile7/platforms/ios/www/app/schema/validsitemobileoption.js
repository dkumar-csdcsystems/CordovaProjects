//tx.executeSql("CREATE TABLE IF NOT EXISTS  validsitemobileoption ( id INTEGER PRIMARY KEY AUTOINCREMENT, optionkey TEXT, optionvalue TEXT, comments TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validsitemobileoption',
    jspname: '_ValidSiteMobileOption.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'optionkey', type: 'TEXT' },
        { name: 'optionvalue', type: 'TEXT' },
        { name: 'comments', type: 'TEXT' }
    ]
});});