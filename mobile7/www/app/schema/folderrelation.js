app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
        {
            tablename: 'folderrelation',
            jspname: '',
            jspname2: '_FolderRelation.jsp',
            fields: [
                { name: 'id', type: 'INTEGER', primary: true, serial: true },
                { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
                { name: 'foldertype', type: 'TEXT' },
                { name: 'foldercentury', type: 'TEXT' },
                { name: 'folderyear', type: 'TEXT' },
                { name: 'foldersequence', type: 'TEXT' },
                { name: 'foldersection', type: 'TEXT' },
                { name: 'folderrevision', type: 'TEXT' },
                { name: 'parentrsn', type: 'INTEGER' },
            ]
        });
});

