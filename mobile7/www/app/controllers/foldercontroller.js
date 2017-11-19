app.controller("FolderCtrl", function ($scope, $timeout, utilService, CommonService, dataLayerService) {
    /*Add Folder Start here*/
    $scope.todayDate = utilService.dateformat(new Date(), "M d Y h:i:s");

    $scope.onFolderTypeChange = function (changedval) {
       
        $scope.addedFolderVariable.folderSubTypeList = [];
        $scope.addedFolderVariable.folderWorkTypeList = [];
        $scope.addedFolderVariable.folderSubType = "";
        $scope.addedFolderVariable.folderWorkType = "";
        //var folderObj = $.grep($scope.addedFolderVariable.folderTypeList, function (e) { return e.foldertype == $scope.addedFolderVariable.folderType; });
        //Using HardCode Values to Test
        if (changedval != null && changedval != undefined) {
            $scope.addedFolderVariable.folderSubTypeRequired = changedval.subtypeentryrequired;
            $scope.addedFolderVariable.folderWorkTypeRequired = changedval.workcodeentryrequired;
            $scope.addedFolderVariable.promptMultiProperty = changedval.promptmultipleproperty;
            $scope.addedFolderVariable.propertyRequired = changedval.propertyrequired;
            $scope.addedFolderVariable.peopleRequired = "true";// Not in Datasbase
            $scope.addedFolderVariable.folderProcessTypeRequired = "true";
            $scope.addedFolderVariable.folderType = changedval.foldertype;
        }
        dataLayerService.getFolderSubType($scope.addedFolderVariable.folderType).then(function (result) {
            var data = result.data;
            $scope.addedFolderVariable.folderSubTypeList = [];
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addedFolderVariable.folderSubTypeList.push({
                        value: data[i].subcode,
                        name: data[i].subdesc,
                    });
                }
            }

        });
        dataLayerService.getFolderProcessType($scope.addedFolderVariable.folderType).then(function (result) {
            var data = result.data;
            $scope.addedFolderVariable.folderProcessTypeList = [];
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addedFolderVariable.folderProcessTypeList.push({
                        value: data[i].processcode,
                        name: data[i].processdesc,
                    });
                }
            }

        });
    }
    $scope.onFolderSubTypeChange = function (changedval) {
        $scope.addedFolderVariable.folderWorkTypeList = [];
        $scope.addedFolderVariable.folderSubType = changedval.value;
        dataLayerService.getFolderWorkType($scope.addedFolderVariable.folderType, $scope.addedFolderVariable.folderSubType).then(function (result) {
            var data = result.data;
            $scope.addedFolderVariable.folderWorkTypeList = [];
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addedFolderVariable.folderWorkTypeList.push({
                        value: data[i].workcode,
                        name: data[i].workdesc,
                    });
                }
            }

        });
    }

    $scope.CloseAddFolderPanel = function () {
        angular.element(".overlayAddFolder").stop().show().animate({
            left: "-100%",
            display: "block"
        }, 500);
    }

    $scope.onAddFolder = function () {
        $scope.addedFolderVariable.folderTypeList = [];
       
        var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
        if ($.isArray(storedUser) && storedUser.length > 0) {
            var currentuser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
        }
        dataLayerService.getAllowedFolderType(currentuser).then(function (result) {
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addedFolderVariable.folderTypeList.push({
                        foldertype: data[i].foldertype,
                        folderdesc: data[i].folderdesc,
                        violationflag: data[i].violationflag,
                        propertyrequired: data[i].propertyrequired,
                        promptmultipleproperty: data[i].promptmultipleproperty,
                        subtypeentryrequired: data[i].subtypeentryrequired,
                        workcodeentryrequired: data[i].workcodeentryrequired,
                    });
                }

            }

            angular.element(".overlayAddFolder").animate({
                left: "0px",
            }, 500);
            var dateformat = CommonService.getDateFormat();
            $("#processdatetimepicker").datetimepicker({
                format: dateformat,
                minDate: new Date()
            });
            
        });

    }

    $scope.onSaveFolder = function () {

        if ($scope.addedFolderVariable.folderType === "")
        {
            utilService.showError("Please select folder type.", "error");
            return;
        }
        if ($scope.addedFolderVariable.folderProcessType === "") {
            utilService.showError("Please select process type.", "error");
            return;
        }

        if ($scope.addedFolderVariable.folderName === "") {
            utilService.showError("Please enter folder name.", "error");
            return;
        }


        var propertyRSN = 0;
        if ($scope.addedFolderVariable.PropertyAddedList.length > 0) {
            propertyRSN = $scope.addedFolderVariable.PropertyAddedList[0].propertyrsn;
        }

        var insertFolder = [
            0, // Default FolderRSN
            propertyRSN,
            $scope.addedFolderVariable.folderType,
            $scope.addedFolderVariable.folderName,
            $scope.addedFolderVariable.folderDescription,
            $scope.addedFolderVariable.folderSubType.toString(),
            $scope.addedFolderVariable.folderWorkType.toString(),
            "", // Reference File
            $scope.addedFolderVariable.folderCondition,
            utilService.dateformat(new Date(), "Y-m-d h:i:s"), //Folder InDate
            "5", //StatusCode
            $scope.addedFolderVariable.ParentId === "" || null ? "0" : "" + $scope.addedFolderVariable.folderParentId + "",
            $scope.addedFolderVariable.propertyRSN == null || "" ? "0" : "" + $scope.addedFolderVariable.propertyRSN + "",
            utilService.dateformat(new Date(), "Y").substring(0, 2), //Folder Century
            utilService.dateformat(new Date(), "Y").substring(2, 4), //Folder Year
            "Y" //isNew
        ];

        dataLayerService.insertFolder(insertFolder).then(function (result) {
            var folderId = result.data;
            // Insert Property Based on FolderId and PropertyRsn

            return Promise.all($scope.addedFolderVariable.PropertyAddedList.map(function (property) {
                if (property) {
                    var folderProperty = {
                        FolderId: folderId,
                        PropertyRSN: property.propertyrsn,
                        PropertyTypeCode: property.propertytypecode,
                        PropertyStatusCode: property.statuscode,
                        IsNew: "Y"
                    }
                    // Save property
                    dataLayerService.insertProperty(property).then(function (insertPropertyResult) {
                        if (insertPropertyResult.isSuccess) {
                            console.log("record inserted/updated for property table");
                            // Save folder property
                            dataLayerService.insertFolderProperty(folderProperty).then(function (insertFolderPropertyResult) {
                                if (insertFolderPropertyResult.data === "success") {
                                    console.log("record inserted/updated for folderproperty table");

                                } else {
                                    console.log("record could not be inserted/updated for folderproperty table");
                                }

                            });
                        } else {
                            console.log("record could not be inserted/updated for property table");
                        }
                    });
                }

            })).then(function (allPropertyResult) {

                return Promise.all($scope.addedFolderVariable.PeopleAddedList.map(function (people) {
                    if (people) {
                        var folderPeople = {
                            FolderId: folderId,
                            PeopleId: 0,
                            PeopleCode: people.peopleSelectedRoleType.value,
                            PeopleRSN: people.peoplersn,
                            StatusCode: people.statuscode,
                            IsNew: "Y"
                        }
                        // Save People
                        dataLayerService.insertPeople(people).then(function(result) {
                            if (result.isSuccess) {
                                console.log("record inserted/updated for people table");
                                // Save folder people
                                dataLayerService.insertFolderPeople(folderPeople).then(function(result) {
                                    if (result.data == "success") {
                                        console.log("record inserted/updated for folderpeople table");
                                    } else {
                                        console.log("record could not be inserted/updated for folderpeople table");
                                    }
                                });
                            } else {
                                console.log("record could not be inserted/updated for people table");
                            }
                        });
                    }

                })).then(function (allPeopleResult) {
                    var folderInfo = { FolderType: $scope.addedFolderVariable.folderType, FolderId: folderId, IsNew: "Y", IsEdited: "N" };
                    // Save folder info
                    dataLayerService.insertFolderInfo(folderInfo).then(function (result) {
                        var res = result.data;
                        var folderProcess = {
                            ProcessRSN: "0",// 
                            FolderId: folderId,// 
                            ProcessCode: $scope.addedFolderVariable.folderProcessType,//
                            Periority: $scope.addedFolderVariable.folderProcessPriority,//
                            ScheduleDate: utilService.dateformat(new Date(), "Y-m-d h:i:s"),//$scope.addedFolderVariable.folderProcessScheduleDate,//
                            StampDate: utilService.dateformat(new Date(), "Y-m-d h:i:s"),//
                            AssignedUser: JSON.parse(localStorage.getItem("userSettings"))[0].validuser,// need to get user id from local storage
                            StatusCode: 1,//
                            FolderRSN: 0,//
                            Comments: "",//
                            ProcessComments: "",//
                            ScheduleEndDate: utilService.dateformat(new Date(), "Y-m-d h:i:s"),// $scope.addedFolderVariable.folderProcessScheduleDate,// 
                            Reference: "",//
                            StartDate: "",// 
                            DisplayOrder: "",//
                            IsNew: "Y",
                            IsEdited: "N",
                            EndDate: ""
                        };
                        // Save folder process
                        dataLayerService.insertFolderProcess(folderProcess).then(function (insertFolderProcessResult) {
                            var processrsn = insertFolderProcessResult.data;

                            var folderProcessInfo = { ProcessRSN: 0, FolderId: folderId, ProcessCode: $scope.addedFolderVariable.folderProcessType, IsNew: "Y", IsEdited: "N", ProcessId: insertFolderProcessResult.data };
                            // Save folder process info
                            dataLayerService.insertFolderProcessInfo(folderProcessInfo).then(function (processInfoResult) {
                                var res = processInfoResult.data;
                                // save folder process checklist
                                var folderProcessChecklist = { ProcessRSN: 0, FolderId: folderId, ProcessCode: $scope.addedFolderVariable.folderProcessType, IsNew: "Y", IsEdited: "N", ProcessId: insertFolderProcessResult.data };
                                dataLayerService.insertFolderProcessChecklist(folderProcessChecklist).then(function (checklistResult) {
                                    var res = checklistResult.data;
                                    $scope.CloseAddFolderPanel();
                                    utilService.showError("Folder created successfully.","success");
                                    CommonService.gotoView("Inbox");
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    $scope.onPeopleSelectedRoleTypeChange = function (id, selectedOption) {
        $scope.addedFolderVariable.PeopleAddedList[id - 1].peopleSelectedRoleType = selectedOption;
    }
    /*End Of Add Folder */
    /* */

    $scope.$on("AddFolder", function (events) {
        $scope.addedFolderVariable = {
            PeopleAddedList: [], peopleRoleList: [], PropertyAddedList: [], folderType: "", folderSubType: "", folderWorkType: "", folderProcessType: "", folderProcessScheduleDate: "",
            folderProcessPriority: "", folderParentId: "", folderPermitNo: "", folderName: "", folderDescription: "", folderCondition: "", folderSubTypeRequired: "", folderWorkTypeRequired: "",
            promptMultiProperty: "", propertyRequired: "", peopleRequired: "", folderProcessTypeRequired: ""
        };
        $scope.onAddFolder();
        var docHeight = angular.element(".overlayAddFolder").height();

        //var footerHeight = angular.element("#footer").height();
        var newfolderheaderHeight = angular.element("#newfolderheader").height();
        var newfolderfooterHeight = angular.element("#newfolderfooter").height();
        var heighttoset = docHeight - (newfolderheaderHeight + newfolderfooterHeight);
        angular.element(".scroll-4").mCustomScrollbar({
            setHeight: heighttoset,
            theme: "3d-dark"
        });
        // Manual width set for Custom Scrollbar because scroll bar overlap the content
        angular.element(".scroll-4").find(".mCustomScrollBox").find(".mCSB_container").css("width", "99%")
    });

    $scope.AddFolderPeople = function () {
        $scope.$broadcast("AddPeople");
    }
    $scope.AddFolderProperty = function () {
        $scope.$broadcast("AddProperty");
    }

    $scope.$on("addedPeople", function (event, addedpeople, peoplelist) {
        $scope.addedFolderVariable.PeopleAddedList = addedpeople;
        $scope.addedFolderVariable.peopleRoleList = peoplelist;
    });
    $scope.$on("addedProperty", function (event, addedproperty) {
        $scope.addedFolderVariable.PropertyAddedList = addedproperty;
    });

    $scope.RemoveAddedPeople = function (id) {
        $scope.$broadcast("removePeople", id);
    }
    $scope.RemoveAddedProperty = function (id) {
        $scope.$broadcast("removeProperty", id);
    }
});