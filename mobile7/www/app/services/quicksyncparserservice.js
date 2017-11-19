app.factory("quicksyncParserService", function (utilService, loadParserService, dbInitService, cfpLoadingBar, $q) {
    return {
        parsercount: 0,
        folderRSN: [],
        processRSN: [],
        updatedatabase: function (rawData, synccategory, scope, jspname, timestamp) {
            var deferred = $q.defer();
            this.parsercount++;
            var tableschemaObj = null;
            var jspObj = null;
            var me = this;
            try {
                switch (jspname) {
                    case "_Inspections.jsp":
                        me.storeFolderRsnInMemory(rawData, scope);
                        me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                            deferred.resolve({ error: null, data: 'success' });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        });
                        //deferred.resolve({ error: null, data: 'success' });
                        break;
                    case "_NewFolder.jsp":
                    case "Paged_NewFolderInfo.jsp":
                    case "Paged_NewDeficiency.jsp":
                    case "_NewPeople.jsp":
                    case "_NewProperty.jsp":
                    case "_NewFolderPeople.jsp":
                    case "_NewFolderProperty.jsp":
                    case "_NewFolderFixture.jsp":
                    case "_NewFolderComment.jsp":
                    case "_NewAccountBillFee.jsp":
                    case "Paged_AllProcessChecklist.jsp":
                    case "_FolderDocument.jsp":
                    case "Paged_FolderProcessInfo.jsp":
                    case "_InspectionRequest.jsp":
                    case "_AllProcessAttachments.jsp":
                    case "Paged_HistoryProcessInfo.jsp":
                    case "Paged_HistoryProcessInspDetail.jsp":
                    case "Paged_HistoryProcessDeficiency.jsp":
                    case "Paged_HistoryProcessChecklist.jsp":
                    case "_ProcessAtm.jsp":
                    case "_FolderFreeform.jsp":
                    case "_FolderProcessInspDetail.jsp":
                    case "_FolderProcessList.jsp":
                    case "_FolderRelation.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        me.insertUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                            me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        });
                        
                        break;
                    case "_NewInspections.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        me.insertUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                            me.clearEndDate().then(function (result) {
                                me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                    deferred.resolve({ error: null, data: 'success' });
                                }).catch(function (error) {
                                    deferred.resolve({ error: error, data: null });
                                });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            })
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        })
                       
                       
                        break;
                    case "_AllProcessAtm.jsp": // Storing Process RSN in memory
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        me.storeProcessRsnInMemory(rawData, scope);
                        me.insertUpdateRows(rawData, scope, tableschemaObj).then(function (result) {
                            me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        });
                        break;
                    case "_ProcessDel.jsp":// Not required FR
                    case "_FolderProcessCheckListDel.jsp":// Not required FR and delete from 
                    case "_FolderProcessInfoDel.jsp":// Not required FR
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        me.deleteRows(rawData, scope, tableschemaObj).then(function (result) {
                            me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        });
                        break; /**/
                    case "_ReassignedProcess.jsp":
                        tableschemaObj = dbInitService.getTableSchema(jspname, synccategory);
                        me.UpdateReassignedProcess(rawData, scope, tableschemaObj).then(function (result) {
                            me.updateTimeStampForJsp(jspname, timestamp).then(function (result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }).catch(function (error) {
                                deferred.resolve({ error: error, data: null });
                            });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, data: null });
                        });
                        break;


                }
            } catch (e) {
                utilService.logtoConsole(e.message);
                //if (callback) {
                //    callback.call(scope, { result: "failed", error: e });
                //}
                deferred.resolve({ error: e.message, data: null });
            }
            return deferred.promise;

        },

        clearEndDate: function () {
            var deferred = $q.defer();
            var db = dbInitService.getdatabase();
            if (db == null) {
                deferred.resolve({ error: "error accessing database", data: null });
                throw new Error("error accessing database");
            }
            var prsns = this.processRSN_insp;
            var query = "UPDATE FolderProcess SET EndDate=null WHERE ProcessRSN in (" + prsns + ")";
            
            db.transaction(function (tx) {
                tx.executeSql(query, [],
                    function(itx, result) {
                        deferred.resolve({ error: null, data: 'success' });
                    },
                    function(itx, error) {
                        console.log(error);
                        deferred.resolve({ error: error, data: null });
                    });
            });
            return deferred.promise;
        },

        storeFolderRsnInMemory: function (rawData,  scope) {
            try {
                this.folderRSN = [];
                var processRSNs = [];
                var rows = loadParserService.getDataRows(rawData);
                for (var i = 0; i < rows.length; i++) {
                    var cols = null;
                    if (rows[i] != null && rows[i] !== "") {
                        cols = loadParserService.getDataColumns(rows[i]);
                        if (cols.length >= 2) {
                            if (!isNaN(cols[1])) {
                                if (this.folderRSN.indexOf(cols[1]) < 0) {
                                    this.folderRSN.push(cols[1].trim());
                                }
                            }
                            if (!isNaN(cols[0])) {
                                var rsn = Number(cols[0]);
                                if (processRSNs.indexOf(rsn) < 0) {
                                    processRSNs.push(rsn);
                                }
                            }
                        }
                    }
                }
                this.processRSN_insp = processRSNs.join(",");
                this.FolderRsn = this.folderRSN.join(",");

                rows = null;
                //if (callback) {
                //    utilService.logtoConsole("Folder Rsn stored in memory successfully");
                //    callback.call(scope, { result: "success", error: null });
                //}
            } catch (e) {
                utilService.logtoConsole(e.message);
                //if (callback) {
                //    utilService.logtoConsole("Folder Rsn not stored in memory");
                //    callback.call(scope, { result: "failed", error: e });
                //}
            }
        },

        storeProcessRsnInMemory: function (rawData, scope) {
            try {
                this.processRsn = [];
                var rows = loadParserService.getDataRows(rawData);
                for (var i = 0; i < rows.length; i++) {
                    var cols = null;
                    if (rows[i] != null && rows[i] !== "") {
                        cols = loadParserService.getDataColumns(rows[i]);
                        if (cols.length >= 14) {
                            if (!isNaN(cols[8])) {
                                if (this.processRsn.indexOf(cols[8]) < 0) {
                                    this.processRsn.push(cols[8].trim());
                                }
                            }
                        }
                        //this.processRsn += cols[1] + ",";
                    }
                }
                this.ProcessRsn = this.processRsn.join(",");

                rows = null;
                //if (callback) {
                //    utilService.logtoConsole("ProcessRSN stored in memory successfully");
                //    callback.call(scope, { result: "success", error: null });
                //}
            } catch (e) {
                utilService.logtoConsole(e.message);
                //if (callback) {
                //    utilService.logtoConsole("ProcessRSN not stored in memory");
                //    callback.call(scope, { result: "failed", error: e });
                //}
            }
        },

        deleteRows: function (rawData,  scope, tblObj) {
            var deferred = $q.defer();
            if (tblObj != null) {
                var deleteSyntax = "DELETE FROM {0} WHERE {1} IN {2}";
                var tablename = tblObj.deletedtablename;
                var colcounts = tblObj.fields.length - 1;
                var colnames = dbInitService.getColumnName(tblObj.fields);
                var colvalues = dbInitService.getBlankColumnValues(tblObj.fields);
                try {
                    var me = this,
                        db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data: null });
                        throw new Error("error accessing database");
                    }
                   
                    db.transaction(function (tx) {
                        var rows = loadParserService.getDataRows(rawData);
                        var primaryId = "";
                        for (var i = 0; i < rows.length; i++) {
                            cfpLoadingBar.start();
                            //utilService.showError("Processing data. please wait..");
                            var cols = loadParserService.getDataColumns(rows[i]);
                            if (rows[i] != null && rows[i] != "" && cols[0] != "") {
                                primaryId += cols[0] + ",";
                            }
                            if (cols.length < colcounts) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colcounts) {
                                cols.splice(colcounts, cols.length - colcounts);
                            }
                            cols = null;
                        }
                        if (primaryId !== "") {
                            var sql = String.format(deleteSyntax, tablename, colnames.split(",")[0], "(" + primaryId + ")");
                            sql = sql.substring(0, sql.lastIndexOf(",")) + ")";
                            tx.executeSql(sql, [],
                                function (itx, result) {
                                    //cfpLoadingBar.complete();
                                    deferred.resolve({ error: null, data: 'success' });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error, "error");
                                    //cfpLoadingBar.complete();
                                    deferred.resolve({ error: error, data: null });
                                });
                        } else {
                            deferred.resolve({ error: null, data: 'success' });
                        }
                        rows = null;
                        //if (callback) {
                        //    utilService.logtoConsole("record deleted from " + tablename);
                        //    callback.call(scope, { result: "success", error: null });
                        //}
                    });
                    
                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    //    utilService.logtoConsole("record not deleted from " + tablename);
                    //    callback.call(scope, { result: "failed", error: e });
                    //}
                    deferred.resolve({ error: e.message, data: null });
                }
            }
            else {
                deferred.resolve({ error: "tblObj not defined", data: null });
            }
            return deferred.promise;
        },

        insertUpdateRows: function (rawData,  scope, tblObj) {
            var deferred = $q.defer();
            if (tblObj != null) {
                try {
                    var me = this, colnames, colvalues, removeIndex = [], idColumnIndex;
                    var tablename = tblObj.tablename;
                    if (tablename == "folderprocess") {
                        //debugger;
                    }
                    if (tblObj.quickSyncColumns) {
                        colnames = dbInitService.getParserColumnName(tblObj.quickSyncColumns);
                        colvalues = dbInitService.getParserColumnName(tblObj.quickSyncColumns, true);
                        removeIndex = dbInitService.getRemovableColumnIndexes(tblObj.quickSyncColumns);
                        idColumnIndex = dbInitService.getIdColumnIndex(tblObj.quickSyncColumns);
                    } else {
                        colnames = dbInitService.getColumnName(tblObj.fields);
                        colvalues = dbInitService.getBlankColumnValues(tblObj.fields);
                        idColumnIndex = dbInitService.getSchemaIdColumnIndex(tblObj.fields);
                    }
                    //var colArray = colnames.split(',');
                    var db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data:null });
                        throw new Error("error accessing database");
                    }


                    var insertSyntax = "INSERT INTO {0} ({1}) VALUES({2})";
                    var updateSyntax = "UPDATE {0} {1}  where {3} = {2}";
                    var rows = loadParserService.getDataRows(rawData);
                    if (rows.length > 0) {
                        var i = 0;
                        for (i = 0; i < rows.length; i++) {
                            cfpLoadingBar.start();
                            //utilService.showError("Processing data. please wait..");
                            var cols = loadParserService.getDataColumns(rows[i]);
                            var colsToInsert = loadParserService.getDataColumns(rows[i]);

                            //remove data from cols array which are not mapped to table
                            var colArray = colnames.split(",");
                            for (var x = 0; x < removeIndex.length; x++) {
                                cols.splice(removeIndex[x], 1);
                                colsToInsert.splice(removeIndex[x], 1);
                            }
                            //var whereClauseValue = cols[idColumnIndex[0]]; //need handling if there are more than one id column (composite keys like folderinfo, processinfo
                            var whereClauseValues = dbInitService.getValuesAtIndex(cols, idColumnIndex);
                            var whereClauseColumns = dbInitService.getValuesAtIndex(colArray, idColumnIndex);



                            //remove extra columns (if schema's columns count is lesser than data columns)
                            if (cols.length < colArray.length) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (cols.length > colArray.length) {
                                cols.splice(colArray.length, cols.length - colArray.length);
                            }
                            if (colsToInsert.length < colArray.length) {
                                deferred.resolve({ error: null, data: 'success' });
                                continue;
                            } else if (colsToInsert.length > colArray.length) {
                                colsToInsert.splice(colArray.length, colsToInsert.length - colArray.length);
                            }

                            var setStatement = "";
                            for (var j = 0; j < colArray.length; j++) {
                                setStatement += colArray[j] + " = ?,";
                            }
                            setStatement = setStatement.substring(0, setStatement.lastIndexOf(","));
                            setStatement = " SET " + setStatement;


                            me.processData(db, cols, colsToInsert, insertSyntax, updateSyntax, tablename, setStatement, whereClauseValues, whereClauseColumns, colnames, colvalues).then(function (result) {
                                deferred.resolve({ error: null, data: 'success' });
                                cfpLoadingBar.start();
                            }).catch(function (error) {
                               
                                deferred.resolve({ error: error, data: null });
                            })
                            colsToInsert = null;
                            cols = null;

                        }
                       
                    } else {
                        deferred.resolve({ error: null, data: 'success' });
                    }
                    rows = null;
                    //if (callback) {
                    //    utilService.logtoConsole("Record insert/update completed for " + tablename);
                    //    callback.call(scope, { result: "success", error: null });
                    //}

                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    //    utilService.logtoConsole("Error occurred insert/update rows into  " + tablename);
                    //    callback.call(scope, { result: "failed", error: e });
                    //}
                    deferred.resolve({ error: e.message, data: null });
                }
            }
            else {
                deferred.resolve({ error: 'tblObj not defined', data: null });
            }
            return deferred.promise;
        },

        processData: function (db, cols, colsToInsert, insertsql, updatesql, tablename, setStatement, whereClauseValues, primaryCol, colnames, colvalues) {
            var deferred = $q.defer();
            db.transaction(function (tx) {
                var selectsqlWhereClase = $.map(primaryCol, function (item, index) {
                    return String.format("{0}=?", item);
                }).join(" AND ");
                var primaryColSelect = $.map(primaryCol, function (item, index) {
                    return item;
                }).join();
                var updateSyntax = "UPDATE {0} {1}  where {2};";
                var updateParams = $.merge(cols, whereClauseValues);
                updatesql = String.format(updateSyntax, tablename, setStatement, selectsqlWhereClase);
                tx.executeSql(updatesql, updateParams,
                function (itx, result) {
                    if (result.rows && result.rowsAffected > 0) {
                        //cfpLoadingBar.complete();
                        //utilService.showError("Processing data. please wait..");
                        deferred.resolve({ error: null, data: 'success' });
                    } else {
                        //record doesn't exists - insert it
                        insertsql = String.format(insertsql, tablename, colnames, colvalues);
                        itx.executeSql(insertsql, colsToInsert,
                           function (iitx, iresult) {
                               //utilService.logtoConsole("Record Inserted Into " + tablename + " " + colnames + " " + colsToInsert + " Through Quick Sync");
                               //cfpLoadingBar.complete();
                               deferred.resolve({ error: null, data: 'success' });

                           },
                           function (iitx, error) {
                               utilService.logtoConsole(error, "error");
                               utilService.logtoConsole("error insert for table " + tablename + " " + colnames + " " + colsToInsert);
                               //cfpLoadingBar.complete();
                               deferred.resolve({ error: error, data: null });
                           });
                    }
                },
                function (itx, error) {
                    utilService.logtoConsole(error, "error");
                    utilService.logtoConsole("error update for table " + tablename + " " + selectsqlWhereClase + " " + updateParams, "error");
                    //cfpLoadingBar.complete();
                    deferred.resolve({ error: error, data: null });
                });
            });
            return deferred.promise;
        },
        UpdateReassignedProcess: function (rawData, scope, tblObj) {
            var deferred = $q.defer();
            if (tblObj != null) {
                try {
                    var db = dbInitService.getdatabase();
                    if (db == null) {
                        deferred.resolve({ error: "error accessing database", data: null });
                        throw new Error("error accessing database");
                    }
                    var me = this, colnames, colvalues, removeIndex = [], idColumnIndex;
                    var tablename = tblObj.tablename;
                    db.transaction(function (tx) {
                        var updateSyntax = "update folderprocess set scheduledate=?, assigneduser=?, enddate=? where processrsn=?";
                        var rows = loadParserService.getDataRows(rawData);
                        if (rows.length > 0) {
                            for (var i = 0; i < rows.length; i++) {
                                cfpLoadingBar.start();
                                //utilService.showError("Processing data. please wait..");
                                var cols = loadParserService.getDataColumns(rows[i]);
                                var updateParams = [];
                                updateParams.push(cols[2], cols[4], cols[5], cols[0]);

                                (function () {
                                    this.ttx.executeSql(this.sql, this.cols,
                                    function (itx, result) {
                                        //cfpLoadingBar.complete();
                                        deferred.resolve({ error: null, data: 'success' });
                                    },
                                    function (itx, error) {
                                        utilService.logtoConsole(error, "error");
                                        utilService.logtoConsole("error insert for table " + tablename);
                                        //cfpLoadingBar.complete();
                                        deferred.resolve({ error: error, data: null });
                                    });

                                }).call({ ttx: tx, sql: updateSyntax, cols: updateParams });

                                cols = null;
                                updateParams = [];
                            }
                        } else {
                            deferred.resolve({ error: null, data: 'success' });
                        }
                        rows = null;
                        //if (callback) {
                        //    utilService.logtoConsole("Record insert/update completed for " + tablename + " Reassigned Process");
                        //    callback.call(scope, { result: "success", error: null });
                        //}
                    });

                } catch (e) {
                    utilService.logtoConsole(e, "error");
                    //if (callback) {
                    //    utilService.logtoConsole("Error occurred insert/update rows into  " + tablename + " Reassigned Process");
                    //    callback.call(scope, { result: "failed", error: e });
                    //}
                    deferred.resolve({ error: e.message, data: null });
                }
            } else {
                deferred.resolve({ error: "tblObj not defined", data: null });
            }
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