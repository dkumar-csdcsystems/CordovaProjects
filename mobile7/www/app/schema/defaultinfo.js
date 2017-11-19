//tx.executeSql("CREATE TABLE IF NOT EXISTS  defaultinfo ( id INTEGER PRIMARY KEY AUTOINCREMENT, InfoCode INTEGER, foldertype TEXT, 
//infovalue TEXT, displayorder INTEGER, displayorder TEXT, requiredforinitialsetup TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'defaultinfo',
    jspname: '_DefaultInfo.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'foldertype', type: 'TEXT', keyColumn: true },
        { name: 'infocode', type: 'INTEGER', keyColumn: true },
        { name: 'infovalue', type: 'TEXT' },
        { name: 'displayorder', type: 'INTEGER' },
        { name: 'mandatory', type: 'TEXT' },
        { name: 'requiredforinitialsetup', type: 'TEXT' }
    ]
});});