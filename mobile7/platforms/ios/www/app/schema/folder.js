




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folder',
         jspname: '_Permit.jsp',
         jspname2: '_NewFolder.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
             { name: 'propertyrsn', type: 'TEXT' },
             { name: 'foldertype', type: 'TEXT' },
             { name: 'foldercentury', type: 'TEXT' },
             { name: 'folderyear', type: 'TEXT' },
             { name: 'foldersequence', type: 'TEXT' },
             { name: 'foldersection', type: 'TEXT' },
             { name: 'folderrevision', type: 'TEXT' },
             { name: 'statuscode', type: 'TEXT' },
             { name: 'indate', type: 'TEXT' },
             { name: 'issuedate', type: 'TEXT' },
             { name: 'expirydate', type: 'TEXT' },
             { name: 'referencefile', type: 'INTEGER' },
             { name: 'finaldate', type: 'TEXT' },
             { name: 'subcode', type: 'TEXT' },
             { name: 'foldername', type: 'TEXT' },
             { name: 'workcode', type: 'TEXT' },
             { name: 'folderdescription', type: 'TEXT' },
             { name: 'foldercondition', type: 'TEXT' },
             { name: 'priority', type: 'TEXT' },
             { name: 'parentrsn', type: 'TEXT' },
             { name: 'isnew', type: 'TEXT', notmapped: true }
         ]
     });});