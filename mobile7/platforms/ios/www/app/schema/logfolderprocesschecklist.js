




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'logfolderprocesschecklist',
         deletedtablename: 'folderprocesschecklist',
         jspname2: '_FolderProcessCheckListDel.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },         
              { name: 'processrsn', type: 'INTEGER' },
              { name: 'checklistcode', type: 'INTEGER' },
         ]
     });
});