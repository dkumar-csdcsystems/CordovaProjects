




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfreeformtab',
         jspname: '_ValidFreeformTab.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
              { name: 'freeformcode', type: 'INTEGER' },
                { name: 'parentname', type: 'TEXT' },
                { name: 'foldertype', type: 'TEXT' },
                { name: 'processcode', type: 'INTEGER' },
                { name: 'taborder', type: 'INTEGER' },
                { name: 'tabdesc', type: 'TEXT' },
                { name: 'tabdesc2', type: 'TEXT' },


         ]
     });});