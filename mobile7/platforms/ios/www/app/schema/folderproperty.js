




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderproperty',
         jspname: '_Property.jsp',
         jspname2: '_NewFolderProperty.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
             { name: 'propertyrsn', type: 'INTEGER', keyColumn: true },
             { name: 'propertyrelationcode', type: 'TEXT' },
             /*{ name: 'familyrsn', type: 'INTEGER' },
             { name: 'propertyroll', type: 'TEXT' },
             { name: 'propgisid1', type: 'TEXT' },
              { name: 'parentpropertyrsn', type: 'TEXT' },
             { name: 'datecreated', type: 'TEXT' },
             { name: 'dateobsoleted', type: 'TEXT' },
             { name: 'prophouse', type: 'TEXT' },
             { name: 'propstreet', type: 'TEXT' },
             { name: 'propstreettype', type: 'TEXT' },
             { name: 'propcity', type: 'TEXT' },
             { name: 'propprovince', type: 'TEXT' },
             { name: 'proppostal', type: 'TEXT' },
             { name: 'propunittype', type: 'TEXT' },
             { name: 'propunit', type: 'TEXT' },
             { name: 'propertyname', type: 'TEXT' },
             { name: 'legaldesc', type: 'TEXT' },
             { name: 'statuscode', type: 'TEXT' },
             { name: 'proparea', type: 'TEXT' },
             { name: 'propfrontage', type: 'TEXT' },
             { name: 'propdepth', type: 'TEXT' },
             { name: 'propcrossstreet', type: 'TEXT' },
             { name: 'zonetype1', type: 'TEXT' },
             { name: 'propplan', type: 'TEXT' },
             { name: 'proplot', type: 'TEXT' },
             { name: 'propsection', type: 'TEXT' },
             { name: 'proptownship', type: 'TEXT' },
             { name: 'proprange', type: 'TEXT' },
             { name: 'routecode', type: 'TEXT' },
             { name: 'propcomment', type: 'TEXT' },
             { name: 'propstreetdirection', type: 'TEXT' },
             { name: 'zonetype2', type: 'TEXT' },
             { name: 'zonetype3', type: 'TEXT' },
             { name: 'zonetype4', type: 'TEXT' },
             { name: 'zonetype5', type: 'TEXT' },
             { name: 'propx', type: 'INTEGER' },
             { name: 'propy', type: 'INTEGER' },
             { name: 'propstreetprefix', type: 'TEXT' },
             { name: 'countydesc', type: 'TEXT' },
             { name: 'propcode', type: 'TEXT' },*/
             { name: 'isnew', type: 'TEXT', notmapped: true },
             { name: 'folderid', type: 'INTEGER', notmapped: true }
         ]
     });
});