app.factory("syncHelperService", function (utilService, dbInitService, requetBuilderService,
    requestHelperService, quicksyncParserService, commonParserService, dataLayerService, $q,
    cfpLoadingBar, $timeout, $filter, CommonService, $cordovaNetwork) {

    dataLayerService.getSiteOptions();

    return {

        inspectionJspRes: null,
        countRequests: null,
        requests: [],
        pageSize: 500,
        fullSyncCallback: null,
        fullSyncCallbackScope: null,
        stautscallback: null,
        datarequests: 0,
        pendingrequests: [],
        uploadrequests: [],
        refinterval: null,
        syncStartedAt: null,
        syncCompletedAt: null,
        dataProcessinginprogress: false,

        quickSyncCallback: null,
        quickSyncCallbackScope: null,
        syncType: "",
        updateStampDateExecuted: false,

        checkFreeFormCallBack: null,
        checkFreeFormCallBackScope: null,
        isFreeFormRequired: false,
        pastDaysCount: 0,
        futureDaysCount: 0,
        existingFolderRSNs: null,
        existingProcessRSNs: null,
        serverTimeStamp: null,
        checkIfFreeFormData: function (callback, scope) {
            try {
                this.checkFreeFormCallBack = callback;
                this.checkFreeFormCallBackScope = scope;
                //this.stautscallback = statusCallback;
                var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
                var userId = serverSettings[0].UserName || "";
                var password = serverSettings[0].Password || "";
                if ((userId !== "") && (password !== "")) {
                    if (this.stautscallback) {
                        this.stautscallback.call(this.checkFreeFormCallBackScope, "Authenticating to download the record...")
                    }
                    requestHelperService.ExecuteServiceLoginRequest(userId, password, this, this.checkFreeFromLoginCallback, "json");
                } else { utilService.logtoConsole("Login or Password not supplied.."); }

            } catch (e) {
                utilService.logtoConsole(e, "error");
                if (this.checkFreeFormCallBack) {
                    this.checkFreeFormCallBack.call(this.checkFreeFormCallBackScope, { message: e.message });
                }
            }
        },

        checkFreeFromLoginCallback: function (result) {
            if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                this.checkFreeFormCallBackScope.userSettings = [];
                this.checkFreeFormCallBackScope.userSettings.push({
                    username: result.request.data.UN,
                    password: result.request.data.PW,
                    lid: result.response.lid,
                    validuser: result.response.validUser
                });
                // for now i am using current date
                this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                localStorage.setItem("userSettings", JSON.stringify(this.checkFreeFormCallBackScope.userSettings));

                if (this.stautscallback) {
                    this.stautscallback.call(this.checkFreeFormCallBackScope, "Authenticated...checking if free form data required.")
                }

                var request = requetBuilderService.ExecuteServiceCheckFreeFormData(this, "_ValidSiteMobileOption.jsp");
                requestHelperService.ExecuteServiceRequest(request, this, this.successFreeForm, this.failedFreeFrom);
            }
            else {
                utilService.logtoConsole("Authentication Failed..");
                if (this.stautscallback) {
                    this.stautscallback.call(this.checkFreeFormCallBackScope, "Authentication Failed..")
                }
                if (this.checkFreeFormCallBack) {
                    this.checkFreeFormCallBack.call(this.checkFreeFormCallBackScope, { message: "Authentication Failed.." });
                }
            }
        },

        successFreeForm: function (successResult) {
            if (successResult) {
                if (this.stautscallback) {
                    this.stautscallback.call(this.checkFreeFormCallBackScope, "Free form data required.")
                }
                if (this.checkFreeFormCallBack) {
                    if (successResult.response && successResult.response.indexOf("enable freeform¥y") > 0)
                        this.checkFreeFormCallBack.call(this.checkFreeFormCallBackScope, { error: null, data: "freeformrequired" });
                    else
                        this.checkFreeFormCallBack.call(this.checkFreeFormCallBackScope, { error: null, data: null });
                }
            }
        },

        failedFreeFrom: function (failureResult) {
            if (failureResult) {
                if (this.stautscallback) {
                    this.stautscallback.call(this.checkFreeFormCallBackScope, "Failed while checking form data.")
                }
                if (this.checkFreeFormCallBack) {
                    this.checkFreeFormCallBack.call(this.checkFreeFormCallBackScope, { error: failureResult, data: null });
                }
            }
        },


        dofullsync: function (type, callback, scope, statuscallback, freeformrequired) {
            try {
                this.fullSyncCallback = callback;
                this.fullSyncCallbackScope = scope;
                this.stautscallback = statuscallback;
                this.syncType = type;
                this.isFreeFormRequired = freeformrequired;
                this.updateStampDateExecuted = false;
                var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
                var userId = serverSettings[0].UserName || "";
                var password = serverSettings[0].Password || "";
                if ((userId !== "") && (password !== "")) {
                    if (this.syncType !== "FF") { // This is added to check if freefrom data needs to be download if so do not reset sync startdate
                        this.syncStartedAt = new Date();
                    }
                    requestHelperService.ExecuteServiceLoginRequest(userId, password, this, this.fullsyncLoginCallback, "json");
                } else { utilService.logtoConsole("Login or Password not supplied.."); }

            } catch (e) {
                utilService.logtoConsole(e, "error");
                if (this.fullSyncCallback) {
                    this.fullSyncCallback.call(this.fullSyncCallbackScope, { message: e.message });
                }
            }
        },

        fullsyncLoginCallback: function (result) {
            if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                this.fullSyncCallbackScope.userSettings = [];
                this.fullSyncCallbackScope.userSettings.push({
                    username: result.response.IN,
                    password: result.request.data.PW,
                    lid: result.response.lid,
                    validuser: result.response.validUser
                });
                // for now i am using current date
                this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');// result.response.serverTimeStamp;

                localStorage.setItem("userSettings", JSON.stringify(this.fullSyncCallbackScope.userSettings));
                this.getfullsyncitems(this.getfullsyncitemsCallback, this);
            }
            else {
                utilService.logtoConsole("Authentication Failed..");
                if (this.fullSyncCallback) {
                    this.fullSyncCallback.call(this.fullSyncCallbackScope, { message: "Authentication Failed.." });
                }
            }
        },

        getfullsyncitemsCallback: function (qresult) {
            var i;
            if (qresult.error == null) {
                var result = qresult.result;
                this.requests = [];
                this.countRequests = [];
                var tablesToClean = [];
                for (i = 0; i < result.length; i++) {
                    var syncInfo = result[i];

                    if (syncInfo["lastsyncdate"] == null || syncInfo["lastsyncdate"] === "") {//if last sync date is blank
                        //Shailendra
                        var tableschemaObj = dbInitService.getTableSchema(syncInfo["jspname"]);
                        if (tableschemaObj != null) {
                            tablesToClean.push(tableschemaObj.tablename);
                            //parser = null;
                        }
                    }

                    var request;
                    if (syncInfo["countfirst"] === "1") {
                        request = requetBuilderService.BuildFullSyncCountRequest(syncInfo);
                        $.extend(request, { async: false, syncType: this.syncType });
                        this.countRequests.push(request);
                    } else {
                        request = requetBuilderService.BuildFullSyncRequest(syncInfo, 0, 0);
                        $.extend(request, { async: false, lastrequest: true, syncType: this.syncType });
                        this.requests.push(request);
                    }
                }

                if (this.stautscallback) {
                    this.stautscallback.call(this.fullSyncCallbackScope, "Deleting exising records...");
                }

                this.cleanTables(tablesToClean, function (cleantableresult) {
                    this.initializeSequence(tablesToClean, this.initializeSequenceCallback, this);
                }, this);
            } else {
                utilService.logtoConsole(qresult.error);
                if (this.stautscallback) {
                    this.stautscallback.call(this.fullSyncCallbackScope, qresult.error.message);
                }
            }

        },

        initializeSequenceCallback: function (initializeSequenceResult) {
            //this.syncStartedAt = new Date();
            var syncinProgress = this.countRequests.length > 0 || this.requests.length > 0;
            if (syncinProgress) {
                if (this.stautscallback) {
                    this.stautscallback.call(this.fullSyncCallbackScope, "Sync in progress. Please wait..");
                }
                var me = this;
                me.pendingrequest = null;
                if (me.countRequests) {
                    me.countRequests.reverse();
                }
                if (me.countRequests && me.countRequests.length > 0) {
                    var request = me.countRequests.pop();
                    if (request) {
                        requestHelperService.ExecuteServiceRequest(request, me, me.FullSyncSuccess, me.FullSyncFailed);
                    }
                } else {
                    this.ExecuteRequests(me);
                }
            }
        },

        doquicksyncwithupload: function (callback, scope, statuscallback) {
            var me = this;
            this.updateStampDateExecuted = false;
            var uploadCallback = callback;
            var uploadCallbackScope = scope;
            var uploadstatuscallback = statuscallback;

            var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
            var userId = serverSettings[0].UserName;
            var password = serverSettings[0].Password;

            if ((userId != null) && (password != null)) {
                requestHelperService.ExecuteServiceLoginRequest(userId,
                    password,
                    this,
                    function (result) {
                        if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                            scope.userSettings = [];
                            scope.userSettings.push({
                                username: result.request.data.UN,
                                password: result.request.data.PW,
                                lid: result.response.lid,
                                validuser: result.response.validUser
                            });
                            // for now i am using current date
                            this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                            localStorage.setItem("userSettings", JSON.stringify(scope.userSettings));
                            me.UploadDataToServer(uploadCallback, uploadCallbackScope, uploadstatuscallback, scope.userSettings);
                        } else {
                            utilService.logtoConsole("Authentication Failed..");
                            uploadstatuscallback.call(uploadCallbackScope, "Authentication Failed..");
                        }
                    }, "json");
            } else {
                utilService.logtoConsole("Login or Password not supplied..");
                uploadstatuscallback.call(uploadCallbackScope, "Login or Password not supplied..");
            }

        },
        doQuickSyncToProcessPriorityupload: function (callback, scope, statuscallback) {
            var me = this;
            this.updateStampDateExecuted = false;
            var uploadCallback = callback;
            var uploadCallbackScope = scope;
            var uploadstatuscallback = statuscallback;

            var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
            var userId = serverSettings[0].UserName;
            var password = serverSettings[0].Password;

            if ((userId != null) && (password != null)) {
                requestHelperService.ExecuteServiceLoginRequest(userId,
                    password,
                    this,
                    function (result) {
                        if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                            scope.userSettings = [];
                            scope.userSettings.push({
                                username: result.request.data.UN,
                                password: result.request.data.PW,
                                lid: result.response.lid,
                                validuser: result.response.validUser
                            });
                            // for now i am using current date
                            this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                            localStorage.setItem("userSettings", JSON.stringify(scope.userSettings));
                            me.UploadProcessPriorityToServer(uploadCallback, uploadCallbackScope, uploadstatuscallback, scope.userSettings);
                        } else {
                            utilService.logtoConsole("Authentication Failed..");
                            uploadstatuscallback.call(uploadCallbackScope, "Authentication Failed..");
                        }
                    }, "json");
            } else {
                utilService.logtoConsole("Login or Password not supplied..");
                uploadstatuscallback.call(uploadCallbackScope, "Login or Password not supplied..");
            }

        },

        doquicksyncafterupload(type, callback, scope, statuscallback, freeformrequired, isQSD, existingfolderrsn, existingprocessrsn) {
            var me = this;
            this.updateStampDateExecuted = false;
            this.quickSyncCallback = callback;
            this.quickSyncCallbackScope = scope;
            this.stautscallback = statuscallback;
            this.syncType = type;
            this.isFreeFormRequired = freeformrequired;
            if (this.syncStartedAt == null) {
                this.syncStartedAt = new Date();
            }
            if (existingfolderrsn) {
                this.existingFolderRSNs = existingfolderrsn;
            }
            if (existingprocessrsn) {
                this.existingProcessRSNs = existingprocessrsn;
            }
            var tablename = [];

            var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
            var userId = serverSettings[0].UserName;
            var password = serverSettings[0].Password;


            if ((userId != null) && (password != null)) {
                requestHelperService.ExecuteServiceLoginRequest(userId,
                           password,
                           this,
                           function (result) {
                               if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                                   scope.userSettings = [];
                                   scope.userSettings.push({
                                       username: result.request.data.UN,
                                       password: result.request.data.PW,
                                       lid: result.response.lid,
                                       validuser: result.response.validUser
                                   });
                                   this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                                   localStorage.setItem("userSettings", JSON.stringify(scope.userSettings));

                                   this.getquicksyncitems(function (qresult) {
                                       var i;
                                       if (qresult.error == null) {
                                           var result = qresult.result;
                                           this.quickrequests = [];
                                           this.countRequests = [];
                                           var tablesToClean = [];

                                           var validsiteoptions = dataLayerService.siteOptions;

                                           var pastdays = null;
                                           var pastdaysobj = $filter('filter')(validsiteoptions, { optionkey: "Number of past days" }, true);
                                           if (pastdaysobj && pastdaysobj.length > 0) {
                                               this.pastDaysCount = pastdaysobj[0].optionvalue;
                                           } else {
                                               this.pastDaysCount = 30
                                           }


                                           var futuredays = null;
                                           var futuredaysobj = $filter('filter')(validsiteoptions, { optionkey: "Number of future days" }, true);
                                           if (futuredaysobj && futuredaysobj.length > 0) {
                                               this.futureDaysCount = futuredaysobj[0].optionvalue;
                                           } else {
                                               this.futureDaysCount = 30
                                           }

                                           for (i = 0; i < result.length; i++) {
                                               var syncInfo = result[i];

                                               if (syncInfo["lastsyncdate"] === null || syncInfo["lastsyncdate"] === "") {
                                                   var tableschemaObj = dbInitService.getTableSchema(syncInfo["jspname"]);
                                                   if (tableschemaObj != null) {
                                                       tablesToClean.push(tableschemaObj.tablename);
                                                       if (me.stautscallback) {
                                                           me.stautscallback.call(me.quickSyncCallbackScope, "Deleting records from " + tableschemaObj.tablename);
                                                       }
                                                   }

                                               } else if (syncInfo["lastsyncdate"] === "current date") {
                                                   syncInfo["lastsyncdate"] = moment(me.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss');
                                                   syncInfo["FD"] = this.futureDaysCount;
                                                   syncInfo["PD"] = this.pastDaysCount;
                                               }
                                               if (isQSD && isQSD === "QSD" && syncInfo["lastsyncdate"] !== "current date") {
                                                   syncInfo["lastsyncdate"] = syncInfo["lastsyncdate"] !== "" ? moment(syncInfo["lastsyncdate"]).format('YYYY-MM-DD HH:mm:ss') : "";
                                                   syncInfo["FD"] = this.futureDaysCount;
                                                   syncInfo["PD"] = this.pastDaysCount;
                                               }
                                               if (isQSD && isQSD === "SD") {
                                                   syncInfo["FD"] = this.futureDaysCount;
                                                   syncInfo["PD"] = this.pastDaysCount;
                                               }
                                               var request;
                                               if (syncInfo["countfirst"] === "1") {
                                                   request = requetBuilderService.BuildFullSyncCountRequest(syncInfo);
                                                   
                                                   $.extend(request, { async: false, syncType: this.syncType });
                                                   this.countRequests.push(request);
                                               } else {
                                                   if (isQSD && isQSD === "QSD") {
                                                       request = requetBuilderService.BuildQuickSyncQSDRequest(syncInfo, 0, 0);
                                                   }
                                                   else {
                                                       request = requetBuilderService.BuildQuickSyncRequest(syncInfo, 0, 0);
                                                   }

                                                   $.extend(request, { async: false, lastrequest: true, syncType: type });
                                                   this.quickrequests.push(request);
                                               }

                                           }


                                           if (me.stautscallback) {
                                               me.stautscallback.call(me.quickSyncCallbackScope, "Deleting exising records...");
                                           }

                                           this.cleanTables(tablesToClean, function (cleantableresult) {
                                               if (me.stautscallback) {
                                                   me.stautscallback.call(me.quickSyncCallbackScope, "Initializing sequence of tables...");
                                               }
                                               this.initializeSequence(tablesToClean, function (result) {

                                                   var syncinProgress = me.quickrequests.length > 0;
                                                   if (syncinProgress) {
                                                       if (me.stautscallback) {
                                                           me.stautscallback.call(me.quickSyncCallbackScope, "Downloading record counts..");
                                                       }
                                                       //var me = this;
                                                       me.pendingrequest = null;
                                                       if (me.quickrequests) {
                                                           me.quickrequests.reverse();
                                                       }

                                                       if (me.quickrequests && me.quickrequests.length > 0) {
                                                           var request = me.quickrequests.pop();
                                                           if (request) {
                                                               requestHelperService.ExecuteServiceRequest(request, me, me.QuickSyncSuccess, me.QuickSyncFailed);
                                                               me.stautscallback.call(me.quickSyncCallbackScope, "Downloading records..");
                                                           }
                                                       }
                                                   }
                                               }, me);
                                           }, me);


                                       } else {
                                           utilService.logtoConsole(qresult.error);
                                           me.stautscallback.call(me.quickSyncCallbackScope, qresult.error);
                                       }

                                   }, me);


                               }
                               else {
                                   utilService.logtoConsole("Authentication Failed..");
                                   me.stautscallback.call(me.quickSyncCallbackScope, "Authentication Failed..");
                               }
                           }, "json");

            }
            else {
                utilService.logtoConsole("Login or Password not supplied..");
                me.stautscallback.call(me.quickSyncCallbackScope, "Login or Password not supplied..");
            }


        },

        doquicksync: function (type, callback, scope, statuscallback) {
            var me = this;
            this.quickSyncCallback = callback;
            this.quickSyncCallbackScope = scope;
            this.stautscallback = statuscallback;
            this.syncType = type;
            this.updateStampDateExecuted = false;

            var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
            var userId = serverSettings[0].UserName;
            var password = serverSettings[0].Password;
            if ((userId != null) && (password != null)) {
                requestHelperService.ExecuteServiceLoginRequest(userId,
                        password,
                        this,
                        function (result) {
                            if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "" )) {
                                scope.userSettings = [];
                                scope.userSettings.push({
                                    username: result.request.data.UN,
                                    password: result.request.data.PW,
                                    lid: result.response.lid,
                                    validuser: result.response.validUser
                                });
                                // for now i am using current date
                                this.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                                localStorage.setItem("userSettings", JSON.stringify(scope.userSettings));
                                var tablename = [];

                                this.getquicksyncitems(function (qresult) {
                                    var i;
                                    if (qresult.error == null) {
                                        var result = qresult.result;
                                        this.quickrequests = [];
                                        this.countRequests = [];
                                        var tablesToClean = [];

                                        for (i = 0; i < result.length; i++) {
                                            var syncInfo = result[i];

                                            if (syncInfo["lastsyncdate"] == null || syncInfo["lastsyncdate"] === "") {
                                                var tableschemaObj = dbInitService.getTableSchema(syncInfo["jspname"]);
                                                if (tableschemaObj != null) {
                                                    tablesToClean.push(tableschemaObj.tablename);
                                                    if (me.stautscallback) {
                                                        me.stautscallback.call(me.quickSyncCallbackScope, "Deleting records from " + tableschemaObj.tablename);
                                                    }
                                                }

                                            }
                                            var request;
                                            request = requetBuilderService.BuildQuickSyncRequest(syncInfo, 0, 0);
                                            $.extend(request, { async: false, lastrequest: true, syncType: type });
                                            this.quickrequests.push(request);

                                        }


                                        if (me.stautscallback) {
                                            me.stautscallback.call(me.quickSyncCallbackScope, "Deleting exising records...");
                                        }

                                        this.cleanTables(tablesToClean, function (cleantableresult) {
                                            if (me.stautscallback) {
                                                me.stautscallback.call(me.quickSyncCallbackScope, "Initializing sequence of tables...");
                                            }
                                            this.initializeSequence(tablesToClean, function (result) {
                                                //this.syncStartedAt = new Date();
                                                //  var syncinProgress = this.countRequests.length > 0 || this.requests.length > 0;
                                                var syncinProgress = this.quickrequests.length > 0;
                                                if (syncinProgress) {
                                                    if (me.stautscallback) {
                                                        me.stautscallback.call(me.quickSyncCallbackScope, "Downloading record counts..");
                                                    }
                                                    //var me = this;
                                                    me.pendingrequest = null;
                                                    if (me.quickrequests) {
                                                        me.quickrequests.reverse();
                                                    }

                                                    if (me.quickrequests && me.quickrequests.length > 0) {
                                                        var request = me.quickrequests.pop();
                                                        if (request) {
                                                            requestHelperService.ExecuteServiceRequest(request, me, me.QuickSyncSuccess, me.QuickSyncFailed);
                                                            me.stautscallback.call(me.quickSyncCallbackScope, "Downloading records..");
                                                        }
                                                    }
                                                }
                                            }, me);
                                        }, me);
                                    } else {
                                        utilService.logtoConsole(qresult.error);
                                        me.stautscallback.call(me.quickSyncCallbackScope, qresult.error);
                                    }

                                }, me);

                                var gg = "";
                            }
                            else {
                                utilService.logtoConsole("Authentication Failed..");
                                me.stautscallback.call(me.quickSyncCallbackScope, "Authentication Failed..");
                            }
                        }, "json");
            } else {
                utilService.logtoConsole("Login or Password not supplied..");
                me.stautscallback.call(me.quickSyncCallbackScope, "Login or Password not supplied..");
            }

        },

        getquicksyncitems: function (callback, scope) {
            try {
                var me = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                db.transaction(function (tx) {
                    var makerequestforfolderprocess = true;
                    var makerequestforfolderprocessinfo = true;
                    var makerequestforfolderprocesschecklist = true;
                    var sqltocheckrecord = "Select 1 from folderprocess";
                    tx.executeSql(sqltocheckrecord, [], function (itx, result) {
                        if (result.rows.length===0) {
                            makerequestforfolderprocess = false;
                        }
                        var sqltocheckrecord = "Select 1 from folderprocessinfo";
                        itx.executeSql(sqltocheckrecord, [],
                            function (iitx, result) {
                                if (result.rows.length===0) {
                                    makerequestforfolderprocessinfo = false;
                                }
                                var sqltocheckrecord = "Select 1 from folderprocesschecklist";

                                iitx.executeSql(sqltocheckrecord, [], function (iiitx, result) {
                                    if (result.rows.length===0) {
                                        makerequestforfolderprocesschecklist = false;
                                    }

                                    var sql = "";
                                    if (me.isFreeFormRequired) {
                                        sql = "SELECT * from SyncInfo where SyncType IN ('Q','FQ') ";
                                    } else {
                                        sql = "SELECT * from SyncInfo where SyncType ='Q' ";
                                    }

                                    if (!makerequestforfolderprocesschecklist) {
                                        sql += " and jspname !='_FolderProcessCheckListDel.jsp' "
                                    }
                                    if (!makerequestforfolderprocessinfo) {
                                        sql += " and jspname !='_FolderProcessInfoDel.jsp' "
                                    }
                                    if (!makerequestforfolderprocess) {
                                        sql += " and jspname NOT IN('_ProcessDel.jsp','_ReassignedProcess.jsp') "
                                    }
                                    sql += " ORDER BY exgroup, exorder";

                                    iiitx.executeSql(sql, [], function (iiiitx, result) {
                                        var resultRows = [];
                                        if (result.rows) {
                                            for (var i = 0; i < result.rows.length; i++) {
                                                resultRows.push(result.rows.item(i));
                                            }
                                        }
                                        callback.call(scope, { error: null, result: resultRows });
                                    },
                                           function (iiiitx, error) {
                                               callback.call(scope, { error: error, result: null });
                                           });

                                }, function (iiitx, error) {
                                    callback.call(scope, { error: error, result: null });
                                })


                            }, function (iitx, error) {
                                callback.call(scope, { error: error, result: null });
                            });


                    }, function (itx, error) {
                        callback.call(scope, { error: error, result: null });
                    });

                });
            } catch (e) {
                utilService.logtoConsole(e, "error");
                callback.call(scope, { error: error, result: null });
            }
        },

        CheckPendingRequest: function (me) {
            console.log("CheckPending Request Called");
            var callback = me.syncType === "C" ? me.fullSyncCallback : me.quickSyncCallback;
            var callbackScope = me.syncType === "C" ? me.fullSyncCallbackScope : me.quickSyncCallbackScope;

            /*if ((quicksyncParserService.parsercount <= 0 && me.syncType === "Q" && me.quickrequests.length === 0) ||
                (me.datarequests <= 1 && me.syncType !== "Q" & me.countRequests.length === 0 && me.requests.length === 0)) {*/

            //console.log("sync type: " + me.syncType + ", quickrequests: " + me.quickrequests.length + ", countRequests: " + me.countRequests.length + ", requests: " + me.requests.length);

            if ((me.syncType === "Q" && (me.quickrequests && me.quickrequests.length === 0)) ||
            (me.syncType !== "Q" & (me.countRequests && me.countRequests.length === 0) && (me.requests && me.requests.length === 0))) {

                if (!me.updateStampDateExecuted) {
                    me.updateStampDateExecuted = true;
                    var message;
                    if (me.stautscallback) {
                        message = "Sync in progress. Please wait..";
                        utilService.logtoConsole("First Time Sync updateStampDateExecuted", "info");
                        me.stautscallback.call(callbackScope, message);
                    }
                    clearInterval(me.refinterval);
                    $timeout(function () {
                        //me.updateStampDate(me).then(function (result) {

                        //});
                        me.syncCompletedAt = new Date();
                        var diffTime = utilService.timeDifference(me.syncCompletedAt, me.syncStartedAt, "");
                        if (me.stautscallback) {
                            var msgstring = "";
                            if (me.syncType === "C") {
                                message = "Sync in progress. Please wait..";

                            } else {
                                message = String.format("Sync Completed, started at: {0}, completed at: {1}, time elapsed:{2} ",
                                utilService.dateformat(me.syncStartedAt, "H:i:s"),
                                utilService.dateformat(me.syncCompletedAt, "H:i:s"),
                                diffTime);
                            }

                            utilService.logtoConsole("Sync Type : " + me.syncType+" executed", "info");
                            me.stautscallback.call(callbackScope, message);
                        }
                        if (callback) {
                            var msgstring = "";
                            if (me.syncType === "C") {
                                message = "Processing data. please wait..";
                                me.fullSyncCallback = null;
                            } else {
                                message = String.format("Sync Completed, time elapsed:{0} ", diffTime);
                                me.quickSyncCallback = null;
                                
                            }
                            utilService.logtoConsole(message, "info");
                            callback.call(callbackScope, { message: message, startTime: utilService.dateformat(me.syncStartedAt, "H:i:s"), endTime: utilService.dateformat(me.syncCompletedAt, "H:i:s") });
                            callback = null;

                            if (me.syncType !== "C") {
                                //me.clearAllVariable(me);
                            }
                        }
                        this.datarequests = 0;
                        // Added this to update user password immediately after sync and first time login
                        var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                        if ($.isArray(storedUser) && storedUser.length > 0) {
                            dataLayerService.updateUserPassword((storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser, storedUser[0].password).then(function (result) {
                                if (result.data && result.data != null) {
                                    utilService.logtoConsole("password updated successfully.");
                                } else {
                                    utilService.logtoConsole("password could not be updated.");
                                }
                            });
                        }
                    }, 1000)

                }


            }
        },

        clearAllVariable:function (me) {
            me.inspectionJspRes= null;
            me.countRequests= null;
            me.requests= [];
            me.pageSize= 500;
            me.fullSyncCallback= null;
            me.fullSyncCallbackScope= null;
            me.stautscallback= null;
            me.datarequests= 0;
            me.pendingrequests= [];
            me.uploadrequests= [];
            me.refinterval= null;
            me.syncStartedAt= null;
            me.syncCompletedAt= null;
            me.dataProcessinginprogress= false;
            me.quickSyncCallback= null;
            me.quickSyncCallbackScope= null;
            me.syncType= "";
            me.updateStampDateExecuted= false;
            me.checkFreeFormCallBack= null;
            me.checkFreeFormCallBackScope= null;
            me.isFreeFormRequired= false;
            me.pastDaysCount= 0;
            me.futureDaysCount= 0;
            me.existingFolderRSNs= null;
            me.existingProcessRSNs= null;
            me.serverTimeStamp= null;
        },

        ExecuteRequests: function (me) {
            var request;
            //me.dataProcessinginprogress = true;
            if (me.quickrequests && me.quickrequests.length > 0) {
                request = me.quickrequests.pop();
                if (request) {
                    setTimeout(requestHelperService.ExecuteServiceRequest(request, me, me.QuickSyncSuccess, me.QuickSyncFailed), 500, this);
                    //utilService.logtoConsole(request.url);
                }
            }
            else if (me.requests && me.requests.length > 0) {
                request = me.requests.pop();
                if (request) {
                    setTimeout(requestHelperService.ExecuteServiceRequest(request, me, me.FullSyncSuccess, me.FullSyncFailed), 500, this);
                    //utilService.logtoConsole(request.url);
                }
            } else {
                //me.CheckPendingRequest(me);
               setTimeout(function () { me.CheckPendingRequest(me) }, 100);
            }
        },

        QuickSyncSuccess: function (result) {

            //// checking if the request is upload request then nothing to do with local DB else download the data to local DB
            if (result.request.url.indexOf("EAI") > 0) {
                utilService.logtoConsole(result.response);
            }
            this.removeRequests(result.request);
            var syncInfo = result.request.syncInfo;

            if (result.request.countRequest === true) {
                var recordCount = this.getCount(result.response);

                if (recordCount > 0) {
                    var sr = 1;
                    do {
                        var ir = this.pageSize - 1;
                        if (sr + ir > recordCount) {
                            ir = recordCount - sr;
                        }
                        request = requetBuilderService.BuildFullSyncRequest(syncInfo, sr, ir);
                        sr += this.pageSize;
                        var lastRequest = sr < recordCount ? false : true;
                        if (result.request.data.PD) {
                            request.data.PD = result.request.data.PD;
                        }
                        if (result.request.data.FD) {
                            request.data.FD = result.request.data.FD;
                        }
                        if (result.request.data.PR) {
                            request.data.PR = result.request.data.PR;
                        }
                        if (result.request.data.FR) {
                            request.data.FR = result.request.data.FR;
                        }
                        if (result.request.data.EPR) {
                            request.data.EPR = result.request.data.EPR;
                        }
                        if (result.request.data.EFR) {
                            request.data.EFR = result.request.data.EFR;
                        }
                        if (result.request.data.PRL) {
                            request.data.PRL = result.request.data.PRL;
                        }
                        $.extend(request, {async: false, lastrequest: lastRequest, syncType: result.request.syncType});

                        this.quickrequests.push(request);
                    } while (sr < recordCount);

                    if (this.countRequests && this.countRequests.length > 0) {
                        request = this.countRequests.pop();
                        if (request) {
                            setTimeout(requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed), 500, this);
                        }
                    } else {
                        //setTimeout(this.ExecuteRequests, 1000, this);
                        setTimeout(this.ExecuteNextQuickSyncRequest(), 1000, this);
                    }
                }
                else {
                    this.datarequests++;
                    var synccategory = "quicksync";
                    //this.stautscallback.call(this.quickSyncCallback, "Processing: " + syncInfo['jspname']);
                    if (result.request.url.indexOf("EAI") < 0) {
                        if (this.stautscallback) {
                            this.stautscallback.call(this.quickSyncCallbackScope, "Sync in progress.Please wait..");
                        }
                        var sc = this;
                        //if (syncInfo["jspname"] === "_NewFolderInfo.jsp") {
                        //    debugger;
                        //}
                        quicksyncParserService.updatedatabase(result.response, synccategory, sc, syncInfo["jspname"], sc.serverTimeStamp).then(function (result) {
                            quicksyncParserService.parsercount--;
                            sc.datarequests--;
                            if (sc.countRequests && sc.countRequests.length > 0) {
                                request = sc.countRequests.pop();
                                if (request) {
                                    setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.QuickSyncSuccess, sc.QuickSyncFailed), 500, sc);
                                }
                            } else {
                                if (!sc.dataProcessinginprogress) {
                                    setTimeout(sc.ExecuteNextQuickSyncRequest(), 1000, sc);
                                }
                                else {
                                    sc.datarequests--;
                                }
                            }

                        }).catch(function (error) {
                            quicksyncParserService.parsercount--;
                            sc.datarequests--;
                            if (sc.countRequests && sc.countRequests.length > 0) {
                                request = sc.countRequests.pop();
                                if (request) {
                                    setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.QuickSyncSuccess, sc.QuickSyncFailed), 500, sc);
                                }
                            } else {
                                if (!sc.dataProcessinginprogress) {
                                    setTimeout(sc.ExecuteNextQuickSyncRequest(), 1000, sc);
                                }
                                else {
                                    sc.datarequests--;
                                }
                            }
                        });
                    }
                }
            } else {
                this.datarequests++;
                var synccategory = "quicksync";
                //this.stautscallback.call(this.quickSyncCallback, "Processing: " + syncInfo['jspname']);
                if (result.request.url.indexOf("EAI") < 0) {
                    if (this.stautscallback) {
                        this.stautscallback.call(this.quickSyncCallbackScope, "Sync in progress.Please wait..");
                    }
                    var sc = this;
                    //if (syncInfo["jspname"] === "_NewFolderInfo.jsp") {
                    //    debugger;
                    //}
                    quicksyncParserService.updatedatabase(result.response, synccategory, sc, syncInfo["jspname"], sc.serverTimeStamp).then(function (result) {
                        quicksyncParserService.parsercount--;
                        sc.datarequests--;
                        if (sc.countRequests && sc.countRequests.length > 0) {
                            request = sc.countRequests.pop();
                            if (request) {
                                setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.QuickSyncSuccess, sc.QuickSyncFailed), 500, sc);
                            }
                        } else {
                            if (!sc.dataProcessinginprogress) {
                                setTimeout(sc.ExecuteNextQuickSyncRequest(), 1000, sc);
                            }
                            else {
                                sc.datarequests--;
                            }
                        }

                    }).catch(function (error) {
                        quicksyncParserService.parsercount--;
                        sc.datarequests--;
                        if (sc.countRequests && sc.countRequests.length > 0) {
                            request = sc.countRequests.pop();
                            if (request) {
                                setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.QuickSyncSuccess, sc.QuickSyncFailed), 500, sc);
                            }
                        } else {
                            if (!sc.dataProcessinginprogress) {
                                setTimeout(sc.ExecuteNextQuickSyncRequest(), 1000, sc);
                            }
                            else {
                                sc.datarequests--;
                            }
                        }
                    });
                }
            }
        },

        QuickSyncFailed: function (result) {

            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to sync. Please connect to network and try again", 'error');
                this.countRequests = [];
                this.datarequests = 0;
                this.requests = [];
                this.quickrequests = [];
                return;
            }

            this.removeRequests(result.request);
            this.ExecuteNextQuickSyncRequest();
        },

        ExecuteNextQuickSyncRequest: function () {
            var sc;
            if (this.quickrequests && this.quickrequests.length > 0) {
                var request = this.quickrequests.pop();
                switch (request.syncInfo.jspname) {
                    case "_NewInspections.jsp":
                    case "_ProcessDel.jsp":
                    case "_FolderProcessCheckListDel.jsp":
                    case "_FolderProcessInfoDel.jsp":
                    case "_ReassignedProcess.jsp":
                    case "_NewFolder.jsp":
                    case "_NewPeople.jsp":
                    case "_NewProperty.jsp":
                    case "_NewFolderPeople.jsp":
                    case "_NewFolderProperty.jsp":
                    case "_NewFolderFixture.jsp":
                    case "_NewFolderComment.jsp":
                    case "_NewAccountBillFee.jsp":
                    case "_AllProcessAtm.jsp":
                    case "_AllProcessAttachments.jsp":
                    case "_FolderDocument.jsp":
                    case "_InspectionRequest.jsp":
                    case "_FolderProcessInspDetail.jsp":
                    case "_FolderProcessList.jsp":
                    case "_FolderRelation.jsp":
                        if ((quicksyncParserService.FolderRsn && quicksyncParserService.FolderRsn !== "")
                            || (quicksyncParserService.processRSN_insp && quicksyncParserService.processRSN_insp !== "")
                            || (this.existingFolderRSNs && this.existingFolderRSNs !== null)
                            || (this.existingProcessRSNs && this.existingProcessRSNs !== null)) {

                            if (quicksyncParserService.FolderRsn && quicksyncParserService.FolderRsn !== "") {
                                request.data.FR = quicksyncParserService.FolderRsn;
                            }
                            if (quicksyncParserService.processRSN_insp && quicksyncParserService.processRSN_insp !== "") {
                                request.data.PR = quicksyncParserService.processRSN_insp;
                            }
                            if (this.existingFolderRSNs && this.existingFolderRSNs !== null) {
                                request.data.EFR = this.existingFolderRSNs;
                            }
                            if (this.existingProcessRSNs && this.existingProcessRSNs !== null) {
                                request.data.EPR = this.existingProcessRSNs;
                            }
                            if (this.pastDaysCount && this.pastDaysCount !== null) {
                                request.data.PD = this.pastDaysCount;
                            }
                            if (this.futureDaysCount && this.futureDaysCount !== null) {
                                request.data.FD = this.futureDaysCount;
                            }
                            if (request.syncInfo.jspname === "_AllProcessAttachments.jsp") {
                                request.data.TBL = "";
                                var validsiteoptions = dataLayerService.getSiteOptions();
                                var checkAttachmentSource = $filter('filter')(validsiteoptions, { optionkey: "Attachment Source" }, true);
                                if (checkAttachmentSource && checkAttachmentSource.length > 0) {
                                    request.data.TBL = checkAttachmentSource[0].optionvalue;
                                }
                            }
                            if (request) {

                                requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed);
                                cfpLoadingBar.start();
                            }
                        } else {
                            sc = this;
                            this.quickrequests.splice(0, this.quickrequests.length);
                            setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                        }
                        break;
                    case "_ProcessAtm.jsp":
                    case "Paged_NewFolderInfo.jsp":
                    case "Paged_NewDeficiency.jsp":
                    case "Paged_AllProcessChecklist.jsp":
                    case "Paged_FolderProcessInfo.jsp":
                        if ((quicksyncParserService.FolderRsn && quicksyncParserService.FolderRsn !== "")
                                                    || (quicksyncParserService.processRSN_insp && quicksyncParserService.processRSN_insp !== "")
                                                    || (this.existingFolderRSNs && this.existingFolderRSNs !== null)
                                                    || (this.existingProcessRSNs && this.existingProcessRSNs !== null)) {

                            if (quicksyncParserService.FolderRsn && quicksyncParserService.FolderRsn !== "") {
                                request.data.FR = quicksyncParserService.FolderRsn;
                            }
                            if (quicksyncParserService.processRSN_insp && quicksyncParserService.processRSN_insp !== "") {
                                request.data.PR = quicksyncParserService.processRSN_insp;
                            }
                            if (this.existingFolderRSNs && this.existingFolderRSNs !== null) {
                                request.data.EFR = this.existingFolderRSNs;
                            }
                            if (this.existingProcessRSNs && this.existingProcessRSNs !== null) {
                                request.data.EPR = this.existingProcessRSNs;
                            }
                            if (this.pastDaysCount && this.pastDaysCount !== null) {
                                request.data.PD = this.pastDaysCount;
                            }
                            if (this.futureDaysCount && this.futureDaysCount !== null) {
                                request.data.FD = this.futureDaysCount;
                            }
                            // The only diffrence between this and above is making this as count request.
                            request.countRequest = true;
                            if (request) {

                                requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed);
                                cfpLoadingBar.start();
                            }
                        } else {
                            sc = this;
                            this.quickrequests.splice(0, this.quickrequests.length);
                            setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                        }
                        break;
                    case "Paged_HistoryProcessInfo.jsp":
                    case "Paged_HistoryProcessInspDetail.jsp":
                    case "Paged_HistoryProcessDeficiency.jsp":
                    case "Paged_HistoryProcessChecklist.jsp": 
                        if (quicksyncParserService.ProcessRsn && quicksyncParserService.ProcessRsn !== "") {
                            request.data.PRL = quicksyncParserService.ProcessRsn;
                            request.countRequest = true;
                            if (request) {
                                requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed);
                                cfpLoadingBar.start();
                            }
                        } else {
                            sc = this;
                            this.quickrequests.splice(0, this.quickrequests.length);
                            setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                        }
                        break;
                    case "_FolderFreeform.jsp":
                        if (quicksyncParserService.FolderRsn && quicksyncParserService.FolderRsn !== "") {
                            request.data.FR = quicksyncParserService.FolderRsn;
                            if (request) {
                                requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed);
                                cfpLoadingBar.start();
                            }
                        } else {
                            sc = this;
                            this.quickrequests.splice(0, this.quickrequests.length);
                            setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                        }
                        break;
                    default:
                        if (request) {
                            requestHelperService.ExecuteServiceRequest(request, this, this.QuickSyncSuccess, this.QuickSyncFailed);
                            cfpLoadingBar.start();
                        }

                }

            } else {
                sc = this;
                setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
            }
        },

        FullSyncSuccess: function (result) {
            var request;
            this.removeRequests(result.request);
            var syncInfo = result.request.syncInfo;
           
            if (result.request.countRequest === true) {
                var recordCount = this.getCount(result.response);

                if (recordCount > 0) {
                    var sr = 1;
                    do {
                        var ir = this.pageSize - 1;
                        if (sr + ir > recordCount) {
                            ir = recordCount - sr;
                        }
                        request = requetBuilderService.BuildFullSyncRequest(syncInfo, sr, ir);
                        sr += this.pageSize;
                        var lastRequest = sr < recordCount ? false : true;
                        $.extend(request, { async: false, lastrequest: lastRequest, syncType: result.request.syncType });

                        this.requests.push(request);
                    } while (sr < recordCount);

                    if (this.countRequests && this.countRequests.length > 0) {
                        request = this.countRequests.pop();
                        if (request) {
                            setTimeout(requestHelperService.ExecuteServiceRequest(request, this, this.FullSyncSuccess, this.FullSyncFailed), 500, this);
                        }
                    } else {
                        setTimeout(this.ExecuteRequests, 1000, this);
                    }
                }
                else {
                    this.datarequests++;
                    var synccategory = "fullsync";
                    if (this.stautscallback) {
                        this.stautscallback.call(this.fullSyncCallbackScope, "Sync in progress.Please wait..");
                    }
                    var sc = this;
                    commonParserService.updatedatabase(result.response, synccategory, sc, syncInfo["jspname"], sc.serverTimeStamp).then(function (result) {
                        sc.datarequests--;
                        if (sc.countRequests && sc.countRequests.length > 0) {
                            request = sc.countRequests.pop();
                            if (request) {
                                setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.FullSyncSuccess, sc.FullSyncFailed), 500, sc);
                            }
                        } else {
                            if (!sc.dataProcessinginprogress) {
                                setTimeout(sc.ExecuteRequests, 1000, sc);
                            }
                            else {
                                sc.datarequests--;
                            }
                        }
                        //setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                    }).catch(function (error) {
                        sc.datarequests--;
                        if (sc.countRequests && sc.countRequests.length > 0) {
                            request = sc.countRequests.pop();
                            if (request) {
                                setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.FullSyncSuccess, sc.FullSyncFailed), 500, sc);
                            }
                        } else {
                            if (!sc.dataProcessinginprogress) {
                                setTimeout(sc.ExecuteRequests, 1000, sc);
                            }
                            else {
                                sc.datarequests--;
                            }
                        }
                        //setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                    })
                }
            } else {
                this.datarequests++;
                var synccategory = "fullsync";
                if (this.stautscallback) {
                    this.stautscallback.call(this.fullSyncCallbackScope, "Sync in progress.Please wait..");
                }
                //if (syncInfo["jspname"] == "_ValidCountry.jsp") debugger;
                var sc = this;
                commonParserService.updatedatabase(result.response, synccategory, sc, syncInfo["jspname"], sc.serverTimeStamp).then(function (result) {
                    sc.datarequests--;
                    if (sc.countRequests && sc.countRequests.length > 0) {
                        request = sc.countRequests.pop();
                        if (request) {
                            setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.FullSyncSuccess, sc.FullSyncFailed), 500, sc);
                        }
                    } else {
                        if (!sc.dataProcessinginprogress) {
                            setTimeout(sc.ExecuteRequests, 1000, sc);
                        }
                        else {
                            sc.datarequests--;
                        }
                    }
                    //setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                }).catch(function (error) {
                    sc.datarequests--;
                    if (sc.countRequests && sc.countRequests.length > 0) {
                        request = sc.countRequests.pop();
                        if (request) {
                            setTimeout(requestHelperService.ExecuteServiceRequest(request, sc, sc.FullSyncSuccess, sc.FullSyncFailed), 500, sc);
                        }
                    } else {
                        if (!sc.dataProcessinginprogress) {
                            setTimeout(sc.ExecuteRequests, 1000, sc);
                        }
                        else {
                            sc.datarequests--;
                        }
                    }
                    //setTimeout(function () { sc.CheckPendingRequest(sc) }, 1000);
                });



            }
            
        },

        FullSyncFailed: function (result) {
            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to sync. Please connect to network and try again", 'error');
                cfpLoadingBar.complete();
                this.countRequests = [];
                this.datarequests = 0;
                this.requests = [];
                this.quickrequests = [];
                return;
            }
            this.removeRequests(result.request);
            if (this.countRequests && this.countRequests.length > 0) {
                var request = this.countRequests.pop();
                if (request) {
                    requestHelperService.ExecuteServiceRequest(request, this, this.FullSyncSuccess, this.FullSyncFailed);
                }
            } else {
                if (!this.dataProcessinginprogress)
                    setTimeout(this.ExecuteRequests, 1000, this);
            }
        },

        removeRequests: function (request) {
            if (this.stautscallback) {
                var message;
                if (!request.countRequest) {
                    message = String.format("{0}: {1}", request.url, request.data.SR + request.data.IR);
                } else {
                    message = request.url;
                }

                utilService.logtoConsole(message);
            }
            if (this.pendingrequests != null) {
                var id = this.pendingrequests.indexOf(request);
                if (id >= 0) {
                    this.pendingrequests.splice(id, 1);
                }
                if (this.pendingrequests.length <= 0 && this.requests.length > 0) {
                    //setTimeout(this.ExecuteRequests, 1000, this);
                }
            }
        },

        getfullsyncitems: function (callback, scope) {
            try {
                var me = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                db.transaction(function (tx) {
                    var sql = "";
                    if (me.isFreeFormRequired) {
                        sql = "SELECT * from SyncInfo where SyncType IN ('C','FF') ORDER BY exgroup, exorder;";
                    } else {
                        sql = "SELECT * from SyncInfo where SyncType ='C' ORDER BY exgroup, exorder;";
                    }
                    tx.executeSql(sql, [],
                        function (itx, result) {
                            var resultRows = [];
                            if (result.rows) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    resultRows.push(result.rows.item(i));
                                }
                            }
                            callback.call(scope, { error: null, result: resultRows });
                        },
                        function (itx, error) {
                            callback.call(scope, { error: error, result: null });
                        });
                });
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },

        getCount: function (response) {

            var lineSeperator = "Æ";//this.getLineSeperator(),
            var count = 0;
            if (response && response.length > 0) {
                var r = response.trim().replace(lineSeperator, "");
                count = Number(r);
            }
            return count != NaN ? count : 0;
        },

        updateStampDate: function (me) {
            console.info("updateStampDate called..");
            //utilService.showError("Processing data.. please wait.");
            var deferred = $q.defer();
            try {
                db = dbInitService.getdatabase();
                //syncId = syncInfo.get('id');
                if (db == null) {
                    throw new Error("error accessing database");
                }
                db.transaction(function (tx) {
                    //var sql = 'UPDATE SyncInfo SET LastSyncDate=? WHERE id=?';
                    var sql = "UPDATE SyncInfo SET LastSyncDate=? WHERE synctype = ?";
                    var date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');// make formatted date time

                    tx.executeSql(sql, [date, me.syncType],
                        function (itx, result) {
                            console.info(String.format("LastSyncDate updated to {0}", date + " and for sync type " + me.syncType));
                            deferred.resolve({ error: null, data: "success" });
                        },
                        function (itx, error) {
                            utilService.logtoConsole(error);
                            deferred.resolve({ error: error, data: null });
                        });
                });
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, data: null });
            }
            return deferred.promise;
        },

        cleanTables: function (tableNames, callback, scope) {
            try {
                if (tableNames.length <= 0) {
                    callback.call(scope, "not initial sync");
                }
                var me = this,
                    db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                db.transaction(function (tx) {
                    var tables = [];
                    for (var i = 0; i < tableNames.length; i++) {
                        tables.push(tableNames[i]);
                        var sql = String.format("DELETE FROM {0};", tableNames[i]);
                        tx.executeSql(sql, [],

                        function (iitx, result) {
                            var tbl = tables.pop();
                            //utilService.logtoConsole(String.format('{0} table cleaned for initial sync', tbl));
                            if (tables.length === 0) {
                                if (callback) {
                                    callback.call(scope, "tables cleaned");
                                }
                            }
                        },
                        function (itx, error) {
                            tables.pop();
                            utilService.logtoConsole(error);
                            if (tables.length === 0) {
                                if (callback) {
                                    callback.call(scope, "tables cleaned");
                                }
                            }
                        });
                    }
                });
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },

        initializeSequence: function (tableNames, callback, scope) {
            try {
                if (tableNames.length <= 0) {
                    callback.call(scope, "not initial sync");
                }
                var me = this,
                    db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                db.transaction(function (tx) {
                    var tables = [];
                    for (var i = 0; i < tableNames.length; i++) {
                        tables.push(tableNames[i]);
                        var sql = String.format("delete from sqlite_sequence where name='{0}'", tableNames[i]);
                        tx.executeSql(sql, [],

                        function (iitx, result) {
                            var tbl = tables.pop();
                            //console.info(String.format('{0} table sequence reset..', tbl));
                            if (tables.length === 0) {
                                if (callback) {
                                    callback.call(scope, "table sequence reset");
                                }
                            }
                        },
                        function (itx, error) {
                            tables.pop();
                            utilService.logtoConsole(error);
                            if (tables.length === 0) {
                                if (callback) {
                                    callback.call(scope, "table sequence reset");
                                }
                            }
                        });
                    }
                });
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },

        /*Upload Data To Server (Shailendra)*/
        UploadProcessPriorityToServer: function (callback, scope, statuscallback, userSetting) {
            var me = this;
            me.syncStartedAt = new Date();
            me.quickSyncCallback = callback;
            me.quickSyncCallbackScope = scope;
            me.stautscallback = statuscallback;
            me.uploadrequests = [];
            me.CreateProcessPriorityUploadRequest(me).then(function (res) {
                if (res.result === "success") {
                    me.stautscallback.call(me.quickSyncCallbackScope, "Process Priority upload request created..");
                }
                if (me.uploadrequests.length > 0) {
                    var syncinProgress = me.uploadrequests.length > 0;
                    if (syncinProgress) {
                        if (me.stautscallback) {
                            me.stautscallback.call(me.quickSyncCallbackScope, "Uploading data to server..");
                        }
                        me.pendingrequest = null;
                        if (me.uploadrequests) {
                            me.uploadrequests.reverse();
                        }

                        if (me.uploadrequests && me.uploadrequests.length > 0) {
                            var request = me.uploadrequests.pop();
                            if (request) {
                                requestHelperService.ExecuteServiceRequest(request, me, me.UploadSuccess, me.UploadFailed);
                                me.stautscallback.call(me.quickSyncCallbackScope, "Uploading records..");
                            }
                        }
                    }
                } else {
                    if (callback) {
                        callback.call(me, "uploadsuccess");
                    }
                }
            });

        },

        UploadDataToServer: function (callback, scope, statuscallback, userSetting) {
            var me = this;
            me.syncStartedAt = new Date();
            me.quickSyncCallback = callback;
            me.quickSyncCallbackScope = scope;
            me.stautscallback = statuscallback;

            me.uploadrequests = [];
            me.CreateVoilationUploadRequest(me).then(function (res) {
                if (res.result === "success") {
                    me.stautscallback.call(me.quickSyncCallbackScope, "Voilation upload request created..");
                }
                return me.CreateScheduleUploadRequest(me);
            }).then(function (res) {
                if (res.result === "success") {
                    me.stautscallback.call(me.quickSyncCallbackScope, "Schedule upload request created..");
                }
                return me.CreateUnScheduleUploadRequest(me);
            }).then(function (res) {
                if (res.result === "success") {
                    me.stautscallback.call(me.quickSyncCallbackScope, "Un-Schedule upload request created..");
                }
                return me.CreateReScheduleUploadRequest(me);
            }).then(function (res) {
                if (res.result === "success") {
                    me.stautscallback.call(me.quickSyncCallbackScope, "Re-Schedule upload request created..");
                }
                if (me.uploadrequests.length > 0) {
                    var syncinProgress = me.uploadrequests.length > 0;
                    if (syncinProgress) {
                        if (me.stautscallback) {
                            me.stautscallback.call(me.quickSyncCallbackScope, "Uploading data to server..");
                        }

                        me.pendingrequest = null;
                        if (me.uploadrequests) {
                            me.uploadrequests.reverse();
                        }

                        if (me.uploadrequests && me.uploadrequests.length > 0) {
                            var request = me.uploadrequests.pop();
                            if (request) {
                                requestHelperService.ExecuteServiceRequest(request, me, me.UploadSuccess, me.UploadFailed);
                                me.stautscallback.call(me.quickSyncCallbackScope, "Uploading records..");
                            }
                        }

                    }


                } else {
                    if (callback) {
                        callback.call(me, "uploadsuccess");
                    }
                }
            });
        },
        CreateProcessPriorityUploadRequest: function (me) {
            var deferred = $q.defer();
            try {

                var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                //var amandaeaibase = { FromSystem: "Mobile7", ToUserid: storedSettings[0].UserName, ToPassword: storedSettings[0].Password };
                var userSetting = JSON.parse(localStorage.getItem("userSettings"));
                var amandaeaibase = { ToUserid: userSetting[0].validuser, ToLid: userSetting[0].lid };
                if (storedSettings[0].isA6Compatible) {
                    amandaeaibase.FromSystem = storedSettings[0].HeartbeatName;
                    amandaeaibase.ToSystem = storedSettings[0].HeartbeatName;
                } else {
                    amandaeaibase.FromSystem = "Mobile7";
                }

                dataLayerService.getFolderProcessPriorityList().then(function (folderprocessResult) {
                    if (folderprocessResult.data && folderprocessResult.data.length > 0) {
                        for (var i = 0; i < folderprocessResult.data.length; i++) {
                            var item = folderprocessResult.data[i];
                            var scopevar = {
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            scopevar.amandaeai = $.extend({}, amandaeaibase);
                            scopevar.amandaeai.ProcessUpdate = {
                                ProcessRSN: item.processrsn,
                                FolderRSN: item.folderrsn,
                                SignoffUser: item.assigneduser,
                                ProcessComment: item.processcomment,
                                Priority: item.priority,
                                InspMinutes: item.inspminute,
                            };

                            var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");

                            var request = requetBuilderService.GetEaiPushRequest(xml);
                            if (request) {
                                request.folderId = scopevar.requestFolderId;
                                request.processId = scopevar.requestProcessId;
                                request.FolderRSN = scopevar.folderRSN;
                                request.ProcessRSN = scopevar.processRSN;
                                request.uploadrequesttype = "processpriority";
                                me.uploadrequests.push(request);
                            }
                        }
                        deferred.resolve({ error: null, result: "success" });
                    }
                    else {
                        deferred.resolve({ error: null, result: "success" });
                    }
                });
                return deferred.promise;
            } catch (e) {
                deferred.resolve({ error: e, result: null });
            }
        },
        CreateVoilationUploadRequest: function (me) {
            var typeofinspection = "violation";
            var deferred = $q.defer();
            try {

                var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                var userSetting = JSON.parse(localStorage.getItem("userSettings"));

                var amandaeaibase = { ToUserid: userSetting[0].validuser, ToLid: userSetting[0].lid };
                //var amandaeaibase = { FromSystem: "Mobile7", ToUserid: storedSettings[0].UserName, ToPassword: storedSettings[0].Password };

                if (storedSettings[0].isA6Compatible) {
                    amandaeaibase.FromSystem = storedSettings[0].HeartbeatName;
                    amandaeaibase.ToSystem = storedSettings[0].HeartbeatName;
                } else {
                    amandaeaibase.FromSystem = "Mobile7";
                }

                dataLayerService.getNewFolderProcess(typeofinspection).then(function (folderprocessResult) {
                    if (folderprocessResult.data && folderprocessResult.data.length > 0) {
                        return Promise.all(folderprocessResult.data.map(function (item) {
                            var scopevar = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn,
                                folderFreefromId: 0,
                                folderProcessFreefromId: 0,
                            };
                            var whereClauseData = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            }
                            scopevar.amandaeai = $.extend({}, amandaeaibase);

                            scopevar.amandaeai.FolderInsert = {
                                FolderType: item.foldertype,
                                SubCode: item.subcode,
                                WorkCode: item.workcode,
                                StatusCode: item.folderstatuscode,
                                FolderName: item.foldername,
                                ReferenceFile: item.referencefile,
                                FolderCentury: item.foldercentury,
                                FolderYear: item.folderyear,
                                FolderDescription: item.folderdescription,
                                FolderCondition: item.foldercondition,
                                ParentRSN: item.parentrsn,
                                PropertyRSN: item.propertyrsn
                            };

                            scopevar.amandaeai.FolderInsert.FolderProcess = {
                                ProcessCode: item.processcode,
                                SignoffUser: item.assigneduser,
                                ProcessComment: item.processcomment,
                                Priority: item.priority,
                                InspMinutes: item.inspminute,
                                CoordinationX: item.coordx,
                                CoordinationY: item.coordy,
                            };
                            return dataLayerService.getNewFolderPeopleByFolderId(whereClauseData).then(function (folderPeople) {
                                if (folderPeople.data && folderPeople.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderPeople = [];
                                    for (var j = 0; j < folderPeople.data.length; j++) {
                                        scopevar.amandaeai.FolderInsert.FolderPeople.push({
                                            PeopleRSN: folderPeople.data[j].peoplersn,
                                            PeopleCode: folderPeople.data[j].relation
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderPropertyByFolderId(whereClauseData);
                            }).then(function (folderProperty) {
                                if (folderProperty.data && folderProperty.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProperty = [];
                                    for (var n = 0; n < folderProperty.data.length; n++) {
                                        scopevar.amandaeai.FolderInsert.FolderProperty.push({
                                            PropertyRSN: folderProperty.data[n].propertyrsn
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderInfoByFolderId(whereClauseData);
                            }).then(function (folderInfo) {
                                if (folderInfo.data && folderInfo.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderInfo = [];
                                    for (var p = 0; p < folderInfo.data.length; p++) {
                                        if (folderInfo.data[p].infovalue != "" && folderInfo.data[p].infovalue != null) {
                                            scopevar.amandaeai.FolderInsert.FolderInfo.push({
                                                InfoCode: folderInfo.data[p].infocode,
                                                InfoValue: folderInfo.data[p].infovalue,
                                                DisplayOrder: folderInfo.data[p].displayorder
                                            });
                                        }
                                    }
                                }
                                return dataLayerService.getNewFolderProcessAttemptByProcessId(whereClauseData);
                            }).then(function (folderProcessAttempt) {
                                if (folderProcessAttempt.data && folderProcessAttempt.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessAttempt = {
                                        ResultCode: folderProcessAttempt.data[0].resultcode,
                                        AttemptDate: folderProcessAttempt.data[0].attemptdate,
                                        AttemptBy: folderProcessAttempt.data[0].attemptby,
                                        Overtime: folderProcessAttempt.data[0].overtime,
                                        MileageAmount: folderProcessAttempt.data[0].mileageamount,
                                        HourSpent: folderProcessAttempt.data[0].timeunit,
                                        ExpenseAmount: folderProcessAttempt.data[0].expenseamount,
                                        TimeUnit: folderProcessAttempt.data[0].unittype,
                                        AttemptComment: folderProcessAttempt.data[0].attemptcomment
                                    };
                                }
                                return dataLayerService.getNewFolderProcessChecklistByProcessId(whereClauseData);
                            }).then(function (folderProcessChecklist) {
                                if (folderProcessChecklist.data && folderProcessChecklist.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessChecklist = [];
                                    for (var l = 0; l < folderProcessChecklist.data.length; l++) {
                                        scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessChecklist.push({
                                            ChecklistCode: folderProcessChecklist.data[l].checklistcode,
                                            Passed: folderProcessChecklist.data[l].passed,
                                            NotApplicableFlag: folderProcessChecklist.data[l].notapplicableflag,
                                            EndDate: folderProcessChecklist.data[l].enddate,
                                            StartDate: folderProcessChecklist.data[l].startdate,
                                            ChecklistComment: folderProcessChecklist.data[l].checklistcomment
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderProcessAttachmentByProcessId(whereClauseData);
                            }).then(function (folderProcessAttachment) {
                                if (folderProcessAttachment.data && folderProcessAttachment.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProcess.Attachment = [];
                                    for (var m = 0; m < folderProcessAttachment.data.length; m++) {
                                        scopevar.amandaeai.FolderInsert.FolderProcess.Attachment.push({
                                            AttachmentCode: folderProcessAttachment.data[m].attchmentcode,
                                            AttachmentDetail: folderProcessAttachment.data[m].attachmentdetail,
                                            AttachmentDesc: folderProcessAttachment.data[m].attachmentdesc,
                                            DosPath: folderProcessAttachment.data[m].attachmentfilealias,
                                            //// Underscore is used to create xml attribute, left is used for attribute name and right is used for attribute value
                                            AttachmentBlob_encode_Base64: folderProcessAttachment.data[m].blob,
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderProcessDeficiencyByProcessId(whereClauseData);
                            }).then(function (folderProcessDeficiency) {
                                if (folderProcessDeficiency.data && folderProcessDeficiency.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessDeficiency = [];
                                    angular.forEach(folderProcessDeficiency.data, function (item, index) {
                                        scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessDeficiency.push({
                                            DeficiencyCode: item.deficiencycode,
                                            CategoryCode: item.categorycode,
                                            SubCategoryCode: item.subcategorycode,
                                            StatusCode: item.statuscode,
                                            SeverityCode: item.severitycode,
                                            OccuranceCount: item.occurancecount,
                                            RemedyText: item.remedytext,
                                            AssignedUser: storedSettings[0].UserName,
                                            LocationDesc: item.locationdesc,
                                            SubLocationDesc: item.sublocationdesc
                                        });
                                    });
                                }
                                return dataLayerService.getNewFolderProcessInfoByProcessId(whereClauseData);
                            }).then(function (folderProcessInfo) {
                                if (folderProcessInfo.data && folderProcessInfo.data.length > 0) {
                                    scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessInfo = [];
                                    for (var o = 0; o < folderProcessInfo.data.length; o++) {
                                        if (folderProcessInfo.data[o].infovalue != "" && folderProcessInfo.data[o].infovalue != null) {
                                            scopevar.amandaeai.FolderInsert.FolderProcess.FolderProcessInfo.push({
                                                InfoCode: folderProcessInfo.data[o].infocode,
                                                InfoValue: folderProcessInfo.data[o].infovalue,
                                                DisplayOrder: folderProcessInfo.data[o].displayorder
                                            });
                                        }
                                    }
                                }
                                return dataLayerService.getFolderFreeFormDataToUpload(whereClauseData);

                            }).then(function (folderfreeforminfo) {
                                if (folderfreeforminfo.data && folderfreeforminfo.data.length > 0) {
                                    scopevar.amandaeai.FolderFreeform = [];
                                    for (var p = 0; p < folderfreeforminfo.data.length; p++) {
                                        scopevar.amandaeai.FolderFreeform.push(
                                            {
                                                FreeformCode: folderfreeforminfo.data[p].freeformcode,
                                                FreeformRSN: folderfreeforminfo.data[p].freeformrsn <= 0 ? null : folderfreeforminfo.data[p].freeformrsn,
                                                FolderRSN: folderfreeforminfo.data[p].folderrsn,
                                                ProcessRSN: folderfreeforminfo.data[p].processrsn == "" ? null : folderfreeforminfo.data[p].processrsn,
                                                FormRow: folderfreeforminfo.data[p].formrow == "" ? null : folderfreeforminfo.data[p].formrow,
                                                Comments: folderfreeforminfo.data[p].comments
                                            });
                                        var data = me.cleannulldata(folderfreeforminfo.data[p]);
                                        for (var key in data) {
                                            if (data.hasOwnProperty(key)) {
                                                if (data[key] === undefined || data[key] === null) {
                                                    scopevar.amandaeai.FolderFreeform[p][key] = "";
                                                } else {
                                                    scopevar.amandaeai.FolderFreeform[p][key] = data[key];
                                                }
                                            }
                                        }
                                    }
                                }
                                return dataLayerService.getFolderProcessFreeFormDataToUpload(whereClauseData);

                            }).then(function (folderprocessfreeforminfo) {
                                if (folderprocessfreeforminfo.data && folderprocessfreeforminfo.data.length > 0) {
                                    scopevar.amandaeai.FolderProcessInspDetail = [];
                                    for (var q = 0; q < folderprocessfreeforminfo.data.length; q++) {
                                        scopevar.amandaeai.FolderProcessInspDetail.push(
                                            {
                                                FreeformCode: folderprocessfreeforminfo.data[q].freeformcode,
                                                InspDetailRSN: folderprocessfreeforminfo.data[q].inspdetailrsn <= 0 ? null : folderprocessfreeforminfo.data[q].inspdetailrsn,
                                                FolderRSN: folderprocessfreeforminfo.data[q].folderrsn,
                                                ProcessRSN: folderprocessfreeforminfo.data[q].processrsn == "" ? null : folderprocessfreeforminfo.data[q].processrsn,
                                                Comments: folderprocessfreeforminfo.data[q].comments
                                            });
                                        var data = me.cleannulldata(folderprocessfreeforminfo.data[q]);
                                        for (var key in data) {
                                            if (data.hasOwnProperty(key)) {
                                                if (data[key] === undefined || data[key] === null) {
                                                    scopevar.amandaeai.FolderProcessInspDetail[q][key] = "";
                                                } else {
                                                    scopevar.amandaeai.FolderProcessInspDetail[q][key] = data[key];
                                                }
                                            }
                                        }
                                    }
                                }
                                var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                var dateformat = CommonService.getDateFormat();
                                var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                return dataLayerService.insertUpdateEaiHistory(eaihistoryobj);

                            }).then(function (eairequestinsertresult) {
                                var insertedid = 0;
                                if (eairequestinsertresult && eairequestinsertresult.data) {
                                    console.log("Data inserted into eaihistory successfully..");
                                    insertedid = eairequestinsertresult.data;

                                }
                                var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                var request = requetBuilderService.GetEaiPushRequest(xml);
                                if (request) {
                                    request.eaiId = insertedid;
                                    request.folderId = scopevar.requestFolderId;
                                    request.processId = scopevar.requestProcessId;
                                    request.FolderRSN = scopevar.folderRSN;
                                    request.ProcessRSN = scopevar.processRSN;
                                    request.uploadrequesttype = scopevar.typeofinspection;
                                    me.uploadrequests.push(request);
                                }
                                return { error: null, result: "success" };

                            });
                        })).then(function (allInnerRequestDone) {
                            deferred.resolve({ error: null, result: "success" });
                        }).catch(function (anyInnserRequestFail) {
                            deferred.resolve({ error: anyInnserRequestFail, result: null });
                        });
                    }
                    else {
                        deferred.resolve({ error: null, result: "success" });
                    }

                });
                return deferred.promise;
            } catch (e) {
                deferred.resolve({ error: e, result: null });
            }

        },

        CreateScheduleUploadRequest: function (me) {
            var typeofinspection = "scheduled";
            var deferred = $q.defer();
            try {

                var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                //var amandaeaibase = { FromSystem: "Mobile7", ToUserid: storedSettings[0].UserName, ToPassword: storedSettings[0].Password };
                var userSetting = JSON.parse(localStorage.getItem("userSettings"));
                var amandaeaibase = { ToUserid: userSetting[0].validuser, ToLid: userSetting[0].lid };
                if (storedSettings[0].isA6Compatible) {
                    amandaeaibase.FromSystem = storedSettings[0].HeartbeatName;
                    amandaeaibase.ToSystem = storedSettings[0].HeartbeatName;
                } else {
                    amandaeaibase.FromSystem = "Mobile7";
                }

                dataLayerService.getNewFolderProcess(typeofinspection).then(function (folderprocessResult) {
                    if (folderprocessResult.data && folderprocessResult.data.length > 0) {
                        return Promise.all(folderprocessResult.data.map(function (item) {
                            var scopevar = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            var whereClauseData = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            scopevar.amandaeai = $.extend({}, amandaeaibase);

                            scopevar.amandaeai.FolderUpdate = {
                                FolderRSN: item.folderrsn
                            };
                            scopevar.amandaeai.ProcessUpdate = {
                                ProcessRSN: item.processrsn,
                                FolderRSN: item.folderrsn,
                                SignoffUser: item.assigneduser,
                                ProcessComment: item.processcomment,
                                Priority: item.priority,
                                InspMinutes: item.inspminute,
                                CoordinationX: item.coordx,
                                CoordinationY: item.coordy
                            };

                            return dataLayerService.getNewFolderInfoByFolderId(whereClauseData).then(function (folderInfo) {
                                if (folderInfo.data && folderInfo.data.length > 0) {
                                    scopevar.amandaeai.FolderUpdate.FolderInfo = [];
                                    for (var p = 0; p < folderInfo.data.length; p++) {
                                        if (folderInfo.data[p].infovalue != "" && folderInfo.data[p].infovalue != null) {
                                            scopevar.amandaeai.FolderUpdate.FolderInfo.push({
                                                InfoCode: folderInfo.data[p].infocode,
                                                InfoValue: folderInfo.data[p].infovalue,
                                                DisplayOrder: folderInfo.data[p].displayorder
                                            });
                                        }
                                    }
                                }
                                return dataLayerService.getNewFolderProcessAttemptByProcessId(whereClauseData);
                            }).then(function (folderProcessAttempt) {
                                if (folderProcessAttempt.data && folderProcessAttempt.data.length > 0) {
                                    scopevar.amandaeai.ProcessUpdate.FolderProcessAttempt = {
                                        ResultCode: folderProcessAttempt.data[0].resultcode,
                                        AttemptDate: folderProcessAttempt.data[0].attemptdate,
                                        AttemptBy: folderProcessAttempt.data[0].attemptby,
                                        Overtime: folderProcessAttempt.data[0].overtime,
                                        MileageAmount: folderProcessAttempt.data[0].mileageamount,
                                        HourSpent: folderProcessAttempt.data[0].timeunit,
                                        ExpenseAmount: folderProcessAttempt.data[0].expenseamount,
                                        TimeUnit: folderProcessAttempt.data[0].unittype,
                                        AttemptComment: folderProcessAttempt.data[0].attemptcomment
                                    };
                                }
                                return dataLayerService.getNewFolderProcessChecklistByProcessId(whereClauseData);
                            }).then(function (folderProcessChecklist) {
                                if (folderProcessChecklist.data && folderProcessChecklist.data.length > 0) {
                                    scopevar.amandaeai.ProcessUpdate.FolderProcessChecklist = [];
                                    for (var l = 0; l < folderProcessChecklist.data.length; l++) {
                                        scopevar.amandaeai.ProcessUpdate.FolderProcessChecklist.push({
                                            ChecklistCode: folderProcessChecklist.data[l].checklistcode,
                                            Passed: folderProcessChecklist.data[l].passed,
                                            NotApplicableFlag: folderProcessChecklist.data[l].notapplicableflag,
                                            EndDate: folderProcessChecklist.data[l].enddate,
                                            StartDate: folderProcessChecklist.data[l].startdate,
                                            ChecklistComment: folderProcessChecklist.data[l].checklistcomment
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderProcessAttachmentByProcessId(whereClauseData);
                            }).then(function (folderProcessAttachment) {
                                if (folderProcessAttachment.data && folderProcessAttachment.data.length > 0) {
                                    scopevar.amandaeai.ProcessUpdate.Attachment = [];
                                    for (var m = 0; m < folderProcessAttachment.data.length; m++) {
                                        scopevar.amandaeai.ProcessUpdate.Attachment.push({
                                            AttachmentCode: folderProcessAttachment.data[m].attchmentcode,
                                            AttachmentDetail: folderProcessAttachment.data[m].attachmentdetail,
                                            AttachmentDesc: folderProcessAttachment.data[m].attachmentdesc,
                                            DosPath: folderProcessAttachment.data[m].attachmentfilealias,
                                            //// Underscore is used to create xml attribute, left is used for attribute name and right is used for attribute value
                                            AttachmentBlob_encode_Base64: folderProcessAttachment.data[m].blob,
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderProcessDeficiencyByProcessId(whereClauseData);
                            }).then(function (folderProcessDeficiency) {
                                if (folderProcessDeficiency.data && folderProcessDeficiency.data.length > 0) {
                                    scopevar.amandaeai.ProcessUpdate.FolderProcessDeficiency = [];
                                    for (var n = 0; n < folderProcessDeficiency.data.length; n++) {
                                        scopevar.amandaeai.ProcessUpdate.FolderProcessDeficiency.push({
                                            DeficiencyCode: folderProcessDeficiency.data[n].deficiencycode,
                                            CategoryCode: folderProcessDeficiency.data[n].categorycode,
                                            SubCategoryCode: folderProcessDeficiency.data[n].subcategorycode,
                                            StatusCode: folderProcessDeficiency.data[n].statuscode,
                                            SeverityCode: folderProcessDeficiency.data[n].severitycode,
                                            OccuranceCount: folderProcessDeficiency.data[n].occurancecount,
                                            RemedyText: folderProcessDeficiency.data[n].remedytext,
                                            AssignedUser: storedSettings[0].UserName,
                                            DeficiencyText: folderProcessDeficiency.data[n].deficiencytext,
                                            LocationDesc: folderProcessDeficiency.data[n].locationdesc,
                                            SubLocationDesc: folderProcessDeficiency.data[n].sublocationdesc
                                        });
                                    }
                                }
                                return dataLayerService.getNewFolderProcessInfoByProcessId(whereClauseData);
                            }).then(function (folderProcessInfo) {
                                if (folderProcessInfo.data && folderProcessInfo.data.length > 0) {
                                    scopevar.amandaeai.ProcessUpdate.FolderProcessInfo = [];
                                    for (var o = 0; o < folderProcessInfo.data.length; o++) {
                                        if (folderProcessInfo.data[o].infovalue != "" && folderProcessInfo.data[o].infovalue != null) {
                                            scopevar.amandaeai.ProcessUpdate.FolderProcessInfo.push({
                                                InfoCode: folderProcessInfo.data[o].infocode,
                                                InfoValue: folderProcessInfo.data[o].infovalue,
                                                DisplayOrder: folderProcessInfo.data[o].displayorder
                                            });
                                        }
                                    }
                                }
                                return dataLayerService.getFolderFreeFormDataToUpload(whereClauseData);

                            }).then(function (folderfreeforminfo) {
                                if (folderfreeforminfo.data && folderfreeforminfo.data.length > 0) {
                                    scopevar.amandaeai.FolderFreeform = [];
                                    for (var p = 0; p < folderfreeforminfo.data.length; p++) {
                                        scopevar.amandaeai.FolderFreeform.push(
                                            {
                                                FreeformCode: folderfreeforminfo.data[p].freeformcode,
                                                FreeformRSN: folderfreeforminfo.data[p].freeformrsn <= 0 ? null : folderfreeforminfo.data[p].freeformrsn,
                                                FolderRSN: folderfreeforminfo.data[p].folderrsn,
                                                ProcessRSN: folderfreeforminfo.data[p].processrsn == "" ? null : folderfreeforminfo.data[p].processrsn,
                                                FormRow: folderfreeforminfo.data[p].formrow == "" ? null : folderfreeforminfo.data[p].formrow,
                                                Comments: folderfreeforminfo.data[p].comments
                                            });
                                        var data = me.cleannulldata(folderfreeforminfo.data[p]);
                                        for (var key in data) {
                                            if (data.hasOwnProperty(key)) {
                                                if (data[key] === undefined || data[key] === null) {
                                                    scopevar.amandaeai.FolderFreeform[p][key] = "";
                                                } else {
                                                    scopevar.amandaeai.FolderFreeform[p][key] = data[key];
                                                }
                                            }
                                        }
                                    }
                                }
                                return dataLayerService.getFolderProcessFreeFormDataToUpload(whereClauseData);

                            }).then(function (folderprocessfreeforminfo) {
                                if (folderprocessfreeforminfo.data && folderprocessfreeforminfo.data.length > 0) {
                                    scopevar.amandaeai.FolderProcessInspDetail = [];
                                    for (var q = 0; q < folderprocessfreeforminfo.data.length; q++) {
                                        scopevar.amandaeai.FolderProcessInspDetail.push(
                                            {
                                                FreeformCode: folderprocessfreeforminfo.data[q].freeformcode,
                                                InspDetailRSN: folderprocessfreeforminfo.data[q].inspdetailrsn <= 0 ? null : folderprocessfreeforminfo.data[q].inspdetailrsn,
                                                FolderRSN: folderprocessfreeforminfo.data[q].folderrsn,
                                                ProcessRSN: folderprocessfreeforminfo.data[q].processrsn == "" ? null : folderprocessfreeforminfo.data[q].processrsn,
                                                Comments: folderprocessfreeforminfo.data[q].comments
                                            });
                                        var data = me.cleannulldata(folderprocessfreeforminfo.data[q]);
                                        for (var key in data) {
                                            if (data.hasOwnProperty(key)) {
                                                if (data[key] === undefined || data[key] === null) {
                                                    scopevar.amandaeai.FolderProcessInspDetail[q][key] = "";
                                                } else {
                                                    scopevar.amandaeai.FolderProcessInspDetail[q][key] = data[key];
                                                }
                                            }
                                        }
                                    }
                                }
                                var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                var dateformat = CommonService.getDateFormat();
                                var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                return dataLayerService.insertUpdateEaiHistory(eaihistoryobj);

                            }).then(function (eairequestinsertresult) {
                                var insertedid = 0;
                                if (eairequestinsertresult && eairequestinsertresult.data) {
                                    console.log("Data inserted into eaihistory successfully..");
                                    insertedid = eairequestinsertresult.data;

                                }
                                var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                var request = requetBuilderService.GetEaiPushRequest(xml);
                                if (request) {
                                    request.eaiId = insertedid;
                                    request.folderId = scopevar.requestFolderId;
                                    request.processId = scopevar.requestProcessId;
                                    request.FolderRSN = scopevar.folderRSN;
                                    request.ProcessRSN = scopevar.processRSN;
                                    request.uploadrequesttype = scopevar.typeofinspection;
                                    me.uploadrequests.push(request);
                                }
                                return { error: null, result: "success" };





                            })

                        })).then(function (allInnerRequestDone) {
                            deferred.resolve({ error: null, result: "success" });
                        }).catch(function (anyInnserRequestFail) {
                            deferred.resolve({ error: anyInnserRequestFail, result: null });
                        });
                    }
                    else {
                        deferred.resolve({ error: null, result: "success" });
                    }
                });
                return deferred.promise;
            } catch (e) {
                deferred.resolve({ error: e, result: null });
            }

        },
        cleannulldata: function (obj) {
            for (var propName in obj) {
                if (obj[propName] === null || obj[propName] === undefined) {
                    delete obj[propName];
                }
            }
            return obj;
        },

        CreateUnScheduleUploadRequest: function (me) {
            var typeofinspection = "unscheduled";
            var checkformobilesetting = "Not always insert";
            var deferred = $q.defer();

            try {

                var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                //var amandaeaibase = { FromSystem: "Mobile7", ToUserid: storedSettings[0].UserName, ToPassword: storedSettings[0].Password };

                var userSetting = JSON.parse(localStorage.getItem("userSettings"));
                var amandaeaibase = { ToUserid: userSetting[0].validuser, ToLid: userSetting[0].lid };
                if (storedSettings[0].isA6Compatible) {
                    amandaeaibase.FromSystem = storedSettings[0].HeartbeatName;
                    amandaeaibase.ToSystem = storedSettings[0].HeartbeatName;
                } else {
                    amandaeaibase.FromSystem = "Mobile7";
                }


                dataLayerService.getNewFolderProcess(typeofinspection).then(function (folderprocessResult) {
                    if (folderprocessResult.data && folderprocessResult.data.length > 0) {
                        return Promise.all(folderprocessResult.data.map(function (item) {
                            var scopevar = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            var whereClauseData = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            scopevar.amandaeai = $.extend({}, amandaeaibase);

                            scopevar.amandaeai.FolderUpdate = {
                                FolderRSN: item.folderrsn
                            };
                            if (checkformobilesetting === "Not always insert") {
                                scopevar.amandaeai.FolderProcess = {
                                    ProcessCode: item.processcode,
                                    FolderRSN: item.folderrsn,
                                    SignoffUser: item.assigneduser,
                                    Priority: item.priority,
                                    ProcessComment: item.processcomment,
                                    InspMinutes: item.inspminute,
                                    CoordinationX: item.coordx,
                                    CoordinationY: item.coordy
                                };

                                return dataLayerService.getNewFolderInfoByFolderId(whereClauseData).then(function (folderInfo) {
                                    if (folderInfo.data && folderInfo.data.length > 0) {
                                        scopevar.amandaeai.FolderUpdate.FolderInfo = [];
                                        for (var p = 0; p < folderInfo.data.length; p++) {
                                            if (folderInfo.data[p].infovalue != "" && folderInfo.data[p].infovalue != null) {
                                                scopevar.amandaeai.FolderUpdate.FolderInfo.push({
                                                    InfoCode: folderInfo.data[p].infocode,
                                                    InfoValue: folderInfo.data[p].infovalue,
                                                    DisplayOrder: folderInfo.data[p].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessAttemptByProcessId(whereClauseData);
                                }).then(function (folderProcessAttempt) {
                                    if (folderProcessAttempt.data && folderProcessAttempt.data.length > 0) {
                                        scopevar.amandaeai.FolderProcess.FolderProcessAttempt = {
                                            ResultCode: folderProcessAttempt.data[0].resultcode,
                                            AttemptDate: folderProcessAttempt.data[0].attemptdate,
                                            AttemptBy: folderProcessAttempt.data[0].attemptby,
                                            Overtime: folderProcessAttempt.data[0].overtime,
                                            MileageAmount: folderProcessAttempt.data[0].mileageamount,
                                            HourSpent: folderProcessAttempt.data[0].timeunit,
                                            ExpenseAmount: folderProcessAttempt.data[0].expenseamount,
                                            TimeUnit: folderProcessAttempt.data[0].unittype,
                                            AttemptComment: folderProcessAttempt.data[0].attemptcomment
                                        };
                                    }
                                    return dataLayerService.getNewFolderProcessChecklistByProcessId(whereClauseData);
                                }).then(function (folderProcessChecklist) {
                                    if (folderProcessChecklist.data && folderProcessChecklist.data.length > 0) {
                                        scopevar.amandaeai.FolderProcess.FolderProcessChecklist = [];
                                        for (var l = 0; l < folderProcessChecklist.data.length; l++) {
                                            scopevar.amandaeai.FolderProcess.FolderProcessChecklist.push({
                                                ChecklistCode: folderProcessChecklist.data[l].checklistcode,
                                                Passed: folderProcessChecklist.data[l].passed,
                                                NotApplicableFlag: folderProcessChecklist.data[l].notapplicableflag,
                                                EndDate: folderProcessChecklist.data[l].enddate,
                                                StartDate: folderProcessChecklist.data[l].startdate,
                                                ChecklistComment: folderProcessChecklist.data[l].checklistcomment
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessAttachmentByProcessId(whereClauseData);
                                }).then(function () {
                                    if (folderProcessAttachment.data && folderProcessAttachment.data.length > 0) {
                                        scopevar.amandaeai.FolderProcess.Attachment = [];
                                        for (var m = 0; m < folderProcessAttachment.data.length; m++) {
                                            scopevar.amandaeai.FolderProcess.Attachment.push({
                                                AttachmentCode: folderProcessAttachment.data[m].attchmentcode,
                                                AttachmentDetail: folderProcessAttachment.data[m].attachmentdetail,
                                                AttachmentDesc: folderProcessAttachment.data[m].attachmentdesc,
                                                DosPath: folderProcessAttachment.data[m].attachmentfilealias,
                                                //// Underscore is used to create xml attribute, left is used for attribute name and right is used for attribute value
                                                AttachmentBlob_encode_Base64: folderProcessAttachment.data[m].blob,
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessDeficiencyByProcessId(whereClauseData);
                                }).then(function (folderProcessDeficiency) {
                                    if (folderProcessDeficiency.data && folderProcessDeficiency.data.length > 0) {
                                        scopevar.amandaeai.FolderProcess.FolderProcessDeficiency = [];
                                        for (var n = 0; n < folderProcessDeficiency.data.length; n++) {
                                            scopevar.amandaeai.FolderProcess.FolderProcessDeficiency.push({
                                                DeficiencyCode: folderProcessDeficiency.data[n].deficiencycode,
                                                CategoryCode: folderProcessDeficiency.data[n].categorycode,
                                                SubCategoryCode: folderProcessDeficiency.data[n].subcategorycode,
                                                StatusCode: folderProcessDeficiency.data[n].statuscode,
                                                SeverityCode: folderProcessDeficiency.data[n].severitycode,
                                                OccuranceCount: folderProcessDeficiency.data[n].occurancecount,
                                                RemedyText: folderProcessDeficiency.data[n].remedytext,
                                                AssignedUser: storedSettings[0].UserName,
                                                DeficiencyText: folderProcessDeficiency.data[n].deficiencytext,
                                                LocationDesc: folderProcessDeficiency.data[n].locationdesc,
                                                SubLocationDesc: folderProcessDeficiency.data[n].sublocationdesc
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessInfoByProcessId(whereClauseData);
                                }).then(function () {
                                    if (folderProcessInfo.data && folderProcessInfo.data.length > 0) {
                                        scopevar.amandaeai.FolderProcess.FolderProcessInfo = [];
                                        for (var o = 0; o < folderProcessInfo.data.length; o++) {
                                            if (folderProcessInfo.data[o].infovalue != "" && folderProcessInfo.data[o].infovalue != null) {
                                                scopevar.amandaeai.FolderProcess.FolderProcessInfo.push({
                                                    InfoCode: folderProcessInfo.data[o].infocode,
                                                    InfoValue: folderProcessInfo.data[o].infovalue,
                                                    DisplayOrder: folderProcessInfo.data[o].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderfreeforminfo) {
                                    if (folderfreeforminfo.data && folderfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderFreeform = [];
                                        for (var p = 0; p < folderfreeforminfo.data.length; p++) {
                                            scopevar.amandaeai.FolderFreeform.push(
                                                {
                                                    FreeformCode: folderfreeforminfo.data[p].freeformcode,
                                                    FreeformRSN: folderfreeforminfo.data[p].freeformrsn <= 0 ? null : folderfreeforminfo.data[p].freeformrsn,
                                                    FolderRSN: folderfreeforminfo.data[p].folderrsn,
                                                    ProcessRSN: folderfreeforminfo.data[p].processrsn == "" ? null : folderfreeforminfo.data[p].processrsn,
                                                    FormRow: folderfreeforminfo.data[p].formrow == "" ? null : folderfreeforminfo.data[p].formrow,
                                                    Comments: folderfreeforminfo.data[p].comments
                                                });
                                            var data = me.cleannulldata(folderfreeforminfo.data[p]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = data[key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderProcessFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderprocessfreeforminfo) {
                                    if (folderprocessfreeforminfo.data && folderprocessfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderProcessInspDetail = [];
                                        for (var q = 0; q < folderprocessfreeforminfo.data.length; q++) {
                                            scopevar.amandaeai.FolderProcessInspDetail.push(
                                                {
                                                    FreeformCode: folderprocessfreeforminfo.data[q].freeformcode,
                                                    InspDetailRSN: folderprocessfreeforminfo.data[q].inspdetailrsn <= 0 ? null : folderprocessfreeforminfo.data[q].inspdetailrsn,
                                                    FolderRSN: folderprocessfreeforminfo.data[q].folderrsn,
                                                    ProcessRSN: folderprocessfreeforminfo.data[q].processrsn == "" ? null : folderprocessfreeforminfo.data[q].processrsn,
                                                    Comments: folderprocessfreeforminfo.data[q].comments
                                                });
                                            var data = me.cleannulldata(folderprocessfreeforminfo.data[q]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = data[key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var dateformat = CommonService.getDateFormat();
                                    var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                    return dataLayerService.insertUpdateEaiHistory(eaihistoryobj);

                                }).then(function (eairequestinsertresult) {
                                    var insertedid = 0;
                                    if (eairequestinsertresult && eairequestinsertresult.data) {
                                        console.log("Data inserted into eaihistory successfully..");
                                        insertedid = eairequestinsertresult.data;

                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var request = requetBuilderService.GetEaiPushRequest(xml);
                                    if (request) {
                                        request.eaiId = insertedid;
                                        request.folderId = scopevar.requestFolderId;
                                        request.processId = scopevar.requestProcessId;
                                        request.FolderRSN = scopevar.folderRSN;
                                        request.ProcessRSN = scopevar.processRSN;
                                        request.uploadrequesttype = scopevar.typeofinspection;
                                        me.uploadrequests.push(request);
                                    }
                                    return { error: null, result: "success" };
                                })

                            }
                            if (checkformobilesetting === "always insert") {
                                scopevar.amandaeai.ProcessInsert = {
                                    ProcessCode: item.processcode,
                                    FolderRSN: item.folderrsn,
                                    SignoffUser: item.assigneduser,
                                    ProcessComment: item.processcomment,
                                    Priority: item.priority,
                                    InspMinutes: item.inspminute,
                                    CoordinationX: item.coordx,
                                    CoordinationY: item.coordy
                                };

                                return dataLayerService.getNewFolderInfoByFolderId(whereClauseData).then(function (folderInfo) {
                                    if (folderInfo.data && folderInfo.data.length > 0) {
                                        scopevar.amandaeai.FolderUpdate.FolderInfo = [];
                                        for (var p = 0; p < folderInfo.data.length; p++) {
                                            if (folderInfo.data[p].infovalue != "" && folderInfo.data[p].infovalue != null) {
                                                scopevar.amandaeai.FolderUpdate.FolderInfo.push({
                                                    InfoCode: folderInfo.data[p].infocode,
                                                    InfoValue: folderInfo.data[p].infovalue,
                                                    DisplayOrder: folderInfo.data[p].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessAttemptByProcessId(whereClauseData);
                                }).then(function (folderProcessAttempt) {
                                    if (folderProcessAttempt.data && folderProcessAttempt.data.length > 0) {
                                        scopevar.amandaeai.ProcessInsert.FolderProcessAttempt = {
                                            ResultCode: folderProcessAttempt.data[0].resultcode,
                                            AttemptDate: folderProcessAttempt.data[0].attemptdate,
                                            AttemptBy: folderProcessAttempt.data[0].attemptby,
                                            Overtime: folderProcessAttempt.data[0].overtime,
                                            MileageAmount: folderProcessAttempt.data[0].mileageamount,
                                            HourSpent: folderProcessAttempt.data[0].timeunit,
                                            ExpenseAmount: folderProcessAttempt.data[0].expenseamount,
                                            TimeUnit: folderProcessAttempt.data[0].unittype,
                                            AttemptComment: folderProcessAttempt.data[0].attemptcomment
                                        };
                                    }
                                    return dataLayerService.getNewFolderProcessChecklistByProcessId(whereClauseData);
                                }).then(function (folderProcessChecklist) {
                                    if (folderProcessChecklist.data && folderProcessChecklist.data.length > 0) {
                                        scopevar.amandaeai.ProcessInsert.FolderProcessChecklist = [];
                                        for (var l = 0; l < folderProcessChecklist.data.length; l++) {
                                            scopevar.amandaeai.ProcessInsert.FolderProcessChecklist.push({
                                                ChecklistCode: folderProcessChecklist.data[l].checklistcode,
                                                Passed: folderProcessChecklist.data[l].passed,
                                                NotApplicableFlag: folderProcessChecklist.data[l].notapplicableflag,
                                                EndDate: folderProcessChecklist.data[l].enddate,
                                                StartDate: folderProcessChecklist.data[l].startdate,
                                                ChecklistComment: folderProcessChecklist.data[l].checklistcomment
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessAttachmentByProcessId(whereClauseData);
                                }).then(function () {
                                    if (folderProcessAttachment.data && folderProcessAttachment.data.length > 0) {
                                        scopevar.amandaeai.ProcessInsert.Attachment = [];
                                        for (var m = 0; m < folderProcessAttachment.data.length; m++) {
                                            scopevar.amandaeai.ProcessInsert.Attachment.push({
                                                AttachmentCode: folderProcessAttachment.data[m].attchmentcode,
                                                AttachmentDetail: folderProcessAttachment.data[m].attachmentdetail,
                                                AttachmentDesc: folderProcessAttachment.data[m].attachmentdesc,
                                                DosPath: folderProcessAttachment.data[m].attachmentfilealias,
                                                //// Underscore is used to create xml attribute, left is used for attribute name and right is used for attribute value
                                                AttachmentBlob_encode_Base64: folderProcessAttachment.data[m].blob,
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessDeficiencyByProcessId(whereClauseData);
                                }).then(function (folderProcessDeficiency) {
                                    if (folderProcessDeficiency.data && folderProcessDeficiency.data.length > 0) {
                                        scopevar.amandaeai.ProcessInsert.FolderProcessDeficiency = [];
                                        for (var n = 0; n < folderProcessDeficiency.data.length; n++) {
                                            scopevar.amandaeai.ProcessInsert.FolderProcessDeficiency.push({
                                                DeficiencyCode: folderProcessDeficiency.data[n].deficiencycode,
                                                CategoryCode: folderProcessDeficiency.data[n].categorycode,
                                                SubCategoryCode: folderProcessDeficiency.data[n].subcategorycode,
                                                StatusCode: folderProcessDeficiency.data[n].statuscode,
                                                SeverityCode: folderProcessDeficiency.data[n].severitycode,
                                                OccuranceCount: folderProcessDeficiency.data[n].occurancecount,
                                                RemedyText: folderProcessDeficiency.data[n].remedytext,
                                                AssignedUser: storedSettings[0].UserName,
                                                DeficiencyText: folderProcessDeficiency.data[n].deficiencytext,
                                                LocationDesc: folderProcessDeficiency.data[n].locationdesc,
                                                SubLocationDesc: folderProcessDeficiency.data[n].sublocationdesc
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessInfoByProcessId(whereClauseData);
                                }).then(function (folderProcessInfo) {
                                    if (folderProcessInfo.data && folderProcessInfo.data.length > 0) {
                                        scopevar.amandaeai.ProcessInsert.FolderProcessInfo = [];
                                        for (var o = 0; o < folderProcessInfo.data.length; o++) {
                                            if (folderProcessInfo.data[o].infovalue != "" && folderProcessInfo.data[o].infovalue != null) {
                                                scopevar.amandaeai.ProcessInsert.FolderProcessInfo.push({
                                                    InfoCode: folderProcessInfo.data[o].infocode,
                                                    InfoValue: folderProcessInfo.data[o].infovalue,
                                                    DisplayOrder: folderProcessInfo.data[o].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderfreeforminfo) {
                                    if (folderfreeforminfo.data && folderfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderFreeform = [];
                                        for (var p = 0; p < folderfreeforminfo.data.length; p++) {
                                            scopevar.amandaeai.FolderFreeform.push(
                                                {
                                                    FreeformCode: folderfreeforminfo.data[p].freeformcode,
                                                    FreeformRSN: folderfreeforminfo.data[p].freeformrsn <= 0 ? null : folderfreeforminfo.data[p].freeformrsn,
                                                    FolderRSN: folderfreeforminfo.data[p].folderrsn,
                                                    ProcessRSN: folderfreeforminfo.data[p].processrsn == "" ? null : folderfreeforminfo.data[p].processrsn,
                                                    FormRow: folderfreeforminfo.data[p].formrow == "" ? null : folderfreeforminfo.data[p].formrow,
                                                    Comments: folderfreeforminfo.data[p].comments
                                                });
                                            var data = me.cleannulldata(folderfreeforminfo.data[p]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = data[key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderProcessFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderprocessfreeforminfo) {
                                    if (folderprocessfreeforminfo.data && folderprocessfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderProcessInspDetail = [];
                                        for (var q = 0; q < folderprocessfreeforminfo.data.length; q++) {
                                            scopevar.amandaeai.FolderProcessInspDetail.push(
                                                {
                                                    FreeformCode: folderprocessfreeforminfo.data[q].freeformcode,
                                                    InspDetailRSN: folderprocessfreeforminfo.data[q].inspdetailrsn <= 0 ? null : folderprocessfreeforminfo.data[q].inspdetailrsn,
                                                    FolderRSN: folderprocessfreeforminfo.data[q].folderrsn,
                                                    ProcessRSN: folderprocessfreeforminfo.data[q].processrsn == "" ? null : folderprocessfreeforminfo.data[q].processrsn,
                                                    Comments: folderprocessfreeforminfo.data[q].comments
                                                });
                                            var data = me.cleannulldata(folderprocessfreeforminfo.data[q]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = data[key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var dateformat = CommonService.getDateFormat();
                                    var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                    return dataLayerService.insertUpdateEaiHistory(eaihistoryobj);

                                }).then(function (eairequestinsertresult) {
                                    var insertedid = 0;
                                    if (eairequestinsertresult && eairequestinsertresult.data) {
                                        console.log("Data inserted into eaihistory successfully..");
                                        insertedid = eairequestinsertresult.data;

                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var request = requetBuilderService.GetEaiPushRequest(xml);
                                    if (request) {
                                        request.eaiId = insertedid;
                                        request.folderId = scopevar.requestFolderId;
                                        request.processId = scopevar.requestProcessId;
                                        request.FolderRSN = scopevar.folderRSN;
                                        request.ProcessRSN = scopevar.processRSN;
                                        request.uploadrequesttype = scopevar.typeofinspection;
                                        me.uploadrequests.push(request);
                                    }
                                    return { error: null, result: "success" };





                                })
                            }
                        })).then(function (allInnerRequestDone) {
                            deferred.resolve({ error: null, result: "success" });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, result: null });
                        });
                    }
                    else {
                        deferred.resolve({ error: null, result: "success" });
                    }
                });
                return deferred.promise;
            } catch (e) {
                deferred.resolve({ error: e, result: null });
            }
        },

        CreateReScheduleUploadRequest: function (me) {
            var typeofinspection = "rescheduled";
            var deferred = $q.defer();

            try {

                var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                //var amandaeaibase = { FromSystem: "Mobile7", ToUserid: storedSettings[0].UserName, ToPassword: storedSettings[0].Password };

                var userSetting = JSON.parse(localStorage.getItem("userSettings"));
                var amandaeaibase = { ToUserid: userSetting[0].validuser, ToLid: userSetting[0].lid };
                if (storedSettings[0].isA6Compatible) {
                    amandaeaibase.FromSystem = storedSettings[0].HeartbeatName;
                    amandaeaibase.ToSystem = storedSettings[0].HeartbeatName;
                } else {
                    amandaeaibase.FromSystem = "Mobile7";
                }


                dataLayerService.getNewFolderProcess(typeofinspection).then(function (folderprocessResult) {
                    if (folderprocessResult.data && folderprocessResult.data.length > 0) {

                        return Promise.all(folderprocessResult.data.map(function (item) {
                            var scopevar = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            var whereClauseData = {
                                typeofinspection: typeofinspection,
                                requestFolderId: item.folderid,
                                requestProcessId: item.processid,
                                folderId: item.folderid,
                                folderRSN: item.folderrsn,
                                processId: item.processid,
                                processRSN: item.processrsn
                            };
                            scopevar.amandaeai = $.extend({}, amandaeaibase);
                            scopevar.amandaeai.ProcessUpdate = {
                                ProcessRSN: item.processrsn,
                                FolderRSN: item.folderrsn,
                                SignoffUser: item.assigneduser,
                                ProcessComment: item.processcomment,
                                ScheduleDate: item.scheduledate,
                                ScheduleEndDate: item.scheduleenddate,
                            };

                            if (item.reassigneduser !== "" && item.reassigneduser !== null) {
                                scopevar.amandaeai.ProcessUpdate.AssignedUser = item.reassigneduser;
                            }

                            scopevar.amandaeai.ProcessUpdate.FolderProcessAttempt = {
                                ResultCode: item.resultcode,
                                AttemptDate: item.attemptdate,
                                AttemptBy: item.attemptby,
                                Overtime: item.overtime,
                                MileageAmount: item.mileageamount,
                                HourSpent: item.timeunit,
                                ExpenseAmount: item.expenseamount,
                                TimeUnit: item.unittype,
                                AttemptComment: item.attemptcomment
                            };


                            if (item.resultcode != null && item.resultcode !== ""
                                && item.attemptby != null && item.attemptby !== ""
                                && item.attemptdate != null && item.attemptdate !== "") {
                                scopevar.amandaeai.FolderUpdate = {
                                    FolderRSN: item.folderrsn
                                };
                                return dataLayerService.getNewFolderInfoByFolderId(whereClauseData).then(function (folderInfo) {
                                    if (folderInfo.data && folderInfo.data.length > 0) {
                                        scopevar.amandaeai.FolderUpdate.FolderInfo = [];
                                        for (var p = 0; p < folderInfo.data.length; p++) {
                                            if (folderInfo.data[p].infovalue != "" && folderInfo.data[p].infovalue != null) {
                                                scopevar.amandaeai.FolderUpdate.FolderInfo.push({
                                                    InfoCode: folderInfo.data[p].infocode,
                                                    InfoValue: folderInfo.data[p].infovalue,
                                                    DisplayOrder: folderInfo.data[p].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessChecklistByProcessId(whereClauseData);
                                }).then(function (folderProcessChecklist) {
                                    if (folderProcessChecklist.data && folderProcessChecklist.data.length > 0) {
                                        scopevar.amandaeai.ProcessUpdate.FolderProcessChecklist = [];
                                        for (var l = 0; l < folderProcessChecklist.data.length; l++) {
                                            scopevar.amandaeai.ProcessUpdate.FolderProcessChecklist.push({
                                                ChecklistCode: folderProcessChecklist.data[l].checklistcode,
                                                Passed: folderProcessChecklist.data[l].passed,
                                                NotApplicableFlag: folderProcessChecklist.data[l].notapplicableflag,
                                                EndDate: folderProcessChecklist.data[l].enddate,
                                                StartDate: folderProcessChecklist.data[l].startdate,
                                                ChecklistComment: folderProcessChecklist.data[l].checklistcomment
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessAttachmentByProcessId(whereClauseData);
                                }).then(function (folderProcessAttachment) {
                                    if (folderProcessAttachment.data && folderProcessAttachment.data.length > 0) {
                                        scopevar.amandaeai.ProcessUpdate.Attachment = [];
                                        for (var m = 0; m < folderProcessAttachment.data.length; m++) {
                                            scopevar.amandaeai.ProcessUpdate.Attachment.push({
                                                AttachmentCode: folderProcessAttachment.data[m].attchmentcode,
                                                AttachmentDetail: folderProcessAttachment.data[m].attachmentdetail,
                                                AttachmentDesc: folderProcessAttachment.data[m].attachmentdesc,
                                                DosPath: folderProcessAttachment.data[m].attachmentfilealias,
                                                //// Underscore is used to create xml attribute, left is used for attribute name and right is used for attribute value
                                                AttachmentBlob_encode_Base64: folderProcessAttachment.data[m].blob,
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessDeficiencyByProcessId(whereClauseData);
                                }).then(function (folderProcessDeficiency) {
                                    if (folderProcessDeficiency.data && folderProcessDeficiency.data.length > 0) {
                                        scopevar.amandaeai.ProcessUpdate.FolderProcessDeficiency = [];
                                        for (var n = 0; n < folderProcessDeficiency.data.length; n++) {
                                            scopevar.amandaeai.ProcessUpdate.FolderProcessDeficiency.push({
                                                DeficiencyCode: folderProcessDeficiency.data[n].deficiencycode,
                                                CategoryCode: folderProcessDeficiency.data[n].categorycode,
                                                SubCategoryCode: folderProcessDeficiency.data[n].subcategorycode,
                                                StatusCode: folderProcessDeficiency.data[n].statuscode,
                                                SeverityCode: folderProcessDeficiency.data[n].severitycode,
                                                OccuranceCount: folderProcessDeficiency.data[n].occurancecount,
                                                RemedyText: folderProcessDeficiency.data[n].remedytext,
                                                AssignedUser: storedSettings[0].UserName,
                                                DeficiencyText: folderProcessDeficiency.data[n].deficiencytext,
                                                LocationDesc: folderProcessDeficiency.data[n].locationdesc,
                                                SubLocationDesc: folderProcessDeficiency.data[n].sublocationdesc
                                            });
                                        }
                                    }
                                    return dataLayerService.getNewFolderProcessInfoByProcessId(whereClauseData);
                                }).then(function (folderProcessInfo) {
                                    if (folderProcessInfo.data && folderProcessInfo.data.length > 0) {
                                        scopevar.amandaeai.ProcessUpdate.FolderProcessInfo = [];
                                        for (var o = 0; o < folderProcessInfo.data.length; o++) {
                                            if (folderProcessInfo.data[o].infovalue != "" && folderProcessInfo.data[o].infovalue != null) {
                                                scopevar.amandaeai.ProcessUpdate.FolderProcessInfo.push({
                                                    InfoCode: folderProcessInfo.data[o].infocode,
                                                    InfoValue: folderProcessInfo.data[o].infovalue,
                                                    DisplayOrder: folderProcessInfo.data[o].displayorder
                                                });
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderfreeforminfo) {
                                    if (folderfreeforminfo.data && folderfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderFreeform = [];
                                        for (var p = 0; p < folderfreeforminfo.data.length; p++) {
                                            scopevar.amandaeai.FolderFreeform.push(
                                                {
                                                    FreeformCode: folderfreeforminfo.data[p].freeformcode,
                                                    FreeformRSN: folderfreeforminfo.data[p].freeformrsn <= 0 ? null : folderfreeforminfo.data[p].freeformrsn,
                                                    FolderRSN: folderfreeforminfo.data[p].folderrsn,
                                                    ProcessRSN: folderfreeforminfo.data[p].processrsn == "" ? null : folderfreeforminfo.data[p].processrsn,
                                                    FormRow: folderfreeforminfo.data[p].formrow == "" ? null : folderfreeforminfo.data[p].formrow,
                                                    Comments: folderfreeforminfo.data[p].comments
                                                });
                                            var data = me.cleannulldata(folderfreeforminfo.data[p]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderFreeform[p][key] = data[key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    return dataLayerService.getFolderProcessFreeFormDataToUpload(whereClauseData);

                                }).then(function (folderprocessfreeforminfo) {
                                    if (folderprocessfreeforminfo.data && folderprocessfreeforminfo.data.length > 0) {
                                        scopevar.amandaeai.FolderProcessInspDetail = [];
                                        for (var q = 0; q < folderprocessfreeforminfo.data.length; q++) {
                                            scopevar.amandaeai.FolderProcessInspDetail.push(
                                                {
                                                    FreeformCode: folderprocessfreeforminfo.data[q].freeformcode,
                                                    InspDetailRSN: folderprocessfreeforminfo.data[q].inspdetailrsn <= 0 ? null : folderprocessfreeforminfo.data[q].inspdetailrsn,
                                                    FolderRSN: folderprocessfreeforminfo.data[q].folderrsn,
                                                    ProcessRSN: folderprocessfreeforminfo.data[q].processrsn == "" ? null : folderprocessfreeforminfo.data[q].processrsn,
                                                    Comments: folderprocessfreeforminfo.data[q].comments
                                                });
                                            var data = me.cleannulldata(folderprocessfreeforminfo.data[q]);
                                            for (var key in data) {
                                                if (data.hasOwnProperty(key)) {
                                                    if (data[key] === undefined || data[key] === null) {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = "";
                                                    } else {
                                                        scopevar.amandaeai.FolderProcessInspDetail[q][key] = data[key];
                                                    }
                                                }
                                            }
                                        }

                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var dateformat = CommonService.getDateFormat();
                                    var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                    return dataLayerService.insertUpdateEaiHistory(eaihistoryobj);

                                }).then(function (eairequestinsertresult) {
                                    var insertedid = 0;
                                    if (eairequestinsertresult && eairequestinsertresult.data) {
                                        console.log("Data inserted into eaihistory successfully..");
                                        insertedid = eairequestinsertresult.data;

                                    }
                                    var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                    var request = requetBuilderService.GetEaiPushRequest(xml);
                                    if (request) {
                                        request.eaiId = insertedid;
                                        request.folderId = scopevar.requestFolderId;
                                        request.processId = scopevar.requestProcessId;
                                        request.FolderRSN = scopevar.folderRSN;
                                        request.ProcessRSN = scopevar.processRSN;
                                        request.uploadrequesttype = scopevar.typeofinspection;
                                        me.uploadrequests.push(request);
                                    }
                                    return { error: null, result: "success" };
                                })



                            }
                            else {
                                var xml = me.getEaiXML(scopevar.amandaeai, "AmandaEai");
                                var dateformat = CommonService.getDateFormat();
                                var eaihistoryobj = { folderRSN: scopevar.folderRSN, processRSN: scopevar.processRSN, request: xml, eaiResponse: null, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: null };
                                return dataLayerService.insertUpdateEaiHistory(eaihistoryobj).then(function (eairequestinsertresult) {
                                    var insertedid = 0;
                                    if (eairequestinsertresult && eairequestinsertresult.data) {
                                        console.log("Data inserted into eaihistory successfully..");
                                        insertedid = eairequestinsertresult.data;
                                    }
                                    var request = requetBuilderService.GetEaiPushRequest(xml);
                                    if (request) {
                                        request.eaiId = insertedid;
                                        request.folderId = scopevar.requestFolderId;
                                        request.processId = scopevar.requestProcessId;
                                        request.FolderRSN = scopevar.folderRSN;
                                        request.ProcessRSN = scopevar.processRSN;
                                        request.uploadrequesttype = scopevar.typeofinspection;
                                        me.uploadrequests.push(request);
                                    }
                                    return { error: null, result: "success" };


                                }).catch(function (anyInnserRequestFail) {
                                    deferred.resolve({ error: anyInnserRequestFail, result: null });
                                });






                            }

                        })).then(function (allInnerRequestDone) {
                            deferred.resolve({ error: null, result: "success" });
                        }).catch(function (error) {
                            deferred.resolve({ error: error, result: null });
                        })
                    }
                    else {
                        deferred.resolve({ error: null, result: "success" });
                    }
                });
                return deferred.promise;
            } catch (e) {
                deferred.resolve({ error: e, result: null });
            }

        },

        getEaiXML: function (eaiobject, outerTag) {
            var xml = "";
            for (var prop in eaiobject) {
                if (eaiobject.hasOwnProperty(prop)) {
                    if (eaiobject[prop] !== null) {

                        if (Object.prototype.toString.call(eaiobject[prop]) === "[object Array]") {
                            for (var i = 0; i < eaiobject[prop].length; i++) {
                                xml += this.getEaiXML(eaiobject[prop][i], prop);
                            }
                        } else if (typeof eaiobject[prop] === "object") {
                            xml += this.getEaiXML(eaiobject[prop], prop);
                        } else {
                            if (eaiobject[prop] !== undefined && eaiobject[prop] !== null && eaiobject[prop] !== "") {
                                if (prop.indexOf("_") > 0) {
                                    var elementArray = prop.split("_");
                                    xml += String.format("<{0} {1}={2}>{3}</{0}>", elementArray[0], elementArray[1], '"' + elementArray[2] + '"', eaiobject[prop]);
                                } else {
                                    xml += String.format("<{0}>{1}</{0}>", prop, eaiobject[prop]);
                                }
                            }
                        }
                    }
                }
            }

            if (outerTag) {
                xml = String.format("<{0}>{1}</{0}>", outerTag, xml);
            }
            return xml;
        },

        UploadSuccess: function (result) {
            var me = this;
            var eaiResult = [];
            if (result.response.indexOf("Success") > -1) {

                var eairslt = me.ParseUploadResult(result.response);
                me.ProcessSeccessItems(function (updateresult) {
                    setTimeout(this.ExecuteUploadRequests, 1000, this);

                    utilService.logtoConsole(result.request.uploadrequesttype + " inspection has been uploaded successfully..See below response");
                    utilService.logtoConsole(result.response);

                }, eairslt, result.request.folderId, result.request.FolderRSN, result.request.processId, result.request.ProcessRSN, result.request.uploadrequesttype, me, result.request.uploadrequesttype);

                // Inserting EAI History
                var dateformat = CommonService.getDateFormat();
                var eaihistoryobj = { folderRSN: result.request.FolderRSN, processRSN: result.request.ProcessRSN, request: result.request.data.XML_G, eaiResponse: result.response, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: result.request.eaiId };
                dataLayerService.insertUpdateEaiHistory(eaihistoryobj).then(function () {
                    console.log("Data updated into eaihistory successfully..");
                });

            }
            else {
                utilService.logtoConsole(result.request.uploadrequesttype + " inspection has not been uploaded.Due to below reason");
                utilService.logtoConsole(result.response);
                var updfolderprocessobj = { syntax: "update folderprocess set isfailed='Y' where folderprocess.processrsn=? ", parameter: [result.request.ProcessRSN] };

                dataLayerService.processEaiPushSeccessItems(updfolderprocessobj).then(function () {
                    console.log("Failed Request logged successfully for process rsn :" + result.request.ProcessRSN);
                });

                var eaihistoryobj = { folderRSN: result.request.FolderRSN, processRSN: result.request.ProcessRSN, request: result.request.data.XML_G, eaiResponse: result.response, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: result.request.eaiId };
                dataLayerService.insertUpdateEaiHistory(eaihistoryobj).then(function () {
                    console.log("Data updated into eaihistory successfully..");
                });

                if (this.uploadrequests && this.uploadrequests.length > 0) {
                    var request = this.uploadrequests.pop();
                    if (request) {
                        requestHelperService.ExecuteServiceRequest(request, this, this.UploadSuccess, this.UploadFailed);
                    }
                } else {
                    if (!this.dataProcessinginprogress)
                        setTimeout(this.ExecuteUploadRequests, 1000, this);
                }
            }





        },

        UploadFailed: function (result) {
            var me = this;
            var callback = me.quickSyncCallback;
            var callbackScope = me.quickSyncCallbackScope;
            if (this.uploadrequests && this.uploadrequests.length > 0) {
                var request = this.uploadrequests.pop();
                if (request) {
                    requestHelperService.ExecuteServiceRequest(request, this, this.UploadSuccess, this.UploadFailed);
                }
            } else {
                if (!this.dataProcessinginprogress)
                    setTimeout(this.ExecuteUploadRequests, 1000, this);
            }
            if (this.uploadrequests && this.uploadrequests.length === 0) {
                //if (callback)
                //    me.callback.call(callbackScope, "Data Upload Failed...");
                utilService.logtoConsole("Data Upload Failed...");
            }
            utilService.logtoConsole(result.request.uploadrequesttype + " inspection has not been uploaded.Due to below reason");
            utilService.logtoConsole(result.response);
            var updfolderprocessobj = { syntax: "update folderprocess set isfailed='Y' where folderprocess.processrsn=? ", parameter: [result.request.ProcessRSN] };

            dataLayerService.processEaiPushSeccessItems(updfolderprocessobj).then(function () {
                console.log("Failed Request logged successfully for process rsn :" + result.request.ProcessRSN);
            });
            // Inserting EAI History
            var dateformat = CommonService.getDateFormat();
            var eaihistoryobj = { folderRSN: result.request.FolderRSN, processRSN: result.request.ProcessRSN, request: result.request.data.XML_G, eaiResponse: result.response, stampdate: moment(new Date()).format(dateformat + " HH:mm:ss"), eaiId: result.request.eaiId };
            dataLayerService.insertUpdateEaiHistory(eaihistoryobj).then(function () {
                console.log("Data updated into eaihistory successfully..");
            });

        },

        ExecuteUploadRequests: function (me) {
            var request;
            var callback = me.quickSyncCallback;
            var callbackScope = me.quickSyncCallbackScope;

            if (me.uploadrequests && me.uploadrequests.length > 0) {
                request = me.uploadrequests.pop();
                if (request) {
                    requestHelperService.ExecuteServiceRequest(request, me, me.UploadSuccess, me.UploadFailed);
                }
            }
            else {
                if (callback)
                    callback.call(callbackScope, "uploadsuccess");
            }
        },

        ParseUploadResult: function (data) {
            var me = this;
            data = data.replace("Success", "");

            var eaiResult = { FolderInfo: [], FolderPeople: [], FolderProperty: [], FolderProcessChecklist: [], FolderProcessDeficiency: [], FolderProcessInfo: [], FolderFreeForm: [], FolderProcessInspDetail: [], FolderProcessAttempt: [] };

            var lines = data.trim().replace("\r\n").split('\n');
            if (lines.indexOf('undefined') > 0)
            {
                lines = data.trim().split('\n');
            }
            for (var i = 0; i < lines.length; i++) {
                var rslt;
                if (lines[i].trim().startsWith("Folder Process ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "Folder Process");
                    if (rslt != null) {
                        eaiResult.ProcessRSN = rslt.ProcessRSN;

                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            eaiResult.EaiProcessAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            eaiResult.EaiProcessAction = "Update";
                        }
                    }

                } else if (lines[i].trim().startsWith("FolderProcess ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcess");
                    if (rslt != null) {
                        eaiResult.ProcessRSN = rslt.ProcessRSN;

                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            eaiResult.EaiProcessAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            eaiResult.EaiProcessAction = "Update";
                        }
                    }
                }
                else if (lines[i].trim().startsWith("Folder ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "Folder");
                    if (rslt != null) {
                        eaiResult.FolderRSN = rslt.FolderRSN;

                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            eaiResult.EaiFolderAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            eaiResult.EaiFolderAction = "Update";
                        }
                    }

                }
                else if (lines[i].trim().startsWith("FolderInfo ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderInfo");
                    if (rslt != null) {
                        var eaiResult_FolderInfo = $.grep(eaiResult.FolderInfo, function (e) { return e.InfoCode === rslt.InfoCode; });
                        if (eaiResult_FolderInfo.length === 0) {
                            eaiResult.FolderInfo.push(rslt);
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderPeople ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderPeople");
                    if (rslt != null) {
                        var eaiResult_FolderPeople = $.grep(eaiResult.FolderPeople, function (e) { return e.PeopleRSN === rslt.PeopleRSN; });
                        if (eaiResult_FolderPeople.length === 0) {
                            eaiResult.FolderPeople.push(rslt);
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderProperty ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProperty");
                    if (rslt != null) {
                        var eaiResult_FolderProperty = $.grep(eaiResult.FolderProperty, function (e) { return e.PropertyRSN === rslt.PropertyRSN; });
                        if (eaiResult_FolderProperty.length === 0) {
                            eaiResult.FolderProperty.push(rslt);
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderProcessAttempt ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcessAttempt");
                    if (rslt != null) {
                        eaiResult.FolderProcessAttempt = rslt;
                    }
                }
                else if (lines[i].trim().startsWith("FolderProcessChecklist ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcessChecklist");
                    if (rslt != null) {
                        var eaiResult_FolderProcessChecklist = $.grep(eaiResult.FolderProcessChecklist, function (e) { return (e.ProcessRSN === rslt.ProcessRSN && e.ChecklistCode === rslt.ChecklistCode); });
                        if (eaiResult_FolderProcessChecklist.length === 0) {
                            eaiResult.FolderProcessChecklist.push(rslt);
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderProcessDeficiency ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcessDeficiency");
                    if (rslt != null) {

                        if (rslt.DeficiencyId > 0) {
                            var eaiResult_FolderProcessDeficiency = $.grep(eaiResult.FolderProcessDeficiency, function (e) { return e.DeficiencyId === rslt.DeficiencyId; });
                            if (eaiResult_FolderProcessDeficiency.length === 0) {
                                var def = $.grep(eaiResult.FolderProcessDeficiency, function (e) { return e.DeficiencyCode === rslt.DeficiencyCode; });
                                if (def.length > 0 && def != null) {
                                    def.DeficiencyId = rslt.DeficiencyId;
                                    def.LocationDesc = rslt.LocationDesc == "" ? " " : rslt.LocationDesc;
                                    def.SubLocationDesc = rslt.SubLocationDesc == "" ? " " : rslt.SubLocationDesc;
                                    def.OccuranceCount = rslt.OccuranceCount == "" ? 0 : rslt.OccuranceCount;
                                    def.DeficiencyCode = rslt.DeficiencyCode == "" ? " " : rslt.DeficiencyCode;
                                    eaiResult.FolderProcessDeficiency.push(def);
                                }
                                else {
                                    eaiResult.FolderProcessDeficiency.push(rslt);
                                }
                            }
                        }
                        else if (rslt.ProcessRSN > 0) {
                            var eaiResult_FolderProcessDeficiency = $.grep(eaiResult.FolderProcessDeficiency, function (e) { return (e.ProcessRSN === rslt.ProcessRSN && e.DeficiencyCode === rslt.DeficiencyCode); });
                            if (eaiResult_FolderProcessDeficiency.length === 0) {
                                var def = $.grep(eaiResult.FolderProcessDeficiency, function (e) { return e.DeficiencyCode === rslt.DeficiencyCode; });
                                if (def != null) {
                                    def.ProcessRSN = rslt.ProcessRSN;
                                }
                                else {
                                    eaiResult.FolderProcessDeficiency.push(rslt);
                                }
                            }
                        }
                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            rslt.EaiDeficiencyAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            rslt.EaiDeficiencyAction = "Update";
                        }

                    }
                }
                else if (lines[i].trim().startsWith("FolderProcessInfo ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcessInfo");
                    if (rslt != null) {
                        var eaiResult_FolderProcessInfo = $.grep(eaiResult.FolderProcessInfo, function (e) { return (e.ProcessRSN === rslt.ProcessRSN && e.InfoCode === rslt.InfoCode); });
                        if (eaiResult_FolderProcessInfo.length === 0) {
                            eaiResult.FolderProcessInfo.push(rslt);
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderFreeForm ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderFreeForm");
                    if (rslt != null) {
                        var eaiResult_FolderFreeForm = $.grep(eaiResult.FolderFreeForm, function (e) { return (e.FreeFormRSN === rslt.FreeFormRSN); });
                        if (eaiResult_FolderFreeForm.length === 0) {
                            eaiResult.FolderProcessInfo.push(rslt);
                        }
                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            rslt.EaiFolderFreeFromAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            rslt.EaiFolderFreeFromAction = "Update";
                        }
                    }
                }
                else if (lines[i].trim().startsWith("FolderProcessInspDetail ")) {
                    rslt = me.ParseOutput(lines[i].trim(), "FolderProcessInspDetail");
                    if (rslt != null) {
                        var eaiResult_FolderProcessInspDetail = $.grep(eaiResult.FolderProcessInspDetail, function (e) { return (e.FreeFormRSN === rslt.FreeFormRSN); });
                        if (eaiResult_FolderProcessInspDetail.length === 0) {
                            eaiResult.FolderProcessInspDetail.push(rslt);
                        }
                        if (lines[i].trim().toUpperCase().indexOf("INSERTED") > -1) {
                            rslt.EaiFolderProcessInspDetailAction = "Insert";
                        }
                        else if (lines[i].trim().toUpperCase().indexOf("UPDATED") > -1) {
                            rslt.EaiFolderProcessInspDetailAction = "Update";
                        }
                    }
                }

            }
            return eaiResult;

        },

        ParseOutput: function (data, initialString) {
            if (!data.indexOf(initialString + " {") < -1)
                return null;
            data = data.substring(data.indexOf(initialString));
            if (!data.indexOf("}") < -1)
                return null;
            data = data.substring(data.indexOf("{"));
            data = data.substring(0, data.indexOf("}") + 1);
            data = data.replace(/=,/g, "='',");
            data = data.replace(" , ", ",").replace(", ", ",").replace(" ,", ",");
            data = data.replace("{", "{\"").replace("}", "\"}").replace(/=|_/g, "\":\"").replace(/,/g, "\",\"").replace("\", \"", "\",\"");
            return JSON.parse(data);
        },

        ProcessSeccessItems: function (callback, eaiResult, folderId, FolderRSN, processId, ProcessRSN, uploadrequesttype, scope, uplodrequesttype) {
            var allupdatesyntax = [];
            if (eaiResult.FolderRSN === undefined)
                eaiResult.FolderRSN = FolderRSN;
            if (eaiResult.ProcessRSN === undefined)
                eaiResult.ProcessRSN = ProcessRSN;

            if (uplodrequesttype !== "processpriority") {
                var updfolderobj = { syntax: "update folder set folderrsn=?,isnew=null where folder.id=?", parameter: [eaiResult.FolderRSN, folderId] };
                allupdatesyntax.push(updfolderobj);
                var updfolderprocessobj = { syntax: "update folderprocess set folderrsn=?, processrsn=?,isreschedule=null,folderid=null,isnew=null,isedited=null,ispriority=null,isfailed=null where folderprocess.id=? ", parameter: [eaiResult.FolderRSN, eaiResult.ProcessRSN, processId] };
                if (uplodrequesttype === "rescheduled") {
                    updfolderprocessobj = { syntax: "update folderprocess set folderrsn=?, processrsn=?,isreschedule=null,folderid=null,isnew=null,isedited=null,enddate=null,ispriority=null,isfailed=null where folderprocess.id=? ", parameter: [eaiResult.FolderRSN, eaiResult.ProcessRSN, processId] };
                }

                allupdatesyntax.push(updfolderprocessobj);

                if (eaiResult.FolderInfo.length > 0) {
                    $.each(eaiResult.FolderInfo, function (i, obj) {
                        var folderinfoobj = { syntax: "update folderinfo set folderrsn=?,folderid=null,isnew=null,isedited=null where folderinfo.folderid=? and folderinfo.infocode=? and folderinfo.folderrsn=0", parameter: [eaiResult.FolderRSN, folderId, obj.InfoCode] };
                        allupdatesyntax.push(folderinfoobj);
                    });
                }
                if (eaiResult.FolderProcessAttempt != null && eaiResult.FolderProcessAttempt.ProcessRSN > 0 && eaiResult.FolderProcessAttempt.AttemptRSN > 0) {
                    var folderprocessattemptobj = { syntax: "update FolderProcessAttempt set folderrsn=?,processrsn=?,attemptrsn=?,processid=null where FolderProcessAttempt.processid=? ", parameter: [eaiResult.FolderRSN, eaiResult.ProcessRSN, eaiResult.FolderProcessAttempt.AttemptRSN, processId] };
                    allupdatesyntax.push(folderprocessattemptobj);
                }
                if (eaiResult.FolderProcessInfo.length > 0) {
                    $.each(eaiResult.FolderProcessInfo, function (i, obj) {
                        var folderprocessinfoobj = { syntax: "update FolderProcessInfo set processrsn=?,processid=null,isnew=null,isedited=null where FolderProcessInfo.processid=? and FolderProcessInfo.infocode=? ", parameter: [eaiResult.ProcessRSN, processId, obj.InfoCode] };
                        allupdatesyntax.push(folderprocessinfoobj);
                    });
                }
                if (eaiResult.FolderPeople.length > 0) {
                    $.each(eaiResult.FolderPeople, function (i, obj) {
                        var folderPeopleobj = { syntax: "update FolderPeople set folderrsn=?,isnew=null where FolderPeople.folderid=? ", parameter: [eaiResult.FolderRSN, folderId] };
                        allupdatesyntax.push(folderPeopleobj);
                    });
                }
                if (eaiResult.FolderProperty.length > 0) {
                    $.each(eaiResult.FolderProperty, function (i, obj) {
                        var folderPropertyobj = { syntax: "update FolderProperty set folderrsn=?,isnew=null where FolderProperty.folderid=? ", parameter: [eaiResult.FolderRSN, folderId] };
                        allupdatesyntax.push(folderPropertyobj);
                    });
                }

                if (eaiResult.FolderProcessChecklist.length > 0) {
                    $.each(eaiResult.FolderProcessChecklist, function (i, obj) {
                        var folderprocesschecklistobj = { syntax: "update FolderProcessChecklist set processrsn=?,processid=null,isnew=null,isedited=null where FolderProcessChecklist.processid=? and FolderProcessChecklist.checklistcode =? ", parameter: [eaiResult.ProcessRSN, processId, obj.ChecklistCode] };
                        allupdatesyntax.push(folderprocesschecklistobj);
                    });
                }

                if (eaiResult.FolderProcessDeficiency.length > 0) {
                    $.each(eaiResult.FolderProcessDeficiency, function (i, obj) {
                        var folderprocessdeficiencyobj = { syntax: "update folderprocessdeficiency set deficiencyid=?,processrsn=?, isnew=null,isedited=null, processid=null where (processrsn=? OR processid=? ) and deficiencycode=?", parameter: [obj.DeficiencyId, eaiResult.ProcessRSN, eaiResult.ProcessRSN, processId, obj.DeficiencyCode] };
                        allupdatesyntax.push(folderprocessdeficiencyobj);
                    });
                }

                if (eaiResult.FolderFreeForm.length > 0) {
                    $.each(eaiResult.FolderFreeForm, function (i, obj) {
                        var folderFreeFormobj = { syntax: "delete from FolderFreeForm where FolderFreeForm.folderid=? ", parameter: [folderId] };
                        allupdatesyntax.push(folderPropertyobj);
                    });
                }
                if (eaiResult.FolderProcessInspDetail.length > 0) {
                    $.each(eaiResult.FolderProcessInspDetail, function (i, obj) {
                        var folderFreeFormobj = { syntax: "delete from FolderProcessInspDetail where FolderProcessInspDetail.folderid=? and FolderProcessInspDetail.processid=?", parameter: [folderId, processId] };
                        allupdatesyntax.push(folderPropertyobj);
                    });
                }


                var folderattachmentobj = { syntax: "delete from attachment where tablename='FOLDER'  and (tablersn=? or processid=?)", parameter: [eaiResult.ProcessRSN, processId] };
                allupdatesyntax.push(folderattachmentobj);

                var folderprocessattachmentobj = { syntax: "delete from attachment where tablename='FOLDER_PROCESS' and (tablersn=? or processid=?)", parameter: [eaiResult.ProcessRSN, processId] };
                allupdatesyntax.push(folderprocessattachmentobj);

                var inspectorsignatureobj = { syntax: "delete from folderprocessattemptsignature where processid=?", parameter: [processId] };
                allupdatesyntax.push(inspectorsignatureobj);

            } else {
                var updfolderprocessobj = { syntax: "update folderprocess set isreschedule=null,folderid=null, isnew=null,isedited=null,ispriority=null,isfailed=null where folderprocess.processrsn=? ", parameter: [eaiResult.ProcessRSN] };
                allupdatesyntax.push(updfolderprocessobj);
            }



            return Promise.all(allupdatesyntax.map(function (item) {
                dataLayerService.processEaiPushSeccessItems(item).then(function () {
                    console.log("Data updated successfully for " + item);
                });

            })).then(function (result) {
                if (callback) {
                    callback.call(scope, "Data updated successfully..");
                }
            });

        },
        /*End Of Upload Data To Server */

        SearchFolderFullText: function (callback, scope, seachtext, startindex, endindex) {
            cfpLoadingBar.start();
            var request = requetBuilderService.BuildSearchFullTextRequest(seachtext, startindex, endindex, scope, "_SearchFolderFullText.jsp");

            $timeout(function () {
                requestHelperService.ExecuteServiceRequest(request, scope,
                   function (successResult) {
                       cfpLoadingBar.complete();
                       if (callback) {
                           callback.call(scope, { error: null, data: successResult.response.data });
                       }
                   },
                   function (failureResult) {
                       cfpLoadingBar.complete();
                       if (callback) {
                           callback.call(scope, { error: failureResult, data: null });
                       }
                   });
            }, 1000);


        },

        SearchPeopleFullText: function (callback, scope, seachtext, startindex, endindex) {
            cfpLoadingBar.start();
            var request = requetBuilderService.BuildSearchFullTextRequest(seachtext, startindex, endindex, scope, "_SearchPeopleFullText.jsp");


            $timeout(function () {
                requestHelperService.ExecuteServiceRequest(request, scope,
                    function (successResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: null, data: successResult.response.data });
                        }
                    },
                    function (failureResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: failureResult, data: null });
                        }
                    });
            }, 1000);
        },

        SearchPropertyFullText: function (callback, scope, seachtext, startindex, endindex) {
            cfpLoadingBar.start();
            var request = requetBuilderService.BuildSearchFullTextRequest(seachtext, startindex, endindex, scope, "_SearchPropertyFullText.jsp");


            $timeout(function () {
                requestHelperService.ExecuteServiceRequest(request, scope,
                    function (successResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: null, data: successResult.response.data });
                        }
                    },
                    function (failureResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: failureResult, data: null });
                        }
                    });
            }, 1000);
        },

        getFolderDataByFolderRSN: function (callback, scope, folderrsn) {
            cfpLoadingBar.start();
            var request = requetBuilderService.BuildSearchFolderDataRequest(folderrsn, scope, "_FolderDetails.jsp");


            $timeout(function () {
                requestHelperService.ExecuteServiceRequest(request, scope,
                    function (successResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: null, data: successResult.response.data });
                        }
                    },
                    function (failureResult) {
                        cfpLoadingBar.complete();
                        if (callback) {
                            callback.call(scope, { error: failureResult, data: null });
                        }
                    });
            }, 1000);

        },

        getReportTemplate: function (callback, scope, downloadurl) {
            cfpLoadingBar.start();
            var request = requetBuilderService.BuildDownloadReportTemplateRequest(scope, downloadurl);
            requestHelperService.ExecuteServiceRequest(request, scope,
             function (successResult) {
                 cfpLoadingBar.complete();
                 if (callback) {
                     callback.call(scope, { error: null, data: successResult.response });
                 }
             },
             function (failureResult) {
                 cfpLoadingBar.complete();
                 if (callback) {
                     callback.call(scope, { error: failureResult, data: null });
                 }
             });
        },

        pushNewInspection: function (eaixml, callback, scope, statuscallback) {
            var me = this;

            var uploadCallback = callback;
            var uploadCallbackScope = scope;
            var uploadstatuscallback = statuscallback;

            var request = requetBuilderService.GetEaiPushRequest(eaixml);

            requestHelperService.ExecuteServiceRequest(request, me,
                function (result) { //success callback
                    if (result.response.indexOf("Success") > -1) {
                        var eairslt = me.ParseUploadResult(result.response);
                        uploadCallback.call(uploadCallbackScope, { error: null, data: eairslt });

                    } else {
                        utilService.logtoConsole("unscheduled inspection has not been created. Due to below reason");
                        utilService.logtoConsole(result.response);
                        uploadCallback.call(uploadCallbackScope, { error: new Error(response.message), data: null });

                    }
                }, function (result) { //failure callback

                    utilService.logtoConsole("unscheduled inspection has not been created. Due to below reason");
                    utilService.logtoConsole(result.response);
                    uploadCallback.call(uploadCallbackScope, { error: result.error, data: null });
                });
            uploadstatuscallback.call(uploadCallbackScope, "creating unscheduled inspection..");
        },
    }
});
