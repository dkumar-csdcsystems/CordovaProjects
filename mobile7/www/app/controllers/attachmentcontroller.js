app.controller('AttachmentTabCtrl', function ($scope, $rootScope, $window, dataLayerService, utilService, requetBuilderService, requestHelperService, CommonService, $timeout, drawingHelper) {

    $scope.attachmentaddsection = false;
    $scope.toggleplusminus = false;
    $scope.addAttachment = function () {
        $scope.fromwhere = 'add';
        $scope.toggleplusminus = true;
        $scope.attachmentaddsection = true;
        $timeout(function () {
            $scope.description = '';
            $scope.details = '';
            $scope.fileName = '';
            $scope.fileType = '';
            $scope.fileBlob = '';
            $scope.selectedpath = '';
            $scope.selectedOption = 0,

            angular.element('#i_file').blur(function (event) {
                $timeout(function (event) {
                    if (event.target.files[0]) {
                        var tmppath = URL.createObjectURL(event.target.files[0]);//not in use
                        $scope.fileName = event.target.files[0].name;
                        $scope.fileType = event.target.files[0].type;
                        $scope.selectedpath = "Temp [ " + tmppath + " ]";
                        var extension = $scope.fileName.split('.').pop().toLowerCase();
                        if (event.target.files && event.target.files[0]) {
                            var FR = new FileReader();
                            FR.onload = function (e) {
                                switch (extension) {
                                    case 'doc':
                                    case 'docx':
                                    case 'rtf':
                                    case 'xls':
                                    case 'xlsx':
                                    case 'png':
                                    case 'jpg':
                                    case 'bmp':
                                    case 'jpeg':
                                    case 'gif':
                                    case 'txt':
                                    case 'pdf':
                                        //$scope.errorMessage = '';
                                        $scope.fileBlob = e.target.result;
                                        utilService.showError("File size is " + ((event.target.files[0].size / 1024) / 1024).toFixed(2) + " MB", "info");
                                        $scope.$digest();
                                        break;
                                    default:
                                        //$scope.errorMessage = 'File format not supported.';
                                        utilService.showError('File format not supported.', "info");
                                        $scope.selectedpath = "";
                                        $scope.fileName = "";
                                        break;
                                }

                            };
                            FR.readAsDataURL(event.target.files[0]);
                        }
                    }
                }, 100, false, event);

            });
        })

    }

    $scope.saveAttachment = function (processFolderRSN) {

        if ($scope.fileType !== '' && $scope.fileType != undefined && $scope.fileName !== '' && $scope.fileName != undefined) {
            if ($scope.extension === '' || $scope.extension === undefined) {
                $scope.extension = $scope.fileName.split('.').pop().toLowerCase();
            }
            switch ($scope.extension) {
                case 'doc':
                case 'docx':
                case 'rtf':
                case 'xls':
                case 'xlsx':
                case 'jpg':
                case 'png':
                case 'jpeg':
                case 'gif':
                case 'bmp':
                case 'txt':
                case 'pdf':
                    var errorMessage = '';
                    $scope.fileBlob = $scope.fileBlob.replace("data:" + $scope.fileType + ";base64,", "");
                    var attachmentData = {
                        TableRSN: processFolderRSN.processRSN,
                        AttachmentRSN: 0,
                        AttachmentDesc: $scope.description,
                        AttachmentDetails: $scope.details,
                        AttachmentFileAlias: $scope.fileName,
                        AttachmentFileSuffix: $scope.extension,
                        AttachmentFileContentType: $scope.fileType,
                        TableName: 'FOLDER_PROCESS',
                        AttachmentCode: $scope.selectedOption,
                        AttachmentBlob: $scope.fileBlob,
                        IsNew: 'Y',
                        IsEdited: ''
                    }
                    dataLayerService.insertAttachment(attachmentData).then(function (result) {
                        var res = result.data;
                        if (result.data && result.data.length > 0) {
                            $scope.getAttachment(processFolderRSN);
                            $scope.cancelAttachment();
                        }
                    });

                    break;
                default:
                    utilService.showError('File format not supported.', 'error');
                    break;
            }
        }
        else {
            if ($scope.selectedOption === 0)
                utilService.showError('Please select attachment type. ', 'error');
            else
                utilService.showError('Please browse/capture a file to upload', 'error');
            $scope.description = '';
            $scope.details = '';
            $scope.fileName = '';
            $scope.fileType = '';
            $scope.selectedOption = 0;
            $scope.fileBlob = '';
            $scope.selectedpath = '';
        }

    }
    $scope.updateAttachment = function (processFolderRSN) {
        var attachmentData = {
            AttachmentDesc: $scope.description,
            AttachmentDetails: $scope.details,
            AttachmentCode: $scope.selectedOption,
            IsEdited: 'Y',
            Id: $scope.attachmentrowid
        }
        dataLayerService.updateAttachment(attachmentData).then(function (result) {
            var res = result.data;
            if (result.data && result.data.length > 0) {
                $scope.getAttachment(processFolderRSN);
                $scope.cancelAttachment();
            }
        });

    }
    $scope.getAttachment = function (processFolderRSN) {
        dataLayerService.getAllAttachment(processFolderRSN).then(function (response) {
            $rootScope.ProcessFolderRSN = processFolderRSN;
            $scope.attachmentInfoList = [];
            if (response.data && response.data.length > 0) {
                var collapseId = 0;
                for (var k = 0 ; k < response.data.length; k++) {
                    var groupType = (response.data[k].attachmenttypedesc === null || response.data[k].attachmenttypedesc === "" || response.data[k].attachmenttypedesc === undefined) ? "Ungrouped Attachment" : response.data[k].attachmenttypedesc;
                    var grp = $.grep($scope.attachmentInfoList, function (n, idx) {
                        if (n.key === groupType) return n;
                    });

                    if (grp.length > 0) {
                        grp[0].items.push(response.data[k]);
                        grp[0].itemlength = ++itemlength;
                    }
                    else {
                        var itemlength = 0;
                        $scope.attachmentInfoList.push({ key: groupType, items: [response.data[k]], dataCollapse: collapseId, itemlength: ++itemlength });
                        collapseId++;
                    }
                }
                // Geting the index controller scope to update the value;
                var scope = angular.element('[ng-controller=IndexCtrl]').scope()
                scope.attachmentcount = "(" + response.data.length + ")";
                scope.attachmentInfoList = $scope.attachmentInfoList;
            }
            if (response.data.length > 0)
                $scope.showheader = true;
            else
                $scope.showheader = false;

        });
    }
    $scope.cancelAttachment = function () {
        $timeout(function () {
            $scope.description = '',
                  $scope.details = '',
                  $scope.fileName = '',
                  $scope.fileType = '',
                  $scope.selectedOption = 0,
                  $scope.fileBlob = '',
                  $scope.errorMessage = '',
                  $scope.selectedpath = '',
                  $scope.attachmentaddsection = false;
            $scope.toggleplusminus = false;
        }, 100);

    }

    $scope.deleteAttachment = function (dataToDelete) {
        if (dataToDelete.attachmentrsn === 0) {
            dataLayerService.deleteAttachment(dataToDelete).then(function (response) {
                if (response.data && response.data.length > 0) {
                    $scope.getAttachment($rootScope.ProcessFolderRSN);

                    var scope = angular.element('[ng-controller=SignCtrl]').scope()
                    scope.clearImage(scope.processInfo);
                }
                $scope.cancelAttachment();

            });
        } else {
            utilService.showError("Saved attachedment in back office can not be deleted.", "info");
        }
    }
    $scope.openAttachment = function (dataToOpen) {

        if (dataToOpen.blob != null && dataToOpen.blob != "" && dataToOpen.blob != undefined) {
            var extension = dataToOpen.attachmentfilesuffix;
            if (extension)
                extension = extension.toLowerCase();
            if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'bmp') {
                //var image = new Image();
                var src = "data:image/" + extension + ";base64," + dataToOpen.blob;
                window.open(src, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
            }
            else if (extension === "pdf") {
                window.open("data:application/pdf;base64," + dataToOpen.blob, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
            }
            else if (extension === "txt") {
                var blob = new Blob([dataToOpen.blob], { type: 'text/plain' });
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = dataToOpen.attachmentfilealias;
                document.body.appendChild(a);
                a.click();
            }
            else if (extension === "rtf") {
                var blob = new Blob([dataToOpen.blob], { type: 'text/richtext"' });
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = dataToOpen.attachmentfilealias;
                document.body.appendChild(a);
                a.click();
            }
            else if (extension === "doc" || extension === "docx") {
                var blob = new Blob([dataToOpen.blob], { type: 'application/vnd.ms-word' });
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = dataToOpen.attachmentfilealias;
                document.body.appendChild(a);
                a.click();
            }
            else if (strExtenstion == "xls" || strExtenstion == "xlsx") {
                var blob = new Blob([dataToOpen.blob], { type: 'application/vnd.ms-excel' });
                var downloadUrl = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = downloadUrl;
                a.download = dataToOpen.attachmentfilealias;
                document.body.appendChild(a);
                a.click();
            }
            else {
                utilService.showError("Can't open this document", "info");
            }
            return;
        }
        else {
            if (dataToOpen.attachmentrsn !== 0) {
                $scope.downloadAttachment(dataToOpen.attachmentrsn);
            }
            else {
                utilService.showError("Can't open this document", "info");
            }
        }
        //dataLayerService.getAttachmentById($rootScope.ProcessFolderRSN).then(function (response) {
        //    if (response.data && response.data.length > 0 && response.data[0].blob !== null && response.data[0].blob !== "") {
        //        var extension = response.data[0].attachmentfilesuffix;
        //        if (extension)
        //            extension = extension.toLowerCase();

        //        if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'gif' || extension === 'bmp') {
        //            //var image = new Image();
        //            var src = "data:image/" + extension + ";base64," + response.data[0].blob;
        //            window.open(src, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
        //            //w.document.write(image.outerHTML);
        //        }
        //        else if (extension === "pdf") {
        //            window.open("data:application/pdf;base64," + response.data[0].blob, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
        //        }
        //        else if (extension === "txt") {
        //            var blob = new Blob([dataToOpen.blob], { type: 'text/plain' });
        //            var downloadUrl = URL.createObjectURL(blob);
        //            var a = document.createElement("a");
        //            a.href = downloadUrl;
        //            a.download = dataToOpen.attachmentfilealias;
        //            document.body.appendChild(a);
        //            a.click();
        //        }
        //        else if (extension === "rtf") {
        //            var blob = new Blob([dataToOpen.blob], { type: 'text/richtext"' });
        //            var downloadUrl = URL.createObjectURL(blob);
        //            var a = document.createElement("a");
        //            a.href = downloadUrl;
        //            a.download = dataToOpen.attachmentfilealias;
        //            document.body.appendChild(a);
        //            a.click();
        //        }
        //        else if (extension === "doc" || extension === "docx") {
        //            var blob = new Blob([dataToOpen.blob], { type: 'application/vnd.ms-word' });
        //            var downloadUrl = URL.createObjectURL(blob);
        //            var a = document.createElement("a");
        //            a.href = downloadUrl;
        //            a.download = dataToOpen.attachmentfilealias;
        //            document.body.appendChild(a);
        //            a.click();
        //        }
        //        else if (strExtenstion == "xls" || strExtenstion == "xlsx") {
        //            var blob = new Blob([dataToOpen.blob], { type: 'application/vnd.ms-excel' });
        //            var downloadUrl = URL.createObjectURL(blob);
        //            var a = document.createElement("a");
        //            a.href = downloadUrl;
        //            a.download = dataToOpen.attachmentfilealias;
        //            document.body.appendChild(a);
        //            a.click();
        //        } else {
        //            utilService.showError("Can't open this document", "info");
        //        }
        //    }
        //    else {
        //        if (dataToOpen.attachmentrsn !== 0) {
        //            $scope.downloadAttachment(dataToOpen.attachmentrsn);
        //        }
        //        else {
        //            utilService.showError("Can't open this document", "info");
        //        }
        //    }

        //});

    }
    $scope.downloadAttachment = function (attachmentrsn) {

        var storedUser = localStorage.getItem("userSettings") !== "undefined" ? JSON.parse(localStorage.getItem("userSettings")) : [];
        if ($.isArray(storedUser) && storedUser.length > 0) {
            $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
            $scope.password = storedUser[0].password;
            requestHelperService.ExecuteServiceLoginRequest($scope.username, $scope.password, $scope, function (result) {
                if (result.error == null) {
                    if (result.response) {
                        if (result.response.lid === "" || result.response.lid == null || result.response.lid.indexOf("Invalid") > 0 || result.response.lid.indexOf("</html>") > 0) {
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
                            var settings = JSON.parse(localStorage.getItem("serverSettings"));
                            var url = settings[0].Host + "_AttachmentDownload.jsp?attachmentRSN=" + attachmentrsn + "&lid=" + result.response.lid;
                            var childwindow = window.open(url, "_blank", 'location=no,closebuttoncaption=Back to Inspector App');
                            childwindow.onunload = function () {
                                //Call logoff request
                                requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                                    utilService.logtoConsole("logoff response: " + result.response);
                                }, "json");
                                console.log('Child window closed');
                            };
                            // Call logoff request
                            //requestHelperService.ExecuteServiceLogoutRequest($scope, function (logoffresult) {
                            //    utilService.logtoConsole("logoff response: " + result.response);
                            //}, "json");
                        }
                    }
                }
            }, "json");
        } else {
            utilService.showError("Authentication failed.</br> Please logoff and login again.", 'error');
        }




    }

    $scope.editAttachment = function (dataToEdit) {
        $scope.description = dataToEdit.desc;
        $scope.details = dataToEdit.attachmentdetail;
        $scope.selectedOption = dataToEdit.attchmentcode === undefined ? "" : dataToEdit.attchmentcode;
        //$scope.errorMessage = '';
        $scope.selectedpath = '';
        $scope.attachmentaddsection = true;
        $scope.fromwhere = 'edit';
        $scope.attachmentrowid = dataToEdit.attachmentrowid;
    }
    $scope.onCapture = function (fromwhere) {
        if (navigator.camera) {
            var onSuccess = utilService.bind(this.onPhotoSuccess, this);
            var onError = utilService.bind(this.onFail, this);
            //navigator.device.capture.captureImage( onSuccess, onError, {limit : 1} );

            if (fromwhere === "camera") {
                navigator.camera.getPicture(onSuccess, onError,
                    {
                        quality: 50,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: Camera.EncodingType.PNG,
                        targetWidth: 800,
                        targetHeight: 600,
                        saveToPhotoAlbum: true
                    });
            }
            else if (fromwhere === "gallary") {
                navigator.camera.getPicture(onSuccess, onError,
                    {
                        quality: 50,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        encodingType: Camera.EncodingType.PNG,
                        targetWidth: 800,
                        targetHeight: 600,
                        saveToPhotoAlbum: false
                    });
            }
        } else {

        }
    }

    $scope.onPhotoSuccess = function (uri) {


        var lastSlash, name;
        lastSlash = uri.lastIndexOf("/");
        name = uri.substring(lastSlash + 1);
        if (name.indexOf("?") > 0) {
            name = name.substring(name.indexOf("?") + 1);
        }
        console.log('adding image to store');

        var model;
        if (name.indexOf('jpg') >= 0) {
            model = {
                name: name,
                type: 'image/jpeg',
                lastModifiedDate: new Date(),
                fullPath: uri,
                extension: 'jpg'
            };
        } else if (name.indexOf('png') >= 0) {
            model = {
                name: name,
                type: 'image/png',
                detaillastModifiedDate: new Date(),
                fullPath: uri,
                extension: 'png'
            };
        } else {
            name = name + ".png";
            model = {
                name: name,
                type: 'image/png',
                lastModifiedDate: new Date(),
                fullPath: uri,
                extension: 'png'
            };
        }
        this.getAttachmentDetail(model);
    }
    $scope.onFail = function (message) {
        /* setTimeout(function () {
             alert('Failed because: ' + message);
         }, 100);*/
        console.log(message);
    }
    $scope.getAttachmentDetail = function (mediafile) {
        console.log("Get File:" + mediafile.fullPath);
        var onResolveSuccess = utilService.bind(this.resolveSuccess, { scope: this, record: mediafile });
        var onResolveError = utilService.bind(this.resolveFail, { scope: this, record: mediafile });
        try {
            window.resolveLocalFileSystemURI(mediafile.fullPath, onResolveSuccess, onResolveError);
        } catch (ex) {
            console.log("Error occurred window.resolveLocalFileSystemURI:" + ex.message);
        }

    }
    $scope.resolveFail = function (evt) {
        console.log("resolveFail: ", this.record.fullPath);
        console.log(evt.target.error.code);
        //CommonService.changeStatusMessage("file resolve failed with error code:" + evt.target.error.code);
        console.log("file resolve failed with error code:" + evt.target.error.code);

    }

    $scope.resolveSuccess = function (fileEntry) {
        console.log("resolveSuccess: " + this.record.fullPath);
        //CommonService.changeStatusMessage("file resolved successfully:" + this.record.fullPath);
        console.log("file resolved successfully:" + this.record.fullPath);


        try {
            var reader = new FileReader();
            reader.onloadend = utilService.bind(this.scope.fileLoaded, this);
            fileEntry.file(function (file) {
                reader.readAsDataURL(file);
            });

        } catch (ex) {
            console.log(ex.message);
            // CommonService.changeStatusMessage(ex.message);
        }

    }
    $scope.fileLoaded = function (evt) {
        console.log("fileLoaded: " + this.record.fullPath);

        if (evt.target.error == null) {
            try {
                var fileData = evt.target.result.substr(evt.target.result.indexOf('base64,') + 7);
                console.log("File Size:" + fileData.length);
                $scope.fileBlob = fileData;
                $scope.fileType = this.record.type;
                $scope.fileName = this.record.name;
                $scope.selectedpath = this.record.fullPath;
                $scope.extension = this.record.extension;

            } catch (ex) {
                console.log("file loaded: " + ex.message);
                //CommonService.changeStatusMessage(ex.message, "file loaded");
            }

        } else {
            console.log("file loaded: " + evt.target.error.code);
            //CommonService.changeStatusMessage(evt.target.error.code, "file loaded");
        }
    }
});