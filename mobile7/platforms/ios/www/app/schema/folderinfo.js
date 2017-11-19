




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderinfo',
         jspname: '_FolderInfo.jsp',
         jspname2: 'Paged_NewFolderInfo.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
             { name: 'infocode', type: 'INTEGER', keyColumn: true },
             { name: 'infovalue', type: 'TEXT' },
             { name: 'mandatory', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },
             { name: 'valuerequired', type: 'TEXT' },
             { name: 'isnew', type: 'TEXT', notmapped:true },
             { name: 'isedited', type: 'TEXT', notmapped: true },
             { name: 'folderid', type: 'INTEGER', notmapped: true }
         ]
     });
});