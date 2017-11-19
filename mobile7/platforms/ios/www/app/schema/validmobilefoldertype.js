app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
         tablename: 'validmobilefoldertype',
         jspname: '_PermitLayoutDepartment.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'foldertype', type: 'TEXT' },
             { name: 'foldergroupcode', type: 'INTEGER' }
             /*{ name: 'violationflag', type: 'TEXT' },
             { name: 'folderdesc2', type: 'TEXT' },
             { name: 'peoplecode', type: 'TEXT' },
             { name: 'propertyrequired', type: 'TEXT' },
             { name: 'propmtmultipleproperty', type: 'TEXT' },
             { name: 'subtypeentryrequired', type: 'TEXT' },
             { name: 'workcodeentryrequired', type: 'TEXT' }             */
            
         ]
    });
});