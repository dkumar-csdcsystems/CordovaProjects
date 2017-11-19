app.factory("requestHelperService", function (utilService, requetBuilderService, cfpLoadingBar) {
    return {
        ExecuteServiceLoginRequest: function (userid, password, scope, successcallback, format) {
            cfpLoadingBar.start();
            var loginRequest = requetBuilderService.GetLoginRequest(userid, password, scope);

            if (format) {
                loginRequest.format = format;
            } else {
                loginRequest.format = "text";
            }
            //Make here jQuery block function
            //Ext.Viewport.mask({ xtype: 'loadmask', message: 'Authanticating, Wait...' });

            var ajaxRequest = {
                url: loginRequest.url,
                method: loginRequest.method,
                context: loginRequest,
                success: this.Success,
                error: this.SilentFailure,
                data: this.toQueryString(loginRequest.data),
                //dataType: "jsonp",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8"
            }
            loginRequest.callbackContext = scope;
            loginRequest.successcallback = successcallback;
            loginRequest.failedcallback = successcallback;
            $.ajax(ajaxRequest);
        },

        toQueryString: function (jsonObject) {
            var items = [];
            for (var prop in jsonObject) {
                if (jsonObject.hasOwnProperty(prop)) {
                    if (jsonObject[prop] !== null && jsonObject[prop] !== "") {
                        items.push(String.format("{0}={1}", prop, window.encodeURI(jsonObject[prop])));
                    }
                }
            }
            return items.join("&");
        },

        Success: function (response, status, xhr) {
            var request = this;
            if (!request.keepmask) {
            }
            try {
                if (xhr) {
                    if (xhr.status === 204) {
                        request.successcallback.call(request.callbackContext, { response: null, request: request, error: null });
                    }
                    if (xhr.status === 200) {
                        if (request.format === "json") {
                            var rows = response.trim().split("Æ");
                            var cols = rows[0].trim().split("¥");
                            var respObject = null;
                            if (cols.length > 0) {
                                var data = {};
                                for (var i = 0; i < cols.length; i++) {
                                    if (i === 0)
                                        data.lid = cols[i];
                                    else if (i === 1)
                                        data.DateFormat = cols[1];
                                    else if (i === 2)
                                        data.DateTimeFormat = cols[2];
                                    else if (i === 3)
                                        data.validUser = cols[3];
                                    else if (i === 4)
                                        data.serverTimeStamp = cols[4];
                                }
                                respObject = JSON.stringify([
                                    {
                                        data: data,
                                        status: 200,
                                        error: ""
                                    }]
                                );
                            }
                            respObject = JSON.parse(respObject);
                            if (respObject !== null) {
                                if (request.successcallback) {
                                    if (respObject[0].error === "" && respObject[0].status === 200 && respObject[0].data) {
                                        request.successcallback.call(request.callbackContext, { response: respObject[0].data, request: request, error: null });
                                    }
                                } else {
                                    request.successcallback.call(request.callbackContext, { response: null, request: request, error: new Error(respObject.error) });
                                }
                            } else {
                                if (response) {
                                    utilService.logtoConsole(response);
                                }
                                throw new Error("Invalid response, Can't be parsed..");
                            }
                        } else {
                            if (request.successcallback) {
                                request.successcallback.call(request.callbackContext, { response: response, request: request, error: null });
                            }
                        }
                    } else {
                        if (responseText) {
                            throw new Error(String.format("Request failed with response: {0}", responseText));
                        }
                        throw new Error(String.format("Request failed with status: {0}", xhr.status));
                    }
                } else {
                    throw new Error(String.format("Request failed, no response received.."));
                }

            } catch (e) {
                utilService.logtoConsole(e);
                //if (request.successcallback) {
                //    request.successcallback.call(request.scope, { response: null, request: request, error: e });
                //}
                var message = e.message.substr(0, 100);
                //alert(message);
            }
            cfpLoadingBar.complete();

        },

        Failure: function (response, request) {
            var message;
            if (!request.keepmask) {
                //Ext.Viewport.unmask();
            }
            if (response && response.responseText && response.responseText.length > 0) {
                message = response.responseText.substr(0, 100);
                //alert(message);
            } else {
                message = "Unable to Load: " + request.url;
                //alert(message);
            }

            if (request.failedcallback) {
                request.failedcallback.call(request.scope, { response: null, request: request, error: new Error(message) });
            }
            cfpLoadingBar.complete();
        },

        SilentFailure: function (response, status, error) {
            var request = this;
            var message;
            if (response && response.responseText && response.responseText.length > 0) {
                utilService.logtoConsole(response.responseText);
                message = response.responseText.substr(0, 100);
            } else {
                message = "Unable to Load: " + request.url;
                utilService.logtoConsole(message);
            }
            if (request.failedcallback) {
                request.failedcallback.call(request.callbackContext, { response: null, request: request, error: new Error(message) });
            }
            cfpLoadingBar.complete();
        },

        ExecuteServiceRequest: function (request, scope, successcallback, failedcallback) {
            cfpLoadingBar.start();
            var ajaxRequest = {
                url: request.url,
                method: request.method,
                context: request,
                success: this.Success,
                error: this.SilentFailure,
                data: request.data
            }
            if (request.async && request.async !== null) {
                ajaxRequest.async = request.async
            } else {
                request.async = false;
            }
            if (request.timeout && request.timeout !== null) {
                ajaxRequest.timeout = request.timeout
            } 

            request.callbackContext = scope;
            request.keepmask = true;
            request.successcallback = successcallback;
            request.failedcallback = failedcallback;
            $.ajax(ajaxRequest);
        },

        ExecuteServiceLogoutRequest: function (scope, successcallback, format) {
            cfpLoadingBar.start();
            var logoutRequest = requetBuilderService.GetLogoutRequest(scope);

            if (format) {
                logoutRequest.format = format;
            } else {
                logoutRequest.format = "text";
            }
            var ajaxRequest = {
                url: logoutRequest.url,
                method: logoutRequest.method,
                context: logoutRequest,
                success: this.Success,
                error: this.SilentFailure,
                data: this.toQueryString(logoutRequest.data),
                contentType: "application/x-www-form-urlencoded; charset=UTF-8"
            }
            logoutRequest.callbackContext = scope;
            logoutRequest.successcallback = successcallback;
            logoutRequest.failedcallback = successcallback;
            $.ajax(ajaxRequest);
        }
    }
});