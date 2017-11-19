




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderprocess',
         jspname1: '_ReassignedProcess.jsp',
         jspname2: '_NewInspections.jsp',
			 fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'processrsn', type: 'INTEGER' },
             { name: 'folderrsn', type: 'INTEGER' },
             { name: 'processcode', type: 'INTEGER' },
             { name: 'startdate', type: 'TEXT' },
             { name: 'assigneduser', type: 'TEXT' },
             { name: 'scheduledate', type: 'TEXT' },
             { name: 'priority', type: 'TEXT' },
             { name: 'displayorder', type: 'INTEGER' },                           
             { name: 'comments', type: 'TEXT' },            
             { name: 'processcomment', type: 'TEXT' },
             { name: 'statuscode', type: 'INTEGER' },             
             { name: 'scheduleenddate', type: 'TEXT' },
             { name: 'reference', type: 'TEXT' },
             { name: 'teamcode', type: 'INTEGER' },
             { name: 'teamdesc', type: 'TEXT' },
             { name: 'inspminute', type: 'INTEGER' },
             { name: 'coordx', type: 'TEXT', notmapped: true },
             { name: 'coordy', type: 'TEXT', notmapped: true },
             { name: 'isnew', type: 'TEXT', notmapped: true },
             { name: 'isedited', type: 'TEXT', notmapped: true },
             { name: 'enddate', type: 'TEXT', notmapped: true },
             { name: 'folderid', type: 'INTEGER', notmapped: true },
			 { name: 'isreschedule', type: 'TEXT', notmapped: true },
			 { name: 'ispriority', type: 'TEXT', notmapped: true },
			 { name: 'isfailed', type: 'TEXT', notmapped: true },
			 { name: 'reassigneduser', type: 'TEXT', notmapped: true },
			 { name: 'beforerescheduledate', type: 'TEXT', notmapped: true },
			 { name: 'beforerescheduleenddate', type: 'TEXT', notmapped: true },
         ]
     });
});