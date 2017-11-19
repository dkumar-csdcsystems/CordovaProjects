app.controller('deficiencycontroller', function ($scope, $rootScope, $timeout, utilService, CommonService, dataLayerService, $q, $filter) {
    //var $scope = $scope;
    var selectedDef = [], addedDeficiency = [], toDelete = [];
    $scope.selectedDeficiency = [];
    $scope.FolderprocessDeficiencyDesc = [];
    $scope.IsHidden = false;
    $scope.IsVisibleold = true;
    $scope.deficiencysection = false;
    $scope.checkeDef = false;
    //AddDeficiency Button
    $scope.addDeficiency = function () {
        angular.element("#olddiv").hide();
        angular.element("#newdiv").show();
        $scope.IsHidden = false;
        $timeout(function () {
            var ovarlayHeight = angular.element(".overlay").height();
            var tabbarheight = angular.element("#inspectiontabs").height();
            var deficiencyheader = angular.element("#deficiencyheader").height();
            var deficiencyfooter = angular.element("#processinspection").height();
            var topheader = angular.element("#topheader").height();
            var highttoset = ovarlayHeight - (tabbarheight + deficiencyheader + deficiencyfooter + topheader + 77);
            angular.element(".scrollDeficiency").mCustomScrollbar({
                setHeight: highttoset,
                theme: "minimal-dark"
            });
        }, 0);



    }
    $scope.ResetAllSelected = function () {
        if ($scope.FolderprocessDeficiencyDesc && $scope.FolderprocessDeficiencyDesc.length > 0) {
            $.map($scope.FolderprocessDeficiencyDesc, function (categoryitem, index) {

                // Make checked for category items
                categoryitem.iscategorychecked = false;
                $.map(categoryitem.subcategorylist, function (subcategoryitem, idex) {
                    // Make checked for sub category items
                    subcategoryitem.issubcategorychecked = false;
                    $.map(subcategoryitem.items, function (defitem) {
                        // Make checked for defi items
                        defitem.isdeficiencyitemchecked = false;
                        $scope.deficiencySelection(defitem);
                    });

                });

            });
        }
    }

    //Back Button
    $scope.backFromDeficiency = function () {
        angular.element("#newdiv").hide();
        if (selectedDef.length !== 0) {
            selectedDef = [];
        }
        angular.element("#olddiv").show();
        if ($scope.selectedDeficiency.length == 0) {
            $scope.IsHidden = false;
        }
        else {
            $scope.IsHidden = true;
        }
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
        }, 0);
        $scope.ResetAllSelected();
    }

    //Function to store ValidDeficiency on checking the checkbox
    $scope.deficiencySelection = function (deficiency) {
        //var alreadyexistsmessage = '';
        //$.map($scope.selectedDeficiency, function (outeritem, index) {
        //    var alreadyexistsdef = $filter('filter')(outeritem.items, { deficiencycode: deficiency.deficiencycode }, true);
        //    if (alreadyexistsdef.length > 0) {
        //        alreadyexistsmessage += alreadyexistsdef[0].deficiencydesc;
        //        deficiency.isdeficiencyitemchecked = false;
        //    }
        //});
        //if (alreadyexistsmessage != '') {
        //    utilService.showError(alreadyexistsmessage + " already exists.", 'error');
        //    return;
        //}

        if (deficiency.isdeficiencyitemchecked == false) {
            selectedDef.pop(deficiency);
        }
        else {
            selectedDef.push(deficiency);
        }
    }

    //Function to store deficiencyList on checking the checkbox
    $scope.selectAddedDeficiency = function (checkedList, index) {
        if (checkedList.isaddeddefchecked == false) {
            addedDeficiency.pop(checkedList);
        }
        else {
            addedDeficiency.push(checkedList);
        }
    }

    //Function for Add to List button
    $scope.addToList = function () {
        var alreadyexistsmessage = '';
        var tobeadd = [];
        tobeadd = selectedDef, collapseId=0;


        var alreadyexistsmessage = '';
        $.map(tobeadd, function (newlyaddeditem, ind) {
            $.map($scope.selectedDeficiency, function (outeritem, index) {
                var alreadyexistsdef = $filter('filter')(outeritem.items, { deficiencycode: newlyaddeditem.deficiencycode }, true);
                if (alreadyexistsdef.length > 0) {
                    alreadyexistsmessage += alreadyexistsdef[0].deficiencydesc;
                    newlyaddeditem.isdeficiencyitemchecked = false;
                }
            });
        });


        tobeadd = $filter('filter')(selectedDef, { isdeficiencyitemchecked: true }, true);

        for (var i = 0; i < tobeadd.length; i++) {
            var groupbyfield = tobeadd[i].locationdesc + '-' + tobeadd[i].sublocationdesc;
            if (groupbyfield === "-") {
                groupbyfield = "Ungrouped Deficiency"
            }
            var grp = $.grep($scope.selectedDeficiency, function (n, idx) {
                if (n.groupname === groupbyfield) return n;
            });
            var item = {
                actioncode: tobeadd[i].actioncode,
                complybydate: tobeadd[i].complybydate,
                datecomplied: tobeadd[i].datecomplied,
                deficiencycode: tobeadd[i].deficiencycode,
                deficiencydesc: tobeadd[i].deficiencydesc,
                deficiencyid: tobeadd[i].deficiencyid,
                deficiencytext: tobeadd[i].deficiencytext,
                id: tobeadd[i].id,
                insertdate: tobeadd[i].insertdate,
                isedited: tobeadd[i].isedited,
                isnew: tobeadd[i].isnew,
                locationdesc: tobeadd[i].locationdesc,
                occurancecount: tobeadd[i].occurancecount,
                processid: tobeadd[i].processid,
                processrsn: tobeadd[i].processrsn,
                referencenum: tobeadd[i].referencenum,
                remedytext: tobeadd[i].remedytext,
                severitycode: tobeadd[i].severitycode,
                stampdate: tobeadd[i].stampdate,
                statuscode: tobeadd[i].statuscode,
                sublocationdesc: tobeadd[i].sublocationdesc,
                isaddeddefchecked: false
            }

            if (grp.length > 0) {
                var alreadyexistsdef = $filter('filter')(grp[0].items, { deficiencycode: tobeadd[i].deficiencycode }, true);
                if (alreadyexistsdef.length > 0) {
                    alreadyexistsmessage += alreadyexistsdef[0].deficiencydesc;
                    tobeadd[i].isdeficiencyitemchecked = false;
                } else {
                    grp[0].items.push(item);
                    grp[0].itemlength = grp[0].items.length;

                }

            } else {
                $scope.selectedDeficiency.push({ groupname: groupbyfield, items: [item], dataCollapse: "addeddeficiency" + collapseId, itemlength: 1 });
                collapseId++;
            }

        }
        if (alreadyexistsmessage != '') {
            utilService.showError(alreadyexistsmessage + " already exists.", 'error');
        }

        selectedDef = [];
        alreadyexistsmessage = '';
        angular.element('#newdiv').hide();
        $scope.IsHidden = true;
        angular.element('#olddiv').show();

        $.map($scope.selectedDeficiency, function (outeritem, index) {
            if (outeritem && outeritem.items) {
                $.map(outeritem.items, function (inneritem, ind) {
                    inneritem.isaddeddefchecked = false;
                });
            }
        });

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
        }, 500);
        $scope.ResetAllSelected();

    }

    //Event to call saveEditedDeficiency function
    $scope.$on('SaveEditedDeficiency', function (event, data) {
        $scope.SaveEditedDeficiency(data);

    });

    //Event to get data for deficiencyText on ngChange
    $scope.$on('changedDeficiencyText', function (event, data) {

        $timeout(function () {
            $scope.deficiencyText = data;

        }, 0, false);

    });

    $scope.severitycodelist = { severitycode: '' }
    $scope.$on('code', function (event, data) {
        $scope.severitycodelist.severitycode = data;

    });

    //Event to get data for remedyText on ngChange
    $scope.$on('changedRemedyText', function (event, data) {

        $timeout(function () {
            $scope.remedyText = data;

        }, 0, false);

    });

    $scope.editedDeficiency = '';

    $rootScope.$on('ViewChanged', function (x$scope, inboxitem) {

        //reset variables
        selectedDef = [], addedDeficiency = [], toDelete = [];
        var selectedDefCommentItems = [], selectedRemedyCommentItems = [];
        $scope.selectedDeficiency = [];
        $scope.FolderprocessDeficiencyDesc = [];
        $scope.IsVisible = false;
        $scope.IsVisibleold = true;

        // Get ValidDeficiency Data
        dataLayerService.getFolderProcessDeficiencyData(inboxitem).then(function (result) {
            if (result.data != null && result.data.length > 0) {
                var cateoryindex = 0;
                var subcateoryindex = 0;
                for (var i = 0; i < result.data.length; i++) {
                    var categorycode = result.data[i].categorycode;
                    var categorydesc = result.data[i].categorydesc;
                    var subcategorycode = result.data[i].subcategorycode;

                    var grp = $.grep($scope.FolderprocessDeficiencyDesc, function (n, idx) {
                        if (n.categorycode === categorycode) return n;
                    });

                    if (grp.length > 0) {
                        var checksubcategory = $filter('filter')(grp[0].subcategorylist, { subcategorycode: subcategorycode }, true);
                        if (checksubcategory.length > 0) {
                            checksubcategory[0].items.push({
                                deficiencycode: result.data[i].deficiencycode,
                                deficiencydesc: result.data[i].deficiencydesc,
                                deficiencytext: result.data[i].deficiencytext,
                                processrsn: result.data[i].processrsn,
                                processid: result.data[i].processid,
                                statuscode: result.data[i].statuscode,
                                severitycode: result.data[i].severitycode,
                                locationdesc: result.data[i].locationdesc,
                                sublocationdesc: result.data[i].sublocationdesc,
                                isdeficiencyitemchecked: false
                            })
                        } else {
                            grp[0].subcategorylist.push({
                                subcategorycode: result.data[i].subcategorycode,
                                subcategorydesc: result.data[i].subcategorydesc,
                                subcateoryindex: subcateoryindex++,
                                issubcategorychecked: false,
                                items: [{
                                    deficiencycode: result.data[i].deficiencycode,
                                    deficiencydesc: result.data[i].deficiencydesc,
                                    deficiencytext: result.data[i].deficiencytext,
                                    processrsn: result.data[i].processrsn,
                                    processid: result.data[i].processid,
                                    statuscode: result.data[i].statuscode,
                                    severitycode: result.data[i].severitycode,
                                    locationdesc: result.data[i].locationdesc,
                                    sublocationdesc: result.data[i].sublocationdesc,
                                    isdeficiencyitemchecked: false
                                }]
                            })
                        }
                    }
                    else {
                        $scope.FolderprocessDeficiencyDesc.push({
                            categorydesc: categorydesc,
                            categorycode: categorycode,
                            iscategorychecked: false,
                            cateoryindex: cateoryindex++,
                            subcategorylist: [{
                                subcategorycode: result.data[i].subcategorycode,
                                subcategorydesc: result.data[i].subcategorydesc,
                                issubcategorychecked: false,
                                items: [{
                                    deficiencycode: result.data[i].deficiencycode,
                                    deficiencydesc: result.data[i].deficiencydesc,
                                    deficiencytext: result.data[i].deficiencytext,
                                    processrsn: result.data[i].processrsn,
                                    processid: result.data[i].processid,
                                    statuscode: result.data[i].statuscode,
                                    severitycode: result.data[i].severitycode,
                                    locationdesc: result.data[i].locationdesc,
                                    sublocationdesc: result.data[i].sublocationdesc,
                                    isdeficiencyitemchecked: false
                                }]
                            }]
                        });
                    }
                }



            }
        });

        //Get Deficiencies from folderprocessdeficiency
        dataLayerService.getDeficiencyList(inboxitem).then(function (response) {
            var existingDeficiencies = [];
            if (response.data != null && response.data.length > 0) {
                var collapseId = 0;
                for (var k = 0; k < response.data.length; k++) {
                    var groupbyfield = response.data[k].locationdesc + '-' + response.data[k].sublocationdesc;
                    if (groupbyfield === "-") {
                        groupbyfield = "Ungrouped Deficiency"
                    }
                    var grp = $.grep(existingDeficiencies, function (n, idx) {
                        if (n.groupname === groupbyfield) return n;
                    });
                    var item = {
                        actioncode: response.data[k].actioncode,
                        complybydate: response.data[k].complybydate,
                        datecomplied: response.data[k].datecomplied,
                        deficiencycode: response.data[k].deficiencycode,
                        deficiencydesc: response.data[k].deficiencydesc,
                        deficiencyid: response.data[k].deficiencyid,
                        deficiencytext: response.data[k].deficiencytext,
                        id: response.data[k].id,
                        insertdate: response.data[k].insertdate,
                        isedited: response.data[k].isedited,
                        isnew: response.data[k].isnew,
                        locationdesc: response.data[k].locationdesc,
                        occurancecount: response.data[k].occurancecount,
                        processid: response.data[k].processid,
                        processrsn: response.data[k].processrsn,
                        referencenum: response.data[k].referencenum,
                        remedytext: response.data[k].remedytext,
                        severitycode: response.data[k].severitycode,
                        stampdate: response.data[k].stampdate,
                        statuscode: response.data[k].statuscode,
                        sublocationdesc: response.data[k].sublocationdesc,
                        isaddeddefchecked: false
                    }

                    if (grp.length > 0) {
                        grp[0].items.push(item);
                        grp[0].itemlength = grp[0].items.length;
                    } else {
                        existingDeficiencies.push({ groupname: groupbyfield, items: [item], dataCollapse: "addeddeficiency" + collapseId, itemlength: 1 });
                        collapseId++;
                    }
                    //existingDeficiencies.push({
                    //    actioncode: response.data[k].actioncode,
                    //    complybydate: response.data[k].complybydate,
                    //    datecomplied: response.data[k].datecomplied,
                    //    deficiencycode: response.data[k].deficiencycode,
                    //    deficiencydesc: response.data[k].deficiencydesc,
                    //    deficiencyid: response.data[k].deficiencyid,
                    //    deficiencytext: response.data[k].deficiencytext,
                    //    id: response.data[k].id,
                    //    insertdate: response.data[k].insertdate,
                    //    isedited: response.data[k].isedited,
                    //    isnew: response.data[k].isnew,
                    //    locationdesc: response.data[k].locationdesc,
                    //    occurancecount: response.data[k].occurancecount,
                    //    processid: response.data[k].processid,
                    //    processrsn: response.data[k].processrsn,
                    //    referencenum: response.data[k].referencenum,
                    //    remedytext: response.data[k].remedytext,
                    //    severitycode: response.data[k].severitycode,
                    //    stampdate: response.data[k].stampdate,
                    //    statuscode: response.data[k].statuscode,
                    //    sublocationdesc: response.data[k].sublocationdesc,
                    //    isaddeddefchecked:false
                    //});
                }
                $scope.selectedDeficiency = existingDeficiencies;



                angular.element('#olddiv').show();
                if ($scope.selectedDeficiency.length > 0) {
                    $scope.IsHidden = true;
                }
                angular.element('#newdiv').hide();

            }


        });

        //Deleting the checked deficiency
        $scope.deleteCheckedDeficiency = function () {
            if (addedDeficiency.length === 0)
            {
                utilService.showError("Please select deficiency to delete.", "info");
                return;
            }
            $timeout(function () {
                return Promise.all(addedDeficiency.map(function (deficiencyObj) {
                    if (deficiencyObj) {
                        return dataLayerService.deleteDeficiencyFromDatabase(deficiencyObj, inboxitem);
                    }
                    else {
                        return;
                    }
                    utilService.logtoConsole(deficiencyObj);


                })).then(function (allResult) {
                    addedDeficiency = [];
                    selectedDef = [];

                    dataLayerService.getDeficiencyList(inboxitem).then(function (response) {
                        var existingDeficiencies = [];
                        var collapseId = 0;
                        for (var k = 0; k < response.data.length; k++) {

                            var groupbyfield = response.data[k].locationdesc + '-' + response.data[k].sublocationdesc;
                            if (groupbyfield === "-") {
                                groupbyfield = "Ungrouped Deficiency"
                            }
                            var grp = $.grep(existingDeficiencies, function (n, idx) {
                                if (n.groupname === groupbyfield) return n;
                            });
                            var item = {
                                actioncode: response.data[k].actioncode,
                                complybydate: response.data[k].complybydate,
                                datecomplied: response.data[k].datecomplied,
                                deficiencycode: response.data[k].deficiencycode,
                                deficiencydesc: response.data[k].deficiencydesc,
                                deficiencyid: response.data[k].deficiencyid,
                                deficiencytext: response.data[k].deficiencytext,
                                id: response.data[k].id,
                                insertdate: response.data[k].insertdate,
                                isedited: response.data[k].isedited,
                                isnew: response.data[k].isnew,
                                locationdesc: response.data[k].locationdesc,
                                occurancecount: response.data[k].occurancecount,
                                processid: response.data[k].processid,
                                processrsn: response.data[k].processrsn,
                                referencenum: response.data[k].referencenum,
                                remedytext: response.data[k].remedytext,
                                severitycode: response.data[k].severitycode,
                                stampdate: response.data[k].stampdate,
                                statuscode: response.data[k].statuscode,
                                sublocationdesc: response.data[k].sublocationdesc,
                                isaddeddefchecked: false
                            }

                            if (grp.length > 0) {
                                grp[0].items.push(item);
                                grp[0].itemlength = grp[0].items.length;
                            } else {
                                existingDeficiencies.push({ groupname: groupbyfield, items: [item], dataCollapse: "addeddeficiency" + collapseId, itemlength: 1 });
                                collapseId++;
                            }

                        }
                        $scope.selectedDeficiency = existingDeficiencies;
                        //$scope.addDeficiency();
                        if (existingDeficiencies.length === 0) {
                            $scope.addDeficiency();
                            $scope.IsHidden = false;
                        }
                    });
                });

            }, 0, false);
        };

        //Save Deficiency to DataBase
        $scope.saveDeficiency = function () {
            var recordLength = addedDeficiency.length, callbackCount = 0;
            if (addedDeficiency.length === 0) {
                utilService.showError("Please select deficiency to save", "info");
                return;
            }
            return Promise.all(addedDeficiency.map(function (item) {
                var dataToInsert = [
                            item.processrsn == null ? "" : item.processrsn,
                            item.deficiencycode == null ? "" : item.deficiencycode,
                            item.deficiencytext == null ? "" : item.deficiencytext,
                            null,
                            null,
                            null,
                           item.locationdesc == null ? "" : item.locationdesc,
                           item.sublocationdesc == null ? "" : item.sublocationdesc,
                            null,                                                                                        //statuscode
                            null,                                                                                        //severitycode
                            null,                                                                                        //actioncode
                            item.referencenum == null ? "" : item.referencenum,
                            item.occurancecount == null ? 0 : item.occurancecount,
                            item.remedytext == null ? "" : item.remedytext,
                            null,
                            null, //addedDeficiency[i].id == null ? "" : addedDeficiency[i].id,
                            "Y",
                            "N",
                            item.processid == null ? "" : item.processid, ];

                return dataLayerService.saveDeficiencyToDatabase(dataToInsert, inboxitem);

            })).then(function (allResult) {

                dataLayerService.getDeficiencyList(inboxitem).then(function (response) {
                    var existingDeficiencies = [];
                    var collapseId = 0;
                    for (var k = 0; k < response.data.length; k++) {

                        var groupbyfield = response.data[k].locationdesc + '-' + response.data[k].sublocationdesc;
                        if (groupbyfield === "-") {
                            groupbyfield = "Ungrouped Deficiency"
                        }
                        var grp = $.grep(existingDeficiencies, function (n, idx) {
                            if (n.groupname === groupbyfield) return n;
                        });
                        var item = {
                            actioncode: response.data[k].actioncode,
                            complybydate: response.data[k].complybydate,
                            datecomplied: response.data[k].datecomplied,
                            deficiencycode: response.data[k].deficiencycode,
                            deficiencydesc: response.data[k].deficiencydesc,
                            deficiencyid: response.data[k].deficiencyid,
                            deficiencytext: response.data[k].deficiencytext,
                            id: response.data[k].id,
                            insertdate: response.data[k].insertdate,
                            isedited: response.data[k].isedited,
                            isnew: response.data[k].isnew,
                            locationdesc: response.data[k].locationdesc,
                            occurancecount: response.data[k].occurancecount,
                            processid: response.data[k].processid,
                            processrsn: response.data[k].processrsn,
                            referencenum: response.data[k].referencenum,
                            remedytext: response.data[k].remedytext,
                            severitycode: response.data[k].severitycode,
                            stampdate: response.data[k].stampdate,
                            statuscode: response.data[k].statuscode,
                            sublocationdesc: response.data[k].sublocationdesc,
                            isaddeddefchecked: false
                        }

                        if (grp.length > 0) {
                            grp[0].items.push(item);
                            grp[0].itemlength = grp[0].items.length;
                        } else {
                            existingDeficiencies.push({ groupname: groupbyfield, items: [item], dataCollapse: "addeddeficiency" + collapseId, itemlength: 1 });
                            collapseId++;
                        }

                    }
                    $scope.selectedDeficiency = existingDeficiencies;

                });
                addedDeficiency = [];
                utilService.showError("Deficiency added successfully.", "success");
            });

        }

        //Open edit deficiency form
        $scope.editDeficiencyForm = function (deficiency) {
            $scope.editedDeficiency = deficiency;
            var promises = {
                Remedy: dataLayerService.getValidDeficiencyRemedy(),
                Severity: dataLayerService.getValidProcessSeverity(),
                Location: dataLayerService.getValidProcessLocation(inboxitem),
                Status: dataLayerService.getValidDeficiencyStatus(),
                Action: dataLayerService.getValidDeficiencyAction(),
            }

            $q.all(promises).then(function (result) {
                deficiency.remedyList = [];
                deficiency.severityList = [];
                deficiency.locationList = [];
                deficiency.statusList = [];
                deficiency.actionList = [];
                if (result) {
                    if (result.Remedy && result.Remedy.data != null && result.Remedy.data.length > 0) {
                        for (var i = 0; i < result.Remedy.data.length; i++) {
                            deficiency.remedyList.push(
                                result.Remedy.data[i].remedytext
                                );
                        }
                    }
                    if (result.Severity && result.Severity.data != null && result.Severity.data.length > 0) {
                        for (var i = 0; i < result.Severity.data.length; i++) {
                            deficiency.severityList.push({
                                code: result.Severity.data[i].severitycode,
                                description: result.Severity.data[i].severitydesc
                            });
                        }
                    }
                    if (result.Location && result.Location.data != null && result.Location.data.length > 0) {
                        for (var i = 0; i < result.Location.data.length; i++) {
                            deficiency.locationList.push({
                                description: result.Location.data[i].locationdesc
                            });

                        }
                    }
                    if (result.Status && result.Status.data != null && result.Status.data.length > 0) {
                        for (var i = 0; i < result.Status.data.length; i++) {
                            deficiency.statusList.push({
                                code: result.Status.data[i].statuscode,
                                description: result.Status.data[i].statusdesc
                            });

                        }
                    }
                    if (result.Action.data != null && result.Action.data.length > 0) {
                        for (var i = 0; i < result.Action.data.length; i++) {
                            deficiency.actionList.push({
                                code: result.Action.data[i].actioncode,
                                description: result.Action.data[i].actiondesc
                            });
                        }
                    }

                    $scope.$emit('DeficiencyValues', deficiency);

                }
            }).catch(function (error) {
                console.log(error);
            })

        }
        //saving deficiency from edit deficiency form(updating the saved deficiency)
        $scope.SaveEditedDeficiency = function (deficiencyData) {
            var deficiency = $scope.editedDeficiency;
            var compliedDate = "";
            var complyBy = "";
            var insertedDate = "";
            if (deficiencyData != undefined) {
                var compliedDate = (deficiencyData.complied == undefined || deficiencyData.complied == "" || deficiencyData.complied == null) ? "" : moment(deficiencyData.complied).format('YYYY-MM-DD hh:mm:ss');
                var complyBy = (deficiencyData.complyby == undefined || deficiencyData.complyby == "" || deficiencyData.complyby == null) ? "" : moment(deficiencyData.complyby).format('YYYY-MM-DD hh:mm:ss');
                var insertedDate = (deficiencyData.inserted == undefined || deficiencyData.inserted == "" || deficiencyData.inserted == null) ? "" : moment(deficiencyData.inserted).format('YYYY-MM-DD hh:mm:ss');
            }
            var def = '';
            def = {
                deficiencycode: deficiency.deficiencycode !== '' ? deficiency.deficiencycode : '',
                deficiencytext: (deficiencyData.deficiencyText !== '' && deficiencyData.deficiencyText !== null && deficiencyData.deficiencyText !== undefined) ? deficiencyData.deficiencyText : '',
                remedytext: (deficiencyData.remedyText !== '' && deficiencyData.remedyText !== null && deficiencyData.remedyText !== undefined) ? deficiencyData.remedyText : '',
                severitycode: (deficiencyData === undefined || deficiencyData.severitycode === undefined) ? "" : deficiencyData.severitycode,
                statuscode: (deficiencyData === undefined || deficiencyData.statuscode === undefined) ? "" : deficiencyData.statuscode,
                locationdesc: (deficiencyData === undefined || deficiencyData.locationdesc === undefined) ? "" : deficiencyData.locationdesc,
                sublocationdesc: (deficiencyData === undefined || deficiencyData.sublocationdesc === undefined) ? "" : deficiencyData.sublocationdesc,
                actioncode: (deficiencyData === undefined || deficiencyData.actioncode === undefined) ? "" : deficiencyData.actioncode,
                datecomplied: compliedDate !== '' ? compliedDate : '',
                complybydate: complyBy !== '' ? complyBy : '',
                insertdate: insertedDate !== '' ? insertedDate : '',
                referencenum: (deficiencyData == undefined || deficiencyData.refnumber == undefined) ? "" : deficiencyData.refnumber,
                occurancecount: (deficiencyData == undefined || deficiencyData.occurancecount == undefined) ? "0" : deficiencyData.occurancecount,
                stampdate: moment(new Date()).format('YYYY-MM-DD hh:mm:ss'),
                deficiencyid: (deficiency.deficiencyid !== '' && deficiency.deficiencyid !== null && deficiency.deficiencyid !== undefined)  ? deficiency.deficiencyid : '',
                processid: deficiency.processid !== '' ? deficiency.processid : '',
                isnew: "",
                isedited: "",
                id: deficiencyData.id

            };
            dataLayerService.updateDeficiency(def, inboxitem).then(function (result) {
                if (result && result.data != null) {
                    utilService.showError("Deficiency updated successfully.", "success");
                    angular.element("#myeditDeficiencyModal").removeClass("fade").modal("hide");
                    dataLayerService.getDeficiencyList(inboxitem).then(function (response) {
                        var existingDeficiencies = [];
                        if (response.data != null && response.data.length > 0) {
                            var collapseId = 0;
                            for (var k = 0; k < response.data.length; k++) {
                                var groupbyfield = response.data[k].locationdesc + '-' + response.data[k].sublocationdesc;
                                if (groupbyfield === "-") {
                                    groupbyfield = "Ungrouped Deficiency"
                                }
                                var grp = $.grep(existingDeficiencies, function (n, idx) {
                                    if (n.groupname === groupbyfield) return n;
                                });
                                var item = {
                                    actioncode: response.data[k].actioncode,
                                    complybydate: response.data[k].complybydate,
                                    datecomplied: response.data[k].datecomplied,
                                    deficiencycode: response.data[k].deficiencycode,
                                    deficiencydesc: response.data[k].deficiencydesc,
                                    deficiencyid: response.data[k].deficiencyid,
                                    deficiencytext: response.data[k].deficiencytext,
                                    id: response.data[k].id,
                                    insertdate: response.data[k].insertdate,
                                    isedited: response.data[k].isedited,
                                    isnew: response.data[k].isnew,
                                    locationdesc: response.data[k].locationdesc,
                                    occurancecount: response.data[k].occurancecount,
                                    processid: response.data[k].processid,
                                    processrsn: response.data[k].processrsn,
                                    referencenum: response.data[k].referencenum,
                                    remedytext: response.data[k].remedytext,
                                    severitycode: response.data[k].severitycode,
                                    stampdate: response.data[k].stampdate,
                                    statuscode: response.data[k].statuscode,
                                    sublocationdesc: response.data[k].sublocationdesc,
                                    isaddeddefchecked: false
                                }

                                if (grp.length > 0) {
                                    grp[0].items.push(item);
                                    grp[0].itemlength = grp[0].items.length;
                                } else {
                                    existingDeficiencies.push({ groupname: groupbyfield, items: [item], dataCollapse: "addeddeficiency" + collapseId, itemlength: 1 });
                                    collapseId++;
                                }
                            }
                            $scope.selectedDeficiency = existingDeficiencies;
                            angular.element('#olddiv').show();
                            if ($scope.selectedDeficiency.length > 0) {
                                $scope.IsHidden = true;
                            }
                            angular.element('#newdiv').hide();
                        }
                    });
                } else {
                    utilService.showError("Deficiency could not be updated.", "error");
                }
                utilService.logtoConsole(result.data + 'rows affected');
            });

        }

    });

    $scope.checkAllCategoryItems = function (categorycode) {

        var tobechecked = $filter('filter')($scope.FolderprocessDeficiencyDesc, { categorycode: categorycode, iscategorychecked: true }, true);
        if (tobechecked.length > 0) {
            $.map(tobechecked, function (categoryitem, index) {
                if (categorycode === categoryitem.categorycode) {
                    // Make checked for category items
                    categoryitem.iscategorychecked = true;
                    $.map(categoryitem.subcategorylist, function (subcategoryitem, idex) {
                        // Make checked for sub category items
                        subcategoryitem.issubcategorychecked = true;
                        $.map(subcategoryitem.items, function (defitem) {
                            // Make checked for defi items
                            defitem.isdeficiencyitemchecked = true;
                            $scope.deficiencySelection(defitem);
                        });

                    });
                }
            });
        } else {
            var tobechecked = $filter('filter')($scope.FolderprocessDeficiencyDesc, { categorycode: categorycode, iscategorychecked: false }, true);
            if (tobechecked.length > 0) {
                $.map(tobechecked, function (categoryitem, index) {
                    if (categorycode === categoryitem.categorycode) {
                        // Make checked for category items
                        categoryitem.iscategorychecked = false;
                        $.map(categoryitem.subcategorylist, function (subcategoryitem, idex) {
                            // Make checked for sub category items
                            subcategoryitem.issubcategorychecked = false;
                            $.map(subcategoryitem.items, function (defitem) {
                                // Make checked for defi items
                                defitem.isdeficiencyitemchecked = false;
                                $scope.deficiencySelection(defitem);
                            });

                        });
                    }
                });
            }

        }

    }

    $scope.checkAllSubCategoryItems = function (categorycode, subcategorycode) {

        var tobechecked = $filter('filter')($scope.FolderprocessDeficiencyDesc, { categorycode: categorycode }, true);
        if (tobechecked.length > 0) {
            var tobecheckedsub = $filter('filter')(tobechecked[0].subcategorylist, { subcategorycode: subcategorycode, issubcategorychecked: true }, true);
            if (tobecheckedsub.length > 0) {
                $.map(tobecheckedsub, function (subcategoryitem, idex) {
                    if (subcategorycode === subcategoryitem.subcategorycode) {
                        // Make checked for sub category items
                        subcategoryitem.issubcategorychecked = true;
                        $.map(subcategoryitem.items, function (defitem) {
                            // Make checked for defi items
                            defitem.isdeficiencyitemchecked = true;
                            $scope.deficiencySelection(defitem);
                        });
                    }

                });
            } else {
                var tobecheckedsub = $filter('filter')(tobechecked[0].subcategorylist, { subcategorycode: subcategorycode, issubcategorychecked: false }, true);
                //$.map(tobechecked, function (categoryitem, index) {
                $.map(tobecheckedsub, function (subcategoryitem, idex) {
                    if (subcategorycode === subcategoryitem.subcategorycode) {
                        // Make checked for sub category items
                        subcategoryitem.issubcategorychecked = false;
                        $.map(subcategoryitem.items, function (defitem) {
                            // Make checked for defi items
                            defitem.isdeficiencyitemchecked = false;
                            $scope.deficiencySelection(defitem);
                        });
                    }

                });
            }
        }

    }

    $scope.$on('DeficiencyData', function (events, data) {
        $scope.deficiencyVariables.variables.refnumber = data.referencenum;
        $scope.deficiencyVariables.variables.occurancecount = data.occurancecount;
        $scope.deficiencyVariables.variables.complied = data.datecomplied;
        $scope.deficiencyVariables.variables.complyby = data.complybydate;
        $scope.deficiencyVariables.variables.inserted = data.insertdate;
    });

});