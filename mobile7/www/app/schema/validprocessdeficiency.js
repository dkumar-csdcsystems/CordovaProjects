




app.config(function (schemaserviceProvider) {schemaserviceProvider.setSchema(
{
    tablename: 'validprocessdeficiency',
    jspname: '_InspectionTypeDeficiency.jsp',
    fields: [
        { name: 'id', type: 'INTEGER', primary: true, serial: true },
        { name: 'deficiencycode', type: 'INTEGER', keyColumn: true },
        { name: 'processcode', type: 'INTEGER', keyColumn: true },
        { name: 'defaultstatuscode', type: 'INTEGER' },
        { name: 'defaultseveritycode', type: 'INTEGER' },
        { name: 'defaultlocationdesc', type: 'TEXT' },
        { name: 'defaultsublocationdesc', type: 'TEXT' }
        /*{ name: 'defaultlocationdesc2', type: 'TEXT' },
        { name: 'defaultsublocationdesc2', type: 'TEXT' },*/
    ]
});});