app.factory("commonParserService", function (utilService, dbInitService, loadParserService, $rootScope, $timeout, cfpLoadingBar, $q) {
    return {
        updatedatabase: function (rawData, synccategory, scope, jspname, timestamp) {
            var deferred = $q.defer();
            var tableschemaObj = null;
            var jspObj = null;
            var me = this;
            try {
                switch (jspname) {
                    case "_Permit.jsp":
                    case "_AllPeople.jsp":
                    case "_AllProperty.jsp":
                    case "_People.jsp":
                    case "_Property.jsp":
                        // case "_FolderFixture.jsp":
                        //case "_FolderComment.jsp":
                        // case "_AccountBillFee.jsp":
                    case "_InspectionTypeDeficiency.jsp":
                    case "_ValidChecklist.jsp":
                    case "_ValidProcessAttemptResult.jsp":
                    case "_ValidPeople.jsp":
                    case "_ValidInfo.jsp":
                    case "_ValidInfoValue.jsp":
                    case "_ValidClause.jsp":
                    case "_DeficiencyRemedy.jsp":
                    case "_ValidAddressUnitType.jsp":
                    case "_ValidAttachment.jsp":;
                    case "_DeficiencySeverity.jsp":
                    case "_DeficiencyStatus.jsp":
                    case "_DeficiencySubCategory.jsp":

                    case "_InspectorTrusted.jsp":
                    case "_DeficiencyType.jsp":
                    case "_ValidProperty.jsp":
                    case "_ValidProcessInfoValue.jsp":
                    case "_ValidProcessInfo.jsp":
                    case "_DefaultProcessInfo.jsp":
                    case "_ValidSub.jsp":
                    case "_ValidWork.jsp":
                    case "_ListFolderStatus.jsp":
                    case "_ValidProcessStatus.jsp":
                    case "_DefaultProcess.jsp":
                    case "_PermitLayoutDeclaration.jsp":
                    case "_PermitLayoutDepartment.jsp":
                    case "_DeficiencyCategory.jsp":
                    case "_DeficiencyAction.jsp":
                    case "_DeficiencyLocation.jsp":
                    case "_ValidFixture.jsp":
                    case "_DefaultInfo.jsp":
                    case "_ValidFolderSub.jsp":
                    case "_ValidFolderWork.jsp":
                    case "_Department.jsp":
                    case "_ValidCountry.jsp":
                    case "_InspectionType.jsp":
                    case "_ValidPeopleStatus.jsp":
                    case "_ValidPropertyStatus.jsp":
                    case "_ValidStreetDirection.jsp":
                    case "_ValidTitle.jsp":
                    case "_ValidPhoneType.jsp":
                    case "_ValidStreetType.jsp":
                    case "_MobileSiteLicense.jsp":
                    case "_InspectionTypeItem.jsp":
                    case "_InspectionResults.jsp":
                    case "_InspectionTypeDepartment.jsp":
                    case "_FolderInfo.jsp":
                    case "_ValidFreeform.jsp":
                    case "_ValidFreeformTab.jsp":
                    case "_ValidFreeformDefault.jsp":
                    case "_ValidFreeformColumn.jsp":
                    case "_ValidFreeformColumnValue.jsp":
                    case "_ValidFreeformSqlColumnValue.jsp":
                    case "_ValidSiteMobileOption.jsp":
                        //if (jspname == '_ValidTitle.jsp')
                            //debugger;
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        if (tableschemaObj) {
                            me.insertOrUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                                me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                    deferred.resolve({ error: null, data: 'success' });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }
                        else {
                            deferred.resolve({ error: "Couldn't resolve schema", data: null });
                        }
                        break;
                    case "_InspectorTrusted.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        if (tableschemaObj) {
                            me.insertOrUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                                me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                    deferred.resolve({ error: null, data: 'success' });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }
                        else {
                            deferred.resolve({ error: "Couldn't resolve schema", data: null });
                        }
                        break;
                    case "_DefaultDeficiencyStatus.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        if (tableschemaObj) {
                            me.insertOrUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                                me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                    deferred.resolve({ error: null, data: 'success' });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }
                        else {
                            deferred.resolve({ error: "Couldn't resolve schema", data: null });
                        }
                        break;
                    case "_deletedProperty.jsp":
                    case "_deletedFolder.jsp":
                    case "_deletedPeople.jsp":
                    case "_deletedFolderPeople.jsp":
                    case "_deletedFolderInfo.jsp":
                    case "_deletedFolderProperty.jsp":
                    case "_deletedFolderFixture.jsp":
                    case "_deletedFolderComment.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        if (tableschemaObj) {
                            me.insertRowsfordeletejsp(rawData, scope, tableschemaObj).then(function (result) {
                                me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                    deferred.resolve({ error: null, data: 'success' });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }
                        else {
                            deferred.resolve({ error: "Couldn't resolve schema", data: null });
                        }
                        break;
                    case "_Inspector.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        if (tableschemaObj) {
                            me.populateValidUser(rawData, scope, tableschemaObj).then(function (result) {
                                me.populateUserPermission(rawData, scope).then(function (result) {
                                    me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                        deferred.resolve({ error: null, data: 'success' });
                                    }).catch(function (error) {
                                        deferred.resolve({ error: error, data: null });
                                    });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }
                        else {
                            deferred.resolve({ error: "Couldn't resolve schema", data: null });
                        }
                        break;
                    default:
                        utilService.logtoConsole("Below jsp Name not listed into switch case");
                        //if (callback) {
                        //    callback.call(scope, { result: "failed", error: "jsp Name not listed into switch case" });
                        //}
                        deferred.resolve({ error: "Below jsp Name not listed into switch case", data: null });
                        break;
                }
            } catch (e) {
                utilService.logtoConsole(e, "error");
                //if (callback) {
                //    callback.call(scope, { result: "failed", error: e });
                //}
                deferred.resolve({ error: e.message, data: null });
            }
            return deferred.promise;

        },

        insertOrUpdateRows: function (rawData, scope, tblObj) {
            var deferred = $q.defer();
            $timeout(function (me, rawData, scope, tblObj) {

                if (db === null || db === undefined)
                    var db = dbInitService.getdatabase();
                if (db === null) {
                    utilService.logtoConsole("error accessing database", "error");
                    //callback.call(scope, { result: "failed", error: new Error("error accessing database") });
                    deferred.resolve({ error: "error accessing database", data: null });
                    return;
                }
                db.transaction(function (tx) {
                    var sql = String.format("select count(*) as totalrows from {0}", tblObj.tablename);
                    tx.executeSql(sql, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                if (result.rows.item(0)["totalrows"] > 0) {
                                    me.updateRows(rawData, scope, tblObj).then(function (result) {
                                        deferred.resolve({ error: null, data: 'success' });
                                    }).catch(function (error) {
                                        deferred.resolve({ error: error, data: null });
                                    })
                                } else {
                                    me.insertRows(rawData, scope, tblObj).then(function (result) {
                                        deferred.resolve({ error: null, data: 'success' });
                                    }).catch(function (error) {
                                        deferred.resolve({ error: error, data: null });
                                    })
                                }
                            }
                        },
                        function (itx, error) {
                            utilService.logtoConsole(error, "error");
                            deferred.resolve({ error: error, data: null });
                        });
                });

            }, 100, false, this, rawData, scope, tblObj);
            return deferred.promise;
        },

        insertRows: function (rawData, scope, tblObj) {
            // debugger;
            var deferred = $q.defer();
            if (tblObj != null) {
                var insertSyntax = "INSERT INTO {0}({1}) VALUES({2})";
                var tablename = tblObj.tablename;
                var colnames = dbInitService.getColumnName(tblObj.fields);
                var colvalues = dbInitService.getBlankColumnValues(tblObj.fields);

                var colcounts = dbInitService.getSyncableColumnsCount(tblObj.fields);

                try {
                    var me = this,
                        db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data: null });
                        throw new Error("error accessing database");

                    }
                    db.transaction(function (tx) {
                        var sql = String.format(insertSyntax, tablename, colnames, colvalues);
                        var rows = loadParserService.getDataRows(rawData);
                        for (var i = 0; i < rows.length; i++) {
                            //utilService.showError("Processing data. please wait..");
                            var cols = loadParserService.getDataColumns(rows[i]);
                            if (cols.length < colcounts) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colcounts) {
                                cols.splice(colcounts, cols.length - colcounts);
                            }

                            (function () {
                                cfpLoadingBar.start();
                                //utilService.showError("Processing data. Please wait..", 'info');
                                this.ttx.executeSql(this.sql, this.cols,
                                function (itx, result) {
                                    //cfpLoadingBar.complete();
                                    deferred.resolve({ error: null, data: 'success' });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error, "error");
                                    utilService.logtoConsole("error insert for table " + tablename + " Column Name: " + colnames + " values: " + this.cols);
                                    //cfpLoadingBar.complete();
                                    deferred.resolve({ error: "error insert for table " + tablename, data: null });
                                });

                            }).call({ ttx: tx, sql: sql, cols: cols });
                            cols = null;
                        }
                        rows = null;
                        //if (callback) {
                        //    utilService.logtoConsole("record inserted into " + tablename);
                        //    //callback.call(scope, { result: "success", error: null });
                        //    deferred.resolve({ error: null, data: 'success' });
                        //}
                    });
                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    utilService.logtoConsole("record not inserted into  " + tablename);
                    //callback.call(scope, { result: "failed", error: e });
                    deferred.resolve({ error: e.message, data: null });
                    //}
                }
            } else {
                //if (callback) {
                utilService.logtoConsole("table schema is null or undefined");
                //callback.call(scope, { result: "failed", error: null });
                deferred.resolve({ error: "table schema is null or undefined", data: null });
                //}
            }
            return deferred.promise;
        },

        updateRows: function (rawData, scope, tblObj) {
            var deferred = $q.defer();
            if (tblObj != null) {

                var tablename = tblObj.tablename;

                var colnames = dbInitService.getColumnName(tblObj.fields);
                var colvalues = dbInitService.getBlankColumnValues(tblObj.fields);
                var idColumnIndex = dbInitService.getSchemaIdColumnIndex(tblObj.fields);

                var colcounts = dbInitService.getSyncableColumnsCount(tblObj.fields);

                try {

                    var colArray = colnames.split(",");

                    var whereClauseColumns = dbInitService.getValuesAtIndex(colArray, idColumnIndex);
                    var me = this,
                        db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data: null });
                        throw new Error("error accessing database");

                    }
                    db.transaction(function (tx) {
                        //var sql = String.format(insertSyntax, tablename, colnames, colvalues);
                        var rows = loadParserService.getDataRows(rawData);
                        for (var i = 0; i < rows.length; i++) {

                            var cols = loadParserService.getDataColumns(rows[i]);
                            var colsToInsert = loadParserService.getDataColumns(rows[i]);
                            var whereClauseValues = dbInitService.getValuesAtIndex(cols, idColumnIndex);

                            //remove extra columns (if schema's columns count is lesser than data columns)
                            if (cols.length < colcounts) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colcounts) {
                                cols.splice(colcounts, cols.length - colcounts);
                            }
                            if (colsToInsert.length < colcounts) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (colsToInsert.length > colcounts) {
                                colsToInsert.splice(colcounts, colsToInsert.length - colcounts);
                            }
                            if (tablename !== "validprovince" && tablename !== "validtitle") {
                                colArray = colnames.split(",");
                                for (var x = 0; x < idColumnIndex.length; x++) {
                                    cols.splice(idColumnIndex[x], 1);
                                    colArray.splice(idColumnIndex[x], 1);
                                }
                            }
                            var setStatement = "";
                            for (var j = 0; j < colArray.length; j++) {
                                setStatement += colArray[j] + " = ?,";
                            }
                            setStatement = setStatement.substring(0, setStatement.lastIndexOf(","));
                            setStatement = " SET " + setStatement;

                            var selectsqlWhereClase = $.map(whereClauseColumns, function (item, index) {
                                return String.format("{0}=?", item);
                            }).join(" AND ");

                            var primaryColSelect = $.map(whereClauseColumns, function (item, index) {
                                return item;
                            }).join();



                            var txSuccesCallback = utilService.bind(me.txSuccesCallback,
                            {
                                tablename: tablename,
                                setStatement: setStatement,
                                selectsqlWhereClase: selectsqlWhereClase,
                                whereClauseValues: whereClauseValues,
                                colnames: colnames,
                                colvalues: colvalues,
                                colsToInsert: colsToInsert,
                                cols: cols,
                                colArray: colArray //this will be used to validate set statement.
                            });
                            cfpLoadingBar.start();

                            (function () {
                                var tablename = this.tablename,
                                                       setStatement = this.setStatement,
                                                       selectsqlWhereClase = this.selectsqlWhereClase,
                                                        whereClauseValues = $.merge(this.cols, this.whereClauseValues),
                                                       //whereClauseValues = this.whereClauseValues,
                                                       colnames = this.colnames,
                                                       colvalues = this.colvalues,
                                                       colsToInsert = this.colsToInsert,
                                                       colArray = this.colArray,
                                                       cols = this.cols;
                                //utilService.showError("Processing data. Please wait..", 'info');
                                tx.executeSql("Select 1 from " + tablename + " WHERE " + selectsqlWhereClase,
                                    this.whereClauseValues,
                                    function (itx, result) {

                                        if (result.rows && result.rows.length > 0) {
                                            if (colArray.length > 0) {
                                                var updateSyntax = "UPDATE {0} {1}  where {2};";
                                                //record exists - Update it
                                                var updatesql = String.format(updateSyntax, tablename, setStatement, selectsqlWhereClase);

                                                itx.executeSql(updatesql, whereClauseValues,
                                                   function (iitx, iresult) {
                                                       //utilService.logtoConsole("Table " + tablename + " Updated for " + selectsqlWhereClase + " values : " + whereClauseValues.toString());
                                                       //cfpLoadingBar.complete();
                                                       deferred.resolve({ error: null, data: 'success' });
                                                   },
                                                   function (iitx, error) {
                                                       utilService.logtoConsole(error, "error");
                                                       utilService.logtoConsole(updatesql);
                                                       utilService.logtoConsole("error update for table " + tablename + " " + selectsqlWhereClase + " values : " + whereClauseValues.toString());
                                                       //cfpLoadingBar.complete();
                                                       deferred.resolve({ error: error, data: null });
                                                   });

                                            }

                                        } else {
                                            //record doesn't exists - insert it
                                            var insertSyntax = "INSERT INTO {0}({1}) VALUES({2})";
                                            var insertsql = String.format(insertSyntax, tablename, colnames, colvalues);
                                            itx.executeSql(insertsql, colsToInsert,
                                               function (iitx, iresult) {
                                                   //utilService.logtoConsole("Record Inserted Into " + tablename + " " + colnames + " " + colsToInsert.toString() + " Through Full Sync");
                                                   //cfpLoadingBar.complete();
                                                   deferred.resolve({ error: null, data: 'success' });
                                               },
                                               function (iitx, error) {
                                                   utilService.logtoConsole(error, "error");
                                                   utilService.logtoConsole("error insert for table " + tablename + " " + colnames + " " + colsToInsert.toString());
                                                   //cfpLoadingBar.complete();
                                                   deferred.resolve({ error: error, data: null });
                                               });
                                        }
                                    },
                                    function (itx, error) {
                                        utilService.logtoConsole(error);
                                        //cfpLoadingBar.complete();
                                        deferred.resolve({ error: error, data: null });

                                    });

                            }).call({
                                tablename: tablename,
                                setStatement: setStatement,
                                selectsqlWhereClase: selectsqlWhereClase,
                                whereClauseValues: whereClauseValues,
                                colnames: colnames,
                                colvalues: colvalues,
                                colsToInsert: colsToInsert,
                                cols: cols,
                                colArray: colArray
                            })


                            cols = null;
                        }
                        rows = null;
                        //if (callback) {
                        //    utilService.logtoConsole("Record updation completed for " + tablename);
                        //    callback.call(scope, { result: "Record updation completed for " + tablename, error: null });
                        //}
                    });
                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    //    utilService.logtoConsole("Error occurred insteting rows into  " + tablename);
                    //    callback.call(scope, { result: "failed", error: e });
                    //}
                    deferred.resolve({ error: e.message, data: null });
                }
            } else {
                //if (callback) {
                utilService.logtoConsole("table schema is null or undefined");
                //callback.call(scope, { result: "failed", error: null });
                deferred.resolve({ error: "table schema is null or undefined", data: null });
                //}
            }
            return deferred.promise;
        },

        txSuccesCallback: function (itx, result) {
            var deferred = $q.defer();
            var tablename = this.tablename,
                setStatement = this.setStatement,
                selectsqlWhereClase = this.selectsqlWhereClase,
                 whereClauseValues = $.merge(this.cols, this.whereClauseValues),
                //whereClauseValues = this.whereClauseValues,
                colnames = this.colnames,
                colvalues = this.colvalues,
                colsToInsert = this.colsToInsert,
                cols = this.cols;
            if (result.rows && result.rows.length > 0) {
                if (this.colArray.length > 0) {
                    var updateSyntax = "UPDATE {0} {1}  where {2};";
                    //record exists - Update it
                    var updatesql = String.format(updateSyntax, tablename, setStatement, selectsqlWhereClase);

                    itx.executeSql(updatesql, whereClauseValues,
                       function (iitx, iresult) {
                           //utilService.logtoConsole("Table " + tablename + " Updated for " + selectsqlWhereClase + " values : " + whereClauseValues.toString());
                           //cfpLoadingBar.complete();
                           deferred.resolve({ error: null, data: 'success' });
                       },
                       function (iitx, error) {
                           utilService.logtoConsole(error, "error");
                           utilService.logtoConsole(updatesql);
                           utilService.logtoConsole("error update for table " + tablename + " " + selectsqlWhereClase + " values : " + whereClauseValues.toString());
                           //cfpLoadingBar.complete();
                           deferred.resolve({ error: error, data: null });
                       });

                }

            } else {
                //record doesn't exists - insert it
                var insertSyntax = "INSERT INTO {0}({1}) VALUES({2})";
                var insertsql = String.format(insertSyntax, tablename, colnames, colvalues);
                itx.executeSql(insertsql, colsToInsert,
                   function (iitx, iresult) {
                       //utilService.logtoConsole("Record Inserted Into " + tablename + " " + colnames + " " + colsToInsert.toString() + " Through Full Sync");
                       //cfpLoadingBar.complete();
                       deferred.resolve({ error: null, data: 'success' });
                   },
                   function (iitx, error) {
                       utilService.logtoConsole(error, "error");
                       utilService.logtoConsole("error insert for table " + tablename + " " + colnames + " " + colsToInsert.toString());
                       //cfpLoadingBar.complete();
                       deferred.resolve({ error: error, data: null });
                   });
            }

            return deferred.promise;
        },

        insertRowsfordeletejsp: function (rawData, scope, tblObj) {
            var sql1 = "";
            var deferred = $q.defer();
            if (tblObj != null) {
                var insertSyntax = "INSERT INTO {0}({1}) VALUES({2})";
                var tablename = tblObj.tablename;
                var colcounts = tblObj.fields.length - 1;
                var colnames = dbInitService.getColumnName(tblObj.fields);
                var colvalues = dbInitService.getBlankColumnValues(tblObj.fields);
                var colname1 = tblObj.fields[1];
                var colname2 = tblObj.fields[2];
                var rsn = "", prsn = "";
                try {
                    var me = this,
                        db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data: null });
                        throw new Error("error accessing database");
                    }
                    db.transaction(function (tx) {

                        var sql = String.format(insertSyntax, tablename, colnames, colvalues);
                        var rows = loadParserService.getDataRows(rawData);
                        //   var pr = '', fr = '';
                        for (var i = 0; i < rows.length; i++) {

                            var cols = "";
                            if (rows[i] != null && rows[i] !== "") {

                                if (tblObj.jspname === "_deletedFolderPeople.jsp" || tblObj.jspname === "_deletedFolderProperty.jsp") {
                                    cols = loadParserService.getDataColumns(rows[i]);
                                    rsn += "'" + cols[0] + "',";
                                    cols = loadParserService.getDataColumns(rows[i]);
                                    prsn += "'" + cols[1] + "',";

                                } else {
                                    cols = loadParserService.getDataColumns(rows[i]);

                                    rsn += "'" + cols[0] + "',";
                                }

                            }
                            if (cols.length < colcounts) {
                                //deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colcounts) {
                                cols.splice(colcounts, cols.length - colcounts);
                            }

                            tx.executeSql(sql, cols,
                                function (itx, result) {
                                    //deferred.resolve({ error: "", data: 'success' });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error, "error");
                                    // deferred.resolve({ error: error, data: null });
                                });
                            cols = null;
                        }

                        var RSN = "", PRSN = "";

                        var deletetable = tblObj.deletedtablename;
                        var deleteSyntax;
                        if (tblObj.jspname === "_deletedFolderPeople.jsp" || tblObj.jspname === "_deletedFolderProperty.jsp") {

                            if (rsn.endsWith(",") || prsn.endsWith(",")) {

                                RSN = rsn;
                                RSN = RSN.substring(0, RSN.length - 1);
                                PRSN = prsn;
                                PRSN = PRSN.substring(0, PRSN.length - 1);

                            }
                            deleteSyntax = "DELETE FROM {0} WHERE {1} IN {2} AND {3} IN {4}";
                            sql1 = String.format(deleteSyntax, deletetable, colname1.name, "( " + RSN + " )", colname2.name, "(" + PRSN + ")");
                        } else {
                            if (rsn.endsWith(",")) {
                                RSN = rsn;
                                RSN = RSN.substring(0, RSN.length - 1);
                            }

                            deleteSyntax = "DELETE FROM {0} WHERE {1} IN {2}";
                            sql1 = String.format(deleteSyntax, deletetable, colname1.name, "( " + RSN + " )");
                        }
                        cfpLoadingBar.start();
                        //utilService.showError("Processing data. Please wait..", 'info');
                        tx.executeSql(sql1, [],
                            function (itx, result) {
                                utilService.logtoConsole("deleted records removed from " + deletetable);
                                //cfpLoadingBar.complete();
                                deferred.resolve({ error: null, data: 'success' });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error, "error");
                                utilService.logtoConsole("not deleted records from " + deletetable);
                                //cfpLoadingBar.complete();
                                deferred.resolve({ error: error, data: null });

                            });
                        rows = null;
                        //if (callback) {
                        //    utilService.logtoConsole("record deleted from " + tablename);
                        //    callback.call(scope, { result: "success", error: null });
                        //}
                    });
                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    //    utilService.logtoConsole("record not inserted into  " + tablename);
                    //    callback.call(scope, { result: "failed", error: e });
                    //    cfpLoadingBar.complete();
                    //}
                    deferred.resolve({ error: e.message, data: null });
                }
            } else {
                //if (callback) {
                //    utilService.logtoConsole("table schema is null or undefined");
                //    callback.call(scope, { result: "failed", error: null });
                //}
                deferred.resolve({ error: null, data: 'success' });
            }
            return deferred.promise;
        },

        populateUserPermission: function (rawData, scope) {
            var me = this, db = dbInitService.getdatabase();
            var deferred = $q.defer();
            if (db == null) {
                utilService.logtoConsole("error accessing database", "error");
                //callback.call(scope, { result: "failed", error: new Error("error accessing database") });
                deferred.resolve({ error: "error accessing database", data: null });
                return;
            }

            db.transaction(function (tx) {
                cfpLoadingBar.start();
                //utilService.showError("Processing data. Please wait..", 'info');
                tx.executeSql("delete FROM userpermission", [],
                    function (itx, result) {
                        var rows = loadParserService.getDataRows(rawData);
                        for (var i = 0; i < rows.length; i++) {
                            cfpLoadingBar.start();
                            //utilService.showError("Processing data. Please wait..", 'info');
                            var cols = loadParserService.getDataColumns(rows[i]);
                            if (cols.length < 4) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            }
                            var userid = cols[0];
                            var roletype = cols[3];

                            if (roletype.length > 0) {
                                var fgroupcodes = roletype.split(",");
                                if (fgroupcodes.length > 0) {

                                    for (var n = 0; n < fgroupcodes.length; n++) {
                                        var fg = fgroupcodes[n];
                                        var sql = "insert into userpermission (userid, foldergroupcode) values (?, ?)";
                                        tx.executeSql(sql, [userid, fg],
                                            function (itx, result) {
                                                //cfpLoadingBar.complete();
                                                deferred.resolve({ error: null, data: 'success' });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error, "error");
                                                //cfpLoadingBar.complete();
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    }

                                }
                            }
                        } //end for
                    },
                    function (itx, error) {
                        utilService.logtoConsole(error, "error");
                        //cfpLoadingBar.complete();
                        deferred.resolve({ error: error, data: null });
                    });
            }); //end transaction
            return deferred.promise;
        },


        populateValidUser: function (rawData, scope, tblObj) {
            var me = this, db = dbInitService.getdatabase();
            var deferred = $q.defer();
            if (db == null) {
                utilService.logtoConsole("error accessing database", "error");
                //callback.call(scope, { result: "failed", error: new Error("error accessing database") });
                deferred.resolve({ error: "error accessing database", data: null });
                return;
            }
            var insertSyntax = "INSERT INTO {0}({1}) VALUES({2})";
            var tablename = tblObj.tablename;
            var colcounts = tblObj.fields.length-1;
            var colnames = dbInitService.getColumnName(tblObj.fields);
            var colvalues = dbInitService.getBlankColumnValues(tblObj.fields);

            db.transaction(function (tx) {
                cfpLoadingBar.start();
                //utilService.showError("Processing data. Please wait..", 'info');
                tx.executeSql("delete FROM validuser", [],
                    function (itx, result) {
                        var sql = String.format(insertSyntax, tablename, colnames, colvalues);
                        var rows = loadParserService.getDataRows(rawData);
                        for (var i = 0; i < rows.length; i++) {
                            cfpLoadingBar.start();
                            //utilService.showError("Processing data. Please wait..", 'info');
                            var cols = loadParserService.getDataColumns(rows[i]);
                            if (cols.length < colcounts) {
                                //deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colcounts) {
                                cols.splice(colcounts, cols.length - colcounts);
                            }
                            itx.executeSql(sql, cols,
                               function (iitx, result) {
                                   deferred.resolve({ error: "", data: 'success' });
                               },
                               function (iitx, error) {
                                   utilService.logtoConsole(error, "error");
                                   deferred.resolve({ error: error, data: null });
                               });
                            cols = null;
                           
                        } //end for
                    },
                    function (itx, error) {
                        utilService.logtoConsole(error, "error");
                        //cfpLoadingBar.complete();
                        deferred.resolve({ error: error, data: null });
                    });
            }); //end transaction
            return deferred.promise;
        },

        updateTimeStampForJsp: function (jspname, timestamp) {
            var deferred = $q.defer();
            var db = dbInitService.getdatabase();
            if (db == null) {
                utilService.logtoConsole("error accessing database", "error");
                //callback.call(scope, { result: "failed", error: new Error("error accessing database") });
                deferred.resolve({ error: "error accessing database", data: null });
                return;
            }

            db.transaction(function (tx) {
                cfpLoadingBar.start();
                //utilService.showError("Processing data. please wait..");
                tx.executeSql("update syncinfo set lastsyncdate=? where jspname=?", [timestamp, jspname],
                    function (itx, result) {
                        utilService.logtoConsole("Time Stamp updated for jsp: " + jspname, "Success");
                        //cfpLoadingBar.complete();
                        deferred.resolve({ error: null, data: 'success' });
                    },
                    function (itx, error) {
                        utilService.logtoConsole("Time Stamp not updated for jsp: " + jspname + "below is the reason:", "failed");
                        utilService.logtoConsole(error, "error");
                        //cfpLoadingBar.complete();
                        deferred.resolve({ error: error, data: null });
                    });
            });
            return deferred.promise;
        }
    };
});