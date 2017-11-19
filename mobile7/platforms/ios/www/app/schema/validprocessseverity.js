




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validprocessseverity',
    jspname: '_DeficiencySeverity.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'severitycode', type: 'INTEGER' },
        { name: 'severitydesc', type: 'TEXT' },
        { name: 'severitydemerit', type: 'INTEGER' },
        { name: 'defaultdaystocomply', type: 'INTEGER' },
        { name: 'severitydesc2', type: 'TEXT' }
    ]
});});