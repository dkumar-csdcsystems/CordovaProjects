




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderprocessdeficiency',
         jspname: '_Deficiency.jsp',
         jspname2: 'Paged_NewDeficiency.jsp',
         fields: [
                { name: 'id', type: 'INTEGER', primary: true, serial: true },
                { name: 'processrsn', type: 'INTEGER', keyColumn: true },
                { name: 'deficiencycode', type: 'INTEGER', keyColumn: true },
                { name: 'deficiencytext', type: 'TEXT' },
                { name: 'insertdate', type: 'TEXT' },
                { name: 'complybydate', type: 'TEXT' },
                { name: 'datecomplied', type: 'TEXT' },
                { name: 'locationdesc', type: 'TEXT', keyColumn: true },
                { name: 'sublocationdesc', type: 'TEXT', keyColumn: true },
                { name: 'statuscode', type: 'INTEGER' },
                { name: 'severitycode', type: 'INTEGER' },
                { name: 'actioncode', type: 'INTEGER' }, 
                { name: 'referencenum', type: 'TEXT' },
                { name: 'occurancecount', type: 'INTEGER', keyColumn: true },
                { name: 'remedytext', type: 'TEXT' },
                { name: 'stampdate', type: 'TEXT' },
                { name: 'deficiencyid', type: 'INTEGER' },
                { name: 'isnew', type: 'TEXT', notmapped: true },
                { name: 'isedited', type: 'TEXT', notmapped: true },
                { name: 'processid', type: 'INTEGER', notmapped: true }
         ]
     });
});