var app = null;
define(["angular"], function (angular) {
    app = angular.module("Mobile7", ["ngRoute", "ngMap", "angular-loading-bar", "ui.sortable", "ui.bootstrap"]);

    app.config([
    'cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeBar = false;
    }
    ]);

    app.config([
        "$routeProvider", function ($routeProvider, $locationProvider) {
            $routeProvider
                .when("/main", {
                    templateUrl: "views/index.html",
                    controller: function ($scope, $timeout, CommonService, dataLayerService, $filter) {
                        $scope.username = "";
                        var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                        if ($.isArray(storedUser) && storedUser.length > 0) {
                            $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                        }

                        $scope.listInbox = [];
                        var startDate = "", endDate = "";
                        dataLayerService.getinboxlist(startDate, endDate, $scope.username).then(function (result) {
                            var data = result.data;
                            for (var i = 0; i < data.length; i++) {
                                var strScheduleendDate = '';
                                var strScheduleDate = '';
                                strScheduleDate = moment(data[i].scheduledate).format(CommonService.getDateFormat());
                                strScheduleendDate = moment(data[i].scheduleenddate).format(CommonService.getDateFormat());
                                var formattedaddress = CommonService.getformattedAddress(data[i]);
                                $scope.listInbox.push({
                                    folderNumber: String.format("{0}{1} {2} {3} {4} {5}", data[i].foldercentury, data[i].folderyear, data[i].foldersequence != null ? data[i].foldersequence.lpad("0", 6) : "000000", data[i].foldersection !== null ? data[i].foldersection.lpad("0", 3) : "000", data[i].folderrevision != null ? data[i].folderrevision.lpad("0", 2) : "00", data[i].foldertype),
                                    processType: data[i].processdesc,
                                    processTypeCode: data[i].processcode,
                                    scheduleDate: strScheduleDate,
                                    scheduleEndDate: strScheduleendDate,
                                    folderStatus: data[i].statusdesc,
                                    processComment: data[i].processcomment,
                                    folderRSN: data[i].folderrsn,
                                    propertyRSN: data[i].propertyrsn,
                                    propertyAddress: formattedaddress,
                                    processRSN: data[i].processrsn,
                                    folderType: data[i].foldertype,
                                    folderId: data[i].FolderId,
                                    processId: data[i].ProcessId,
                                    isMultiSignOffSelected: false,
                                    isOutboxSelected: false,
                                    isInboxSelected: false,
                                    isInboxDisabled: false,
                                    processPriority: data[i].priority,
                                    inspMinute: data[i].inspminute,
                                    isFailed: data[i].isfailed
                                });
                                //$scope.listInbox.sort(function (a, b) { return b.processPriority - a.processPriority });
                            }
                            $timeout(function (items) {
                                var validsiteoptions = dataLayerService.getSiteOptions();
                                var defaultCountry = $filter('filter')(validsiteoptions, { optionkey: "Default Country" }, true);
                                if (defaultCountry && defaultCountry.length > 0) {
                                    CommonService.broadcastInboxLoaded({ inboxitems: items, defaultcountry: defaultCountry[0].optionvalue });
                                }
                                var scope = angular.element('[ng-controller=IndexCtrl]').scope();
                                scope.checkIfProcessEditable();
                                scope.numPerPageInbox = 5;
                                scope.maxInboxSize = 3;
                                scope.bigTotalInboxItems = 0;
                                scope.bigInboxCurrentPage = 1;

                                if (items.length > scope.numPerPageInbox) {
                                    scope.bigTotalInboxItems = items.length;
                                    angular.element("#navigateInboxPages").css({
                                        display: "block"
                                    });
                                    scope.detectswipe('swipemeinbox', scope.calculatePaging);
                                }
                                //scope.$watch("bigInboxCurrentPage + numPerPageInbox", function () {
                                //    var begin = ((scope.bigInboxCurrentPage - 1) * scope.numPerPageInbox)
                                //    , end = begin + scope.numPerPageInbox;

                                //    scope.filteredInbox = items.slice(begin, end);
                                //});
                                CommonService.resetOverlayHeight();
                            }, 200, false, $scope.listInbox);
                        });
                    }
                })

                .when("/login", {
                    controller: "LoginCtrl",
                    templateUrl: "views/Updatedlogin.html"
                })
                .otherwise({ redirectTo: "/login" });
        }
    ]);

    app.filter('orderEmpty', function () {
        return function (array, key, type, selectedSortedColumns) {
            var present, empty, result;

            if (!angular.isArray(array)) return;

            if (key === undefined || key === "" || key === null) return;


            var isprocesspriority = selectedSortedColumns.filter(function (item) {
                return (item.value == "processPriority");
            });

            if (isprocesspriority.length <= 0) {
                return array;
            }
            else {
                key = "processPriority";
            }

            var isfolderStatus = selectedSortedColumns.filter(function (item) {
                return (item.value == "folderStatus");
            });

            if (isfolderStatus.length <= 0) {
                return array;
            }
            else {
                key = "folderStatus";
            }



            present = array.filter(function (item) {
                return item[key];
            });

            empty = array.filter(function (item) {
                return !item[key]
            });

            switch (type) {
                case 'toBottom':
                    result = present.concat(empty);
                    break;
                case 'toTop':
                    result = empty.concat(present);
                    break;
                default:
                    result = array;
                    break;
            }
            return result;
        };
    });
    Array.prototype.move = function (from, to) {
        this.splice(to, 0, this.splice(from, 1)[0]);
    };
    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    }

    String.prototype.lpad = function (padString, length) {
        var str = this;
        while (str.length < length)
            str = padString + str;
        return str;
    }

    String.prototype.rpad = function (padString, length) {
        var str = this;
        while (str.length < length)
            str = str + padString;
        return str;
    }

    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    String.prototype.startsWith = function (suffix) {
        return this.indexOf(suffix) === 0;
    };


    app.filter('unique', function () {

        return function (arr, field) {
            var o = {}, i, l = arr.length, r = [];
            for (i = 0; i < l; i += 1) {
                if (arr[i][field] !== "" && arr[i][field] !== undefined && arr[i][field] !== null)
                    o[arr[i][field]] = arr[i];
            }
            for (i in o) {
                r.push(o[i]);
            }
            return r;
        };
    });



    app.directive('addHtml', function ($compile) {
        return {
            restrict: 'AE',
            link: function ($rootScope, element, attrs) {
                var html = '<div class="dropdown pull-left" ng-controller="MapMenuCtrl"  id="custommapmenu" > ' +
               ' <div class="dropdown-toggle" onclick="$(' + "'.dropdown-backdrop1'" + ').remove();"  draggable="false" title="Show street map" style="direction: ltr; overflow: hidden; text-align: center; position: relative; color: rgb(0, 0, 0); font-family: Roboto, Arial, sans-serif; user-select: none; font-size: 11px; background-color: rgb(255, 255, 255); padding: 11px; border-bottom-left-radius: 2px; border-top-left-radius: 2px; -webkit-background-clip: padding-box; background-clip: padding-box; box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; min-width: 22px; font-weight: 500;" data-toggle="dropdown"> ' +
              ' Route' +
                ' </div> ' +
                ' <ul class="dropdown-menu" aria-labelledby="inboxOutboxDDM"> ' +
                '     <li ng-if="iscliked && !isItemSelected && !toggleoutboxdiv"><a style="cursor:pointer;padding: 10px 15px;" ng-click="calculateAndDisplayPriorityRoute()">Priority Routing</a></li> ' +
                '     <li class="divider" ng-if="iscliked && !isItemSelected && !toggleoutboxdiv"></li> ' +
                '     <li ng-if="iscliked && !isItemSelected && !toggleoutboxdiv"><a style="cursor:pointer;padding: 10px 15px;" ng-click="calculateAndDisplayOptimizedRoute()">Optimize Routing</a></li> ' +
                '     <li class="divider" ng-if="iscliked && !isItemSelected && !toggleoutboxdiv"></li> ' +
                '     <li ng-if="iscliked && !isItemSelected && !toggleoutboxdiv" ><a style="cursor:pointer;padding: 10px 15px;" ng-click="calculateHybridRoute()">Hybrid Routing</a></li> ' +
                '     <li class="divider" ng-if="iscliked && !isItemSelected && !toggleoutboxdiv"></li> ' +
                '     <li ng-if="iscliked && !isItemSelected && !toggleoutboxdiv" ><a style="cursor:pointer;padding: 10px 15px;" ng-click="calculateAndDisplayOptimizedRouteWithReverse()">Optimize-Reverse Routing</a></li> ' +

                '     <li ng-if="!iscliked && !toggleoutboxdiv"><a style="cursor:pointer;padding: 10px 15px;" ng-click="navigate()">Navigate</a></li> ' +
                '     <li class="divider" ng-if="!iscliked && !toggleoutboxdiv"></li> ' +
                '     <li ng-if="!iscliked && !toggleoutboxdiv"><a style="cursor:pointer;padding: 10px 15px;" ng-click="showDirectionSummary()">Direction Summary</a></li> ' +
                '     <li class="divider" ng-if="!iscliked && !toggleoutboxdiv"></li> ' +
                '     <li ng-if="!iscliked && !toggleoutboxdiv"><a style="cursor:pointer;padding: 10px 15px;" ng-click="clearRoute()">Clear Route</a></li> ' +
              
                ' </ul> ' +
           '  </div> ',
                compiledElement = $compile(html)($rootScope);

                element.on('click', function (event) {
                    if ($("#custommapmenu").length == 0) {
                        $('.gm-style-mtc').parent().append(compiledElement);
                    }
                    if ($rootScope.isItemSelected) {
                        $("#custommapmenu").remove();
                    }
                })
            }
        }
    });
});

