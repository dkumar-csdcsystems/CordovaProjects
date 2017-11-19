app.factory("dbInitService", function (utilService, schemaservice, cfpLoadingBar) {
    return {
        database: null,
        dbname: undefined,
        createTableSql: 'CREATE TABLE IF NOT EXISTS  {0} ({1})',
        insertTableSql: 'INSERT INTO  {0} ({1})' + ' VALUES ({2})',
        jspNames: [
            /*Start of Full Sync Files*/
         //   { Name: '_Permit.jsp', SyncType: 'C', exgroup: '3', exorder: '0', countfirst: '1', LastSyncDate: '' },
         //   { Name: '_AllPeople.jsp', SyncType: 'C', exgroup: '3', exorder: '1', countfirst: '1', LastSyncDate: '' },
         //   { Name: '_AllProperty.jsp', SyncType: 'C', exgroup: '3', exorder: '2', countfirst: '1', LastSyncDate: '' },

         //   { Name: '_People.jsp', SyncType: 'C', exgroup: '4', exorder: '3', countfirst: '1', LastSyncDate: '' },
         //   { Name: '_Property.jsp', SyncType: 'C', exgroup: '4', exorder: '4', countfirst: '1', LastSyncDate: '' },
         ////   { Name: '_FolderFixture.jsp', SyncType: 'C', exgroup: '4', exorder: '5', countfirst: '1', LastSyncDate: '' },
         // //  { Name: '_FolderComment.jsp', SyncType: 'C', exgroup: '4', exorder: '6', countfirst: '1', LastSyncDate: '' },
         ////   { Name: '_AccountBillFee.jsp', SyncType: 'C', exgroup: '4', exorder: '7', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_FolderInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },

            { Name: '_ValidChecklist.jsp', SyncType: 'C', exgroup: '1', exorder: '8', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidProcessAttemptResult.jsp', SyncType: 'C', exgroup: '1', exorder: '9', countfirst: '1', LastSyncDate: '' },
            { Name: '_InspectionTypeDeficiency.jsp', SyncType: 'C', exgroup: '1', exorder: '10', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidPeople.jsp', SyncType: 'C', exgroup: '1', exorder: '11', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '12', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidInfoValue.jsp', SyncType: 'C', exgroup: '1', exorder: '13', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidClause.jsp', SyncType: 'C', exgroup: '1', exorder: '14', countfirst: '1', LastSyncDate: '' },

            //{ Name: '_deletedProperty.jsp', SyncType: 'C', exgroup: '1', exorder: '15', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolder.jsp', SyncType: 'C', exgroup: '1', exorder: '16', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedPeople.jsp', SyncType: 'C', exgroup: '1', exorder: '17', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolderPeople.jsp', SyncType: 'C', exgroup: '1', exorder: '18', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolderInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '19', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolderProperty.jsp', SyncType: 'C', exgroup: '1', exorder: '20', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolderFixture.jsp', SyncType: 'C', exgroup: '1', exorder: '21', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_deletedFolderComment.jsp', SyncType: 'C', exgroup: '1', exorder: '22', countfirst: '1', LastSyncDate: '' },

            { Name: '_DeficiencyRemedy.jsp', SyncType: 'C', exgroup: '1', exorder: '23', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidAddressUnitType.jsp', SyncType: 'C', exgroup: '1', exorder: '24', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidAttachment.jsp', SyncType: 'C', exgroup: '1', exorder: '25', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencySeverity.jsp', SyncType: 'C', exgroup: '1', exorder: '26', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencyStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '27', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencySubCategory.jsp', SyncType: 'C', exgroup: '1', exorder: '28', countfirst: '1', LastSyncDate: '' },
            { Name: '_DefaultDeficiencyStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '29', countfirst: '1', LastSyncDate: '' },
            //{ Name: '_InspectorTrusted.jsp', SyncType: 'C', exgroup: '1', exorder: '30', countfirst: '1', LastSyncDate: '' },
            { Name: '_DeficiencyType.jsp', SyncType: 'C', exgroup: '1', exorder: '31', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidProperty.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },

            { Name: '_Inspector.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },

            { Name: '_ValidProcessInfoValue.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidProcessInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_DefaultProcessInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidSub.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidWork.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ListFolderStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidProcessStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_DefaultProcess.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_PermitLayoutDeclaration.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_PermitLayoutDepartment.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencyCategory.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencyAction.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_DeficiencyLocation.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFixture.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_DefaultInfo.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidFolderSub.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidFolderWork.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_Department.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidCountry.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_InspectionType.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_ValidPeopleStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidPropertyStatus.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidStreetDirection.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidTitle.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidPhoneType.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidStreetType.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_MobileSiteLicense.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidSiteMobileOption.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_InspectionTypeItem.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_InspectionResults.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },
            { Name: '_InspectionTypeDepartment.jsp', SyncType: 'C', exgroup: '1', exorder: '32', countfirst: '1', LastSyncDate: '' },

            // Valid Free Form jsps.
            { Name: '_ValidFreeform.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFreeformTab.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFreeformDefault.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFreeformColumn.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFreeformColumnValue.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },
            { Name: '_ValidFreeformSqlColumnValue.jsp', SyncType: 'FF', exgroup: '1', exorder: '32', countfirst: '0', LastSyncDate: '' },

            /*End of Full Sync Files*/
            /*Start of Quick Sync Files*/
        ],

        quickjspNames: [
            { Name: '_Inspections.jsp', SyncType: 'Q', exgroup: '1', exorder: '33', countfirst: '0', LastSyncDate: '' },

            { Name: '_ProcessDel.jsp', SyncType: 'Q', exgroup: '1', exorder: '34', countfirst: '0', LastSyncDate: 'current date' },
            { Name: '_FolderProcessCheckListDel.jsp', SyncType: 'Q', exgroup: '1', exorder: '35', countfirst: '0', LastSyncDate: 'current date' },
            { Name: '_ReassignedProcess.jsp', SyncType: 'Q', exgroup: '1', exorder: '37', countfirst: '0', LastSyncDate: 'current date' },
            { Name: '_FolderProcessInfoDel.jsp', SyncType: 'Q', exgroup: '1', exorder: '36', countfirst: '0', LastSyncDate: 'current date' },

            { Name: '_NewInspections.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewFolder.jsp', SyncType: 'Q', exgroup: '2', exorder: '38', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_NewFolderInfo.jsp', SyncType: 'Q', exgroup: '2', exorder: '39', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_NewDeficiency.jsp', SyncType: 'Q', exgroup: '2', exorder: '40', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewPeople.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewProperty.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewFolderPeople.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewFolderProperty.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewFolderFixture.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewFolderComment.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_NewAccountBillFee.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_AllProcessChecklist.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_ProcessAtm.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_AllProcessAtm.jsp', SyncType: 'Q', exgroup: '2', exorder: '41', countfirst: '0', LastSyncDate: '' },
            { Name: '_AllProcessAttachments.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },


            { Name: '_FolderDocument.jsp', SyncType: 'Q', exgroup: '1', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_FolderProcessInfo.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_InspectionRequest.jsp', SyncType: 'Q', exgroup: '2', exorder: '42', countfirst: '0', LastSyncDate: '' },
            // History jsps
            { Name: 'Paged_HistoryProcessInfo.jsp', SyncType: 'Q', exgroup: '3', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_HistoryProcessInspDetail.jsp', SyncType: 'Q', exgroup: '3', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_HistoryProcessDeficiency.jsp', SyncType: 'Q', exgroup: '3', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: 'Paged_HistoryProcessChecklist.jsp', SyncType: 'Q', exgroup: '4', exorder: '42', countfirst: '0', LastSyncDate: '' },

            // Folder and Process Free Form jsps
            { Name: '_FolderFreeform.jsp', SyncType: 'Q', exgroup: '4', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_FolderProcessInspDetail.jsp', SyncType: 'Q', exgroup: '4', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_FolderProcessList.jsp', SyncType: 'Q', exgroup: '4', exorder: '42', countfirst: '0', LastSyncDate: '' },
            { Name: '_FolderRelation.jsp', SyncType: 'Q', exgroup: '4', exorder: '42', countfirst: '0', LastSyncDate: '' },


        ],

        getdatabase: function () {
            this.dbname = 'mobile7';
            cfpLoadingBar.start();
            try {

                if (this.database == null) {
                    var db;
                    if (window.sqlitePlugin) {
                        utilService.logtoConsole('native sqlite database', 'info');
                        //db = window.sqlitePlugin.openDatabase(this.dbname, '1.0', 'Mobile7 sqlite Database', 1024 * 1024 * 1024);
                        db = window.sqlitePlugin.openDatabase({ name: 'mobile7.db', iosDatabaseLocation: 'Documents' },
                            function (db) {
                                db.transaction(function (tx) {
                                    // ...
                                },
                                function (err) {
                                    utilService.logtoConsole('Open database ERROR: ' + JSON.stringify(err));
                                });
                            });
                    } else {
                        //return openDatabase(this.getDatabase(), '2.0', 'Mobile7 sqlite Database', 1024 * 1024 * 1024);
                        utilService.logtoConsole('websql sqlite database', 'info');
                        db = openDatabase(this.dbname, '1.0', 'sqliteMobile', 1024 * 1024 * 1024);
                    }
                    if (db) {
                        this.database = db;
                    }
                }
                cfpLoadingBar.complete();
                return this.database;
            } catch (e) {
                cfpLoadingBar.complete();
                utilService.logtoConsole('Error while opening sqlite database');
                return null;
            }
        },

        getdbname: function () {
            return this.dbname;
        },

        initdatabase: function (callback, scope) {
            if (schemaservice.getSchema() && angular.isArray(schemaservice.getSchema())) {
                var schema = schemaservice.getSchema();
                var totalCount = schema.length;

                var database = this.getdatabase();
                if (database) {
                    var tableCreatedCount = 0;
                    for (var i = 0; i < schema.length; i++) {
                        this.createtable(schema[i],
                            function (result) {
                                if (result.data && result.data.isSuccess === true) {
                                    tableCreatedCount++;
                                }
                                if (totalCount === tableCreatedCount) {
                                    if (callback) {
                                        callback.call(scope, { error: null, data: { isSuccess: true } });
                                    }
                                }
                            }, this, database);

                        if (schema[i].tablename === "syncinfo") {
                            this.insertData(schema[i], null, this, database);
                        }
                    }
                } else {
                    utilService.logtoConsole('Error while opening sqlite database');
                }
            }
        },

        getColumn: function (fields) {
            return $.map(fields, function (value, index) {
                return value.name + " " + value.type + " " + (value.primary ? " PRIMARY KEY " : "") + " " + (value.serial ? " AUTOINCREMENT" : "");
            }).join(", ");
        },

        getColumnName: function (fields) {
            return $.map(fields, function (value, index) {
                if (!value.serial && !value.notmapped) {
                    return value.name;
                }
                else {
                    return null;
                }
            }).join(", ");
        },

        getSyncableColumnsCount: function (fields) {
            return $.map(fields, function (value, index) {
                if (!value.serial && !value.notmapped) {
                    return value.name;
                } else {
                    return null;
                }
            }).length;
        },

        getParserColumnName: function (fields, placeholder) {
            var result = $.map(fields, function (value, index) {
                if (!value.notmapped)
                    return placeholder ? '?' : value.name;
                else
                    return null;
            }).join(", ");
            return result;
        },

        getRemovableColumnIndexes: function (fields) {
            var result = $.map(fields, function (value, index) {
                if (value.notmapped)
                    return index;
                else
                    return null;
            });
            return result;
        },

        getValuesAtIndex: function (array, indexarray) {
            var result = $.map(array, function (value, index) {
                if (indexarray.indexOf(index) >= 0)
                    return value;
                else
                    return null;
            });
            return result;
        },

        getIdColumnIndex: function (fields) {
            var parsableColumns = $.map(fields, function (value, index) {
                if (!value.notmapped)
                    return value.name;
                else
                    return null;
            });
            ///find out index of from parasablecolumns based on name;
            var indexColumns = $.map(fields, function (value, index) {
                if (value.keyColumn) {
                    return value.name;
                }
                else
                    return null;
            });
            var result = $.map(parsableColumns, function (value, index) {
                if (indexColumns.indexOf(value) >= 0) {
                    return index;
                }
                else
                    return null;
            });
            return result;
        },

        //this method is being used to return key columns from schema's fields list
        getSchemaIdColumnIndex: function (fields) {
            var parsableColumns = $.map(fields, function (value, index) {
                if (!value.serial && !value.notmapped)
                    return value.name;
                else
                    return null;
            });

            var indexColumns = $.map(fields, function (value, index) {
                if (value.keyColumn) {
                    return value.name;
                }
                else
                    return null;
            });

            if (indexColumns.length > 0) {
                var result = $.map(parsableColumns, function (value, index) {
                    if (indexColumns.indexOf(value) >= 0) {
                        return index;
                    }
                    else
                        return null;
                });
                return result;
            } else {
                return [0];
            }
        },

        getTableSchema: function (jspName, synccategory) {
            var result;
            if (synccategory === 'fullsync') {
                result = schemaservice.getSchema().filter(function (o) { return o.jspname === jspName; });
                return result ? result[0] : null;
            } else if (synccategory === 'quicksync') {
                result = null;
                if (jspName === "_ReassignedProcess.jsp") {
                    result = schemaservice.getSchema().filter(function (o) { return o.jspname1 === jspName; });
                } else {
                    result = schemaservice.getSchema().filter(function (o) { return o.jspname2 === jspName; });
                }
                return result ? result[0] : null;
            }
            return null;
        },

        getColumnValues: function (jspname) {
            //return "'" + jspname.Name + "'," + "'" + jspname.SyncType + "'," + "'" + jspname.GroupBy + "'," + "'" + jspname.OrderBy + "'," + "'" + jspname.FirstCount + "'," + "'" + jspname.LastSyncDate + "'," + "'" + jspname.PastYear + "'," + "'" + jspname.RecordLimit + "'," + "'" + jspname.IncludeInSync + "'";
            var result = "";
            for (i in jspname) {
                result += "'" + jspname[i] + "', ";
            }
            var lastidx = result.lastIndexOf(",");
            result = result.substr(0, lastidx);
            return result;
        },

        getBlankColumnValues: function (fields) {
            return $.map(fields, function (value, index) {
                if (!value.serial && !value.notmapped) {
                    return '?';
                }
                else {
                    return null;
                }
            }).join(", ");
        },

        createtable: function (schemadetail, callback, scope, database) {
            if (database == undefined) {
                database = this.getdatabase();
            }
            if (database) {
                var sql = String.format(this.createTableSql, schemadetail.tablename, this.getColumn(schemadetail.fields));
                database.transaction(function (tx) {
                    tx.executeSql(sql, [],
                        function (t, r) {
                            //utilService.logtoConsole('table created: ' + schemadetail.tablename);
                            if (callback) {
                                callback.call(scope, { error: null, data: { isSuccess: true } })
                            }
                        },
                        function (t, error) {
                            utilService.logtoConsole('error creating table : ' + schemadetail.tablename);
                            utilService.logtoConsole(error, 'error');
                        });
                });
            } else {
                utilService.logtoConsole('error loading database');
            }
        },

        insertData: function (schemadetail, callback, scope, database) {
            var i;
            if (database === undefined) {
                database = this.getdatabase();
            }
            if (database) {
                var sql = [];

                for (i = 0; i < this.jspNames.length; i++) {
                    sql.push(String.format(this.insertTableSql, schemadetail.tablename, this.getColumnName(schemadetail.fields), this.getColumnValues(this.jspNames[i])));
                }
                for (i = 0; i < this.quickjspNames.length; i++) {
                    sql.push(String.format(this.insertTableSql, schemadetail.tablename, this.getColumnName(schemadetail.fields), this.getColumnValues(this.quickjspNames[i])));
                }

                database.transaction(function (tx) {
                    tx.executeSql("SELECT * FROM syncinfo ", [],
                        function (tt, result) {
                            if (!result.rows || result.rows.length === 0) {
                                for (i = 0; i < sql.length; i++) {
                                    tx.executeSql(sql[i], [],
                                        function (ttt, iresult) {
                                            utilService.logtoConsole('record inserted for ' + schemadetail.tablename);
                                        },
                                        function (ttt, error) {
                                            utilService.logtoConsole(error, 'error');
                                        });
                                }
                            }
                        }, function (itx, error) {
                            utilService.logtoConsole(error, 'error');
                        });
                });
            }
            else {
                utilService.logtoConsole('error loading database');
            }
        },

        quicksyncinsertData: function (schemadetail, callback, scope, database) {
            var i;
            if (database == undefined) {
                database = this.getdatabase();
            }
            if (database) {
                var sql = [];
                for (i = 0; i < this.quickjspNames.length; i++) {
                    sql.push(String.format(this.insertTableSql, schemadetail.tablename, this.getColumnName(schemadetail.fields), this.getColumnValues(this.quickjspNames[i])));
                }

                database.transaction(function (tx) {
                    tx.executeSql("SELECT * FROM syncinfo ", [],
                        function (itx, result) {
                            if (result.rows || result.rows.length > 0) {


                                for (i = 0; i < sql.length; i++) {
                                    tx.executeSql(sql[i], [],
                                        function (iitx, iresult) {
                                            utilService.logtoConsole('record inserted for ' + schemadetail.tablename);
                                            if (callback) {
                                                callback.call(scope, 'successful insertion cleaned');
                                            }
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error, 'error');
                                            if (callback) {
                                                callback.call(scope, 'unsuccessful insertion');
                                            }
                                        });
                                }
                            }
                        }, function (itx, result) {
                            utilService.logtoConsole('successfull insertion for syncinfo table');

                        }, function (itx, error) {
                            utilService.logtoConsole(error, 'error');

                        });
                });
            } else {
                utilService.logtoConsole('error loading database');
            }

        },
        cleanDatabase: function (callback, scope) {

            if (schemaservice.getSchema() && angular.isArray(schemaservice.getSchema())) {
                var schema = schemaservice.getSchema();
                var totalCount = schema.length;

                var db = this.getdatabase();
                if (db != null) {
                    db.transaction(function (t) {

                        var successCount = 0;
                        for (var i = 0; i < schema.length; i++) {
                            var query = "DROP TABLE IF EXISTS " + schema[i].tablename + ";"
                            t.executeSql(query, [],
                            function (t, result) {
                                if (result) {
                                    //callback.call(scope, { error: null, data: { isSuccess: true } });
                                    //utilService.logtoConsole(dropObjects.rows.item(i).dropableTable + " executed successfully.");
                                    successCount++;

                                } else {
                                    //utilService.logtoConsole(dropObjects.rows.item(i).dropableTable + " not executed successfully.");
                                    //callback.call(scope, { error: new Error("folderprocessattemptsignature: update failed"), data: null });
                                    totalCount--;
                                }

                                if (totalCount === successCount) {
                                    if (callback) {
                                        callback.call(scope, { error: null, data: { isSuccess: true } })
                                    }
                                }

                            }, function (t, error) {
                                //utilService.logtoConsole(dropObjects.rows.item(i).dropableTable + " not executed successfully.");
                                //callback.call(scope, { error: error, data: null });
                                successCount++;
                                if (totalCount === successCount) {
                                    if (callback) {
                                        callback.call(scope, { error: null, data: { isSuccess: true } })
                                    }
                                }
                            });
                        }

                    });
                } else { utilService.logtoConsole("Error while opening sqlite database", "error"); }

            }


        },
    };
});