




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validstreettype',
    jspname: '_ValidStreetType.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'streettype', type: 'TEXT' },
        { name: 'streettypedesc', type: 'TEXT' }
    ]
});});