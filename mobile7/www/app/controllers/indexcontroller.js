define(['app/app', "toastr"], function (ap, toastr) {
    app.controller("IndexCtrl", function ($scope, $timeout, $filter, $rootScope, $window, CommonService, $anchorScroll, dataLayerService,
        utilService, requestHelperService, syncHelperService, $q, $sce, $cordovaNetwork, cfpLoadingBar) {
        var dateformat = CommonService.getDateFormat();
        $scope.dateFormat = dateformat;
        $("body").removeClass("body-background");
        $scope.currentview = "Inbox";
        $scope.fromfield = "";
        $scope.message = "Welcome";
        $scope.listOutbox = [];
        $scope.isDirectionSummary = false;
        $scope.closeDirectionSummary = function () {
            $scope.isDirectionSummary = false;
        }
        $scope.emptyItems = function (identifier) {
            var i = 0;
            if (identifier === "inbox") {
                for (i = $scope.listInbox.length - 1; i >= 0; i--) {
                    $scope.listInbox.splice(i, 1);
                }
            } else if (identifier === "outbox") {
                for (i = $scope.listOutbox.length - 1; i >= 0; i--) {
                    $scope.listOutbox.splice(i, 1);
                }
            }
            else if (identifier === "projectview") {
                for (i = $scope.listProjectView.length - 1; i >= 0; i--) {
                    $scope.listProjectView.splice(i, 1);
                }
            }
            // Tiggering a manual click so that if no item is selected then Route option will be removed.
            //$($("input[ng-model='parent.isFolderSelected']")[0]).trigger("click");
            $timeout(function () {
                if (!$rootScope.isItemSelected) {
                    $("#custommapmenu").remove();
                }
            });

        };
        var showMesssage = $rootScope.$on("ShowMesssage", function (event, messagetoshow) {
            $scope.showMessage(messagetoshow);
        });
        var changeView = $rootScope.$on("ChangeView", function (event, viewname) {
            $scope.changeView(viewname);
        });
        $scope.showMessage = function (message) {
            $timeout(function () {
                //$scope.message = message;
                utilService.showError(message, 'info');
            }, 100);
        };

        $scope.setMainHeight = function () {
            utilService.logtoConsole("dynamic height set..map", 'info');
            CommonService.setHeights();
        };

        $scope.changeView = function (viewname) {
            if (viewname === "Search") {
                $scope.showSearchSection();
            } else if (viewname === "Outbox") {
                $scope.showOutboxList();
            } else if (viewname === "Project") {
                $scope.showProjectViewSection();
            } else {
                $scope.showInboxList();
            }



        };

        $scope.CheckIfFreeFormDataRequired = function () {
            var deferred = $q.defer();
            syncHelperService.checkIfFreeFormData(function (result) {
                if (result && result.data != "") {
                    deferred.resolve({ error: null, data: "required" });
                } else {
                    deferred.resolve({ error: null, data: "" });
                }



            }, $scope, function (status) {
                $scope.showMessage(status);
            });
            return deferred.promise;
        }

        $scope.Sync = function () {
            $("body").append('<div class="modal-backdrop fade in"></div>');
            $("body").addClass("modal-open");
            toastr.options = CommonService.getCustomToastrOptions();
            var html = "<div class='text-right'><button type='button' id='yesFullSyncConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Yes</button>&nbsp;&nbsp;<button type='button' id='noFullSyncConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>No</button></div>";
            toastr.info(html, 'Are you sure, You want to do full sync?', {
                allowHtml: true,
                onShown: function (html) {
                    $("#yesFullSyncConfirm").on('click', function (event) {
                        //$route.reload()

                        $("body").removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        toastr.remove();
                        toastr.options = CommonService.getDefaultToastrOptions();
                        var isoffline = $cordovaNetwork.isOffline();
                        if (isoffline) {
                            utilService.showError("Unable to sync. Please connect to network and try again", 'error');
                            return;
                        }

                        $scope.showMessage("Sync in progress. Please wait..", 'info');

                        // Start to record the time from iniatial 
                        syncHelperService.syncStartedAt = new Date();

                        syncHelperService.doQuickSyncToProcessPriorityupload(function (uploadresult) {
                            if (uploadresult === 'uploadsuccess') {
                                //$scope.showMessage("Process Priority Sync Done...");
                                $scope.showMessage("Sync in progress. Please wait...");
                                dataLayerService.checkOutBoxInspections().then(function (result) {
                                    if (result && result.data && result.data.length > 0) {
                                        var serverSettings = JSON.parse(localStorage.getItem("serverSettings"));
                                        var userId = serverSettings[0].UserName;
                                        var password = serverSettings[0].Password;

                                        if ((userId != null) && (password != null)) {
                                            requestHelperService.ExecuteServiceLoginRequest(userId,
                                                password,
                                                this,
                                                function (result) {
                                                    if (result.error == null && (result.response && result.response.lid != null && result.response.lid !== "")) {
                                                        var userSettings = [];
                                                        userSettings.push({
                                                            username: result.request.data.UN,
                                                            password: result.request.data.PW,
                                                            lid: result.response.lid,
                                                            validuser: result.response.validUser
                                                        });
                                                        syncHelperService.serverTimeStamp = (result.response.serverTimeStamp !== "" && result.response.serverTimeStamp !== null && result.response.serverTimeStamp !== undefined) ? moment(result.response.serverTimeStamp).format('YYYY-MM-DD HH:mm:ss') : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

                                                        localStorage.setItem("userSettings", JSON.stringify(userSettings));

                                                        syncHelperService.UploadDataToServer(function (result) {
                                                            if (result === "uploadsuccess") {
                                                                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresponse) {
                                                                    utilService.logtoConsole("logoff response: " + logoffresponse.response);
                                                                    $scope.FullSync();
                                                                }, "json");

                                                            }
                                                        }, this, function (statusresult) {
                                                            //$scope.showMessage(statusresult);
                                                            $scope.showMessage("Sync in progress. Please wait...");
                                                        }, userSettings)

                                                    } else {
                                                        utilService.showError("Authentication Failed..", 'error');
                                                    }
                                                }, "json");
                                        } else {
                                            utilService.showError("Login or Password not supplied..", 'error');
                                        }

                                    } else {
                                        $scope.FullSync();
                                    }

                                }).catch(function (error) {
                                    utilService.showError("Unable to sync. Please try again", 'error');
                                    return;
                                })
                            }
                        },
                    $scope,
                    function (statusresult) {
                        //$scope.showMessage(statusresult);
                        $scope.showMessage("Sync in progress. Please wait...");
                    });








                    });
                    $("#noFullSyncConfirm").on("click", function (event) {
                        $("body").removeClass("modal-open");
                        $(".modal-backdrop").remove();
                        toastr.remove();
                        toastr.options = CommonService.getDefaultToastrOptions();
                        return;
                    });
                }
            });
        };

        $scope.FullSync = function () {
            $scope.CheckIfFreeFormDataRequired().then(function (result) {
                // Call logoff request for checkfreefrom request
                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresponse) {
                    utilService.logtoConsole("logoff response: " + logoffresponse.response);

                    var freefromrequired = false;
                    if (result.data === "required") {
                        freefromrequired = true;
                    }
                    $scope.showMessage("Sync in progress. Please wait..", 'info');
                    syncHelperService.dofullsync("C",
                      function (result) {
                          //$scope.showMessage(result.message);
                          //$scope.showMessage("Downloading inspections...");
                          $scope.showMessage("Sync in progress. Please wait...");
                          syncHelperService.dataProcessinginprogress = false;
                          // Intialize the validsitemobileoptions
                          dataLayerService.siteOptions = null;
                          dataLayerService.getSiteOptions();
                          requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresponse) {
                              utilService.logtoConsole("logoff response: " + logoffresponse.response);
                              $scope.QSync(freefromrequired);
                          }, "json");
                      },
                      $scope,
                      function (result) {
                          if (result.indexOf("Master") > 0) {
                              //$scope.showMessage("Downloading inspections...");
                              $scope.showMessage("Sync in progress. Please wait...");
                          }
                          //$scope.showMessage(result);
                          $scope.showMessage("Sync in progress. Please wait...");
                      }, freefromrequired);

                }, "json");
            });
        }

        $scope.QSync = function (isfreefromrequired) {

            dataLayerService.getValidSiteMobileOption().then(function (result) {
                syncHelperService.doquicksyncafterupload("Q",
                                   function (result) {
                                       $scope.showMessage(result.message);
                                       $scope.showInboxList(true);
                                       cfpLoadingBar.complete();
                                       $scope.resetSyncHelperClassVariables();
                                   },
                                   $scope,
                                   function (result) {
                                       //$scope.showMessage(result);
                                       $scope.showMessage("Sync in progress. Please wait...");
                                   }, isfreefromrequired, "SD");
            });
        };
        var QuickSync = $rootScope.$on("QuickSync", function () {
            $scope.QSDSync();
        })
        $scope.QSDSync = function () {
            // Start to record the time from iniatial 
            syncHelperService.syncStartedAt = new Date();

            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to sync. Please connect to network and try again", 'error');
                return;
            }

            $scope.showMessage("Sync in progress. Please wait...");

            syncHelperService.doquicksyncwithupload(
            function (uploadresult) {
                if (uploadresult === 'uploadsuccess') {
                    $scope.showMessage("Sync in progress. Please wait...");
                }
                // Call the logoff request for upload data request
                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresponse) {
                    utilService.logtoConsole("logoff response: " + logoffresponse.response);

                    syncHelperService.doQuickSyncToProcessPriorityupload(
                    function (uploadresult) {
                        if (uploadresult === 'uploadsuccess') {
                            $scope.showMessage("Sync in progress. Please wait...");
                            var isfreefromrequired = false;
                            $scope.showMessage("Sync in progress. Please wait...");
                            dataLayerService.getAllFolderRSNProcessRSN().then(function (result) {
                                var existingFolderRSNs = [];
                                var existingProcessRSNs = [];
                                if (result && result.data) {
                                    for (var i = 0; i < result.data.length; i++) {
                                        var row = result.data[i];
                                        if (row) {
                                            if (!isNaN(row.folderrsn)) {
                                                var rsn = Number(row.folderrsn);
                                                if (existingFolderRSNs.indexOf(rsn) < 0) {
                                                    existingFolderRSNs.push(rsn);
                                                }
                                            }
                                            if (!isNaN(row.processrsn)) {
                                                var rsn = Number(row.processrsn);
                                                if (existingProcessRSNs.indexOf(rsn) < 0) {
                                                    existingProcessRSNs.push(rsn);
                                                }
                                            }
                                        }
                                    }
                                    var processRSNs = existingProcessRSNs.join(",");
                                    var folderRSNs = existingFolderRSNs.join(",");
                                }

                                syncHelperService.doquicksyncafterupload("Q", function (result) {
                                    $scope.showMessage(result.message);
                                    syncHelperService.dataProcessinginprogress = false;
                                    $scope.showInboxList(false);
                                    cfpLoadingBar.complete();
                                    // Call logoff request for priority and quicksync after upload
                                    requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresponse) {
                                        utilService.logtoConsole("logoff response: " + logoffresponse.response);
                                    }, "json");

                                    $scope.resetSyncHelperClassVariables();
                                },
                                 $scope,
                                 function (result) {
                                     $scope.showMessage(result);
                                 },
                                 isfreefromrequired,
                                 "QSD", folderRSNs, processRSNs);



                            });
                        }
                    },
                    $scope,
                    function (statusresult) {
                        //$scope.showMessage(statusresult);
                        $scope.showMessage("Sync in progress. Please wait...");
                    });

                }, "json");

            },
            $scope,
            function (statusresult) {
                //$scope.showMessage(statusresult);
                $scope.showMessage("Sync in progress. Please wait...");
            });
        }
        $scope.resetSyncHelperClassVariables = function () {
            syncHelperService.inspectionJspRes = null;
            syncHelperService.countRequests = null;
            syncHelperService.requests = [];
            syncHelperService.pageSize = 500;
            syncHelperService.fullSyncCallback = null;
            syncHelperService.fullSyncCallbackScope = null;
            syncHelperService.stautscallback = null;
            syncHelperService.datarequests = 0;
            syncHelperService.pendingrequests = [];
            syncHelperService.uploadrequests = [];
            syncHelperService.refinterval = null;
            syncHelperService.syncStartedAt = null;
            syncHelperService.syncCompletedAt = null;
            syncHelperService.dataProcessinginprogress = false;
            syncHelperService.quickSyncCallback = null;
            syncHelperService.quickSyncCallbackScope = null;
            syncHelperService.syncType = "";
            syncHelperService.updateStampDateExecuted = false;
            syncHelperService.checkFreeFormCallBack = null;
            syncHelperService.checkFreeFormCallBackScope = null;
            syncHelperService.isFreeFormRequired = false;
            syncHelperService.pastDaysCount = 0;
            syncHelperService.futureDaysCount = 0;
            syncHelperService.existingFolderRSNs = null;
            syncHelperService.existingProcessRSNs = null;
            syncHelperService.serverTimeStamp = null;

        }


        function dynamicSort(property) {
            var sortOrder = 1;
            if (property[0] === "-") {
                sortOrder = -1;
                property = property.substr(1);
            }
            return function (a, b) {
                //var result = 0;
                //if (a[property] === null || a[property]==="") {
                //    result= 1;
                //}
                //else if (b[property] === null || b[property]==="") {
                //    result= - 1;
                //}
                //else if (a[property] === b[property]) {
                //    result= 0;
                //}
                //else if (sortOrder == 1) {
                //    result=(a[property] < b[property]) ? -1 : 1;
                //}
                //else if (sortOrder != 1) {
                //    result=(a[property] > b[property]) ? 1 : -1;
                //}


                //var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                //return result * sortOrder;

                if (a[property] === b[property])          // identical? return 0
                    return 0;
                else if (a[property] === null || a[property] === "")  // a is null? last 
                    return 1;
                else if (b[property] === null || b[property] === "")  // b is null? last
                    return -1;
                else if (sortOrder == 1) {
                    return (a[property] < b[property]) ? -1 : 1;
                }
                else if (sortOrder != 1) {
                    return (a[property] < b[property]) ? 1 : -1;
                }


            }
        }
        function dynamicSortMultiple(arguments) {
            /*
             * save the arguments object as it will be overwritten
             * note that arguments object is an array-like object
             * consisting of the names of the properties to sort by
             */
            var props = arguments;
            return function (obj1, obj2) {
                var i = 0, result = 0, numberOfProperties = props.length;
                /* try getting a different result from 0 (equal)
                 * as long as we have extra properties to compare
                 */
                while (result === 0 && i < numberOfProperties) {
                    result = dynamicSort(props[i])(obj1, obj2);
                    i++;
                }
                return result;
            }
        }

        $scope.setSortingOrder = function () {
            $scope.selectedSortedValue = [];
            var functionList = [];

            $scope.selectedSortedColumns.map(function (i) {
                if (i.ischecked) {
                    $scope.selectedSortedValue.push("-" + i.value);
                }
                else {
                    $scope.selectedSortedValue.push(i.value);
                }

                $scope.listInbox = $scope.listInbox.sort(dynamicSortMultiple($scope.selectedSortedValue))

            });


            //$scope.selectedSortedColumns.map(function (i) {
            //    if (i.ischecked) {
            //        //$scope.selectedSortedValue.push("-" + i.value);
            //        if (i.value === "scheduleDate") {
            //            functionList.push(
            //                 function (v1, v2) {
            //                     return new Date(v2.scheduleDate) - new Date(v1.scheduleDate);
            //                 }
            //             )
            //        } else {
            //            functionList.push(
            //               function (v1, v2) {
            //                   return v2[i.value] - v1[i.value];
            //               }
            //           )
            //        }

            //    }
            //    else {
            //        //$scope.selectedSortedValue.push(i.value);
            //        if (i.value === "scheduleDate") {
            //            functionList.push(
            //                 function (v1, v2) {
            //                     return new Date(v1.scheduleDate) - new Date(v2.scheduleDate);
            //                 }
            //             )
            //        } else {
            //            functionList.push(
            //               function (v1, v2) {
            //                   return v1[i.value] - v2[i.value];
            //               }
            //           )
            //        }
            //    }
            //});
            //if (functionList.length > 0) {
            //    var functions = null;
            //     $.map(functionList, function (item, index) {
            //        if (index == 0) {
            //            functions = firstBy(item);
            //        } else {
            //            functions.thenBy(item)
            //        }
            //    })
            //    $scope.listInbox = $scope.listInbox.sort(functions);
            //}
        }
        $scope.defaultCustomInboxColumn = function (isprocesspriorityeditable, isinspectionminuteeditable) {
            if (isinspectionminuteeditable === undefined) {
                isinspectionminuteeditable = false;
            }
            if (isprocesspriorityeditable === undefined) {
                isprocesspriorityeditable = false;
            }

            $scope.availableColumns = [{ text: "Folder Type", value: "folderType", ischecked: false, columns: 6 },
                                       { text: "FolderRSN", value: "folderRSN", ischecked: false, columns: 4 },
                                       { text: "ProcessRSN", value: "processRSN", ischecked: false, columns: 4 },
                                       { text: "Process Priority", value: "processPriority", ischecked: false, columns: 2, isEditable: isprocesspriorityeditable },
                                       { text: "Inspection Minute", value: "inspMinute", ischecked: false, columns: 2, isEditable: isinspectionminuteeditable }];

            $scope.selectedColumns = [
                { text: "FolderNumber", value: "folderNumber", ischecked: false, columns: 8 },
                { text: "Process Type", value: "processType", ischecked: false, columns: 8 },
                { text: "Schedule Date", value: "scheduleDate", ischecked: false, columns: 4 },
                { text: "Folder Status", value: "folderStatus", ischecked: false, columns: 4 },
                { text: "Property Address", value: "propertyAddress", ischecked: false, columns: 12 },
                { text: "Process Comment", value: "processComment", ischecked: false, columns: 12 }
            ];

            $scope.availableSortedColumns = [];
            $.map($scope.selectedColumns, function (item, index) {
                var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                if (checkifcolexists.length === 0) {
                    $scope.availableSortedColumns.push(item);
                }
            });


            if ($window.localStorage) {
                var columnSettings = $window.localStorage.getItem("inbox.columnsSetting");
                if (columnSettings) {
                    var objColumnSettings;
                    try {
                        objColumnSettings = JSON.parse(columnSettings);
                    } catch (e) {
                        utilService.logtoConsole(e, "error");
                    }
                    if (objColumnSettings) {
                        if (objColumnSettings["availableColumns"]) {
                            $scope.availableColumns = objColumnSettings["availableColumns"];
                            var ifalreadyexists = $filter('filter')($scope.availableColumns, { text: 'Process Priority' }, true);
                            if (ifalreadyexists && ifalreadyexists.length > 0) {
                                ifalreadyexists[0].isEditable = isprocesspriorityeditable;
                            }
                            var ifalreadyexistsInspMin = $filter('filter')($scope.availableColumns, { text: 'Inspection Minute' }, true);
                            if (ifalreadyexistsInspMin&&ifalreadyexistsInspMin.length > 0) {
                                ifalreadyexistsInspMin[0].isEditable = isinspectionminuteeditable;
                            }
                        }
                        if (objColumnSettings["selectedColumns"]) {
                            $scope.selectedColumns = objColumnSettings["selectedColumns"];
                            $.map($scope.selectedColumns, function (item, index) {
                                var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                                if (checkifcolexists.length === 0) {
                                    $scope.availableSortedColumns.push(item);
                                }
                            });
                            var ifalreadyexists = $filter('filter')($scope.selectedColumns, { text: 'Process Priority' }, true);
                            if (ifalreadyexists.length > 0) {
                                ifalreadyexists[0].isEditable = isprocesspriorityeditable;
                            }
                            var ifalreadyexistsInspMin = $filter('filter')($scope.selectedColumns, { text: 'Inspection Minute' }, true);
                            if (ifalreadyexistsInspMin && ifalreadyexistsInspMin.length > 0) {
                                ifalreadyexistsInspMin[0].isEditable = isinspectionminuteeditable;
                            }
                        }

                    }
                }
            }

            $scope.sortableOptions = {
                connectWith: ".connected",
                create: function (event, ui) {
                    utilService.logtoConsole("sortable created");
                },
                update: function (e, ui) {

                    $timeout(function () {
                        var available = $scope.availableColumns.map(function (i) { return i.text; }).join(", ");
                        var selected = $scope.selectedColumns.map(function (i) { return i.text; }).join(", ");
                        utilService.logtoConsole("available: " + available);
                        utilService.logtoConsole("selected: " + selected);
                        //$scope.availableSortedColumns = $scope.selectedColumns

                        $.map($scope.selectedSortedColumns, function (item, index) {
                            var checkifcolexists = $filter('filter')($scope.selectedColumns, { text: item.text }, true);
                            if (checkifcolexists.length === 0) {
                                $scope.selectedSortedColumns.splice($scope.selectedSortedColumns.indexOf(item), 1);
                            }
                        });


                        $scope.availableSortedColumns = [];


                        $.map($scope.selectedColumns, function (item, index) {
                            var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                            if (checkifcolexists.length === 0) {
                                $scope.availableSortedColumns.push(item);
                            }
                        });

                        $.map($scope.selectedSortedColumns, function (item, index) {
                            var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                            if (checkifcolexists.length > 0) {
                                $scope.availableSortedColumns.splice($scope.availableSortedColumns.indexOf(item), 1);
                            }
                        });



                        if ($window.localStorage) {
                            $window.localStorage.setItem("inbox.columnsSetting", JSON.stringify({
                                availableColumns: $scope.availableColumns,
                                selectedColumns: $scope.selectedColumns
                            }));
                        }
                    });

                }
            };

            $scope.selectedSortedValue = [];
            $scope.selectedSortedColumns = [];
            if ($window.localStorage) {
                var columnSettings = $window.localStorage.getItem("inbox.sortColumnSetting");
                if (columnSettings) {
                    var objColumnSettings;
                    try {
                        objColumnSettings = JSON.parse(columnSettings);
                    } catch (e) {
                        utilService.logtoConsole(e, "error");
                    }
                    if (objColumnSettings) {
                        if (objColumnSettings["availableSortedColumns"])
                            $scope.availableSortedColumns = objColumnSettings["availableSortedColumns"];
                        if (objColumnSettings["selectedSortedColumns"]) {
                            $scope.selectedSortedColumns = objColumnSettings["selectedSortedColumns"];
                            //$scope.selectedSortedColumns.map(function (i) {
                            //    $scope.selectedSortedValue.push(i.value);
                            //});

                        }
                    }
                }
            }

            $scope.setSortingOrder();

            $scope.sortableOptionsSorted = {
                connectWith: ".connected",
                create: function (event, ui) {
                    utilService.logtoConsole("sortable created");
                },
                update: function (e, ui) {
                    $timeout(function () {
                        $scope.setSortingOrder();
                        if ($window.localStorage) {
                            $.map($scope.availableSortedColumns, function (item) {
                                item.ischecked = false;
                            });
                            $window.localStorage.setItem("inbox.sortColumnSetting", JSON.stringify({
                                availableSortedColumns: $scope.availableSortedColumns,
                                selectedSortedColumns: $scope.selectedSortedColumns
                            }));
                        }
                    }, 100);

                }
            };
        }
        $scope.setAccendingDecending = function () {
            $scope.setSortingOrder();
        }
        $scope.resetInboxSortOrder = function () {
            $window.localStorage.setItem("inbox.sortColumnSetting", "");
            if ($window.localStorage) {
                var columnSettings = $window.localStorage.getItem("inbox.columnsSetting");
                if (columnSettings) {
                    var objColumnSettings;
                    try {
                        objColumnSettings = JSON.parse(columnSettings);
                    } catch (e) {
                        utilService.logtoConsole(e, "error");
                    }
                    if (objColumnSettings) {
                        if (objColumnSettings["selectedColumns"]) {
                            $scope.selectedColumns = objColumnSettings["selectedColumns"];
                            $scope.availableSortedColumns = [];
                            $scope.selectedSortedColumns = [];
                            $.map($scope.selectedColumns, function (item, index) {
                                var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                                if (checkifcolexists.length === 0) {
                                    $scope.availableSortedColumns.push(item);
                                }
                            });
                        }
                    }
                }
            }
            $scope.availableSortedColumns = [];
            $scope.selectedSortedColumns = [];
            $.map($scope.selectedColumns, function (item, index) {
                var checkifcolexists = $filter('filter')($scope.availableSortedColumns, { text: item.text }, true);
                if (checkifcolexists.length === 0) {
                    $scope.availableSortedColumns.push(item);
                }
            });

            $scope.selectedSortedValue = [];
            if ($window.localStorage) {
                $window.localStorage.setItem("inbox.sortColumnSetting", JSON.stringify({
                    availableSortedColumns: $scope.availableSortedColumns,
                    selectedSortedColumns: $scope.selectedSortedColumns
                }));
            }



        }
        $scope.checkIfProcessEditable = function () {
            var isprocesspriorityeditable = false;
            var isinspectionminuteeditable = false;
            var validsiteoptions = dataLayerService.getSiteOptions();
            if (validsiteoptions === undefined) {
                dataLayerService.getValidSiteMobileOption().then(function (result) {
                    var validsiteoptions = result;
                    var checkifprocesseditable = $filter('filter')(validsiteoptions, { optionkey: "Editable process priority in Inbox" }, true);
                    if (checkifprocesseditable && checkifprocesseditable.length > 0) {
                        var keyvalue = checkifprocesseditable[0].optionvalue;
                        if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                            isprocesspriorityeditable = true;

                        }
                    }
                    var checkifprocesspriorityeditable = $filter('filter')(validsiteoptions, { optionkey: "Editable inspection minute in Inbox" }, true);
                    if (checkifprocesspriorityeditable && checkifprocesspriorityeditable.length > 0) {
                        var keyvalue = checkifprocesspriorityeditable[0].optionvalue;
                        if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                            isinspectionminuteeditable = true;
                        }
                    }
                    $scope.defaultCustomInboxColumn(isprocesspriorityeditable, isinspectionminuteeditable);
                });

            } else {
                var checkifprocesseditable = $filter('filter')(validsiteoptions, { optionkey: "Editable process priority in Inbox" }, true);
                if (checkifprocesseditable && checkifprocesseditable.length > 0) {
                    var keyvalue = checkifprocesseditable[0].optionvalue;
                    if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                        isprocesspriorityeditable = true;

                    }
                }
                var checkifprocesspriorityeditable = $filter('filter')(validsiteoptions, { optionkey: "Editable inspection minute in Inbox" }, true);
                if (checkifprocesspriorityeditable && checkifprocesspriorityeditable.length > 0) {
                    var keyvalue = checkifprocesspriorityeditable[0].optionvalue;
                    if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                        isinspectionminuteeditable = true;
                    }
                }
                $scope.defaultCustomInboxColumn(isprocesspriorityeditable, isinspectionminuteeditable);
            }
        }

        $scope.checkIfProcessEditable();

        $scope.resetCustomizeInboxColumn = function () {
            $window.localStorage.setItem("inbox.columnsSetting", "");

            var isprocesspriorityeditable = false;
            var isinspectionminuteeditable = false;
            var validsiteoptions = dataLayerService.getSiteOptions();
            if (validsiteoptions === undefined || validsiteoptions === null || validsiteoptions === "") {
                dataLayerService.getValidSiteMobileOption().then(function (result) {
                    var validsiteoptions = result;
                    var checkifprocesseditable = $filter('filter')(validsiteoptions, { optionkey: "Editable process priority in Inbox" }, true);
                    if (checkifprocesseditable && checkifprocesseditable.length > 0) {
                        var keyvalue = checkifprocesseditable[0].optionvalue;
                        if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                            isprocesspriorityeditable = true;
                        }
                    }
                    var checkifprocesspriorityeditable = $filter('filter')(validsiteoptions, { optionkey: "Editable inspection minute in Inbox" }, true);
                    if (checkifprocesspriorityeditable && checkifprocesspriorityeditable.length > 0) {
                        var keyvalue = checkifprocesspriorityeditable[0].optionvalue;
                        if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                            isinspectionminuteeditable = true;
                        }
                    }

                    $scope.availableColumns = [{ text: "Folder Type", value: "folderType", ischecked: false, columns: 6 },
                                       { text: "FolderRSN", value: "folderRSN", ischecked: false, columns: 4 },
                                       { text: "ProcessRSN", value: "processRSN", ischecked: false, columns: 4 },
                                       { text: "Process Priority", value: "processPriority", ischecked: false, columns: 2, isEditable: isprocesspriorityeditable },
                                       { text: "Inspection Minute", value: "inspMinute", ischecked: false, columns: 2, isEditable: isinspectionminuteeditable }];
                });

            } else {
                var checkifprocesseditable = $filter('filter')(validsiteoptions, { optionkey: "Editable process priority in Inbox" }, true);
                if (checkifprocesseditable && checkifprocesseditable.length > 0) {
                    var keyvalue = checkifprocesseditable[0].optionvalue;
                    if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                        isprocesspriorityeditable = true;
                    }
                }
                var checkifprocesspriorityeditable = $filter('filter')(validsiteoptions, { optionkey: "Editable inspection minute in Inbox" }, true);
                if (checkifprocesspriorityeditable && checkifprocesspriorityeditable.length > 0) {
                    var keyvalue = checkifprocesspriorityeditable[0].optionvalue;
                    if (keyvalue && (keyvalue.toUpperCase() === "YES" || keyvalue === "Y")) {
                        isinspectionminuteeditable = true;
                    }
                }

                $scope.availableColumns = [{ text: "Folder Type", value: "folderType", ischecked: false, columns: 6 },
                                       { text: "FolderRSN", value: "folderRSN", ischecked: false, columns: 4 },
                                       { text: "ProcessRSN", value: "processRSN", ischecked: false, columns: 4 },
                                       { text: "Process Priority", value: "processPriority", ischecked: false, columns: 2, isEditable: isprocesspriorityeditable },
                                       { text: "Inspection Minute", value: "inspMinute", ischecked: false, columns: 2, isEditable: isinspectionminuteeditable }];
            }



            $scope.selectedColumns = [
                { text: "FolderNumber", value: "folderNumber", ischecked: false, columns: 8 },
                { text: "Process Type", value: "processType", ischecked: false, columns: 8 },
                { text: "Schedule Date", value: "scheduleDate", ischecked: false, columns: 4 },
                { text: "Folder Status", value: "folderStatus", ischecked: false, columns: 4 },
                { text: "Property Address", value: "propertyAddress", ischecked: false, columns: 12 },
                { text: "Process Comment", value: "processComment", ischecked: false, columns: 12 }
            ];

            // Reset the sort order if the display fields reset.
            $scope.resetInboxSortOrder();
        }

        /*sortable*/

        // clsoing Overlay
        $scope.ClosePanel = function () {
            angular.element(".overlay").stop().show().animate({
                left: "-100%",
                display: "block"
            }, 0);
            $scope.closeBtn();
            $scope.isInbox = true;
        };

        angular.element("#scrolltoup").click(function () {

            angular.element('.mCSB_container').animate({
                top: 0
            }, "100");

        });


        /* Start Filter and Search Implementation*/
        $scope.filters = {
            searchExactMatch: "",
            searchAllOfThese: "",
            searchAnyOfThese: ""
        };

        //Folder Search filter
        $scope.clearSearchText = function () {
            $scope.folderSearchCriteria.searchText = ""
        };
        $scope.numPerPage = 10,
        $scope.maxSize = 5;
        $scope.bigTotalItems = 1;
        $scope.bigCurrentPage = 1;
        $scope.folderSearchCriteria = {
            startIndex: 0,
            endIndex: 10,
            searchText: ""
        };

        $scope.onFolderSearch = function (value) {
            var docHeight = $(document).height();
            var topHeaderheight = angular.element("#topheader").outerHeight();
            var inboxHeaderHeight = angular.element("#inboxheader").outerHeight();
            var footerHeight = 10;//angular.element("#footer").outerHeight();
            var searchcriteriaHeight = angular.element("#searchrow").outerHeight();
            var navigationHeight = angular.element("#navigatePages").outerHeight();
            var heighttoset = docHeight - (topHeaderheight + inboxHeaderHeight + footerHeight + searchcriteriaHeight + navigationHeight + 7);
            angular.element(".scroll-3").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });


            $scope.listSearchedItems = [];
            angular.element("#navigatePages").css({
                display: "none"
            });
            // Focus out the search text box
            document.activeElement.blur();

            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to search folder.</br> Please connect to network and try again", 'error');
                return;
            }

            // Call login before searching any data.
            utilService.showError("Search in progress.", 'info');
            var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
            if ($.isArray(storedUser) && storedUser.length > 0) {
                $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                $scope.password = storedUser[0].password;
                requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, function (result) {
                    if (result.error == null) {
                        if (result.response) {
                            if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0) {
                                utilService.showError("Authentication failed due to invalid UserID/Password.</br> Please logoff and login again.", 'error');
                            } else if (result.response.lid.indexOf("Error") < 0) {
                                $scope.userSettings = [];
                                $scope.userSettings.push({
                                    username: $scope.username,
                                    password: $scope.password,
                                    lid: result.response.lid,
                                    validuser: result.response.validUser
                                });
                                CommonService.setLoggedUser($scope.username);
                                localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));
                                utilService.showError("Search in progress.", 'info');
                                syncHelperService.SearchFolderFullText(function (result) {
                                    if (result && result.data != null) {
                                        var data = result.data;
                                        if (!angular.isArray(data)) {
                                            data = [result.data];
                                        }
                                        if (data.length > 0) {
                                            $scope.bigTotalItems = data[0].totalcount;
                                            if (data[0].totalcount > $scope.numPerPage) {
                                                angular.element("#navigatePages").css({
                                                    display: "block"
                                                });
                                            }
                                            //angular.element("#searchList").addClass("whiteBorder");

                                            for (var i = 0; i < data.length; i++) {
                                                $scope.listSearchedItems.push({
                                                    folderHeader: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                                    folderStatus: data[i].statusdesc,
                                                    folderRSN: data[i].folderrsn,
                                                    folderType: data[i].foldertype,
                                                    folderDescription: data[i].folderdescription,
                                                    folderName: data[i].foldername,
                                                    folderAddress: data[i].propertylocation,
                                                    folderSubType: data[i].subcode,
                                                    folderWorkType: data[i].workcode,
                                                    folderCondition: data[i].foldercondition,
                                                    parentRSN: data[i].parentrsn,
                                                    propertyRSN: data[i].propertyrsn,
                                                    statusCode: data[i].statuscode,
                                                    referenceFile: data[i].referencefile,
                                                    inDate: data[i].indate,
                                                    expiryDate: data[i].expirydate,
                                                    finalDate: data[i].finaldate,
                                                    folderCentury: data[i].foldercentury,
                                                    folderRevision: data[i].folderrevision,
                                                    folderSection: data[i].foldersection,
                                                    folderSequence: data[i].foldersequence,
                                                    folderYear: data[i].folderyear,
                                                    folderDesc: data[i].folderdesc
                                                });
                                            }
                                        } else {
                                            utilService.showError('No folder record found with search text "' + $scope.folderSearchCriteria.searchText + '"', "info");
                                        }

                                    } else {
                                        utilService.showError('No folder record found with search text "' + $scope.folderSearchCriteria.searchText + '"', "info");
                                    }

                                    // Call logoff request
                                    requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                        utilService.logtoConsole("logoff response: " + result.response);
                                    }, "json");


                                }, this, $scope.folderSearchCriteria.searchText, $scope.folderSearchCriteria.startIndex, $scope.folderSearchCriteria.endIndex);

                            }
                        }
                    }
                }, "json");
            } else {
                utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
            }
        };


        $scope.$watch('bigCurrentPage + numPerPage', function () {
            if ($scope.folderSearchCriteria.searchText !== "") {

                $scope.folderSearchCriteria.startIndex = (($scope.bigCurrentPage - 1) * $scope.numPerPage), $scope.folderSearchCriteria.endIndex = $scope.numPerPage;
                $scope.listSearchedItems = [];

                // Call login before searching any data.
                var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
                if ($.isArray(storedUser) && storedUser.length > 0) {
                    $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                    $scope.password = storedUser[0].password;
                    requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, function (result) {
                        if (result.error == null) {
                            if (result.response) {
                                if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0) {
                                    utilService.showError("Unable to get next record due to invalid UserID/Password.</br> Please logoff and login again.", 'error');
                                } else if (result.response.lid.indexOf("Error") < 0) {
                                    $scope.userSettings = [];
                                    $scope.userSettings.push({
                                        username: $scope.username,
                                        password: $scope.password,
                                        lid: result.response.lid,
                                        validuser: result.response.validUser
                                    });
                                    CommonService.setLoggedUser($scope.username);
                                    localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));
                                    syncHelperService.SearchFolderFullText(function (result) {
                                        if (result && result.data != null) {
                                            var data = result.data;
                                            if (!angular.isArray(data)) {
                                                data = [result.data];
                                            }
                                            if (data.length > 0) {
                                                $scope.bigTotalItems = data[0].totalcount;
                                                if (data[0].totalcount > 10) {
                                                    angular.element("#navigatePages").css({
                                                        display: "block"
                                                    });
                                                }

                                                for (var i = 0; i < data.length; i++) {
                                                    $scope.listSearchedItems.push({
                                                        folderHeader: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                                        folderStatus: data[i].statusdesc,
                                                        folderRSN: data[i].folderrsn,
                                                        folderType: data[i].foldertype,
                                                        folderDescription: data[i].folderdescription,
                                                        folderName: data[i].foldername,
                                                        folderAddress: data[i].propertylocation,
                                                        folderSubType: data[i].subcode,
                                                        folderWorkType: data[i].workcode,
                                                        folderCondition: data[i].foldercondition,
                                                        parentRSN: data[i].parentrsn,
                                                        propertyRSN: data[i].propertyrsn,
                                                        statusCode: data[i].statuscode,
                                                        referenceFile: data[i].referencefile,
                                                        inDate: data[i].indate,
                                                        expiryDate: data[i].expirydate,
                                                        finalDate: data[i].finaldate,
                                                        folderCentury: data[i].foldercentury,
                                                        folderRevision: data[i].folderrevision,
                                                        folderSection: data[i].foldersection,
                                                        folderSequence: data[i].foldersequence,
                                                        folderYear: data[i].folderyear,
                                                        folderDesc: data[i].folderdesc
                                                    });
                                                }
                                            } else {
                                                utilService.showError("No folder record found with search text " + $scope.folderSearchCriteria.searchText, "info");
                                            }

                                        } else {
                                            utilService.showError("No folder record found with search text " + $scope.folderSearchCriteria.searchText, "info");
                                        }

                                        // Call logoff request
                                        requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                            utilService.logtoConsole("logoff response: " + result.response);
                                        }, "json");

                                    }, this, $scope.folderSearchCriteria.searchText, $scope.folderSearchCriteria.startIndex, $scope.folderSearchCriteria.endIndex);
                                }
                            }
                        }
                    }, "json");
                } else {
                    utilService.showError("Unable to get next record due to invalid UserID/Password.</br> Please logoff and login again.", 'error');
                }




            }
        });


        //InBox/Outbox Search filter
        $scope.onInboxOutboxFilter = function (value) {
            cfpLoadingBar.start();
            var currentuser = "";
            var storedUser = JSON.parse(localStorage.getItem("userSettings"));
            if ($.isArray(storedUser) && storedUser.length > 0) {
                currentuser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
            }
            var startDate = "", endDate = "", date;
            //Check from where request is comming
            if (value === "today") {
                startDate = new Date();
                startDate.setHours(0);
                startDate.setMinutes(0);
                startDate.setSeconds(0);
                startDate.setMilliseconds(0);
                endDate = new Date();
                endDate.setHours(23);
                endDate.setMinutes(59);
                endDate.setSeconds(59);
                startDate = utilService.dateformat(startDate, "Ymd h:i:s");
                endDate = utilService.dateformat(endDate, "Ymd H:i:s");
            } else if (value === "week") {
                startDate = new Date();
                var dayofweek = startDate.getDay();
                startDate.setDate(startDate.getDate() - dayofweek);
                startDate.setHours(0);
                startDate.setMinutes(0);
                startDate.setSeconds(0);
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23);
                endDate.setMinutes(59);
                endDate.setSeconds(59);
                startDate = utilService.dateformat(startDate, "Ymd h:i:s");
                endDate = utilService.dateformat(endDate, "Ymd H:i:s");
            } else if (value === "month") {
                startDate = new Date();
                startDate.setDate(1);
                startDate.setHours(0);
                startDate.setMinutes(0);
                startDate.setSeconds(0);
                endDate = new Date();
                endDate.setMonth(startDate.getMonth() + 1);
                endDate.setDate(1);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23);
                endDate.setMinutes(59);
                endDate.setSeconds(59);
                startDate = utilService.dateformat(startDate, "Ymd h:i:s");
                endDate = utilService.dateformat(endDate, "Ymd H:i:s");
            }
            if ($scope.toggleinboxdiv === false) {
                $scope.emptyItems("inbox");
                $rootScope.$broadcast("NoDirectionFound");
                angular.element("#navigateInboxPages").css({
                    display: "none"
                });
                $scope.numPerPageInbox = 5;
                $scope.maxInboxSize = 3;
                $scope.bigTotalInboxItems = 0;
                $scope.bigInboxCurrentPage = 1;

                dataLayerService.getinboxlist(startDate, endDate, currentuser).then(function (result) {
                    var data = result.data;
                    if (data != null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var strScheduleendDate = '';
                            var strScheduleDate = '';
                            strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                            strScheduleendDate = (data[i].scheduleenddate != "" && data[i].scheduleenddate != null) ? moment(data[i].scheduleenddate).format(dateformat) : "";
                            var formattedaddress = CommonService.getformattedAddress(data[i]);
                            $scope.listInbox.push({
                                folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                processType: data[i].processdesc,
                                processTypeCode: data[i].processcode,
                                scheduleDate: strScheduleDate,
                                scheduleEndDate: strScheduleendDate,
                                folderStatus: data[i].statusdesc,
                                processComment: data[i].processcomment,
                                folderRSN: data[i].folderrsn,
                                propertyRSN: data[i].propertyrsn,
                                propertyAddress: formattedaddress,
                                processRSN: data[i].processrsn,
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                                isInboxDisabled: false,
                                processPriority: data[i].priority,
                                inspMinute: data[i].inspminute,
                                isFailed: data[i].isfailed
                            });

                            //$scope.listInbox.sort(function (a, b) { return b.processPriority - a.processPriority });

                        }
                        cfpLoadingBar.complete();
                    }
                    else {
                        utilService.showError("No items in inbox.", "info");
                        cfpLoadingBar.complete();
                    }
                    if (data.length > $scope.numPerPageInbox) {
                        $scope.bigTotalInboxItems = data.length;
                        angular.element("#navigateInboxPages").css({
                            display: "block"
                        });
                    }
                   
                    $timeout(function (items) {
                        var validsiteoptions = dataLayerService.getSiteOptions();
                        var defaultCountry = $filter('filter')(validsiteoptions, { optionkey: "Default Country" }, true);
                        if (defaultCountry && defaultCountry.length > 0) {
                            CommonService.broadcastInboxLoaded({ inboxitems: $scope.listInbox, defaultcountry: defaultCountry[0].optionvalue });
                        }
                        $scope.checkIfProcessEditable();
                    }, 200, false, $scope.listInbox);

                });
            }
            else if ($scope.toggleprojectview === true) {
                angular.element("#navigateProjectPages").css({
                    display: "none"
                });
                $scope.numPerPageProject = 5;
                $scope.maxProjectSize = 3;
                $scope.bigTotalProjectItems = 0;
                $scope.bigProjectCurrentPage = 1;
                $scope.emptyItems("projectview");
                dataLayerService.getinboxlist(startDate, endDate, currentuser).then(function (result) {
                    var data = result.data;
                    $scope.listProjectView = [];
                    $scope.listInbox = [];
                    //$scope.projectviewsectionall = false;
                    if (data != null && data.length > 0) {

                        for (var i = 0; i < data.length; i++) {
                            var strScheduleendDate = '';
                            var strScheduleDate = '';
                            strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                            strScheduleendDate = (data[i].scheduleenddate != "" && data[i].scheduleenddate != null) ? moment(data[i].scheduleenddate).format(dateformat) : "";
                            var formattedaddress = CommonService.getformattedAddress(data[i]);
                            $scope.listInbox.push({
                                folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                processType: data[i].processdesc,
                                processTypeCode: data[i].processcode,
                                scheduleDate: strScheduleDate,
                                scheduleEndDate: strScheduleendDate,
                                folderStatus: data[i].statusdesc,
                                processComment: data[i].processcomment,
                                folderRSN: data[i].folderrsn,
                                propertyRSN: data[i].propertyrsn,
                                propertyAddress: formattedaddress,
                                processRSN: data[i].processrsn,
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                                isInboxDisabled: false,
                                inspMinute: data[i].inspminute,
                                processPriority: data[i].priority,
                                isFailed: data[i].isfailed
                            });

                        }

                        //$scope.listInbox.sort(function (a, b) { return b.processPriority - a.processPriority });

                        var collapseId = 0;
                      
                        for (var i = 0; i < $scope.listInbox.length; i++) {
                            var groupbyfield = $scope.listInbox[i].folderRSN;
                            var foldernumber = $scope.listInbox[i].folderNumber;
                            var inspminute = ($scope.listInbox[i].inspMinute === null || $scope.listInbox[i].inspMinute === undefined || $scope.listInbox[i].inspMinute === "") ? 0 : $scope.listInbox[i].inspMinute;
                            var grp = $.grep($scope.listProjectView, function (n, idx) {
                                if (n.key === groupbyfield) return n;
                            });

                            if (grp.length > 0) {
                                grp[0].items.push($scope.listInbox[i]);
                                grp[0].itemlength = grp[0].items.length;
                                grp[0].totalMinCount += inspminute;
                            } else {
                                $scope.listProjectView.push({ key: groupbyfield,totalMinCount:inspminute, folderNumber: foldernumber, items: [$scope.listInbox[i]], dataCollapse: collapseId, itemlength: 1, isFolderSelected: false, isFolderDisabled: false });
                                collapseId++;
                            }
                        }

                        if ($scope.listProjectView.length > $scope.numPerPageProject) {
                            $scope.bigTotalProjectItems = $scope.listProjectView.length;
                            angular.element("#navigateProjectPages").css({
                                display: "block"
                            });
                        }
                        cfpLoadingBar.complete();


                    }
                    else {
                        utilService.showError("No items in project view.", "info");
                        cfpLoadingBar.complete();
                    }
                    $timeout(function (items) {
                        var validsiteoptions = dataLayerService.getSiteOptions();
                        var defaultCountry = $filter('filter')(validsiteoptions, { optionkey: "Default Country" }, true);
                        if (defaultCountry && defaultCountry.length > 0) {
                            CommonService.broadcastInboxLoaded({ inboxitems: $scope.listInbox, defaultcountry: defaultCountry[0].optionvalue });
                        }
                        $scope.checkIfProcessEditable();
                    }, 200, false, $scope.listInbox);
                });
            }
            else if ($scope.toggleoutboxdiv === true) {
                $scope.emptyItems("outbox");
                angular.element("#navigateOutboxPages").css({
                    display: "none"
                });
                $scope.numPerPageOutbox = 5;
                $scope.maxOutboxSize = 3;
                $scope.bigTotalOutboxItems = 0;
                $scope.bigOutboxCurrentPage = 1;
                dataLayerService.getoutboxlist(startDate, endDate, currentuser).then(function (result) {
                    var data = result.data;
                    if (data != null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var strScheduleDate = '';
                            strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                            var formattedaddress = CommonService.getformattedAddress(data[i]);
                            $scope.listOutbox.push({
                                folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                processType: data[i].processdesc,
                                scheduleDate: strScheduleDate,
                                folderStatus: data[i].statusdesc,
                                processComment: data[i].processcomment,
                                folderRSN: data[i].folderrsn,
                                processRSN: data[i].processrsn,
                                propertyRSN: data[i].propertyrsn,
                                propertyAddress: formattedaddress,
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                                processPriority: data[i].priority,
                                inspMinute: data[i].inspminute,
                                isFailed: data[i].isfailed
                            });

                        }
                        cfpLoadingBar.complete();
                    }
                    else {
                        utilService.showError("No items in outbox.", "info");
                        cfpLoadingBar.complete();
                    }
                    if (data.length > $scope.numPerPageOutbox) {
                        $scope.bigTotalOutboxItems = data.length;
                        angular.element("#navigateOutboxPages").css({
                            display: "block"
                        });
                    }
                });
            }
            var docHeight = $(document).height();
            var topHeaderheight = angular.element("#topheader").height();
            var inboxHeaderHeight = angular.element("#inboxheader").height();
            var footerHeight = 10;// angular.element("#footer").height();
            var navigateInboxPagesHeight = angular.element("#navigateInboxPages").height();
            var navigateOutboxPagesHeight = angular.element("#navigateOutboxPages").height();
            var heighttoset = docHeight - (topHeaderheight + inboxHeaderHeight + footerHeight + navigateInboxPagesHeight);
            angular.element(".scroll-2").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });


        };
        /* End Filter and Search Implementation*/
        $scope.togglesearchsectiondiv = false;
        $scope.toggleinboxdiv = false;
        $scope.toggleprojectview = false;
        $scope.toggleoutboxdiv = false;
        $scope.togglefilter = false;
        $scope.preventDefaultAction = function () {
            event.preventDefault();
            event.stopPropagation();
        }
        //InboxList
        $scope.ItemsPerPageList = [{ text: 5, value: 5 }, { text: 10, value: 10 }, { text: 15, value: 15 }, { text: 20, value: 20 }]
        $scope.isInbox = true;
        $scope.selectedNumPerPageInbox = $scope.ItemsPerPageList[0];
        $scope.numPerPageInbox = 5;
        $scope.maxInboxSize = 3;
        $scope.bigTotalInboxItems = 0;
        $scope.bigInboxCurrentPage = 1;
        $scope.changeInboxItemPerPage = function (item) {
            $scope.numPerPageInbox = item.value;
        }
        $scope.showInboxList = function (isfirsttime) {
            cfpLoadingBar.start();
            $timeout(function () {
                $scope.isInbox = true;
                $scope.currentview = "Inbox";
                $scope.emptyItems("inbox");
                $rootScope.$broadcast("NoDirectionFound");
                angular.element("#navigateInboxPages").css({
                    display: "none"
                });
                $scope.numPerPageInbox = 5;
                $scope.maxInboxSize = 3;
                $scope.bigTotalInboxItems = 0;
                $scope.bigInboxCurrentPage = 1;

                $scope.listInbox = [];
                var startDate = "", endDate = "";
                var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                if ($.isArray(storedUser) && storedUser.length > 0) {
                    $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                    $scope.password = storedUser[0].password;
                } else {
                    utilService.showError("Please log off the Inspector App and login again.", 'info');
                    return;
                }
                dataLayerService.getinboxlist(startDate, endDate, $scope.username).then(function (result) {
                    $scope.listInbox = [];
                    var data = result.data;
                    if (data != null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var strScheduleendDate = '';
                            var strScheduleDate = '';
                            strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                            strScheduleendDate = (data[i].scheduleenddate != "" && data[i].scheduleenddate != null) ? moment(data[i].scheduleenddate).format(dateformat) : "";
                            var formattedaddress = CommonService.getformattedAddress(data[i]);
                            $scope.listInbox.push({
                                folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                processType: data[i].processdesc,
                                processTypeCode: data[i].processcode,
                                scheduleDate: strScheduleDate,
                                scheduleEndDate: strScheduleendDate,
                                folderStatus: data[i].statusdesc,
                                processComment: data[i].processcomment,
                                folderRSN: data[i].folderrsn,
                                processRSN: data[i].processrsn,
                                propertyRSN: data[i].propertyrsn,
                                propertyAddress: formattedaddress,
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                                isInboxDisabled: false,
                                processPriority: data[i].priority,
                                inspMinute: data[i].inspminute,
                                isFailed: data[i].isfailed
                            });
                        }
                        $timeout(function (items) {
                            var validsiteoptions = dataLayerService.getSiteOptions();
                            var defaultCountry = $filter('filter')(validsiteoptions, { optionkey: "Default Country" }, true);
                            if (defaultCountry && defaultCountry.length > 0) {
                                CommonService.broadcastInboxLoaded({ inboxitems: $scope.listInbox, defaultcountry: defaultCountry[0].optionvalue });
                            }
                            $scope.checkIfProcessEditable();


                        }, 200, false, $scope.listInbox);
                        cfpLoadingBar.complete();
                        if (data.length > $scope.numPerPageInbox) {
                            $scope.bigTotalInboxItems = data.length;
                        }

                    } else {
                        utilService.showError("No items in inbox.", "info");
                        cfpLoadingBar.complete();
                    }
                    if (data.length > $scope.numPerPageInbox) {
                        angular.element("#navigateInboxPages").css({
                            display: "block"
                        });
                    }
                });
                if (isfirsttime) {
                    $scope.checkIfProcessEditable();
                }
                $scope.togglesearchsectiondiv = false;
                $scope.toggleinboxdiv = false;
                $scope.toggleoutboxdiv = false;
                $scope.togglefilter = false;
                $scope.toggleprojectview = false;
            });


        };

        $scope.eaiRequestResponse = null;
        $scope.requestOrResponse = null;
        //Outbox List
        $scope.selectedNumPerPageOutbox = $scope.ItemsPerPageList[0];
        $scope.numPerPageOutbox = 5;
        $scope.maxOutboxSize = 3;
        $scope.bigTotalOutboxItems = 0;
        $scope.bigOutboxCurrentPage = 1;
        $scope.changeOutboxItemPerPage = function (item) {
            $scope.numPerPageOutbox = item.value;
        }
        $scope.showOutboxList = function () {
            cfpLoadingBar.start();
            $timeout(function () {
                // var starttime = new Date();
                $scope.currentview = "Outbox";
                $scope.isInbox = false;
                $scope.emptyItems('outbox');
                $rootScope.$broadcast("NoDirectionFound");
                angular.element("#navigateOutboxPages").css({
                    display: "none"
                });
                $scope.listOutbox = [];
                $scope.numPerPageOutbox = 5;
                $scope.maxOutboxSize = 3;
                $scope.bigTotalOutboxItems = 0;
                $scope.bigOutboxCurrentPage = 1;

                var startDate = "", endDate = "", currentuser = "";
                var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                if ($.isArray(storedUser) && storedUser.length > 0) {
                    currentuser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                }
                dataLayerService.getoutboxlist(startDate, endDate, currentuser).then(function (result) {
                    var data = result.data;
                    $scope.listOutbox = [];
                    if (data != null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var strScheduleDate = '';
                            strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                            var formattedaddress = CommonService.getformattedAddress(data[i]);
                            $scope.listOutbox.push({
                                folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                processType: data[i].processdesc,
                                processTypeCode: data[i].processcode,
                                scheduleDate: strScheduleDate,
                                folderStatus: data[i].statusdesc,
                                processComment: data[i].processcomment,
                                folderRSN: data[i].folderrsn,
                                processRSN: data[i].processrsn,
                                propertyRSN: data[i].propertyrsn,
                                propertyAddress: formattedaddress,
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                                processPriority: data[i].priority,
                                inspMinute: data[i].inspminute,
                                isFailed: data[i].isfailed
                            });
                        }
                        cfpLoadingBar.complete();

                    } else {
                        utilService.showError("No items in outbox.", "info");
                        cfpLoadingBar.complete();
                    }
                    if (data.length > $scope.numPerPageOutbox) {
                        $scope.bigTotalOutboxItems = data.length;
                        angular.element("#navigateOutboxPages").css({
                            display: "block"
                        });
                    }
                });
                $scope.togglesearchsectiondiv = false;
                $scope.toggleinboxdiv = true;
                $scope.toggleoutboxdiv = true;
                $scope.togglefilter = false;
                $scope.toggleprojectview = false;
            });

        };

        $scope.showSearchSection = function () {
            $scope.currentview = "Search";
            $scope.emptyItems('search');
            $scope.isInbox = false;
            $scope.togglesearchsectiondiv = true;
            $scope.toggleinboxdiv = true;
            $scope.toggleoutboxdiv = false;
            $scope.togglefilter = true;
            $scope.toggleprojectview = false;
            //this is used to make navigation
            $rootScope.$broadcast("NoDirectionFound");
            angular.element('#navigation ul').addClass("pagination");
            angular.element('#navigation').removeClass("pagination");
            $scope.folderSearchCriteria.searchText = "";
            //$scope.showMessage("Welcome");
        };

        $scope.selectedNumPerPageProject = $scope.ItemsPerPageList[0];
        $scope.numPerPageProject = 5;
        $scope.maxProjectSize = 3;
        $scope.bigTotalProjectItems = 0;
        $scope.bigProjectCurrentPage = 1;
        $scope.changeProjectItemPerPage = function (item) {
            $scope.numPerPageProject = item.value;
        }
        $scope.showProjectViewSection = function () {
            cfpLoadingBar.start();
            angular.element("#navigateProjectPages").css({
                display: "none"
            });
            $rootScope.$broadcast("NoDirectionFound");
            $scope.currentview = "Project";
            $scope.isInbox = false;
            $scope.togglesearchsectiondiv = false;
            $scope.toggleinboxdiv = true;
            $scope.toggleoutboxdiv = false;
            $scope.togglefilter = true;
            $scope.toggleprojectview = true;
            $scope.listProjectView = [];
            //$scope.showMessage("Welcome");
            if ($scope.listInbox.length > 0) {
                var collapseId = 0;
                for (var i = 0; i < $scope.listInbox.length; i++) {
                    var groupbyfield = $scope.listInbox[i].folderRSN;
                    var foldernumber = $scope.listInbox[i].folderNumber;
                    $scope.listInbox[i].isMultiSignOffSelected = false;
                    $scope.listInbox[i].isOutboxSelected = false;
                    $scope.listInbox[i].isInboxSelected = false;
                    var inspminute = ($scope.listInbox[i].inspMinute === null || $scope.listInbox[i].inspMinute === undefined || $scope.listInbox[i].inspMinute === "") ? 0 : $scope.listInbox[i].inspMinute;
                    var grp = $.grep($scope.listProjectView, function (n, idx) {
                        if (n.key === groupbyfield) return n;
                    });

                    if (grp.length > 0) {
                        grp[0].items.push($scope.listInbox[i]);
                        grp[0].itemlength = grp[0].items.length;
                        grp[0].totalMinCount += inspminute;
                    } else {
                        $scope.listProjectView.push({ key: groupbyfield, totalMinCount: inspminute, folderNumber: foldernumber, items: [$scope.listInbox[i]], dataCollapse: collapseId, itemlength: 1, isFolderSelected: false, isFolderDisabled: false });
                        collapseId++;
                    }
                }
                //$scope.listProjectView.sort(function (a, b) { return b.folderNumber - a.folderNumber });
               
                if ($scope.listProjectView.length > $scope.numPerPageProject) {
                    $scope.bigTotalProjectItems = $scope.listProjectView.length;
                    angular.element("#navigateProjectPages").css({
                        display: "block"
                    });
                }

            }
            cfpLoadingBar.complete();
        };

        // On Inspection Item Tap
        $scope.propertySummerySection = false;
        $scope.peopleSummerySection = false;
        $scope.folderinfosection = false;
        $scope.checklistsection = false;
        $scope.folderprocessinfosection = false;
        $scope.showAddInspections = false;

        $scope.validclausegroup = [];
        $scope.showhistorydetails = false;

        $scope.shoInbox = function () {
            var docHeight = $(document).height();
            var topHeaderheight = angular.element("#topheader").height();
            var inboxHeaderHeight = angular.element("#inboxheader").height();
            var footerHeight = 10;//angular.element("#footer").height();
            var heighttoset = docHeight - (topHeaderheight + footerHeight + inboxHeaderHeight + 15);
            angular.element(".scroll-in").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });
            angular.element('.shoInbox').animate({

                left: '0px',

            });
        };

        $scope.closeBtn = function () {
            angular.element('.shoInbox').stop().show().animate({
                left: '-100%',
                display: 'block'

            });
        };

        $scope.validFolderStatusList = [];
        $scope.validPropertyStatusList = [];
        $scope.validPeopleStatusList = [];
        $scope.folderTypeList = [];
        $scope.folderSubTypeList = [];
        $scope.workTypeList = [];
        $scope.ProcessTypeList = [];
        $scope.peopleTypeList = [];
        $scope.propertyTypeList = [];

        $scope.selectSearchFolder = function (searchBoxItem) {
            $scope.searchBoxItem = searchBoxItem;

            $scope.validFolderStatusList = [];
            $scope.validPropertyStatusList = [];
            $scope.validPeopleStatusList = [];
            $scope.folderTypeList = [];
            $scope.folderSubTypeList = [];
            $scope.workTypeList = [];
            $scope.ProcessTypeList = [];
            $scope.peopleTypeList = [];
            $scope.propertyTypeList = [];

            $scope.AttemptHistoryList = [];
            $scope.attachmentInfoList = [];
            $scope.FolderDetails = [];
            $scope.PropertyDetails = [];
            $scope.FolderInfoDetails = [];
            $scope.PeopleDetails = [];
            $scope.attachmentcount = "";
            $scope.historycount = "";
            var ovarlayHeight = 0;
            var tabbarheight = 0;

            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to get folder detail.</br> Please connect to network and try again", 'error');
                return;
            }
            // Call login before searching any data.
            var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
            if ($.isArray(storedUser) && storedUser.length > 0) {
                $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                $scope.password = storedUser[0].password;
                requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, function (result) {
                    if (result.error == null) {
                        if (result.response) {
                            if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0) {
                                utilService.showError("Unable to get folder detail due to invalid UserID/Password.</br> Please logoff and login again.", 'error');
                            } else if (result.response.lid.indexOf("Error") < 0) {
                                $scope.userSettings = [];
                                $scope.userSettings.push({
                                    username: $scope.username,
                                    password: $scope.password,
                                    lid: result.response.lid,
                                    validuser: result.response.validUser
                                });
                                CommonService.setLoggedUser($scope.username);
                                localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));

                                syncHelperService.getFolderDataByFolderRSN(function (result) {

                                    if (result.data != null && result.data.folder != null && result.data.folder != undefined) {
                                        var foldertype = null;//result.data.folder.foldertype;
                                        var subcode = null;//result.data.folder.subcode;
                                        var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
                                        if (storedSettings != undefined && storedSettings !== "") {
                                            var a6compatibility = storedSettings[0].isA6Compatible;
                                            if (a6compatibility) {
                                                foldertype = result.data.folder.foldertype;
                                                subcode = result.data.folder.subcode;
                                            } else {
                                                foldertype = result.data.folder.FolderType;
                                                subcode = result.data.folder.SubCode;
                                            }
                                        }


                                        $scope.SignatureTypeList = [];
                                        dataLayerService.getProcessAttemptSignature().then(function (result) {
                                            if (result.data != null && result.data.length > 0) {
                                                var arrData = result.data[0].optionvalue.split(";");
                                                for (var i = 0; i < arrData.length; i++) {
                                                    $scope.SignatureTypeList.push({ value: arrData[i], name: arrData[i] });
                                                }

                                            }
                                        });

                                        dataLayerService.getFolderType().then(function (resultFolderType) {
                                            if (resultFolderType.data != null) {
                                                $scope.folderTypeList = [];
                                                for (var i = 0; i < resultFolderType.data.length; i++) {
                                                    $scope.folderTypeList.push({
                                                        value: resultFolderType.data[i].foldertype,
                                                        name: resultFolderType.data[i].folderdesc
                                                    });
                                                }
                                            }
                                            return dataLayerService.getFolderSubType(foldertype);
                                        }).then(function (resultFolderSubType) {
                                            if (resultFolderSubType.data != null) {
                                                $scope.folderSubTypeList = [];
                                                for (var i = 0; i < resultFolderSubType.data.length; i++) {
                                                    $scope.folderSubTypeList.push({
                                                        value: resultFolderSubType.data[i].subcode,
                                                        name: resultFolderSubType.data[i].subdesc
                                                    });
                                                }
                                            }
                                            return dataLayerService.getFolderWorkType(foldertype, subcode);
                                        }).then(function (resultWorkType) {
                                            if (resultWorkType.data != null) {
                                                $scope.workTypeList = [];
                                                for (var i = 0; i < resultWorkType.data.length; i++) {
                                                    $scope.workTypeList.push({
                                                        value: resultWorkType.data[i].workcode,
                                                        name: resultWorkType.data[i].workdesc
                                                    });
                                                }
                                            }
                                            return dataLayerService.getValidFolderStatus();
                                        }).then(function (resultValidFolderStatus) {

                                            if (resultValidFolderStatus.data != null) {
                                                $scope.validFolderStatusList = [];
                                                for (var i = 0; i < resultValidFolderStatus.data.length; i++) {
                                                    $scope.validFolderStatusList.push({
                                                        value: resultValidFolderStatus.data[i].statuscode,
                                                        name: resultValidFolderStatus.data[i].statusdesc
                                                    });
                                                }
                                            }
                                            return dataLayerService.getFolderProcessType(foldertype);
                                        }).then(function (resultProcessType) {
                                            if (resultProcessType.data != null) {
                                                $scope.ProcessTypeList = [];
                                                for (var i = 0; i < resultProcessType.data.length; i++) {
                                                    $scope.ProcessTypeList.push({
                                                        value: resultProcessType.data[i].processcode,
                                                        name: resultProcessType.data[i].processdesc
                                                    });
                                                }
                                            }
                                            return dataLayerService.getPeopleRoleList();
                                        }).then(function (resultRoleType) {
                                            if (resultRoleType.data != null) {
                                                $scope.peopleTypeList = [];
                                                for (var i = 0; i < resultRoleType.data.length; i++) {
                                                    $scope.peopleTypeList.push({
                                                        value: resultRoleType.data[i].peoplecode,
                                                        name: resultRoleType.data[i].peopledesc
                                                    });
                                                }
                                            }

                                            return dataLayerService.getProprtyTypeList();
                                        }).then(function (resultPropertyType) {
                                            if (resultPropertyType.data != null) {
                                                $scope.propertyTypeList = [];
                                                for (var i = 0; i < resultPropertyType.data.length; i++) {
                                                    $scope.propertyTypeList.push({
                                                        value: resultPropertyType.data[i].propcode,
                                                        name: resultPropertyType.data[i].propdesc
                                                    });
                                                }
                                            }

                                            return dataLayerService.getPropertyStatusList();
                                        }).then(function (resultValidPropertyStatus) {
                                            if (resultValidPropertyStatus.data != null) {
                                                $scope.validPropertyStatusList = [];
                                                for (var i = 0; i < resultValidPropertyStatus.data.length; i++) {
                                                    $scope.validPropertyStatusList.push({
                                                        value: resultValidPropertyStatus.data[i].statuscode,
                                                        name: resultValidPropertyStatus.data[i].statusdesc
                                                    });
                                                }
                                            }

                                            return dataLayerService.getPeopleStatusList();
                                        }).then(function (resultValidPeopleStatus) {
                                            var i;
                                            if (resultValidPeopleStatus.data != null) {
                                                $scope.validPeopleStatusList = [];
                                                for (i = 0; i < resultValidPeopleStatus.data.length; i++) {
                                                    $scope.validPeopleStatusList.push({
                                                        value: resultValidPeopleStatus.data[i].statuscode,
                                                        name: resultValidPeopleStatus.data[i].statusdesc
                                                    });
                                                }
                                            }

                                            // Need to implement prop Province and Country

                                            var headerheight = angular.element("#topheader").height();
                                            CommonService.resetOverlayHeight();
                                            angular.element(".overlay").animate({
                                                left: "0px",
                                                top: headerheight + "px"
                                            }, 0);

                                            //check if there is an existing watch
                                            if ($scope.inspectionProcessMatricsWatch) {
                                                //release existing watch
                                                $scope.inspectionProcessMatricsWatch();
                                            }
                                            if ($scope.deficiencyVariablesWatch) {
                                                //release existing watch
                                                $scope.deficiencyVariablesWatch();
                                            }

                                            ovarlayHeight = angular.element(".overlay").height();
                                            tabbarheight = angular.element("#inspectiontabs").height();
                                            var footerHeight = 10;// angular.element("#footer").height();
                                            angular.element(".scroll").mCustomScrollbar({
                                                setHeight: (ovarlayHeight - (tabbarheight + footerHeight)),
                                                theme: "3d-dark"
                                            });
                                            // To initialize first tab
                                            angular.element('#inspectiontabs a:first').tab("show");
                                            angular.element('#processinspection a:first').tab("show");
                                            //var dateformat = CommonService.getDateFormat();
                                            $timeout(function () {
                                                $(".input-group.date").datetimepicker({
                                                    format: dateformat
                                                });
                                            }, 1000);




                                            if (a6compatibility) {
                                                $scope.FillDetailForA6(result);
                                            } else {
                                                $scope.FillDetailForA7(result);
                                            }
                                            // This section is used for adding new Inspection at Inspection tab
                                            $scope.showAddInspections = true;


                                            angular.element(".scroll").mCustomScrollbar({
                                                setHeight: (ovarlayHeight - (tabbarheight + footerHeight)),
                                                theme: "3d-dark"
                                            });

                                            $timeout(function () {
                                                angular.element('.row.grid').shuffle({
                                                    itemSelector: '.summary'
                                                });
                                            }, 100);

                                        });
                                    }
                                }, this, searchBoxItem.folderRSN);
                            }
                        }
                    }
                }, "json");
            } else {
                utilService.showError("Unable to get folder detail.</br> Please logoff and login again.", 'error');
            }
        };
        $scope.FillDetailForA6 = function (result) {
            var dob, birthdate, collapse = 0;
            $scope.peoplecount = "";
            $scope.PeopleDetails = [];
            var values;
            if (result.data.folderpeople != null && result.data.folderpeople.length > 0) {
                for (i = 0 ; i < result.data.folderpeople.length; i++) {
                    values = result.data.folderpeople[i];

                    if (values.birthdate != null && values.birthdate !== "") {
                        birthdate = moment(values.birthdate).format(dateformat);
                    }
                    else {
                        birthdate = "";
                    }
                    var peopleStatusDesc = $filter('filter')($scope.validPeopleStatusList, { value: values.statuscode }, true);
                    if (peopleStatusDesc.length > 0) {
                        peopleStatusDesc = peopleStatusDesc[0].name;
                    } else {
                        peopleStatusDesc = "";
                    }
                    var peopleTypeDesc = $filter('filter')($scope.peopleTypeList, { value: values.peoplecode }, true);
                    if (peopleTypeDesc.length > 0) {
                        peopleTypeDesc = peopleTypeDesc[0].name;
                    } else {
                        peopleTypeDesc = "";
                    }
                    $scope.PeopleDetails.push({
                        CollapsePeople: "peopleheader" + collapse,
                        ContactName: String.format("{0} {1} {2} {3}", values.namefirst, values.namemiddle, values.namelast, values.namesuffix),
                        Name: String.format("{0}({1} {2} {3}  {4})", values.organizationname,
                                                                     values.namefirst, values.namemiddle, values.namelast, values.namesuffix),

                        Address: String.format("{0} {1} {2} {3} {4} {5} {6} {7} {8} {9} {10}", values.addrstreetprefix, values.addrprefix,
                                                values.addrstreet, values.addrstreettype, values.addrstreetdirection, values.addrunittype, values.addrunit,
                                                values.addrcity, values.addrprovince, values.addrpostal, values.addrcountry),

                        TelePhone: String.format("{0}{1}\n{2}{3}", values.phone1 !== "" ? values.phone1 : "", values.phone1desc !== "" ? "(" + values.phone1desc + ")" : "",
                                            values.phone2 !== "" ? values.phone2 : "", values.phone2desc !== "" ? "(" + values.phone2desc + ")" : ""),
                        DOB: birthdate,
                        Licence: values.licencenumber,
                        DateOfBirth: birthdate,
                        Comments: values.comments,
                        PersonRole: peopleTypeDesc,//values.PeopleCode,//values.peopledesc,
                        PeopleId: values.peoplersn,
                        Organization: values.organizationname,
                        Status: peopleStatusDesc,//values.StatusCode, //values.statusdesc,
                        StatusCode: values.statuscode,
                        ParentId: values.parentrsn,
                        Email: values.emailaddress,
                        FamilyId: values.familyrsn
                    });
                }
                $scope.peoplecount = "(" + result.data.folderpeople.length + ")";
            }

            //collect folder data
            var indate, finaldate, issuedate;
            $scope.FolderDetails = [];
            if (result.data.folder != null) {
                values = result.data.folder;
                if (values.indate != null && values.indate !== "") {
                    indate = moment(values.indate).format(dateformat);
                }
                else {
                    indate = "";
                }
                if (values.finaldate != null && values.finaldate !== "") {
                    finaldate = moment(values.finaldate).format(dateformat);
                }
                else {
                    finaldate = "";
                }
                if (values.issuedate != null && values.issuedate !== "") {
                    issuedate = moment(values.issuedate).format(dateformat);
                }
                else {
                    issuedate = "";
                }
                var folderTypeDesc = $filter('filter')($scope.folderTypeList, { value: values.foldertype }, true);
                if (folderTypeDesc.length > 0) {
                    folderTypeDesc = folderTypeDesc[0].name;
                } else {
                    folderTypeDesc = "";
                }
                var workTypeDesc = $filter('filter')($scope.workTypeList, { value: values.workcode }, true);
                if (workTypeDesc.length > 0) {
                    workTypeDesc = workTypeDesc[0].name;
                }
                else {
                    workTypeDesc = "";
                }
                var folderSubTypeDesc = $filter('filter')($scope.folderSubTypeList, { value: values.subcode }, true);
                if (folderSubTypeDesc.length > 0) {
                    folderSubTypeDesc = folderSubTypeDesc[0].name;
                } else {
                    folderSubTypeDesc = "";
                }
                var folderStatusDesc = $filter('filter')($scope.validFolderStatusList, { value: values.statuscode }, true);
                if (folderStatusDesc.length > 0) {
                    folderStatusDesc = folderStatusDesc[0].name;
                } else {
                    folderStatusDesc = "";
                }
                $scope.FolderDetails.push({
                    FolderNumber: String.format("{0}{1} {2} {3} {4} {5}", values.foldercentury, values.folderyear, values.foldersequence != null ? values.foldersequence.lpad("0", 6) : "000000", values.foldersection != null ? values.foldersection.lpad("0", 3) : "000", values.folderrevision != null ? values.folderrevision.lpad("0", 2) : "00", values.foldertype),
                    FolderStatus: folderStatusDesc,//values.statusdesc,
                    Type: String.format("{0}{1}", folderTypeDesc, folderTypeDesc !== "" ? "(" + values.FolderType + ")" : ""),
                    //Group: values.FolderDescription,// Not available into returned result
                    RowId: values.folderrsn,
                    SubType: String.format("{0}{1}", folderSubTypeDesc, folderSubTypeDesc !== "" ? "(" + values.subcode + ")" : ""),
                    WorkType: String.format("{0}{1}", workTypeDesc, workTypeDesc !== "" ? "(" + values.workcode + ")" : ""),
                    ParentId: values.parentrsn,
                    InDate: indate, FinalDate: finaldate,
                    IssueApprover: issuedate,
                    DescDeails: values.folderdescription,
                    FolderId: values.folderId == undefined ? 0 : values.folderId,
                    IsNew: values.isNew == undefined ? null : values.isNew,
                });
            }

            collapse = 0;

            //collect folder property
            var createdon, datecreated, dateobsoleted, obsoletedon;
            $scope.propertycount = "";
            $scope.PropertyDetails = [];
            if (result.data.folderproperty != null && result.data.folderproperty.length > 0) {
                for (i = 0 ; i < result.data.folderproperty.length; i++) {
                    values = result.data.folderproperty[i];
                    if (values.datecreated != null && values.datecreated !== "") {
                        createdon = moment(values.datecreated).format(dateformat);
                    }
                    else {
                        createdon = "";
                    }
                    if (values.dateobsoleted != null && values.dateobsoleted !== "") {
                        obsoletedon = moment(values.dateobsoleted).format(dateformat);
                    }
                    else {
                        obsoletedon = "";
                    }
                    var propStatusDesc = $filter('filter')($scope.validPropertyStatusList, { value: values.statuscode }, true);
                    if (propStatusDesc.length > 0) {
                        propStatusDesc = propStatusDesc[0].name;
                    } else {
                        propStatusDesc = "";
                    }
                    var propTypeDesc = $filter('filter')($scope.propertyTypeList, { value: values.propcode }, true);
                    if (propTypeDesc.length > 0) {
                        propTypeDesc = propTypeDesc[0].name;
                    } else {
                        propTypeDesc = "";
                    }
                    var formattedaddress = formattedaddressheader = CommonService.formatAddress(values.prophouse, values.propstreetprefix, values.propstreet, values.propstreettype, values.propstreetdirection, values.propcity, ",", values.propprovince, ",", values.countydesc, values.proppostal);
                    if (propStatusDesc !== "") {
                        formattedaddressheader += "(" + propStatusDesc + ")";
                    }
                    collapse++;
                    $scope.PropertyDetails.push({
                        collapseProp: "propheader" + collapse,
                        Name: values.propertyname,
                        Address: formattedaddressheader,
                        AddressInDetail: formattedaddress,
                        CreatedOn: createdon,
                        ObsoluteOn: obsoletedon,
                        Roll: values.propertyroll,
                        Plan: values.propplan,
                        Lot: values.proplot,
                        Block: values.proptownship !== "" ? values.proptownship : "",
                        PlanLotBlock: String.format("{0} {1} {2}", values.propplan !== "" ? values.propplan + "/" : "",
                            values.proplot !== "" ? values.proplot + "/" : "",
                            values.proptownship !== "" ? values.proptownship + "" : ""),
                        Section: values.propsection,
                        Township: values.proptownship,
                        Range: values.proprange,
                        SecTwnRge: String.format("{0} {1} {2}", values.propsection !== "" ? values.propsection + "/" : "",
                            values.proptownship !== "" ? values.proptownship + "/" : "",
                            values.proprange !== "" ? values.proprange + "" : ""),
                        Status: propStatusDesc,//values.statusdesc need to implement
                        StatusCode: values.statuscode,
                        Area: values.proparea,
                        Frontage: values.propfrontage,
                        Depth: values.propdepth,
                        PropertyId: values.propertyrsn,
                        Relation: values.propertyrelationcode,
                        Comment: values.propcomment,
                        LegalDesc: values.legaldesc,
                        Zone1: values.zonetype1,
                        Zone2: values.zonetype2,
                        Zone3: values.zonetype3,
                        Zone4: values.zonetype4,
                        Zone5: values.zonetype5,
                        Route: values.routecode,
                        X: values.propx,
                        Y: values.propy,
                        ParentId: values.parentpropertyrsn,
                        FamilyId: values.familyrsn,
                        GISId: values.propgisid1,
                        PropCode: values.propcode,
                        PropertyType: propTypeDesc//"",//values.propdesc Need to implement
                    });

                }
                $scope.propertycount = "(" + result.data.folderproperty.length + ")";
            }

            $scope.folderinfocount = "";

            $scope.collapseData = function () {
                angular.element(".glyphicon").addClass("glyphicon-plus").removeClass("glyphicon-minus");
                if ($(this).find(".glyphicon").hasClass("glyphicon-plus")) {
                    $(this).find(".glyphicon").addClass("glyphicon-minus").removeClass("glyphicon-plus");
                }
            };

            //collect folder info
            var ungroupInfoDetails = [], groupInfoDetails = [], val = [], folderInfoGroupLabel = [], groups = {}, options = [];
            var collapseId;

            $scope.validinfo = [], collapseId = 0;
            if (result.data.folderinfo) {
                for (i = 0; i < result.data.folderinfo.length; i++) {

                    var item = {
                        folderrsn: result.data.folderinfo[i].folderrsn,
                        infogroup: result.data.folderinfo[i].infogroup,
                        infotype: result.data.folderinfo[i].infotype,

                        infodesc: result.data.folderinfo[i].infodesc,
                        infodesc2: result.data.folderinfo[i].infodesc2,
                        infocode: result.data.folderinfo[i].infocode,
                        infovalue: result.data.folderinfo[i].infovalue,
                        displayorder: result.data.folderinfo[i].displayorder,

                        valuerequired: result.data.folderinfo[i].valuerequired,
                        mandatory: result.data.folderinfo[i].mandatory
                    };

                    var infogroup = result.data.folderinfo[i].infogroup;

                    var grp = $.grep(folderInfoGroupLabel, function (n, idx) {
                        if (n.key === infogroup) return n;
                    });

                    if (grp.length > 0) {
                        grp[0].items.push(result.data.folderinfo[i]);
                        grp[0].itemlength = grp[0].items.length;
                    } else {
                        folderInfoGroupLabel.push({ key: infogroup, items: [item], dataCollapse: collapseId, itemlength: 1 });
                        collapseId++;
                    }


                }
                $scope.folderinfocount = "(" + result.data.folderinfo.length + ")";
            }


            $scope.FolderInfoDetails = folderInfoGroupLabel;

            for (i = 0; i < folderInfoGroupLabel.length; i++) {
                if (folderInfoGroupLabel[i].key === "") {
                    folderInfoGroupLabel[i].key = "Ungrouped Infos";
                }
                var optionTypes = ["PICK", "CHOOSE", "MULTI_PICK", "P", "C"];
                for (var j = 0; j < folderInfoGroupLabel[i].items.length; j++) {

                    if (optionTypes.indexOf(folderInfoGroupLabel[i].items[j].infotype) >= 0) {
                        //$scope.selectedValue = folderInfoGroupLabel[i].items[j].InfoValue;
                        var selectedValue = folderInfoGroupLabel[i].items[j].infovalue;
                        var selectedType = folderInfoGroupLabel[i].items[j].infotype;


                        (function (currentitem, selected, selectedtype) {
                            dataLayerService.getValidInfovalues(currentitem.infocode).then(function (response) {
                                var options = [];
                                for (var i = 0; i < response.data.length; i++) {
                                    var iCode = response.data[i].infocode;
                                    var iValue = response.data[i].infovalue;
                                    var iText = response.data[i].infodesc;
                                    if (iText == null || iText === "") {
                                        iText = iValue;
                                    }
                                    options.push({
                                        text: iText,
                                        value: iValue
                                    });
                                }
                                currentitem.validinfo = options;
                                if (selectedtype === "MULTI_PICK" || selectedtype === "PICK" || selectedtype === "P" || selectedtype === "M") {
                                    var data = [];
                                    var actuallyData = selected.split(",");
                                    for (var i = 0; i < actuallyData.length; i++) {
                                        var selecteddata = $filter("filter")(options, { value: actuallyData[i] }, true);
                                        if (selecteddata.length > 0)
                                            data.push(selecteddata[0].text);
                                        else {
                                            data.push(actuallyData[i]);
                                        }
                                    }
                                    currentitem.selectedValue = data.join(",");

                                }
                                else {
                                    var checkifdataexists = $filter("filter")(options, { value: selected }, true);
                                    if (checkifdataexists.length > 0) {
                                        currentitem.selectedValue = checkifdataexists[0];
                                    } else {
                                        currentitem.selectedValue = { text: "Please Choose Info", value: "" };
                                    }
                                }

                            });
                        })(folderInfoGroupLabel[i].items[j], selectedValue, selectedType);



                    }
                }
            }
        }
        $scope.FillDetailForA7 = function (result) {
            var dob, birthdate, collapse = 0;
            $scope.peoplecount = "";
            $scope.PeopleDetails = [];
            var values;
            if (result.data.folderpeople != null && result.data.folderpeople.length > 0) {
                for (i = 0 ; i < result.data.folderpeople.length; i++) {
                    values = result.data.folderpeople[i];

                    if (values.BirthDate != null && values.BirthDate !== "") {
                        birthdate = moment(values.BirthDate).format(dateformat);
                    }
                    else {
                        birthdate = "";
                    }
                    var peopleStatusDesc = $filter('filter')($scope.validPeopleStatusList, { value: values.StatusCode }, true);
                    if (peopleStatusDesc.length > 0) {
                        peopleStatusDesc = peopleStatusDesc[0].name;
                    } else {
                        peopleStatusDesc = "";
                    }
                    var peopleTypeDesc = $filter('filter')($scope.peopleTypeList, { value: values.PeopleCode }, true);
                    if (peopleTypeDesc.length > 0) {
                        peopleTypeDesc = peopleTypeDesc[0].name;
                    } else {
                        peopleTypeDesc = "";
                    }
                    $scope.PeopleDetails.push({
                        CollapsePeople: "peopleheader" + collapse,
                        ContactName: String.format("{0} {1} {2} {3}", values.NameFirst, values.NameMiddle, values.NameLast, values.NameSuffix),
                        Name: String.format("{0}({1} {2} {3}  {4})", values.OrganizationName,
                                                                     values.NameFirst, values.NameMiddle, values.NameLast, values.NameSuffix),

                        Address: CommonService.formatAddress(values.AddrHouse, values.AddrStreetPrefix, values.AddrStreet, values.AddrStreetType, values.AddrStreetDirection, values.AddrCity, ",", values.AddrProvince, ",", values.AddrPostal, values.AddrCountry),
                        TelePhone: String.format("{0}{1}\n{2}{3}", values.Phone1 !== "" ? values.Phone1 : "", values.Phone1Desc !== "" ? "(" + values.Phone1Desc + ")" : "",
                                            values.Phone2 !== "" ? values.Phone2 : "", values.Phone2Desc !== "" ? "(" + values.Phone2Desc + ")" : ""),
                        DOB: birthdate,
                        Licence: values.LicenceNumber,
                        DateOfBirth: birthdate,
                        Comments: values.Comments,
                        PersonRole: peopleTypeDesc,//values.PeopleCode,//values.peopledesc,
                        PeopleId: values.PeopleRSN,
                        Organization: values.OrganizationName,
                        Status: peopleStatusDesc,//values.StatusCode, //values.statusdesc,
                        StatusCode: values.StatusCode,
                        ParentId: values.ParentRSN,
                        Email: values.EmailAddress,
                        FamilyId: values.FamilyRSN
                    });
                }
                $scope.peoplecount = "(" + result.data.folderpeople.length + ")";
            }

            //collect folder data
            var indate, finaldate, issuedate;
            $scope.FolderDetails = [];
            if (result.data.folder != null) {
                values = result.data.folder;
                if (values.InDate != null && values.InDate !== "") {
                    indate = moment(values.InDate).format(dateformat);
                }
                else {
                    indate = "";
                }
                if (values.FinalDate != null && values.FinalDate !== "") {
                    finaldate = moment(values.FinalDate).format(dateformat);
                }
                else {
                    finaldate = "";
                }
                if (values.IssueDate != null && values.IssueDate !== "") {
                    issuedate = moment(values.IssueDate).format(dateformat);
                }
                else {
                    issuedate = "";
                }
                var folderTypeDesc = $filter('filter')($scope.folderTypeList, { value: values.FolderType }, true);
                if (folderTypeDesc.length > 0) {
                    folderTypeDesc = folderTypeDesc[0].name;
                } else {
                    folderTypeDesc = "";
                }
                var workTypeDesc = $filter('filter')($scope.workTypeList, { value: values.WorkCode }, true);
                if (workTypeDesc.length > 0) {
                    workTypeDesc = workTypeDesc[0].name;
                }
                else {
                    workTypeDesc = "";
                }
                var folderSubTypeDesc = $filter('filter')($scope.folderSubTypeList, { value: values.SubCode }, true);
                if (folderSubTypeDesc.length > 0) {
                    folderSubTypeDesc = folderSubTypeDesc[0].name;
                } else {
                    folderSubTypeDesc = "";
                }
                var folderStatusDesc = $filter('filter')($scope.validFolderStatusList, { value: values.StatusCode }, true);
                if (folderStatusDesc.length > 0) {
                    folderStatusDesc = folderStatusDesc[0].name;
                } else {
                    folderStatusDesc = "";
                }
                $scope.FolderDetails.push({
                    FolderNumber: values.CustomFolderNumber === "" ? String.format("{0}{1} {2} {3} {4} {5}", values.FolderCentury, values.FolderYear, values.FolderSequence != null ? values.FolderSequence.lpad("0", 6) : "000000", values.FolderSection != null ? values.FolderSection.lpad("0", 3) : "000", values.FolderRevision != null ? values.FolderRevision.lpad("0", 2) : "00", values.FolderType) : values.CustomFolderNumber,
                    FolderStatus: folderStatusDesc,//values.statusdesc,
                    Type: String.format("{0}{1}", folderTypeDesc, folderTypeDesc !== "" ? "(" + values.FolderType + ")" : ""),
                    //Group: values.FolderDescription,// Not available into returned result
                    RowId: values.FolderRSN,
                    SubType: String.format("{0}{1}", folderSubTypeDesc, folderSubTypeDesc !== "" ? "(" + values.SubCode + ")" : ""),
                    WorkType: String.format("{0}{1}", workTypeDesc, workTypeDesc !== "" ? "(" + values.WorkCode + ")" : ""),
                    ParentId: values.ParentRSN,
                    InDate: indate,
                    FinalDate: finaldate,
                    IssueApprover: issuedate,
                    DescDeails: values.FolderDescription,
                    FolderId: values.folderId === undefined ? 0 : values.folderId,
                    IsNew: values.isNew === undefined ? null : values.isNew,
                });
            }

            collapse = 0;

            //collect folder property
            var createdon, datecreated, dateobsoleted, obsoletedon;
            $scope.propertycount = "";
            $scope.PropertyDetails = [];
            if (result.data.folderproperty != null && result.data.folderproperty.length > 0) {
                for (i = 0 ; i < result.data.folderproperty.length; i++) {
                    values = result.data.folderproperty[i];
                    if (values.DateCreated != null && values.DateCreated !== "") {
                        createdon = moment(values.DateCreated).format(dateformat);
                    }
                    else {
                        createdon = "";
                    }
                    if (values.DateObsoleted != null && values.DateObsoleted !== "") {
                        obsoletedon = moment(values.DateObsoleted).format(dateformat);
                    }
                    else {
                        obsoletedon = "";
                    }
                    var propStatusDesc = $filter('filter')($scope.validPropertyStatusList, { value: values.StatusCode }, true);
                    if (propStatusDesc.length > 0) {
                        propStatusDesc = propStatusDesc[0].name;
                    } else {
                        propStatusDesc = "";
                    }
                    var propTypeDesc = $filter('filter')($scope.propertyTypeList, { value: values.PropCode }, true);
                    if (propTypeDesc.length > 0) {
                        propTypeDesc = propTypeDesc[0].name;
                    } else {
                        propTypeDesc = "";
                    }
                    var formattedaddress = formattedaddressheader = CommonService.formatAddress(values.PropHouse, values.PropStreetPrefix, values.PropStreet, values.PropStreetType, values.PropStreetDirection, values.PropCity, ",", values.PropProvince, ",", values.CountyDesc, values.PropPostal);
                    if (propStatusDesc !== "") {
                        formattedaddressheader += "(" + propStatusDesc + ")";
                    }
                    collapse++;
                    $scope.PropertyDetails.push({
                        collapseProp: "propheader" + collapse,
                        Name: values.PropertyName,
                        Address: formattedaddressheader,
                        AddressInDetail: formattedaddress,
                        CreatedOn: createdon,
                        ObsoluteOn: obsoletedon,
                        Roll: values.PropertyRoll,
                        Plan: values.PropPlan,
                        Lot: values.PropLot,
                        Block: values.PropTownship !== "" ? values.PropTownship : "",
                        PlanLotBlock: String.format("{0} {1} {2}", values.PropPlan !== "" ? values.PropPlan + "/" : "",
                            values.PropLot !== "" ? values.PropLot + "/" : "",
                            values.PropTownship !== "" ? values.PropTownship + "" : ""),
                        Section: values.PropSection,
                        Township: values.PropTownship,
                        Range: values.PropRange,
                        SecTwnRge: String.format("{0} {1} {2}", values.PropSection !== "" ? values.PropSection + "/" : "",
                            values.PropTownship !== "" ? values.PropTownship + "/" : "",
                            values.PropRange !== "" ? values.PropRange + "" : ""),
                        Status: propStatusDesc,
                        StatusCode: values.StatusCode,
                        Area: values.PropArea,
                        Frontage: values.PropFrontage,
                        Depth: values.PropDepth,
                        PropertyId: values.PropertyRSN,
                        Relation: values.PropertyRelationCode,
                        Comment: values.PropComment,
                        LegalDesc: values.LegalDesc,
                        Zone1: values.ZoneType1,
                        Zone2: values.ZoneType2,
                        Zone3: values.ZoneType3,
                        Zone4: values.ZoneType4,
                        Zone5: values.ZoneType5,
                        Route: values.RouteCode,
                        X: values.PropX,
                        Y: values.PropY,
                        ParentId: values.ParentPropertyRSN,
                        FamilyId: values.FamilyRSN,
                        GISId: values.PropGisId1,
                        PropCode: values.PropCode,
                        PropertyType: propTypeDesc
                    });

                }
                $scope.propertycount = "(" + result.data.folderproperty.length + ")";
            }

            $scope.folderinfocount = "";

            $scope.collapseData = function () {
                angular.element(".glyphicon").addClass("glyphicon-plus").removeClass("glyphicon-minus");
                if ($(this).find(".glyphicon").hasClass("glyphicon-plus")) {
                    $(this).find(".glyphicon").addClass("glyphicon-minus").removeClass("glyphicon-plus");
                }
            };

            //collect folder info
            var ungroupInfoDetails = [], groupInfoDetails = [], val = [], folderInfoGroupLabel = [], groups = {}, options = [];
            var collapseId;

            $scope.validinfo = [], collapseId = 0;
            if (result.data.folderinfo) {
                for (i = 0; i < result.data.folderinfo.length; i++) {

                    var item = {
                        folderrsn: result.data.folderinfo[i].FolderRSN,
                        infogroup: result.data.folderinfo[i].InfoGroup,
                        infotype: result.data.folderinfo[i].InfoType,

                        infodesc: result.data.folderinfo[i].InfoDesc,
                        infodesc2: result.data.folderinfo[i].InfoDesc2,
                        infocode: result.data.folderinfo[i].InfoCode,
                        infovalue: result.data.folderinfo[i].InfoValue,
                        displayorder: result.data.folderinfo[i].DisplayOrder,

                        valuerequired: result.data.folderinfo[i].ValueRequired,
                        mandatory: result.data.folderinfo[i].Mandatory
                    };

                    var infogroup = result.data.folderinfo[i].InfoGroup;

                    var grp = $.grep(folderInfoGroupLabel, function (n, idx) {
                        if (n.key === infogroup) return n;
                    });

                    if (grp.length > 0) {
                        grp[0].items.push(result.data.folderinfo[i]);
                        grp[0].itemlength = grp[0].items.length;
                    } else {
                        folderInfoGroupLabel.push({ key: infogroup, items: [item], dataCollapse: collapseId, itemlength: 1 });
                        collapseId++;
                    }


                }
                $scope.folderinfocount = "(" + result.data.folderinfo.length + ")";
            }


            $scope.FolderInfoDetails = folderInfoGroupLabel;

            for (i = 0; i < folderInfoGroupLabel.length; i++) {
                if (folderInfoGroupLabel[i].key === "") {
                    folderInfoGroupLabel[i].key = "Ungrouped Infos";
                }
                var optionTypes = ["PICK", "CHOOSE", "MULTI_PICK", "P", "C"];
                for (var j = 0; j < folderInfoGroupLabel[i].items.length; j++) {

                    if (optionTypes.indexOf(folderInfoGroupLabel[i].items[j].infotype) >= 0) {
                        //$scope.selectedValue = folderInfoGroupLabel[i].items[j].InfoValue;
                        var selectedValue = folderInfoGroupLabel[i].items[j].infovalue;
                        var selectedType = folderInfoGroupLabel[i].items[j].infotype;


                        (function (currentitem, selected, selectedtype) {
                            dataLayerService.getValidInfovalues(currentitem.infocode).then(function (response) {
                                var options = [];
                                for (var i = 0; i < response.data.length; i++) {
                                    var iCode = response.data[i].infocode;
                                    var iValue = response.data[i].infovalue;
                                    var iText = response.data[i].infodesc;
                                    if (iText == null || iText === "") {
                                        iText = iValue;
                                    }
                                    options.push({
                                        text: iText,
                                        value: iValue
                                    });
                                }
                                currentitem.validinfo = options;

                                if (selectedtype === "MULTI_PICK" || selectedtype === "PICK" || selectedtype === "P" || selectedtype === "M") {
                                    var data = [];
                                    var actuallyData = selected.split(",");
                                    for (var i = 0; i < actuallyData.length; i++) {
                                        var selecteddata = $filter("filter")(options, { value: actuallyData[i] }, true);
                                        if (selecteddata.length > 0)
                                            data.push(selecteddata[0].text);
                                        else {
                                            data.push(actuallyData[i]);
                                        }
                                    }
                                    currentitem.selectedValue = data.join(",");

                                }
                                else {
                                    var checkifdataexists = $filter("filter")(options, { value: selected }, true);
                                    if (checkifdataexists.length > 0) {
                                        currentitem.selectedValue = checkifdataexists[0];
                                    } else {
                                        currentitem.selectedValue = { text: "Please Choose Info", value: "" };
                                    }
                                }


                            });
                        })(folderInfoGroupLabel[i].items[j], selectedValue, selectedType);



                    }
                }
            }
        }
        $scope.SelectFolder = function (inboxItem, fromwhere) {
            cfpLoadingBar.start();
            $scope.isInbox = false;
            if (fromwhere === 'inboxOverlay') {
                angular.element('.shoInbox').stop().show().animate({
                    left: '-100%',
                    display: 'block'

                });
            }
            var headerheight = angular.element("#topheader").height();
            //$scope.InitializeLabel();

            CommonService.resetOverlayHeight();
            angular.element(".overlay").animate({
                left: "0px",
                top: headerheight + "px"
            }, 0);
            // To initialize first tab
            angular.element('#inspectiontabs a:first').tab("show");
            angular.element('#processinspection a:first').tab("show");
            //check if there is an existing watch
            if ($scope.inspectionProcessMatricsWatch) {
                //release existing watch
                $scope.inspectionProcessMatricsWatch();
            }

            $scope.validUserList = [];
            $scope.isReassignementEnabled = false;
            $scope.reassignedUser = { selectedValidUser: "" };

            $scope.SignatureTypeList = [];
            $scope.peoplecount = "";
            $scope.PeopleDetails = [];
            $scope.FolderDetails = [];
            $scope.propertycount = "";
            $scope.PropertyDetails = [];
            $scope.AttemptHistoryList = [];
            $scope.FolderProcessChecklistDetails = [];
            $scope.AttemptHistoryList = [];
            $scope.attachmentTypeList = [];
            $scope.attachmentcount = "";
            $scope.attachmentInfoList = [];
            $scope.validFolerFreeFormTabList = [];
            $scope.validFolerProcessFreeFormTabList = [];
            $scope.folderProcessList = [];
            $scope.folderCommentList = [];
            $scope.folderCommentCount = 0;
            $scope.folderFeeList = [];
            $scope.folderFeeCount = 0;
            $scope.folderFixtureList = [];
            $scope.folderFixtureCount = 0;
            $scope.folderDocumentList = [];
            $scope.folderDocumentCount = 0;
            $scope.validinfo = []
            $scope.folderinfocount = "";
            $scope.FolderInfoDetails = [];
            $scope.validprocessinfo = [];
            $scope.clausegrouplist = [];
            $scope.clausegroupvalue = "";
            $scope.clauesevalue = [];
            $scope.reportList = [];
            $scope.reportCount = 0;
            var promises = {
                People: dataLayerService.getPeopleData(inboxItem),

                Property: dataLayerService.getPropertyData(inboxItem),
                FolderInfo: dataLayerService.getFolderInfoData(inboxItem),
            }
            if (fromwhere === "searchbox") {
                $scope.showAddInspections = true;
                $scope.searchBoxItem = inboxItem;
                promises.ProcessType = dataLayerService.getFolderProcessType(inboxItem.folderType);
            }
            else {
                $scope.showAddInspections = false;
            }
            if (fromwhere !== "searchbox") {
                promises.FolderProcessInfo = dataLayerService.getFolderProcessInfoData(inboxItem);
                promises.FolderProcessChecklist = dataLayerService.getFolderProcessChecklistData(inboxItem);
                promises.AttemptResult = dataLayerService.getFolderProcessAttemptResultCode(inboxItem);
                promises.InspectionResult = dataLayerService.getInspectionResultData(inboxItem);
            }

            promises.HistoryProcessAttempt = dataLayerService.getHistoryProcessAttempt(inboxItem);
            promises.AttachmentType = dataLayerService.getAttachmentType();
            promises.Attachment = dataLayerService.getAllAttachment(inboxItem);
            promises.Report = dataLayerService.getAllReport(inboxItem);
            promises.FolderFreeForm = dataLayerService.getValidFreeFormTab(inboxItem, "Folder");
            promises.FolderProcessFreeForm = dataLayerService.getValidFreeFormTab(inboxItem, "FolderProcess");
            promises.FolderProcess = dataLayerService.getFolderProcessList(inboxItem);
            promises.FolderComment = dataLayerService.getFolderCommentList(inboxItem);
            promises.FolderFixture = dataLayerService.getFolderFixtureList(inboxItem);
            promises.FolderFee = dataLayerService.getFolderFeeList(inboxItem);
            promises.FolderDocument = dataLayerService.getFolderDocumentList(inboxItem);
            promises.ValidClause = dataLayerService.getValidClauseData();



            // Folder Record Start Here.

            dataLayerService.getFolderData(inboxItem).then(function (allresult) {
                $timeout(function () {
                    var indate, finaldate, issuedate;
                    if (allresult && allresult.data != null && allresult.data.length > 0) {
                        for (var i = 0 ; i < allresult.data.length; i++) {
                            var values = utilService.removeNullStrings(allresult.data[i]);

                            if (values.indate != null && values.indate !== "") {

                                indate = moment(values.indate).format(dateformat);
                            }
                            else {
                                indate = "";
                            }
                            if (values.finaldate != null && values.finaldate !== "") {
                                finaldate = moment(values.finaldate).format(dateformat);
                            }
                            else {
                                finaldate = "";
                            }
                            if (values.issuedate != null && values.issuedate !== "") {
                                finaldate = moment(values.issuedate).format(dateformat);
                            }
                            else {
                                issuedate = "";
                            }
                            $scope.FolderDetails.push({
                                FolderNumber: String.format("{0}{1} {2} {3} {4} {5}", values.foldercentury, values.folderyear, values.foldersequence != null ? values.foldersequence.lpad("0", 6) : "000000", values.foldersection != null ? values.foldersection.lpad("0", 3) : "000", values.folderrevision != null ? values.folderrevision.lpad("0", 2) : "00", values.foldertype),
                                FolderStatus: values.statusdesc,
                                Type: String.format("{0}({1})", values.folderdesc, values.foldertype),
                                Group: values.foldergroupdesc,
                                RowId: values.folderrsn,
                                SubType: String.format("{0}{1}", values.subdesc, values.subdesc !== "" ? "(" + values.subcode + ")" : ""),
                                WorkType: String.format("{0}{1}", values.workdesc, values.workdesc !== "" ? "(" + values.workcode + ")" : ""),
                                ParentId: values.parentrsn,
                                InDate: indate, FinalDate: finaldate,
                                IssueApprover: issuedate,
                                DescDeails: values.folderdescription,
                                FolderId: values.folderId,
                                IsNew: values.isNew,
                            });
                            break;
                        }
                        $timeout(function () {
                            angular.element('.row.grid').shuffle({
                                itemSelector: '.summary'
                            });
                        }, 100)

                    }
                })

            })

            // Folder Record End Here


            $q.all(promises).then(function (allresult) {

                var validsiteoptions = dataLayerService.getSiteOptions();
                var signaturetype = $filter('filter')(validsiteoptions, { optionkey: "Signature Types" }, true);
                if (signaturetype && signaturetype.length > 0) {
                    var arrData = signaturetype[0].optionvalue.split(";");
                    for (var i = 0; i < arrData.length; i++) {
                        $scope.SignatureTypeList.push({ value: arrData[i], name: arrData[i] });
                    }
                    $scope.InspectionProcessMetricsDetails.SignatureTypeList = $scope.SignatureTypeList;
                }
                // People Record Start here
                var dob, birthdate, collapse = 0;
                if (allresult.People && allresult.People.data !== null) {
                    for (var i = 0 ; i < allresult.People.data.length; i++) {
                        var values = allresult.People.data[i];
                        if (values.birthdate != null && values.birthdate !== "") {
                            birthdate = moment(values.birthdate).format(dateformat);
                        }
                        else {
                            birthdate = "";
                        }
                        CommonService.cleanNullValues(values);
                        $scope.PeopleDetails.push({
                            CollapsePeople: "peopleheader" + collapse,
                            ContactName: String.format("{0} {1} {2} {3}", values.namefirst, values.namemiddle, values.namelast, values.namesuffix),
                            Name: String.format("{0}({1} {2} {3}  {4})", values.organizationname,
                                                                         values.namefirst, values.namemiddle, values.namelast, values.namesuffix),

                            Address: String.format("{0} {1} {2} {3} {4} {5} {6} {7} {8} {9} {10}", values.addrstreetprefix, values.addrprefix,
                                                    values.addrstreet, values.addrstreettype, values.addrstreetdirection, values.addrunittype, values.addrunit,
                                                    values.addrcity, values.addrprovince, values.addrpostal, values.addrcountry),

                            TelePhone: String.format("{0}{1}\n{2}{3}", values.phone1 !== "" ? values.phone1 : "", values.phone1desc !== "" ? "(" + values.phone1desc + ")" : "",
                                                values.phone2 !== "" ? values.phone2 : "", values.phone2desc !== "" ? "(" + values.phone2desc + ")" : ""),
                            DOB: birthdate,
                            Licence: values.licencenumber,
                            DateOfBirth: birthdate,
                            Comments: values.comments,
                            PersonRole: values.peopledesc,
                            PeopleId: values.peoplersn,
                            Organization: values.organizationname,
                            Status: values.statusdesc,
                            ParentId: values.parentrsn,
                            Email: values.emailaddress,
                            FamilyId: values.familyrsn
                        });

                    }
                    $scope.peoplecount = "(" + allresult.People.data.length + ")";
                }
                // People Record End here

                // Property Record Start here
                var createdon, datecreated, dateobsoleted, obsoletedon, collapse = 0;
                if (allresult.Property && allresult.Property.data !== null) {
                    for (var i = 0 ; i < allresult.Property.data.length; i++) {
                        var values = allresult.Property.data[i];
                        if (values.datecreated != null && values.datecreated !== "") {
                            createdon = moment(values.datecreated).format('MMM DD, YYYY');
                        }
                        else {
                            createdon = "";
                        }
                        if (values.dateobsoleted != null && values.dateobsoleted !== "") {
                            obsoletedon = moment(values.dateobsoleted).format('MMM DD, YYYY');
                        }
                        else {
                            obsoletedon = "";
                        }
                        collapse++;
                        CommonService.cleanNullValues(values);
                        var formattedaddress = formattedaddressheader = CommonService.formatAddress(values.prophouse, values.propstreetprefix, values.propstreet, values.propstreettype, values.propstreetdirection, values.propcity, ",", values.propprovince, ",", values.countydesc, values.proppostal);
                        if (values.statusdesc !== "") {
                            formattedaddressheader += "(" + values.statusdesc + ")";
                        }

                        $scope.PropertyDetails.push({
                            collapseProp: "propheader" + collapse,
                            Name: values.propertyname,
                            Address: formattedaddressheader,
                            AddressInDetail: formattedaddress,
                            CreatedOn: createdon,
                            ObsoluteOn: obsoletedon,
                            Roll: values.propertyroll,
                            Plan: values.propplan,
                            Lot: values.proplot,
                            Block: values.proptownship !== "" ? values.proptownship : "",
                            PlanLotBlock: String.format("{0} {1} {2}", values.propplan !== "" ? values.propplan + "/" : "",
                                values.proplot !== "" ? values.proplot + "/" : "",
                                values.propblock !== "" ? values.proptownship + "" : ""),
                            Section: values.propsection,
                            Township: values.proptownship,
                            Range: values.proprange,
                            SecTwnRge: String.format("{0} {1} {2}", values.propsection !== "" ? values.propsection + "/" : "",
                                values.proptownship !== "" ? values.proptownship + "/" : "",
                                values.proprange !== "" ? values.proprange + "" : ""),
                            Status: values.statusdesc,
                            Area: values.proparea,
                            Frontage: values.propfrontage,
                            Depth: values.propdepth,
                            PropertyId: values.propertyrsn,
                            Relation: values.propertyrelationcode,
                            Comment: values.propcomment,
                            LegalDesc: values.legaldesc,
                            Zone1: values.zonetype1,
                            Zone2: values.zonetype2,
                            Zone3: values.zonetype3,
                            Zone4: values.zonetype4,
                            Zone5: values.zonetype5,
                            Route: values.routecode,
                            X: values.propx,
                            Y: values.propy,
                            ParentId: values.parentpropertyrsn,
                            FamilyId: values.familyrsn,
                            GISId: values.propgisid1,
                            PropertyType: values.propdesc
                        });

                    }
                    $scope.propertycount = "(" + allresult.Property.data.length + ")";
                }
                // Property Record End here



                // Folder Info Record Here.
                if (allresult.FolderInfo && allresult.FolderInfo.data && allresult.FolderInfo.data !== null) {
                    var ungroupInfoDetails = [], groupInfoDetails = [], values, val = [], folderInfoGroupLabel = [], groups = {};
                    var collapseId = 0
                    var i;
                    for (i = 0 ; i < allresult.FolderInfo.data.length; i++) {
                        if (allresult.FolderInfo.data[i].infotype.toLowerCase() === "date" || allresult.FolderInfo.data[i].infotype.toLowerCase() === "d") {
                            allresult.FolderInfo.data[i].infovalue = (allresult.FolderInfo.data[i].infovalue === "" || allresult.FolderInfo.data[i].infovalue === null || allresult.FolderInfo.data[i].infovalue === "Invalid date") ? "" : moment(allresult.FolderInfo.data[i].infovalue).format(dateformat);
                        }

                        var infoGroup = allresult.FolderInfo.data[i].infogroup;

                        var grp = $.grep(folderInfoGroupLabel, function (n, idx) {
                            if (n.key === infoGroup) return n;
                        });

                        if (grp.length > 0) {
                            grp[0].items.push(allresult.FolderInfo.data[i]);
                            grp[0].itemlength = grp[0].items.length;
                        }
                        else {

                            folderInfoGroupLabel.push({ key: infoGroup, items: [allresult.FolderInfo.data[i]], dataCollapse: collapseId, itemlength: 1 });
                            collapseId++;
                        }
                    }
                    $scope.folderinfocount = "(" + allresult.FolderInfo.data.length + ")";
                    $scope.FolderInfoDetails = folderInfoGroupLabel;
                    for (i = 0; i < folderInfoGroupLabel.length; i++) {
                        if (folderInfoGroupLabel[i].key === "") {
                            folderInfoGroupLabel[i].key = "Ungrouped Infos";
                        }
                        for (var j = 0; j < folderInfoGroupLabel[i].items.length; j++) {
                            var optionTypes = ["PICK", "CHOOSE", "MULTI_PICK", "P", "C"];
                            if (optionTypes.indexOf(folderInfoGroupLabel[i].items[j].infotype) >= 0) {
                                $scope.selectedValue = folderInfoGroupLabel[i].items[j].infovalue;
                                var selectedValue = folderInfoGroupLabel[i].items[j].infovalue;
                                var selectedType = folderInfoGroupLabel[i].items[j].infotype;
                                (function (currentitem, selected, selectedtype) {
                                    dataLayerService.getValidInfovalues(currentitem.infocode).then(function (response) {
                                        var options = [];
                                        for (var i = 0; i < response.data.length; i++) {
                                            var iCode = response.data[i].infocode;
                                            var iValue = response.data[i].infovalue;
                                            var iText = response.data[i].infodesc;
                                            if (iText == null || iText === "") {
                                                iText = iValue;
                                            }
                                            options.push({
                                                text: iText,
                                                value: iValue
                                            });
                                        }
                                        currentitem.validinfo = options;
                                        if (selectedtype === "MULTI_PICK" || selectedtype === "PICK" || selectedtype === "P" || selectedtype === "M") {
                                            var data = [];
                                            var actuallyData = selected.split(",");
                                            for (var i = 0; i < actuallyData.length; i++) {
                                                var selecteddata = $filter("filter")(options, { value: actuallyData[i] }, true);
                                                if (selecteddata.length > 0)
                                                    data.push(selecteddata[0].text);
                                                else {
                                                    data.push(actuallyData[i]);
                                                }
                                            }
                                            currentitem.selectedValue = data.join(",");

                                        }
                                        else {
                                            var checkifdataexists = $filter("filter")(options, { value: selected }, true);
                                            if (checkifdataexists.length > 0) {
                                                currentitem.selectedValue = checkifdataexists[0];
                                            } else {
                                                currentitem.selectedValue = { text: "Please Choose Info", value: "" };
                                            }
                                        }
                                    });
                                })(folderInfoGroupLabel[i].items[j], selectedValue, selectedType);




                            }
                        }
                    }
                }
                // Folder Info Record End Here

                // Process Type List Record Start here
                if (allresult.ProcessType && allresult.ProcessType.data != null && allresult.ProcessType.data.length > 0) {
                    var data = allresult.ProcessType.data;
                    if (data != null) {
                        for (var i = 0; i < data.length; i++) {
                            $scope.ProcessTypeList.push({
                                value: data[i].processcode,
                                name: data[i].processdesc,
                            });
                        }
                    }
                }
                // Process Type List Record End here

                // Folder Process Info Record Start here
                if (allresult.FolderProcessInfo && allresult.FolderProcessInfo.data && allresult.FolderProcessInfo.data !== null) {
                    var ungroupInfoDetails = [], groupInfoDetails = [], values, val = [], FolderProcessInfoGroupLabel = [], groups = {}, options = [], processcollapseId = 0;;

                    for (var i = 0 ; i < allresult.FolderProcessInfo.data.length; i++) {
                        var data = allresult.FolderProcessInfo.data[i];

                        if (data.infotype.toLowerCase() === "date" || data.infotype.toLowerCase() === "d") {
                            data.infovalue = (data.infovalue === "" || data.infovalue === null || data.infovalue === "Invalid date") ? "" : moment(data.infovalue).format(dateformat);
                        }
                        var infoGroup = data.infogroup;
                        var grp = $.grep(FolderProcessInfoGroupLabel, function (n, idx) {
                            if (n.key == infoGroup) return n;
                        });
                        if (grp.length > 0) {
                            grp[0].elements.push(data);
                        }
                        else {
                            FolderProcessInfoGroupLabel.push({ key: infoGroup, elements: [data], processCollapse: processcollapseId });
                            processcollapseId++;
                        }
                    }
                    $scope.FolderProcessInfoDetails = FolderProcessInfoGroupLabel;
                    for (var i = 0; i < FolderProcessInfoGroupLabel.length; i++) {
                        if (FolderProcessInfoGroupLabel[i].key == "") {
                            FolderProcessInfoGroupLabel[i].key = "Ungrouped Infos";
                        }
                        for (var j = 0; j < FolderProcessInfoGroupLabel[i].elements.length; j++) {
                            $scope.FolderProcessInfoValueChange = function (newValue, child) {
                                var dataText = [];
                                var dataValue = [];
                                var actuallyData = [];
                                if (child.infotype === "MULTI_PICK" || child.infotype === "M") {

                                    actuallyData = child.selectedValue.split(",");
                                    for (var i = 0; i < actuallyData.length; i++) {
                                        var selecteddata = $filter("filter")(child.validprocessinfo, { text: actuallyData[i] }, true);
                                        if (selecteddata.length > 0) {
                                            dataText.push(selecteddata[0].text);
                                            dataValue.push(selecteddata[0].value);
                                        }
                                        else {
                                            dataText.push(actuallyData[i]);
                                            dataValue.push(actuallyData[i]);
                                        }
                                    }
                                    child.selectedValue = dataText.join(",");
                                    child.infovalue = dataValue.join(",");
                                    newValue = dataValue.join(",");

                                }
                                if (child.infotype === "PICK" || child.infotype === "P") {
                                    actuallyData = child.selectedValue.split(",");
                                    for (var i = 0; i < actuallyData.length; i++) {
                                        var selecteddata = $filter("filter")(child.validprocessinfo, { text: actuallyData[i] }, true);
                                        if (selecteddata.length > 0) {
                                            dataText.push(selecteddata[0].text);
                                            dataValue.push(selecteddata[0].value);
                                        }
                                        else {
                                            dataText.push(actuallyData[i]);
                                            dataValue.push(actuallyData[i]);
                                        }
                                    }
                                    child.selectedValue = dataText[0];
                                    child.infovalue = dataValue[0];
                                    newValue = dataValue[0];
                                }
                                dataLayerService.updateValidProcessInfovalues(newValue, child.infocode, child.processrsn).then(function (response) {
                                    utilService.logtoConsole("data updated with response:" + response.data);
                                });

                            };
                            var optionTypeInfos = ["PICK", "MULTI_PICK", "CHOOSE", "P", "C"];
                            //if (FolderProcessInfoGroupLabel[i].elements[j].infotype == "PICK" || FolderProcessInfoGroupLabel[i].elements[j].infotype == "CHOOSE") {
                            if (optionTypeInfos.indexOf(FolderProcessInfoGroupLabel[i].elements[j].infotype) >= 0) {
                                $scope.selectedValue = FolderProcessInfoGroupLabel[i].elements[j].infovalue;
                                $scope.selectedType = FolderProcessInfoGroupLabel[i].elements[j].infotype;
                                (function (currentitem, selected, selectedtype) {
                                    dataLayerService.getValidProcessInfovalues(currentitem.infocode).then(function (response) {
                                        var options = [];
                                        for (var i = 0; i < response.data.length; i++) {
                                            var iCode = response.data[i].infocode;
                                            var iValue = response.data[i].infovalue;
                                            var iText = response.data[i].infodesc;

                                            options.push({
                                                text: iText,
                                                value: iValue
                                            });
                                        }
                                        currentitem.validprocessinfo = options;

                                        if (selectedtype === "MULTI_PICK" || selectedtype === "PICK" || selectedtype === "P" || selectedtype === "M") {
                                            var data = [];
                                            var actuallyData = selected.split(",");
                                            for (var i = 0; i < actuallyData.length; i++) {
                                                var selecteddata = $filter("filter")(options, { value: actuallyData[i] }, true);
                                                if (selecteddata.length > 0)
                                                    data.push(selecteddata[0].text);
                                                else {
                                                    data.push(actuallyData[i]);
                                                }
                                            }
                                            currentitem.selectedValue = data.join(",");

                                        }
                                        else {
                                            var checkifdataexists = $filter("filter")(options, { value: selected }, true);
                                            if (checkifdataexists.length > 0) {
                                                currentitem.selectedValue = checkifdataexists[0];
                                            } else {
                                                currentitem.selectedValue = { text: "Please Choose Info", value: "" };
                                            }
                                        }



                                    });
                                })(FolderProcessInfoGroupLabel[i].elements[j], $scope.selectedValue, $scope.selectedType);


                            }
                        }
                    }
                }
                // Folder Process Info Record End here

                //Folder Process Checklist Record Start here.
                if (allresult.FolderProcessChecklist && allresult.FolderProcessChecklist.data && allresult.FolderProcessChecklist.data !== null) {
                    $scope.selectedItems = [];
                    $scope.description = [];
                    var counter = 0, checklistcollapse = 0,
                        selection = [], listcode = "", checklistLabel = [], i;
                    for (i = 0; i < allresult.FolderProcessChecklist.data.length; i++) {
                        var data = allresult.FolderProcessChecklist.data[i];
                        counter++;
                        var yesNoNa = "";
                        if (data.notapplicableflag == "Y" || data.notapplicableflag == "true") {
                            yesNoNa = "na";
                        } else {
                            if (data.passed == "Y" || data.passed == "true") {
                                yesNoNa = "yes";
                            } else if (data.passed == "N" || data.passed == "false") {
                                yesNoNa = "no";
                            } else if (data.passed == "") {
                                if (window.event != undefined) {
                                    var z = window.event.srcElement;
                                    if (z.id == "radioYes")
                                        yesNoNa = "yes";
                                    else if (z.id == "radioNo")
                                        yesNoNa = "no";
                                }
                            }
                        }

                        var desc = {
                            checklistdesc: data.checklistdesc,
                            comment: data.checklistcomment,
                            passed: (data.passed == "Y" || data.passed == "true") ? true : false,
                            count: "radio" + "" + counter + "",
                            checklistcode: data.checklistcode,
                            processrsn: data.processrsn,
                            yesNoNA: yesNoNa
                        };
                        $scope.description.push(desc);

                        var checklistgroupdesc = data.checklistgroupdesc;
                        var checklistgroupcode = data.checklistgroupcode;

                        var grp = $.grep(checklistLabel, function (n, idx) {
                            if (n.code == checklistgroupcode) return n;
                        });

                        if (grp.length > 0) {
                            grp[0].checklistItems.push(desc);
                            grp[0].checklistItemlength = ++checklistItemlength;

                        }
                        else {
                            var checklistItemlength = 0;
                            checklistLabel.push({ key: checklistgroupdesc, code: checklistgroupcode, checklistItems: [desc], checklistgrouperID: checklistcollapse, checklistItemlength: ++checklistItemlength });
                            checklistcollapse++;
                        }
                    }
                    $scope.FolderProcessChecklistDetails = checklistLabel;
                    for (i = 0; i < checklistLabel.length; i++) {
                        if (checklistLabel[i].key === "") {
                            checklistLabel[i].key = "Ungrouped Items";
                        }
                    }
                }
                //Folder Process Checklist Record End here.

                // Valid Clause records start here
                if (allresult.ValidClause && allresult.ValidClause.data && allresult.ValidClause.data !== null) {
                    var clausegrouplabel = [], items = [], id = 0;
                    for (i = 0; i < allresult.ValidClause.data.length; i++) {

                        var clausegroup = allresult.ValidClause.data[i].clausegroup;

                        var grp = $.grep(clausegrouplabel, function (n, idx) {
                            id++;
                            if (n.key == clausegroup) {
                                return n;
                            }
                        });

                        if (grp.length > 0) {
                            grp[0].items.push(allresult.ValidClause.data[i]);
                        } else {
                            clausegrouplabel.push({ key: clausegroup, items: [allresult.ValidClause.data[i]], id: id });
                        }


                    }
                    // $scope.clausegroupvalue = $scope.clausegrouplist[0].name;

                    $scope.validclausegroup = clausegrouplabel;
                    $scope.clausegroup = clausegrouplabel[0].key;
                    $scope.clauesevalue = clausegrouplabel[0].items;
                }
                //Valid Clause records end here

                // Folder process attempt result code record start here
                if (allresult.AttemptResult && allresult.AttemptResult.data && allresult.AttemptResult.data !== null) {
                    var options = [];
                    for (var i = 0; i < allresult.AttemptResult.data.length; i++) {
                        var data = allresult.AttemptResult.data[i];
                        var resultcode = !isNaN(data.resultcode) ? Number(data.resultcode) : data.resultcode;
                        options.push({
                            value: resultcode,
                            name: data.resultdesc
                        });
                    }
                    $scope.InspectionProcessMetricsDetails.ResultList = options;
                }
                // Folder process attempt result code record end here

                // Inspection data strat here
                if (allresult.InspectionResult && allresult.InspectionResult.data && allresult.InspectionResult.data !== null) {
                    $scope.InspectionProcessMetricsDetails.FolderId = allresult.InspectionResult.data.folderid;
                    $scope.InspectionProcessMetricsDetails.FolderRSN = allresult.InspectionResult.data.folderrsn;
                    $scope.InspectionProcessMetricsDetails.ProcessId = allresult.InspectionResult.data.id;
                    $scope.InspectionProcessMetricsDetails.IsNew = allresult.InspectionResult.data.isnew;
                    $scope.InspectionProcessMetricsDetails.ProcessRSN = allresult.InspectionResult.data.processrsn;
                    $scope.InspectionProcessMetricsDetails.ProcessDesc = allresult.InspectionResult.data.processdesc;
                    $scope.InspectionProcessMetricsDetails.ProcessCode = allresult.InspectionResult.data.processcode;
                    $scope.InspectionProcessMetricsDetails.InspMinute = allresult.InspectionResult.data.inspminute;

                    if (allresult.InspectionResult.data.isreschedule !== "Y") {
                        $scope.InspectionProcessMetricsDetails.StartDate = (allresult.InspectionResult.data.startdate != "" && allresult.InspectionResult.data.startdate != null) ? moment(allresult.InspectionResult.data.startdate).format(dateformat) : "";
                        $scope.InspectionProcessMetricsDetails.EndDate = (allresult.InspectionResult.data.enddate != "" && allresult.InspectionResult.data.enddate != null) ? moment(allresult.InspectionResult.data.enddate).format(dateformat) : "";
                    }
                    else {
                        $scope.InspectionProcessMetricsDetails.StartDate = "";
                        $scope.InspectionProcessMetricsDetails.EndDate = "";
                    }

                    $scope.InspectionProcessMetricsDetails.ScheduleEndDate = (allresult.InspectionResult.data.scheduleenddate != "" && allresult.InspectionResult.data.scheduleenddate != null) ? moment(allresult.InspectionResult.data.scheduleenddate).format(dateformat) : "";
                    $scope.InspectionProcessMetricsDetails.ScheduleStartDate = (allresult.InspectionResult.data.schedulestartdate != "" && allresult.InspectionResult.data.schedulestartdate != null) ? moment(allresult.InspectionResult.data.schedulestartdate).format(dateformat) : "";
                    $scope.InspectionProcessMetricsDetails.StatusCode = allresult.InspectionResult.data.statuscode;
                    $scope.InspectionProcessMetricsDetails.StatusDesc = allresult.InspectionResult.data.statusdesc;
                    $scope.InspectionProcessMetricsDetails.AttemptCount = allresult.InspectionResult.data.attemptcount;
                    $scope.InspectionProcessMetricsDetails.Priority = allresult.InspectionResult.data.priority;
                    $scope.InspectionProcessMetricsDetails.Reference = allresult.InspectionResult.data.reference;
                    $scope.InspectionProcessMetricsDetails.DisplayOrder = allresult.InspectionResult.data.displayorder;
                    $scope.InspectionProcessMetricsDetails.InspectionNumber = allresult.InspectionResult.data.inspectionnumber;
                    $scope.InspectionProcessMetricsDetails.ProcessComment = allresult.InspectionResult.data.processcomment;
                    $scope.InspectionProcessMetricsDetails.AttemptId = allresult.InspectionResult.data.attemptid;
                    $scope.InspectionProcessMetricsDetails.AttempResultCode = allresult.InspectionResult.data.resultcode;
                    $scope.InspectionProcessMetricsDetails.SelectedAttempResultCode = $.grep($scope.InspectionProcessMetricsDetails.ResultList, function (e) { return e.value == $scope.InspectionProcessMetricsDetails.AttempResultCode; })[0];
                    var validsiteoptions = dataLayerService.getSiteOptions();
                    var defaultsign = "";
                    var isDefaultSignature = $filter('filter')(validsiteoptions, { optionkey: "Default Signature" }, true);
                    if (isDefaultSignature && isDefaultSignature.length > 0) {
                        defaultsign = isDefaultSignature[0].optionvalue;
                    }
                    $scope.InspectionProcessMetricsDetails.AttemptSignType = (allresult.InspectionResult.data.signaturetype === undefined || allresult.InspectionResult.data.signaturetype === null || allresult.InspectionResult.data.signaturetype === "") ? defaultsign : allresult.InspectionResult.data.signaturetype;

                    $scope.InspectionProcessMetricsDetails.AttemptComment = allresult.InspectionResult.data.attemptcomment;
                    $scope.InspectionProcessMetricsDetails.AttemptTime = allresult.InspectionResult.data.timeunit;
                    $scope.InspectionProcessMetricsDetails.AttemptOverTime = allresult.InspectionResult.data.overtime;
                    $scope.InspectionProcessMetricsDetails.AttemptUnit = allresult.InspectionResult.data.unittype;
                    $scope.InspectionProcessMetricsDetails.AttemptExpense = allresult.InspectionResult.data.expenseamount;
                    $scope.InspectionProcessMetricsDetails.AttemptMileage = allresult.InspectionResult.data.mileageamount;
                    $scope.InspectionProcessMetricsDetails.AttemptMileage = allresult.InspectionResult.data.mileageamount;
                    $scope.InspectionProcessMetricsDetails.TeamDesc = allresult.InspectionResult.data.teamdesc;
                    $scope.InspectionProcessMetricsDetails.TeamCode = allresult.InspectionResult.data.teamcode;
                    $scope.InspectionProcessMetricsDetails.AssignedUser = allresult.InspectionResult.data.assigneduser;



                    $scope.$broadcast("SignatureChanged", $scope.InspectionProcessMetricsDetails);

                }
                //Inspection data end here

                // History Process Attempt data start here
                if (allresult.HistoryProcessAttempt && allresult.HistoryProcessAttempt.data && allresult.HistoryProcessAttempt.data !== null) {
                    $scope.Message = "";
                    for (var i = 0; i < allresult.HistoryProcessAttempt.data.length; i++) {
                        var processrsn = allresult.HistoryProcessAttempt.data[i].processrsn;
                        var item = allresult.HistoryProcessAttempt.data[i];
                        var grp = $.grep($scope.AttemptHistoryList, function (n, idx) {
                            if (n.processrsn == processrsn) return n;
                        });
                        if (grp.length > 0) {
                            grp[0].attemptcount = ++counter;
                        }
                        else {
                            var counter = 0;
                            var enddate = (item.enddate !== "" && item.enddate !== null) ? moment(item.enddate).format(dateformat) : "";
                            var startdate = (item.scheduledate !== "" && item.scheduledate !== null) ? moment(item.scheduledate).format(dateformat) : "";
                            $scope.AttemptHistoryList.push({
                                id: i, menudown: "down" + i, menuright: "right" + i, processrsn: processrsn, processtype: item.processdesc,
                                startdate: startdate,
                                enddate: enddate,
                                status: item.statusdesc,
                                comment: item.processcomment,
                                attemptcount: ++counter,
                                folderType: inboxItem.folderType
                            });
                        }
                    }
                    $scope.historycount = "(" + allresult.HistoryProcessAttempt.data.length + ")";
                }
                else {
                    $scope.historycount = "";
                    $scope.Message = "No Record Found.";
                    $scope.showhistorydetails = false;
                }
                // History Process Attempt data end here

                // Attachmengt Type Data start here
                if (allresult.AttachmentType && allresult.AttachmentType.data && allresult.AttachmentType.data !== null) {
                    for (var k = 0 ; k < allresult.AttachmentType.data.length; k++) {
                        var list = allresult.AttachmentType.data[k];
                        $scope.attachmentTypeList.push({
                            Name: list.attachmentdesc,
                            Value: list.attachmentcode
                        });
                    }
                }
                // Attachment Type data End Here

                // Attachment Tab data start here
                if (allresult.Attachment && allresult.Attachment.data && allresult.Attachment.data !== null) {
                    $rootScope.ProcessFolderRSN = inboxItem;
                    var collapseId = 0;
                    $timeout(function () {
                        for (var k = 0 ; k < allresult.Attachment.data.length; k++) {
                            var data = allresult.Attachment.data[k];
                            var groupType = (data.attachmenttypedesc === null || data.attachmenttypedesc === "" || data.attachmenttypedesc === undefined) ? "Ungrouped Attachment" : data.attachmenttypedesc;
                            var grp = $.grep($scope.attachmentInfoList, function (n, idx) {
                                if (n.key == groupType) return n;
                            });
                            if (grp.length > 0) {
                                grp[0].items.push(data);
                                grp[0].itemlength = ++itemlength;
                            }
                            else {
                                var itemlength = 0;
                                $scope.attachmentInfoList.push({ key: groupType, items: [data], dataCollapse: collapseId, itemlength: ++itemlength });
                                collapseId++;
                            }
                        }
                        $scope.attachmentcount = "(" + allresult.Attachment.data.length + ")";
                        // Geting the index controller scope to update the value;
                        var scope = angular.element('[ng-controller=AttachmentTabCtrl]').scope()
                        scope.attachmentcount = "(" + allresult.Attachment.data.length + ")";
                        scope.attachmentInfoList = $scope.attachmentInfoList;

                    }, 100)
                }
                // Attachment Tab data end here

                // Report tab data start here
                if (allresult.Report && allresult.Report.data && allresult.Report.data !== null) {
                    for (var i = 0; i < allresult.Report.data.length; i++) {
                        $scope.reportList.push({
                            //folderNumber: String.format("{0}{1} {2} {3} {4} {5}", result.data[i].foldercentury, result.data[i].folderyear, result.data[i].foldersequence != null ? result.data[i].foldersequence.lpad("0", 6) : "000000", result.data[i].foldersection !== null ? result.data[i].foldersection.lpad("0", 3) : "000", result.data[i].folderrevision != null ? result.data[i].folderrevision.lpad("0", 2) : "00", result.data[i].foldertype),
                            //processType: result.data[i].processdesc,
                            //processTypeCode: result.data[i].processcode,
                            //folderStatus: result.data[i].statusdesc,
                            //folderRSN: result.data[i].folderrsn,
                            //processRSN: result.data[i].processrsn,
                            //folderType: result.data[i].foldertype,
                            //folderTypeDesc: result.data[i].folderdesc,
                            reportName: allresult.Report.data[i].reportname,
                            isAttached: false,// By default setting false it will be changed later on report controller after checking if this report is already saved in folderprocessattemptsignature table
                            reportDesc: allresult.Report.data[i].reportdescription
                            //signatureData: result.data[i].signaturedata
                        });
                    }
                    $scope.reportCount = allresult.Report.data.length;
                    angular.forEach($scope.reportList, function (val, index) {
                        var reportname = val.reportName;
                        dataLayerService.getReportData(inboxItem.processRSN, val.reportName, inboxItem.processId).then(function (result) {
                            if (result && result.isReportAttached) {
                                $filter('filter')($scope.reportList, { reportName: reportname }, true)[0].isAttached = result.isReportAttached;
                            } else {
                            }
                        });
                    });
                }
                // Report tab data end here

                //Valid folder Free form Tab data start here
                if (allresult.FolderFreeForm && allresult.FolderFreeForm.data && allresult.FolderFreeForm.data !== null && allresult.FolderFreeForm.data.length > 0) {
                    for (var i = 0; i < allresult.FolderFreeForm.data.length; i++) {
                        $scope.validFolerFreeFormTabList.push(allresult.FolderFreeForm.data[i]);
                    }
                    $rootScope.$broadcast("onFreeFromTabListLoaded", $scope.validFolerFreeFormTabList);
                } else {
                    CommonService.setHeights();
                }
                // Valid folder Free form Tab data end here

                //Valid folder process Free form Tab data start here
                if (allresult.FolderProcessFreeForm && allresult.FolderProcessFreeForm.data && allresult.FolderProcessFreeForm.data !== null && allresult.FolderProcessFreeForm.data.length > 0) {
                    for (var i = 0; i < allresult.FolderProcessFreeForm.data.length; i++) {
                        $scope.validFolerProcessFreeFormTabList.push(allresult.FolderProcessFreeForm.data[i]);
                    }
                    $rootScope.$broadcast("onFolerProcessFreeFormListLoaded", $scope.validFolerProcessFreeFormTabList);
                } else {
                    CommonService.setHeights();
                }
                //Valid folder process Free form Tab data End here

                // Folder Process List data start here
                if (allresult.FolderProcess && allresult.FolderProcess.data && allresult.FolderProcess.data !== null) {
                    var collapseId = 0;
                    for (var i = 0; i < allresult.FolderProcess.data.length; i++) {
                        var item = allresult.FolderProcess.data[i];
                        var grouptext = item.processdesc;
                        var processcode = item.processcode;
                        var processrsn = item.processrsn;
                        if (item.attemptdate !== "" && item.attemptdate !== undefined && item.attemptdate !== null) {
                            item.attemptdate = moment(item.attemptdate).format(dateformat);
                        } else {
                            item.attemptdate = "";
                        }

                        var grp = $.grep($scope.folderProcessList, function (n, idx) {
                            if (n.groupname === grouptext && n.processcode === processcode) return n;
                        });

                        if (grp.length > 0) {

                            var checkalreadyexistsprocess = $filter('filter')(grp[0].processlist, { processrsn: processrsn }, true);
                            if (checkalreadyexistsprocess.length > 0) {
                                checkalreadyexistsprocess[0].items.push(item)
                            } else {
                                grp[0].processlist.push({
                                    processrsn: item.processrsn,
                                    assigneduser: item.assigneduser,
                                    scheduledate: (item.scheduledate != null && item.scheduledate != "") ? moment(item.scheduledate).format(dateformat) : "",
                                    scheduleenddate: (item.scheduleenddate != null && item.scheduleenddate != "") ? moment(item.scheduleenddate).format(dateformat) : "",
                                    startdate: (item.startdate != null && item.startdate != "") ? moment(item.startdate).format(dateformat) : "",
                                    enddate: (item.enddate != null && item.enddate != "") ? moment(item.enddate).format(dateformat) : "",
                                    statusdesc: item.statusdesc,
                                    processcomment: item.processcomment,
                                    items: [item]
                                })
                            }
                        }
                        else {
                            $scope.folderProcessList.push({
                                groupname: grouptext,
                                processcode: item.processcode,
                                processlist: [{
                                    processrsn: item.processrsn,
                                    assigneduser: item.assigneduser,
                                    scheduledate: (item.scheduledate != null && item.scheduledate != "") ? moment(item.scheduledate).format(dateformat) : "",
                                    scheduleenddate: (item.scheduleenddate != null && item.scheduleenddate != "") ? moment(item.scheduleenddate).format(dateformat) : "",
                                    startdate: (item.startdate != null && item.startdate != "") ? moment(item.startdate).format(dateformat) : "",
                                    enddate: (item.enddate != null && item.enddate != "") ? moment(item.enddate).format(dateformat) : "",
                                    statusdesc: item.statusdesc,
                                    processcomment: item.processcomment,
                                    items: [item]
                                }]
                            });
                            collapseId++;
                        }
                    }


                    $scope.processCount = allresult.FolderProcess.data.length;
                }
                // Folder Process List data end here

                //Folder Comments Tab data start here
                if (allresult.FolderComment && allresult.FolderComment.data && allresult.FolderComment.data !== null) {
                    var collapseId = 0;
                    for (var i = 0; i < allresult.FolderComment.data.length; i++) {
                        var item = allresult.FolderComment.data[i];

                        var grouptext = item.commentgroupdesc;
                        var groupcode = item.commentgroupcode;
                        if (grouptext === "" || grouptext === undefined) {
                            grouptext = "Ungrouped Comments";
                        }
                        var grp = $.grep($scope.folderCommentList, function (n, idx) {
                            if (n.groupcode === groupcode)
                                return n;
                        });
                        var obj = {
                            commentdate: (item.commentdate != null && item.commentdate != "") ? moment(item.commentdate).format(dateformat) : "",
                            reminderdate: (item.reminderdate != null && item.reminderdate != "") ? moment(item.reminderdate).format(dateformat) : "",
                            madeondate: (item.commentdate != null && item.commentdate != "") ? moment(item.commentdate).format(dateformat) : "",
                            comments: $sce.trustAsHtml(item.comments),
                        }
                        if (grp.length > 0) {
                            grp[0].items.push(obj);
                            grp[0].itemlength = grp[0].items.length;
                        }
                        else {
                            $scope.folderCommentList.push({
                                groupname: grouptext,
                                groupcode: groupcode,
                                items: [obj], dataCollapse: collapseId, itemlength: 1
                            });
                            collapseId++;
                        }
                    }
                    $scope.folderCommentCount = allresult.FolderComment.data.length;
                }
                // Folder Comments Tab data end here

                // Folder Fee Tab data Start Here
                if (allresult.FolderFee && allresult.FolderFee.data && allresult.FolderFee.data !== null) {
                    var collapseId = 0;
                    $scope.total = {
                        totalBalanceDue: 0,
                        totalUnBilled: 0,
                        totalOutstanding: 0,
                        totalLeft: 0,
                        totalPaid: 0,
                        totalPostDated: 0,
                        totalNFS: 0,
                        totalVoid: 0,
                        totalRefund: 0,
                        totalTransfer: 0,
                    };
                    for (var i = 0; i < allresult.FolderFee.data.length; i++) {
                        var item = allresult.FolderFee.data[i];
                        var groupcode = item.billnumber;
                        var dategenerated = (item.dategenerated !== "" && item.dategenerated !== undefined) ? moment(item.dategenerated).format(dateformat) : "";
                        var duedate = (item.duedate !== "" && item.duedate !== undefined) ? moment(item.duedate).format(dateformat) : "";

                        var grp = $.grep($scope.folderFeeList, function (n, idx) {
                            if (n.groupcode === groupcode)
                                return n;
                        });
                        var obj = {
                            feecode: item.feecode,
                            feedesc: item.feedesc,
                            feecomment: item.feecomment,
                            feeamount: item.feeamount,
                            feeleft: item.feeleft,
                            ispaid: (item.feeleft == "" || item.feeleft == 0) ? 'Yes' : 'No'
                        }
                        var indivisualoutstanding = item.feeleft;
                        $scope.total.totalBalanceDue += (item.feeamount === "" || item.feeamount === undefined || item.feeamount === null) ? 0 : item.feeamount;
                        $scope.total.totalLeft += (item.feeleft === "" || item.feeleft === undefined || item.feeleft === null) ? 0 : item.feeleft;
                        $scope.total.totalPaid = $scope.total.totalBalanceDue - $scope.total.totalLeft
                        if (grp.length > 0) {
                            grp[0].items.push(obj);
                            grp[0].itemlength = grp[0].items.length;

                            $filter('filter')($scope.folderFeeList, { groupcode: groupcode })[0].indivisualOutStanding += item.feeleft;
                        }
                        else {
                            $scope.folderFeeList.push({
                                indivisualOutStanding: indivisualoutstanding,
                                groupcode: groupcode,
                                dategenerated: dategenerated,
                                duedate: duedate,
                                items: [obj], dataCollapse: collapseId, itemlength: 1
                            });
                            collapseId++;
                        }
                    }
                    $scope.folderFeeCount = allresult.FolderFee.data.length;
                }
                // Folder Fee Tab data end here

                // Folder Fixture Tab Data start here
                if (allresult.FolderFixture && allresult.FolderFixture.data && allresult.FolderFixture.data !== null) {
                    var collapseId = 0;
                    for (var i = 0; i < allresult.FolderFixture.data.length; i++) {
                        var item = allresult.FolderFixture.data[i];
                        var grouptext = item.fixturegroup;
                        if (grouptext === "" || grouptext === undefined) {
                            grouptext = "Ungrouped Fixture";
                        }
                        var grp = $.grep($scope.folderFixtureList, function (n, idx) {
                            if (n.groupname === grouptext)
                                return n;
                        });
                        var totalquantity = (item.quantity === "" || item.quantity === undefined || item.quantity === null) ? 0 : item.quantity;
                        if (grp.length > 0) {
                            grp[0].items.push(item);
                            grp[0].itemlength = grp[0].items.length;
                            $filter('filter')($scope.folderFixtureList, { groupname: grouptext })[0].totalQuantity += totalquantity;
                        }
                        else {
                            $scope.folderFixtureList.push({
                                groupname: grouptext,
                                totalQuantity: totalquantity,
                                items: [item], dataCollapse: collapseId, itemlength: 1
                            });
                            collapseId++;
                        }
                    }
                    $scope.folderFixtureCount = allresult.FolderFixture.data.length;
                }
                // Folder Fixture Tab Data End here

                // Folder Document Tab data start here
                if (allresult.FolderDocument && allresult.FolderDocument.data && allresult.FolderDocument.data !== null) {
                    var collapseId = 0;
                    for (var i = 0; i < allresult.FolderDocument.data.length; i++) {
                        var item = allresult.FolderDocument.data[i];
                        var grouptext = item.fixturegroup;
                        if (grouptext === "" || grouptext === undefined) {
                            grouptext = "Ungrouped Documents";
                        }
                        item.dategenerated = (item.dategenerated != null && item.dategenerated != "") ? moment(item.dategenerated).format(dateformat) : "";
                        var grp = $.grep($scope.folderFixtureList, function (n, idx) {
                            if (n.groupname === grouptext)
                                return n;
                        });

                        if (grp.length > 0) {
                            grp[0].items.push(item);
                            grp[0].itemlength = grp[0].items.length;

                        }
                        else {
                            $scope.folderDocumentList.push({
                                groupname: grouptext,
                                items: [item], dataCollapse: collapseId, itemlength: 1
                            });
                            collapseId++;
                        }
                    }
                    $scope.folderDocumentCount = allresult.FolderDocument.data.length;
                }
                // Folder Document tab data End Here

                $timeout(function () {
                    //scroll to process attempts
                    angular.element(".toattempt").click(function () {
                        var metricsheight = angular.element("#metrics").height();
                        var testrowheight = angular.element('#testrow').height();

                        $($("#demo").parent()).animate({
                            top: -(metricsheight + testrowheight + 18)
                        }, "100");
                    });
                    //scroll to process info
                    angular.element(".toprocessinfo").click(function () {
                        var metricsheight = angular.element("#metrics").height();
                        var testrowheight = angular.element('#testrow').height();
                        var processattemptheight = angular.element("#processattempt").height();

                        $($("#demo").parent()).animate({
                            top: -(metricsheight + testrowheight + processattemptheight + 54)
                        }, "100");

                    });
                    //scroll to checklist
                    angular.element(".tochecklist").click(function () {
                        var metricsheight = angular.element("#metrics").height();
                        var testrowheight = angular.element('#testrow').height();
                        var infoheight = angular.element("#info").height();
                        var processattemptheight = angular.element("#processattempt").height();

                        $($("#demo").parent()).animate({
                            top: -(metricsheight + testrowheight + processattemptheight + infoheight + 72)
                        }, "100");
                    });

                    // Applying date format for date fields start here
                    angular.element(".input-group.date").datetimepicker({
                        format: dateformat
                    });
                    // Applying date format for date fields End here
                })







                CommonService.broadCastSelecteItem(inboxItem, "Inbox");

                var isreassignement = $filter('filter')(validsiteoptions, { optionkey: "Process re-assignment enabled" }, true);
                if (isreassignement && isreassignement.length > 0) {
                    if (isreassignement[0].optionvalue.toLowerCase() === "yes") {
                        $scope.isReassignementEnabled = true;
                        dataLayerService.getAllValidUserId().then(function (result) {
                            if (result && result.data && result.data.length > 0) {
                                for (var k = 0 ; k < result.data.length; k++) {
                                    var list = result.data[k];
                                    $scope.validUserList.push({
                                        Name: result.data[k].username,
                                        Value: result.data[k].userid
                                    });
                                }
                            }
                            var signeduser = $filter('filter')($scope.validUserList, { Value: $scope.username }, true);
                            if (signeduser && signeduser.length > 0) {
                                $scope.reassignedUser.selectedValidUser = signeduser[0].Value;
                            }
                        });
                    }
                }

                // Create Watch on Inspection data start here
                $scope.inspectionProcessMatricsWatch = $scope.$watch("InspectionProcessMetricsDetails", function (newvalue, oldvalue) {
                    //create a list of changed fields
                    var changedFields = [], databaseField = [];

                    //checking if signature type changed
                    if (newvalue.AttemptSignType !== oldvalue.AttemptSignType) {
                        $scope.$broadcast("SignatureChanged", newvalue);
                    }
                    else if (newvalue.ProcessComment !== oldvalue.ProcessComment) {
                        dataLayerService.updateProcessComment(newvalue.IsNew, newvalue.ProcessRSN, newvalue.ProcessId, newvalue.ProcessComment).then(function (result) {
                            if (result.error || result.result == null || !result.result.isSuccess) {
                                utilService.showError("Process comment update failed...", 'error');
                            }
                        });
                    }
                    else {
                        if (newvalue.SelectedAttempResultCode !== oldvalue.SelectedAttempResultCode) {

                            newvalue.AttempResultCode = (newvalue.SelectedAttempResultCode === "" || newvalue.SelectedAttempResultCode === undefined) ? "" : newvalue.SelectedAttempResultCode.value;
                            changedFields.push("AttempResultCode");
                            databaseField.push("resultcode");
                        }
                        if (newvalue.AttemptTime !== oldvalue.AttemptTime) {
                            changedFields.push("AttemptTime");
                            databaseField.push("timeunit");
                        }

                        if (newvalue.AttemptOverTime !== oldvalue.AttemptOverTime) {
                            changedFields.push("AttemptOverTime");
                            databaseField.push("overtime");
                        }
                        if (newvalue.AttemptMileage !== oldvalue.AttemptMileage) {
                            changedFields.push("AttemptMileage");
                            databaseField.push("mileageamount");
                        }
                        if (newvalue.AttemptUnit !== oldvalue.AttemptUnit) {
                            changedFields.push("AttemptUnit");
                            databaseField.push("unittype");
                        }
                        if (newvalue.AttemptExpense !== oldvalue.AttemptExpense) {
                            changedFields.push("AttemptExpense");
                            databaseField.push("expenseamount");
                        }
                        if (newvalue.AttemptComment !== oldvalue.AttemptComment) {
                            changedFields.push("AttemptComment");
                            databaseField.push("attemptcomment");
                        }
                        var newValues = [];
                        if (changedFields.length > 0) {
                            for (var i = 0; i < changedFields.length; i++) {
                                newValues.push($scope.InspectionProcessMetricsDetails[changedFields[i]]);
                            }
                            dataLayerService.updateAttempt($scope.InspectionProcessMetricsDetails.AttemptId, databaseField, newValues).then(function (result) {
                                if (result.error || result.result == null || !result.result.isSuccess) {
                                    utilService.showError("update failed..." + changedFields[0], 'error');
                                }
                            });
                        }
                    }
                }, true);
                // Create Watch on Inspection data End here
                cfpLoadingBar.complete();
            })

        };

        $scope.collapseData = function () {
            angular.element(".glyphicon").addClass("glyphicon-plus").removeClass("glyphicon-minus");
            if ($(this).find(".glyphicon").hasClass("glyphicon-plus")) {
                $(this).find(".glyphicon").addClass("glyphicon-minus").removeClass("glyphicon-plus");
            }
        };

        $scope.toggleSelection = function (text) {
            $scope.selectedItems.push(text);
        };
        $scope.ChangeClause = function (newvalue) {

            var clauselist = [];
            for (i = 0; i < clausegrouplabel.length; i++) {
                if (clausegrouplabel[i].key === newvalue) {
                    $scope.clauesevalue = clausegrouplabel[i].items;
                }
            }

        };
        $scope.openclauseForm = function (code, fromwhere) {

            $scope.fromfield = fromwhere;

            var x = document.getElementsByName("clauselist");
            for (i = 0; i < x.length; i++) {
                x[i].checked = false;
            }

            if ($scope.fromfield == "fromChecklist") {
                listcode = code;

                $scope.descriptionobj = [];

                $scope.descriptionobj = $.grep($scope.description, function (n, idx) {
                    if (n.checklistcode == listcode) {
                        return n;
                    }
                });
            }

        };
        $scope.addclausevalue = function () {

            var fromfield = document.getElementById("hiddenfield").value;

            if (fromfield == "fromChecklist") {
                $timeout(function () {
                    var storedcomment = "";
                    if ($scope.descriptionobj[0].comment != "") {
                        storedcomment = $scope.descriptionobj[0].comment + ",";
                    }
                    var commentstr = $scope.selectedItems.toString();
                    $scope.descriptionobj[0].comment = storedcomment + commentstr;

                    for (var i = 0; i < $scope.FolderProcessChecklistDetails.length; i++) {
                        var listItems = $scope.FolderProcessChecklistDetails[i].checklistItems;
                        for (var j = 0 ; j < listItems.length; j++) {
                            var checklListcCode = listItems[j].checklistcode;
                            if (listcode == checklListcCode) {
                                dataLayerService.updateChecklistcomment(listItems[j].comment, listItems[j].checklistcode, listItems[j].processrsn).then(function (response) {
                                    utilService.logtoConsole("data updated with response:" + response.data);
                                });
                            }
                        }
                    }

                    $scope.selectedItems = [];
                }, 0, false);

            }
            else if (fromfield == "fromProcessComment") {
                $timeout(function () {
                    var storedcomment = "";
                    if ($scope.InspectionProcessMetricsDetails.ProcessComment != "") {
                        storedcomment = $scope.InspectionProcessMetricsDetails.ProcessComment + ",";
                    }
                    var commentstr = $scope.selectedItems.toString();
                    $scope.InspectionProcessMetricsDetails.ProcessComment = storedcomment + commentstr;

                    $scope.selectedItems = [];
                    $timeout(function () {
                        $('textarea[ng-model="InspectionProcessMetricsDetails.ProcessComment"]').click();
                    });


                }, 0, false);

            }
            else if (fromfield == "fromAttemptComment") {
                $timeout(function () {
                    var storedcomment = "";
                    if ($scope.InspectionProcessMetricsDetails.AttemptComment != "") {
                        storedcomment = $scope.InspectionProcessMetricsDetails.AttemptComment + ",";
                    }
                    var commentstr = $scope.selectedItems.toString();
                    $scope.InspectionProcessMetricsDetails.AttemptComment = storedcomment + commentstr;

                    $scope.selectedItems = [];

                    $timeout(function () {
                        $('textarea[ng-model="InspectionProcessMetricsDetails.AttemptComment"]').click();
                    });

                }, 500, false);

            }

            else if (fromfield == "fromDefComment") {
                $timeout(function () {
                    var storedcomment = "";
                    if ($scope.deficiencyVariables.variables.deficiencyText !== "" && $scope.deficiencyVariables.variables.deficiencyText !== null && $scope.deficiencyVariables.variables.deficiencyText !== undefined) {
                        storedcomment = $scope.deficiencyVariables.variables.deficiencyText + ",";
                    }
                    var commentstr = $scope.selectedItems.toString();
                    $scope.deficiencyVariables.variables.deficiencyText = storedcomment + commentstr;
                    $scope.selectedItems = [];
                    $timeout(function () {
                        $('textarea[ng-model="deficiencyVariables.variables.deficiencyText"]').click();
                    });



                }, 500);

            }
            else if (fromfield == "fromRemedyComment") {
                $timeout(function () {
                    var storedcomment = "";
                    if ($scope.deficiencyVariables.variables.remedyText !== "" && $scope.deficiencyVariables.variables.remedyText !== null && $scope.deficiencyVariables.variables.remedyText !== undefined) {
                        storedcomment = $scope.deficiencyVariables.variables.remedyText + ",";
                    }

                    var commentstr = $scope.selectedItems.toString();
                    $scope.deficiencyVariables.variables.remedyText = storedcomment + commentstr;
                    $timeout(function () {
                        $('textarea[ng-model="deficiencyVariables.variables.remedyText"]').click();
                    });

                    $scope.selectedItems = [];

                }, 500);

            }

            angular.element("#myClauseModal").removeClass("fade").modal("hide");
        };
        $scope.updatecomment = function (parent) {
            dataLayerService.updateChecklistcomment(parent.comment, parent.checklistcode, parent.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        };
        $scope.yesSelected = function (parent) {
            var passed = "Y";
            var flag = "";
            dataLayerService.updateValidChecklistvalues(passed, flag, parent.checklistcode, parent.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        };
        $scope.noSelected = function (parent) {
            var passed = 'N';
            var flag = "";
            dataLayerService.updateValidChecklistvalues(passed, flag, parent.checklistcode, parent.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        };
        $scope.flagSelected = function (parent) {
            var flag = "Y";
            var passed = '';
            dataLayerService.updateNAChecklistFlag(flag, parent.checklistcode, parent.processrsn).then(function (response) {
                //dataLayerService.updateValidChecklistvalues(passed, flag, parent.checklistcode, parent.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        };
        $scope.InsertFolderProcessInfoNewValue = function (newValue, child) {
            dataLayerService.updateValidProcessInfovalues(newValue, child.infocode, child.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
                child.infovalue = newValue;
            });
        };
        $scope.FolderProcessInfoSelectionChange = function (newValue, child) {
            var newdata = "";
            if (newValue && newValue !== null) {
                newdata = newValue.value;
            }
            dataLayerService.updateValidProcessInfovalues(newdata, child.infocode, child.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
                child.infovalue = newdata;
            });

        };
        $scope.yesRadioSelected = function (item) {
            var yeschecked = "Y";
            dataLayerService.updateValidInfovalues(yeschecked, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);

            });
        }
        $scope.noRadioSelected = function (item) {
            var nochecked = "N";
            dataLayerService.updateValidInfovalues(nochecked, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);

            });
        }
        $scope.inputChange = function (newValue, item) {
            var dataText = [];
            var dataValue = [];
            var actuallyData = [];
            if (item.infotype === "MULTI_PICK" || item.infotype === "M") {

                actuallyData = item.selectedValue.split(",");
                for (var i = 0; i < actuallyData.length; i++) {
                    var selecteddata = $filter("filter")(item.validinfo, { text: actuallyData[i] }, true);
                    if (selecteddata.length > 0) {
                        dataText.push(selecteddata[0].text);
                        dataValue.push(selecteddata[0].value);
                    }
                    else {
                        dataText.push(actuallyData[i]);
                        dataValue.push(actuallyData[i]);
                    }
                }
                item.selectedValue = dataText.join(",");
                item.infovalue = dataValue.join(",");
                newValue = dataValue.join(",");

            }
            if (item.infotype === "PICK" || item.infotype === "P") {
                actuallyData = item.selectedValue.split(",");
                for (var i = 0; i < actuallyData.length; i++) {
                    var selecteddata = $filter("filter")(item.validinfo, { text: actuallyData[i] }, true);
                    if (selecteddata.length > 0) {
                        dataText.push(selecteddata[0].text);
                        dataValue.push(selecteddata[0].value);
                    }
                    else {
                        dataText.push(actuallyData[i]);
                        dataValue.push(actuallyData[i]);
                    }
                }
                item.selectedValue = dataText[0];
                item.infovalue = dataValue[0];
                newValue = dataValue[0];
            }
            dataLayerService.updateValidInfovalues(newValue, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });

        };
        $scope.DateChanger = function (newValue, item) {
            var date;
            newValue = event.target.value;
            if (newValue != null && newValue !== "") {
                date = moment(newValue).format('YYYY-MM-DD hh:mm:ss');

            }
            else date = "";
            dataLayerService.updateValidInfovalues(date, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);

            });

        };
        $scope.insertNewValidValue = function (newValue, item) {
            dataLayerService.updateValidInfovalues(newValue, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
                item.infovalue = newValue;
                var selectedvalue = $filter("filter")(item.validinfo, { value: newValue }, true);
                if (selectedvalue.length > 0) {
                    item.selectedValue = selectedvalue[0];
                }
                else {
                    item.selectedValue = { text: "", value: "" };
                }


            });
        };
        $scope.SelectChange = function (newValue, item) {
            var newdata = "";
            if (newValue && newValue !== null) {
                newdata = newValue.value
            }
            dataLayerService.updateValidInfovalues(newdata, item.infocode, item.folderrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
                //$scope.selectedValue = newValue.value;
                item.infovalue = newdata;
            });
        };
        $scope.yesProcessInfoSelected = function (child) {
            var newValue = "Yes";
            dataLayerService.updateValidProcessInfovalues(newValue, child.infocode, child.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        }
        $scope.noProcessInfoSelected = function (child) {
            var newValue = "No";
            dataLayerService.updateValidProcessInfovalues(newValue, child.infocode, child.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);
            });
        }
        $scope.FolderProcessInfoDateChange = function (newValue, child) {
            var date;
            newValue = event.target.value;
            if (newValue != null && newValue != "") {
                date = moment(newValue).format('YYYY-MM-DD hh:mm:ss');
            }
            else date = "";
            dataLayerService.updateValidProcessInfovalues(date, child.infocode, child.processrsn).then(function (response) {
                utilService.logtoConsole("data updated with response:" + response.data);

            });

        };
        $scope.InspectionProcessMetricsDetails = {
            ProcessRSN: "",
            ProcessDesc: "",
            ProcessCode: "",
            InspMinute: "",
            TeamDesc: "",
            AssignedUser: "",
            StartDate: "",
            ReScheduleDate: "",
            StatusCode: "",
            StatusDesc: "",
            AttemptCount: "",
            Priority: "",
            ProcessComment: "",
            ResultList: [],
            AttemptTime: "",
            AttemptOverTime: "",
            AttemptUnit: "",
            AttemptMileage: "",
            AttemptExpense: "",
            AttemptSignType: "",
            AttemptComment: "",
            SignatureTypeList: $scope.SignatureTypeList,
            UnitTypeList: [{ value: "M", name: "Minutes" }, { value: "H", name: "Hours" }],
            AttemptBy: "",
            AttemptDate: "",
            FolderRSN: "",
            FolderId: "",
            AttemptSignData: "",
            AttemptId: -1,
            AttempResultCode: '',
            SelectedAttempResultCode: '',
            IsRescheduled: '',
            ReScheduleEndDate: "",
        };
        $scope.selectedProcessCommentItems = [];
        $scope.selectProcessComment = function (text) {
            $scope.selectedProcessCommentItems.push(text);
        };
        $scope.openResultProcessComment = function () {
            var x = document.getElementsByName("clauselist");
            for (var i = 0; i < x.length; i++) {
                x[i].checked = false;
            }
        };
        //Process Comment Section End

        //Attempt Comment Section Start
        $scope.selectedAttemptCommentItems = [];
        $scope.selectAttemptComment = function (text) {
            $scope.selectedAttemptCommentItems.push(text);
        };
        $scope.openResultAttemptComment = function () {
            var x = document.getElementsByName("clauselist");
            for (var i = 0; i < x.length; i++) {
                x[i].checked = false;
            }
        };
        //Attempt Comment Section End
        $scope.okFolderInfoHandler = function () {
            toastr.remove();
            toastr.options = CommonService.getDefaultToastrOptions();
            $('[aria-controls="folderinfo"]').trigger("click");
        }
        $scope.okFolderProcessInfoHandler = function () {
            toastr.remove();
            toastr.options = CommonService.getDefaultToastrOptions();
            var metricsheight = angular.element("#metrics").height();
            var testrowheight = angular.element('#testrow').height();
            var processattemptheight = angular.element("#processattempt").height();

            $($("#demo").parent()).animate({
                top: -(metricsheight + testrowheight + processattemptheight + 54)
            }, "100");
        }
        // Complete button section strat
        $scope.completeInspection = function (item) {

            var messageForRequiredInfo = "Inspection could not be completed due to below reason<br/> Required Folder Info:<br/>";
            var showmessage = false;
            $.map($scope.FolderInfoDetails, function (group, index) {
                if (group && group.items && group.items.length > 0) {
                    $.map(group.items, function (item, itemindex) {
                        if (item.valuerequired && item.valuerequired === 'Y') {
                            if (item.infovalue === "" || item.infovalue === null || item.infovalue === undefined) {
                                messageForRequiredInfo += item.infodesc + "<br/>";
                                showmessage = true;
                            }
                        }
                    });
                }

            });

            if (showmessage) {
                messageForRequiredInfo += "is required.<br/>"
                messageForRequiredInfo += "Please provide the value for respective folder info before completing the inspection"
                // utilService.showError(messageForRequiredInfo, "info", true);
                toastr.options = CommonService.getCustomToastrOptions();
                var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Ok</button></div>";
                toastr.info(html, messageForRequiredInfo, {
                    allowHtml: true,
                    onShown: function (html) {
                        $("#yesConfirm").on('click', function (event) {
                            $scope.okFolderInfoHandler();
                        });
                    }
                });
                return;
            }



            var messageForRequiredInfo = "Inspection could not be completed due to below reason<br/> Required Folder Process Info:<br/>";
            var showmessage = false;
            $.map($scope.FolderProcessInfoDetails, function (group, index) {
                if (group && group.item && group.items.length > 0) {
                    $.map(group.items, function (item, itemindex) {
                        if (item.valuerequired && item.valuerequired === 'Y') {
                            if (item.infovalue === "" || item.infovalue === null || item.infovalue === undefined) {
                                messageForRequiredInfo += item.infodesc + "<br/>";
                                showmessage = true;
                            }
                        }
                    });
                }

            });

            if (showmessage) {
                messageForRequiredInfo += "is required.<br/>"
                messageForRequiredInfo += "Please provide the value for respective folder info before completing the inspection"
                // utilService.showError(messageForRequiredInfo, "info", true);
                toastr.options = CommonService.getCustomToastrOptions();
                var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Ok</button></div>";
                toastr.info(html, messageForRequiredInfo, {
                    allowHtml: true,
                    onShown: function (html) {
                        $("#yesConfirm").on('click', function (event) {
                            $scope.okFolderProcessInfoHandler();
                        });
                    }
                });
                return;
            }


            if (item.AttempResultCode == null || item.AttempResultCode == '' || item.AttempResultCode == undefined) {
                utilService.showError("Select inspection result before completing inspection", 'error');
                return;
            }

            var validsiteoptions = dataLayerService.getSiteOptions();
            var issignaturereq = $filter('filter')(validsiteoptions, { optionkey: "Signature Required to Complete Inspection" }, true);
            if (issignaturereq && issignaturereq.length > 0) {
                if (issignaturereq[0].optionvalue.toLowerCase() === "yes") {

                    if (item.AttempResultCode == null || item.AttempResultCode == '' || item.AttempResultCode == undefined) {
                        utilService.showError("Select inspection result before completing inspection", 'error');
                        return;
                    }

                    dataLayerService.checkIfInspectionHasSign($scope.InspectionProcessMetricsDetails.AttemptId).then(function (resultins) {
                        if (resultins && resultins.data && resultins.data === true) {
                            $scope.completeinspections(item);
                        } else {
                            utilService.showError("Signature Required to Complete Inspection.", 'error');
                            return;
                        }
                    });
                }
                else {
                    $scope.completeinspections(item);
                }
            } else {
                $scope.completeinspections(item);
            }
        };
        $scope.completeinspections = function (item) {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var datatosave = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    datatosave.processRSN = item.ProcessRSN;
                    dataLayerService.updateProcessCoordXY(datatosave).then(function (result) {
                        utilService.showError("Device Current Geolocation saved. ", "info");
                    })
                }, function () {
                    utilService.showError("Could not found device current geolocation. Saving start point geolocation ", "error");
                    var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));
                    if (startPointSettings && startPointSettings.location) {
                        var datatosave = {
                            lat: startPointSettings.location.lat,
                            lng: startPointSettings.location.lng
                        };
                        datatosave.processRSN = item.ProcessRSN;
                        dataLayerService.updateProcessCoordXY(datatosave).then(function (result) {
                            utilService.showError("Your start point Geolocation saved. ", "info");
                        });
                    } else {
                        utilService.showError("No location saved while completing inspection. ", "info");
                    }
                });
            } else {
                // Browser doesn't support Geolocation
                utilService.showError("Browser doesn't support Geolocation ", "error");
            }

            var attemptdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            $scope.InspectionProcessMetricsDetails.AttemptDate = attemptdate;
            var storedUser = JSON.parse(localStorage.getItem("userSettings"));
            $scope.InspectionProcessMetricsDetails.AttemptBy = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
            dataLayerService.insertFolderProcessAttempt(item).then(function (result) {
                if (result.data != null) {
                    if (result.data === "success") {
                        utilService.showError("Inspection completed successfully. ", "success");
                        $scope.ClosePanel();
                        $scope.listInbox = $.grep($scope.listInbox, function (e) { return e.processRSN != item.ProcessRSN });
                        if ($scope.listInbox > $scope.numPerPageInbox) {
                            $scope.bigTotalInboxItems = items.length;
                        }
                        //$scope.showInboxList();
                    }
                } else if (result.error != null) {
                    utilService.showError("Inspection could not be completed.", "error");
                }
            });
        }
        $scope.rescheduleInspection = function (item) {
            $timeout(function () {
                var attemptdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
                item.AttemptDate = attemptdate;
                var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                item.AttemptBy = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                item.ReScheduleDate = moment(item.ReScheduleDate).format('YYYY-MM-DD hh:mm:ss');
                item.ReScheduleEndDate = moment(item.ReScheduleDate).format('YYYY-MM-DD hh:mm:ss');
                item.IsRescheduled = 'Y';

                if ($scope.username !== $scope.reassignedUser.selectedValidUser) {
                    item.reassignedUser = $scope.reassignedUser.selectedValidUser;
                } else {
                    item.reassignedUser = "";
                }

                dataLayerService.saveRescheduledInspection(item).then(function (result) {
                    if (result.data != null && result.data.length > 0) {
                        $('#rescheduleInspectionModal').modal('hide');
                        angular.element("#rescheduleInspectionModal").removeClass("fade").modal("hide");
                        angular.element(".modal-backdrop").fadeOut("slow");
                        $scope.ClosePanel();
                        //$scope.showInboxList();
                        $scope.listInbox = $.grep($scope.listInbox, function (e) { return e.processRSN != item.ProcessRSN });
                    }
                });
            }, 0);

        };
        $scope.selectValidFreeFormTab = function (freeformcode, folderrsn, selectedindex) {
            if (freeformcode) {
                var data = {
                    freeformcode: freeformcode, folderrsn: folderrsn, index: selectedindex
                }
                $rootScope.$broadcast("onFolderFreeFromTabSelect", data);
            }
        }
        $scope.selectValidFolderProcessFreeFormTab = function (freeformcode, folderrsn, selectedindex, processrsn) {
            if (freeformcode) {
                var data = {
                    freeformcode: freeformcode, folderrsn: folderrsn, index: selectedindex, processrsn: processrsn
                }
                $rootScope.$broadcast("onFolderProcessFreeFromTabSelect", data);
            }
        }

        $scope.downloadFolderDocument = function (documentrsn) {
            var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
            if ($.isArray(storedUser) && storedUser.length > 0) {
                $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                $scope.password = storedUser[0].password;
                requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, function (result) {
                    if (result.error == null) {
                        if (result.response) {
                            if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0) {
                                utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
                            } else if (result.response.lid.indexOf("Error") < 0) {
                                $scope.userSettings = [];
                                $scope.userSettings.push({
                                    username: $scope.username,
                                    password: $scope.password,
                                    lid: result.response.lid,
                                    validuser: result.response.validUser
                                });
                                CommonService.setLoggedUser($scope.username);
                                localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));
                                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                                var url = settings[0].Host + "_DocumentDownload.jsp?documentRSN=" + documentrsn + "&lid=" + result.response.lid;
                                var childwindow = window.open(url, "_blank", 'location=no,closebuttoncaption=Back to Inspector App');
                                childwindow.onunload = function () {
                                    //Call logoff request
                                    requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                        utilService.logtoConsole("logoff response: " + result.response);
                                    }, "json");
                                    console.log('Child window closed');
                                };
                            }
                        }
                    }
                }, "json");
            } else {
                utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
            }
        }

        $scope.onAddFolder = function () {
            $scope.$broadcast("AddFolder");
        };
        $scope.deficiencyVariables = {};
        $scope.deficiencyVariables.variables = {
            statuscode: '',
            actioncode: '',
            severitycode: '',
            locationdesc: '',
            sublocationdesc: '',
            complied: '',
            complyby: '',
            inserted: '',
            refnumber: '',
            occurancecount: '',
            deficiencyText: '',
            remedyText: '',
            id: ''
        }
        $scope.onSaveEditedDeficiency = function (data) {
            $scope.$broadcast("SaveEditedDeficiency", data);
        };
        $scope.deficiencyDateChange = function (fromwhere) {
            if (fromwhere === "complieddate") {
                $scope.deficiencyVariables.variables.complied = event.currentTarget.value;
            }
            else if (fromwhere === "complybydate") {
                $scope.deficiencyVariables.variables.complyby = event.currentTarget.value;
            }
            else if (fromwhere === "inserteddate") {
                $scope.deficiencyVariables.variables.inserted = event.currentTarget.value;
            }
        }
        var DeficiencyValues = $scope.$on('DeficiencyValues', function (event, values) {

            var dateformat = CommonService.getDateFormat();
            $timeout(function () {
                $(".input-group.date").datetimepicker({
                    format: dateformat
                });
            }, 1000);
            $scope.deficiencyVariables.variables.statuscode = (values.statuscode !== undefined && values.statuscode !== "" && values.statuscode !== null) ? values.statuscode.toString() : "";
            $scope.deficiencyVariables.variables.actioncode = (values.actioncode !== undefined && values.actioncode !== "" && values.actioncode !== null) ? values.actioncode.toString() : "";
            $scope.deficiencyVariables.variables.severitycode = (values.severitycode !== undefined && values.severitycode !== "" && values.severitycode !== null) ? values.severitycode.toString() : "";
            $scope.deficiencyVariables.variables.locationdesc = values.locationdesc;
            $scope.deficiencyVariables.variables.sublocationdesc = values.sublocationdesc;
            $scope.deficiencyVariables.variables.complied = (values.datecomplied !== undefined && values.datecomplied !== "" && values.datecomplied !== null) ? moment(values.datecomplied).format(dateformat) : "";
            $scope.deficiencyVariables.variables.complyby = (values.complybydate !== undefined && values.complybydate !== "" && values.complybydate !== null) ? moment(values.complybydate).format(dateformat) : "";
            $scope.deficiencyVariables.variables.inserted = (values.insertdate !== undefined && values.insertdate !== "" && values.insertdate !== null) ? moment(values.insertdate).format(dateformat) : "";
            $scope.deficiencyVariables.variables.refnumber = values.referencenum;
            $scope.deficiencyVariables.variables.occurancecount = values.occurancecount;
            $scope.deficiencyVariables.variables.deficiencyText = values.deficiencytext;
            $scope.deficiencyVariables.variables.remedyText = values.remedytext;
            $scope.deficiencyVariables.variables.id = values.id;

            $scope.deficiencyVariables.SeverityList = values.severityList;
            $scope.deficiencyVariables.LocationList = values.locationList;
            $scope.deficiencyVariables.StatusList = values.statusList;
            $scope.deficiencyVariables.ActionList = values.actionList;
        });

        $scope.changedDeficiencyText = function (deficiencyText) {
            $scope.deficiencyVariables.variables.deficiencyText = deficiencyText
        };
        $scope.changedRemedyText = function (remedyText) {
            $scope.deficiencyVariables.variables.remedyText = remedyText
        };
        $scope.onCalendarView = function () {


            var startDate = "", endDate = "";
            var storedUser = JSON.parse(localStorage.getItem("userSettings"));
            if ($.isArray(storedUser) && storedUser.length > 0) {
                $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                $scope.password = storedUser[0].password;
            } else {
                utilService.showError("Please log off the Inspector App and login again.", 'info');
                return;
            }
            dataLayerService.getinboxlist(startDate, endDate, $scope.username).then(function (result) {
                $scope.listInboxCalendarView = [];
                var data = result.data;
                if (data != null && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var strScheduleendDate = '';
                        var strScheduleDate = '';
                        strScheduleDate = (data[i].scheduledate != "" && data[i].scheduledate != null) ? moment(data[i].scheduledate).format(dateformat) : "";
                        strScheduleendDate = (data[i].scheduleenddate != "" && data[i].scheduleenddate != null) ? moment(data[i].scheduleenddate).format(dateformat) : "";
                        var formattedaddress = CommonService.getformattedAddress(data[i]);
                        $scope.listInboxCalendarView.push({
                            folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                            processType: data[i].processdesc,
                            processTypeCode: data[i].processcode,
                            scheduleDate: strScheduleDate,
                            scheduleEndDate: strScheduleendDate,
                            folderStatus: data[i].statusdesc,
                            processComment: data[i].processcomment,
                            folderRSN: data[i].folderrsn,
                            processRSN: data[i].processrsn,
                            propertyRSN: data[i].propertyrsn,
                            propertyAddress: formattedaddress,
                            folderType: data[i].foldertype,
                            folderId: data[i].FolderId,
                            processId: data[i].ProcessId,
                            isMultiSignOffSelected: false,
                            isOutboxSelected: false,
                            isInboxSelected: false,
                            isInboxDisabled: false,
                            processPriority: data[i].priority,
                            inspMinute: data[i].inspminute,
                        });
                    }
                    $timeout(function (items) {
                        $scope.$broadcast('calendarView', items);
                        $scope.listInbox = items;
                        $scope.checkIfProcessEditable();
                    }, 200, false, $scope.listInboxCalendarView);
                } else {
                    utilService.showError("No items in calendar view.", "info");
                }
            });





        };
        $scope.getPropertyAddressesByFolderID = function (callback, scope, folderids) {
            dataLayerService.getPropertyAddresses(folderids).then(function (result) {
                if (result.data && result.data.length > 0) {
                    if (callback) {
                        callback.call(scope, { error: null, data: result.data });
                    }
                }
            });
        };

        //$scope.selectRowLongPress = function (inboxItem, fromwhere, event) {
        //    console.log('Long press');
        //    $('.activeRow').removeClass('activeRow');
        //    $(event.currentTarget.parentElement).addClass('activeRow');
        //    $scope.$broadcast('selectedRow', inboxItem);
        //};

        $scope.$on("$destroy", function () {
            showMesssage();
            DeficiencyValues();
            changeView();
            QuickSync();
        });

        $scope.onEditInspection = function () {
            $scope.$broadcast("EditInspection");
        };

        $scope.openInfoValueModal = function (item, fromwhere) {
            if (item) {
                if (fromwhere === "folderinfo") {
                    $scope.infoValueList = item.validinfo;
                }
                if (fromwhere === "folderprocessinfo") {
                    $scope.infoValueList = item.validprocessinfo;
                }
                $scope.itemSelected = item;
                if (item.infovalue && item.infovalue.length > 0 && (item.infotype === "MULTI_PICK" || item.infotype === "M"))
                    $scope.selectedInfoValueItemsText = item.infovalue.split(',');
                else
                    $scope.selectedInfoValueItemsText = [];
                $timeout(function () {
                    $('input[name="infochecklist"]').prop('checked', false);
                }, 500);
            }
            $scope.itemFromWhere = fromwhere;
            $scope.filterinfo = "";
        }
        $scope.selectedInfoValueItemsText = [];
        $scope.toggleInfoValueSelection = function (val, fromwhere) {
            var selected = [];
            if (fromwhere === "folderinfo") {
                selected = $filter('filter')($scope.itemSelected.validinfo, { value: val }, true);
            }
            else if (fromwhere === "folderprocessinfo") {
                selected = $filter('filter')($scope.itemSelected.validprocessinfo, { value: val }, true);
            }
            if (selected.length > 0 && $scope.selectedInfoValueItemsText != null) {
                var data = $scope.itemSelected.infovalue.split(",");
                var checkifalreadyexits = $filter('filter')(data, val, true);
                if (checkifalreadyexits.length > 0) {

                } else {
                    $scope.selectedInfoValueItemsText.push(val);
                }
            } else {
                $scope.selectedInfoValueItemsText.push(val);
            }

        }
        $scope.addInfoValue = function (fromwhere) {
            var dataText = [];
            var dataValue = [];
            var actuallyData = [];
            var datatosave = $.unique($scope.selectedInfoValueItemsText).join(",");
            if (fromwhere === "folderinfo") {

                dataLayerService.updateValidInfovalues(datatosave, $scope.itemSelected.infocode, $scope.itemSelected.folderrsn).then(function (response) {
                    utilService.logtoConsole("data updated with response:" + response.data);
                    actuallyData = $scope.selectedInfoValueItemsText;
                    for (var i = 0; i < actuallyData.length; i++) {
                        var selecteddata = $filter("filter")($scope.itemSelected.validinfo, { value: actuallyData[i] }, true);
                        if (selecteddata.length > 0) {
                            dataText.push(selecteddata[0].text);
                            dataValue.push(selecteddata[0].value);
                        }
                        else {
                            dataText.push(actuallyData[i]);
                            dataValue.push(actuallyData[i]);
                        }
                    }
                    $scope.itemSelected.selectedValue = dataText.join(",");
                    $scope.itemSelected.infovalue = dataValue.join(",");
                });

            } else if (fromwhere === "folderprocessinfo") {
                dataLayerService.updateValidProcessInfovalues(datatosave, $scope.itemSelected.infocode, $scope.itemSelected.processrsn).then(function (response) {
                    utilService.logtoConsole("data updated with response:" + response.data);
                    actuallyData = $scope.selectedInfoValueItemsText;
                    for (var i = 0; i < actuallyData.length; i++) {
                        var selecteddata = $filter("filter")($scope.itemSelected.validprocessinfo, { value: actuallyData[i] }, true);
                        if (selecteddata.length > 0) {
                            dataText.push(selecteddata[0].text);
                            dataValue.push(selecteddata[0].value);
                        }
                        else {
                            dataText.push(actuallyData[i]);
                            dataValue.push(actuallyData[i]);
                        }
                    }
                    $scope.itemSelected.selectedValue = dataText.join(",");
                    $scope.itemSelected.infovalue = dataValue.join(",");
                });
            }


            angular.element("#infoValueModal").removeClass("fade").modal("hide");
        }

        $scope.updateFolderProcessPrioity = function (inboxitem) {
            dataLayerService.updateProcessPriority(inboxitem).then(function (result) {
                if (result && result.data && result.data === "success") {
                    utilService.showError("Process priority updated.</br> Do quick sync to upload to server.", "info");
                    //$scope.listInbox.sort(function (a, b) { return b.processPriority - a.processPriority });
                } else {
                    utilService.showError("Process priority couldn't update</br>Please try again", "error");
                }
            });
        }
        $scope.updateFolderProcessInspMin = function (inboxitem) {
            dataLayerService.updateProcessInspMin(inboxitem).then(function (result) {
                if (result && result.data && result.data === "success") {
                    utilService.showError("Inspection minute updated.</br>Do quick sync to upload to server.", "info");
                    //$scope.listInbox.sort(function (a, b) { return b.processPriority - a.processPriority });
                } else {
                    utilService.showError("Inspection minute couldn't update.</br>Please try again.", "error");
                }
            });
        }

        $scope.isScanInProgress = true;
        $scope.scanQRCode = function () {
            var strQRcode = "";
            if (QRScanner) {
                $scope.isScanInProgress = false;
                $("html").css({ "background-color": "transparent", "opacity": "0.7" });
                $("#searchviewcontent").css({ "background-color": "transparent", "opacity": "0.3" });
                // Start a scan. Scanning will continue until something is detected or 
                // `QRScanner.cancelScan()` is called. 
                QRScanner.scan(function displayContents(err, text) {
                    QRScanner.hide();
                    $("html").css({ "background-color": "", "opacity": "" });
                    $("html").removeAttr("style");
                    $("#searchviewcontent").css({ "background-color": "", "opacity": "" });
                    $("#searchviewcontent").removeAttr("style");
                    if (err) {
                        // an error occurred, or the scan was canceled (error code `6`) 
                    } else {
                        // The scan completed, display the contents of the QR code: 
                        //alert(text);
                        strQRcode = text;
                        // Clearing the already searched text
                        $scope.clearSearchText()
                        // Resetting the Pagination Variables
                        $scope.folderSearchCriteria = {
                            startIndex: 0,
                            endIndex: 10,
                            searchText: ""
                        };
                        // Assigining the qr code to search
                        $scope.folderSearchCriteria.searchText = strQRcode;
                        // Calling the search function
                        $scope.onFolderSearch();
                        $scope.isScanInProgress = true;
                        QRScanner.destroy(function (status) {
                            console.log("scan destroy called " + status);
                        });
                        //QRScanner.hide(function (status) {
                        //    console.log(status);
                        //    $scope.cancelScanQRCode();
                        //});

                    }
                });
                // Make the webview transparent so the video preview is visible behind it. 
                QRScanner.show();
                // Be sure to make any opaque HTML elements transparent here to avoid 
                // covering the video. 
            } else {
                console.log("QR SCANNER NOT SUPPORTED.");
            }
        }
        $scope.cancelScanQRCode = function () {
            if (QRScanner) {
                QRScanner.destroy(function (status) {
                    console.log("scan destroy called " + status);
                    $timeout(function () {
                        $scope.isScanInProgress = true;
                    });
                    $("html").css({ "background-color": "", "opacity": "" });
                    $("html").removeAttr("style");
                    $("#searchviewcontent").css({ "background-color": "", "opacity": "" });
                    $("#searchviewcontent").removeAttr("style");
                });

            }
        }

        $scope.moveBackToInbox = function () {

            var itemsToMoveToInbox = $filter('filter')($scope.listOutbox, { isOutboxSelected: true }, true);
            if (itemsToMoveToInbox.length > 0) {
                return Promise.all(itemsToMoveToInbox.map(function (item) {
                    if (item) {
                        return dataLayerService.moveToInbox(item).then(function (result) {
                            if (result.data && result.data !== null) {
                                utilService.logtoConsole(result.data);
                            } else {
                                utilService.logtoConsole("Item could not moved to inbox.");
                            }
                            return result;
                        });
                    }
                })).then(function (results) {
                    if (results.length > 0) {
                        $scope.showOutboxList();
                    }
                });
            }
            else {
                utilService.showError("Please select an item to move to inbox.", 'info');
            }

        }

        $scope.onMouseDown = function (evt, processInfo) {
            $scope.$broadcast("onMouseDown", { eventpart: evt, processinfo: processInfo });
        }

        $scope.onMouseUp = function (evt, processInfo) {
            $scope.$broadcast("onMouseUp", { eventpart: evt, processinfo: processInfo });
        }

        $scope.onMouseMove = function (evt) {
            $scope.$broadcast("onMouseMove", { eventpart: evt });
        }

        $scope.onClearImage = function (processInfo) {
            $scope.$broadcast("onClearImage", { processinfo: processInfo });
        }
        $scope.onSaveImage = function (processInfo) {
            $scope.$broadcast("onSaveImage", { processinfo: processInfo });
        }

        $scope.onShowEAIHistory = function () {
            $scope.$broadcast("showEAIHistory");
        };

        $scope.selectItemToGetRoute = function (item) {
            // Send all the inspection to MapSetting Controller to get the route
            CommonService.broadcastInboxItemSelected({ data: $scope.listInbox });
            CommonService.broadcastCreateMarkerItemSelected();


        }
        $scope.selectFolderToGetRoute = function () {

            var selectedfolderrsn = $filter('filter')($scope.listProjectView, { isFolderSelected: true }, true);
            if (selectedfolderrsn.length > 0) {
                for (var i = 0; i < selectedfolderrsn.length; i++) {
                    var folderrsn = selectedfolderrsn[i].key;
                    var filterProcessByFolderRSN = $filter('filter')($scope.listInbox, { folderRSN: folderrsn }, true);
                    if (filterProcessByFolderRSN.length > 0) {
                        $.map(filterProcessByFolderRSN, function (item, index) {
                            item.isInboxSelected = true;
                        });
                    }
                }
                CommonService.broadcastInboxItemSelected({ data: $scope.listInbox });
                CommonService.broadcastCreateMarkerItemSelected();
            }
            var unselectedfolderrsn = $filter('filter')($scope.listProjectView, { isFolderSelected: false }, true);
            if (unselectedfolderrsn.length > 0) {
                for (var i = 0; i < unselectedfolderrsn.length; i++) {
                    var folderrsn = unselectedfolderrsn[i].key;
                    var filterProcessByFolderRSN = $filter('filter')($scope.listInbox, { folderRSN: folderrsn }, true);
                    if (filterProcessByFolderRSN.length > 0) {
                        $.map(filterProcessByFolderRSN, function (item, index) {
                            item.isInboxSelected = false;
                        });
                    }
                }
                CommonService.broadcastInboxItemSelected({ data: $scope.listInbox });
                CommonService.broadcastCreateMarkerItemSelected();
            }
        }

        $scope.collapseExpandAll = function (iscollapse) {
            var elements = $('.collapseall');
            if (elements.length > 0) {
                $.map(elements, function (item, index) {
                    $timeout(function () {
                        if (iscollapse) {
                            if ($($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                                $($(item).siblings()[0]).removeClass('in');

                                var itemChild = $($(item).children()).children();
                                if ($(itemChild[0]).hasClass('ng-hide')) {
                                    $(itemChild[0]).removeClass('ng-hide');
                                    $(itemChild[1]).addClass('ng-hide');
                                }
                                else if ($(itemChild[1]).hasClass('ng-hide')) {
                                    $(itemChild[1]).removeClass('ng-hide');
                                    $(itemChild[0]).addClass('ng-hide');
                                }
                            }
                        } else {
                            if (!$($(item).siblings()[0]).hasClass('in')) {
                                $($(item).siblings()[0]).addClass('in');

                                var itemChild = $($(item).children()).children();
                                if ($(itemChild[0]).hasClass('ng-hide')) {
                                    $(itemChild[0]).removeClass('ng-hide');
                                    $(itemChild[1]).addClass('ng-hide');
                                }
                                else if ($(itemChild[1]).hasClass('ng-hide')) {
                                    $(itemChild[1]).removeClass('ng-hide');
                                    $(itemChild[0]).addClass('ng-hide');
                                }
                            }
                        }
                        //$scope.folderinfosection = !$scope.folderinfosection;
                    });
                });
            }
        }
        $scope.folderinfosectionClick = function () {
            var item = event.currentTarget;
            $timeout(function () {
                if (!$($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                    $($(item).siblings()[0]).removeClass('in');

                    var itemChild = $($(item).children()).children();
                    if ($(itemChild[0]).hasClass('ng-hide')) {
                        $(itemChild[0]).removeClass('ng-hide');
                        $(itemChild[1]).addClass('ng-hide');
                    }
                    else if ($(itemChild[1]).hasClass('ng-hide')) {
                        $(itemChild[1]).removeClass('ng-hide');
                        $(itemChild[0]).addClass('ng-hide');
                    }
                }
                else if ($($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                    $($(item).siblings()[0]).removeClass('in');

                    var itemChild = $($(item).children()).children();
                    if ($(itemChild[0]).hasClass('ng-hide')) {
                        $(itemChild[0]).removeClass('ng-hide');
                        $(itemChild[1]).addClass('ng-hide');
                    }
                    else if ($(itemChild[1]).hasClass('ng-hide')) {
                        $(itemChild[1]).removeClass('ng-hide');
                        $(itemChild[0]).addClass('ng-hide');
                    }
                }
            });
        }

        $scope.setdeficiencyheight = function () {
            $timeout(function () {
                var ovarlayHeight = angular.element(".overlay").height();
                var tabbarheight = angular.element("#inspectiontabs").height();
                var addbutton = angular.element("#addbutton").height();
                var processinspection = angular.element("#processinspection").height();
                var topheader = angular.element("#topheader").height();
                var highttoset = ovarlayHeight - (tabbarheight + addbutton + processinspection + topheader + 77);
                angular.element(".scrollAddedDeficiency").mCustomScrollbar({
                    setHeight: highttoset,
                    theme: "minimal-dark"
                });


                var deficiencyheader = angular.element("#deficiencyheader").height();
                var highttoset = ovarlayHeight - (tabbarheight + deficiencyheader + topheader + processinspection + addbutton + 77);
                angular.element(".scrollDeficiency").mCustomScrollbar({
                    setHeight: highttoset,
                    theme: "minimal-dark"
                });

            }, 500);

        }
        $scope.changeRescheduleDate = function (newdtae) {
            var userdate = (newdtae === undefined ? event.currentTarget.value : newdtae);
            if (moment(new Date($scope.reScheduleDate)).format(dateformat) === "Invalid date") {
                $scope.reScheduleDate = event.currentTarget.value;
                utilService.showError("Invalid date, please enter valid date.", "info");
                return;
            }
            if (userdate)
                $scope.reScheduleDate = event.currentTarget.value;
            if ($scope.reScheduleDate !== "" && $scope.reScheduleDate !== null && $scope.reScheduleDate) {
                $scope.reScheduleDate = moment($scope.reScheduleDate).format(dateformat);
                if ($scope.reScheduleDate)
                    $scope.InspectionProcessMetricsDetails.ReScheduleDate = $scope.reScheduleDate;
            }
        }
        $scope.rescheduleInspectionModal = function () {
            $timeout(function () {
                var rescheduledefaultdate = new Date().setDate(new Date().getDate() + 1);
                //var rescheduledefaultFuturedate = 0;
                var validsiteoptions = dataLayerService.getSiteOptions();
                var issignaturereq = $filter('filter')(validsiteoptions, { optionkey: "Allow same day inspection reschedule" }, true);
                if (issignaturereq && issignaturereq.length > 0) {
                    if (issignaturereq[0].optionvalue.toLowerCase() === "yes") {
                        rescheduledefaultdate = new Date();
                    }
                }
                $(".input-group.mindate").datetimepicker({
                    format: dateformat,
                    minDate: rescheduledefaultdate
                });

                $scope.reScheduleDate = moment(rescheduledefaultdate).format(dateformat);
                $scope.InspectionProcessMetricsDetails.ReScheduleDate = $scope.reScheduleDate;
                $('#rescheduleInspectionModal').modal('show');
                var element = angular.element('[ng-model="reScheduleDate"]');
                element.focus();

            }, 500);
        }

        $scope.collapseExpandAllProjectView = function (iscollapse) {

            var elements = $('.collapseallproject');
            if (elements.length > 0) {
                $.map(elements, function (item, index) {
                    $timeout(function () {
                        if (iscollapse) {
                            if ($($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                                $($(item).siblings()[0]).removeClass('in');
                                var itemChild = $(item).children().children().children().children();
                                if ($(itemChild[0]).hasClass('ng-hide')) {
                                    $(itemChild[0]).removeClass('ng-hide');
                                    $(itemChild[1]).addClass('ng-hide');
                                }
                                else if ($(itemChild[1]).hasClass('ng-hide')) {
                                    $(itemChild[1]).removeClass('ng-hide');
                                    $(itemChild[0]).addClass('ng-hide');
                                }
                            }
                        } else {
                            if (!$($(item).siblings()[0]).hasClass('in')) {
                                $($(item).siblings()[0]).addClass('in');
                                $($(item).siblings()[0]).css('height', 'auto');
                                var itemChild = $(item).children().children().children().children();
                                if ($(itemChild[0]).hasClass('ng-hide')) {
                                    $(itemChild[0]).removeClass('ng-hide');
                                    $(itemChild[1]).addClass('ng-hide');
                                }
                                else if ($(itemChild[1]).hasClass('ng-hide')) {
                                    $(itemChild[1]).removeClass('ng-hide');
                                    $(itemChild[0]).addClass('ng-hide');
                                }
                            }
                        }
                    });
                });
            }
        }
        $scope.singleItemProjectViewClick = function () {
            var item = event.currentTarget;
            $timeout(function () {
                if (!$($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                    $($(item).siblings()[0]).removeClass('in');

                    var itemChild = $(item).children().children().children().children();
                    if ($(itemChild[0]).hasClass('ng-hide')) {
                        $(itemChild[0]).removeClass('ng-hide');
                        $(itemChild[1]).addClass('ng-hide');
                    }
                    else if ($(itemChild[1]).hasClass('ng-hide')) {
                        $(itemChild[1]).removeClass('ng-hide');
                        $(itemChild[0]).addClass('ng-hide');
                    }
                }
                else if ($($(item).siblings()[0]).hasClass('in')) {//!$(item).hasClass("collapsed")) {
                    $($(item).siblings()[0]).removeClass('in');

                    var itemChild = $(item).children().children().children().children();
                    if ($(itemChild[0]).hasClass('ng-hide')) {
                        $(itemChild[0]).removeClass('ng-hide');
                        $(itemChild[1]).addClass('ng-hide');
                    }
                    else if ($(itemChild[1]).hasClass('ng-hide')) {
                        $(itemChild[1]).removeClass('ng-hide');
                        $(itemChild[0]).addClass('ng-hide');
                    }
                }
            });
        }


        $scope.detectswipe = function (el, func) {
            swipe_det = new Object();
            swipe_det.sX = 100;
            swipe_det.sY = 0;
            swipe_det.eX = 100;
            swipe_det.eY = 0;
            var min_x = 160;  //min x swipe for horizontal swipe
            var max_x = 320;  //max x difference for vertical swipe
            var min_y = 80;  //min y swipe for vertical swipe
            var max_y = 100;  //max y difference for horizontal swipe
            var direc = "";
            ele = document.getElementById(el);
            ele.addEventListener('touchstart', function (e) {
                var t = e.touches[0];
                swipe_det.sX = t.screenX;
                swipe_det.sY = t.screenY;
            }, false);
            ele.addEventListener('touchmove', function (e) {
                e.preventDefault();
                var t = e.touches[0];
                swipe_det.eX = t.screenX;
                swipe_det.eY = t.screenY;
            }, false);
            ele.addEventListener('touchend', function (e) {
                //horizontal detection
                if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)))) {
                    if (swipe_det.eX > swipe_det.sX) direc = "r";
                    else direc = "l";
                }
                //vertical detection
                if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x)))) {
                    if (swipe_det.eY > swipe_det.sY) direc = "d";
                    else direc = "u";
                }

                if (direc != "") {
                    if (typeof func == 'function') func(el, direc);
                }
                direc = "";
            }, false);
        }
        $scope.calculatePaging = function (el, d) {
            $timeout(function () {
                if (d === 'l') {
                    if ($scope.bigInboxCurrentPage !== Math.ceil($scope.bigTotalInboxItems / $scope.numPerPageInbox))
                        $scope.bigInboxCurrentPage++;
                } else if (d === 'r') {
                    if ($scope.bigInboxCurrentPage !== 1)
                        $scope.bigInboxCurrentPage--;
                }
            });
            //alert("you swiped on element with id '" + el + "' to " + d + " direction");
        }

        //$scope.filteredInbox = [];
        //.slice(((bigInboxCurrentPage-1)*numPerPageInbox), ((bigInboxCurrentPage)*numPerPageInbox))

        //$scope.detectswipe('swipemeinbox', $scope.calculatePaging);
        $rootScope.isRouteGenerated = false;
        $rootScope.iscliked = true;
        $rootScope.isItemSelected = true;

        $scope.pageChanged = function () {
            $timeout(function () {
                //$rootScope.iscliked = true;
                if ($rootScope.isRouteGenerated) {
                    $rootScope.iscliked = false;
                    $rootScope.isItemSelected = false;
                }
                else {
                    $rootScope.iscliked = true;
                }
                $rootScope.$digest();
            });
        }

    });
});
