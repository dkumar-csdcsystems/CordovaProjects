app.controller('EditInspectionCtrl', function ($scope, utilService, dataLayerService, $q, $filter, $timeout, CommonService) {
    var clausegrouplabel = [];
    $scope.selectedItems = [];
    $scope.$on('EditInspection', function (events) {
        $timeout(function () {
            //check if there is an existing watch
            if ($scope.attemptWatch) {
                //release existing watch
                $scope.attemptWatch();
            } else {
                $scope.applyAttemptWatch();
            }
            $scope.defaultAttemptResultListAll = [];
            $scope.toBeAttempted = [];
            $scope.attemptResultList = [];

            $scope.attempt = {
                AttemptId: "",
                SelectedAttempResultCode: "",
                AttemptBy: "",
                AttemptComment: "",
                AttempResultCode: ""
            }

            //$scope.filterfoldernumberdata = null,
            //$scope.filterprocesstypedata = null,
            //$scope.filterstatustypedata = null;

            $scope.filter = {
                filterfoldernumberdata: "",
                filterprocesstypedata: "",
                filterstatustypedata: "",
                hidefilter: false
            }
            var docHeight = angular.element("body").height();
            var footerHeight = 10;//angular.element("#footer").height();
            var headerheight = angular.element("#topheader").height();
            angular.element(".overlayEditInspection").animate({
                left: "0px",
                top: headerheight + "px"
            }, 500);

            var editinspectionheaderHeight = angular.element("#editinspectionheader").height();
            var heighttoset = docHeight - (headerheight + editinspectionheaderHeight + 5);

            angular.element("#editinspectioncontent").css("height", heighttoset + "px");

            $("#expandFilter").hide();
            angular.element(".scroll-6").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });

            $scope.folderNumberList = [{ folderNumber: "" }];
            $scope.processTypeList = [{ processType: "" }];
            $scope.statusTypeList = [{ folderStatus: "" }];

            $scope.folderNumberList = $scope.folderNumberList.concat($filter('unique')($scope.listInbox, "folderNumber"));
            $scope.processTypeList = $scope.processTypeList.concat($filter('unique')($scope.listInbox, "processType"));
            $scope.statusTypeList = $scope.statusTypeList.concat($filter('unique')($scope.listInbox, "folderStatus"));

            //Making Selected property of inboxlist to false
            $.grep($scope.listInbox, function (e) {
                if (e.isMultiSignOffSelected) {
                    e.isMultiSignOffSelected = false;
                }
                return e;
            });

            dataLayerService.getFolderProcessAttemptResultList().then(function (result) {
                if (result.data != null && result.data.length > 0) {
                    $scope.defaultAttemptResultListAll = [];
                    var options = [];
                    for (var i = 0; i < result.data.length; i++) {
                        var resultcode = !isNaN(result.data[i].resultcode) ? Number(result.data[i].resultcode) : result.data[i].resultcode;
                        options.push({
                            value: resultcode,
                            name: result.data[i].resultdesc,
                            processCode: result.data[i].processcode
                        });
                    }
                    $scope.defaultAttemptResultListAll = options;
                }
            });

            dataLayerService.getValidClauseData().then(function (result) {
                var items = [], id = 0;
                $scope.clausegrouplist = [];
                $scope.clausegroupvalue = "";
                $scope.clauesevalue = [];
                for (i = 0; i < result.data.length; i++) {
                    var clausegroup = result.data[i].clausegroup;
                    var grp = $.grep(clausegrouplabel, function (n, idx) {
                        id++;
                        if (n.key == clausegroup) {
                            return n;
                        }
                    });
                    if (grp.length > 0) {
                        grp[0].items.push(result.data[i]);
                    } else {
                        clausegrouplabel.push({ key: clausegroup, items: [result.data[i]], id: id });
                    }
                }
                $scope.validclausegroup = clausegrouplabel;
                $scope.clausegroup = clausegrouplabel[0].key;
                $scope.clauesevalue = clausegrouplabel[0].items;
            });

        }, 500)



    });

    $scope.closeEditInspection = function () {
        angular.element(".overlayEditInspection").stop().show().animate({
            left: "-100%",
            display: "block"
        }, 500);
    }
    function operation(list1, list2, operationIsUnion) {
        var result = [];

        for (var i = 0; i < list1.length; i++) {
            var item1 = list1[i],
                found = false;
            for (var j = 0; j < list2.length; j++) {
                if (item1.value === list2[j].value) {
                    found = true;
                    break;
                }
            }
            if (found === operationIsUnion) {
                result.push(item1);
            }
        }
        return result;
    }

    $scope.selectCheckbox = function (item) {
        // Making checkbox isMultiSignOffSelected
        var itemselected = $filter("filter")($scope.listInbox, { processRSN: item.processRSN }, true)[0];
        $filter("filter")($scope.listInbox, { processRSN: item.processRSN }, true)[0].isMultiSignOffSelected = !item.isMultiSignOffSelected;
        // Filtering Attempresult code to be shown in ddl


        //$.map($scope.listInbox, function (item, index) {
        //    $filter("filter")($scope.defaultAttemptResultListAll, { processCode: item.processTypeCode }, true);

        //});
        $scope.toBeAttempted = $.grep($scope.listInbox, function (e) {

            return e.isMultiSignOffSelected == true
        });
        if ($scope.toBeAttempted.length === 0) {
            $scope.attemptResultList = [];
            return;
        } else if ($scope.toBeAttempted.length === 1) {
            var latestSelectedItemResults = $filter("filter")($scope.defaultAttemptResultListAll, { processCode: $scope.toBeAttempted[0].processTypeCode }, true);
            $scope.attemptResultList = latestSelectedItemResults;
        } else {
            $scope.attemptResultList = [];

            $.map($scope.toBeAttempted, function (localitem, index) {
                var latestSelectedItemResults = $filter("filter")($scope.defaultAttemptResultListAll, { processCode: localitem.processTypeCode }, true);
                if ($scope.attemptResultList.length === 0) {
                    $scope.attemptResultList = latestSelectedItemResults;
                }
                var commonresultcode = operation($scope.attemptResultList, latestSelectedItemResults, true);
                if (commonresultcode.length > 0) {
                    $scope.attemptResultList = commonresultcode;
                }
                else {
                    utilService.showError("You can not attempt this inspection. because there is no common attempt result.", "info");
                    itemselected.isMultiSignOffSelected = false;
                    return;
                }
            });



            //var latestSelectedItemResults = $filter("filter")($scope.defaultAttemptResultListAll, { processCode: item.processTypeCode }, true);

            //var commonresultcode = operation($scope.attemptResultList, latestSelectedItemResults, true);
            //if (commonresultcode.length > 0) {
            //    $scope.attemptResultList = commonresultcode;
            //}
            //else {
            //    utilService.showError("No common attempt result.", "info");
            //    $filter("filter")($scope.listInbox, { processRSN: item.processRSN }, true)[0].isMultiSignOffSelected = false;
            //    return;
            //}
        }

        if (itemselected.isMultiSignOffSelected) {
            dataLayerService.getInspectionResultData(itemselected).then(function (result) {
                if (result != null && result.data != null) {

                    //var checkifAlreadyHaveSameProcessRSN = $filter("filter")($scope.toBeAttempted, { processRSN: result.data.processrsn }, true);
                    //if (checkifAlreadyHaveSameProcessRSN.length>0)
                    //{
                    //    $scope.attempt.AttemptComment = result.data.attemptcomment;
                    //}

                    var attempted = $filter("filter")($scope.toBeAttempted, { processRSN: itemselected.processRSN }, true);
                    if (attempted.length > 0) {
                        attempted[0].AttemptId = result.data.attemptid
                    }
                    console.log("inspection result added to folderprocessattempt");
                }
            });
        }
    }

    $scope.toggleFilter = function () {
        // Clearing all filter model from DDL
        var status = !$scope.filter.hidefilter;
        $scope.filter = {
            filterfoldernumberdata: "",
            filterprocesstypedata: "",
            filterstatustypedata: "",
            hidefilter: status
        }
        // Toggling all filter DDL 
        $("#expandFilter").toggle("slide", { direction: "left" }, 1000);
    };

    $scope.openClauseFormEditInspection = function () {
        var x = document.getElementsByName("clauselist");
        for (i = 0; i < x.length; i++) {
            x[i].checked = false;
        }
    };

    $scope.addClauseValueEditInspection = function () {
        $timeout(function () {
            var storedcomment = "";
            if ($scope.attempt.AttemptComment && $scope.attempt.AttemptComment != "") {
                storedcomment = $scope.attempt.AttemptComment + ",";
            }
            var commentstr = $scope.selectedItems.toString();
            $scope.attempt.AttemptComment = storedcomment + commentstr;
            $scope.selectedItems = [];
        }, 0);
        angular.element("#myClauseModalEdit").removeClass("fade").modal("hide");
    };

    $scope.changeClauseEditInspection = function (newvalue) {
        var clauselist = [];
        for (i = 0; i < clausegrouplabel.length; i++) {
            if (clausegrouplabel[i].key === newvalue) {
                $scope.clauesevalue = clausegrouplabel[i].items;
            }
        }
    };

    $scope.selectClause = function (text) {
        $scope.selectedItems.push(text);
    };

    $scope.saveAttemptResult = function () {
        var selectedFolderpeocess = $filter("filter")($scope.listInbox, { isMultiSignOffSelected: true }, true);

        if (selectedFolderpeocess.length === 0) {
            utilService.showError("Please select folder to attempt inspection", 'error');
            return;
        }
        if ($scope.attempt.SelectedAttempResultCode === null || $scope.attempt.SelectedAttempResultCode === '' || $scope.attempt.SelectedAttempResultCode === undefined) {
            utilService.showError("Select attempt result before completing inspection", 'error');
            return;
        }


        return Promise.all(selectedFolderpeocess.map(function (item) {
            var itemtosave = item;
            var attemptdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            itemtosave.AttemptDate = attemptdate;
            var storedUser = JSON.parse(localStorage.getItem("userSettings"));
            itemtosave.AttemptBy = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
            itemtosave.FolderRSN = item.folderRSN;
            itemtosave.ProcessRSN = item.processRSN;
            itemtosave.FolderId = item.folderId;
            itemtosave.ProcessId = item.processId;
            dataLayerService.insertFolderProcessAttempt(item).then(function (result) {
                if (result.data != null) {
                    if (result.data === "success") {
                        //inspection completed successfully, close the overlay;

                    }
                } else if (result.error != null) {
                    utilService.showError(result.error.message, 'error');
                }
            });

        })).then(function (allitemresult) {
            $scope.closeEditInspection();
            //$scope.ClosePanel();
            CommonService.gotoView("");
            $scope.showInboxList();
        }).catch(function (error) {
            utilService.showError("An error occured while adding attempt result", 'error');
        });


    }
    $scope.applyAttemptWatch = function () {
        $scope.attemptWatch = $scope.$watch("attempt", function (newvalue, oldvalue) {
            //create a list of changed fields
            return Promise.all($scope.toBeAttempted.map(function (item) {
                var changedFields = [], databaseField = [];
                if (newvalue.SelectedAttempResultCode !== oldvalue.SelectedAttempResultCode) {
                    newvalue.AttempResultCode = newvalue.SelectedAttempResultCode.value;
                    changedFields.push("AttempResultCode");
                    databaseField.push("resultcode");
                }

                if (newvalue.AttemptComment !== oldvalue.AttemptComment) {
                    changedFields.push("AttemptComment");
                    databaseField.push("attemptcomment");
                }
                var newValues = [];
                if (changedFields.length > 0) {
                    for (var i = 0; i < changedFields.length; i++) {
                        newValues.push($scope.attempt[changedFields[i]]);
                    }
                    dataLayerService.updateAttempt(item.AttemptId, databaseField, newValues).then(function (result) {
                        if (result.error || result.result == null || !result.result.isSuccess) {
                            utilService.showError("update failed..." + changedFields[0], 'error');
                        }
                    });
                }
            })).then(function (allitemresult) {

            }).catch(function (error) {
                utilService.showError("An error occured while adding attempt result", 'error');
            });
        }, true);
    }

});