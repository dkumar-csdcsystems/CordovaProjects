app.controller('PropertyCtrl', function ($scope, $filter, dataLayerService, syncHelperService, utilService, $cordovaNetwork, requestHelperService, CommonService) {
    /*Add Property Start here*/
    $scope.showPropertySearchResult = false;
    $scope.enabledisableAcceptProperty = false;
    $scope.onHidePropertyResult = function () {
        $scope.ClosePropertyPanel();
    }
    $scope.propertyFilterVariables = {
        propertyNo: '', propertyStreetPrefix: '', propertyStreet: '', propertyStreetType: '',
        propertyDirection: '', propertyUnitType: '', propertyUnitNo: '', propertyStatus: '', propertyCity: '', propertyCounty: '',
        propertyRoll: '', propertyState: '', propertyPostal: '', proprtyType: '', propertyName: '', propertyRSN: '', propertyPlan: '',
        propertyLOT: '', propertyX: '', propertyY: '', propertySec: '', propertyTwn: '', propertyRge: '', propertyRoute: '',
        propertyCrossStreet: '', propertyParentRSN: '', propertyLegalDesc: '', propertyFamilyRSN: '', propertyZoning1: '', propertyCreatedOnComment: '',
        propertyZoning2: '', propertyZoning3: '', propertyZoning4: '', propertyZoning5: '', propertyFrontage: '', propertyArea: '', propertyDepth: '',
        startIndex: 0, endIndex: null, searchText: ''
    };
    $scope.onRetrieveProperty = function () {
        $scope.propertySearchList = [];
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to search property.</br> Please connect to network and try again", 'error');
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
                            syncHelperService.SearchPropertyFullText(function (result) {
                                var data = result.data;
                                if (data != null) {
                                    if (!angular.isArray(data)) {
                                        data = [result.data];
                                    }
                                    if (data.length > 0) {
                                        for (var i = 0; i < data.length; i++) {
                                            $scope.propertySearchList.push({
                                                name: data[i].propertyname,
                                                address: String.format("{0}{1} {2} {3} {4} {5} {6} {7}", data[i].prophouse, data[i].propstreet, data[i].propstreetdirection, data[i].propunittype, data[i].propunit,
                                                      data[i].propcity, data[i].propprovince, data[i].proppostal),
                                                propertyrsn: data[i].propertyrsn,
                                                propertyNo: data[i].prophouse,
                                                propertyStreetPrefix: data[i].propstreetprefix,
                                                propertyStreet: data[i].propstreet,
                                                propertyStreetType: data[i].propstreettype,
                                                propertyDirection: data[i].propstreetdirection,
                                                propertyUnitType: data[i].propunittype,
                                                propertyUnitNo: data[i].propunit,
                                                propertyStatus: data[i].statuscode,
                                                propertyCity: data[i].propcity,
                                                propertyCounty: data[i].countydesc,
                                                propertyRoll: data[i].propertyroll,
                                                propertyState: data[i].propprovince,
                                                propertyPostal: data[i].proppostal,
                                                proprtyType: data[i].propcode,
                                                propertyName: data[i].propertyname,
                                                propertyRSN: data[i].propertyrsn,
                                                propertyPlan: data[i].propplan,
                                                propertyLOT: data[i].proplot,
                                                propertyX: data[i].propx,
                                                propertyY: data[i].propy,
                                                propertySec: data[i].propsection,
                                                propertyTwn: data[i].proptownship,
                                                propertyRge: data[i].proprange,
                                                propertyRoute: data[i].routecode,
                                                propertyCrossStreet: data[i].propcrossstreet,
                                                propertyParentRSN: data[i].parentpropertyrsn,
                                                propertyLegalDesc: data[i].legaldesc,
                                                propertyFamilyRSN: data[i].familyrsn,
                                                propertyZoning1: data[i].zonetype1,
                                                propertyCreatedOnComment: data[i].propcomment,
                                                propertyZoning2: data[i].zonetype2,
                                                propertyZoning3: data[i].zonetype3,
                                                propertyZoning4: data[i].zonetype4,
                                                propertyZoning5: data[i].zonetype5,
                                                propertyFrontage: data[i].propfrontage,
                                                propertyArea: data[i].proparea,
                                                propertyDepth: data[i].propdepth,
                                                propertyDateObsoleted: data[i].dateobsoleted,
                                                propertyDateCreated: data[i].datecreated,
                                                propertyGISID1: data[i].propgisid1,
                                            });
                                        }
                                        $scope.showPropertySearchResult = true;
                                        angular.element('#propertycontent').removeClass('col-sm-12').addClass('col-sm-9');
                                        var peoplecontentHeight = angular.element("#propertycontent").height();
                                        var heighttoset = peoplecontentHeight;
                                        angular.element(".scroll-prop").mCustomScrollbar({
                                            setHeight: heighttoset,
                                            theme: "3d-dark"
                                        });
                                    } else {
                                        $scope.showPropertySearchResult = false;
                                        angular.element('#propertycontent').removeClass('col-sm-9').addClass('col-sm-12');
                                        var peoplecontentHeight = angular.element("#propertycontent").height();
                                        var heighttoset = peoplecontentHeight;
                                        angular.element(".scroll-prop").mCustomScrollbar({
                                            setHeight: heighttoset,
                                            theme: "3d-dark"
                                        });
                                        utilService.showError("No property record found with search text " + $scope.propertyFilterVariables.searchText, "info");
                                    }

                                }
                                // Call logoff request
                                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                    utilService.logtoConsole("logoff response: " + result.response);
                                }, "json");

                            }, this, $scope.propertyFilterVariables.searchText, $scope.propertyFilterVariables.startIndex, $scope.propertyFilterVariables.endIndex);
                        }
                    }
                }
            }, "json");
            } else {
            utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
            }


       

    }
    $scope.onClearProperty = function () {

        $scope.propertyFilterVariables.propertyNo = ''; $scope.propertyFilterVariables.propertyStreetPrefix = ''; $scope.propertyFilterVariables.propertyStreet = '';
        $scope.propertyFilterVariables.propertyStreetType = ''; $scope.propertyFilterVariables.propertyDirection = ''; $scope.propertyFilterVariables.propertyUnitType = '';
        $scope.propertyFilterVariables.propertyUnitNo = ''; $scope.propertyFilterVariables.propertyStatus = ''; $scope.propertyFilterVariables.propertyCity = '';
        $scope.propertyFilterVariables.propertyCounty = ''; $scope.propertyFilterVariables.propertyRoll = ''; $scope.propertyFilterVariables.propertyState = '';
        $scope.propertyFilterVariables.propertyPostal = ''; $scope.propertyFilterVariables.proprtyType = ''; $scope.propertyFilterVariables.propertyName = '';
        $scope.propertyFilterVariables.propertyRSN = ''; $scope.propertyFilterVariables.propertyPlan = ''; $scope.propertyFilterVariables.propertyLOT = ''; $scope.propertyFilterVariables.propertyX = '';
        $scope.propertyFilterVariables.propertyY = ''; $scope.propertyFilterVariables.propertySec = ''; $scope.propertyFilterVariables.propertyTwn = ''; $scope.propertyFilterVariables.propertyRge = '';
        $scope.propertyFilterVariables.propertyRoute = ''; $scope.propertyFilterVariables.propertyCrossStreet = ''; $scope.propertyFilterVariables.propertyParentRSN = '';
        $scope.propertyFilterVariables.propertyLegalDesc = ''; $scope.propertyFilterVariables.propertyFamilyRSN = ''; $scope.propertyFilterVariables.propertyZoning1 = '';
        $scope.propertyFilterVariables.propertyCreatedOnComment = ''; $scope.propertyFilterVariables.propertyZoning2 = ''; $scope.propertyFilterVariables.propertyZoning3 = '';
        $scope.propertyFilterVariables.propertyZoning4 = ''; $scope.propertyFilterVariables.propertyZoning5 = ''; $scope.propertyFilterVariables.propertyFrontage = '';
        $scope.propertyFilterVariables.propertyArea = ''; $scope.propertyFilterVariables.propertyDepth = '';
        if ($scope.propertySearchList && $scope.propertySearchList.length == 0) {
            angular.element('#propertycontent').removeClass('col-sm-9').addClass('col-sm-12');
            $scope.showPropertySearchResult = false;
            $scope.enabledisableAcceptProperty = false;
            $scope.propertyFilterVariables.searchPropertyText = ''
        }
        $scope.collapsepeProperty = !$scope.collapsepeProperty
    }
    $scope.PropertyAddedList = [];
    $scope.onAcceptProperty = function () {

        if ($scope.propertyFilterVariables.propertyRSN === "")
        {
            $scope.onClearProperty();
            $scope.ClosePropertyPanel();
            utilService.showError("Please select a property to add.", "error");
            return;
        }
        $scope.showPropertyGrid = true;

        $scope.PropertyAddedList.push({
            Id: $scope.PropertyAddedList.length + 1,
            propertyrsn: $scope.propertyFilterVariables.propertyRSN,
            address: String.format("{0}{1} {2} {3} {4} {5} {6} {7}", $scope.propertyFilterVariables.propertyNo, $scope.propertyFilterVariables.propertyStreet, $scope.propertyFilterVariables.propertyDirection, $scope.propertyFilterVariables.propertyUnitType,
                 $scope.propertyFilterVariables.propertyUnitNo, $scope.propertyFilterVariables.propertyCity, $scope.propertyFilterVariables.propertyState, $scope.propertyFilterVariables.propertyPostal),
            planlot: String.format("{0}/{1}", $scope.propertyFilterVariables.propertyPlan, $scope.propertyFilterVariables.propertyLOT),
            comment: $scope.propertyFilterVariables.propertyCreatedOnComment,
            propertytype: $.grep($scope.proprtyTypeList, function (e) { return e.value == $scope.propertyFilterVariables.proprtyType; }).length > 0 ? $.grep($scope.proprtyTypeList, function (e) { return e.value == $scope.propertyFilterVariables.proprtyType; })[0].name : '',
            status: $.grep($scope.propertyStatusList, function (e) { return e.value == $scope.propertyFilterVariables.propertyStatus; }).length > 0 ? $.grep($scope.propertyStatusList, function (e) { return e.value == $scope.propertyFilterVariables.propertyStatus; })[0].name : '',
            propertytypecode: $.grep($scope.proprtyTypeList, function (e) { return e.value == $scope.propertyFilterVariables.proprtyType; }).length > 0 ? $.grep($scope.proprtyTypeList, function (e) { return e.value == $scope.propertyFilterVariables.proprtyType; })[0].value : null,
            statuscode: $.grep($scope.propertyStatusList, function (e) { return e.value == $scope.propertyFilterVariables.propertyStatus; }).length > 0 ? $.grep($scope.propertyStatusList, function (e) { return e.value == $scope.propertyFilterVariables.propertyStatus; })[0].value : null,
            propertyNo: $scope.propertyFilterVariables.propertyNo === undefined ? "" : $scope.propertyFilterVariables.propertyNo,
            propertyStreetPrefix: $scope.propertyFilterVariables.propertyStreetPrefix === undefined ? "" : $scope.propertyFilterVariables.propertyStreetPrefix,
            propertyStreet: $scope.propertyFilterVariables.propertyStreet === undefined ? "" : $scope.propertyFilterVariables.propertyStreet,
            propertyStreetType: $scope.propertyFilterVariables.propertyStreetType === undefined ? "" : $scope.propertyFilterVariables.propertyStreetType,
            propertyDirection: $scope.propertyFilterVariables.propertyDirection === undefined ? "" : $scope.propertyFilterVariables.propertyDirection,
            propertyUnitType: $scope.propertyFilterVariables.propertyUnitType === undefined ? "" : $scope.propertyFilterVariables.propertyUnitType,
            propertyUnitNo: $scope.propertyFilterVariables.propertyUnitNo === undefined ? "" : $scope.propertyFilterVariables.propertyUnitNo,
            propertyStatus: $scope.propertyFilterVariables.propertyStatus === undefined ? "" : $scope.propertyFilterVariables.propertyStatus,
            propertyCity: $scope.propertyFilterVariables.propertyCity === undefined ? "" : $scope.propertyFilterVariables.propertyCity,
            propertyCounty: $scope.propertyFilterVariables.propertyCounty === undefined ? "" : $scope.propertyFilterVariables.propertyCounty,
            propertyRoll: $scope.propertyFilterVariables.propertyRoll === undefined ? "" : $scope.propertyFilterVariables.propertyRoll,
            propertyState: $scope.propertyFilterVariables.propertyState === undefined ? "" : $scope.propertyFilterVariables.propertyState,
            propertyPostal: $scope.propertyFilterVariables.propertyPostal === undefined ? "" : $scope.propertyFilterVariables.propertyPostal,
            proprtyType: $scope.propertyFilterVariables.proprtyType === undefined ? "" : $scope.propertyFilterVariables.proprtyType,
            propertyName: $scope.propertyFilterVariables.propertyName === undefined ? "" : $scope.propertyFilterVariables.propertyName,
            propertyRSN: $scope.propertyFilterVariables.propertyRSN === undefined ? "" : $scope.propertyFilterVariables.propertyRSN,
            propertyPlan: $scope.propertyFilterVariables.propertyPlan === undefined ? "" : $scope.propertyFilterVariables.propertyPlan,
            propertyLOT: $scope.propertyFilterVariables.propertyLOT === undefined ? "" : $scope.propertyFilterVariables.propertyLOT,
            propertyX: $scope.propertyFilterVariables.propertyX === undefined ? "" : $scope.propertyFilterVariables.propertyX,
            propertyY: $scope.propertyFilterVariables.propertyY === undefined ? "" : $scope.propertyFilterVariables.propertyY,
            propertySec: $scope.propertyFilterVariables.propertySec === undefined ? "" : $scope.propertyFilterVariables.propertySec,
            propertyTwn: $scope.propertyFilterVariables.propertyTwn === undefined ? "" : $scope.propertyFilterVariables.propertyTwn,
            propertyRge: $scope.propertyFilterVariables.propertyRge === undefined ? "" : $scope.propertyFilterVariables.propertyRge,
            propertyRoute: $scope.propertyFilterVariables.propertyRoute === undefined ? "" : $scope.propertyFilterVariables.propertyRoute,
            propertyCrossStreet: $scope.propertyFilterVariables.propertyCrossStreet === undefined ? "" : $scope.propertyFilterVariables.propertyCrossStreet,
            propertyParentRSN: $scope.propertyFilterVariables.propertyParentRSN === undefined ? "" : $scope.propertyFilterVariables.propertyParentRSN,
            propertyLegalDesc: $scope.propertyFilterVariables.propertyLegalDesc === undefined ? "" : $scope.propertyFilterVariables.propertyLegalDesc,
            propertyFamilyRSN: $scope.propertyFilterVariables.propertyFamilyRSN === undefined ? "" : $scope.propertyFilterVariables.propertyFamilyRSN,
            propertyZoning1: $scope.propertyFilterVariables.propertyZoning1 === undefined ? "" : $scope.propertyFilterVariables.propertyZoning1,
            propertyCreatedOnComment: $scope.propertyFilterVariables.propertyCreatedOnComment === undefined ? "" : $scope.propertyFilterVariables.propertyCreatedOnComment,
            propertyZoning2: $scope.propertyFilterVariables.propertyZoning2 === undefined ? "" : $scope.propertyFilterVariables.propertyZoning2,
            propertyZoning3: $scope.propertyFilterVariables.propertyZoning3 === undefined ? "" : $scope.propertyFilterVariables.propertyZoning3,
            propertyZoning4: $scope.propertyFilterVariables.propertyZoning4 === undefined ? "" : $scope.propertyFilterVariables.propertyZoning4,
            propertyZoning5: $scope.propertyFilterVariables.propertyZoning5 === undefined ? "" : $scope.propertyFilterVariables.propertyZoning5,
            propertyFrontage: $scope.propertyFilterVariables.propertyFrontage === undefined ? "" : $scope.propertyFilterVariables.propertyFrontage,
            propertyArea: $scope.propertyFilterVariables.propertyArea === undefined ? "" : $scope.propertyFilterVariables.propertyArea,
            propertyDepth: $scope.propertyFilterVariables.propertyDepth === undefined ? "" : $scope.propertyFilterVariables.propertyDepth,
            propertyGISID1: $scope.propertyFilterVariables.propertyGISID1 === undefined ? "" : $scope.propertyFilterVariables.propertyGISID1,
            propertyDateCreated: $scope.propertyFilterVariables.propertyDateCreated === undefined ? "" : $scope.propertyFilterVariables.propertyDateCreated,
            propertyDateObsoleted: $scope.propertyFilterVariables.propertyDateObsoleted === undefined ? "" : $scope.propertyFilterVariables.propertyDateObsoleted

        });
        if ($scope.PropertyAddedList.length > 0) {
            $scope.propertyRequired = false;
            $scope.hiddenPropReq = $scope.propertyRequired
        }
        else {
            $scope.propertyRequired = true;
            $scope.hiddenPropReq = '';
        }
        $scope.enabledisableAcceptProperty = false;
        $scope.onClearProperty();
        $scope.ClosePropertyPanel();
    }
    $scope.onRemoveAddedProperty = function (id) {
        $scope.PropertyAddedList = $.grep($scope.PropertyAddedList, function (e) { return e.Id != id; });
        if ($scope.PropertyAddedList.length > 0) {
            $scope.propertyRequired = false;
            $scope.hiddenPropReq = $scope.propertyRequired
        }
        else {
            $scope.propertyRequired = true;
            $scope.hiddenPropReq = '';
        }
        $scope.$emit('addedProperty', $scope.PropertyAddedList);
    };
    $scope.onAddProperty = function () {
        dataLayerService.getPropertyPrefixList().then(function (result) {
            $scope.propertyStreetPrefixList = [];
            $scope.propertyDirectionList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.propertyStreetPrefixList.push({
                        value: data[i].addressdirection,
                        name: data[i].addressdirectiondesc
                    });
                    $scope.propertyDirectionList.push({
                        value: data[i].addressdirection,
                        name: data[i].addressdirectiondesc
                    });
                }
            }
        });
        dataLayerService.getProprtyTypeList().then(function (result) {
            $scope.proprtyTypeList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.proprtyTypeList.push({
                        value: data[i].propcode,
                        name: data[i].propdesc
                    });
                }
            }
        });
        dataLayerService.getPropertyStatusList().then(function (result) {
            $scope.propertyStatusList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.propertyStatusList.push({
                        value: data[i].statuscode,
                        name: data[i].statusdesc
                    });
                }
            }
        });

        dataLayerService.getStreetTypeList().then(function (result) {
            $scope.propertyStreetTypeList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.propertyStreetTypeList.push({
                        value: data[i].streettype,
                        name: data[i].streettypedesc
                    });

                }
            }

        });
        dataLayerService.getAddressUnitList().then(
            function (result) {
                $scope.propertyUnitTypeList = [];
                var data = result.data;
                if (data != null) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.propertyUnitTypeList.push({
                            value: data[i].addressunittype,
                            name: data[i].addressunittypedesc
                        });
                    }
                }

            });

    };
    $scope.onPropertySelect = function (propertyrsn) {

        var data = $filter("filter")($scope.propertySearchList, { propertyRSN: propertyrsn }, true)
        if (data != null) {
            for (var i = 0; i < data.length; i++) {
                $scope.propertyFilterVariables.propertyNo = data[i].propertyNo;
                $scope.propertyFilterVariables.propertyStreetPrefix = data[i].propertyStreetPrefix;
                $scope.propertyFilterVariables.propertyStreet = data[i].propertyStreet;
                $scope.propertyFilterVariables.propertyStreetType = data[i].propertyStreetType;
                $scope.propertyFilterVariables.propertyDirection = data[i].propertyDirection;
                $scope.propertyFilterVariables.propertyUnitType = data[i].propertyUnitType;
                $scope.propertyFilterVariables.propertyUnitNo = data[i].propertyUnitNo;
                $scope.propertyFilterVariables.propertyStatus = data[i].propertyStatus;
                $scope.propertyFilterVariables.propertyCity = data[i].propertyCity;
                $scope.propertyFilterVariables.propertyCounty = data[i].propertyCounty;
                $scope.propertyFilterVariables.propertyRoll = data[i].propertyRoll;
                $scope.propertyFilterVariables.propertyState = data[i].propertyState;
                $scope.propertyFilterVariables.propertyPostal = data[i].propertyPostal;
                $scope.propertyFilterVariables.proprtyType = data[i].proprtyType;
                $scope.propertyFilterVariables.propertyName = data[i].propertyName;
                $scope.propertyFilterVariables.propertyRSN = data[i].propertyRSN;
                $scope.propertyFilterVariables.propertyPlan = data[i].propertyPlan;
                $scope.propertyFilterVariables.propertyLOT = data[i].propertyLOT;
                $scope.propertyFilterVariables.propertyX = data[i].propertyX;
                $scope.propertyFilterVariables.propertyY = data[i].propertyY;
                $scope.propertyFilterVariables.propertySec = data[i].propertySec;
                $scope.propertyFilterVariables.propertyTwn = data[i].propertyTwn;
                $scope.propertyFilterVariables.propertyRge = data[i].propertyRge;
                $scope.propertyFilterVariables.propertyRoute = data[i].propertyRoute;
                $scope.propertyFilterVariables.propertyCrossStreet = data[i].propertyCrossStreet;
                $scope.propertyFilterVariables.propertyParentRSN = data[i].propertyParentRSN;
                $scope.propertyFilterVariables.propertyLegalDesc = data[i].propertyLegalDesc;
                $scope.propertyFilterVariables.propertyFamilyRSN = data[i].propertyFamilyRSN;
                $scope.propertyFilterVariables.propertyZoning1 = data[i].propertyZoning1;
                $scope.propertyFilterVariables.propertyCreatedOnComment = data[i].propertyCreatedOnComment;
                $scope.propertyFilterVariables.propertyZoning2 = data[i].propertyZoning2;
                $scope.propertyFilterVariables.propertyZoning3 = data[i].propertyZoning3;
                $scope.propertyFilterVariables.propertyZoning4 = data[i].propertyZoning4;
                $scope.propertyFilterVariables.propertyZoning5 = data[i].propertyZoning5;
                $scope.propertyFilterVariables.propertyFrontage = data[i].propertyFrontage;
                $scope.propertyFilterVariables.propertyArea = data[i].propertyArea;
                $scope.propertyFilterVariables.propertyDepth = data[i].propertyDepth;
            }
            $scope.enabledisableAcceptProperty = true;
        }
    };
    $scope.ClosePropertyPanel = function () {
        if ($scope.propertySearchList != undefined && $scope.propertySearchList.length == 0) {
            $scope.showPropertySearchResult = false;
            $scope.enabledisableAcceptProperty = false;
            if (angular.element('#propertycontent').hasClass('col-sm-9')) {
                angular.element('#propertycontent').removeClass('col-sm-9').addClass('col-sm-12');
            }
            else {
                angular.element('#propertycontent').removeClass('col-sm-12').addClass('col-sm-9')
            }
        }
    }
    /*End Of Add Property */



    $scope.$on('AddProperty', function (events) {
        $scope.onAddProperty();
        $scope.collapsepeProperty = true;
        $scope.ClosePropertyPanel();
        angular.element('#propertycontent').removeClass('col-sm-9').addClass('col-sm-12');
    });
    $scope.AcceptProperty = function () {
        $scope.onAcceptProperty();
        $scope.$emit('addedProperty', $scope.PropertyAddedList);
    }

    $scope.$on('removeProperty', function (events, id) {
        $scope.onRemoveAddedProperty(id);
    });

    $scope.clearPropertySearchText = function () {
        $scope.propertyFilterVariables.searchText = '';
    }
});