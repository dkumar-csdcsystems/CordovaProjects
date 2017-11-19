
app.controller('AddInspectionCtrl', function($scope, utilService, dataLayerService, syncHelperService, CommonService, $q) {
    $scope.processType = '';
    $scope.priority = '';

    $scope.getPropertyList = function() {
        var deferred = $q.defer();
        var folderPropertyList = [];
        if ($scope.PeopleDetails != undefined) {
            var i = 0;
            for (i = 0; i < $scope.PropertyDetails.length; i++) {
                var folderProperty = {
                    FolderRSN: $scope.searchBoxItem.folderRSN,
                    PropertyRSN: $scope.PropertyDetails[i].PropertyId,
                    PropertyTypeCode: $scope.PropertyDetails[i].PropCode,
                    PropertyStatusCode: $scope.PropertyDetails[i].StatusCode,
                    IsNew: ''
                }
                folderPropertyList.push(folderProperty);
            }
            deferred.resolve(folderPropertyList);
        }
        return deferred.promise;
    };

    $scope.getPeopleList = function () {
        var deferred = $q.defer();
        var folderPeopleList = [];
        if ($scope.PeopleDetails != undefined) {
            for (var i = 0; i < $scope.PeopleDetails.length; i++) {
                var folderPeople = {
                    FolderRSN: $scope.searchBoxItem.folderRSN,
                    PeopleCode: $scope.PeopleDetails[i].PersonRole,
                    PeopleRSN: $scope.PeopleDetails[i].PeopleId,
                    StatusCode: $scope.PeopleDetails[i].StatusCode,
                    IsNew: ''
                }
                folderPeopleList.push(folderPeople);
            }
            deferred.resolve(folderPeopleList);
        }
        return deferred.promise;
    }

    $scope.addNewInspection = function(fromwhere) {
            if (fromwhere === "searchbox") {
                var insertFolder = {
                    folderRSN: $scope.searchBoxItem.folderRSN,
                    //propertyRSN: $scope.searchBoxItem.propertyRSN,
                    folderType: $scope.searchBoxItem.folderType,
                    folderName: $scope.searchBoxItem.folderName,
                    folderDescription: $scope.searchBoxItem.folderDescription,
                    folderSubType: $scope.searchBoxItem.folderSubType,
                    folderWorkType: $scope.searchBoxItem.folderWorkType,
                    referenceFile: $scope.searchBoxItem.referenceFile,
                    folderCondition: $scope.searchBoxItem.folderCondition,
                    inDate: $scope.searchBoxItem.inDate,
                    statusCode: $scope.searchBoxItem.statusCode,
                    parentRSN: $scope.searchBoxItem.parentRSN === '' || null ? '0' : '' + $scope.searchBoxItem.parentRSN + '',
                    propertyRSN: $scope.searchBoxItem.propertyRSN === null || '' ? '0' : '' + $scope.searchBoxItem.propertyRSN + '',
                    folderCentury: $scope.searchBoxItem.folderCentury,
                    folderYear: $scope.searchBoxItem.folderYear,
                    isNew: '' //isNew Not new folder
                }

                dataLayerService.insertSearchFolder(insertFolder).then(function(result) {
                    var folderId = result.data;
                    var i;
                    // Insert Property Based on FolderId and PropertyRsn
                    if ($scope.PropertyDetails != undefined) {
                        $scope.getPropertyList().then(function(result) {
                            return Promise.all(result.map(function(folderProperty) {
                                return dataLayerService.insertSearchFolderProperty(folderProperty);
                            }));
                        }).then(function(arrayOfResults) {
                            // All Properties has been inserted/updated
                            $scope.getPeopleList().then(function(result) {
                                return Promise.all(result.map(function(peopleProperty) {
                                    return dataLayerService.insertSearchFolderPeople(peopleProperty);
                                }));
                            }).then(function(arrayOfResults) {
                                // All People has been inserted/updated
                                var folderInfo = { FolderType: $scope.searchBoxItem.folderType, FolderRSN: $scope.searchBoxItem.folderRSN, IsNew: 'Y', IsEdited: 'N' };
                                dataLayerService.insertFolderInfo(folderInfo).then(function(result) {
                                    // Folder Info has been inserted/updated
                                    var folderProcess = {
                                        ProcessRSN: '0',
                                        FolderRSN: $scope.searchBoxItem.folderRSN,
                                        FolderId: null,
                                        ProcessCode: $scope.processType,
                                        Periority: $scope.priority,
                                        ScheduleDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                                        StampDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                                        AssignedUser: JSON.parse(localStorage.getItem('userSettings'))[0].validuser,
                                        StatusCode: 1,
                                        Comments: '',
                                        ProcessComments: '',
                                        ScheduleEndDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                                        Reference: '',
                                        StartDate: null,
                                        DisplayOrder: '',
                                        IsNew: 'Y',
                                        IsEdited: 'N',
                                        EndDate: null,
                                        IsReschedule: ''
                                    };
                                    dataLayerService.insertSearchFolderProcess(folderProcess).then(function(insertFolderProcessResult) {
                                        var processrsn = insertFolderProcessResult.data;
                                        $scope.searchBoxItem.processRSN = processrsn;
                                        $scope.searchBoxItem.processId = processrsn;
                                        if (processrsn !== null && processrsn !== '') {
                                            // Folder Process has been inserted/updated
                                            var folderProcessInfo = { ProcessRSN: 0, FolderRSN: $scope.searchBoxItem.folderRSN, ProcessCode: $scope.processType, IsNew: 'Y', IsEdited: 'N', ProcessId: processrsn };
                                            dataLayerService.insertSearchFolderProcessInfo(folderProcessInfo).then(function(processInfoResult) {
                                                var res = processInfoResult.data;
                                                // Folder Process Info has been inserted/updated

                                                var folderProcessChecklist = { ProcessRSN: 0, FolderRSN: $scope.searchBoxItem.folderRSN, ProcessCode: $scope.processType, IsNew: 'Y', IsEdited: 'N', ProcessId: processrsn };
                                                dataLayerService.insertSearchFolderProcessChecklist(folderProcessChecklist).then(function(checklistResult) {
                                                    var res = checklistResult.data;
                                                    // Folder process checklist has been updated/ inserted

                                                    $scope.ClosePanel();
                                                    //$scope.selectSearchFolder($scope.searchBoxItem);
                                                    $scope.SelectFolder($scope.searchBoxItem, "inboxOverlay");
                                                    $scope.processType = '';
                                                    $scope.priority = '';


                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            } else {

                var folderProcess = {
                    ProcessRSN: '0',
                    FolderRSN: $scope.searchBoxItem.folderRSN,
                    FolderId: null,
                    ProcessCode: $scope.processType,
                    Periority: $scope.priority,
                    ScheduleDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                    StampDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                    AssignedUser: JSON.parse(localStorage.getItem('userSettings'))[0].validuser,
                    StatusCode: 1,
                    Comments: '',
                    ProcessComments: '',
                    ScheduleEndDate: utilService.dateformat(new Date(), 'Y-m-d h:i:s'),
                    Reference: '',
                    StartDate: null,
                    DisplayOrder: '',
                    IsNew: 'Y',
                    IsEdited: 'N',
                    EndDate: null,
                    IsReschedule: ''
                }

                dataLayerService.insertFolderProcess(folderProcess).then(function(insertFolderProcessResult) {
                    var processid = insertFolderProcessResult.data;
                    if (processid !== null && processid !== '') {
                        var folderProcessInfo = { ProcessRSN: 0, FolderRSN: $scope.searchBoxItem.folderRSN, ProcessCode: $scope.processType, IsNew: 'Y', IsEdited: 'N', ProcessId: processid };
                        dataLayerService.insertFolderProcessInfo(folderProcessInfo).then(function(processInfoResult) {
                            var res = processInfoResult.data;

                            var folderProcessChecklist = { ProcessRSN: 0, FolderRSN: $scope.searchBoxItem.folderRSN, ProcessCode: $scope.processType, IsNew: 'Y', IsEdited: 'N', ProcessId: processid };
                            dataLayerService.insertFolderProcessChecklist(folderProcessChecklist).then(function(checklistResult) {
                                var res = checklistResult.data;
                                $scope.inBoxItem = {
                                    folderRSN: $scope.searchBoxItem.folderRSN,
                                    processRSN: 0,
                                    folderType: $scope.searchBoxItem.folderType,
                                    folderId: $scope.searchBoxItem.folderId,
                                    processId: processid
                                }
                                $scope.ClosePanel();
                                $scope.SelectFolder($scope.inBoxItem, "inboxOverlay");

                            });
                        });
                    } else
                        utilService.showError("Process not saved..", 'error');
                });
            }
        },

    $scope.pushNewInspection = function () {

            var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));

            var userSetting = JSON.parse(localStorage.getItem("userSettings"));
           


            var processUpdate = "<ProcessInsert>" +
                "<ProcessCode>" + $scope.processType + "</ProcessCode>" +
                "<FolderRSN>" + $scope.searchBoxItem.folderRSN + "</FolderRSN>" +
                "<AssignedUser>" + userSetting[0].validuser + "</AssignedUser>" +
                "<ScheduleDate>" + utilService.dateformat(new Date(), 'Y-m-d h:i:s') + "</ScheduleDate>" +
                "<ScheduleEndDate>" + utilService.dateformat(new Date(), 'Y-m-d h:i:s') + "</ScheduleEndDate>" +
                "<Priority>" + $scope.priority + "</Priority>" +
                "</ProcessInsert>";

            var eai;
            if (storedSettings[0].isA6Compatible) {
                eai = "<AmandaEai>" +
                    "<FromSystem>" + storedSettings[0].HeartbeatName + "</FromSystem>" +
                    "<ToSystem>" + storedSettings[0].HeartbeatName + "</ToSystem>" +
                    "<ToUserid>" + userSetting[0].validuser + "</ToUserid>" +
                    "<ToLid>" + userSetting[0].lid + "</ToLid>" +
                    processUpdate +
                    "</AmandaEai>";
            } else {
                eai = "<AmandaEai>" +
                    "<FromSystem>Mobile7</FromSystem>" +
                    "<ToUserid>" + userSetting[0].validuser + "</ToUserid>" +
                    "<ToLid>" + userSetting[0].lid + "</ToLid>" +
                    processUpdate +
                    "</AmandaEai>";
            }

            syncHelperService.pushNewInspection(eai, function(result) {
                if (result.error == null) {
                     $scope.ClosePanel();
                    //$scope.SelectFolder($scope.searchBoxItem, "inboxOverlay");
                    $scope.processType = '';
                    $scope.priority = '';
                    $scope.showInboxList();
                }               

                if (result.data != null) {
                    var eaiResult = result.data;
                    if (eaiResult.EaiProcessAction && (eaiResult.EaiProcessAction==="Insert" || eaiResult.EaiProcessAction==="Update")) {
                        $scope.executesync(eaiResult.ProcessRSN);
                    }

                    //do quick sync                    
                }

            }, this, function(message) {
                CommonService.changeStatusMessage(message);
            });

    },

    $scope.executesync = function (processRSN) {
       
        $scope.showMessage("Quick Sync started...");
        syncHelperService.doquicksyncafterupload("Q",
            function(result) {
                $scope.showMessage(result.message);
                syncHelperService.dataProcessinginprogress = false;
                var startDate = "", endDate = "", currentuser = "";

                var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                if ($.isArray(storedUser) && storedUser.length > 0) {
                    currentuser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser
                }

                dataLayerService.getinboxlist(startDate, endDate, currentuser).then(function(result) {
                    $scope.listInbox = [];
                    var data = result.data;
                    if (data != null && data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var strScheduleendDate = '';
                            var strScheduleDate = '';
                            strScheduleDate = moment(data[i].scheduledate).format(CommonService.getDateFormat());
                            strScheduleendDate = moment(data[i].scheduleenddate).format(CommonService.getDateFormat());

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
                                folderType: data[i].foldertype,
                                folderId: data[i].FolderId,
                                processId: data[i].ProcessId,
                                isMultiSignOffSelected: false,
                                isOutboxSelected: false,
                                isInboxSelected: false,
                            });
                            
                           

                        }
                        var inboxitem = $.grep($scope.listInbox, function (e) { return (e.processRSN == processRSN); });
                        if (inboxitem.length > 0) {
                            $scope.SelectFolder(inboxitem[0], 'inbox');
                        }
                    } else {
                        utilService.showError("No items in inbox.", "info");
                    }
                });
            },
            $scope,
            function(result) {
                $scope.showMessage(result);
            });
    }


});

