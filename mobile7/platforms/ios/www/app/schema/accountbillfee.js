app.config(function (schemaserviceProvider) {
    schemaserviceProvider.setSchema(
        {
            tablename: 'accountbillfee',
            jspname: '_AccountBillFee.jsp',
            jspname2: '_NewAccountBillFee.jsp',
            fields: [
                { name: 'id', type: 'INTEGER', primary: true, serial: true },
                { name: 'accountbillfeersn', type: 'INTEGER' },
                { name: 'folderrsn', type: 'INTEGER' },
                { name: 'feecode', type: 'INTEGER' },
                { name: 'feedesc', type: 'TEXT' },
                { name: 'feeamount', type: 'INTEGER' },
                { name: 'billnumber', type: 'INTEGER' },
                { name: 'feeleft', type: 'INTEGER' },
                { name: 'duedate', type: 'TEXT' },
                { name: 'feecomment', type: 'TEXT' },
                { name: 'billitemsequence', type: 'INTEGER' },
                { name: 'displayorder', type: 'INTEGER' },
                { name: 'processrsn', type: 'INTEGER' },
                { name: 'dategenerated', type: 'TEXT' }

            ]
        });
});

