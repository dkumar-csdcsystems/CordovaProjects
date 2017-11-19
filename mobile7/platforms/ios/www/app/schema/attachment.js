app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
{
    tablename: 'attachment',
    jspname2: '_AllProcessAttachments.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'tablersn', type: 'INTEGER' },
        { name: 'attachmentrsn', type: 'INTEGER', keyColumn: true },
        { name: 'attachmentdesc', type: 'TEXT' },
        { name: 'attachmentdetail', type: 'TEXT' },
        { name: 'attachmentfilealias', type: 'TEXT' },
        { name: 'attachmentfilesuffix', type: 'TEXT' },
        { name: 'attachmentcontenttype', type: 'TEXT' },
        { name: 'tablename', type: 'TEXT' },
        { name: 'attchmentcode', type: 'TEXT', notmapped: true },
        { name: 'blob', type: 'TEXT', notmapped: true },
        { name: 'isnew', type: 'TEXT', notmapped: true },
        { name: 'isedited', type: 'TEXT', notmapped: true },
        { name: 'processid', type: 'INTEGER', notmapped: true }
    ]
});
});