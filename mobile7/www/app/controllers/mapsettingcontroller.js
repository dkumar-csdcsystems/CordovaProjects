app.controller('MapSettingCtrl', function ($scope, $rootScope, $filter, CommonService, dataLayerService, utilService, $cordovaNetwork) {
    $scope.openPOPUpToAddStartPoint = function () {
        dataLayerService.getValidProvince().then(function (result) {
            $rootScope.startPoint.countryList = [];
            if (result && result.data && result.data.length > 0) {
                for (var i = 0; i < result.data.length; i++) {
                    $rootScope.startPoint.countryList.push(result.data[i]);
                }
                var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));
                if (startPointSettings && startPointSettings.address !== null && startPointSettings.address !== "") {
                    $rootScope.startPoint.address = startPointSettings.address;
                    var searchcountry = ($rootScope.startPoint.selectedCountry === null || $rootScope.startPoint.selectedCountry.country == undefined || $rootScope.startPoint.selectedCountry.country == null) ? startPointSettings.country : $rootScope.startPoint.selectedCountry.country;
                    if (searchcountry !== null && searchcountry !== "" && searchcountry !== undefined) {
                        if ($rootScope.startPoint.countryList.length > 0) {
                            // Push the country which is not listed into list
                            if (startPointSettings.country !== undefined && startPointSettings.country !== null && startPointSettings.country !== "") {
                                $rootScope.startPoint.countryList.push({ country: startPointSettings.country, id: startPointSettings.country });
                            }
                            var filteredCountry = $filter('filter')($rootScope.startPoint.countryList, { country: searchcountry }, true);
                            if (filteredCountry.length > 0) {
                                $rootScope.startPoint.selectedCountry = filteredCountry[0];
                            }
                        }
                    }
                    $rootScope.startPoint.country = startPointSettings.country;
                    $rootScope.startPoint.location = startPointSettings.location;

                    $rootScope.startPoint.countryList = $.grep($rootScope.startPoint.countryList, function (n, i) {
                        return (n.country != "");
                    });
                    localStorage.setItem('startPointSettings', JSON.stringify($scope.startPoint));
                }
                CommonService.broadcastStartPointOpenPopUp($scope.startPoint);
            }
        });

    }
    $scope.setStartPoint = function () {

        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to set manual start point. Please connect to network and try again", 'error');
            return;
        }


        if ($rootScope.startPoint.address === "") {
            utilService.showError("Please enter location to set start point", "info");
            return;
        }


        localStorage.setItem('startPointSettings', JSON.stringify($rootScope.startPoint));
        CommonService.broadcastSetStartPoint($rootScope.startPoint);
        $("#setStartModal").modal("hide");
    }
    $scope.clearStartPoint = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to set current location. Please connect to network and try again", 'error');
            return;
        }
        $rootScope.startPoint.address = '';
        $rootScope.startPoint.country = '';
        $rootScope.startPoint.location = '';
        $rootScope.startPoint.selectedCountry = {};
        $scope.startPointSettings = {
            address: '',
            country: '',
            location: ''
        };
        localStorage.setItem('startPointSettings', JSON.stringify($scope.startPointSettings));
        CommonService.broadcastClearStartPoint();
        $("#setStartModal").modal("hide");
    }

    $scope.openPOPUpToAddEndPoint = function () {
        dataLayerService.getValidProvince().then(function (result) {
            $rootScope.endPoint.countryList = [];
            if (result && result.data && result.data.length > 0) {
                for (var i = 0; i < result.data.length; i++) {
                    $rootScope.endPoint.countryList.push(result.data[i]);
                }
                var endPointSettings = JSON.parse(localStorage.getItem("endPointSettings"));
                if (endPointSettings && endPointSettings.address !== null && endPointSettings.address !== "") {
                    $rootScope.endPoint.address = endPointSettings.address;
                    var searchcountry = ($rootScope.endPoint.selectedCountry === null || $rootScope.endPoint.selectedCountry.country == undefined || $rootScope.endPoint.selectedCountry.country == null) ? endPointSettings.country : $rootScope.endPoint.selectedCountry.country;
                    if (searchcountry !== null && searchcountry !== "" && searchcountry !== undefined) {
                        if ($rootScope.endPoint.countryList.length > 0) {
                            // Push the country which is not listed into list
                            if (endPointSettings.country !== undefined && endPointSettings.country !== null && endPointSettings.country !== "") {
                                $rootScope.endPoint.countryList.push({ country: endPointSettings.country, id: endPointSettings.country });
                            }
                            var filteredCountry = $filter('filter')($rootScope.endPoint.countryList, { country: searchcountry }, true);
                            if (filteredCountry.length > 0) {
                                $rootScope.endPoint.selectedCountry = filteredCountry[0];
                            }
                        }
                    }
                    $rootScope.endPoint.country = endPointSettings.country;
                    $rootScope.endPoint.location = endPointSettings.location;

                    $rootScope.endPoint.countryList = $.grep($rootScope.endPoint.countryList, function (n, i) {
                        return (n.country != "");
                    });
                    localStorage.setItem('endPointSettings', JSON.stringify($scope.endPoint));
                }
                CommonService.broadcastEndPointOpenPopUp($scope.endPoint);
            }
        });

    }
    $scope.setEndPoint = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to set manual end point. Please connect to network and try again", 'error');
            return;
        }
        if ($rootScope.endPoint.address === "") {
            utilService.showError("Please enter location to set end point", "info");
            return;
        }
        localStorage.setItem('endPointSettings', JSON.stringify($rootScope.endPoint));
        CommonService.broadcastSetEndPoint($rootScope.endPoint);
        $("#setEndModal").modal("hide");
    }
    $scope.clearEndPoint = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to clear end location. Please connect to network and try again", 'error');
            return;
        }
        $rootScope.endPoint.address = '';
        $rootScope.endPoint.country = '';
        $rootScope.endPoint.location = '';
        $rootScope.endPoint.selectedCountry = {};
        $scope.endPointSettings = {
            address: '',
            country: '',
            location: ''
        };
        localStorage.setItem('endPointSettings', JSON.stringify($scope.endPointSettings));
        CommonService.broadcastClearEndPoint();
        $("#setEndModal").modal("hide");
    }
    
   











});
