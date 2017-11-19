app.directive("ngTouchstart", function () {
    return {
        controller: [
            "$scope", "$element", function ($scope, $element) {

                $element.bind("touchstart", onTouchStart);

                function onTouchStart(event) {
                    var method = $element.attr("ng-touchstart");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

            }
        ]
    }
});

app.directive("ngTouchmove", function () {
    return {
        controller: [
            "$scope", "$element", function ($scope, $element) {

                $element.bind("touchstart", onTouchStart);

                function onTouchStart(event) {
                    event.preventDefault();
                    $element.bind("touchmove", onTouchMove);
                    $element.bind("touchend", onTouchEnd);
                }

                function onTouchMove(event) {
                    var method = $element.attr("ng-touchmove");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

                function onTouchEnd(event) {
                    event.preventDefault();
                    $element.unbind("touchmove", onTouchMove);
                    $element.unbind("touchend", onTouchEnd);
                }

            }
        ]
    }
});

app.directive("ngTouchend", function () {
    return {
        controller: [
            "$scope", "$element", function ($scope, $element) {

                $element.bind("touchend", onTouchEnd);

                function onTouchEnd(event) {
                    var method = $element.attr("ng-touchend");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

            }
        ]
    }
});

app.directive("ngClickstart", function () {
    return {
        controller: [
            "$scope", "$element", function ($scope, $element) {

                $element.bind("clickstart", onClickStart);

                function onClickStart(event) {
                    var method = $element.attr("ng-clickstart");
                    $scope.$event = event;
                    $scope.$apply(method);
                }

            }
        ]
    }
});

app.factory('drawingHelper', function () {

    return {
        draw: function (px, py, x, y) {
            var canvas = document.getElementById("canvas");
            if (canvas && canvas.getContext) {
                var ctx = canvas.getContext("2d");

                ctx.strokeStyle = "rgb(0,0,100)";
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();

            }
            var canvasInput = document.getElementById("canvasInput");
            if (canvasInput && canvasInput.getContext) {
                var ctx = canvasInput.getContext("2d");

                ctx.strokeStyle = "rgb(0,0,100)";
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();

            }
        },

        beginPath: function (id) {
            var canvas = document.getElementById(id);
            if (canvas && canvas.getContext) {
                var ctx = canvas.getContext("2d");
                ctx.lineWidth = 2;
                ctx.beginPath();
            }

        },

        getXY: function (dom) {
            var rect = dom.getBoundingClientRect(),
                round = Math.round;
            //return [round(rect.left), round(rect.top)];
            return [round(rect.left + window.pageXOffset), round(rect.top + window.pageYOffset)];
        },

        getDom: function (id) {
            var canvas = document.getElementById(id);
            return canvas;
        },

        getImageData: function (id) {
            var canvas = document.getElementById(id);
            var dataurl = canvas.toDataURL();
            dataurl = dataurl.substr(dataurl.indexOf('base64,') + 7);
            return dataurl;
        },

        clearImage: function (id) {
            var canvas = document.getElementById(id);
            if (canvas && canvas.getContext) {
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
            }
        },

        drawImage: function (data, id) {

            var canvas = document.getElementById(id);
            if (canvas && canvas.getContext) {
                var context = canvas.getContext("2d");
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.beginPath();
                if (data.length > 0) {
                    var imageUrl = "data:image/png;base64," + data;
                    var imgObj = new Image();
                    imgObj.onload = function () {
                        context.drawImage(this, 0, 0, canvas.width, canvas.height);
                        context.beginPath();
                    };
                    imgObj.src = imageUrl;
                }
            }
        }
    }
});


app.controller('SignCtrl', function ($scope, drawingHelper, $window, utilService, dataLayerService, $timeout, $rootScope) {
    var  signatureType = '';

    var wrapper = document.getElementById("signature-pad");
    var canvas = wrapper.querySelector("canvas");
    var signaturePad = new SignaturePad(canvas);


    $scope.mouseup = function (evt, processInfo) {
        //utilService.logtoConsole(evt.type);
        var processInfo = processInfo;
        if (processInfo === undefined) {
            if (!signatureType) {
                $timeout(function () {
                    $('#signatureModal').modal('hide');
                }, 100);
                utilService.showError("Please select signatute type.", "info");
            } else {
                $timeout(function () {
                    $('#signatureModal').modal('show');
                }, 500);

            }
            return;
        }

    }
    $scope.clearImage = function (processInfo) {
        dataLayerService.deleteSignature(processInfo.ProcessRSN, processInfo.AttemptId, signatureType, '', processInfo.ProcessId, "Picture").then(
            function (result) {
                if (result && result.result.isSuccess) {
                    drawingHelper.clearImage("canvas");
                    signaturePad.clear();
                    var scope = angular.element('[ng-controller=AttachmentTabCtrl]').scope()
                    scope.getAttachment($rootScope.ProcessFolderRSN);
                } else {
                    utilService.showError("Unable to remove signature, check log", 'error');
                }
            });
    }
    $scope.saveImage = function (processInfo) {
        if (signaturePad.isEmpty()) {
            utilService.showError("Please provide signature first.", "info");
        } else {
            var base64String = signaturePad.toDataURL();
            base64String = base64String.substr(base64String.indexOf('base64,') + 7)
            dataLayerService.updateSignature(processInfo.ProcessRSN, processInfo.AttemptId, processInfo.AttemptSignType, base64String, processInfo.ProcessId,"Picture").then(
                function (result) {
                    if (result && result.result && result.result.isSuccess) {
                        utilService.showError("Signature saved successfully.", 'success');
                        var scope = angular.element('[ng-controller=AttachmentTabCtrl]').scope()
                        scope.getAttachment($rootScope.ProcessFolderRSN);

                        drawingHelper.drawImage(base64String, "canvas");
                    } else {
                        utilService.showError("Unable to save signature, check log", 'error');
                    }
                    $('#signatureModal').modal('hide');
                });
        }
    }

    $scope.$on('SignatureChanged', function (event, processInfo) {
        $scope.processInfo = processInfo;
        signatureType = processInfo.AttemptSignType;
        utilService.logtoConsole(signatureType);
        dataLayerService.getSignature(processInfo.AttemptId, signatureType).then(
            function (result) {
                if (result && result.result.signature && result.result.signature.length > 0) {
                    drawingHelper.drawImage(result.result.signature, "canvas");
                    drawingHelper.drawImage(result.result.signature, "canvasInput");
                } else {
                    drawingHelper.drawImage(result.result, "canvas");
                    drawingHelper.drawImage(result.result, "canvasInput");
                    utilService.logtoConsole('signature data not found for ' + signatureType);
                }
            });
    });


    $scope.$on("onClearImage", function (event, data) {
        if (data) {
            $scope.clearImage(data.processinfo);
        }
    });
    $scope.$on("onSaveImage", function (event, data) {
        if (data) {
            $scope.saveImage(data.processinfo);
        }
    });


});