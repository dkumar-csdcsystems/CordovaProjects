app.controller("SettingCtrl", function ($scope, $location, $filter, $route,utilService, dbInitService, syncHelperService, dataLayerService, $window, CommonService) {

    $scope.host = "";
    $scope.connectioncache = "";
    $scope.eaiurl = "";
    $scope.heartbeat = "";
    $scope.username = "";
    $scope.password = "";
    $scope.downloadURL = "";
    $scope.isA6Compatible = false;


    var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
    if (storedSettings != undefined && storedSettings !== "") {
        $scope.host = storedSettings[0].Host;
        $scope.connectioncache = storedSettings[0].ConnectionCache;
        $scope.eaiurl = storedSettings[0].EaiPush;
        $scope.heartbeat = storedSettings[0].HeartbeatName;
        $scope.username = storedSettings[0].UserName;
        $scope.password = storedSettings[0].Password;
        $scope.downloadURL = storedSettings[0].DownloadURL;
        $scope.isA6Compatible = storedSettings[0].isA6Compatible;
    }

    $scope.Update = function () {
        //utilService.uiblock();
        $scope.serverSettings = [];
        if (!$scope.isA6Compatible) {
            $scope.heartbeat = "";
            $scope.eaiurl = "";
        }

        $scope.serverSettings.push({
            Host: $scope.host,
            ConnectionCache: $scope.connectioncache,
            EaiPush: $scope.eaiurl === undefined ? "" : $scope.eaiurl,
            HeartbeatName: $scope.heartbeat === undefined ? "" : $scope.heartbeat,
            UserName: $scope.username,
            Password: $scope.password,
            DownloadURL: $scope.downloadURL === undefined ? "" : $scope.downloadURL,
            isA6Compatible: $scope.isA6Compatible
        });
        localStorage.setItem("serverSettings", JSON.stringify($scope.serverSettings));
        $("#myModal").removeClass("in");
        $(".modal-backdrop").remove();
        $('body').removeClass('modal-open');
        $('body').css('padding-right', '');
        $('#myModal').modal('hide');

    };


    $scope.cleanDatabase = function () {
        utilService.showError("Please wait.. Database clean is in progress.", "info");
        dbInitService.cleanDatabase(function (result) {
            if (result.data && result.data.isSuccess === true) {
                dbInitService.initdatabase(function (result) {
                    if (result.data && result.data.isSuccess === true) {
                        utilService.showError("Database reinitialized successfully", "info");
                        $("#myModal").removeClass("in");
                        $(".modal-backdrop").remove();
                        $('body').removeClass('modal-open');
                        $('body').css('padding-right', '');
                        $('#myModal').modal('hide');
                        //$window.location.reload();
                    }
                }, this);
            }
        }, this);
    };


    $scope.saveDownloadURL = function () {
        $scope.Update();
    };

    $scope.reportTemplateList = {};

    $scope.reportList = [];
    $scope.getReporttemplateFromDB = function () {
        if ($scope.reportList.length === 0) {
            dataLayerService.getAllReport().then(function (result) {
                $scope.reportList = [];
                if (result.data && result.data.length > 0) {
                    for (var i = 0; i < result.data.length; i++) {
                        $scope.reportList.push(result.data[i]);
                    }
                }

            });
        }
    }

    $scope.downloadReportTemplate = function () {
        if ($scope.downloadURL.indexOf('.xml') < 0) {
            utilService.showError("Please provide xml file name.", "error");
            return;
        }
        syncHelperService.getReportTemplate(function (result) {
            $scope.reportList = [];
            if (result.data) {
                var result = xml2json(result.data);
                if (result["#document"].ReportList && result["#document"].ReportList.Report.length > 0) {

                    var db = dbInitService.getdatabase();
                    if (db == null) {
                        throw new Error("error accessing database");
                        return;
                    }

                    for (var i = 0; i < result["#document"].ReportList.Report.length; i++) {
                        var item = result["#document"].ReportList.Report[i];
                        var insertsyntax = "insert into report (foldertype,processcode,reportname,reportdescription,displayflag,reporttemplate)values (?,?,?,?,?,?) ";
                        var updatesyntax = "update report set reportdescription=?, displayflag=?, reporttemplate=? where foldertype=? and processcode=? and reportname=? ";
                        $scope.insertReportTemplate(db, item, insertsyntax, updatesyntax);
                        if ($filter('filter')($scope.reportList, {
                            reportname: result["#document"].ReportList.Report[i].reportname,
                            processcode: result["#document"].ReportList.Report[i].processcode,
                            foldertype: result["#document"].ReportList.Report[i].foldertype,
                        }, true).length == 0) {
                            $scope.reportList.push(result["#document"].ReportList.Report[i]);
                        }
                    }
                }
            }
            else {
                utilService.showError("Invalid xml format.", "error");
            }
        }, this, $scope.downloadURL);
    };

    $scope.insertReportTemplate = function (db, item, insertsyntax, updatesyntax) {
        db.transaction(function (tx) {
            tx.executeSql("Select 1 from report  where foldertype=? and processcode=? and reportname=? ", [item.foldertype, item.processcode, item.reportname],
                   function (itx, result) {
                       if (result.rows && result.rows.length > 0) {
                           //record exists - Update it
                           tx.executeSql(updatesyntax, [item.reportdescription, item.displayflag, item.reporttemplate, item.foldertype, item.processcode, item.reportname],
                              function (iitx, iresult) {
                                  utilService.logtoConsole("Table Report has been Updated for ");
                              },
                              function (iitx, error) {
                                  utilService.logtoConsole(error, "error");
                                  utilService.logtoConsole("error update for table report for", "error");
                              });
                       } else {
                           //record doesn't exists - insert it
                           tx.executeSql(insertsyntax, [item.foldertype, item.processcode, item.reportname, item.reportdescription, item.displayflag, item.reporttemplate],
                              function (iitx, iresult) {
                                  utilService.logtoConsole("Record Inserted Into report table through download template");
                              },
                              function (iitx, error) {
                                  utilService.logtoConsole(error, "error");
                                  utilService.logtoConsole("error insert for table report syntax is " + insertsyntax);
                              });
                       }
                   },
                   function (itx, error) {
                       utilService.logtoConsole(error, "error");
                       utilService.logtoConsole("error insert/update for table report ");
                   });
        });
    };

    $scope.cleanCustomSettings = function () {
        $scope.resetAllCustomSettings();
    }
    $scope.resetAllCustomSettings = function () {
        $window.localStorage.setItem("inbox.columnsSetting", "");
        $window.localStorage.setItem("inbox.sortColumnSetting", "");
        $window.localStorage.setItem('startPointSettings', JSON.stringify(""));
        dataLayerService.siteOptions = null;
        var isprocesspriorityeditable = false;
        var isinspectionminuteeditable = false;
        dataLayerService.getValidSiteMobileOption().then(function (result) {
            var checkifprocesseditable = $filter('filter')(result, { optionkey: "Editable process priority in Inbox" }, true);
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
            $scope.selectedSortedValue = [];
            $scope.selectedSortedColumns = [];


            utilService.showError("Custom Settings cleared from application.", "info");

        });
    }
});