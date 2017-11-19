




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'folderprocessattempt',
    jspname2: '_ProcessAtm.jsp',
    //jspname2: '_AllProcessAtm.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'folderrsn', type: 'INTEGER', keyColumn: true },
        { name: 'processrsn', type: 'INTEGER', keyColumn: true },
        { name: 'attemptrsn', type: 'INTEGER', keyColumn: true },
        { name: 'attemptby', type: 'TEXT' },
        { name: 'attemptdate', type: 'TEXT' },
        { name: 'resultcode', type: 'INTEGER' },
        { name: 'attemptcomment', type: 'TEXT' },
        //newly added columns in table folderprocessattempt which is not matched with jsp cols
        { name: 'overtime', type: 'TEXT', notmapped: true },
        { name: 'timeunit', type: 'TEXT', notmapped: true },
        { name: 'unittype', type: 'TEXT', notmapped: true },
        { name: 'expenseamount', type: 'TEXT', notmapped: true },
        { name: 'mileageamount', type: 'TEXT', notmapped: true },
        { name: 'processid', type: 'INTEGER', notmapped: true }
    ]
});
});