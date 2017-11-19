define(["angular", "toastr"], function (angular, toastr) {
    app.controller('EaiHistoryCtrl', function ($scope, dataLayerService, $filter, utilService, $timeout, CommonService) {

        $scope.$on("showEAIHistory", function (events) {
            $scope.onShowEAIHistory();

            var docHeight = $(document).height();
            var topHeaderheight = angular.element("#topheader").height();
            //var eaihistoryheader = angular.element("#eaihistoryheader").height();
            var inboxHeaderHeight = angular.element("#inboxheader").height();
            var footerHeight = 10;//angular.element("#footer").height();
            var navigateInboxPagesHeight = 0;// angular.element("#navigateInboxPages").height();
            var heighttoset = docHeight - (topHeaderheight + inboxHeaderHeight + footerHeight + navigateInboxPagesHeight);
            angular.element(".scroll-8").mCustomScrollbar({
                setHeight: heighttoset,
                theme: "3d-dark"
            });

            angular.element("#historylistrow").height(heighttoset - footerHeight);
            // Manual width set for Custom Scrollbar because scroll bar overlap the content
            angular.element(".scroll-8").find(".mCustomScrollBox").find(".mCSB_container").css("width", "99%")
        });

        $scope.onShowEAIHistory = function () {
            $scope.eaiHistoryList = [];
            dataLayerService.getEaiHistory().then(function (result) {
                var data = result.data;
                if (data != null) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.eaiHistoryList.push({
                            Id: data[i].id,
                            FolderRSN: data[i].folderrsn,
                            ProcessRSN: data[i].processrsn,
                            XmlRequest: data[i].request,
                            Response: data[i].response,
                            StampDate: data[i].stampdate,
                            isChecked: false
                        })
                    }
                }
                var headerheight = angular.element("#topheader").height();
                angular.element(".overlayEAIHistory").animate({
                    left: "0px",
                    top: headerheight + "px"
                }, 0);
            });
        }



        $scope.closeEaiHistoryPanel = function () {
            angular.element(".overlayEAIHistory").stop().show().animate({
                left: "-100%",
                display: "block"
            }, 500);
            $("#mySidenav").css("display", "block");
        }
        $scope.isAllChecked = false;
        $scope.checkAllEaiError = function () {
            if ($scope.eaiHistoryList) 
            {
                $scope.isAllChecked = !$scope.isAllChecked;
                $timeout(function () {
                    if ($scope.isAllChecked) {
                        $.map($scope.eaiHistoryList, function (item, ind) {
                            item.isChecked = true;
                        });
                    } else {
                        $.map($scope.eaiHistoryList, function (item, ind) {
                            item.isChecked = false;
                        });
                    }
                });
               
            }
        }
        $scope.deleteEaiHistory = function () {
            var tobedeleteobj = $filter('filter')($scope.eaiHistoryList, { isChecked: true }, true);
            if (tobedeleteobj.length > 0) {
                $timeout(function () {
                    toastr.options = CommonService.getCustomToastrOptions();
                    var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Yes</button>&nbsp;&nbsp;<button type='button' id='noConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>No</button></div>";
                    toastr.info(html, 'Are you sure, You want to delete selected sync errors', {
                        allowHtml: true,
                        onShown: function (html) {
                            $("#yesConfirm").on('click', function () {
                                var promisess = [];
                                for (var i = 0; i < tobedeleteobj.length; i++) {
                                    promisess.push(dataLayerService.deleteEaiHistory(tobedeleteobj[i]));
                                }
                                return Promise.all(promisess).then(function (result) {
                                    if ($filter('filter')(result, { data: 'success' }, true).length === tobedeleteobj.length) {
                                        utilService.showError("Selected sync error deleted successfully.", "success");
                                    } else {
                                        utilService.showError("Either one or more sync error could not deleted.", "error");
                                    }
                                    $scope.eaiHistoryList = [];
                                    dataLayerService.getEaiHistory().then(function (result) {
                                        var data = result.data;
                                        if (data != null) {
                                            for (var i = 0; i < data.length; i++) {
                                                $scope.eaiHistoryList.push({
                                                    Id: data[i].id,
                                                    FolderRSN: data[i].folderrsn,
                                                    ProcessRSN: data[i].processrsn,
                                                    XmlRequest: data[i].request,
                                                    Response: data[i].response,
                                                    StampDate: data[i].stampdate,
                                                    isChecked: false
                                                })
                                            }
                                        }
                                    });
                                }).catch(function (error) {
                                    utilService.showError("Sync error could not be deleted.", "error");
                                });
                            });
                            $("#noConfirm").on("click", function () {
                                toastr.remove();
                                toastr.options = CommonService.getDefaultToastrOptions();
                                return;
                            });
                        }
                    });
                }, 100, false);





            } else {
                utilService.showError("Please select atleast one sync error to delete.", "info");
            }
        }
        $scope.expandCollapseRequest = function (req, requestorresponse) {
            if ($(event.currentTarget).hasClass("xmlRequestCollapse")) {
                // $(event.currentTarget).removeClass("xmlRequestCollapse").addClass("xmlRequestExpand");
                $("#requestXmlModal").modal("show");
                //$scope.eaiRequestResponse = req;
                var scope = angular.element('[ng-controller=IndexCtrl]').scope()
                var docHeight = $(window).outerHeight();
                angular.element("#formattedxml").mCustomScrollbar({
                    setHeight: docHeight - 150,
                    theme: "3d-dark"
                });
                scope.requestOrResponse = requestorresponse;
                scope.eaiRequestResponse = formatXml(req);
            }
            else if ($(event.currentTarget).hasClass("xmlRequestExpand")) {
                $(event.currentTarget).removeClass("xmlRequestExpand").addClass("xmlRequestCollapse");
            }
        }
        function formatXml(xml) {
            var formatted = '';
            var reg = /(>)(<)(\/*)/g;
            xml = xml.replace(reg, '$1\r\n$2$3');
            var pad = 0;
            jQuery.each(xml.split('\r\n'), function (index, node) {
                var indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/)) {
                    if (pad != 0) {
                        pad -= 1;
                    }
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                var padding = '';
                for (var i = 0; i < pad; i++) {
                    padding += '  ';
                }

                formatted += padding + node + '\r\n';
                pad += indent;
            });

            return formatted;
        }
    });
});