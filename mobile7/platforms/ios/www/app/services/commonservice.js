app.factory("CommonService", function ($rootScope, dbInitService, utilService) {
    dbInitService.initdatabase(function (result) {
        if (result.data.isSuccess === true) {
            utilService.showError("Application initialized.", "info");
        }
    }, this);
    return {
        LoggedUser: "",
        CurrentMode: "",
        ProcessId: -1,
        FolderId: -1,
        ProcessRSN: -1,
        FolderRSN: -1,
        getCurrentView: function () {
            return this.currentMode;
        },

        broadcastClearRoute: function () {
            $rootScope.$broadcast("onClearRoute");
        },
        broadcastInboxLoaded: function (data) {
            $rootScope.$broadcast("InboxLoaded", data);
        },

        broadcastInboxItemSelected: function (items) {
            $rootScope.$broadcast("InboxItemSelected", items);
        },

        broadCastSelecteItem: function (inboxItem, viewname) {
            this.CurrentMode = viewname;
            this.ProcessId = inboxItem.processId;
            this.FolderId = inboxItem.folderId;
            this.FolderRSN = inboxItem.folderRSN;
            this.ProcessRSN = inboxItem.processRSN;
            $rootScope.$broadcast("ViewChanged", inboxItem);
        },

        broadcastInboxItemSelectedFromMarker: function (item) {
            $rootScope.$broadcast("selectedRow", item);
        },

        broadcastStartPointOpenPopUp: function (startpointaddress) {
            $rootScope.$broadcast("onOpenPOPUpToAddStartPoint", startpointaddress);
        },
        broadcastEndPointOpenPopUp: function (endpointaddress) {
            $rootScope.$broadcast("onOpenPOPUpToAddEndPoint", endpointaddress);
        },

        broadcastClearStartPoint: function () {
            $rootScope.$broadcast("onClearStartPoint");
        },

        broadcastClearEndPoint: function () {
            $rootScope.$broadcast("onClearEndPoint");
        },

        broadcastSetStartPoint: function (startPoint) {
            $rootScope.$broadcast("onSetStartPoint", startPoint);
        },

        broadcastSetEndPoint: function (endPoint) {
            $rootScope.$broadcast("onSetEndPoint", endPoint);
        },

        broadcastCalculateAndDisplayRoute: function (data) {
            $rootScope.$broadcast("onCalculateAndDisplayRoute", data);
        },
        broadcastCreateMarkerItemSelected: function () {
            $rootScope.$broadcast("onCreateMarkerByItemSelected");
        },
        broadcastNavigate: function (data) {
            $rootScope.$broadcast("onNavigate", data);
        },

        changeStatusMessage: function (message) {
            $rootScope.$broadcast("ShowMesssage", message);
        },

        gotoView: function (viewname) {
            $rootScope.$broadcast("ChangeView", viewname);
        },

        resetOverlayHeight: function () {
            utilService.logtoConsole("dynamic height set .overlay", 'info');
            var docHeight = $(window).outerHeight();
            var topHeaderheight = angular.element("#topheader").outerHeight();
            var inboxHeaderHeight = angular.element("#inboxheader").outerHeight();

            angular.element('.overlay').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayCalendarView').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayAddFolder').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayEditInspection').innerHeight(docHeight - (topHeaderheight));

            angular.element('.overlayAddFolder').css("top", topHeaderheight);
            angular.element('.overlayCalendarView').css("top", topHeaderheight);
            angular.element('.overlayEditInspection').css("top", topHeaderheight);
        },

        setHeights: function () {
            utilService.logtoConsole("dynamic height set .scroll-2", 'info');
            var docHeight = $(window).outerHeight();
            var topHeaderheight = angular.element("#topheader").outerHeight();
            var inboxHeaderHeight = angular.element("#inboxheader").outerHeight();
            var footerHeight = 10;//angular.element("#footer").height();
            var navigateInboxPagesHeight = angular.element("#navigateInboxPages").height();
            var navigateOutboxPagesHeight = angular.element("#navigateOutboxPages").height();

            var heighttoset = docHeight - (topHeaderheight + inboxHeaderHeight + footerHeight + navigateInboxPagesHeight);

            angular.element(".scroll-2").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });


            angular.element("map").height(heighttoset + navigateInboxPagesHeight);
            angular.element("#divMap").height(heighttoset + navigateInboxPagesHeight);
            angular.element("#inlineWebContentIframe").height(heighttoset + navigateInboxPagesHeight);

            angular.element('.overlay').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayCalendarView').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayAddFolder').innerHeight(docHeight - (topHeaderheight));
            angular.element('.overlayAddFolder').css("top", topHeaderheight);
            angular.element('.overlayCalendarView').css("top", topHeaderheight);

            var projectviewcollapseall = angular.element("#projectviewcollapseall").outerHeight();
            if (projectviewcollapseall === 0) {
                projectviewcollapseall = 33;
            }

            var navigateProjectPagesHeight = angular.element("#navigateProjectPages").height();

            heighttoset = heighttoset - (projectviewcollapseall + 15 + 14);

            angular.element(".scroll-ProjectView").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });

            var headerheight = angular.element("#topheader").height();
            var ovarlayHeight = angular.element(".overlay").height();
            var tabbarheight = angular.element("#inspectiontabs").height();
            var footerHeight = 50;
            $("#attempt").find('.scroll').height(0)
            angular.element(".scroll").mCustomScrollbar({
                setHeight: (ovarlayHeight - (tabbarheight + footerHeight)),
                theme: "3d-dark"
            });
            $("#attempt").find('.scroll').height(ovarlayHeight - (tabbarheight + footerHeight))

        },
        setLoggedUser: function (username) {
            this.LoggedUser = username;
        },

        getLoggedUser: function () {
            if (this.LoggedUser === "") {
                var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                if ($.isArray(storedUser) && storedUser.length > 0) {
                    this.LoggedUser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                } else {
                    this.LoggedUser = "";
                }
            }
            return this.LoggedUser;
        },

        cleanNullValues: function (record) {
            for (var field in record) {
                if (record[field] === null || record[field] == "null") {
                    record[field] = "";
                }
            }
        },
        formatAddress: function () {
            var straddress = "";
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i]) {
                    if (arguments[i].toString() !== "" && arguments[i].toString() !== ",")
                        straddress += arguments[i].toString() + " ";
                    if (arguments[i].toString() === ",") {
                        straddress = straddress.trim();
                        straddress += arguments[i].toString() + " ";
                    }
                }
            }
            return straddress;
        },
        getDateFormat: function () {
            return "MMM DD, YYYY";
        },

        // sorts an array of objects according to one field
        // call like this: sortObjArray(myArray, "name" );
        // it will modify the input array
        sortObjArray: function (arr, field) {
            return arr.sort(
                  function compare(a, b) {
                      if (a[field] < b[field])
                          return -1;
                      if (a[field] > b[field])
                          return 1;
                      return 0;
                  }
              );
        },

        // call like this: uniqueDishes = removeDuplicatesFromObjArray(dishes, "dishName");
        // it will NOT modify the input array
        // input array MUST be sorted by the same field (asc or desc doesn't matter)
        removeDuplicatesFromObjArray: function (arr, field) {
            var u = [];
            arr.reduce(function (a, b) {
                if (a[field] !== b[field]) u.push(b);
                return b;
            }, []);
            return u;
        },
        getformattedAddress: function (addressrow) {
            var street = [], unit = [], location = [], address = [];
            street[0] = addressrow["prophouse"];
            street[1] = addressrow["propstreetprefix"];
            street[2] = addressrow["propstreet"];
            street[3] = addressrow["propstreettype"];
            street[4] = addressrow["propstreetdirection"];

            unit[0] = addressrow["propunittype"];
            unit[1] = addressrow["propunit"];

            location[0] = addressrow['propcity'];
            location[1] = addressrow['propprovince'];
            location[2] = addressrow['countydesc'];

            address[0] = utilService.joinWith(street, ' ');
            address[1] = utilService.joinWith(unit, ' ');
            address[2] = utilService.joinWith(location, ', ');

            return utilService.joinWith(address, ',');
        },
        getCustomToastrOptions: function () {
            return {
                "closeButton": false,
                "debug": true,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-bottom-center",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": 0,
                "extendedTimeOut": 0,
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut",
                "tapToDismiss": false
            };
        },
        getDefaultToastrOptions: function () {
            return {
                closeButton: false,
                positionClass: "toast-bottom-center",
                showDuration: 100,
                hideDuration: 100,
                timeOut: 3000,
                extendedTimeOut: 1000,
                showMethod: "fadeIn",
                hideMethod: "fadeOut"
            };
        }

    }
});