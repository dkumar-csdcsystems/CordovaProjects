app.controller("FreeFormCtrl", function ($scope, $rootScope, CommonService, dataLayerService, utilService, $filter, $timeout) {
    $scope.folderFreeFormDataList = [];
    $scope.folderProcessFreeFormDataList = [];
    $scope.showfreeform = false;
    var freeformCode, folderRSN, parentName, processRSN;
    $scope.merge = function (obj1, obj2) {
        var obj = {};

        for (var x in obj1)
            if (obj1.hasOwnProperty(x))
                obj[x] = obj1[x];

        for (var x in obj2)
            if (obj1.hasOwnProperty(x))
                obj[x] = obj2[x];

        return obj;
    }

    $scope.init = function (freeformcode, folderrsn, parentname) {
        freeformCode = freeformcode;
        folderRSN = folderrsn;
        parentName = parentname;
        CommonService.setHeights();
    }

    $scope.selectValidFreeFormTab = function (freeformcode, folderrsn, isnewadded) {
        if (isnewadded === undefined || isnewadded === false) {
            if ($scope.folderFreeFormDataList && $scope.folderFreeFormDataList.length > 0) {
                if ($filter('filter')($scope.folderFreeFormDataList, { freeformcode: freeformcode, folderrsn: folderrsn }, true).length > 0) {
                    return;
                }
            }
        }
        dataLayerService.getFolderFreeFormData(freeformcode, folderrsn).then(function (result) {
            $scope.folderFreeFormDataList = [];
            if (result.data && result.data.length > 0) {
                for (var i = 0; i < result.data.length; i++) {
                    $scope.folderFreeFormDataList.push(result.data[i]);
                    $scope.folderFreeFormDataList[i].toBeDelete = false;
                }
            }
            return dataLayerService.getValidFreeColumnByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderFreeFormDataList.validColumnList = [];
            if (response.data && response.data.length > 0) {
                for (var j = 0; j < response.data.length; j++) {
                    $scope.folderFreeFormDataList.validColumnList.push(response.data[j]);
                }
            }
            var dateformat = CommonService.getDateFormat();
            $timeout(function () {
                $(".input-group.date").datetimepicker({
                    format: dateformat
                });
            });

            return dataLayerService.getValidFreeDefaultByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderFreeFormDataList.validDefaultList = [];
            if (response.data && response.data.length > 0) {
                for (var k = 0; k < response.data.length; k++) {
                    $scope.folderFreeFormDataList.validDefaultList.push(response.data[k]);
                }
            }
            return dataLayerService.getValidFreeColumnValueByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderFreeFormDataList.validColumnValueList = [];
            if (response.data && response.data.length > 0) {
                for (var k = 0; k < response.data.length; k++) {
                    $scope.folderFreeFormDataList.validColumnValueList.push(response.data[k]);
                }
            }
            var ovarlayHeight = angular.element(".overlay").height();
            var footerHeight =10;//angular.element("#footer").height();
            var tabbarheight = angular.element("#inspectiontabs").height();
            angular.element(".scroll").mCustomScrollbar({
                setHeight: (ovarlayHeight - (tabbarheight + footerHeight + 15)),
                theme: "3d-dark"
            });
        });
    }
    function cleannulldata(obj) {
        for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined || obj[propName] === "" || obj[propName] === " ") {
                delete obj[propName];
            }
        }
        return obj;
    }
    var onFolderFreeFromTabSelect = $rootScope.$on("onFolderFreeFromTabSelect", function (event, data) {
        if (data && data.freeformcode == freeformCode && data.folderrsn == folderRSN && parentName.toUpperCase() == "FOLDER") {
            $scope.selectValidFreeFormTab(data.freeformcode, data.folderrsn);
        }

    });
    var onFolderProcessFreeFromTabSelect = $rootScope.$on("onFolderProcessFreeFromTabSelect", function (event, data) {
        if (data && data.freeformcode == freeformCode && data.folderrsn == folderRSN && parentName.toUpperCase() == "FOLDER_PROCESS") {
            $scope.selectValidFolderProcessFreeFormTab(data.freeformcode, data.folderrsn, data.processrsn);
        }
    });

    var onFreeFromTabListLoaded = $rootScope.$on("onFreeFromTabListLoaded", function (event, data) {
        $scope.validFolerFreeFormTabList = [];
        if (data && data.length > 0) {
            $scope.validFolerFreeFormTabList = data;
        }
      

    });

    var onFolerProcessFreeFormTab = $rootScope.$on("onFolerProcessFreeFormListLoaded", function (event, data) {
        $scope.validFolerProcessFreeFormTabList = [];
        if (data && data.length > 0) {
            $scope.validFolerProcessFreeFormTabList = data;
        }
    });

    $scope.freeFromInputChange = function (tableid) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.yesRadioSelected = function (tableid, colname) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0][colname] = true;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.noRadioSelected = function (tableid, colname) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0][colname] = false;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.addFolderFreeFrom = function (freeformcode, folderrsn, isnewfolder, folderid) {
        var mappings = {};
        if (isnewfolder && isnewfolder.toUpperCase() === "Y") {
            mappings['folderid'] = folderid;
        } else {
            mappings['folderid'] = null;
        }
        mappings['freeformcode'] = freeformcode;
        mappings['folderrsn'] = folderrsn;
        mappings['processrsn'] = "";

        mappings['formrow'] = "";
        mappings['freeformrsn'] = "0";
        mappings['comments'] = "";
        mappings['B01'] = "";
        mappings['B02'] = "";
        mappings['B03'] = "";
        mappings['B04'] = "";
        mappings['B05'] = "";
        mappings['B06'] = "";
        mappings['B07'] = "";
        mappings['B08'] = "";
        mappings['B09'] = "";
        mappings['B010'] = "";
        mappings['B011'] = "";
        mappings['B012'] = "";
        mappings['B013'] = "";
        mappings['B014'] = "";
        mappings['B015'] = "";
        mappings['B016'] = "";
        mappings['B017'] = "";
        mappings['B018'] = "";
        mappings['B019'] = "";
        mappings['B020'] = "";
        mappings['C01'] = "";
        mappings['C02'] = "";
        mappings['C03'] = "";
        mappings['C04'] = "";
        mappings['C05'] = "";
        mappings['C06'] = "";
        mappings['C07'] = "";
        mappings['C08'] = "";
        mappings['C09'] = "";
        mappings['C010'] = "";
        mappings['C011'] = "";
        mappings['C012'] = "";
        mappings['C013'] = "";
        mappings['C014'] = "";
        mappings['C015'] = "";
        mappings['C016'] = "";
        mappings['C017'] = "";
        mappings['C018'] = "";
        mappings['C019'] = "";
        mappings['C020'] = "";
        mappings['D01'] = "";
        mappings['D02'] = "";
        mappings['D03'] = "";
        mappings['D04'] = "";
        mappings['D05'] = "";
        mappings['D06'] = "";
        mappings['D07'] = "";
        mappings['D08'] = "";
        mappings['D09'] = "";
        mappings['D010'] = "";
        mappings['D011'] = "";
        mappings['D012'] = "";
        mappings['D013'] = "";
        mappings['D014'] = "";
        mappings['D015'] = "";
        mappings['D016'] = "";
        mappings['D017'] = "";
        mappings['D018'] = "";
        mappings['D019'] = "";
        mappings['D020'] = "";
        mappings['F01'] = "";
        mappings['F02'] = "";
        mappings['F03'] = "";
        mappings['F04'] = "";
        mappings['F05'] = "";
        mappings['F06'] = "";
        mappings['F07'] = "";
        mappings['F08'] = "";
        mappings['F09'] = "";
        mappings['F010'] = "";
        mappings['F011'] = "";
        mappings['F012'] = "";
        mappings['F013'] = "";
        mappings['F014'] = "";
        mappings['F015'] = "";
        mappings['F016'] = "";
        mappings['F017'] = "";
        mappings['F018'] = "";
        mappings['F019'] = "";
        mappings['F020'] = "";
        mappings['N01'] = "";
        mappings['N02'] = "";
        mappings['N03'] = "";
        mappings['N04'] = "";
        mappings['N05'] = "";
        mappings['N06'] = "";
        mappings['N07'] = "";
        mappings['N08'] = "";
        mappings['N09'] = "";
        mappings['N010'] = "";
        mappings['N011'] = "";
        mappings['N012'] = "";
        mappings['N013'] = "";
        mappings['N014'] = "";
        mappings['N015'] = "";
        mappings['N016'] = "";
        mappings['N017'] = "";
        mappings['N018'] = "";
        mappings['N019'] = "";
        mappings['N020'] = "";
        mappings['stampdate'] = "";
        mappings['stampuser'] = "";
        mappings['processid'] = "";

        for (var i = 0; i < $scope.folderFreeFormDataList.validColumnList.length; i++) {
            var colname = $scope.folderFreeFormDataList.validColumnList[i]["columnname"];
            if (mappings[colname] != undefined) {
                mappings[colname] = $scope.folderFreeFormDataList.validColumnList[i]["defaulltvalue"];
            }
        }
        var stampdate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var storedUser = JSON.parse(localStorage.getItem("userSettings"));
        mappings['stampdate'] = stampdate;
        mappings['stampuser'] = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
        mappings['parentname'] = parentName;
        mappings['isnew'] = "Y";
        if ($scope.folderFreeFormDataList.validColumnList.length > 0) {
            dataLayerService.insertFolderFreeFrom(mappings).then(function (result) {
                if (result && result.data === "failed") {
                    utilService.showError("Error occurred while inserting free form data.", 'error');
                }
                else if (result && result.data !== null && result.data === "no rows inserted") {
                    utilService.showError("Nothing to save.", 'info');
                }
                else if (result && result.data !== null && result.data === "success") {
                    utilService.showError("Free form data inserted successfully.", 'success');
                    $scope.selectValidFreeFormTab(freeformcode, folderrsn, true);
                }
            });
        }
    }

    $scope.deleteFolderFreeFrom = function (freeformcode, folderrsn) {
        var tobedelete = $filter('filter')($scope.folderFreeFormDataList, { toBeDelete: true }, true);
        if (tobedelete.length > 0) {
            var idtobedelete = $.map(tobedelete, function (item) {
                return item.id;
            }).join(',');
            dataLayerService.deleteFolderFreeForm(idtobedelete).then(function (result) {
                if (result && result.data === "success") {
                    utilService.showError("Free form deleted successfully.", 'success');
                    $scope.selectValidFreeFormTab(freeformcode, folderrsn, true);
                } else {
                    utilService.showError("Could not be deleted.", 'error');
                }
            });
        }
    }

    $scope.addFolderProcessFreeFrom = function (freeformcode, folderrsn, processrsn, isnewprocess, folderid, processid) {
        var mappings = {};
        if (isnewprocess && isnewprocess.toUpperCase() === "Y") {

        } else {
            mappings['folderid'] = null;
            mappings['processid'] = null;
        }

        mappings['folderid'] = folderid == (null || "" || undefined) ? null : folderid;
        mappings['processid'] = processid == (null || "" || undefined) ? null : processid;


        mappings['freeformcode'] = freeformcode;
        mappings['folderrsn'] = folderrsn;
        mappings['processrsn'] = processrsn === undefined ? "" : processrsn;
        mappings['inspdetailrsn'] = "0";
        mappings['comments'] = "";
        mappings['B01'] = "";
        mappings['B02'] = "";
        mappings['B03'] = "";
        mappings['B04'] = "";
        mappings['B05'] = "";
        mappings['B06'] = "";
        mappings['B07'] = "";
        mappings['B08'] = "";
        mappings['B09'] = "";
        mappings['B010'] = "";
        mappings['B011'] = "";
        mappings['B012'] = "";
        mappings['B013'] = "";
        mappings['B014'] = "";
        mappings['B015'] = "";
        mappings['B016'] = "";
        mappings['B017'] = "";
        mappings['B018'] = "";
        mappings['B019'] = "";
        mappings['B020'] = "";
        mappings['C01'] = "";
        mappings['C02'] = "";
        mappings['C03'] = "";
        mappings['C04'] = "";
        mappings['C05'] = "";
        mappings['C06'] = "";
        mappings['C07'] = "";
        mappings['C08'] = "";
        mappings['C09'] = "";
        mappings['C010'] = "";
        mappings['C011'] = "";
        mappings['C012'] = "";
        mappings['C013'] = "";
        mappings['C014'] = "";
        mappings['C015'] = "";
        mappings['C016'] = "";
        mappings['C017'] = "";
        mappings['C018'] = "";
        mappings['C019'] = "";
        mappings['C020'] = "";
        mappings['D01'] = "";
        mappings['D02'] = "";
        mappings['D03'] = "";
        mappings['D04'] = "";
        mappings['D05'] = "";
        mappings['D06'] = "";
        mappings['D07'] = "";
        mappings['D08'] = "";
        mappings['D09'] = "";
        mappings['D010'] = "";
        mappings['D011'] = "";
        mappings['D012'] = "";
        mappings['D013'] = "";
        mappings['D014'] = "";
        mappings['D015'] = "";
        mappings['D016'] = "";
        mappings['D017'] = "";
        mappings['D018'] = "";
        mappings['D019'] = "";
        mappings['D020'] = "";
        mappings['F01'] = "";
        mappings['F02'] = "";
        mappings['F03'] = "";
        mappings['F04'] = "";
        mappings['F05'] = "";
        mappings['F06'] = "";
        mappings['F07'] = "";
        mappings['F08'] = "";
        mappings['F09'] = "";
        mappings['F010'] = "";
        mappings['F011'] = "";
        mappings['F012'] = "";
        mappings['F013'] = "";
        mappings['F014'] = "";
        mappings['F015'] = "";
        mappings['F016'] = "";
        mappings['F017'] = "";
        mappings['F018'] = "";
        mappings['F019'] = "";
        mappings['F020'] = "";
        mappings['N01'] = "";
        mappings['N02'] = "";
        mappings['N03'] = "";
        mappings['N04'] = "";
        mappings['N05'] = "";
        mappings['N06'] = "";
        mappings['N07'] = "";
        mappings['N08'] = "";
        mappings['N09'] = "";
        mappings['N010'] = "";
        mappings['N011'] = "";
        mappings['N012'] = "";
        mappings['N013'] = "";
        mappings['N014'] = "";
        mappings['N015'] = "";
        mappings['N016'] = "";
        mappings['N017'] = "";
        mappings['N018'] = "";
        mappings['N019'] = "";
        mappings['N020'] = "";
        mappings['stampdate'] = "";
        mappings['stampuser'] = "";

        for (var i = 0; i < $scope.folderProcessFreeFormDataList.validColumnList.length; i++) {
            var colname = $scope.folderProcessFreeFormDataList.validColumnList[i]["columnname"];
            if (mappings[colname] != undefined) {
                mappings[colname] = $scope.folderProcessFreeFormDataList.validColumnList[i]["defaulltvalue"];
            }
        }
        var stampdate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var storedUser = JSON.parse(localStorage.getItem("userSettings"));
        mappings['stampdate'] = stampdate;
        mappings['stampuser'] = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;;
        mappings['parentname'] = parentName;
        mappings['isnew'] = "Y";
        if ($scope.folderProcessFreeFormDataList.validColumnList.length > 0) {
            dataLayerService.insertFolderFreeFrom(mappings).then(function (result) {
                if (result && result.data === "failed") {
                    utilService.showError("Error occurred while inserting free form data.", 'error');
                }
                else if (result && result.data !== null && result.data === "no rows inserted") {
                    utilService.showError("Nothing to save.", 'info');
                }
                else if (result && result.data !== null && result.data === "success") {
                    utilService.showError("Free form data inserted successfully.", 'success');
                    $scope.selectValidFolderProcessFreeFormTab(freeformcode, folderrsn, processrsn, true);
                }
            });
        }
    }

    $scope.folderProcessFreeFromInputChange = function (tableid) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderProcessFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderProcessFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.folderProcessYesRadioSelected = function (tableid, colname) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderProcessFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0][colname] = true;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderProcessFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.folderProcessNoRadioSelected = function (tableid, colname) {
        var changedFolderFreeFormRow = $filter('filter')($scope.folderProcessFreeFormDataList, { id: tableid }, true);
        if (changedFolderFreeFormRow.length > 0) {
            var stampdate = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
            changedFolderFreeFormRow[0]["stampdate"] = stampdate;
            changedFolderFreeFormRow[0][colname] = false;
            changedFolderFreeFormRow[0]['isedited'] = "Y";
            dataLayerService.updateFolderProcessFreeFrom(changedFolderFreeFormRow[0]).then(function (result) {

            });
        }
    }

    $scope.selectValidFolderProcessFreeFormTab = function (freeformcode, folderrsn, processrsn, isnewadded) {
        if (isnewadded === undefined || isnewadded === false) {
            if ($scope.folderProcessFreeFormDataList && $scope.folderProcessFreeFormDataList.length > 0) {
                if ($filter('filter')($scope.folderProcessFreeFormDataList, { freeformcode: freeformcode, folderrsn: folderrsn }, true).length > 0) {
                    return;
                }
            }
        }
        dataLayerService.getFolderProcessFreeFormData(freeformcode, folderrsn, processrsn).then(function (result) {
            $scope.folderProcessFreeFormDataList = [];
            if (result.data && result.data.length > 0) {
                for (var i = 0; i < result.data.length; i++) {
                    $scope.folderProcessFreeFormDataList.push(result.data[i]);
                    $scope.folderProcessFreeFormDataList[i].toBeDelete = false;
                }
            }
            return dataLayerService.getValidFreeColumnByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderProcessFreeFormDataList.validColumnList = [];
            if (response.data && response.data.length > 0) {
                for (var j = 0; j < response.data.length; j++) {
                    $scope.folderProcessFreeFormDataList.validColumnList.push(response.data[j]);
                }
            }
            var dateformat = CommonService.getDateFormat();
            $timeout(function () {
                $(".input-group.date").datetimepicker({
                    format: dateformat
                });
            });

            return dataLayerService.getValidFreeDefaultByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderProcessFreeFormDataList.validDefaultList = [];
            if (response.data && response.data.length > 0) {
                for (var k = 0; k < response.data.length; k++) {
                    $scope.folderProcessFreeFormDataList.validDefaultList.push(response.data[k]);
                }
            }
            return dataLayerService.getValidFreeColumnValueByFreeFromCode(freeformcode);
        }).then(function (response) {
            $scope.folderProcessFreeFormDataList.validColumnValueList = [];
            if (response.data && response.data.length > 0) {
                for (var k = 0; k < response.data.length; k++) {
                    $scope.folderProcessFreeFormDataList.validColumnValueList.push(response.data[k]);
                }
            }
            //var ovarlayHeight = angular.element(".overlay").height();
            //var footerHeight = angular.element("#footer").height();
            //var tabbarheight = angular.element("#inspectiontabs").height();
            //angular.element(".scroll").mCustomScrollbar({
            //    setHeight: (ovarlayHeight - (tabbarheight + footerHeight + 15)),
            //    theme: "minimal-dark"
            //});
        });
    }

    $scope.deleteFolderProcessFreeFrom = function (freeformcode, folderrsn, processrsn) {
        var tobedelete = $filter('filter')($scope.folderProcessFreeFormDataList, { toBeDelete: true }, true);
        if (tobedelete.length > 0) {
            var idtobedelete = $.map(tobedelete, function (item) {
                return item.id;
            }).join(',');
            dataLayerService.deleteFolderProcessFreeForm(idtobedelete).then(function (result) {
                if (result && result.data === "success") {
                    utilService.showError("Free form deleted successfully.", 'success');
                    $scope.selectValidFreeFormTab(freeformCode, folderRSN, true);
                    $scope.selectValidFolderProcessFreeFormTab(freeformcode, folderrsn, processrsn, true);
                } else {
                    utilService.showError("Could not be deleted.", 'error');
                }
            });
        }
    }

    $scope.$on("$destroy", function () {
        onFolderFreeFromTabSelect();
        onFolderProcessFreeFromTabSelect();
        onFreeFromTabListLoaded();
        onFolerProcessFreeFormTab();
    });
});