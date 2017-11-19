app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'foldercomment',
         jspname: '_FolderComment.jsp',
         jspname2: '_NewFolderComment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },            
             { name: 'folderrsn', type: 'INTEGER' },
             { name: 'commentdate', type: 'TEXT' },
             { name: 'commentuser', type: 'TEXT' },
             { name: 'reminderdate', type: 'TEXT' },
             { name: 'comments', type: 'TEXT' },
             { name: 'includeontodo', type: 'TEXT' },
             { name: 'commentgroupcode', type: 'TEXT' },
             { name: 'commentgroupdesc', type: 'TEXT' },
           

         ]
     });});