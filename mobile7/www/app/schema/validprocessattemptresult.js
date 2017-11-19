app.config(function(schemaserviceProvider) {
    schemaserviceProvider.setSchema(
    {
        tablename: 'validprocessattemptresult',
        jspname: '_ValidProcessAttemptResult.jsp',
        fields: [
            { name: 'id', type: 'INTEGER', primary: true, serial: true },
            { name: 'resultcode', type: 'TEXT' },
            { name: 'resultdesc', type: 'TEXT' },
            { name: 'processstatuscode', type: 'TEXT' },
            { name: 'clockstatuscode', type: 'TEXT' },
            { name: 'activityflag', type: 'TEXT' },
            { name: 'resultdesc2', type: 'TEXT' }
        ]
    });
});