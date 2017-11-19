app.factory("requetBuilderService", function () {
    return {
        isValidSetting: function (settings) {
            var host, heartbeatName, connectionCache;
            host = settings[0].Host;
            connectionCache = settings[0].ConnectionCache;
            if (host === undefined || host === "") {
                return false;
            }
            if (connectionCache === undefined || connectionCache === "") {
                return false;
            }
            return true;
        },

        ajaxDefaults: function () {
            var settings = JSON.parse(localStorage.getItem("serverSettings"));
            if (this.isValidSetting(settings)) {
                return {
                    url: settings[0].Host,
                    method: "POST",
                    cache: false,
                    async: true,
                    timeout: 60000,
                    data: {
                        CC: ""/*,
                        XML_G:""*/
                    }
                };
            }
            else {
                throw {
                    name: "ServerSetting",
                    message: "Invalid Server Connection Settings"
                };
            }
        },

        DefaultLoginRequest: function (scope, success, failure) {
            var settings = JSON.parse(localStorage.getItem("serverSettings"));
            if (this.isValidSetting(settings) && settings[0].UserName && settings[0].Password) {
                return {
                    url: settings[0].Host + "logon.jsp",
                    method: "POST",
                    withCredentials: false,
                    useDefaultXhrHeader: false,
                    disableCaching: true,
                    async: true,
                    scope: scope,
                    success: success,
                    failure: failure,
                    timeout: 60000,
                    data: {
                        FM: "json",
                        CC: settings[0].ConnectionCache,
                        UN: settings[0].UserName,
                        PW: settings[0].Password
                    }
                };
            }
            else {
                throw {
                    name: "ServerSetting",
                    message: "Invalid Server Connection Settings<br/>UserId or Password"
                };
            }
        },

        ajaxDefaultsHeartBeat: function () {
            var settings = JSON.parse(localStorage.getItem("serverSettings")),
                ajaxDef = this.ajaxDefaults();

            ajaxDef.data.CC = settings[0].ConnectionCache;

            return ajaxDef;
        },

        ajaxDefaultsLid: function () {
            var userS = JSON.parse(localStorage.getItem("userSettings"));
            if (userS !== undefined) {
                var ajaxDef = this.ajaxDefaults();
                return $.extend({}, ajaxDef,
                    {
                        params: {
                            lid: userS[0].lid
                        }
                    }, true);
            }
            else {
                throw {
                    name: "SessionSettings",
                    message: "User is not logged in."
                };
            }
        },

        ajaxDefaultsLidUser: function () {
            var userS = JSON.parse(localStorage.getItem("userSettings"));//Mobile6.utils.Common.getUserSession();
            var serverSetting = JSON.parse(localStorage.getItem("serverSettings"));//Mobile6.utils.Common.getServerSetting();
            if (userS !== undefined) {
                var ajaxDef = this.ajaxDefaults();
                return $.extend({}, ajaxDef,
                    {
                        data: {
                            lid: userS[0].lid,
                            IN: userS[0].validuser
                        }
                    }, true);
            }
            else {
                throw {
                    name: "SessionSettings",
                    message: "User is not logged in."
                };
            }
        },

        GetLoginRequest: function (userid, password, scope, success, failure, loadingMessage) {
            var def = this.ajaxDefaultsHeartBeat();
            $.extend(def.data, { UN: userid, PW: password });

            //def.params.UN = userid;
            //def.params.PW = password;

            def.url = def.url + "logon.jsp";

            def.scope = scope;
            def.success = success;
            def.failure = failure;
            def.loadingMessage = loadingMessage;
            return def;
        },

        GetLogoutRequest: function (scope, success, failure) {
            var ajaxDef = this.ajaxDefaultsLidUser();
            ajaxDef.url += "logoff.jsp";
            ajaxDef.scope = scope;
            ajaxDef.success = success;
            ajaxDef.failure = failure;
            return ajaxDef;
        },

        GetEaiPushRequest: function (xmlToPush, scope, success, failure, loadingMessage) {
            try {
                var ajaxDef = this.ajaxDefaults();
                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                //var userSetting = JSON.parse(localStorage.getItem("userSettings"));
                if (this.isValidSetting(settings)) {
                    ajaxDef = this.ajaxDefaultsLid();
                    var url = settings[0].Host;

                    if (!settings[0].isA6Compatible) {
                        url = url.replace("MobileSync", "EAI") + settings[0].ConnectionCache;
                    } else {
                        url = settings[0].EaiPush;
                    }

                    ajaxDef.url = url;
                    ajaxDef.data.XML_G = xmlToPush;
                    ajaxDef.scope = scope;
                    ajaxDef.success = success;
                    ajaxDef.failure = failure;
                    ajaxDef.syncInfo = { jspname: "NA" };//to make the symetry with quick syn functionality
                    ajaxDef.loadingMessage = loadingMessage;
                    return ajaxDef;


                }
            } catch (e) {
                throw e;
            }

        },

        //http://maps.googleapis.com/maps/api/geocode/output?parameters


        BuildFullSyncCountRequest: function (syncInfo) {
            var data = {
                FM: "",
                SR: 0,
                CallFrom:'INSPAPP'
            }
            var stampDate = syncInfo["lastsyncdate"],
                jspName = syncInfo["jspname"];
            if (stampDate != null && stampDate !== "") {
                data.SD = stampDate;
            }

            try {
                var ajaxDef = this.ajaxDefaultsLidUser();
                data.lid = ajaxDef.data.lid;
                data.IN = ajaxDef.data.IN;
                $.extend(ajaxDef,
                    {
                        data: data,
                        syncInfo: syncInfo,
                        format: "plain",
                        countRequest: true
                    });
                ajaxDef.url += jspName;
                return ajaxDef;
            } catch (ex) {
                throw ex;
            }
        },

        BuildFullSyncRequest: function (syncInfo, start, count) {
            var data = {
                SR: start,
                IR: count,
                CallFrom: 'INSPAPP'
            }
            var stampDate = syncInfo["lastsyncdate"],
                  jspName = syncInfo["jspname"];
            if (stampDate != null && stampDate !== "") {
                data.SD = stampDate;
            }

            try {
                var ajaxDef = this.ajaxDefaultsLidUser();
                data.lid = ajaxDef.data.lid;
                data.IN = ajaxDef.data.IN;
                $.extend(ajaxDef,
                    {
                        data: data,
                        syncInfo: syncInfo,
                        countRequest: false
                    }, true);
                ajaxDef.url += jspName;
                return ajaxDef;
            } catch (ex) {
                throw ex;
            }
        },

        BuildQuickSyncCountRequest: function (syncInfo) {
            var data = {
                FM: "",
                SR: 0
            }
            var stampDate = syncInfo["lastsyncdate"],
               jspName = syncInfo["jspname"];
            if (stampDate != null) {
                data.SD = stampDate;
            }

            try {
                var ajaxDef = this.ajaxDefaultsLidUser();
                data.lid = ajaxDef.data.lid;
                data.IN = ajaxDef.data.IN;
                $.extend(ajaxDef,
                    {
                        data: data,
                        syncInfo: syncInfo,
                        format: "plain"
                        // countRequest: true
                    });
                ajaxDef.url += jspName;
                return ajaxDef;
            } catch (ex) {
                throw ex;
            }
        },

        BuildQuickSyncRequest: function (syncInfo, start, count) {
            var data = {
                SR: start,
                IR: count
            }
            var FD = syncInfo["FD"];
            var PD = syncInfo["PD"];
            var stampDate = syncInfo["lastsyncdate"];
            var jspName = syncInfo["jspname"];
            if (stampDate !== null && stampDate !== "") {
                //if (jspName !== "_Inspections.jsp") {
                //    data.SD = stampDate;
                //}
                if (jspName === "_ProcessDel.jsp" || jspName === "_FolderProcessCheckListDel.jsp" || jspName === "_FolderProcessInfoDel.jsp" || jspName === "_ReassignedProcess.jsp") {
                    data.SD = stampDate;
                }
            }
            if (FD !== "" && FD !== undefined) {
                data.FD = FD;
            }
            if (PD !== "" && PD !== undefined) {
                data.PD = PD;
            }
            //if (jspName === "_AllProcessAttachments.jsp") {
            //    data.TBL = "Folder";
            //}
            try {
                var ajaxDef = this.ajaxDefaultsLidUser();
                data.lid = ajaxDef.data.lid;
                data.IN = ajaxDef.data.IN;

                $.extend(ajaxDef,
                    {
                        data: data,
                        syncInfo: syncInfo,
                        quickRequest: true
                    }, true);
                ajaxDef.url += jspName;
                return ajaxDef;
            } catch (ex) {
                throw ex;
            }
        },
        BuildQuickSyncQSDRequest: function (syncInfo, start, count) {
            var data = {
                SR: start,
                IR: count
            }
            var stampDate = syncInfo["lastsyncdate"];
            var FD = syncInfo["FD"];
            var PD = syncInfo["PD"];
            var jspName = syncInfo["jspname"];
            //if (jspName === "_Inspections.jsp") {
            //    debugger;
            //    data.SD = stampDate;
            //}
            if (stampDate != null && stampDate != "" && stampDate != undefined) {
                data.QSD = stampDate;
            }
            if (FD !== "" && FD !== undefined) {
                data.FD = FD;
            }
            if (PD !== "" && PD !== undefined) {
                data.PD = PD;
            }
            //if (jspName === "_AllProcessAttachments.jsp") {
            //    data.TBL = "Folder";
            //}
            try {
                var ajaxDef = this.ajaxDefaultsLidUser();
                data.lid = ajaxDef.data.lid;
                data.IN = ajaxDef.data.IN;

                $.extend(ajaxDef,
                    {
                        data: data,
                        syncInfo: syncInfo,
                        quickRequest: true
                    }, true);
                ajaxDef.url += jspName;
                return ajaxDef;
            } catch (ex) {
                throw ex;
            }
        },
        BuildSearchFullTextRequest: function (seachtext, startindex, endindex, scope, jspName) {
            try {
                var ajaxDef = this.ajaxDefaults();
                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                if (this.isValidSetting(settings)) {
                    ajaxDef = this.ajaxDefaultsLidUser();
                    var url = settings[0].Host;
                    ajaxDef.url += jspName;
                    ajaxDef.data.ST = seachtext;
                    ajaxDef.data.SI = startindex;
                    ajaxDef.data.EI = endindex;
                    ajaxDef.data.FM = "json";
                    ajaxDef.scope = scope;
                    return ajaxDef;
                }
            } catch (e) {
                throw e;
            }
            return null;
        },

        BuildSearchFolderDataRequest: function (folderrsn, scope, jspName) {
            try {
                var ajaxDef = this.ajaxDefaults();
                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                if (this.isValidSetting(settings)) {
                    ajaxDef = this.ajaxDefaultsLidUser();
                    var url = settings[0].Host;
                    ajaxDef.url += jspName;
                    ajaxDef.data.FR = folderrsn;
                    ajaxDef.data.FM = "json";
                    ajaxDef.scope = scope;
                    return ajaxDef;
                }
            } catch (e) {
                throw e;
            }
            return null;
        },

        BuildDownloadReportTemplateRequest: function (scope, downloadurl) {
            try {
                var ajaxDef = this.ajaxDefaults();
                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                if (this.isValidSetting(settings)) {
                    ajaxDef = this.ajaxDefaultsLidUser();
                    ajaxDef.url = downloadurl;
                    ajaxDef.scope = scope;
                    return ajaxDef;
                }

            } catch (e) {
                throw e;
            }
            return null;
        },
        ExecuteServiceCheckFreeFormData: function (scope, jspname) {
            try {
                var ajaxDef = this.ajaxDefaults();
                var settings = JSON.parse(localStorage.getItem("serverSettings"));
                if (this.isValidSetting(settings)) {
                    ajaxDef = this.ajaxDefaultsLidUser();
                    ajaxDef.url += jspname;
                    ajaxDef.scope = scope;
                    return ajaxDef;
                }

            } catch (e) {
                throw e;
            }
            return null;
        },
    };
});