app.controller('HistoryTabCtrl', function ($scope, $rootScope,dataLayerService, $filter, CommonService, $timeout) {
    $scope.showhistorydetails = false;
    $scope.historyprocessinfosection = false;
    $scope.historychecklistsection = false;
    var dateformat = CommonService.getDateFormat();
    $scope.SelectHistory = function (val) {
         dateformat = CommonService.getDateFormat();
        for (var i = 0; i < $scope.AttemptHistoryList.length; i++) {
            angular.element('#right' + $scope.AttemptHistoryList[i].id).removeClass('ng-hide');
            angular.element('#down' + $scope.AttemptHistoryList[i].id).addClass('ng-hide');
        }
        angular.element('#right' + val.id).addClass('ng-hide');
        angular.element('#down' + val.id).removeClass('ng-hide');

        $scope.showhistorydetails = true;
        $scope.HistoryProcessAttempt = [];
        $scope.HistoryProcessChecklistDetails = [];
        $scope.HistoryProcessChecklistDetails = [];
        $scope.HistoryProcessDeficiency = [];
        $scope.HistoryInspectionComments = [];
        dataLayerService.getHistoryProcessAttemptByProcessRSN(val).then(function (result) {

            if (result.data != null && result.data.length > 0) {
                for (var i = 0; i < result.data.length; i++) {
                    var list = result.data[i];
                    list.attemptdate = moment(result.data[i].attemptdate).format(dateformat);
                    $scope.HistoryProcessAttempt.push(list);
                }
            }
             
        });
        dataLayerService.getHistoryProcessChecklist(val).then(function (result) {
            $scope.selectedItems = [];
            var description = [], counter = 0, checklistcollapse = 0,
                selection = [], listcode = "", checklistLabel = [], i;
            for (i = 0; i < result.data.length; i++) {
                counter++;
                var yesNoNa = "";
                if (result.data[i].notapplicableflag == "Y" || result.data[i].notapplicableflag == "true") {
                    yesNoNa = "na";
                } else {
                    if (result.data[i].passed == "Y" || result.data[i].passed == "true") {
                        yesNoNa = "yes";
                    } else if (result.data[i].passed == "N" || result.data[i].passed == "false") {
                        yesNoNa = "no";
                    } else if (result.data[i].passed == "") {
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
                    checklistdesc: result.data[i].checklistdesc,
                    comment: result.data[i].checklistcomment,
                    passed: (result.data[i].passed == "Y" || result.data[i].passed == "true") ? true : false,
                    count: "radio" + "" + counter + "",
                    checklistcode: result.data[i].checklistcode,
                    processrsn: result.data[i].processrsn,
                    yesNoNA: yesNoNa
                };

                description.push(desc);

                var checklistgroupdesc = result.data[i].checklistgroupdesc;
                var checklistgroupcode = result.data[i].checklistgroupcode;

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
            
            for (i = 0; i < checklistLabel.length; i++) {
                if (checklistLabel[i].key === "") {
                    checklistLabel[i].key = "Ungrouped Items";
                }
            }
            $scope.HistoryProcessChecklistDetails = checklistLabel;
             
        });
        dataLayerService.getHistoryProcessInfoData(val).then(function (result) {

            var ungroupInfoDetails = [], groupInfoDetails = [], values, val = [], Details = [], HistoryProcessInfoGroupLabel = [], groups = {}, options = [];
            $scope.HistoryProcessInfo = [];
            $scope.HistoryProcessInfoDetails = [];
            var dateformat = CommonService.getDateFormat();
            if (result && result.data && result.data.length > 0) {

                for (var i = 0 ; i < result.data.length; i++) {
                    var infoGroup = result.data[i].infogroup;
                    var infoType = result.data[i].infotype;
                    if (infoType.toUpperCase() === "DATE" || infoType.toUpperCase() === "D")
                    {
                        result.data[i].infovalue = moment(new Date(result.data[i].infovalue)).format(dateformat);
                    }
                    var grp = $.grep(HistoryProcessInfoGroupLabel, function (n, idx) {
                        if (n.key == infoGroup) return n;
                    });
                    if (grp.length > 0) {
                        grp[0].elements.push(result.data[i]);
                    }
                    else {
                        HistoryProcessInfoGroupLabel.push({ key: infoGroup, elements: [result.data[i]] });
                    }
                }
                $scope.HistoryProcessInfoDetails = HistoryProcessInfoGroupLabel;
                for (var i = 0; i < HistoryProcessInfoGroupLabel.length; i++) {
                    if (HistoryProcessInfoGroupLabel[i].key === "") {
                        HistoryProcessInfoGroupLabel[i].key = "Ungrouped Infos";
                    }
                    var optionTypeInfos = ["PICK", "MULTI_PICK", "CHOOSE", "P", "C"];
                    for (var j = 0; j < HistoryProcessInfoGroupLabel[i].elements.length; j++) {
                        if (optionTypeInfos.indexOf(HistoryProcessInfoGroupLabel[i].elements[j].infotype) >= 0) {
                            $scope.selectedValue = HistoryProcessInfoGroupLabel[i].elements[j].infovalue;
                            $scope.selectedType = HistoryProcessInfoGroupLabel[i].elements[j].infotype;
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
                                    currentitem.HistoryProcessInfo = options;

                                    if (selectedtype === "MULTI_PICK" || selectedtype === "PICK") {
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
                                        currentitem.selectedValue = $filter("filter")(options, { value: selected }, true)[0];
                                    }
                                });
                            })(HistoryProcessInfoGroupLabel[i].elements[j], $scope.selectedValue, $scope.selectedType);
                        }
                    }
                }
            }
             
        });
        dataLayerService.getHistoryProcessDeficiencyList(val).then(function (response) {
            for (var k = 0 ; k < response.data.length; k++) {
                var list = response.data[k];
                $scope.HistoryProcessDeficiency.push(list);
            }
             
        });
        dataLayerService.getHistoryInspectionComments(val).then(function (response) {

            for (var k = 0 ; k < response.data.length; k++) {
                var list = response.data[k];
                $scope.HistoryInspectionComments.push(list);
            }
             
        });
    }
    $scope.CloseHistory = function () {
        for (var i = 0; i < $scope.AttemptHistoryList.length; i++) {
            angular.element('#right' + $scope.AttemptHistoryList[i].id).removeClass('ng-hide');
            angular.element('#down' + $scope.AttemptHistoryList[i].id).addClass('ng-hide');
        }
        $scope.showhistorydetails = false;
    }
});