app.factory("loadParserService", function (utilService) {
    return {
        lineSeperator: 'Æ',
        columnSeperator: '¥',
        tableName: 'validinfo',
        getDataRows: function (rawData) {
            var rows = rawData.trim().split(this.lineSeperator);
            return rows;
            //var initialQuery = Ext.String.format('INSERT INTO {0} (FolderRSN, House, StreetPrefix', table);
        },

        getDataColumns: function (rawData) {
            var cols = rawData.trim().split(this.columnSeperator);
            return cols;
        },

        cleanTable: function () {
            try {
                var me = this,
                    db = dbInitService.getdatabase(),
                    table = this.tableName;
                if (db) {
                    db.transaction(function (tx) {
                        var sql = String.format('DELETE FROM {0}', table);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                utilService.logtoConsole(String.format('{0} table cleaned for initial sync', table));
                            },
                            function (tx, error) {
                                utilService.logtoConsole(error, 'error');
                            });
                    });
                } else {
                    throw new Error('error opening sqlite database');
                }

            } catch (e) {
                utilService.logtoConsole(e, 'error');
            }
        },
    };
});