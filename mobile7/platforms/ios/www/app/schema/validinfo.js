//tx.executeSql("CREATE TABLE IF NOT EXISTS  ValidInfo ( id INTEGER PRIMARY KEY AUTOINCREMENT, InfoCode INTEGER, InfoDesc TEXT, 
//InfoDesc2 TEXT, InfoType TEXT, InfoGroup TEXT, InfoGroupDisplayOrder INTEGER, ConversionFlag TEXT, DisplayFormat TEXT, 
//WebDisplayFlag TEXT, StatisticFolderInfo TEXT, StatisticPeopleInfo TEXT, WebHelp TEXT)", [],


app.config(function(schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: 'validinfo',
        jspname: '_ValidInfo.jsp',
        fields: [
            { name: 'id', type: 'INTEGER', primary: true, serial: true },
            { name: 'infocode', type: 'INTEGER' },
            { name: 'infodesc', type: 'TEXT' },
            { name: 'infotype', type: 'TEXT' },
            { name: 'conversionflag', type: 'TEXT' },
            { name: 'infogroup', type: 'TEXT' },
            { name: 'displayformat', type: 'TEXT' },
            { name: 'webdisplayflag', type: 'TEXT' },
            { name: 'infogroupdisplayorder', type: 'TEXT' },
            { name: 'statisticfolderinfo', type: 'TEXT' },
            { name: 'statisticpeopleinfo', type: 'TEXT' },
            { name: 'infodesc2', type: 'TEXT' },
            { name: 'webhelp', type: 'TEXT' }
        ]
    });
});
     //{
     //    tablename: 'validinfo',
     //    fields: [
     //        { name: 'id', type: 'INTEGER', primary: true, serial: true },
     //        { name: 'infocode', type: 'TEXT' },
     //        { name: 'infodesc', type: 'TEXT' },
     //        { name: 'infotype', type: 'TEXT' },
     //        { name: 'infogroup', type: 'TEXT' },
     //        { name: 'conversionflag', type: 'TEXT' },
     //        { name: 'infogroup', type: 'TEXT' },
     //        { name: 'displayformat', type: 'TEXT' },
     //        { name: 'webdisplayflag', type: 'TEXT' },
     //        { name: 'infogroupdisplayorder', type: 'TEXT' },
     //        { name: 'statisticfolderinfo', type: 'TEXT' },
     //        { name: 'statisticpeopleinfo', type: 'TEXT' },
     //        { name: 'infodesc2', type: 'TEXT' },
     //        { name: 'webhelp', type: 'TEXT' },
     //    ],
     //});});