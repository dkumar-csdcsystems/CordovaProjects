//tx.executeSql("CREATE TABLE IF NOT EXISTS  validfolder ( id INTEGER PRIMARY KEY AUTOINCREMENT, foldertype TEXT, folderdesc TEXT, violationflag TEXT,
//folderdesc2 TEXT, peoplecode INTEGER, propertyrequired TEXT, promptmultipleproperty TEXT,  subtypeentryrequired TEXT, workcodeentryrequired TEXT )", [],





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'validfolder',
         jspname: '_PermitLayoutDeclaration.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'foldertype', type: 'TEXT' },
             { name: 'folderdesc', type: 'TEXT' },
             { name: 'violationflag', type: 'TEXT' },
             { name: 'folderdesc2', type: 'TEXT' },
             { name: 'peoplecode', type: 'INTEGER' },
             { name: 'propertyrequired', type: 'TEXT' },
             { name: 'promptmultipleproperty', type: 'TEXT' },
             { name: 'subtypeentryrequired', type: 'TEXT' },
             { name: 'workcodeentryrequired', type: 'TEXT' },


         ]
     });});