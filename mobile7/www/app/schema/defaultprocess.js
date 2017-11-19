//tx.executeSql("CREATE TABLE IF NOT EXISTS  defaultprocess ( id INTEGER PRIMARY KEY AUTOINCREMENT, foldertype TEXT, folderstage INTEGER, 
//processcode INTEGER, displayorder INTEGER, mandatoryflag TEXT, userid INTEGER, ConversionFlag TEXT, duedatecalc INTEGER, 
//completiondays INTEGER, completiondaystype TEXT, duedatecalctype TEXT, printflag TEXT)", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'defaultprocess',
    jspname: '_DefaultProcess.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'foldertype', type: 'TEXT' },
        { name: 'folderstage', type: 'INTEGER' },
        { name: 'processcode', type: 'INTEGER' },
        { name: 'mandatoryflag', type: 'TEXT' },
        { name: 'displayorder', type: 'INTEGER' }
    ]
});});