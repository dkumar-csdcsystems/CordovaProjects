





app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
     {
         tablename: 'folderpeople',
         jspname: '_People.jsp',
         jspname2: '_NewFolderPeople.jsp',
         fields: [
             { name: 'id', type: 'INTEGER', primary: true, serial: true },
             { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
             { name: 'peoplersn', type: 'INTEGER', keyColumn: true },
             { name: 'relation', type: 'INTEGER', keyColumn: true },
             /*{ name: 'parentrsn', type: 'INTEGER' },
             { name: 'familyrsn', type: 'TEXT' },
             { name: 'nametitle', type: 'TEXT' },
             { name: 'namefirst', type: 'TEXT' },
             { name: 'namelast', type: 'TEXT' },
             { name: 'birthdate', type: 'TEXT' },
             { name: 'addrprefix', type: 'TEXT' },
             { name: 'addrhouse', type: 'TEXT' },
             { name: 'addrstreet', type: 'TEXT' },
             { name: 'addrstreettype', type: 'TEXT' },
             { name: 'addrcity', type: 'TEXT' },
             { name: 'addrprovince', type: 'TEXT' },
             { name: 'addrcountry', type: 'TEXT' },
             { name: 'addrpostal', type: 'TEXT' },
             { name: 'phone1', type: 'TEXT' },
             { name: 'phone1desc', type: 'TEXT' },
             { name: 'phone2', type: 'TEXT' },
             { name: 'phone2desc', type: 'TEXT' },
             { name: 'phone3', type: 'TEXT' },
             { name: 'phone3desc', type: 'TEXT' },
             { name: 'emailaddress', type: 'TEXT' },
             { name: 'comments', type: 'TEXT' },
             { name: 'addrunittype', type: 'TEXT' },
             { name: 'addrunit', type: 'TEXT' },
             { name: 'licencenumber', type: 'TEXT' },
             { name: 'organisationname', type: 'TEXT' },
             { name: 'addressline1', type: 'TEXT' },
             { name: 'addressline2', type: 'TEXT' },
             { name: 'addressline3', type: 'TEXT' },
             { name: 'statuscode', type: 'TEXT' },
             { name: 'namesuffix', type: 'TEXT' },
             { name: 'namemiddle', type: 'TEXT' },
             { name: 'addrstreetprefix', type: 'TEXT' },
             { name: 'addrstreetdirection', type: 'TEXT' },
             { name: 'countydesc', type: 'TEXT' },
             { name: 'peoplecode', type: 'TEXT' },*/
             { name: 'isnew', type: 'TEXT' , notmapped: true },
             { name: 'folderid', type: 'INTEGER', notmapped: true }
         ]
     });
});