// From map setting
app.controller('MapMenuCtrl', function ($scope, $rootScope, $filter, CommonService, dataLayerService, utilService, $timeout, $cordovaNetwork) {
    var tmpList = [];
    $scope.fromwhere = "";
    $scope.calculateAndDisplayPriorityRoute = function (fromwhere) {
        $scope.fromwhere = "priority";
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to create route. Please connect to network and try again", 'error');
            return;
        }

        tmpList = $scope.selectedItemsToGetRoute;

        // Remove duplicate folder
        var filteredFolderList = CommonService.sortObjArray(tmpList, 'folderId');
        filteredFolderList = CommonService.removeDuplicatesFromObjArray(filteredFolderList, 'folderId');
        // get array of folder id
        var folderids = $(filteredFolderList).map(function (cnt, it) {
            return it.folderId;
        }).get();

        if (folderids.length > 0) {
            dataLayerService.getPropertyAddresses(folderids).then(function (result) {
                if (result) {
                    if (result.error == null) {
                        if (result.data) {
                            for (var i = 0; i < result.data.length; i++) {
                                var row = result.data[i];
                                var fomattedAddress = CommonService.getformattedAddress(row);
                                var checkIfHavePropertyRSN = $filter('filter')($scope.selectedItemsToGetRoute, { propertyRSN: row.propertyrsn }, true);
                                checkIfHavePropertyRSN = CommonService.sortObjArray(checkIfHavePropertyRSN, 'propertyRSN');
                                checkIfHavePropertyRSN = CommonService.removeDuplicatesFromObjArray(checkIfHavePropertyRSN, 'propertyRSN');
                                if (checkIfHavePropertyRSN.length > 0) {
                                    for (var j = 0; j < checkIfHavePropertyRSN.length; j++) {
                                        checkIfHavePropertyRSN[j].fomattedAddress = fomattedAddress;
                                        checkIfHavePropertyRSN[j].isPriority = false;
                                    }
                                }
                            }
                            if ($scope.selectedItemsToGetRoute.length > 0) { // Checking if atleast one inspection is selected
                                if ($scope.fromwhere !== 'hybrid')
                                    $("#setPriorityPopup").modal({ backdrop: 'static', keyboard: false });

                            } else {// show info message to select atleast one inspection and return.
                                utilService.showError("Please select a inspection to get route.", "info");
                                return;
                            }
                        }
                    }
                }
            });
        }


    };





    $scope.calculateAndDisplayOptimizedRoute = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to create route. Please connect to network and try again", 'error');
            return;
        }
        // Check if inspection selected or not to get route
        $scope.selectedItemsToGetRoute = $filter('filter')($scope.totalItemsToGetRoute, { isInboxSelected: true }, true);
        tmpList = $scope.selectedItemsToGetRoute
        if ($scope.selectedItemsToGetRoute.length > 0) { // Checking if atleast one inspection is selected
            CommonService.broadcastCalculateAndDisplayRoute({ selecteditems: $scope.selectedItemsToGetRoute, fromwhere: "optimized" });
            $rootScope.iscliked = false;
            $rootScope.isRouteGenerated = true;
            $scope.fromwhere = "optimized";
        } else {// show info message to select atleast one inspection and return.
            utilService.showError("Please select a inspection to get route.", "info");
            $rootScope.isRouteGenerated = false;
            return;
        }
    };

    $scope.calculateAndDisplayOptimizedRouteWithReverse = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to create route. Please connect to network and try again", 'error');
            return;
        }
        // Check if inspection selected or not to get route
        $scope.selectedItemsToGetRoute = $filter('filter')($scope.totalItemsToGetRoute, { isInboxSelected: true }, true);
        tmpList = $scope.selectedItemsToGetRoute
        if ($scope.selectedItemsToGetRoute.length > 0) { // Checking if atleast one inspection is selected
            CommonService.broadcastCalculateAndDisplayRoute({ selecteditems: $scope.selectedItemsToGetRoute, fromwhere: "optimizedreverse" });
            $rootScope.iscliked = false;
            $rootScope.isRouteGenerated = true;
            $scope.fromwhere = "optimizedreverse";
        } else {// show info message to select atleast one inspection and return.
            utilService.showError("Please select a inspection to get route.", "info");
            $rootScope.isRouteGenerated = false;
            return;
        }
    };

    $scope.showDirectionSummary = function () {
        var scope = angular.element('[ng-controller=IndexCtrl]').scope();
        scope.isDirectionSummary = true;
    }
    $scope.continueToCalcRoute = function () {
        CommonService.broadcastCalculateAndDisplayRoute({ selecteditems: $scope.selectedItemsToGetRoute, fromwhere: "priority" });
        $("#setPriorityPopup").modal("hide");
        $rootScope.iscliked = false;
        $rootScope.isRouteGenerated = true;
        $scope.fromwhere = "priority";

    }

    var NoDirectionFound = $rootScope.$on("NoDirectionFound", function (event) {
        $timeout(function () {
            $rootScope.iscliked = true;
            //$rootScope.isItemSelected = false;
            $rootScope.$digest();
        });
    });

    $scope.navigate = function () {
        var isoffline = $cordovaNetwork.isOffline();
        if (isoffline) {
            utilService.showError("Unable to create route. Please connect to network and try again", 'error');
            return;
        }
        $scope.selectedItemsToGetRoute = $filter('filter')($scope.totalItemsToGetRoute, { isInboxSelected: true }, true);
        if ($scope.selectedItemsToGetRoute.length > 0) { // Checking if atleast one inspection is selected
            CommonService.broadcastNavigate({ selecteditems: $scope.selectedItemsToGetRoute, fromwhere: $scope.fromwhere });
            //$scope.iscliked = true;
        } else {// show info message to select atleast one inspection and return.
            utilService.showError("Please select a inspection to navigate.", "info");
            return;
        }

    };

    $scope.clearRoute = function () {
        CommonService.broadcastClearRoute();
        $rootScope.iscliked = true;
        $rootScope.isItemSelected = false;
        $rootScope.isRouteGenerated = false;
    }

    $scope.totalItemsToGetRoute = [];
    $scope.selectedItemsToGetRoute = [];
    var InboxItemSelected = $rootScope.$on("InboxItemSelected", function (event, result) {
        $scope.totalItemsToGetRoute = result.data;
        $scope.selectedItemsToGetRoute = $filter('filter')($scope.totalItemsToGetRoute, { isInboxSelected: true }, true);
        // Check here for property if a inspection has property or not
        $scope.selectedItemsToGetRoute = $.grep($scope.selectedItemsToGetRoute, function (item, index) {
            if (item.propertyRSN === '0.0' || item.propertyRSN === 0 || item.propertyRSN === '0' || item.location === undefined || item.location === null || item.location === "") {
                utilService.showError("The inspection (" + item.folderNumber + ") does not have a valid property.</br> Skiping this inspection", 'info');
                $timeout(function () {
                    item.isInboxSelected = false;
                }, 1000);
            } else {
                return item;
            }
        });
        // Remove duplicate property
        $scope.selectedItemsToGetRoute = CommonService.sortObjArray($scope.selectedItemsToGetRoute, "propertyRSN");
        $scope.selectedItemsToGetRoute = CommonService.removeDuplicatesFromObjArray($scope.selectedItemsToGetRoute, "propertyRSN");

        if ($scope.selectedItemsToGetRoute.length > 0) {
            $rootScope.isItemSelected = false;

        } else {
            $rootScope.isItemSelected = true;
        }
    });
    $scope.$on("$destroy", function () {
        InboxItemSelected();
        NoDirectionFound();
    });

    //$scope.sortingLog = [];
    $scope.isStarted = false;
    $scope.sortableOptions = {
        'ui-floating': true,
        activate: function () {
            console.log("activate");
        },
        beforeStop: function () {
            console.log("beforeStop");
        },
        change: function () {
            console.log("change");
        },
        create: function () {
            console.log("create");
        },
        deactivate: function () {
            console.log("deactivate");
        },
        out: function () {
            console.log("out");
        },
        over: function () {
            console.log("over");
        },
        receive: function () {
            console.log("receive");
        },
        remove: function () {
            console.log("remove");
        },
        sort: function () {
            console.log("sort");
        },
        start: function (e, ui) {
            console.log("start");
            //$(ui.item).addClass("highlight");
            //$scope.isStarted = true;
        },
        update: function (e, ui) {
            console.log("update");
            var logEntry = tmpList.map(function (i) {
                return i.value;
            }).join(', ');
        },
        stop: function (e, ui) {
            console.log("stop");
            //$scope.isStarted = false;
            //$(ui.item).removeClass("highlight");
            // this callback has the changed model
            var logEntry = tmpList.map(function (i) {
                return i.value;
            }).join(', ');
        }
    };

    $scope.calculateHybridRoute = function () {
        $scope.calculateAndDisplayPriorityRoute();
        $scope.fromwhere = "hybrid";
        $("#hybridRoutingModal").modal({ backdrop: 'static', keyboard: false });

    }
    $scope.calculateHybridRouteFinal = function () {
        //var aa = $scope.selectedItemsToGetRoute;
        ////alert();
        CommonService.broadcastCalculateAndDisplayRoute({ selecteditems: $scope.selectedItemsToGetRoute, fromwhere: "hybrid" });
        $("#hybridRoutingModal").modal("hide");
        $rootScope.iscliked = false;
        $rootScope.isRouteGenerated = true;
        $scope.fromwhere = "hybrid";
    }
    $scope.availablePropertyAddress = [];
    $scope.sortableOptionsPropertyAddress = {
        'ui-floating': true,
        activate: function () {
            console.log("activate");
        },
        beforeStop: function () {
            console.log("beforeStop");
        },
        change: function () {
            console.log("change");
        },
        create: function () {
            console.log("create");
        },
        deactivate: function () {
            console.log("deactivate");
        },
        out: function () {
            console.log("out");
        },
        over: function () {
            console.log("over");
        },
        receive: function () {
            console.log("receive");
        },
        remove: function () {
            console.log("remove");
        },
        sort: function () {
            console.log("sort");
        },
        start: function (e, ui) {
            console.log("start");
            //$(ui.item).addClass("highlight");
            //$scope.isStarted = true;
        },
        update: function (e, ui) {
            console.log("update");
            var logEntry = tmpList.map(function (i) {
                return i.value;
            }).join(', ');
        },
        stop: function (e, ui) {
            console.log("stop");
            //$scope.isStarted = false;
            //$(ui.item).removeClass("highlight");
            // this callback has the changed model
            var logEntry = tmpList.map(function (i) {
                return i.value;
            }).join(', ');
        }
    };

});