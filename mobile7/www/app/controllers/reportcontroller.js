app.controller('ReportCtrl', function ($scope, $compile, $timeout, $filter, utilService, dataLayerService) {
    $scope.isDownloadable = false;
    $scope.reportVar = {
        selectReportName: '',
        deficiencyList: [],
        checkList: []
    };
    $scope.drawImage = function (data) {
        $scope.signatureImageData = "data:image/png;base64," + data;
         
    };
    $scope.openReport = function () {
        if ($scope.selectedReport !== undefined && $scope.selectedReport !== null) {

            dataLayerService.getReport($scope.selectedReport).then(function (result) {
                $scope.reportVar.selectReportName = "-" + $scope.selectedReport.reportName;
                angular.element('#displayreportsection').html(result.data[0].reporttemplate);

                return dataLayerService.getDeficiencyForReport($scope.selectedReport.processRSN);
            }).then(function (result) {
                $scope.reportVar.deficiencyList = [];
                if (result.data != null && result.data.length > 0) {
                    for (var i = 0; i < result.data.length; i++) {
                        var values = result.data[i];
                        $scope.reportVar.deficiencyList.push(values);
                    }
                }
                return dataLayerService.getFolderProcessChecklistData($scope.selectedReport);
            }).then(function (result) {
                $scope.reportVar.checkList = [];
                if (result.data != null && result.data.length > 0) {
                    for (var i = 0; i < result.data.length; i++) {
                        var values = result.data[i];
                        $scope.reportVar.checkList.push(values);
                    }
                }
                return dataLayerService.getSignatureForReport($scope.selectedReport.processId);
            }).then(function (result) {
                if (result.data && result.data.length > 0) {
                    $scope.drawImage(result.data);
                } else {
                    $scope.drawImage("");
                }
                return dataLayerService.getReportData($scope.selectedReport.processRSN, $scope.selectedReport.reportName, $scope.selectedReport.processId);
            }).then(function (result) {
                if (result && result.isReportAttached) {
                    $filter('filter')($scope.reportList, { reportName: $scope.selectedReport.reportName }, true)[0].isAttached = result.isReportAttached;
                    $scope.isDownloadable = true;
                } else {
                    $scope.isDownloadable = false;
                }
                $compile(angular.element('#allReportSection').contents())($scope);

                 

                $timeout(function () {
                    var docHeight = $(document).height();
                    var topHeaderheight = angular.element("#topheader").height();
                    var inboxHeaderHeight = angular.element("#inboxheader").height();
                    var reportultabHeight = angular.element("#reportultab").height();
                    var reporttoolbarHeight = angular.element("#reporttoolbar").outerHeight() + 15;
                    var footerHeight =10;//angular.element("#footer").height();
                    var heighttoset = docHeight - (topHeaderheight + inboxHeaderHeight + footerHeight + reportultabHeight + reporttoolbarHeight);
                    angular.element(".scroll").mCustomScrollbar({
                        setHeight: heighttoset,
                        theme: "3d-dark"
                    });
                }, 1000, true);
            }).catch(function (error) {
                utilService.logtoConsole(error);
            });

        } else {
            utilService.showError("Please select a report to preview", "info");
        }

    };

    $scope.selectReport = function (item, rptname) {
        $scope.selectedReport = item;
        $scope.selectedReport.reportName = rptname;
        $(event.currentTarget.parentElement.parentElement).addClass('highlight-row').siblings().removeClass('highlight-row');
    };
    $scope.attachReport = function () {
        var pdf = new jsPDF('p', 'pt', 'a4');
        var height = $('#allReportSection').height();
        var width = $('#allReportSection').width() + $('#allReportSection').offset().left;
        var acwidth = $('#allReportSection').width();
        pdf.addHTML($('#allReportSection').get(0),
            {
                dim: { h: height, w: acwidth },
                background: '#fff',
                height: height,
                width: width,
                pagesplit: true
            }, function (result) {
                var stringdata = pdf.output('datauristring');
                if (stringdata != null);
                {
                    stringdata = stringdata.replace("data:application/pdf;base64,", "");
                    dataLayerService.saveUpdateReportData($scope.selectedReport.processRSN, 0, $scope.selectedReport.reportName, stringdata, $scope.selectedReport.processId).then(function (result) {
                        if (result && result.result.isSuccess) {
                            $filter('filter')($scope.reportList, { reportName: $scope.selectedReport.reportName }, true)[0].isAttached = true;

                            $scope.isDownloadable = true;
                        } else {
                            utilService.showError("Unable to save signature, check log", 'error');
                        }
                    });
                }

            });
    };

    $scope.downloadReport = function () {
        dataLayerService.getReportData($scope.selectedReport.processRSN, $scope.selectedReport.reportName, $scope.selectedReport.processId).then(
           function (result) {
               if (result && result.reportData && result.reportData.length > 0) {
                   var fileName = $scope.selectedReport.processRSN + '_' + $scope.selectedReport.reportName + '.pdf';
                   window.open(result.reportData, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
               } else {
                   utilService.logtoConsole('pdf data not found for ' + $scope.selectedReport.processRSN + '  AND ' + $scope.selectedReport.reportName);
               }
           });
    };

    $scope.deleteReport = function (selectedInboxItem, reportname) {
        dataLayerService.deleteReportData(selectedInboxItem.processRSN, reportname, $scope.selectedReport.processId).then(
             function (result) {
                 if (result && result.isSuccess === true) {
                     $scope.isDownloadable = false;
                     return dataLayerService.getReportData(selectedInboxItem.processRSN, reportname);
                 } else {
                     utilService.logtoConsole('pdf data not delete for' + selectedInboxItem.processRSN + '  AND ' + reportname);
                 }
             }).then(function (result) {
                 if (result) {
                     $filter('filter')($scope.reportList, { reportName: reportname }, true)[0].isAttached = result.isReportAttached;
                 }
             })
            .catch(function (error) {
                utilService.logtoConsole(error, "error");
                utilService.showError("Unexpected  error occured while validating user", 'error');
            });
    }
    $scope.backReport = function () {
        $('a[href="#reportcatalogue"]').trigger('click');
    }
    $scope.emailReport = function () {
        utilService.showError("Development in progress.", "info");
    }
    $scope.printReport = function () {
        utilService.showError("Development in progress.", "info");
    }
});