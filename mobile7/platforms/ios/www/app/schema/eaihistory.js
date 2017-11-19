app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: 'eaihistory',
        jspname: '',
        fields: [
            { name: 'id', type: 'INTEGER', primary: true, serial: true },
            { name: 'folderrsn', type: 'INTEGER' },
            { name: 'processrsn', type: 'INTEGER' },
            { name: 'request', type: 'TEXT'},
            { name: 'response', type: 'INTEGER' },
            { name: 'stampdate', type: 'TEXT' }
        ]
    });
});