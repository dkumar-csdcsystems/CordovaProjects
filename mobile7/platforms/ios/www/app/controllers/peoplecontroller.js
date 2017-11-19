app.controller('PeopleCtrl', function ($scope, $filter, dataLayerService, syncHelperService, utilService, $cordovaNetwork, requestHelperService, CommonService) {
    /*Add People Start here*/
    $scope.showPeopleSearchResult = false;
    $scope.enabledisableAcceptPeople = false;
    $scope.showPeopleGrid = false;

    $scope.peopleFilterVariables = {
        peopleSaluation: '', peopleFirstName: '', peopleMiddleName: '', peopleLastName: '', peopleNameSuffix: '', peopleOrgName: '', peoplePhone1: '',
        peoplePhone1Desc: '', peoplePhone2: '', peoplePhone2Desc: '', peoplePhone3: '', peoplePhone3Desc: '', peopleEmailAdd: '', peopleAddrPrefix: '',
        peopleAddrComments: '', peopleAddrHouseNo: '', peopleAddrStreetPrefix: '', peopleAddrStreetName: '', peopleAddrStreetType: '', peopleAddrStreetDirection: '',
        peopleAddrUnitType: '', peopleAddrUnitNo: '', peopleAddrCity: '', peopleAddrCounty: '', peopleAddrState: '', peopleAddrPostalCode: '', peopleAddrCountry: '',
        peopleRoleType: '', peopleStatus: '', peopleAddressLine1: '', peopleAddressLine2: '', peopleAddressLine3: '', peopleDOB: '', peopleReference: '',
        peopleFamilyId: '', startIndex: 0, endIndex: null, searchPeopleText: ''

    };
    $scope.onRetrievePeople = function () {
        $scope.peopleSearchList = [];
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to search people.</br> Please connect to network and try again", 'error');
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
                            syncHelperService.SearchPeopleFullText(function (result) {
                                var data = result.data;
                                if (data != null) {
                                    if (!angular.isArray(result.data)) {
                                        data = [result.data];
                                    }
                                    if (data.length > 0) {
                                        for (var i = 0; i < data.length; i++) {
                                            $scope.peopleSearchList.push({
                                                name: String.format("{0}{1} {2} {3}", data[i].nametitle, data[i].namefirst, data[i].namemiddle, data[i].namelast),
                                                address: String.format("{0}{1} {2} {3} {4} {5} {6} {7} {8} {9}", data[i].addrprefix, data[i].addrhouse, data[i].addrstreetprefix, data[i].addrstreet,
                                                     data[i].addrstreetdirection, data[i].addrunit, data[i].addrcity, data[i].addrprovince, data[i].addrpostal, data[i].addrcountry),
                                                peoplersn: data[i].peoplersn,
                                                addrcity: data[i].addrcity,
                                                addrcountry: data[i].addrcountry,
                                                addressline1: data[i].addressline1,
                                                addressline2: data[i].addressline2,
                                                addressline3: data[i].addressline3,
                                                addrhouse: data[i].addrhouse,
                                                addrpostal: data[i].addrpostal,
                                                addrprefix: data[i].addrprefix,
                                                addrprovince: data[i].addrprovince,
                                                addrstreet: data[i].addrstreet,
                                                addrstreetdirection: data[i].addrstreetdirection,
                                                addrstreetprefix: data[i].addrstreetprefix,
                                                addrstreettype: data[i].addrstreettype,
                                                addrunit: data[i].addrunit,
                                                addrunittype: data[i].addrunittype,
                                                birthdate: data[i].birthdate,
                                                comments: data[i].comments,
                                                emailaddress: data[i].emailaddress,
                                                familyrsn: data[i].familyrsn,
                                                licencenumber: data[i].licencenumber,
                                                namefirst: data[i].namefirst,
                                                namelast: data[i].namelast,
                                                namemiddle: data[i].namemiddle,
                                                namesuffix: data[i].namesuffix,
                                                nametitle: data[i].nametitle,
                                                organizationname: data[i].organizationname,
                                                parentrsn: data[i].parentrsn,
                                                peoplecode: data[i].peoplecode,
                                                peoplersn: data[i].peoplersn,
                                                phone1: data[i].phone1,
                                                phone1desc: data[i].phone1desc,
                                                phone2: data[i].phone2,
                                                phone2desc: data[i].phone2desc,
                                                phone3: data[i].phone3,
                                                phone3desc: data[i].phone3desc,
                                                statuscode: data[i].statuscode
                                            });

                                        }
                                        $scope.showPeopleSearchResult = true;
                                        angular.element('#peoplecontent').removeClass('col-sm-12').addClass('col-sm-9');
                                        var peoplecontentHeight = angular.element("#peoplecontent").height();
                                        var heighttoset = peoplecontentHeight;
                                        angular.element(".scroll-1").mCustomScrollbar({
                                            setHeight: heighttoset,
                                            theme: "3d-dark"
                                        });
                                    } else {
                                        $scope.showPeopleSearchResult = false;
                                        angular.element('#peoplecontent').removeClass('col-sm-9').addClass('col-sm-12');
                                        var peoplecontentHeight = angular.element("#peoplecontent").height();
                                        var heighttoset = peoplecontentHeight;
                                        angular.element(".scroll-1").mCustomScrollbar({
                                            setHeight: heighttoset,
                                            theme: "3d-dark"
                                        });
                                        utilService.showError("No people record found with search text " + $scope.peopleFilterVariables.searchPeopleText, "info");
                                    }
                                }

                                // Call logoff request
                                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                    utilService.logtoConsole("logoff response: " + result.response);
                                }, "json");


                            }, $scope, $scope.peopleFilterVariables.searchPeopleText, $scope.peopleFilterVariables.startIndex, $scope.peopleFilterVariables.endIndex);
                        }
                    }
                }
            }, "json");
        } else {
            utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
        }


        $('input[ng-model="peopleFilterVariables.searchPeopleText"]').blur();
    }
    $scope.onClearPeople = function () {
        $scope.peopleFilterVariables.peopleSaluation = ''; $scope.peopleFilterVariables.peopleFirstName = ''; $scope.peopleFilterVariables.peopleMiddleName = ''; $scope.peopleFilterVariables.peopleLastName = ''; $scope.peopleFilterVariables.peopleNameSuffix = ''; $scope.peopleFilterVariables.peopleOrgName = '';
        $scope.peopleFilterVariables.peoplePhone1 = ''; $scope.peopleFilterVariables.peoplePhone1Desc = ''; $scope.peopleFilterVariables.peoplePhone2 = ''; $scope.peopleFilterVariables.peoplePhone2Desc = ''; $scope.peopleFilterVariables.peoplePhone3 = ''; $scope.peopleFilterVariables.peoplePhone3Desc = '';
        $scope.peopleFilterVariables.peopleEmailAdd = ''; $scope.peopleFilterVariables.peopleAddrPrefix = ''; $scope.peopleFilterVariables.peopleAddrComments = ''; $scope.peopleFilterVariables.peopleAddrHouseNo = ''; $scope.peopleFilterVariables.peopleAddrStreetPrefix = '';
        $scope.peopleFilterVariables.peopleAddrStreetName = ''; $scope.peopleFilterVariables.peopleAddrStreetType = ''; $scope.peopleFilterVariables.peopleAddrStreetDirection = ''; $scope.peopleFilterVariables.peopleAddrUnitType = ''; $scope.peopleFilterVariables.peopleAddrUnitNo = '';
        $scope.peopleFilterVariables.peopleAddrCity = ''; $scope.peopleFilterVariables.peopleAddrCounty = ''; $scope.peopleFilterVariables.peopleAddrState = ''; $scope.peopleFilterVariables.peopleAddrPostalCode = ''; $scope.peopleFilterVariables.peopleAddrCountry = '';
        $scope.peopleFilterVariables.peopleStatus = ''; $scope.peopleFilterVariables.peopleRoleType = ''; $scope.peopleFilterVariables.peopleRowId = ''; $scope.peopleFilterVariables.peopleParentId = ''; $scope.peopleFilterVariables.peopleAddressLine1 = '';
        $scope.peopleFilterVariables.peopleAddressLine2 = ''; $scope.peopleFilterVariables.peopleAddressLine3 = ''; $scope.peopleFilterVariables.peopleDOB = ''; $scope.peopleFilterVariables.peopleReference = ''; $scope.peopleFilterVariables.peopleFamilyId = '';
        if ($scope.peopleSearchList != undefined && $scope.peopleSearchList.length == 0) {
            angular.element('#peoplecontent').removeClass('col-sm-9').addClass('col-sm-12');
            $scope.showPeopleSearchResult = false;
            $scope.enabledisableAcceptPeople = false;
            $scope.peopleFilterVariables.searchPeopleText = ''
        }
        $scope.collapsepePeople = !$scope.collapsepePeople;
    }
    $scope.PeopleAddedList = [];
    $scope.onAcceptPeople = function () {
        if ($scope.peopleFilterVariables.peopleRSN === "") {
            $scope.onClearPeople();
            $scope.ClosePeoplePanel();
            utilService.showError("Please select a people to add.", "error");
            return;
        }
        $scope.showPeopleGrid = true;
        var peoplesalution = $filter('filter')($scope.saluationList, { value: $scope.peopleFilterVariables.peopleSaluation }, true);
        if (peoplesalution.length > 0) {
            peoplesalution = peoplesalution[0].value;
        } else {
            peoplesalution = "";
        }
        var peoplephone1desc = $filter('filter')($scope.phoneDescList, { value: $scope.peopleFilterVariables.peoplePhone1Desc }, true);
        if (peoplephone1desc.length > 0) {
            peoplephone1desc = peoplephone1desc[0].value;
        } else {
            peoplephone1desc = "";
        }
        var peoplephone2desc = $filter('filter')($scope.phoneDescList, { value: $scope.peopleFilterVariables.peoplePhone2Desc }, true);
        if (peoplephone2desc.length > 0) {
            peoplephone2desc = peoplephone2desc[0].value;
        } else {
            peoplephone2desc = "";
        }
        var peoplephone3desc = $filter('filter')($scope.phoneDescList, { value: $scope.peopleFilterVariables.peoplePhone3Desc }, true);
        if (peoplephone3desc.length > 0) {
            peoplephone3desc = peoplephone3desc[0].value;
        } else {
            peoplephone3desc = "";
        }
        var peopleaddrstreettype = $filter('filter')($scope.streetTypeList, { value: $scope.peopleFilterVariables.peopleAddrStreetType }, true);
        if (peopleaddrstreettype.length > 0) {
            peopleaddrstreettype = peopleaddrstreettype[0].value;
        } else {
            peopleaddrstreettype = "";
        }
        var peopleaddrstreetdirection = $filter('filter')($scope.addrDirectionList, { value: $scope.peopleFilterVariables.peopleAddrStreetDirection }, true);
        if (peopleaddrstreetdirection.length > 0) {
            peopleaddrstreetdirection = peopleaddrstreetdirection[0].value;
        } else {
            peopleaddrstreetdirection = "";
        }
        var peopleaddrunittype = $filter('filter')($scope.addrUnitTypeList, { value: $scope.peopleFilterVariables.peopleAddrUnitType }, true);
        if (peopleaddrunittype.length > 0) {
            peopleaddrunittype = peopleaddrunittype[0].value;
        } else {
            peopleaddrunittype = "";
        }
        var peoplestatus = $filter('filter')($scope.peopleStatusList, { value: $scope.peopleFilterVariables.peopleStatus }, true);
        var peoplestatusvalue = "";
        var peoplestatusname = "";
        if (peoplestatus.length > 0) {
            peoplestatusvalue = peoplestatus[0].value;
            peoplestatusname = peoplestatus[0].name;
        } else {
            peoplestatusvalue = "";
        }
        var peopleroletype = $filter('filter')($scope.peopleRoleList, { value: $scope.peopleFilterVariables.peopleRoleType }, true);
        var peopleroletypevalue = "";
        if (peopleroletype.length > 0) {
            peopleroletypevalue = peopleroletype[0].value;
        } else {
            peopleroletypevalue = "";
        }

        $scope.PeopleAddedList.push(
            {
                Id: $scope.PeopleAddedList.length + 1,
                peopleSelectedRoleType: peopleroletype,
                name: String.format("{0} {1} {2}", $scope.peopleFilterVariables.peopleFirstName, $scope.peopleFilterVariables.peopleMiddleName, $scope.peopleFilterVariables.peopleLastName),
                phone: String.format("{0} {1} {2}", $scope.peopleFilterVariables.peoplePhone1, $scope.peopleFilterVariables.peoplePhone2, $scope.peopleFilterVariables.peoplePhone3),
                status: peoplestatusname,
                address: String.format("{0}{1} {2} {3} {4} {5} {6} {7} {8} {9}", $scope.peopleFilterVariables.peopleAddrPrefix, $scope.peopleFilterVariables.peopleAddrHouseNo, $scope.peopleFilterVariables.peopleAddrStreetPrefix,
                     $scope.peopleFilterVariables.peopleAddrStreetName, $scope.peopleFilterVariables.peopleAddrStreetDirection, $scope.peopleFilterVariables.peopleAddrUnitNo, $scope.peopleFilterVariables.peopleAddrCity,
                     $scope.peopleFilterVariables.peopleAddrState, $scope.peopleFilterVariables.peopleAddrPostalCode, $scope.peopleFilterVariables.peopleAddrCountry),
                peoplersn: $scope.peopleFilterVariables.peopleRSN,
                statuscode: peoplestatusvalue,
                peopleSaluation: peoplesalution,
                peopleFirstName: $scope.peopleFilterVariables.peopleFirstName === undefined ? "" : $scope.peopleFilterVariables.peopleFirstName,
                peopleMiddleName: $scope.peopleFilterVariables.peopleMiddleName === undefined ? "" : $scope.peopleFilterVariables.peopleMiddleName,
                peopleLastName: $scope.peopleFilterVariables.peopleLastName === undefined ? "" : $scope.peopleFilterVariables.peopleLastName,
                peopleNameSuffix: $scope.peopleFilterVariables.peopleNameSuffix === undefined ? "" : $scope.peopleFilterVariables.peopleNameSuffix,
                peopleOrgName: $scope.peopleFilterVariables.peopleOrgName === undefined ? "" : $scope.peopleFilterVariables.peopleOrgName,
                peoplePhone1: $scope.peopleFilterVariables.peoplePhone1 === undefined ? "" : $scope.peopleFilterVariables.peoplePhone1,
                peoplePhone1Desc: peoplephone1desc,
                peoplePhone2: $scope.peopleFilterVariables.peoplePhone2 === undefined ? "" : $scope.peopleFilterVariables.peoplePhone2,
                peoplePhone2Desc: peoplephone2desc,
                peoplePhone3: $scope.peopleFilterVariables.peoplePhone3 === undefined ? "" : $scope.peopleFilterVariables.peoplePhone3,
                peoplePhone3Desc: peoplephone3desc,
                peopleEmailAdd: $scope.peopleFilterVariables.peopleEmailAdd === undefined ? "" : $scope.peopleFilterVariables.peopleEmailAdd,
                peopleAddrPrefix: $scope.peopleFilterVariables.peopleAddrPrefix === undefined ? "" : $scope.peopleFilterVariables.peopleAddrPrefix,
                peopleAddrComments: $scope.peopleFilterVariables.peopleAddrComments === undefined ? "" : $scope.peopleFilterVariables.peopleAddrComments,
                peopleAddrHouseNo: $scope.peopleFilterVariables.peopleAddrHouseNo === undefined ? "" : $scope.peopleFilterVariables.peopleAddrHouseNo,
                peopleAddrStreetPrefix: $scope.peopleFilterVariables.peopleAddrStreetPrefix === undefined ? "" : $scope.peopleFilterVariables.peopleAddrStreetPrefix,
                peopleAddrStreetName: $scope.peopleFilterVariables.peopleAddrStreetName === undefined ? "" : $scope.peopleFilterVariables.peopleAddrStreetName,
                peopleAddrStreetType: peopleaddrstreettype,
                peopleAddrStreetDirection: peopleaddrstreetdirection,
                peopleAddrUnitType: peopleaddrunittype,
                peopleAddrUnitNo: $scope.peopleFilterVariables.peopleAddrUnitNo === undefined ? "" : $scope.peopleFilterVariables.peopleAddrUnitNo,
                peopleAddrCity: $scope.peopleFilterVariables.peopleAddrCity === undefined ? "" : $scope.peopleFilterVariables.peopleAddrCity,
                peopleAddrCounty: $scope.peopleFilterVariables.peopleAddrCounty === undefined ? "" : $scope.peopleFilterVariables.peopleAddrCounty,
                peopleAddrState: $scope.peopleFilterVariables.peopleAddrState === undefined ? "" : $scope.peopleFilterVariables.peopleAddrState,
                peopleAddrPostalCode: $scope.peopleFilterVariables.peopleAddrPostalCode === undefined ? "" : $scope.peopleFilterVariables.peopleAddrPostalCode,
                peopleAddrCountry: $scope.peopleFilterVariables.peopleAddrCountry === undefined ? "" : $scope.peopleFilterVariables.peopleAddrCountry,
                peopleStatus: peoplestatusvalue,
                peopleRoleType: peopleroletypevalue,
                peopleRowId: $scope.peopleFilterVariables.peopleRowId === undefined ? "" : $scope.peopleFilterVariables.peopleRowId,
                peopleParentId: $scope.peopleFilterVariables.peopleParentId === undefined ? "" : $scope.peopleFilterVariables.peopleParentId,
                peopleAddressLine1: $scope.peopleFilterVariables.peopleAddressLine1 === undefined ? "" : $scope.peopleFilterVariables.peopleAddressLine1,
                peopleAddressLine2: $scope.peopleFilterVariables.peopleAddressLine2 === undefined ? "" : $scope.peopleFilterVariables.peopleAddressLine2,
                peopleAddressLine3: $scope.peopleFilterVariables.peopleAddressLine3 === undefined ? "" : $scope.peopleFilterVariables.peopleAddressLine3,
                peopleDOB: $scope.peopleFilterVariables.peopleDOB === undefined ? "" : $scope.peopleFilterVariables.peopleDOB,
                peopleReference: $scope.peopleFilterVariables.peopleReference === undefined ? "" : $scope.peopleFilterVariables.peopleReference,
                peopleFamilyId: $scope.peopleFilterVariables.peopleFamilyId === undefined ? "" : $scope.peopleFilterVariables.peopleFamilyId,
                peopleRSN: $scope.peopleFilterVariables.peopleRSN === undefined ? "" : $scope.peopleFilterVariables.peopleRSN
            });
        if ($scope.PeopleAddedList.length > 0) {
            $scope.peopleRequired = false;
            $scope.hiddenPeopleReq = $scope.peopleRequired
        }
        else {
            $scope.peopleRequired = true;
            $scope.hiddenPeopleReq = '';
        }
        $scope.onClearPeople();
        $scope.ClosePeoplePanel();
        $scope.enabledisableAcceptPeople = false;
    }

    $scope.onAddPeople = function () {
        $scope.peopleFirstName = '';
        dataLayerService.getSaluationList().then(function (result) {
            $scope.saluationList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.saluationList.push({
                        value: data[i].desc,
                        name: data[i].desc
                    });

                }
            }
        });
        dataLayerService.getStreetTypeList().then(function (result) {
            $scope.streetTypeList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.streetTypeList.push({
                        value: data[i].streettype,
                        name: data[i].streettypedesc
                    });

                }
            }
        });
        dataLayerService.getPhoneDescList().then(function (result) {
            $scope.phoneDescList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.phoneDescList.push({
                        value: data[i].id,
                        name: data[i].titlename

                    });

                }
            }
        });
        dataLayerService.getPeopleRoleList().then(function (result) {
            $scope.peopleRoleList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.peopleRoleList.push({
                        value: data[i].peoplecode,
                        name: data[i].peopledesc
                    });

                }
            }
        });
        dataLayerService.getPeopleStatusList().then(function (result) {
            $scope.peopleStatusList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.peopleStatusList.push({
                        value: data[i].statuscode,
                        name: data[i].statusdesc
                    });
                }
            }
        });
        dataLayerService.getAddressUnitList().then(function (result) {
            $scope.addrUnitTypeList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addrUnitTypeList.push({
                        value: data[i].addressunittype,
                        name: data[i].addressunittypedesc
                    });
                }
            }
        });
        dataLayerService.getAddressDirectionList().then(function (result) {
            $scope.addrDirectionList = [];
            var data = result.data;
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    $scope.addrDirectionList.push({
                        value: data[i].addressdirection,
                        name: data[i].addressdirectiondesc
                    });

                }
            }
        });
    };
    $scope.onPeopleSelect = function (peopleRSN) {

        var data = $filter('filter')($scope.peopleSearchList, { peoplersn: peopleRSN }, true);
        if (data != null) {
            for (var i = 0; i < data.length; i++) {
                $scope.peopleFilterVariables.peopleSaluation = '';
                $scope.peopleFilterVariables.peopleSaluation = data[i].nametitle; $scope.peopleFilterVariables.peopleFirstName = data[i].namefirst; $scope.peopleFilterVariables.peopleMiddleName = data[i].namemiddle;
                $scope.peopleFilterVariables.peopleLastName = data[i].namelast; $scope.peopleFilterVariables.peopleNameSuffix = data[i].namesuffix; $scope.peopleFilterVariables.peopleOrgName = data[i].organizationname;
                $scope.peopleFilterVariables.peoplePhone1 = data[i].phone1; $scope.peopleFilterVariables.peoplePhone1Desc = data[i].phone1desc; $scope.peopleFilterVariables.peoplePhone2 = data[i].phone2;
                $scope.peopleFilterVariables.peoplePhone2Desc = data[i].phone2desc; $scope.peopleFilterVariables.peoplePhone3 = data[i].phone3; $scope.peopleFilterVariables.peoplePhone3Desc = data[i].phone3desc;
                $scope.peopleFilterVariables.peopleEmailAdd = data[i].emailaddress; $scope.peopleFilterVariables.peopleAddrPrefix = data[i].addrprefix; $scope.peopleFilterVariables.peopleAddrComments = data[i].comments;
                $scope.peopleFilterVariables.peopleAddrHouseNo = data[i].addrhouse; $scope.peopleFilterVariables.peopleAddrStreetPrefix = data[i].addrstreetprefix;
                $scope.peopleFilterVariables.peopleAddrStreetName = data[i].addrstreet; $scope.peopleFilterVariables.peopleAddrStreetType = data[i].addrstreettype;
                $scope.peopleFilterVariables.peopleAddrStreetDirection = data[i].addrstreetdirection; $scope.peopleFilterVariables.peopleAddrUnitType = data[i].addrunittype; $scope.peopleFilterVariables.peopleAddrUnitNo = data[i].addrunit;
                $scope.peopleFilterVariables.peopleAddrCity = data[i].addrcity; $scope.peopleFilterVariables.peopleAddrCounty = data[i].countydesc; $scope.peopleFilterVariables.peopleAddrState = data[i].addrprovince;
                $scope.peopleFilterVariables.peopleAddrPostalCode = data[i].addrpostal; $scope.peopleFilterVariables.peopleAddrCountry = data[i].addrcountry;
                $scope.peopleFilterVariables.peopleStatus = data[i].statuscode; $scope.peopleFilterVariables.peopleRoleType = data[i].peoplecode; $scope.peopleFilterVariables.peopleRowId = data[i].rowid;
                $scope.peopleFilterVariables.peopleParentId = data[i].parentrsn; $scope.peopleFilterVariables.peopleAddressLine1 = data[i].addressline1;
                $scope.peopleFilterVariables.peopleAddressLine2 = data[i].addressline2; $scope.peopleFilterVariables.peopleAddressLine3 = data[i].addressline3; $scope.peopleFilterVariables.peopleDOB = data[i].birthdate;
                $scope.peopleFilterVariables.peopleReference = data[i].referencefile; $scope.peopleFilterVariables.peopleFamilyId = data[i].familyrsn;
                $scope.peopleFilterVariables.peopleRSN = data[i].peoplersn;
            }
            $scope.enabledisableAcceptPeople = true;
        }
    }
    $scope.ClosePeoplePanel = function () {
        if ($scope.peopleSearchList != undefined && $scope.peopleSearchList.length == 0) {
            $scope.showPeopleSearchResult = false;
            $scope.enabledisableAcceptPeople = false;
            if (angular.element('#peoplecontent').hasClass('col-sm-9')) {
                angular.element('#peoplecontent').removeClass('col-sm-9').addClass('col-sm-12');
            }
            else {
                angular.element('#peoplecontent').removeClass('col-sm-12').addClass('col-sm-9')
            }
        }
    }
    $scope.onRemoveAddedPeople = function (id) {
        $scope.PeopleAddedList = $.grep($scope.PeopleAddedList, function (e) { return e.Id != id; });
        if ($scope.PeopleAddedList.length > 0) {
            $scope.peopleRequired = false;
            $scope.hiddenPeopleReq = $scope.peopleRequired
        }
        else {
            $scope.peopleRequired = true;
            $scope.hiddenPeopleReq = '';
        }
        $scope.$emit('addedPeople', $scope.PeopleAddedList, $scope.peopleRoleList);
    }
    $scope.onHidePeopleResult = function () {
        $scope.ClosePeoplePanel();
    }

    $scope.clearPeopleSearchText = function () {
        $scope.peopleFilterVariables.searchPeopleText = "";
    }
    /*End Of Add People */

    $scope.$on('AddPeople', function (events) {
        $scope.onAddPeople();
        $scope.collapsepePeople = true;
        //$scope.ClosePeoplePanel();
        //angular.element('#peoplecontent').removeClass('col-sm-9').addClass('col-sm-12');
    });
    $scope.AcceptPeople = function () {
        $scope.onAcceptPeople();
        $scope.$emit('addedPeople', $scope.PeopleAddedList, $scope.peopleRoleList);
    }
    $scope.$on('removePeople', function (events, id) {
        $scope.onRemoveAddedPeople(id);
    });
});