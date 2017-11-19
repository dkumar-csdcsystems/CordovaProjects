app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
         {
             tablename: 'folderprocesslist',
             jspname2: '_FolderProcessList.jsp',
             fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER', keyColumn: true},
             { name: 'processrsn', type: 'INTEGER', keyColumn: true },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'scheduledate', type: 'TEXT' },
             { name: 'scheduleenddate', type: 'TEXT' },
             { name: 'startdate', type: 'TEXT' },
             { name: 'enddate', type: 'TEXT' },
             { name: 'processcomment', type: 'TEXT' },
             { name: 'assigneduser', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'statuscode', type: 'TEXT' },
             { name: 'attemptrsn', type: 'TEXT' },
             { name: 'attemptby', type: 'INTEGER' },
             { name: 'attemptdate', type: 'TEXT' },
             { name: 'resultcode', type: 'TEXT'},
             { name: 'attemptcomment', type: 'TEXT' }
             ]
         });
});