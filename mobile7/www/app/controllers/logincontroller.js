app.controller("LoginCtrl", function ($scope, $rootScope, $location, CommonService, utilService, requestHelperService, dataLayerService, $cordovaNetwork) {
    // change this when release the new build.
    $scope.versiondate = "20171117.1";
    angular.element("body").addClass("body-background");
    var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
    var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
    if ($.isArray(storedUser) && storedUser.length > 0) {
        $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
        $scope.password = "";
    } else {
        //temp fix
        $scope.userSettings = [];
        $scope.userSettings.push({
            username: '',
            password: '',
            lid: 'not logged in',
            validuser: ''
        });
        localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));
    }
    $scope.openCorporateWebSite = function () {
        window.open("https://www.csdcsystems.com/", '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
    }
    $scope.Login = function () {
        try {
            var storedSettings = JSON.parse(localStorage.getItem("serverSettings"));
            if (storedSettings != undefined && storedSettings !== "" && storedSettings!==null) {
                $scope.host = storedSettings[0].Host;
                $scope.connectioncache = storedSettings[0].ConnectionCache;
                $scope.eaiurl = storedSettings[0].EaiPush;
                $scope.heartbeat = storedSettings[0].HeartbeatName;
                $scope.isA6Compatible = storedSettings[0].isA6Compatible;
            } else {
                utilService.showError("Please Provide Application Server Setting to Login.", 'error');
                return;
            }
            if ($scope.host === "" || $scope.host === null || $scope.host === undefined)
            {
                utilService.showError("Please provide connection host to login.", 'error');
                return;
            }
            else if ($scope.connectioncache === "" || $scope.connectioncache === null || $scope.connectioncache === undefined) {
                utilService.showError("Please provide connection cache to login.", 'error');
                return;
            }
            else if ($scope.isA6Compatible && ($scope.eaiurl === undefined || $scope.eaiurl === "" || $scope.eaiurl === null)) {
                utilService.showError("Please provide connection eai url to login.", 'error');
                return;
            }
            else if ($scope.isA6Compatible && ($scope.heartbeat === undefined || $scope.heartbeat === "" || $scope.heartbeat === null)) {
                utilService.showError("Please provide connection heartbeat to login.", 'error');
                return;
            }
            requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, $scope.loginSuccess, "json");
            var siteoption = dataLayerService.getSiteOptions();
        } catch (e) {
            utilService.logtoConsole("Login failed.due to " + e.message);
            if (e.message.indexOf("Cannot read property '0' of null") > -1) {
                utilService.showError("Please Provide Application Server Setting to Login.", 'error');
            }
        }
    };
    $scope.loginSuccess = function (result) {
        try {
            if (result.error == null) {
                if (result.response) {
                    if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0 || result.response.lid.indexOf("</html>") > 0) {
                        utilService.showError("Authentication failed due to invalid UserID/Password.", 'error');
                        $location.path("/login");
                    } else if (result.response.lid.indexOf("Error") < 0) {

                        dataLayerService.getActualUserId($scope.username).then(function (useridResult) {

                            $scope.username = useridResult.data;

                            $scope.userSettings = [];
                            $scope.userSettings.push({
                                username: $scope.username,
                                password: $scope.password,
                                lid: result.response.lid,
                                validuser: result.response.validUser
                            });


                            CommonService.setLoggedUser($scope.username);
                            localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));

                            dataLayerService.updateUserPassword($scope.username, $scope.password)
                                .then(function (updateResult) {
                                    if (updateResult.data && updateResult.data === "success") {
                                        utilService.logtoConsole("password updated successfully.");
                                    } else {
                                        utilService.logtoConsole("password could not be updated.");
                                    }
                                });


                            $scope.serverSettings = [];
                            storedSettings = JSON.parse(localStorage.getItem('serverSettings'));
                            if (storedSettings != undefined && storedSettings !== '' && storedSettings != null) {
                                $scope.serverSettings.push({
                                    Host: storedSettings[0].Host,
                                    ConnectionCache: storedSettings[0].ConnectionCache,
                                    EaiPush: storedSettings[0].EaiPush === undefined ? "" : storedSettings[0].EaiPush,
                                    HeartbeatName: storedSettings[0].HeartbeatName === undefined ? "" : storedSettings[0].HeartbeatName,
                                    UserName: $scope.username,
                                    Password: $scope.password,
                                    DownloadURL: storedSettings[0].DownloadURL === undefined ? "" : storedSettings[0].DownloadURL,
                                    isA6Compatible: storedSettings[0].isA6Compatible === undefined ? false : storedSettings[0].isA6Compatible
                                });
                                localStorage.setItem("serverSettings", JSON.stringify($scope.serverSettings));
                            }
                            $location.path("/main");
                            utilService.logtoConsole($location.path(), 'info');

                            // Call logoff request
                            requestHelperService.ExecuteServiceLogoutRequest($scope, $scope.logoutSuccess, "json");

                        });


                    } else {
                        $scope.errorMessage = result.response;
                        $location.path("/login");
                    }
                }
            } else {
                // validating user offline mode
                dataLayerService.validateUserOffline($scope.username, $scope.password).then(function (result) {
                    if (result.data && result.data === "success") {
                        $scope.userSettings = [];
                        $scope.userSettings.push({
                            username: $scope.username,
                            password: $scope.password,
                            lid: "",
                            validuser: ''
                        });
                        CommonService.setLoggedUser($scope.username);
                        localStorage.setItem('userSettings', JSON.stringify($scope.userSettings));
                        $location.path("/main");
                        utilService.logtoConsole($location.path(), "info");
                    } else {
                        var isoffline = $cordovaNetwork.isOffline();
                        if (isoffline) {
                            utilService.showError("Unable to login. Please connect to network and try again", 'error');
                            return;
                        } else {
                            utilService.showError("Authentication failed due to invalid UserID/Password.", 'error');
                        }
                    }
                });
            }
        } catch (e) {
            utilService.logtoConsole(e, "error");
            utilService.showError("Unexpected  error occured while validating user", 'error');
            // Call logoff request
            requestHelperService.ExecuteServiceLogoutRequest($scope, $scope.logoutSuccess, "json");
        }

        
    };
    $scope.logoutSuccess = function (result) {
        utilService.logtoConsole("logoff response: " + result.response);
    }
});