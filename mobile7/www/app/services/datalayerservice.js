app.factory("dataLayerService", function (utilService, dbInitService, $q, CommonService) {
    return {
        siteOptions: null,
        getSiteOptions: function () {
            if (this.siteOptions != null && this.siteOptions.length > 0) {
                return this.siteOptions;
            } else {
                var self = this;
                this.getValidSiteMobileOption().then(function (result) {
                    self.siteOptions = result;
                })
            }
        },

        getinboxlist: function (startDate, endDate, userid) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var dt = [];
                    var folder = [];
                    var fr = "";
                    var query = "";
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        startDate = startDate == undefined ? "" : startDate;
                        endDate = endDate == undefined ? "" : endDate;
                        query = "Select case when Folder.FolderRSN=0 then folder.id else folder.folderrsn end as folderrsn, Folder.propertyrsn, Folder.folderyear, " +
                            " Folder.foldercentury, Folder.foldersection, Folder.folderSequence, " +
                            " Folder.folderRevision, Folder.foldertype, Folder.FolderDescription, Folder.indate, validprocess.processdesc, " +
                            " ifnull(validprocessstatus.statusdesc,'') as statusdesc, " +
                            " folderprocess.scheduledate, folderprocess.scheduleenddate, folderprocess.processcomment,folderprocess.inspminute, " +
                            " case when folderprocess.processrsn=0 then folderprocess.id " +
                            "  else folderprocess.processrsn end as processrsn ," +
                            " Folder.id as FolderId, FolderProcess.id as ProcessId, folderprocess.processcode,folderprocess.priority,  " +
                            " property.prophouse, property.propstreetprefix, property.propstreet, property.propstreettype, property.propstreetdirection, property.propunittype," +
                            " property.propunit, property.propcity, property.propprovince, property.countydesc,FolderProcess.isfailed " +
                            " from FolderProcess " +
                            " join folder on ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn )) " +
                            " left join validprocess on folderprocess.processcode = validprocess.processcode " +
                            " left join validprocessstatus on folderprocess.statuscode = validprocessstatus.statuscode " +
                            " left join property on property.propertyrsn=folder.propertyrsn " +
                            "where upper(folderprocess.assigneduser)=? " +
                            "and folder.foldertype in (select foldertype from validmobilefoldertype where foldergroupcode in (select foldergroupcode from userpermission where userid = ?)) " +
                            "and folderprocess.processcode in (select processcode from validmobileprocess where foldergroupcode in (select foldergroupcode from userpermission where userid = ?)) ";
                        //need to apply validmobilefoldertype and validmobileprocesstype check
                        if (startDate === "" && endDate === "") {
                            query += " and ifnull(folderprocess.enddate,'')=''";
                        } else if (startDate !== "" && endDate !== "") {
                            query += " and strftime(" + "'" + "%Y%m%d %H:%M:%S" + "'" + ",folderprocess.scheduledate) between" + "'" + startDate + "' and " + "'" + endDate + "' " +
                                "and ifnull(folderprocess.enddate,'')='' ";
                        }
                        if (userid != null) {
                            userid = userid.toUpperCase();
                        }

                        if (query != undefined) {
                            tx.executeSql(query, [userid, userid, userid],
                                function (itx, result) {
                                    folder = [];
                                    var record = null;
                                    if (result.rows && result.rows.length > 0) {
                                        utilService.logtoConsole("Result Found: getinboxlist");
                                        for (var i = 0; i < result.rows.length; i++) {
                                            record = result.rows.item(i);
                                            folder.push(record);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: folder });
                                }, function (itx, error) {
                                    utilService.logtoConsole(error + " into function getinboxlist", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        } else {
                            deferred.resolve({ error: new Error("Unable to compose any query.."), data: null });
                        }
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: e, data: null });
            }
        },

        getoutboxlist: function (startDate, endDate, userid) {
            try {
                var folder = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "Select case when Folder.FolderRSN=0 then folder.id else folder.folderrsn end as folderrsn, Folder.propertyrsn,Folder.folderyear, Folder.foldercentury, Folder.foldersection, Folder.folderSequence, " +
                            " Folder.folderRevision, Folder.foldertype, Folder.FolderDescription, Folder.indate, validprocess.processdesc, " +
                            " ifnull(validprocessstatus.statusdesc,'') as statusdesc, " +
                            " folderprocess.scheduledate, folderprocess.processcomment, case when folderprocess.processrsn=0 then folderprocess.id else folderprocess.processrsn end as processrsn ," +
                            " Folder.id as FolderId, FolderProcess.id as ProcessId ,folderprocess.processcode ,folderprocess.priority,   " +
                            " property.prophouse, property.propstreetprefix, property.propstreet, property.propstreettype, property.propstreetdirection, property.propunittype," +
                            " property.propunit, property.propcity, property.propprovince, property.countydesc,FolderProcess.isfailed,folderprocess.inspminute " +
                            " from Folder, FolderProcess left join validprocess on folderprocess.processcode = validprocess.processcode " +
                            " left join validprocessstatus on folderprocess.statuscode = validprocessstatus.statuscode " +
                            " left join property on property.propertyrsn=folder.propertyrsn " +
                            " where ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn ))  " +
                            " and upper(folderprocess.assigneduser)=? " +
                            " and folder.foldertype in (select foldertype from validmobilefoldertype where foldergroupcode in (select foldergroupcode from userpermission where userid = ?)) " +
                            " and folderprocess.processcode in (select processcode from validmobileprocess where foldergroupcode in (select foldergroupcode from userpermission where userid = ?)) " +
                            " and folderprocess.enddate!='' and (folderprocess.isnew !='' or folderprocess.isedited!='' OR folderprocess.isreschedule='Y')";

                        if (startDate !== "" && endDate !== "") {
                            query += "and strftime(" + "'" + "%Y%m%d %H:%M:%S" + "'" + ",folderprocess.scheduledate) between" + "'" + startDate + "' and " + "'" + endDate + "'";
                        }
                        if (userid != null) {
                            userid = userid.toUpperCase();
                        }
                        tx.executeSql(query, [userid, userid, userid],
                        function (tx, result) {
                            folder = [];
                            var record = null;
                            if (result.rows && result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    record = result.rows.item(i);
                                    folder.push(record);
                                }
                            }
                            deferred.resolve({ error: null, data: folder });
                        }, function (itx, error) {
                            utilService.logtoConsole(error + " into function getoutboxlist", "error");
                            deferred.resolve({ error: error, data: null });
                        });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: e, data: null });
            }
        },

        getseachboxlist: function (searchType, valueToSearch, limit, offset) {
            try {
                var folder = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query;
                        query = "Select (select Count(*) from Folder ) as totalCount ,case when Folder.FolderRSN=0 then folder.id else folder.folderrsn end as folderrsn, Folder.folderyear, Folder.foldercentury, Folder.foldersection, Folder.folderSequence," +
                            " Folder.folderRevision, Folder.foldertype, Folder.FolderDescription, folder.foldername,Folder.indate, validstatus.statusdesc, Folder.id as FolderId, property.prophouse,property.propstreet," +
                            " property.propstreetdirection, property.propunittype, property.propunit,  property.propcity, property.propprovince, property.proppostal,property.countydesc,folderprocess.processrsn from  Folder " +
                            " left join validstatus on folder.statuscode = validstatus.statuscode" +
                            " left join property on folder.propertyrsn=property.propertyrsn " +
                            " left join folderprocess on ((Folder.IsNew='Y' and Folder.id=folderprocess.folderrsn) OR (Folder.IsNew!='Y' and Folder.FolderRSN=folderprocess.folderrsn )) where 1=1 ";;

                        if (valueToSearch !== "" && valueToSearch != null && valueToSearch != undefined && searchType !== "") {
                            if (searchType === "ExactMatch") {
                                query += " and (folder.folderrsn=" + "'" + valueToSearch + "'" + " OR folder.foldertype=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldercentury=" + "'" + valueToSearch + "'" + " OR folder.folderyear=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldersequence=" + "'" + valueToSearch + "'" + " OR folder.folderdescription=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldername=" + "'" + valueToSearch + "'" + " OR folder.foldercondition=" + "'" + valueToSearch + "'" + ") ";
                            } else {
                                var wherecluase;
                                if (searchType === "AllOfThese") {
                                    wherecluase = "";
                                    for (var i = 0; i < valueToSearch.length; i++) {
                                        wherecluase += " and (folder.folderrsn like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldertype like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldercentury like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderyear like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldersequence like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderdescription like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldername like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldercondition like " + "'%" + valueToSearch[i] + "%'" + ")";
                                    }
                                    query += wherecluase;
                                } else if (searchType === "AnyOfThese") {
                                    wherecluase = "";
                                    for (var i = 0; i < valueToSearch.length; i++) {
                                        wherecluase += " OR (folder.folderrsn like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldertype like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldercentury like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderyear like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldersequence like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderdescription like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldername like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldercondition like " + "'%" + valueToSearch[i] + "%'" + ") ";
                                    }
                                    query += wherecluase;
                                }
                            }
                        }
                        query += " limit ? offset ?";
                        tx.executeSql(query, [limit, offset],
                            function (tx, result) {
                                folder = [];
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        folder.push(record);
                                        folder.totalCount = record.totalCount;
                                    }
                                }
                                deferred.resolve({ error: null, data: folder });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getseachboxlist", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: e, data: null });
            }
        },

        getseachboxlistTotal: function (searchType, valueToSearch) {
            try {
                var folder = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select Count(*) as totalCount from Folder  left   join validstatus on folder.statuscode = validstatus.statuscode" +
                            " left join property on folder.propertyrsn=property.propertyrsn " +
                            " left join folderprocess on ((Folder.IsNew='Y' and Folder.id=folderprocess.folderrsn) OR (Folder.IsNew!='Y' and Folder.FolderRSN=folderprocess.folderrsn )) where 1=1 ";;

                        if (valueToSearch !== "" && valueToSearch != null && valueToSearch != undefined && searchType != "") {
                            if (searchType == "ExactMatch") {
                                query += " and (folder.folderrsn=" + "'" + valueToSearch + "'" + " OR folder.foldertype=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldercentury=" + "'" + valueToSearch + "'" + " OR folder.folderyear=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldersequence=" + "'" + valueToSearch + "'" + " OR folder.folderdescription=" + "'" + valueToSearch + "'" +
                                    " OR folder.foldername=" + "'" + valueToSearch + "'" + " OR folder.foldercondition=" + "'" + valueToSearch + "'" + ") ";
                            } else {
                                var wherecluase;
                                if (searchType === "AllOfThese") {
                                    wherecluase = "";
                                    for (var i = 0; i < valueToSearch.length; i++) {
                                        wherecluase += " and (folder.folderrsn like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldertype like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldercentury like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderyear like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldersequence like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderdescription like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldername like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldercondition like " + "'%" + valueToSearch[i] + "%'" + ")";
                                    }
                                    query += wherecluase;
                                } else if (searchType === "AnyOfThese") {
                                    wherecluase = "";
                                    for (var i = 0; i < valueToSearch.length; i++) {
                                        wherecluase += " OR (folder.folderrsn like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldertype like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldercentury like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderyear like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldersequence like " + "'%" + valueToSearch[i] + "%'" + " OR folder.folderdescription like " + "'%" + valueToSearch[i] + "%'" +
                                            " OR folder.foldername like " + "'%" + valueToSearch[i] + "%'" + " OR folder.foldercondition like " + "'%" + valueToSearch[i] + "%'" + ") ";
                                    }
                                    query += wherecluase;
                                }
                            }
                        }
                        tx.executeSql(query, [],
                            function (tx, result) {
                                var folder = [];
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        folder.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: folder });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getseachboxlistTotal", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: e, data: null });
            }
        },

        getpeoplelist: function (filterVariables) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "SELECT distinct peoplersn,nametitle,namefirst,namemiddle,namelast,namesuffix,organizationname,phone1,phone1desc," +
                            "phone2,phone2desc,phone3,phone3desc,emailaddress ,addrprefix,comments,addrhouse,addrstreetprefix,addrstreet,addrstreettype," +
                            'addrstreetdirection,addrunittype,addrunit,addrcity,countydesc,addrprovince,addrpostal,addrcountry,"" as Community ,' +
                            'birthdate,"" as referencefile,familyrsn,addressline1,addressline2,addressline3 ' +
                            "FROM PEOPLE {0}";
                        var stringWhere = "";
                        if (stringWhere == "")
                            stringWhere += ' where peoplecode in (select peoplecode from validpeople where peoplecode!="" OR peoplecode!=null) ';
                        if (filterVariables.peopleSaluation != "" && filterVariables.peopleSaluation != null)
                            stringWhere += " AND nametitle like" + "'%" + filterVariables.peopleSaluation + "%'";

                        if (filterVariables.peopleFirstName != "" && filterVariables.peopleFirstName != null)
                            stringWhere += " AND namefirst Like" + "'%" + filterVariables.peopleFirstName + "%'";
                        if (filterVariables.peopleMiddleName != "" && filterVariables.peopleMiddleName != null)
                            stringWhere += " AND namemiddle Like" + "'%" + filterVariables.peopleMiddleName + "%'";

                        if (filterVariables.peopleLastName != "" && filterVariables.peopleLastName != null)
                            stringWhere += " AND namelast Like" + "'%" + filterVariables.peopleLastName + "%'";
                        if (filterVariables.peopleNameSuffix != "" && filterVariables.peopleNameSuffix != null)
                            stringWhere += " AND namesuffix Like" + "'%" + filterVariables.peopleNameSuffix + "%'";

                        if (filterVariables.peopleOrgName != "" && filterVariables.peopleOrgName != null)
                            stringWhere += " AND organizationname Like" + "'%" + filterVariables.peopleOrgName + "%'";
                        if (filterVariables.peoplePhone1 != "" && filterVariables.peoplePhone1 != null)
                            stringWhere += " AND phone1 Like" + "'%" + filterVariables.peoplePhone1 + "%'";

                        if (filterVariables.peoplePhone1Desc != "" && filterVariables.peoplePhone1Desc != null)
                            stringWhere += " AND phone1desc =" + "'" + filterVariables.peoplePhone1Desc + "'";
                        if (filterVariables.peoplePhone2 != "" && filterVariables.peoplePhone2 != null)
                            stringWhere += " AND phone2 Like" + "'%" + filterVariables.peoplePhone2 + "%'";

                        if (filterVariables.peoplePhone2Desc != "" && filterVariables.peoplePhone2Desc != null)
                            stringWhere += " AND phone2desc =" + "'" + filterVariables.peoplePhone2Desc + "'";
                        if (filterVariables.peoplePhone3 != "" && filterVariables.peoplePhone3 != null)
                            stringWhere += " AND phone3 Like" + "'%" + filterVariables.peoplePhone3 + "%'";

                        if (filterVariables.peoplePhone3Desc != "" && filterVariables.peoplePhone3Desc != null)
                            stringWhere += " AND phone3desc =" + "'" + filterVariables.peoplePhone3Desc + "'";
                        if (filterVariables.peopleEmailAdd != "" && filterVariables.peopleEmailAdd != null)
                            stringWhere += " AND emailaddress Like" + "'%" + filterVariables.peopleEmailAdd + "%'";

                        if (filterVariables.peopleAddrPrefix != "" && filterVariables.peopleAddrPrefix != null)
                            stringWhere += " AND addrprefix =" + "'" + filterVariables.peopleAddrPrefix + "'";
                        if (filterVariables.peopleAddrComments != "" && filterVariables.peopleAddrComments != null)
                            stringWhere += " AND comments Like" + "'%" + filterVariables.peopleAddrComments + "%'";

                        if (filterVariables.peopleAddrHouseNo != "" && filterVariables.peopleAddrHouseNo != null)
                            stringWhere += " AND addrhouse Like" + "'%" + filterVariables.peopleAddrHouseNo + "%'";
                        if (filterVariables.peopleAddrStreetPrefix != "" && filterVariables.peopleAddrStreetPrefix != null)
                            stringWhere += " AND addrstreetprefix Like" + "'%" + filterVariables.peopleAddrStreetPrefix + "%'";

                        if (filterVariables.peopleAddrStreetName != "" && filterVariables.peopleAddrStreetName != null)
                            stringWhere += " AND addrstreet Like" + "'%" + filterVariables.peopleAddrStreetName + "%'";
                        if (filterVariables.peopleAddrStreetType != "" && filterVariables.peopleAddrStreetType != null)
                            stringWhere += " AND addrstreettype " + "'" + filterVariables.peopleAddrStreetType + "'";

                        if (filterVariables.peopleAddrStreetDirection != "" && filterVariables.peopleAddrStreetDirection != null)
                            stringWhere += " AND addrstreetdirection =" + "'" + filterVariables.peopleAddrStreetDirection + "'";
                        if (filterVariables.peopleAddrUnitType != "" && filterVariables.peopleAddrUnitType != null)
                            stringWhere += " AND addrunittype =" + "'" + filterVariables.peopleAddrUnitType + "'";

                        if (filterVariables.peopleAddrUnitNo != "" && filterVariables.peopleAddrUnitNo != null)
                            stringWhere += " AND addrunit Like" + "'%" + filterVariables.peopleAddrUnitNo + "%'";
                        if (filterVariables.peopleAddrCity != "" && filterVariables.peopleAddrCity != null)
                            stringWhere += " AND addrcity Like" + "'%" + filterVariables.peopleAddrCity + "%'";

                        if (filterVariables.peopleAddrCounty != "" && filterVariables.peopleAddrCounty != null)
                            stringWhere += " AND countydesc Like" + "'%" + filterVariables.peopleAddrCounty + "%'";
                        if (filterVariables.peopleAddrState != "" && filterVariables.peopleAddrState != null)
                            stringWhere += " AND addrprovince Like" + "'%" + filterVariables.peopleAddrState + "%'";

                        if (filterVariables.peopleAddrPostalCode != "" && filterVariables.peopleAddrPostalCode != null)
                            stringWhere += " AND addrpostal Like" + "'%" + filterVariables.peopleAddrPostalCode + "%'";
                        if (filterVariables.peopleAddrCountry != "" && filterVariables.peopleAddrCountry != null)
                            stringWhere += " AND addrcountry Like" + "'%" + filterVariables.peopleAddrCountry + "%'";
                        if (filterVariables.peopleRoleType != "" && filterVariables.peopleRoleType != null)
                            stringWhere += " AND peoplecode =" + filterVariables.peopleRoleType;
                        if (filterVariables.peopleStatus != "" && filterVariables.peopleStatus != null)
                            stringWhere += " AND statuscode =" + filterVariables.peopleStatus;
                        if (stringWhere != ' where peoplecode in (select peoplecode from validpeople where peoplecode!="" OR peoplecode!=null) ') {
                            sql = String.format(syntax, stringWhere);
                            tx.executeSql(sql, [],
                                function (itx, result) {
                                    var dt = [];
                                    var row = null;
                                    if (result.rows && result.rows.length > 0) {
                                        for (var i = 0; i < result.rows.length; i++) {
                                            row = result.rows.item(i);
                                            dt.push(row);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: dt });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error + " into function getpeoplelist", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        }
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: error, data: null });
            }
        },

        getSaluationList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select DESC FROM ValidTitle order by 2 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getSaluationList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: error, data: null });
            }
        },

        getStreetTypeList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select streettype,streettypedesc FROM validstreettype";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getStreetTypeList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPeopleRoleList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "SELECT  peoplecode,peopledesc FROM validpeople order by 2 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getPeopleRoleList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPeopleStatusList: function () {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select statuscode,statusdesc FROM validpeoplestatus order by 1 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getPeopleStatusList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getAddressUnitList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select addressunittype,addressunittypedesc FROM validaddressunittype order by 1 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getAddressUnitList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getAddressDirectionList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select addressdirection,addressdirectiondesc FROM validaddressdirection order by 2 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getAddressDirectionList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPeopleDataByRsn: function (data) {
            try {
                var peoplersn = data.x.peoplersn;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='people'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "SELECT distinct peoplersn,nametitle,namefirst,namemiddle,namelast,namesuffix,organizationname,phone1,phone1desc," +
                                        "phone2,phone2desc,phone3,phone3desc,emailaddress ,addrprefix,comments,addrhouse,addrstreetprefix,addrstreet,addrstreettype," +
                                        'addrstreetdirection,addrunittype,addrunit,addrcity,countydesc,addrprovince,addrpostal,addrcountry,"" as Community ,' +
                                        'birthdate,"" as referencefile,familyrsn,addressline1,addressline2,addressline3, id as rowid,peoplecode,statuscode ' +
                                        "FROM PEOPLE WHERE peoplersn = {0} ";
                                    sql = String.format(syntax, peoplersn);
                                    tx.executeSql(sql, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getPeopleDataByRsn", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPhoneDescList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select id,titlename FROM validphonetype order by 1 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getPhoneDescList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderType: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfolder'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    var syntax = "select validfolder.foldertype,validfolder.folderdesc,validfolder.violationflag,validfolder.propertyrequired,validfolder.promptmultipleproperty,validfolder.subtypeentryrequired,validfolder.workcodeentryrequired from validfolder order by 2 asc";
                                    tx.executeSql(syntax, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderType", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderSubType: function (foldertype) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfoldersub'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "SELECT validfoldersub.subcode,validsub.subdesc FROM validfoldersub,validsub where validfoldersub.subcode=validsub.subcode and validfoldersub.foldertype={0}";
                                    sql = String.format(syntax, "'" + foldertype + "'");
                                    tx.executeSql(sql, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderSubType", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderWorkType: function (foldertype, foldersubtype) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfolderwork'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "SELECT  validfolderwork.workcode,validwork.workdesc FROM validfolderwork,validwork where validfolderwork.workcode=validwork.workcode and validfolderwork.foldertype={0} and validfolderwork.subcode={1}";
                                    sql = String.format(syntax, "'" + foldertype + "'", "'" + foldersubtype + "'");
                                    tx.executeSql(sql, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderWorkType", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessType: function (foldertype) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var currentuser = "";

                    var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                    if ($.isArray(storedUser) && storedUser.length > 0) {
                        currentuser = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser
                    }


                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validprocess'", [],
                            function (tx, result) {
                                if (result.rows || result.rows.length !== 0) {
                                    var syntax = "SELECT distinct validprocess.processcode,validprocess.processdesc " +
                                        "FROM validprocess join validmobileprocess on validprocess.processcode=validmobileprocess.processcode " +
                                        "where validprocess.processcode in (SELECT defaultprocess.processcode FROM defaultprocess where defaultprocess.foldertype=?) " +
                                        "and validprocess.processcode in (select processcode from validmobileprocess where foldergroupcode " +
                                        "in (select foldergroupcode from userpermission where upper(userid) = ?))  order by 2  asc";
                                    tx.executeSql(syntax, [foldertype, currentuser],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderProcessType", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getProprtyTypeList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validproperty'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "SELECT propcode,propdesc FROM validproperty order by 2 asc";
                                    tx.executeSql(syntax, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getProprtyTypeList", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPropertyStatusList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validpropertystatus'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "SELECT statuscode,statusdesc FROM validpropertystatus order by 2 asc";
                                    tx.executeSql(syntax, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getPropertyStatusList", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPropertyPrefixList: function () {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "Select addressdirection,addressdirectiondesc FROM validaddressdirection order by 2 ASC";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getPropertyPrefixList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPropertyList: function (filterVariables) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "SELECT DISTINCT propertyrsn,familyrsn,propertyroll,propgisid1,parentpropertyrsn,datecreated,dateobsoleted,prophouse," +
                            "propstreet, propstreettype, propcity, propprovince, proppostal, propunittype, propunit, propertyname, legaldesc,statuscode,proparea,propfrontage," +
                            "propdepth,propcrossstreet,zonetype1,propplan,proplot,propsection,proptownship,proprange,routecode,propcomment,propstreetdirection,zonetype2," +
                            "zonetype3, zonetype4, zonetype5, propx, propy, propstreetprefix, countydesc,propcode FROM property {0}";
                        var stringWhere = "";
                        if (stringWhere == "")
                            stringWhere += "Where 1 = 1";
                        if (filterVariables.propertyNo != "" && filterVariables.propertyNo != null)
                            stringWhere += " AND prophouse =" + "'" + filterVariables.propertyNo + "'";
                        if (filterVariables.propertyStreetPrefix != "" && filterVariables.propertyStreetPrefix != null)
                            stringWhere += " AND propStreetPrefix =" + "'" + filterVariables.propertyStreetPrefix + "'";
                        if (filterVariables.propertyStreet != "" && filterVariables.propertyStreet != null)
                            stringWhere += " AND propStreet Like" + "'%" + filterVariables.propertyStreet + "%'";
                        if (filterVariables.propertyStreetType != "" && filterVariables.propertyStreetType != null)
                            stringWhere += " AND propStreetType =" + "'" + filterVariables.propertyStreetType + "'";
                        if (filterVariables.propertyDirection != "" && filterVariables.propertyDirection != null)
                            stringWhere += " AND propStreetDirection =" + "'" + filterVariables.propertyDirection + "'";
                        if (filterVariables.propertyUnitType != "" && filterVariables.propertyUnitType != null)
                            stringWhere += " AND propUnitType =" + "'" + filterVariables.propertyUnitType + "'";
                        if (filterVariables.propertyUnitNo != "" && filterVariables.propertyUnitNo != null)
                            stringWhere += " AND propUnit Like" + "'%" + filterVariables.propertyUnitNo + "%'";
                        if (filterVariables.propertyStatus != "" && filterVariables.propertyStatus != null)
                            stringWhere += " AND statuscode =" + "'" + filterVariables.propertyStatus + "'";
                        if (filterVariables.propertyCity != "" && filterVariables.propertyCity != null)
                            stringWhere += " AND propCity Like" + "'%" + filterVariables.propertyCity + "%'";
                        if (filterVariables.propertyCounty != "" && filterVariables.propertyCounty != null)
                            stringWhere += " AND countydesc Like" + "'%" + filterVariables.propertyCounty + "%'";
                        if (filterVariables.propertyRoll != "" && filterVariables.propertyRoll != null)
                            stringWhere += " AND propertyroll Like" + "'%" + filterVariables.propertyRoll + "%'";
                        if (filterVariables.propertyState != "" && filterVariables.propertyState != null)
                            stringWhere += " AND propprovice Like" + "'%" + filterVariables.propertyState + "%'";
                        if (filterVariables.propertyPostal != "" && filterVariables.propertyPostal != null)
                            stringWhere += " AND proppostal Like" + "'%" + filterVariables.propertyPostal + "%'";
                        if (filterVariables.proprtyType != "" && filterVariables.proprtyType != null)
                            stringWhere += " AND propcode =" + "'" + filterVariables.proprtyType + "'";
                        if (filterVariables.propertyName != "" && filterVariables.propertyName != null)
                            stringWhere += " AND propertyName Like" + "'%" + filterVariables.propertyName + "%'";
                        if (stringWhere != "Where 1 = 1") {
                            sql = String.format(syntax, stringWhere);
                            tx.executeSql(sql, [],
                                function (itx, result) {
                                    var dt = [];
                                    var row = null;
                                    if (result.rows && result.rows.length > 0) {
                                        for (var i = 0; i < result.rows.length; i++) {
                                            row = result.rows.item(i);
                                            dt.push(row);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: dt });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error + " into function getPropertyList", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        }
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPropertyDataByRsn: function (data) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "SELECT * FROM property where propertyrsn= ?";
                        tx.executeSql(syntax, [data.x.propertyrsn],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getPropertyDataByRsn", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        insertSearchFolder: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "insert into folder (folderrsn,propertyrsn,foldertype,foldername,folderdescription,subcode,workcode,referencefile, " +
                            " foldercondition,indate,statuscode,parentrsn,propertyrsn,foldercentury,folderyear,isnew) " +
                            " SELECT " + "'" + dataToInsert.folderRSN + "'" + ", " + "'" + dataToInsert.propertyRSN + "'" + "," + "'" + dataToInsert.folderType + "'" + ", " + "'" + dataToInsert.folderName + "'" + "," +
                            "'" + dataToInsert.folderDescription + "'" + ", " + "'" + dataToInsert.folderSubType + "'" + ", " + "'" + dataToInsert.folderWorkType + "'" + ", " + "'" + dataToInsert.referenceFile + "'" + ", " +
                            "'" + dataToInsert.folderCondition + "'" + ", " + "'" + dataToInsert.inDate + "'" + ", " + "'" + dataToInsert.statusCode + "'" + ", " + "'" + dataToInsert.parentRSN + "'" + ", " + "'" + dataToInsert.propertyRSN + "'" + "," +
                            "'" + dataToInsert.folderCentury + "'" + "," + "'" + dataToInsert.folderYear + "'" + "," + "'" + dataToInsert.isNew + "'" + " WHERE NOT EXISTS(SELECT 1 FROM folder WHERE folderrsn = " + "'" + dataToInsert.folderRSN + "'" + ")";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }
                                deferred.resolve({ error: null, data: result.insertId });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertSearchFolder" + " into function insertSearchFolder", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message + " into function insertSearchFolder", "error");
            }
        },
        insertSearchFolderProperty: function (dataToInsert) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "INSERT INTO folderproperty(folderrsn,propertyrsn,propertyrelationcode)" +
                            " SELECT " + dataToInsert.FolderRSN + "," + dataToInsert.PropertyRSN + ",''" +
                            " WHERE NOT EXISTS(SELECT 1 FROM folderproperty WHERE folderproperty.folderrsn = " + dataToInsert.FolderRSN + " AND folderproperty.propertyrsn = " + dataToInsert.PropertyRSN + ");";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }

                                deferred.resolve({ error: null, data: "success" });

                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertSearchFolderProperty" + " into function insertSearchFolderProperty", "error");

                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message + " into function insertSearchFolderProperty", "error");
            }
        },
        insertSearchFolderPeople: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "INSERT INTO folderpeople(folderrsn,peoplersn,relation)" +
                            " SELECT " + dataToInsert.FolderRSN + "," + dataToInsert.PeopleRSN + ",''" +
                            " WHERE NOT EXISTS(SELECT 1 FROM folderpeople WHERE folderpeople.folderrsn = " + dataToInsert.FolderRSN + " AND folderpeople.peoplersn = " + dataToInsert.PeopleRSN + ");";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }

                                deferred.resolve({ error: null, data: "success" });

                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertSearchFolderPeople", "error");

                                deferred.resolve({ error: error, data: null });

                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        insertSearchFolderInfo: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select (select max(id) from folderinfo) as Id,? as folderrsn ,? as folderId, defaultinfo.infocode,defaultinfo.infovalue," +
                            "defaultinfo.mandatory,defaultinfo.displayorder,defaultinfo.requiredforinitialsetup from defaultinfo where foldertype=?";
                        tx.executeSql(syntax, [0, dataToInsert.FolderRSN, dataToInsert.FolderType],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        syntax = "INSERT INTO FolderInfo Values(?, ?, ?, ?, ?, ?, ?,?,?,?) ";
                                        arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            result.rows.item(i).folderrsn,
                                            result.rows.item(i).infocode,
                                            result.rows.item(i).infovalue,
                                            result.rows.item(i).mandatory,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).requiredforinitialsetup,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            result.rows.item(i).folderId,
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result != null && result != "" && result != undefined) {
                                                    console.log(result.insertId)
                                                }
                                                deferred.resolve({ error: null, data: "success" });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertSearchFolderInfo", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    }
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        insertSearchFolderProcess: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        arrayValueInsert = [
                            dataToInsert.ProcessRSN, // ProcessRSN
                            dataToInsert.FolderRSN, // FolderRsn
                            dataToInsert.ProcessCode,
                            dataToInsert.StartDate,
                            dataToInsert.AssignedUser,
                            dataToInsert.ScheduleDate,
                            dataToInsert.Periority,
                            dataToInsert.DisplayOrder,
                            dataToInsert.Comments,
                            dataToInsert.ProcessComments,
                            dataToInsert.StatusCode,
                            dataToInsert.ScheduleEndDate,
                            dataToInsert.Reference,
                            dataToInsert.IsNew,
                            dataToInsert.IsEdited,
                            dataToInsert.EndDate,
                            dataToInsert.FolderId,
                        ];

                        var syntax = "INSERT INTO FolderProcess (ProcessRSN,FOLDERRSN,ProcessCode,StartDate,AssignedUser,ScheduleDate,Priority,DisplayOrder,Comments,ProcessComment,StatusCode,ScheduleEndDate," +
                            " Reference,IsNew,Isedited,EndDate,FolderId)" +
                            "Values(?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?) ";
                        tx.executeSql(syntax, arrayValueInsert,
                            function (tx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }
                                deferred.resolve({ error: null, data: result.insertId });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertSearchFolderProcess", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");

                deferred.resolve({ error: error, data: null });

            }
        },
        insertSearchFolderProcessInfo: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "SELECT (select max(id) from folderprocessinfo) as Id ,infocode,processcode,displayorder,infovalue,datetime() as stampdate FROM defaultprocessInfo where ProcessCode=?";
                        tx.executeSql(syntax, [dataToInsert.ProcessCode],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var syntax = "INSERT INTO FolderProcessInfo Values(?, ?, ?, ?, ?,?,?,?,?) ";
                                        arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            dataToInsert.ProcessRSN,
                                            result.rows.item(i).infocode,
                                            result.rows.item(i).infovalue,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).stampdate,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            dataToInsert.ProcessId
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result != null && result != "" && result != undefined) {
                                                    console.log(result.insertId)
                                                }

                                                deferred.resolve({ error: null, data: "success" });

                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertSearchFolderProcessInfo", "error");

                                                deferred.resolve({ error: error, data: null });

                                            });
                                    }
                                }
                            });


                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");

                deferred.resolve({ error: error, data: null });

            }
        },
        insertSearchFolderProcessChecklist: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select (select max(id) from folderprocesschecklist) as Id, defaultchecklist.checklistcode,validchecklist.checklistdetail,'' as passed,'N' as notapplicableflag,defaultchecklist.mandatory," +
                            "defaultchecklist.displayorder,'' as stampdate,'' as enddate from defaultchecklist,validchecklist where defaultchecklist.checklistcode=validchecklist.checklistcode and defaultchecklist.processcode=?";
                        tx.executeSql(syntax, [dataToInsert.ProcessCode],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var syntax = "INSERT INTO folderprocesschecklist Values(?, ?, ?, ?, ?,?,?, ?, ?,?,?,?,?) ";
                                        var arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            dataToInsert.ProcessRSN,
                                            result.rows.item(i).checklistcode,
                                            result.rows.item(i).checklistdetail,
                                            result.rows.item(i).passed,
                                            result.rows.item(i).notapplicableflag,
                                            result.rows.item(i).mandatory,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).stampdate,
                                            result.rows.item(i).enddate,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            dataToInsert.ProcessId
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result != null && result !== "") {
                                                    console.log(result.insertId);
                                                }
                                                deferred.resolve({ error: null, data: "success" });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertSearchFolderProcessChecklist", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    }
                                }
                            });


                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");

                deferred.resolve({ error: error, data: null });

            }
        },
        insertFolder: function (dataToInsert) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {

                        syntax = "insert into folder (folderrsn,propertyrsn,foldertype,foldername,folderdescription,subcode,workcode,referencefile, " +
                            " foldercondition,indate,statuscode,parentrsn,propertyrsn,foldercentury,folderyear,isnew) " +
                            " Values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)";
                        tx.executeSql(syntax, dataToInsert,
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }

                                deferred.resolve({ error: null, data: result.insertId });

                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertFolder", "error");

                                deferred.resolve({ error: error, data: null });

                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderProperty: function (dataToInsert) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "SELECT (select max(id) from FolderProperty) as Id, ? as folderrsn, ? AS folderId, property.propertyrsn,'' as propertyrelationcode FROM property where property.propertyrsn=?";
                        tx.executeSql(syntax, [0, dataToInsert.FolderId, dataToInsert.PropertyRSN],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "INSERT INTO FolderProperty Values(?, ?, ?, ?, ?, ?)";
                                    arrayValueInsert = [
                                        result.rows.item(0).Id + 1,
                                        result.rows.item(0).folderrsn,
                                        result.rows.item(0).propertyrsn,
                                        result.rows.item(0).propertyrelationcode,
                                        dataToInsert.IsNew,
                                        result.rows.item(0).folderId,
                                    ];
                                    tx.executeSql(syntax, arrayValueInsert,
                                        function (itx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log(result.insertId)
                                            }

                                            deferred.resolve({ error: null, data: "success" });

                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function insertFolderProperty", "error");

                                            deferred.resolve({ error: error, data: null });

                                        });

                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderPeople: function (dataToInsert) {
            try {

                var recordcount = "0";
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select (select max(id) from folderpeople) as Id, ? as folderrsn ,? AS folderId, people.peoplersn,'' as relation from people where people.peoplersn=? ";
                        tx.executeSql(syntax, [0, dataToInsert.FolderId, dataToInsert.PeopleRSN],
                            function (tx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    syntax = "INSERT INTO FolderPeople Values(?, ?, ?, ?, ?, ? )";
                                    arrayValueInsert = [
                                        recordcount == "0" ? result.rows.item(0).Id + 1 : recordcount,
                                        result.rows.item(0).folderrsn,
                                        result.rows.item(0).peoplersn,
                                        dataToInsert.PeopleCode,
                                        dataToInsert.IsNew,
                                        result.rows.item(0).folderId
                                    ];
                                    tx.executeSql(syntax, arrayValueInsert,
                                        function (itx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log(result.insertId)
                                                recordcount = result.insertId;
                                            }
                                            deferred.resolve({ error: null, data: "success" });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function insertFolderPeople", "error");
                                            deferred.resolve({ error: error, data: null });

                                        });
                                }
                            }, function (tx, error) {
                                utilService.logtoConsole(error + " into function insertFolderPeople", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");

                deferred.resolve({ error: error, data: null });

            }
        },

        insertFolderInfo: function (dataToInsert) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select (select max(id) from folderinfo) as Id,? as folderrsn ,? as folderId, defaultinfo.infocode,defaultinfo.infovalue," +
                            "defaultinfo.mandatory,defaultinfo.displayorder,defaultinfo.requiredforinitialsetup from defaultinfo where foldertype=?";
                        tx.executeSql(syntax, [0, dataToInsert.FolderId, dataToInsert.FolderType],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    var i = 0;
                                    for (i = 0; i < result.rows.length; i++) {
                                        syntax = "INSERT INTO FolderInfo Values(?, ?, ?, ?, ?, ?, ?,?,?,?) ";
                                        arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            result.rows.item(i).folderrsn,
                                            result.rows.item(i).infocode,
                                            result.rows.item(i).infovalue,
                                            result.rows.item(i).mandatory,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).requiredforinitialsetup,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            result.rows.item(i).folderId
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result != null && result != "" && result != undefined) {
                                                    console.log(result.insertId)
                                                }
                                                //deferred.resolve({ error: null, data: "success" });

                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertFolderInfo", "error");

                                                //deferred.resolve({ error: error, data: null });

                                            });
                                    }
                                    if (i === result.rows.length) {
                                        deferred.resolve({ error: null, data: "success" });
                                    }

                                }
                                else {
                                    deferred.resolve({ error: null, data: null });
                                }
                            });


                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderProcess: function (dataToInsert, typeofinspection) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        arrayValueInsert = [
                            dataToInsert.ProcessRSN, // ProcessRSN
                            dataToInsert.FolderRSN, // FolderRsn
                            dataToInsert.ProcessCode,
                            dataToInsert.StartDate,
                            dataToInsert.AssignedUser,
                            dataToInsert.ScheduleDate,
                            dataToInsert.Periority,
                            dataToInsert.DisplayOrder,
                            dataToInsert.Comments,
                            dataToInsert.ProcessComments,
                            dataToInsert.StatusCode,
                            dataToInsert.ScheduleEndDate,
                            dataToInsert.Reference,
                            dataToInsert.IsNew,
                            dataToInsert.IsEdited,
                            dataToInsert.EndDate,
                            dataToInsert.FolderId,
                        ];

                        var syntax = "INSERT INTO FolderProcess (ProcessRSN,FOLDERRSN,ProcessCode,StartDate,AssignedUser,ScheduleDate,Priority,DisplayOrder,Comments,ProcessComment,StatusCode,ScheduleEndDate," +
                            " Reference,IsNew,Isedited,EndDate,FolderId)" +
                            "Values(?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?,?, ?,?) ";
                        tx.executeSql(syntax, arrayValueInsert,
                            function (tx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }
                                deferred.resolve({ error: null, data: result.insertId });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertFolderProcess", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderProcessInfo: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "SELECT (select max(id) from folderprocessinfo) as Id ,infocode,processcode,displayorder,infovalue,datetime() as stampdate FROM defaultprocessInfo where ProcessCode=?";
                        tx.executeSql(syntax, [dataToInsert.ProcessCode],
                            function (tx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    var i = 0;
                                    for (i = 0; i < result.rows.length; i++) {
                                        var syntax = "INSERT INTO FolderProcessInfo Values(?, ?, ?, ?, ?,?,?,?,?) ";
                                        var arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            dataToInsert.ProcessRSN,
                                            result.rows.item(i).infocode,
                                            result.rows.item(i).infovalue,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).stampdate,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            dataToInsert.ProcessId
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result && result != null && result !== "") {
                                                    console.log(result.insertId);
                                                }
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertFolderProcessInfo", "error");
                                            });
                                    }
                                    if (i === result.rows.length) {
                                        deferred.resolve({ error: null, data: "success" });
                                    }
                                } else {
                                    deferred.resolve({ error: null, data: "success" });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");

            }
        },

        saveRescheduledInspection: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update folderprocess set scheduledate = ?, scheduleenddate= ?, enddate=?, isreschedule = ?, reassigneduser=?, " +
                            " beforerescheduledate = (select CASE WHEN beforerescheduledate IS NULL THEN scheduledate END from  folderprocess where folderprocess.processrsn=? limit 1 ), " +
                            " beforerescheduleenddate = (select CASE WHEN beforerescheduleenddate IS NULL THEN scheduleenddate END from  folderprocess where folderprocess.processrsn=? limit 1 ) " +
                            " where folderprocess.processrsn=? ";
                        tx.executeSql(syntax, [dataToInsert.ReScheduleDate, dataToInsert.ReScheduleEndDate, dataToInsert.ReScheduleEndDate, dataToInsert.IsRescheduled, dataToInsert.reassignedUser, dataToInsert.ProcessRSN, dataToInsert.ProcessRSN, dataToInsert.ProcessRSN],
                            function (itx, result) {
                                if (result.rows && result.rowsAffected > 0) {
                                    //if (dataToInsert.AttempResultCode !== null && dataToInsert.AttempResultCode !== '' && dataToInsert.AttempResultCode !== undefined) {
                                    var updatesyntax = ''
                                    if (dataToInsert.IsNew != "Y") {
                                        updatesyntax = "update folderprocessattempt set attemptby=?, attemptdate=? where folderrsn=? and processrsn=?";
                                    } else {
                                        dataToInsert.ProcessRSN = dataToInsert.ProcessId
                                        updatesyntax = "update folderprocessattempt set attemptby=?, attemptdate=? where folderrsn=? and processid=?";
                                    }
                                    itx.executeSql(updatesyntax, [dataToInsert.AttemptBy, dataToInsert.AttemptDate, dataToInsert.FolderRSN, dataToInsert.ProcessRSN],
                                        function (iitx, result) {
                                            if (result.rows && result.rows.length > 0) {
                                                console.log("Folder Process Attempt Table's attemptby, attemptdate, updated for ProcessRSN: " + dataToInsert.ProcessRSN);
                                            }
                                            deferred.resolve({ error: null, data: "success" });
                                        },
                                        function (iitx, result) {
                                            deferred.resolve({ error: error, data: null });
                                        }
                                    )
                                    //}
                                    console.log("Folder Process Table's scheduledate, scheduleenddate, isreschedule  updated for ProcessRSN: " + dataToInsert.ProcessRSN);
                                    //deferred.resolve({ error: null, data: "success" });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function saveRescheduledInspection", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderProcessChecklist: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select (select max(id) from folderprocesschecklist) as Id, defaultchecklist.checklistcode,validchecklist.checklistdetail,'' as passed,'N' as notapplicableflag,defaultchecklist.mandatory," +
                            "defaultchecklist.displayorder,'' as stampdate,'' as enddate from defaultchecklist,validchecklist where defaultchecklist.checklistcode=validchecklist.checklistcode and defaultchecklist.processcode=?";
                        tx.executeSql(syntax, [dataToInsert.ProcessCode],
                            function (tx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var syntax = "INSERT INTO folderprocesschecklist Values(?, ?, ?, ?, ?,?,?, ?, ?,?,?,?,?) ";
                                        var arrayValueInsert = [
                                            result.rows.item(i).Id + 1 + i,
                                            dataToInsert.ProcessRSN,
                                            result.rows.item(i).checklistcode,
                                            result.rows.item(i).checklistdetail,
                                            result.rows.item(i).passed,
                                            result.rows.item(i).notapplicableflag,
                                            result.rows.item(i).mandatory,
                                            result.rows.item(i).displayorder,
                                            result.rows.item(i).stampdate,
                                            result.rows.item(i).enddate,
                                            dataToInsert.IsNew,
                                            dataToInsert.IsEdited,
                                            dataToInsert.ProcessId
                                        ];
                                        tx.executeSql(syntax, arrayValueInsert,
                                            function (itx, result) {
                                                if (result != null && result !== "") {
                                                    console.log(result.insertId);
                                                }
                                                deferred.resolve({ error: null, data: "success" });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function insertFolderProcessChecklist", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    }
                                } else {
                                    deferred.resolve({ error: null, data: "no checklist to add" });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPeopleData: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderpeople'", [],
                            function (tx, result) {
                                if (result.rows || result.rows.length > 0) {

                                    var sql = "SELECT People.*, VALIDPEOPLE.PEOPLEDESC as peopledesc, validpeoplestatus.statusdesc, " +
                                        "people.emailaddress, people.familyrsn, vp.peopledesc as Relation " +
                                        "FROM FOLDERPEOPLE Join People on FolderPeople.peoplersn = people.peoplersn " +
                                        "left JOIN VALIDPEOPLE  ON people.PEOPLECODE = VALIDPEOPLE.PEOPLECODE " +
                                        "left join validpeople vp on folderpeople.relation = vp.peoplecode " +
                                        "left join validpeoplestatus on people.statuscode = validpeoplestatus.statuscode " +
                                        "WHERE ((ifnull(FOLDERPEOPLE.IsNew,'')='Y' and FOLDERPEOPLE.folderid=?) OR (ifnull(FOLDERPEOPLE.IsNew,'')!='Y' and FOLDERPEOPLE.FolderRSN=?)) ";

                                    tx.executeSql(sql, [inboxItem.folderId, inboxItem.folderRSN],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getPeopleData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getPropertyData: function (inboxItem) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderproperty'", [],
                            function (tx, result) {
                                if (result.rows || result.rows.length > 0) {
                                    var sql = "SELECT Property.*, folderproperty.folderrsn, folderproperty.propertyrelationcode,validpropertystatus.statusdesc FROM FOLDERPROPERTY " +
                                        "join property on folderproperty.propertyrsn = property.propertyrsn " +
                                        "left join validpropertystatus on validpropertystatus.statuscode=property.statuscode " +
                                        "left join validproperty on validproperty.propcode=Property.propcode " +
                                        "WHERE  ((ifnull(FOLDERPROPERTY.IsNew,'')='Y' and FOLDERPROPERTY.folderid=?) OR (ifnull(FOLDERPROPERTY.IsNew,'')!='Y' and FOLDERPROPERTY.FolderRSN=?))";
                                    tx.executeSql(sql, [inboxItem.folderId, inboxItem.folderRSN],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getPropertyData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderData: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folder'", [],
                            function (tx, result) {
                                if (result.rows || result.rows.length > 0) {
                                    var sql = "SELECT *, ifnull(VALIDSTATUS.STATUSDESC,'') STATUSDESC, ifnull(VALIDSUB.SUBDESC,'') SUBDESC, " +
                                        " ifnull(VALIDWORK.WORKDESC,'') WORKDESC, ifnull(VALIDFOLDERGROUP.FOLDERGROUPDESC,'') FOLDERGROUPDESC, FOLDER.id as folderId,FOLDER.isnew as isNew " +
                                        " FROM FOLDER  " +
                                        " INNER JOIN VALIDFOLDER ON FOLDER.FOLDERTYPE = VALIDFOLDER.FOLDERTYPE " +
                                        " Inner JOIN VALIDMOBILEFOLDERTYPE ON FOLDER.FOLDERTYPE=VALIDMOBILEFOLDERTYPE.FOLDERTYPE " +
                                        " LEFT JOIN VALIDSTATUS ON FOLDER.STATUSCODE = VALIDSTATUS.STATUSCODE  " +
                                        " LEFT JOIN VALIDSUB ON FOLDER.SUBCODE = VALIDSUB.SUBCODE   " +
                                        " LEFT JOIN VALIDWORK ON FOLDER.WORKCODE = VALIDWORK.WORKCODE  " +
                                        " LEFT JOIN VALIDFOLDERGROUP ON VALIDMOBILEFOLDERTYPE.FOLDERGROUPCODE = VALIDFOLDERGROUP.FOLDERGROUPCODE " +
                                        " WHERE ((ifnull(Folder.IsNew,'')='Y' and Folder.id=?) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=?)) ";
                                    tx.executeSql(sql, [inboxItem.folderId, inboxItem.folderRSN],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderInfoData: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderinfo'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    var sql = "SELECT Distinct folderinfo.folderrsn as folderrsn, validinfo.INFOGROUP, " +
                                        "validinfo.INFOTYPE as infotype, " +
                                        "validinfo.INFODESC as infodesc," +
                                        "validinfo.INFODESC2 as infodesc2, " +
                                        "validinfo.INFOCODE as infocode, " +
                                        "FOLDERINFO.INFOVALUE as infovalue,FOLDERINFO.DISPLAYORDER,FOLDERINFO.VALUEREQUIRED, FOLDERINFO.MANDATORY " +
                                        "FROM FOLDERINFO , validinfo " +
                                        "WHERE folderinfo.infocode = validinfo.infocode and  ((ifnull(FOLDERINFO.IsNew,'')='Y' and FOLDERINFO.folderid=?) OR (ifnull(FOLDERINFO.IsNew,'')!='Y' and FOLDERINFO.FolderRSN=?))" +
                                        "ORDER BY validinfo.INFOGROUP,FOLDERINFO.DISPLAYORDER ASC ";
                                    tx.executeSql(sql, [inboxItem.folderId, inboxItem.folderRSN],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderInfoData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessInfoData: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderprocessinfo'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    var sql = "SELECT  DISTINCT folderprocessinfo.processrsn as processrsn, validprocessinfo.INFOGROUP, " +
                                        "validprocessinfo.INFOTYPE as infotype, " +
                                        "validprocessinfo.INFODESC as infodesc," +
                                        "validprocessinfo.INFODESC2 as infodesc2, " +
                                        "validprocessinfo.INFOCODE as infocode, " +
                                        "folderprocessinfo.INFOVALUE as infovalue, defaultprocess.mandatoryflag " +
                                        "FROM folderprocessinfo " +
                                        "join validprocessinfo on folderprocessinfo.infocode = validprocessinfo.infocode " +
                                        "join defaultprocessinfo on validprocessinfo.infocode=defaultprocessinfo.infocode " +
                                        "left join defaultprocess on defaultprocess.processcode = defaultprocessinfo.processcode " +
                                        "WHERE ((ifnull(folderprocessinfo.IsNew,'')='Y' and folderprocessinfo.processid=?) OR (ifnull(folderprocessinfo.IsNew,'')!='Y' and folderprocessinfo.processrsn=?))   and defaultprocess.foldertype = ? " +
                                        "ORDER BY validprocessinfo.INFOGROUP ";

                                    tx.executeSql(sql, [inboxItem.processId, inboxItem.processRSN, inboxItem.folderType],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderProcessInfoData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getValidInfovalues: function (infocode) {
            try {
                var infoCode = infocode;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validinfovalue.infodesc as infodesc, validinfovalue.infocode as infocode, " +
                            " validinfovalue.infovalue as infovalue " +
                            " FROM validinfo join validinfovalue on validinfo.infocode = validinfovalue.infocode WHERE " +
                            " validinfovalue.infocode in {0} ";
                        var sql = String.format(query, "(" + infoCode + ")");
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidInfovalues", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidProcessInfovalues: function (infocode) {
            try {

                var infoCode = infocode;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validprocessinfo.infodesc as infodesc, validprocessinfovalue.infocode as infocode, " +
                            "validprocessinfovalue.infovalue as infovalue " +
                            "FROM validprocessinfo join validprocessinfovalue on validprocessinfo.infocode = validprocessinfovalue.infocode WHERE " +
                            "validprocessinfovalue.infocode in {0} "
                        var sql = String.format(query, "(" + infoCode + ")");
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidProcessInfovalues", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        updateValidInfovalues: function (newValue, infocode, folderrsn) {
            try {
                var me = this;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "update folderinfo set infovalue =?, isedited ='Y'  WHERE infocode =? and folderrsn =?";
                        tx.executeSql(query, [newValue, infocode, folderrsn],
                            function (tx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function updateValidInfovalues", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        updateValidProcessInfovalues: function (newValue, infocode, processrsn, inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        query = "update folderprocessinfo set infovalue =?, isedited='Y' WHERE infocode =? and processrsn =?";
                        tx.executeSql(sql, [newValue, infocode, processrsn],
                            function (tx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function updateValidProcessInfovalues", "error");
                                deferred.resolve({ error: error, data: 'failed' });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessChecklistData: function (inboxItem) {
            try {
                var processrsn = inboxItem.processRSN;
                var processchecklist = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var sql = "select validchecklist.checklistdesc, folderprocesschecklist.processrsn,validchecklist.checklistgroupdesc, validchecklist.checklistgroupcode, folderprocesschecklist.checklistcode, folderprocesschecklist.checklistcomment, " +
                            "folderprocesschecklist.passed, folderprocesschecklist.notapplicableflag from validchecklist join " +
                            "folderprocesschecklist on validchecklist.checklistcode = folderprocesschecklist.checklistcode " +
                            "where ((ifnull(folderprocesschecklist.IsNew,'')='Y' and folderprocesschecklist.processid=?) OR (ifnull(folderprocesschecklist.IsNew,'')!='Y' and folderprocesschecklist.processrsn=?))   order by validchecklist.checklistgroupcode";
                        tx.executeSql(sql, [inboxItem.processId, inboxItem.processRSN],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: process checklist");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        processchecklist.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: processchecklist });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getFolderProcessChecklistData", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: error, data: null });
            }
        },

        updateValidChecklistvalues: function (passed, flag, checklistcode, processrsn) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = 'update folderprocesschecklist set passed =? , notapplicableflag = ?, isedited="Y",' +
                               ' startdate="' + moment(new Date()).format('YYYY-MM-DD hh:mm:ss') + '",' +
                               ' enddate="' + moment(new Date()).format('YYYY-MM-DD hh:mm:ss') + '"' +
                               ' WHERE checklistcode =? and processrsn =?';
                        tx.executeSql(query, [passed, flag, checklistcode, processrsn],
                            function (tx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function updateValidChecklistvalues", "error");
                                deferred.resolve({ error: error, data: 'failed' });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        updateNAChecklistFlag: function (flag, checklistcode, processrsn) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = 'update folderprocesschecklist set passed ="" , notapplicableflag =? , isedited="Y",' +
                                ' startdate="' + moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + '",' +
                                ' enddate="' + moment(new Date()).format("YYYY-MM-DD HH:mm:ss") + '"' +
                                ' WHERE checklistcode =? and processrsn =?';
                        tx.executeSql(query, [flag, checklistcode, processrsn],
                            function (tx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function updateNAChecklistFlag", "error");
                                deferred.resolve({ error: error, data: 'failed' });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidClauseData: function () {
            try {
                var validclause = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select validclause.clausegroup, validclause.clausetext from validclause ";
                        var sql = String.format(query);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: process valid clause");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        validclause.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: validclause });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidClauseData", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        updateChecklistcomment: function (comment, checklistcode, processrsn) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "update folderprocesschecklist set checklistcomment = ?  WHERE checklistcode=? and processrsn =?";
                        tx.executeSql(query, [comment, checklistcode, processrsn],
                          function (tx, result) {
                              deferred.resolve({ error: null, data: 'success' });
                          }, function (itx, error) {
                              utilService.logtoConsole(error + " into function updateChecklistcomment", "error");
                              deferred.resolve({ error: error, data: 'failed' });
                          });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessDeficiencyData: function (inboxitem) {
            try {
                var processrsn = inboxitem.processRSN;
                if (processrsn != null && processrsn != undefined) {
                    var deficiency = [];
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            var query = "select validprocessdeficiency.defaultstatuscode as statuscode,validprocessdeficiency.defaultseveritycode as severitycode, " +
                            " validprocessdeficiency.defaultlocationdesc as locationdesc,  validprocessdeficiency.defaultsublocationdesc as sublocationdesc, " +
                            " validdeficiency.categorycode,validdeficiencycategory.categorydesc,validdeficiency.subcategorycode, validdeficiencysubcategory.subcategorydesc, " +
                            " validdeficiency.deficiencycode,  validdeficiency.deficiencydesc,  " +
                            " validdeficiency.deficiencytext ,  folderprocess.processrsn, case when folderprocess.processrsn=0 then  folderprocess.id end as processid    " +
                            " from validdeficiency    " +
                            " inner join validprocessdeficiency on validdeficiency.deficiencycode = validprocessdeficiency.deficiencycode  " +
                            " inner join validdeficiencycategory on validdeficiency.categorycode=validdeficiencycategory.categorycode " +
                            " inner join validdeficiencysubcategory on validdeficiency.subcategorycode=validdeficiencysubcategory.subcategorycode " +
                            " left join folderprocess on validprocessdeficiency.processcode = folderprocess.processcode    " +
                            " where  ((ifNull(folderprocess.IsNew,'')='Y' and folderprocess.ID=?) OR (ifNull(folderprocess.IsNew,'') !='Y' and folderprocess.processrsn =?))";
                            tx.executeSql(query, [processrsn, processrsn],
                                function (tx, result) {
                                    var record = null;
                                    if (result.rows && result.rows.length > 0) {
                                        utilService.logtoConsole("Result Found: valid process deficiency");
                                        for (var i = 0; i < result.rows.length; i++) {
                                            record = result.rows.item(i);
                                            deficiency.push(record);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: deficiency });
                                }, function (itx, error) {
                                    utilService.logtoConsole(error + " into function getFolderProcessDeficiencyData", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getDeficiencyList: function (inboxitem) {
            try {
                var processrsn = inboxitem.processRSN;
                if (processrsn != null && processrsn != undefined) {
                    var processdeficiency = [];
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            var query = "select folderprocessdeficiency.*, validdeficiency.deficiencydesc " +
                                " from folderprocessdeficiency  " +
                                " join validdeficiency on validdeficiency.deficiencycode = folderprocessdeficiency.deficiencycode " +
                                " join folderprocess on ((ifNull(folderprocess.IsNew,'')='Y' and folderprocess.ID=folderprocessdeficiency.processid) OR (ifNull(folderprocess.IsNew,'') !='Y' and folderprocess.processrsn =folderprocessdeficiency.processrsn))" +
                                " where ((ifNull(folderprocess.IsNew,'')='Y' and folderprocess.ID=({0})) OR (ifNull(folderprocess.IsNew,'') !='Y' and folderprocess.processrsn in ({0})))";
                            //var query = "select * from folderprocessdeficiency where folderprocessdeficiency.processrsn in {0}";
                            var sql = String.format(query, "(" + processrsn + ")");
                            tx.executeSql(sql, [],
                                function (tx, result) {
                                    var record = null;
                                    if (result.rows && result.rows.length > 0) {
                                        utilService.logtoConsole("Result Found: process deficiency");
                                        for (var i = 0; i < result.rows.length; i++) {
                                            record = result.rows.item(i);
                                            processdeficiency.push(record);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: processdeficiency });
                                }, function (itx, error) {
                                    utilService.logtoConsole(error + " into function getDeficiencyList", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        saveDeficiencyToDatabase: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var querySyntax = "select 1 from folderprocessdeficiency where deficiencycode = ? and processrsn = ? and occurancecount = ? and locationdesc = ? and sublocationdesc = ?";
                        tx.executeSql(querySyntax, [dataToInsert[1], dataToInsert[0], dataToInsert[12], dataToInsert[6], dataToInsert[7]],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    var syntax = "update folderprocessdeficiency  set occurancecount=occurancecount+1 where deficiencycode = ? and processrsn = ? and occurancecount = ? and locationdesc = ? and sublocationdesc = ?";
                                    itx.executeSql(syntax, [dataToInsert[1], dataToInsert[0], dataToInsert[12], dataToInsert[6], dataToInsert[7]],
                                        function (iitx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log(result.rowsAffected);
                                            }
                                            deferred.resolve({ error: null, data: result.rowsAffected });
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error + " into function saveDeficiencyToDatabase", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                } else {
                                    var syntax = "insert into folderprocessdeficiency (processrsn, deficiencycode, deficiencytext, insertdate, complybydate, datecomplied, " +
                                        "locationdesc, sublocationdesc, statuscode, severitycode, actioncode, referencenum, occurancecount, remedytext, stampdate, " +
                                        "deficiencyid,isnew, isedited,processid) " +
                                        " Values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?,?,?,?)";
                                    itx.executeSql(syntax, dataToInsert,
                                        function (iitx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log(result.rowsAffected);
                                            }
                                            deferred.resolve({ error: null, data: result.rowsAffected });
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error, "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        deleteDeficiencyFromDatabase: function (addedDeficiency, inboxitem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "delete from folderprocessdeficiency where deficiencycode = ? and processrsn = ? and occurancecount = ? and locationdesc = ? and sublocationdesc = ?";
                        tx.executeSql(query, [addedDeficiency.deficiencycode, inboxitem.processRSN, addedDeficiency.occurancecount, addedDeficiency.locationdesc, addedDeficiency.sublocationdesc],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.rowsAffected);
                                }
                                deferred.resolve({ error: null, data: result });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function deleteDeficiencyFromDatabase", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidProcessSeverity: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validprocessseverity.severitycode, validprocessseverity.severitydesc from validprocessseverity ";
                        var sql = String.format(query);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidProcessSeverity", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidProcessLocation: function (inboxitem) {
            try {
                var dt = [];
                var processrsn = inboxitem.processRSN;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validprocesslocation.locationdesc from validprocesslocation inner join folderprocess " +
                            "on validprocesslocation.processcode = folderprocess.processcode where folderprocess.processrsn in ({0})";
                        var sql = String.format(query, processrsn);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidProcessLocation", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidDeficiencyRemedy: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select validdeficiencyremedy.remedycode, validdeficiencyremedy.remedytext from validdeficiencyremedy " +
                            "join folderprocessdeficiency on validdeficiencyremedy.deficiencycode = folderprocessdeficiency.deficiencycode";
                        var sql = String.format(query);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidDeficiencyRemedy", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidDeficiencyStatus: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validdeficiencystatus.statuscode, validdeficiencystatus.statusdesc from validdeficiencystatus ";
                        var sql = String.format(query);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidDeficiencyStatus", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidDeficiencyAction: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "SELECT validdeficiencyaction.actioncode, validdeficiencyaction.actiondesc from validdeficiencyaction ";
                        var sql = String.format(query);
                        tx.executeSql(sql, [],
                            function (tx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidDeficiencyAction", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        updateDeficiency: function (def, inboxitem) {
            try {
                var processrsn = inboxitem.processRSN;
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var dataToInsert = [
                            def.deficiencycode,
                            def.deficiencytext,
                            def.remedytext,
                            def.severitycode,
                            def.statuscode,
                            def.locationdesc,
                            def.sublocationdesc,
                            def.actioncode,
                            def.datecomplied,
                            def.complybydate,
                            def.insertdate,
                            def.referencenum,
                            def.occurancecount,
                            def.stampdate,
                            def.deficiencyid,
                            def.processid == "" ? 0 : def.processid,
                            "Y",
                            "Y"
                        ];

                        syntax = "select * from folderprocessdeficiency where folderprocessdeficiency.id =?"; // this is ID is local table id
                        tx.executeSql(syntax, [def.id],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    var colArray = [
                                        "deficiencycode",
                                        "deficiencytext",
                                        "remedytext",
                                        "severitycode",
                                        "statuscode",
                                        "locationdesc",
                                        "sublocationdesc",
                                        "actioncode",
                                        "datecomplied",
                                        "complybydate",
                                        "insertdate",
                                        "referencenum",
                                        "occurancecount",
                                        "stampdate",
                                        "deficiencyid",
                                        "processid",
                                        "isnew",
                                        "isedited"
                                    ]
                                    var setStatement = "";
                                    for (var j = 0; j <= colArray.length - 1; j++) {
                                        if (!$.isNumeric(dataToInsert[j])) {
                                            dataToInsert[j] = "'" + dataToInsert[j] + "'";
                                        }
                                        setStatement += colArray[j] + " = " + dataToInsert[j] + ",";
                                    }
                                    setStatement = setStatement.substring(0, setStatement.lastIndexOf(","));
                                    setStatement = "SET " + setStatement;


                                    var updatesyntax = "update folderprocessdeficiency  {0} where  folderprocessdeficiency.id= {1} ";
                                    updatesyntax = String.format(updatesyntax, setStatement, def.id);
                                    tx.executeSql(updatesyntax, [],
                                        function (tt, result) {
                                            if (result.rowsAffected >= 0) {
                                                var rows = result.rowsAffected;
                                            }
                                            deferred.resolve({ error: null, data: rows });
                                        },
                                        function (tt, error) {
                                            utilService.logtoConsole(error + " into function updateDeficiency", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                } else {
                                    var insertsyntax = "insert into folderprocessdeficiency (processrsn,deficiencycode,deficiencytext,remedytext,severitycode,statuscode," +
                                        "locationdesc,sublocationdesc,actioncode,datecomplied,complybydate,insertdate,referencenum,occurancecount,stampdate," +
                                        "deficiencyid,processid,isnew, isedited) values (" + processrsn + ", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?) "
                                    tx.executeSql(insertsyntax, dataToInsert,
                                        function (itx, result) {
                                            if (result.rowsAffected >= 0) {
                                                var rows = result.rowsAffected;
                                            }
                                            deferred.resolve({ error: null, data: rows });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function updateDeficiency", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            }, function (error) {
                                utilService.logtoConsole(error + " into function updateDeficiency", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getInspectionResultData: function (inboxitem) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select ifnull(folderprocessattempt.id,-1) as attemptid, folderprocess.processrsn, folderprocess.id, ifnull(folderprocess.IsNew,'') as isnew," +
                            " validprocess.processdesc," +
                            " folderprocess.scheduledate as schedulestartdate, folderprocess.displayorder,  folderprocess.enddate, folderprocess.assigneduser, " +
                            " validprocess.processcode,folderprocess.startdate,folderprocess.scheduleenddate, folderprocess.statuscode,validprocessstatus.statusdesc, " +
                            " (select count(*) from folderprocessattempt where folderrsn=? and processrsn= ? and attemptrsn > 0 ) as attemptcount, " +
                            " folderprocess.processcomment, folderprocess.priority, folderprocess.reference, folderprocess.folderrsn,folderprocess.folderid, " +
                            " ifnull(folderprocessattempt.attemptcomment,'') as attemptcomment, " +
                            " ifnull(folderprocessattempt.resultcode,'') as resultcode, " +
                            " ifnull(folderprocessattempt.overtime,'') as overtime, " +
                            " ifnull(folderprocessattempt.timeunit,'') as timeunit, " +
                            " ifnull(folderprocessattempt.unittype,'') as unittype, " +
                            " ifnull(folderprocessattempt.expenseamount,'') as expenseamount, " +
                            " ifnull(folderprocessattempt.mileageamount,'') as mileageamount , folderprocessattemptsignature.signaturetype , folderprocess.isreschedule," +
                            " ifnull(folderprocess.inspminute,'') as inspminute " +
                            " from folderprocess " +
                            " left join validprocess on validprocess.processcode=folderprocess.processcode" +
                            " left join validprocessstatus on validprocessstatus.statuscode=folderprocess.statuscode" +
                            " left join folderprocessattempt on ((ifnull(folderprocess.IsNew,'')='Y' and folderprocessattempt.folderrsn=folderprocess.folderid ) OR (folderprocess.folderrsn!=0 and folderprocessattempt.folderrsn=folderprocess.folderrsn) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocessattempt.folderrsn=folderprocess.folderrsn ))" +
                            " and ((ifnull(folderprocess.IsNew,'')='Y' and folderprocessattempt.processid=folderprocess.id ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocessattempt.processrsn=folderprocess.processrsn )) and folderprocessattempt.attemptrsn=0" +
                            " left join folderprocessattemptsignature on folderprocessattemptsignature.processrsn =folderprocess.processrsn and folderprocessattemptsignature.processid=folderprocess.id" +
                            " where  ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=? ))";
                        tx.executeSql(syntax, [inboxitem.folderRSN, inboxitem.processRSN, inboxitem.processId, inboxitem.processRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    dt = result.rows.item(0);
                                    if (dt.attemptid === -1) {
                                        //insert statement
                                        //dt.attemptid=return from insert 
                                        var insertsql = "insert into folderprocessattempt (folderrsn, processrsn, attemptrsn, processid) values (?, ?, ?,?)";
                                        tx.executeSql(insertsql, [inboxitem.folderRSN, inboxitem.processRSN, 0, inboxitem.processId],
                                            function (tx, result) {
                                                if (result && result.insertId && result.insertId > 0) {
                                                    dt.attemptid = result.insertId;
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            }, function (tx, error) {
                                                utilService.logtoConsole(error + " into function getInspectionResultData", 'error');
                                                deferred.resolve({ error: null, data: dt });
                                            });


                                    } else {
                                        deferred.resolve({ error: null, data: dt });
                                    }
                                } else {
                                    utilService.logtoConsole('no rows found for getInspectionResultData');
                                    deferred.resolve({ error: null, data: null });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getInspectionResultData", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessAttemptResultCode: function (inboxitem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from ValidProcessAttemptResult left join DefaultAttemptResult on ValidProcessAttemptResult.ResultCode = DefaultAttemptResult.ResultCode where DefaultAttemptResult.ProcessCode =?";
                        tx.executeSql(syntax, [inboxitem.processTypeCode],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getFolderProcessAttemptResultCode", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getProcessAttemptSignature: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select optionvalue from validsitemobileoption where optionkey='Signature Types'";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getProcessAttemptSignature", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertFolderProcessAttempt: function (item) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var updatesyntax = '';
                        if (item.IsNew != "Y") {
                            updatesyntax = "update folderprocessattempt set attemptby=?, attemptdate=? where folderrsn=? and processrsn=?";
                        } else {
                            if (item.ProcessRSN === 0)
                                item.ProcessRSN = item.ProcessId
                            if (item.FolderRSN === 0)
                                item.FolderRSN = item.FolderId
                            updatesyntax = "update folderprocessattempt set attemptby=?, attemptdate=? where folderrsn=? and processid=?";
                        }
                        tx.executeSql(updatesyntax, [item.AttemptBy, item.AttemptDate, item.FolderRSN, item.ProcessRSN],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log("Folder Process Attempt Table's attemptby, attemptdate updated for ProcessRSN: " + item.ProcessRSN);
                                    var updateStatement = "";
                                    var isedited = "";
                                    if (item.FolderRSN === 0) {
                                        isedited = 'N';
                                        updateStatement = "update folderprocess set enddate=?, isedited=? where " +
                                            " ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.folderid=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.folderrsn=? )) " +
                                            " and ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=? ))";
                                    } else {
                                        isedited = 'Y';
                                        updateStatement = "update folderprocess set enddate=?, isedited=? where " +
                                            " ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.folderid=? ) and (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.folderrsn=? )) " +
                                            " Or ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=? ))";
                                    }
                                    itx.executeSql(updateStatement, [item.AttemptDate, isedited, item.FolderId, item.FolderRSN, item.ProcessId, item.ProcessRSN],
                                        function (iitx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log("Folder Process Table's ProcessComment updated for ProcessRSN: " + item.ProcessRSN);
                                            }
                                            deferred.resolve({ error: null, data: "success" });
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error + " into function insertFolderProcessAttempt", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertFolderProcessAttempt", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getHistoryProcessAttempt: function (inboxitem) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select historyprocessattempt.folderrsn,historyprocessattempt.processrsn,historyprocessattempt.processcomment,historyprocessattempt.scheduledate, " +
                            " historyprocessattempt.enddate, historyprocessattempt.statuscode, validprocessstatus.statusdesc, historyprocessattempt.processcode, validprocess.processdesc " +
                            " from historyprocessattempt " +
                            " left join validprocessattemptresult on historyprocessattempt.resultcode=validprocessattemptresult.resultcode   " +
                            " left join validprocessstatus on validprocessstatus.statuscode=historyprocessattempt.statuscode   " +
                            " left join validprocess on validprocess.processcode=historyprocessattempt.processcode " +
                            " where historyprocessattempt.folderrsn=? order by 2 desc";
                        tx.executeSql(syntax, [inboxitem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getHistoryProcessAttempt", "error");
                                deferred.resolve({ error: error, data: null });
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getHistoryProcessAttemptByProcessRSN: function (inboxitem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select historyprocessattempt.folderrsn,historyprocessattempt.processrsn,historyprocessattempt.attemptrsn,historyprocessattempt.attemptby, validuser.username, " +
                            " historyprocessattempt.attemptdate,historyprocessattempt.attemptcomment,historyprocessattempt.processcomment,historyprocessattempt.resultcode,validprocessattemptresult.resultdesc " +
                            " from historyprocessattempt left join validprocessattemptresult on historyprocessattempt.resultcode=validprocessattemptresult.resultcode " +
                            " left join validuser on validuser.userid=historyprocessattempt.attemptby " +
                            " where historyprocessattempt.processrsn=?";
                        tx.executeSql(syntax, [inboxitem.processrsn],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getHistoryProcessAttemptByProcessRSN", "error");
                                deferred.resolve({ error: error, data: null });
                            })
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getHistoryProcessChecklist: function (inboxitem) {
            try {
                var processchecklist = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var sql = "select validchecklist.checklistdesc, historyprocesschecklist.processrsn,validchecklist.checklistgroupdesc, validchecklist.checklistgroupcode, historyprocesschecklist.checklistcode, historyprocesschecklist.checklistcomment, " +
                            " historyprocesschecklist.passed, historyprocesschecklist.notapplicableflag from validchecklist join  " +
                            " historyprocesschecklist on validchecklist.checklistcode = historyprocesschecklist.checklistcode  " +
                            " where historyprocesschecklist.processrsn=?  order by validchecklist.checklistgroupcode";
                        tx.executeSql(sql, [inboxitem.processrsn],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: history process checklist");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        processchecklist.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: processchecklist });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getHistoryProcessChecklist", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getHistoryProcessInfoData: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderprocessinfo'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    var sql = "SELECT  DISTINCT historyprocessinfo.processrsn as processrsn, validprocessinfo.INFOGROUP, validprocessinfo.INFOTYPE as infotype,validprocessinfo.INFODESC as infodesc," +
                                        " validprocessinfo.INFODESC2 as infodesc2, validprocessinfo.INFOCODE as infocode, historyprocessinfo.INFOVALUE as infovalue, defaultprocess.mandatoryflag " +
                                        " FROM historyprocessinfo join validprocessinfo on historyprocessinfo.infocode = validprocessinfo.infocode " +
                                        " join defaultprocessinfo on validprocessinfo.infocode=defaultprocessinfo.infocode " +
                                        " left join defaultprocess on defaultprocess.processcode = defaultprocessinfo.processcode " +
                                        " WHERE historyprocessinfo.processrsn = ? and  defaultprocess.foldertype =?  ORDER BY validprocessinfo.INFOGROUP ";

                                    tx.executeSql(sql, [inboxItem.processrsn, inboxItem.folderType],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getHistoryProcessInfoData", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getHistoryProcessDeficiencyList: function (inboxitem) {
            try {
                var processrsn = inboxitem.processrsn;
                var processdeficiency = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select * from historyprocessdeficiency where historyprocessdeficiency.processrsn =?";
                        tx.executeSql(query, [processrsn],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: history process deficiency");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        processdeficiency.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: processdeficiency });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getHistoryProcessDeficiencyList", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getHistoryInspectionComments: function (inboxitem) {
            try {
                var processrsn = inboxitem.processrsn;
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select * from folderinspectionrequest where folderinspectionrequest.processrsn =?";
                        tx.executeSql(query, [processrsn],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: inspection comments");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getHistoryInspectionComments", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getAttachmentType: function () {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var query = "select * from validattachment";
                        tx.executeSql(query, [],
                            function (tx, result) {
                                var record = null;
                                if (result.rows && result.rows.length > 0) {
                                    utilService.logtoConsole("Result Found: attachment types");
                                    for (var i = 0; i < result.rows.length; i++) {
                                        record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            }, function (itx, error) {
                                utilService.logtoConsole(error + " into function getAttachmentType", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getAllAttachment: function (inboxitem) {
            try {
                var processrsn = inboxitem.processRSN;
                var processid = inboxitem.processId;
                var folderrsn = inboxitem.folderRSN;
                if (processrsn != null && processrsn != undefined && folderrsn != null && folderrsn != undefined && processid != null && processid != undefined) {
                    var dt = [];
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            var query = "select validsitemobileoption.optionkey,validsitemobileoption.optionvalue from validsitemobileoption where validsitemobileoption.optionkey='Attachment Source'";
                            tx.executeSql(query, [],
                                function (itx, result) {
                                    utilService.logtoConsole("Result Found: get all attachment");
                                    var record = null;
                                    var source = "Folder";
                                    if (result.rows && result.rows.length > 0) {
                                        source = result.rows.item(0).optionvalue;
                                    }
                                    var queryattachment;
                                    if (source === "Folder") {
                                        queryattachment = "select tablersn,attachmentrsn,validattachment.attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix," +
                                        " attachmentcontenttype,attchmentcode,tablename, blob  ,validattachment.attachmentdesc as attachmenttypedesc, attachment.attachmentdesc as desc,attachment.id as attachmentrowid " +
                                        " from attachment  " +
                                        " left join validattachment on validattachment.attachmentcode=attachment.attchmentcode  " +
                                        " where tablename in ('FOLDER', 'Folder') AND tablersn=" + folderrsn + " " +
                                        " UNION   " +
                                        "select tablersn,attachmentrsn,validattachment.attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix," +
                                        " attachmentcontenttype,attchmentcode,tablename, blob  ,validattachment.attachmentdesc as attachmenttypedesc, attachment.attachmentdesc as desc,attachment.id as attachmentrowid " +
                                        " from attachment  " +
                                        " left join validattachment on validattachment.attachmentcode=attachment.attchmentcode  " +
                                        " where tablename in ('FOLDER_PROCESS', 'FolderProcess') and tablersn=" + processrsn + "" +
                                        " UNION  " +
                                        " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail, " +
                                        " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,   " +
                                        " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,    " +
                                        " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,    " +
                                        " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob , " +
                                        " validattachment.attachmentdesc as attachmenttypedesc , validattachment.attachmentdesc as desc ,folderprocessattemptsignature.id as attachmentrowid      " +
                                        " from folderprocessattemptsignature  " +
                                        " left join validattachment on validattachment.attachmentcode=folderprocessattemptsignature.attchmentcode  " +
                                        " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=" + processid + ") OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=" + processrsn + "))";
                                    } else {
                                        queryattachment = "select tablersn,attachmentrsn,validattachment.attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix," +
                                        " attachmentcontenttype,attchmentcode,tablename, blob  ,validattachment.attachmentdesc as attachmenttypedesc, attachment.attachmentdesc as desc,attachment.id as attachmentrowid " +
                                        " from attachment  " +
                                        " left join validattachment on validattachment.attachmentcode=attachment.attchmentcode  " +
                                        " where tablename in ('FOLDER_PROCESS', 'FolderProcess') and tablersn=" + processrsn + " " +
                                        " UNION     " +
                                        " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail,   " +
                                        " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,   " +
                                        " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,    " +
                                        " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,    " +
                                        " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob , " +
                                         " validattachment.attachmentdesc as attachmenttypedesc , validattachment.attachmentdesc as desc ,folderprocessattemptsignature.id as attachmentrowid      " +
                                        " from folderprocessattemptsignature  " +
                                        " left join validattachment on validattachment.attachmentcode=folderprocessattemptsignature.attchmentcode  " +
                                        " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=" + processid + ") OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=" + processrsn + ")) ";

                                    }

                                    itx.executeSql(queryattachment, [],
                                        function (iitx, result) {
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    record = result.rows.item(i);
                                                    dt.push(record);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error + " into function getAllAttachment", "error");

                                            deferred.resolve({ error: error, data: null });
                                        });


                                }, function (itx, error) {
                                    utilService.logtoConsole(error + " into function getAllAttachment", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertAttachment: function (dataToInsert) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "INSERT INTO attachment (tablersn,attachmentrsn,attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix,attachmentcontenttype," +
                            " tablename, attchmentcode,blob,isnew,isedited,processid) Values(?,?,?, ?,?,?, ?,?,?, ?,?,?,?)";
                        arrayValueInsert = [
                            dataToInsert.TableRSN,
                            dataToInsert.AttachmentRSN,
                            dataToInsert.AttachmentDesc,
                            dataToInsert.AttachmentDetails,
                            dataToInsert.AttachmentFileAlias,
                            dataToInsert.AttachmentFileSuffix,
                            dataToInsert.AttachmentFileContentType,
                            dataToInsert.TableName,
                            dataToInsert.AttachmentCode,
                            dataToInsert.AttachmentBlob,
                            dataToInsert.IsNew,
                            dataToInsert.IsEdited,
                            dataToInsert.TableRSN
                        ];
                        tx.executeSql(syntax, arrayValueInsert,
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log(result.insertId)
                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function insertAttachment", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        deleteAttachment: function (dataToDelete) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "delete from attachment where tablersn=" + "'" + dataToDelete.tablersn + "'" + " and attachmentfilealias=" + "'" + dataToDelete.attachmentfilealias + "'" + " and attchmentcode= " + "'" + dataToDelete.attchmentcode + "'" + " and isnew='Y'";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result && result.rowsAffected > 0) {
                                    console.log("Attachment deleted.")
                                    deferred.resolve({ error: null, data: "success" });
                                } else {
                                    // Delete it from folderprocessattemptsignature if any
                                    var syntax = "delete from folderprocessattemptsignature  where signaturetype=? and processrsn =?"
                                    itx.executeSql(syntax, [dataToDelete.attachmentdesc, dataToDelete.tablersn],
                                   function (iitx, result) {
                                       if (result && result.rowsAffected > 0) {
                                           console.log("Attachment deleted.")
                                       }
                                       deferred.resolve({ error: null, data: "success" });
                                   },
                                   function (itx, error) {
                                       utilService.logtoConsole(error + " into function deleteAttachment", "error");
                                       deferred.resolve({ error: error, data: null });
                                   });
                                }

                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function deleteAttachment", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        updateAttachment: function (dataToUpdate) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update attachment set attachmentdesc=?, attachmentdetail=?, attchmentcode=?, isedited=? where id=? and attachmentrsn=0";
                        arrayValueInsert = [
                            dataToUpdate.AttachmentDesc,
                            dataToUpdate.AttachmentDetails,
                            dataToUpdate.AttachmentCode,
                            dataToUpdate.IsEdited,
                            dataToUpdate.Id,
                        ];
                        tx.executeSql(syntax, arrayValueInsert,
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log('attachment updated for id  ' + dataToUpdate.Id)
                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function updateAttachment", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getAttachmentById: function (dataToOpen) {
            try {

                var processrsn = dataToOpen.processRSN;
                var processid = dataToOpen.processId;
                var folderrsn = dataToOpen.folderRSN;
                if (processrsn != null && processrsn != undefined && folderrsn != null && folderrsn != undefined && processid != null && processid != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {

                            queryattachment = "select tablersn,attachmentrsn,validattachment.attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix," +
                                            " attachmentcontenttype,attchmentcode,tablename, blob  ,validattachment.attachmentdesc as attachmenttypedesc, attachment.attachmentdesc as desc,attachment.id as attachmentrowid " +
                                            " from attachment  " +
                                            " left join validattachment on validattachment.attachmentcode=attachment.attchmentcode  " +
                                            " where tablename in ('FOLDER', 'Folder') AND tablersn=" + folderrsn + " " +
                                            " UNION   " +
                                            " select tablersn,attachmentrsn,validattachment.attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix," +
                                            " attachmentcontenttype,attchmentcode,tablename, blob  ,validattachment.attachmentdesc as attachmenttypedesc, attachment.attachmentdesc as desc,attachment.id as attachmentrowid " +
                                            " from attachment  " +
                                            " left join validattachment on validattachment.attachmentcode=attachment.attchmentcode  " +
                                            " where tablename in ('FOLDER_PROCESS', 'FolderProcess') and tablersn=" + processrsn + "" +
                                            " UNION  " +
                                            " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail, " +
                                            " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,   " +
                                            " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,    " +
                                            " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,    " +
                                            " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob , " +
                                            " validattachment.attachmentdesc as attachmenttypedesc , validattachment.attachmentdesc as desc ,folderprocessattemptsignature.id as attachmentrowid      " +
                                            " from folderprocessattemptsignature  " +
                                            " left join validattachment on validattachment.attachmentcode=folderprocessattemptsignature.attchmentcode  " +
                                            " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=" + processid + ") OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=" + processrsn + "))";

                            tx.executeSql(queryattachment, [],
                                function (itx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var dt = [];
                                        for (var i = 0; i < result.rows.length; i++) {
                                            record = result.rows.item(i);
                                            dt.push(record);
                                        }
                                    }
                                    deferred.resolve({ error: null, data: dt });
                                },
                                function (itx, error) {
                                    utilService.logtoConsole(error + " into function getAttachmentById", "error");
                                    deferred.resolve({ error: error, data: null });
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }


        },

        getNewFolderProcess: function (typeofinspection) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = null;
                        if (typeofinspection === 'violation') {
                            syntax = "SELECT *,folderprocess.id as processid,FOLDER.id as folderid,folder.statuscode as folderstatuscode  FROM FOLDER, folderprocess,folderprocessattempt " +
                                " WHERE  ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn ))" +
                                " and  ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=folderprocessattempt.processid) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=folderprocessattempt.processrsn )) " +
                                " and  FOLDER.ISNEW='Y'  and folderprocess.enddate!='' and folderprocessattempt.attemptrsn=0" +
                                " and ifnull(folderprocessattempt.resultcode, 0) != 0  and  ifnull(folderprocess.isreschedule,'')!='Y' ";
                        } else if (typeofinspection === 'scheduled') {
                            syntax = "SELECT *,folderprocess.id as processid ,FOLDER.id as folderid ,folder.statuscode as folderstatuscode  FROM FOLDER, folderprocess,folderprocessattempt " +
                                " WHERE  ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn ))" +
                                " and  ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=folderprocessattempt.processid) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=folderprocessattempt.processrsn )) " +
                                " and  folderprocess.processrsn!='0'  and folderprocess.enddate!='' and folderprocessattempt.attemptrsn=0" +
                                " and ifnull(folderprocessattempt.resultcode, 0) != 0  and  ifnull(folderprocess.isreschedule,'')!='Y' ";
                        } else if (typeofinspection === 'unscheduled') {
                            syntax = "SELECT *,folderprocess.id as processid ,FOLDER.id as folderid ,folder.statuscode as folderstatuscode  FROM FOLDER, folderprocess,folderprocessattempt " +
                                " WHERE  ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn ))" +
                                " and  ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=folderprocessattempt.processid) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=folderprocessattempt.processrsn )) " +
                                " and  folderprocess.processrsn='0' and folderprocess.folderrsn!=0  and folderprocess.enddate!='' and folderprocessattempt.attemptrsn=0" +
                                " and ifnull(folderprocessattempt.resultcode, 0) != 0  and  ifnull(folderprocess.isreschedule,'')!='Y' ";
                        } else if (typeofinspection === 'rescheduled') {
                            syntax = "SELECT *,folderprocess.id as processid ,FOLDER.id as folderid ,folder.statuscode as folderstatuscode  FROM FOLDER, folderprocess ,folderprocessattempt " +
                                " WHERE  ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderprocess.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderprocess.folderrsn )) " +
                                " and  ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=folderprocessattempt.processid) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=folderprocessattempt.processrsn )) " +
                                " and  folderprocess.processrsn!=0 and folderprocess.folderrsn!=0 and folderprocessattempt.attemptrsn=0 " +
                                " and folderprocess.isreschedule='Y'";
                        }
                        if (syntax == null) {
                            throw new Error("type of inspection didn't matched with violation/scheduled/unscheduled/rescheduled");
                        }
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcess", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderPeopleByFolderId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select peoplersn,relation,folderrsn as folderId from folderpeople where ((folderpeople.IsNew='Y' and folderpeople.folderid=?) OR (folderpeople.IsNew!='Y' and folderpeople.FolderRSN=? )) and isnew='Y'";
                        tx.executeSql(syntax, [data.folderId, data.folderRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderPeopleByFolderId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderPropertyByFolderId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select propertyrsn,propertyrelationcode,folderrsn as folderId from folderproperty where ((folderproperty.IsNew='Y' and folderproperty.folderid=?) OR (folderproperty.IsNew!='Y' and folderproperty.FolderRSN=? )) and isnew='Y'";
                        tx.executeSql(syntax, [data.folderId, data.folderRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderPropertyByFolderId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderProcessAttemptByProcessId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        if (data.typeofinspection === 'violation')
                            var syntax = "select folderprocessattempt.* from folderprocessattempt left join folderprocess on ((folderprocess.IsNew='Y' and folderprocess.id=folderprocessattempt.processid) OR (folderprocess.IsNew!='Y' and folderprocess.Processrsn= folderprocessattempt.processrsn))" +
                                " where ((folderprocess.IsNew='Y' and folderprocessattempt.processid=?) OR (folderprocess.IsNew!='Y' and folderprocessattempt.processrsn=? ))  " +
                                " and ((folderprocess.IsNew='Y' and folderprocess.folderid=?) OR (folderprocess.IsNew!='Y' and folderprocessattempt.folderrsn= ?))";
                        else if (data.typeofinspection === 'scheduled') {
                            data.folderId = '';
                            var syntax = "select folderprocessattempt.* from folderprocessattempt left join folderprocess on ((folderprocess.IsNew='Y' and folderprocess.id=folderprocessattempt.processid) OR (folderprocess.IsNew!='Y' and folderprocess.Processrsn= folderprocessattempt.processrsn)) " +
                                " where folderprocessattempt.processid=? and folderprocessattempt.processrsn=? and ifnull(folderprocess.folderid,'')=? and folderprocessattempt.folderrsn=?";
                        } else if (data.typeofinspection === 'unscheduled') {
                            data.folderId = '';
                            data.processRSN = data.processId;
                            var syntax = "select folderprocessattempt.* from folderprocessattempt left join folderprocess on ((folderprocess.IsNew='Y' and folderprocess.id=folderprocessattempt.processid) OR (folderprocess.IsNew!='Y' and folderprocess.Processrsn= folderprocessattempt.processrsn)) " +
                                " where folderprocessattempt.processid=? and folderprocessattempt.processrsn=? and ifnull(folderprocess.folderid,'')=? and folderprocessattempt.folderrsn=?";
                        }
                        tx.executeSql(syntax, [data.processId, data.processRSN, data.folderId, data.folderRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcessAttemptByProcessId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderProcessChecklistByProcessId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        if (data.typeofinspection === 'violation')
                            var syntax = "select folderprocesschecklist.* from folderprocesschecklist where ((folderprocesschecklist.IsNew='Y' and folderprocesschecklist.processid=?) OR (folderprocesschecklist.IsNew!='Y' and folderprocesschecklist.processrsn=? )) and (folderprocesschecklist.isedited='Y' OR folderprocesschecklist.isnew='Y')";
                        else if (data.typeofinspection === 'scheduled')
                            var syntax = "select folderprocesschecklist.* from folderprocesschecklist where ((ifnull(folderprocesschecklist.IsNew,'')='Y' and folderprocesschecklist.processid=?) OR (ifnull(folderprocesschecklist.IsNew,'')!='Y' and folderprocesschecklist.processrsn=? )) and folderprocesschecklist.processrsn !='0' and (folderprocesschecklist.isedited='Y' OR folderprocesschecklist.isnew='Y')";
                        else if (data.typeofinspection === 'unscheduled')
                            var syntax = "select folderprocesschecklist.* from folderprocesschecklist where ((ifnull(folderprocesschecklist.IsNew,'')='Y' and folderprocesschecklist.processid=?) OR (ifnull(folderprocesschecklist.IsNew,'')!='Y' and folderprocesschecklist.processrsn=? )) and folderprocesschecklist.processrsn ='0' and (folderprocesschecklist.isedited='Y' OR folderprocesschecklist.isnew='Y')";
                        else if (data.typeofinspection === 'rescheduled')
                            var syntax = " select folderprocesschecklist.* from folderprocesschecklist where ((ifnull(folderprocesschecklist.IsNew,'')='Y' and folderprocesschecklist.processid=?) OR (ifnull(folderprocesschecklist.IsNew,'')!='Y' and folderprocesschecklist.processrsn=? )) and (folderprocesschecklist.isedited='Y' OR folderprocesschecklist.isnew='Y')";
                        tx.executeSql(syntax, [data.processId, data.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcessChecklistByProcessId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderProcessAttachmentByProcessId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = '';
                        if (data.typeofinspection === 'violation')
                            syntax = "select tablersn,attachmentrsn,attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix,attachmentcontenttype,attchmentcode,tablename, blob  " +
                                " from attachment where ((attachment.isnew='Y' and attachment.processid=?) OR (attachment.isnew!='Y'  and attachment.tablersn=?))   and isnew='Y' OR isedited='Y'   " +
                                " UNION    " +
                                " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail,   " +
                                " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,  " +
                                " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,   " +
                                " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,   " +
                                " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob     " +
                                " from folderprocessattemptsignature left join attachment on attachment.tablersn=folderprocessattemptsignature.processrsn   " +
                                " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=?) OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=?))";
                        else if (data.typeofinspection === 'scheduled') {
                            //data.processId = data.processRSN;
                            syntax = "select tablersn,attachmentrsn,attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix,attachmentcontenttype,attchmentcode,tablename, blob  " +
                                " from attachment where attachment.processid=? OR attachment.tablersn=?   and isnew='Y' OR isedited='Y' " +
                                " UNION    " +
                                " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail,   " +
                                " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,  " +
                                " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,   " +
                                " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,   " +
                                " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob     " +
                                " from folderprocessattemptsignature left join attachment on attachment.tablersn=folderprocessattemptsignature.processrsn   " +
                                " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=?) OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=?))";
                        } else if (data.typeofinspection === 'unscheduled') {
                            //data.processRSN = data.processId;
                            syntax = "select tablersn,attachmentrsn,attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix,attachmentcontenttype,attchmentcode,tablename, blob  " +
                                " from attachment where ((attachment.isnew='Y' and attachment.processid=?) OR (attachment.isnew!='Y'  and attachment.tablersn=?))    OR isedited='Y' " +
                                " UNION    " +
                                " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail,   " +
                                " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,  " +
                                " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,   " +
                                " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,   " +
                                " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob     " +
                                " from folderprocessattemptsignature left join attachment on attachment.tablersn=folderprocessattemptsignature.processrsn   " +
                                " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=?) OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=?))";
                        } else if (data.typeofinspection === 'rescheduled') {
                            //data.processId = data.processRSN;
                            syntax = "select tablersn,attachmentrsn,attachmentdesc,attachmentdetail,attachmentfilealias,attachmentfilesuffix,attachmentcontenttype,attchmentcode,tablename, blob  " +
                                " from attachment where attachment.processid=? OR attachment.tablersn=?   and isnew='Y' OR isedited='Y' " +
                                " UNION    " +
                                " select case when processrsn=0 then folderprocessattemptsignature.processid else folderprocessattemptsignature.processrsn end  as tablersn,0  as attachmentrsn,signaturetype as attachmentdesc,signaturetype as attachmentdetail,   " +
                                " Case when attemptid=0 then signaturetype ||'.pdf'  else signaturetype ||'.png' end as  attachmentfilealias,  " +
                                " Case when attemptid=0 then 'pdf'  else 'png' end as attachmentfilesuffix ,   " +
                                " Case when attemptid=0 then 'application/pdf'  else 'image/png' end as attachmentcontenttype ,   " +
                                " 'Picture' as attchmentcode,'FOLDER_PROCESS' as tablename,signaturedata as blob     " +
                                " from folderprocessattemptsignature left join attachment on attachment.tablersn=folderprocessattemptsignature.processrsn   " +
                                " where ((folderprocessattemptsignature.processrsn='0' and folderprocessattemptsignature.processid=?) OR (folderprocessattemptsignature.processrsn!='0'  and folderprocessattemptsignature.processrsn=?))";
                        }
                        tx.executeSql(syntax, [data.processId, data.processRSN, data.processId, data.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcessAttachmentByProcessId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderInfoByFolderId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = '';
                        if (data.typeofinspection === 'violation')
                            syntax = "select * from folderinfo where ((folderinfo.IsNew='Y' and folderinfo.folderid=?) OR (folderinfo.IsNew!='Y' and folderinfo.FolderRSN=? )) and (folderinfo.isedited='Y' OR folderinfo.isnew='Y') ";
                        else if (data.typeofinspection === 'scheduled')
                            syntax = "select folderinfo.* from folderinfo ,folder where ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderinfo.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderinfo.folderrsn )) and Folder.id = ? and    folderinfo.FolderRSN=? and (folderinfo.isedited='Y' OR folderinfo.isnew='Y')";
                        else if (data.typeofinspection === 'unscheduled')
                            syntax = "select folderinfo.* from folderinfo ,folder where ((ifnull(Folder.IsNew,'')='Y' and Folder.id=folderinfo.folderid) OR (ifnull(Folder.IsNew,'')!='Y' and Folder.FolderRSN=folderinfo.folderrsn )) and Folder.id = ? and    folderinfo.FolderRSN=? and (folderinfo.isedited='Y' OR folderinfo.isnew='Y')";
                        else if (data.typeofinspection === 'rescheduled')
                            syntax = "select * from folderinfo where ((folderinfo.IsNew='Y' and folderinfo.folderid=?) OR (folderinfo.IsNew!='Y' and folderinfo.FolderRSN=? )) and (folderinfo.isedited='Y' OR folderinfo.isnew='Y')";

                        tx.executeSql(syntax, [data.folderId, data.folderRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderInfoByFolderId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderProcessInfoByProcessId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = '';
                        if (data.typeofinspection == 'violation')
                            syntax = "select * from folderprocessinfo where ((folderprocessinfo.IsNew='Y' and folderprocessinfo.processid=?) OR (folderprocessinfo.IsNew!='Y' and folderprocessinfo.processrsn=? )) and (folderprocessinfo.isedited='Y' OR folderprocessinfo.isnew='Y' )";
                        else if (data.typeofinspection == 'scheduled') {
                            data.processId = '';
                            syntax = "select * from folderprocessinfo where ((ifnull(folderprocessinfo.IsNew,'')='Y' and folderprocessinfo.processid=?) OR (ifnull(folderprocessinfo.IsNew,'')!='Y' and folderprocessinfo.processrsn=? )) and (folderprocessinfo.isedited='Y' OR folderprocessinfo.isnew='Y' )";
                        } else if (data.typeofinspection == 'unscheduled') {
                            syntax = "select * from folderprocessinfo where ((ifnull(folderprocessinfo.IsNew,'')='Y' and folderprocessinfo.processid=?) OR (ifnull(folderprocessinfo.IsNew,'')!='Y' and folderprocessinfo.processrsn=? )) and (folderprocessinfo.isedited='Y' OR folderprocessinfo.isnew='Y' )";
                        } else if (data.typeofinspection == 'rescheduled') {
                            syntax = "select * from folderprocessinfo where ((ifnull(folderprocessinfo.IsNew,'')='Y' and folderprocessinfo.processid=?) OR (ifnull(folderprocessinfo.IsNew,'')!='Y' and folderprocessinfo.processrsn=? )) and (folderprocessinfo.isedited='Y' OR folderprocessinfo.isnew='Y' )";
                        }
                        tx.executeSql(syntax, [data.processId, data.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcessInfoByProcessId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getNewFolderProcessDeficiencyByProcessId: function (data) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = '';
                        if (data.typeofinspection === 'violation')
                            syntax = "select * from folderprocessdeficiency  left join validdeficiency on validdeficiency.deficiencycode=folderprocessdeficiency.deficiencycode" +
                                    " where ((folderprocessdeficiency.IsNew='Y' and folderprocessdeficiency.processrsn='0' and folderprocessdeficiency.processid=?) " +
                                    " OR (folderprocessdeficiency.IsNew!='Y' and folderprocessdeficiency.processrsn!='0' and folderprocessdeficiency.processrsn=? ))" +
                                    " and (folderprocessdeficiency.isedited='Y' OR folderprocessdeficiency.isnew='Y')";
                        else if (data.typeofinspection === 'scheduled') {
                            data.processId = '';
                            syntax = "select * from folderprocessdeficiency  left join validdeficiency on validdeficiency.deficiencycode=folderprocessdeficiency.deficiencycode  " +
                                " where folderprocessdeficiency.processrsn!='0' and ifnull(folderprocessdeficiency.processid,'')=? and  folderprocessdeficiency.processrsn=? and " +
                                " (folderprocessdeficiency.IsNew='Y' OR folderprocessdeficiency.isedited='Y')" +
                                " and (folderprocessdeficiency.isedited='Y' OR folderprocessdeficiency.isnew='Y')";
                        } else if (data.typeofinspection === 'unscheduled') {
                            data = "select * from folderprocessdeficiency  left join validdeficiency on validdeficiency.deficiencycode=folderprocessdeficiency.deficiencycode  " +
                                " where ((folderprocessdeficiency.IsNew='Y' and folderprocessdeficiency.processrsn='0' and folderprocessdeficiency.processid=?) OR " +
                                " (folderprocessdeficiency.IsNew!='Y' and folderprocessdeficiency.processrsn!='0' and folderprocessdeficiency.processrsn=? ))"
                            " and (folderprocessdeficiency.isedited='Y' OR folderprocessdeficiency.isnew='Y')";
                        } else if (data.typeofinspection === 'rescheduled') {
                            data.processId = '';
                            syntax = "select * from folderprocessdeficiency  left join validdeficiency on validdeficiency.deficiencycode=folderprocessdeficiency.deficiencycode " +
                                " where folderprocessdeficiency.processrsn!='0' and ifnull(folderprocessdeficiency.processid,'')=? and  folderprocessdeficiency.processrsn=? "
                            " and (folderprocessdeficiency.isedited='Y' OR folderprocessdeficiency.isnew='Y')";
                        }
                        tx.executeSql(syntax, [data.processId, data.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getNewFolderProcessDeficiencyByProcessId", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        processEaiPushSeccessItems: function (datatoupdate) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql(datatoupdate.syntax, datatoupdate.parameter,
                            function (itx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error, "error");
                                utilService.logtoConsole(error.message + " into function processEaiPushSeccessItems", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getPropertyAddresses: function (folderIds) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var instring = $(folderIds).map(function () { return "?"; }).get().join();
                    var sql = "select folder.id as folderid, folder.folderrsn, property.* from folder join property on folder.propertyrsn=property.propertyrsn \
                        where folder.id in (" + instring + ");";

                    //var sql = "select distinct folder.id as folderid, folder.folderrsn , property.*, " +
                    //" Case when folder.propertyrsn=0 THEN (select folderproperty.propertyrsn from folderproperty where folderproperty.folderrsn=folder.folderrsn limit 1) ELSE folder.propertyrsn end AS propertyrsn " +
                    //" from folder left join folderproperty on folder.propertyrsn=folderproperty.propertyrsn " +
                    //" left join property on property.propertyrsn=folderproperty.propertyrsn where folder.id in (" + instring + ")";

                    var addresses = [];
                    tx.executeSql(sql, folderIds,
                        function (itx, result) {
                            utilService.logtoConsole("Addresses Found");
                            var row = null;
                            if (result.rows && result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    row = result.rows.item(i);
                                    addresses.push(row);
                                }
                            }
                            deferred.resolve({ error: null, data: addresses });
                        }, function (itx, error) {
                            utilService.logtoConsole(error + " into function getPropertyAddresses", "error");
                            deferred.resolve({ error: error, data: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },
        updateSignature: function (processrsn, attemptid, signaturetype, signaturedata, processid, attachmentcode) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var selectquery = "select id from folderprocessattemptsignature where attemptid=? and signaturetype=? limit 1";
                    tx.executeSql(selectquery, [attemptid, signaturetype],
                        function (tx, result) {
                            if (result.rows && result.rows.length > 0) { //folderprocessattemptsignature exist for process
                                var signatureid = result.rows.item(0)["id"];
                                var updateStatement = "update folderprocessattemptsignature set signaturedata=? where id=? and attemptid=? and signaturetype=?";
                                tx.executeSql(updateStatement, [signaturedata, signatureid, attemptid, signaturetype],
                                    function (tx, result) {
                                        if (result) {
                                            deferred.resolve({ error: null, result: { isSuccess: true } });
                                        } else {
                                            utilService.logtoConsole(result);
                                            deferred.resolve({ error: new Error("folderprocessattemptsignature: update failed"), result: null });
                                        }
                                    }, function (tx, error) {
                                        utilService.logtoConsole(error + " into function updateSignature", "error");
                                        deferred.resolve({ error: error, result: null });
                                    });
                            } else { //folderprocessattemptsignature doesn't exists, create one.
                                var insertstatement = "insert into folderprocessattemptsignature (processrsn, attemptid, processid, signaturetype, signaturedata,attchmentcode) values (?, ?, ?, ?, ?,?)";
                                tx.executeSql(insertstatement, [processrsn, attemptid, processid, signaturetype, signaturedata, attachmentcode],
                                    function (tx, result) {
                                        if (result && result.insertId && result.insertId > 0) {
                                            deferred.resolve({ error: null, result: { isSuccess: true } });
                                        } else {
                                            utilService.logtoConsole(result);
                                            deferred.resolve({ error: new Error("folderprocessattemptsignature: insert failed"), result: null });
                                        }
                                    }, function (tx, error) {
                                        utilService.logtoConsole(error + " into function updateSignature", "error");
                                        deferred.resolve({ error: error, result: null });
                                    });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function updateSignature", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },

        deleteSignature: function (processrsn, attemptid, signaturetype, signaturedata, processid, attachmentcode) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var selectquery = "select id from folderprocessattemptsignature where attemptid=? and signaturetype=? limit 1";
                    tx.executeSql(selectquery, [attemptid, signaturetype],
                        function (tx, result) {
                            if (result.rows && result.rows.length > 0) {
                                var signatureid = result.rows.item(0)["id"];
                                var updateStatement = "delete from folderprocessattemptsignature where id=? and attemptid=? and signaturetype=?";
                                tx.executeSql(updateStatement, [signatureid, attemptid, signaturetype],
                                    function (tx, result) {
                                        if (result) {
                                            deferred.resolve({ error: null, result: { isSuccess: true } });
                                        } else {
                                            utilService.logtoConsole(result);
                                            deferred.resolve({ error: new Error("folderprocessattemptsignature: delete failed"), result: null });
                                        }
                                    }, function (tx, error) {
                                        utilService.logtoConsole(error + " into function deleteSignature", "error");
                                        deferred.resolve({ error: error, result: null });
                                    });
                            } else {
                                deferred.resolve({ error: null, result: { isSuccess: true } });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function updateSignature", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },

        getSignature: function (attemptid, signaturetype) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var selectquery = "select signaturedata from folderprocessattemptsignature where attemptid=? and signaturetype=? limit 1";
                    tx.executeSql(selectquery, [attemptid, signaturetype],
                        function (tx, result) {
                            if (result.rows && result.rows.length > 0) { //folderprocessattemptsignature exist for process
                                deferred.resolve({ error: null, result: { signature: result.rows.item(0)["signaturedata"] } });
                            } else { //folderprocessattemptsignature doesn't exists, create one.
                                deferred.resolve({ error: null, result: { signature: "" } });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function getSignature", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },
        updateAttempt: function (attemptid, columns, values) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var setStatement = $.map(columns, function (value, id) {
                        return String.format("{0}=?", value);
                    }).join(", ");
                    values[values.length] = attemptid;
                    var updatequery = String.format("update folderprocessattempt set {0} where id=?", setStatement);
                    tx.executeSql(updatequery, values,
                        function (tx, result) {
                            if (result) {
                                deferred.resolve({ error: null, result: { isSuccess: true } });
                            } else {
                                utilService.logtoConsole(result);
                                deferred.resolve({ error: new Error("folderprocessattempt: update failed"), result: null });
                            }
                        }, function (tx, error) {
                            utilService.logtoConsole(error + " into function updateAttempt", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },
        updateProcessComment: function (isnew, processrsn, processid, processcomment) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var updatequery = "update folderprocess set processcomment=? where ";
                    var params = [processcomment];
                    if (isnew && isnew === "Y") {
                        updatequery += "id=?";
                        params[params.length] = processid;
                    } else {
                        updatequery += "processrsn=?";
                        params[params.length] = processrsn;
                    }
                    tx.executeSql(updatequery, params,
                        function (tx, result) {
                            //debugger;
                            if (result) {
                                deferred.resolve({ error: null, result: { isSuccess: true } });
                            } else {
                                utilService.logtoConsole(result);
                                deferred.resolve({ error: new Error("folderprocess comment: update failed"), result: null });
                            }
                        }, function (tx, error) {
                            utilService.logtoConsole(error + " into function updateProcessComment", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
            }
        },
        getValidFolderStatus: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validstatus'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length === 0) {
                                    var syntax = "select validstatus.statuscode,validstatus.statusdesc from validstatus order by 1 asc";
                                    tx.executeSql(syntax, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getValidFolderStatus", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getValidProvince: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validprovince'", [],
                            function (tx, result) {
                                if (result.rows || !result.rows.length == 0) {
                                    syntax = "select validprovince.id,validprovince.country from validprovince order by 1 asc";
                                    tx.executeSql(syntax, [],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getValidProvince", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getAllReport: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select * from report where report.displayflag='Y'";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getAllReport", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },


        getReport: function (item) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        //  report.processcode=" + "'" + item.processTypeCode + "'" + " and report.foldertype=" + "'" + item.folderType + "'" + "  and this is for just for demo will be used when actually download the template from jsp
                        syntax = "select * from report where report.displayflag='Y' and report.reportname=" + "'" + item.reportName + "' limit 1";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt })

                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidProvince", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: error, data: null });
            }
        },

        getActualUserId: function (un) {
            var db = dbInitService.getdatabase();
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "SELECT * FROM validuser where upper(userid) =" + "'" + un.toUpperCase() + "'";
                    tx.executeSql(syntax, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                var userid = result.rows.item(0)['userid'];
                                deferred.resolve({ error: null, data: userid });
                            } else {
                                deferred.resolve({ error: null, data: un });
                            }
                        },
                        function (itx, error) {
                            deferred.resolve({ error: error, data: un });
                        });
                });
                return deferred.promise;
            }
        },

        updateUserPassword: function (un, pw) {
            var db = dbInitService.getdatabase();
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "update validuser set password = " + "'" + pw + "'" + " where upper(userid) =" + "'" + un.toUpperCase() + "'";
                    tx.executeSql(syntax, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                deferred.resolve({ error: null, data: "success" });
                            }
                        },
                        function (itx, error) {
                            deferred.resolve({ error: error, data: null });
                        });
                });
                return deferred.promise;
            }
        },
        validateUserOffline: function (un, pw) {
            var db = dbInitService.getdatabase();
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "select * from validuser where upper(userid) =" + "'" + un.toUpperCase() + "' and password= " + "'" + pw + "'";
                    tx.executeSql(syntax, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                deferred.resolve({ error: null, data: "success" });
                            } else {
                                deferred.resolve({ error: null, data: "fail" });
                            }
                        },
                        function (itx, error) {

                            deferred.resolve({ error: error, data: null });
                        });
                });
                return deferred.promise;
            }
        },
        getSignatureForReport: function (processid) {
            var db = dbInitService.getdatabase();
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "select * from folderprocessattemptsignature where folderprocessattemptsignature.processid =? and folderprocessattemptsignature.signaturetype= ?";
                    tx.executeSql(syntax, [processid, 'Inspector Signature'],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                var sigdata = result.rows.item(0)['signaturedata'];
                                deferred.resolve({ error: null, data: sigdata });
                            } else {
                                deferred.resolve({ error: new Error("signature not found"), data: null });
                            }
                        },
                        function (itx, error) {
                            deferred.resolve({ error: error, data: null });
                        });
                });
                return deferred.promise;
            }
        },
        getDeficiencyForReport: function (processrsn) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select folderprocessdeficiency.deficiencytext,validdeficiency.deficiencydesc,folderprocessdeficiency.remedytext from folderprocessdeficiency left join validdeficiency on  validdeficiency.deficiencycode=folderprocessdeficiency.deficiencycode	where folderprocessdeficiency.processrsn=?";
                        tx.executeSql(syntax, [processrsn],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getDeficiencyForReport", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
                deferred.resolve({ error: error, data: null });
            }
        },

        saveUpdateReportData: function (processrsn, attemptid, signaturetype, signaturedata, processid) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var selectquery = "select id from folderprocessattemptsignature where processrsn=? and signaturetype=? and processid=? and attemptid=0 limit 1";
                    tx.executeSql(selectquery, [processrsn, signaturetype, processid],
                        function (tx, result) {
                            if (result.rows && result.rows.length > 0) { //folderprocessattemptsignature exist for process
                                var signatureid = result.rows.item(0)["id"];
                                var updateStatement = "update folderprocessattemptsignature set signaturedata=? where id=?  and processrsn=? and signaturetype=? and processid=? and attemptid=0";
                                tx.executeSql(updateStatement, [signaturedata, signatureid, processrsn, signaturetype, processid],
                                    function (tx, result) {
                                        if (result) {
                                            deferred.resolve({ error: null, result: { isSuccess: true } });
                                        } else {
                                            utilService.logtoConsole(result);
                                            deferred.resolve({ error: new Error("saveUpdateReportData: update failed"), result: null });
                                        }
                                    }, function (tx, error) {
                                        utilService.logtoConsole(error + " into function saveUpdateReportData", "error");
                                        deferred.resolve({ error: error, result: null });
                                    });
                            } else { //folderprocessattemptsignature doesn't exists, create one.
                                var insertstatement = "insert into folderprocessattemptsignature (processrsn, attemptid, processid, signaturetype, signaturedata) values (?, ?, ?, ?, ?)";
                                tx.executeSql(insertstatement, [processrsn, attemptid, processid, signaturetype, signaturedata],
                                    function (tx, result) {
                                        if (result && result.insertId && result.insertId > 0) {
                                            deferred.resolve({ error: null, result: { isSuccess: true } });
                                        } else {
                                            utilService.logtoConsole(result);
                                            deferred.resolve({ error: new Error("saveUpdateReportData: insert failed"), result: null });
                                        }
                                    }, function (tx, error) {
                                        utilService.logtoConsole(error + " into function saveUpdateReportData", "error");
                                        deferred.resolve({ error: error, result: null });
                                    });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function saveUpdateReportData", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, result: null });
            }
        },

        getReportData: function (processrsn, signaturetype, processid) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var selectquery = "Select signaturedata, *  from folderprocessattemptsignature where processrsn=? and signaturetype=? and attemptid=0 and processid=?";
                    tx.executeSql(selectquery, [processrsn, signaturetype, processid],
                        function (tx, result) {
                            if (result.rows && result.rows.length > 0) { //folderprocessattemptsignature exist for process
                                deferred.resolve({ error: null, reportData: result.rows.item(0)["signaturedata"], isReportAttached: true });
                            } else { //folderprocessattemptsignature doesn't exists, create one.
                                deferred.resolve({ error: null, reportData: "", isReportAttached: false });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function getReportData", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, result: null });
            }
        },

        deleteReportData: function (processrsn, signaturetype, processid) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    //check if attempt record with attemptrsn =0 exists for current processid
                    var deletequery = "delete from folderprocessattemptsignature where processrsn=? and signaturetype=? and attemptid=0 and processid=?";
                    tx.executeSql(deletequery, [processrsn, signaturetype, processid],
                        function (tx, result) {
                            if (result && result.rowsAffected > 0) {
                                deferred.resolve({ error: null, isSuccess: true });
                            } else {
                                deferred.resolve({ error: null, isSuccess: false });
                            }
                        },
                        function (tx, error) {
                            utilService.logtoConsole(error + " into function getReportData", "error");
                            deferred.resolve({ error: error, result: null });
                        });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, result: null });
            }
        },

        getValidSiteMobileOption: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from validsitemobileoption";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                    this.siteOptions = dt;
                                }
                                deferred.resolve(dt);
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getValidSiteMobileOption", "error");
                                deferred.resolve(error);
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                deferred.resolve(e);
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertPeople: function (peopleToBeSaved) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {

                    var selectquery = "select 1 from people where peoplersn=?";
                    tx.executeSql(selectquery, [peopleToBeSaved.peopleRSN], function (itx, result) {
                        if (result.rows && result.rows.length > 0) {

                            var updatequery = "Update people set peoplecode=?, parentrsn=?, familyrsn=?, nametitle=?, namefirst=?, namelast=?," +
                                " birthdate =?, addrprefix=?, addrhouse=?, addrstreet=?, addrstreettype=?, addrcity=?, addrprovince=?, addrcountry=?, " +
                                " addrpostal =?, phone1=?, phone1desc=?, phone2=?, phone2desc=?, phone3=?, phone3desc=?, emailaddress=?, comments=?," +
                                " addrunittype =?, addrunit=?, licencenumber=?, organizationname=?, addressline1=?, addressline2=?, addressline3=?," +
                                " statuscode=?, namesuffix=?, namemiddle=?, addrstreetprefix=?, addrstreetdirection=?, countydesc=? where peoplersn=? ";
                            itx.executeSql(updatequery, [
                                    peopleToBeSaved.peopleRoleType, peopleToBeSaved.peopleParentId, peopleToBeSaved.peopleFamilyId, peopleToBeSaved.peopleSaluation,
                                    peopleToBeSaved.peopleFirstName, peopleToBeSaved.peopleLastName, peopleToBeSaved.peopleDOB, peopleToBeSaved.peopleAddrPrefix, peopleToBeSaved.peopleAddrHouseNo,
                                    peopleToBeSaved.peopleAddrStreetName, peopleToBeSaved.peopleAddrStreetType, peopleToBeSaved.peopleAddrCity, peopleToBeSaved.peopleAddrState,
                                    peopleToBeSaved.peopleAddrCountry, peopleToBeSaved.peopleAddrPostalCode, peopleToBeSaved.peoplePhone1, peopleToBeSaved.peoplePhone1Desc, peopleToBeSaved.peoplePhone2,
                                    peopleToBeSaved.peoplePhone2Desc, peopleToBeSaved.peoplePhone3, peopleToBeSaved.peoplePhone3Desc, peopleToBeSaved.peopleEmailAdd, peopleToBeSaved.peopleAddrComments,
                                    peopleToBeSaved.peopleAddrUnitType, peopleToBeSaved.peopleAddrUnitNo,
                                    "", // license number
                                    peopleToBeSaved.peopleOrgName, peopleToBeSaved.peopleAddressLine1, peopleToBeSaved.peopleAddressLine2, peopleToBeSaved.peopleAddressLine3, peopleToBeSaved.peopleStatus,
                                    peopleToBeSaved.peopleNameSuffix, peopleToBeSaved.peopleMiddleName, peopleToBeSaved.peopleAddrStreetPrefix, peopleToBeSaved.peopleAddrStreetDirection,
                                    peopleToBeSaved.peopleAddrCounty, peopleToBeSaved.peopleRSN
                            ],
                                function (iitx, result) {
                                    if (result && result.rowsAffected > 0) {
                                        deferred.resolve({ error: null, isSuccess: true });
                                    } else {
                                        deferred.resolve({ error: null, isSuccess: false });
                                    }
                                },
                                function (iitx, error) {
                                    utilService.logtoConsole(error.message + " into function insertPeople/ update operation", "error");
                                    deferred.resolve({ error: error, result: null });
                                });

                        } else {
                            var insertquery = "Insert into people (peoplersn,peoplecode,parentrsn,familyrsn,nametitle,namefirst,namelast,birthdate,addrprefix,addrhouse,addrstreet,addrstreettype," +
                                " addrcity, addrprovince, addrcountry, addrpostal, phone1, phone1desc, phone2, phone2desc, phone3, phone3desc, emailaddress, comments, addrunittype, addrunit, " +
                                " licencenumber, organizationname, addressline1, addressline2, addressline3, statuscode, namesuffix, namemiddle, addrstreetprefix, addrstreetdirection, countydesc )" +
                                " Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                            itx.executeSql(insertquery, [
                                    peopleToBeSaved.peopleRSN, peopleToBeSaved.peopleRoleType, peopleToBeSaved.peopleParentId, peopleToBeSaved.peopleFamilyId, peopleToBeSaved.peopleSaluation,
                                    peopleToBeSaved.peopleFirstName, peopleToBeSaved.peopleLastName, peopleToBeSaved.peopleDOB, peopleToBeSaved.peopleAddrPrefix, peopleToBeSaved.peopleAddrHouseNo,
                                    peopleToBeSaved.peopleAddrStreetName, peopleToBeSaved.peopleAddrStreetType, peopleToBeSaved.peopleAddrCity, peopleToBeSaved.peopleAddrState,
                                    peopleToBeSaved.peopleAddrCountry, peopleToBeSaved.peopleAddrPostalCode, peopleToBeSaved.peoplePhone1, peopleToBeSaved.peoplePhone1Desc, peopleToBeSaved.peoplePhone2,
                                    peopleToBeSaved.peoplePhone2Desc, peopleToBeSaved.peoplePhone3, peopleToBeSaved.peoplePhone3Desc, peopleToBeSaved.peopleEmailAdd, peopleToBeSaved.peopleAddrComments,
                                    peopleToBeSaved.peopleAddrUnitType, peopleToBeSaved.peopleAddrUnitNo,
                                    "", // license number
                                    peopleToBeSaved.peopleOrgName, peopleToBeSaved.peopleAddressLine1, peopleToBeSaved.peopleAddressLine2, peopleToBeSaved.peopleAddressLine3, peopleToBeSaved.peopleStatus,
                                    peopleToBeSaved.peopleNameSuffix, peopleToBeSaved.peopleMiddleName, peopleToBeSaved.peopleAddrStreetPrefix, peopleToBeSaved.peopleAddrStreetDirection,
                                    peopleToBeSaved.peopleAddrCounty
                            ],
                                function (iitx, result) {
                                    if (result && result.rowsAffected > 0) {
                                        deferred.resolve({ error: null, isSuccess: true });
                                    } else {
                                        deferred.resolve({ error: null, isSuccess: false });
                                    }
                                },
                                function (iitx, error) {
                                    utilService.logtoConsole(error.message + " into function insertPeople", "error");
                                    deferred.resolve({ error: error, result: null });
                                });

                        }
                    }, function (tx, error) {
                        utilService.logtoConsole(error + " into function insertPeople", "error");
                        deferred.resolve({ error: error, result: null });
                    });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, result: null });
            }
        },
        insertProperty: function (propertyToBeSaved) {
            try {
                var localscope = this;
                var db = dbInitService.getdatabase();
                if (db == null) {
                    throw new Error("error accessing database");
                }
                var deferred = $q.defer();
                db.transaction(function (tx) {

                    var selectquery = "select 1 from property where propertyrsn=?";
                    tx.executeSql(selectquery, [propertyToBeSaved.propertyRSN], function (itx, result) {
                        if (result.rows && result.rows.length > 0) {

                            var updatequery = "Update property set familyrsn=?, propertyroll=?, propgisid1=?, parentpropertyrsn=?, datecreated=?, dateobsoleted=?, " +
                                " prophouse=?, propstreet=?, propstreettype=?, propcity=?, propprovince=?, proppostal=?, propunittype=?, propunit=?, propertyname=?, legaldesc=?," +
                                " statuscode=?, proparea=?, propfrontage=?, propdepth=?, propcrossstreet=?, zonetype1=?, propplan=?, proplot=?, propsection=?, proptownship=?," +
                                " proprange=?, routecode=?, propcomment=?, propstreetdirection=?, zonetype2=?, zonetype3=?, zonetype4=?, zonetype5=?, " +
                                " propx=?, propy=?, propstreetprefix=?, countydesc=?, propcode=? where propertyrsn=? ";
                            itx.executeSql(updatequery, [
                                    propertyToBeSaved.propertyFamilyRSN, propertyToBeSaved.propertyRoll, propertyToBeSaved.propertyGISID1, propertyToBeSaved.propertyParentRSN,
                                    propertyToBeSaved.propertyDateCreated, propertyToBeSaved.propertyDateObsoleted, propertyToBeSaved.propertyNo, propertyToBeSaved.propertyStreet, propertyToBeSaved.propertyStreetType,
                                    propertyToBeSaved.propertyCity, propertyToBeSaved.propertyState, propertyToBeSaved.propertyPostal, propertyToBeSaved.propertyUnitType,
                                    propertyToBeSaved.propertyUnitNo, propertyToBeSaved.propertyName, propertyToBeSaved.propertyLegalDesc, propertyToBeSaved.propertyStatus, propertyToBeSaved.propertyArea,
                                    propertyToBeSaved.propertyFrontage, propertyToBeSaved.propertyDepth,
                                    propertyToBeSaved.propertyCrossStreet, propertyToBeSaved.propertyZoning1, propertyToBeSaved.propertyPlan, propertyToBeSaved.propertyLOT, propertyToBeSaved.propertySec,
                                    propertyToBeSaved.propertyTwn, propertyToBeSaved.propertyRge, propertyToBeSaved.propertyRoute, propertyToBeSaved.propertyCreatedOnComment,
                                    propertyToBeSaved.propertyDirection, propertyToBeSaved.propertyZoning2, propertyToBeSaved.propertyZoning3, propertyToBeSaved.propertyZoning4, propertyToBeSaved.propertyZoning5,
                                    propertyToBeSaved.propertyX, propertyToBeSaved.propertyY, propertyToBeSaved.propertyStreetPrefix, propertyToBeSaved.propertyCounty, propertyToBeSaved.proprtyType, propertyToBeSaved.propertyRSN
                            ],
                                function (iitx, result) {
                                    if (result && result.rowsAffected > 0) {
                                        deferred.resolve({ error: null, isSuccess: true });
                                    } else {
                                        deferred.resolve({ error: null, isSuccess: false });
                                    }
                                },
                                function (iitx, error) {
                                    utilService.logtoConsole(error.message + " into function insertProperty/ update operation", "error");
                                    deferred.resolve({ error: error, result: null });
                                });

                        } else {
                            var insertquery = "Insert into property (propertyrsn,familyrsn,propertyroll,propgisid1,parentpropertyrsn,datecreated,dateobsoleted,prophouse,propstreet,propstreettype," +
                                " propcity,propprovince, proppostal, propunittype, propunit, propertyname, legaldesc, statuscode, proparea, propfrontage, propdepth, propcrossstreet, zonetype1," +
                                " propplan, proplot, propsection, proptownship, proprange, routecode, propcomment, propstreetdirection, zonetype2, zonetype3, zonetype4, zonetype5, " +
                                " propx, propy, propstreetprefix, countydesc, propcode )" +
                                " Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                            itx.executeSql(insertquery, [
                                    propertyToBeSaved.propertyRSN, propertyToBeSaved.propertyFamilyRSN, propertyToBeSaved.propertyRoll, propertyToBeSaved.propertyGISID1, propertyToBeSaved.propertyParentRSN,
                                    propertyToBeSaved.propertyDateCreated, propertyToBeSaved.propertyDateObsoleted, propertyToBeSaved.propertyNo, propertyToBeSaved.propertyStreet, propertyToBeSaved.propertyStreetType,
                                    propertyToBeSaved.propertyCity, propertyToBeSaved.propertyState, propertyToBeSaved.propertyPostal, propertyToBeSaved.propertyUnitType,
                                    propertyToBeSaved.propertyUnitNo, propertyToBeSaved.propertyName, propertyToBeSaved.propertyLegalDesc, propertyToBeSaved.propertyStatus, propertyToBeSaved.propertyArea,
                                    propertyToBeSaved.propertyFrontage, propertyToBeSaved.propertyDepth,
                                    propertyToBeSaved.propertyCrossStreet, propertyToBeSaved.propertyZoning1, propertyToBeSaved.propertyPlan, propertyToBeSaved.propertyLOT, propertyToBeSaved.propertySec,
                                    propertyToBeSaved.propertyTwn, propertyToBeSaved.propertyRge, propertyToBeSaved.propertyRoute, propertyToBeSaved.propertyCreatedOnComment,
                                    propertyToBeSaved.propertyDirection, propertyToBeSaved.propertyZoning2, propertyToBeSaved.propertyZoning3, propertyToBeSaved.propertyZoning4, propertyToBeSaved.propertyZoning5,
                                    propertyToBeSaved.propertyX, propertyToBeSaved.propertyY, propertyToBeSaved.propertyStreetPrefix, propertyToBeSaved.propertyCounty, propertyToBeSaved.proprtyType
                            ],
                                function (iitx, result) {
                                    if (result && result.rowsAffected > 0) {
                                        deferred.resolve({ error: null, isSuccess: true });
                                    } else {
                                        deferred.resolve({ error: null, isSuccess: false });
                                    }
                                },
                                function (iitx, error) {
                                    utilService.logtoConsole(error.message + " into function insertProperty", "error");
                                    deferred.resolve({ error: error, result: null });
                                });

                        }
                    }, function (tx, error) {
                        utilService.logtoConsole(error + " into function insertProperty", "error");
                        deferred.resolve({ error: error, result: null });
                    });
                });
                return deferred.promise;
            } catch (e) {
                utilService.logtoConsole(e, "error");
                deferred.resolve({ error: e, result: null });
            }
        },
        getTest: function () {
            var db = dbInitService.getdatabase();
            if (db != null) {
                try {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        queries = [{ query: "select * from folder where folderrsn=1885" }, { query: "select * from folderprocess where processrsn=29245" }, { query: "select * from foldercomment where folderrsn=2561" }]
                        var dt = [{ folder: [], process: [], processcomment: [] }];
                        for (var i = 0; i < queries.length; i++) {
                            var c = 0;
                            tx.executeSql(queries[i].query, [],
                                function (itx, result) {
                                    try {
                                        var row = null;
                                        if (result.rows && result.rows.length > 0) {
                                            for (var j = 0; j < result.rows.length; j++) {
                                                row = result.rows.item(j);
                                                if (c == 0)
                                                    dt[0].folder.push(row);
                                                if (c == 1)
                                                    dt[1].process.push(row);
                                                if (c == 2)
                                                    dt[0].processcomment.push(row);
                                            }

                                        }
                                        c++;
                                        if (queries.length === c) {
                                            deferred.resolve(dt);
                                        }
                                    } catch (e) {
                                        deferred.resolve(e);
                                    }


                                },
                                function (itx, error) {
                                    deferred.resolve(error);
                                });
                        }
                    });
                    return deferred.promise;
                } catch (e) {
                    deferred.resolve(e);
                }
            }
        },
        excecuteasync: function (args) {
            var localCallback = function (result) {
                deferred.resolve(result)
            }

            if (args && args.length > 1) {
                var arlist = args.splice(1);
                arlist[0] = localCallback;
                var deferred = $q.defer();
                arlist[arlist.length + 1] = deferred;

                this[args[0]].apply(this, arlist);

            }
            if (args.length == 2) {

            }
        },
        test: function (callback, scope, pram1, deferredObj) {
            var db = dbInitService.getdatabase();
            if (db != null) {
                db.transaction(function (tx) {
                    var query = "select * from folder";
                    tx.executeSql(query, [],
                        function (itx, result) {
                            var dt = [];
                            var row = null;
                            if (result.rows && result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    row = result.rows.item(i);
                                    dt.push(row);
                                }
                            }
                            deferred.resolve({ error: null, isSuccess: true, data: dt });

                        },
                        function (itx, error) {
                            utilService.logtoConsole(error + " into function getValidSiteMobileOption", "error");
                            deferred.resolve({ error: e, isSuccess: false, data: null });
                        });
                });
            }
            return deferredObj.promise;
        },

        getFolderProcessAttemptResultList: function () {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        syntax = "select * from ValidProcessAttemptResult " +
                            "inner join DefaultAttemptResult on ValidProcessAttemptResult.ResultCode = DefaultAttemptResult.ResultCode";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getFolderProcessAttemptResultCode", "error");
                                deferred.resolve({ error: error, data: null });
                            })

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getAllowedFolderType: function (userid) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfolder'", [],
                            function (tx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    var syntax = "select distinct validfolder.foldertype,validfolder.folderdesc,validfolder.violationflag,validfolder.propertyrequired," +
                                        " validfolder.promptmultipleproperty,validfolder.subtypeentryrequired,validfolder.workcodeentryrequired " +
                                        " from validfolder where foldertype in  (select foldertype from validmobilefoldertype where foldergroupcode" +
                                        " in (select foldergroupcode from userpermission where upper(userid) = ? ))order by 2 asc";
                                    tx.executeSql(syntax, [userid],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function getFolderType", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                } else {
                                    deferred.resolve({ error: null, data: [] });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getValidFreeFormTab: function (inboxitem, parent) {
            try {
                var foldertype = inboxitem.folderType;
                var processcode = inboxitem.processTypeCode;
                if (foldertype != null && processcode != null) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfreeformtab'", [],
                                function (tx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var sqlparams = [];
                                        var syntax = "select * from validfreeformtab";
                                        if (parent.toUpperCase() === "FOLDERPROCESS") {
                                            syntax += " where (upper(parentname)=? or upper(parentname)=?) and (foldertype=? or ifnull(foldertype,'')='') and (processcode=? or ifnull(processcode,0)=0)";
                                            sqlparams = ["FOLDER_PROCESS", "FOLDERPROCESS", foldertype, processcode];
                                        } else {
                                            syntax += " where upper(parentname)=? and (foldertype=? or ifnull(foldertype,'')='') order by taborder asc ";
                                            sqlparams = ["FOLDER", foldertype];
                                        }

                                        //var syntax = "select * from validfreeformtab  where validFreeformtab.foldertype=? and (validfreeformtab.processcode=? OR validfreeformtab.processcode=0)";
                                        tx.executeSql(syntax, sqlparams,
                                            function (itx, result) {
                                                var dt = [];
                                                var row = null;
                                                if (result.rows && result.rows.length > 0) {
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        row = result.rows.item(i);
                                                        dt.push(row);
                                                    }
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function validfreeformtab", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    } else {
                                        deferred.resolve({ error: null, data: [] });
                                    }
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },

        getValidFreeColumnByFreeFromCode: function (freefromcode) {
            try {

                if (freefromcode != null && freefromcode != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfreeformcolumn'", [],
                                function (tx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var syntax = "select * from validfreeformcolumn  where validfreeformcolumn.freeformcode=? order by dislayorder asc";
                                        tx.executeSql(syntax, [freefromcode],
                                            function (itx, result) {
                                                var dt = [];
                                                var row = null;
                                                if (result.rows && result.rows.length > 0) {
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        row = result.rows.item(i);
                                                        dt.push(row);
                                                    }
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function validfreeformcolumn", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    } else {
                                        deferred.resolve({ error: null, data: [] });
                                    }
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getValidFreeColumnValueByFreeFromCode: function (freefromcode) {
            try {

                if (freefromcode != null && freefromcode != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfreeformcolumnvalue'", [],
                                function (tx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var syntax = "select * from validfreeformcolumnvalue  where validfreeformcolumnvalue.freeformcode=?";
                                        tx.executeSql(syntax, [freefromcode],
                                            function (itx, result) {
                                                var dt = [];
                                                var row = null;
                                                if (result.rows && result.rows.length > 0) {
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        row = result.rows.item(i);
                                                        dt.push(row);
                                                    }
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function validfreeformcolumnvalue", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    } else {
                                        deferred.resolve({ error: null, data: [] });
                                    }
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getValidFreeDefaultByFreeFromCode: function (freefromcode) {
            try {
                if (freefromcode != null && freefromcode != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='validfreeformdefault'", [],
                                function (tx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var syntax = "select * from validfreeformdefault  where validfreeformdefault.freeformcode=?";
                                        tx.executeSql(syntax, [freefromcode],
                                            function (itx, result) {
                                                var dt = [];
                                                var row = null;
                                                if (result.rows && result.rows.length > 0) {
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        row = result.rows.item(i);
                                                        dt.push(row);
                                                    }
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function validfreeformdefault", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    } else {
                                        deferred.resolve({ error: null, data: [] });
                                    }
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getFolderFreeFormData: function (freefromcode, folderrsn) {
            try {
                if (freefromcode != null && freefromcode != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderfreeform'", [],
                                function (tx, result) {
                                    if (result.rows && result.rows.length > 0) {
                                        var syntax = "select * from folderfreeform  where folderfreeform.freeformcode=? and folderfreeform.folderrsn=?";
                                        tx.executeSql(syntax, [freefromcode, folderrsn],
                                            function (itx, result) {
                                                var dt = [];
                                                var row = null;
                                                if (result.rows && result.rows.length > 0) {
                                                    for (var i = 0; i < result.rows.length; i++) {
                                                        row = result.rows.item(i);
                                                        dt.push(row);
                                                    }
                                                }
                                                deferred.resolve({ error: null, data: dt });
                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function folderfreeform", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });
                                    } else {
                                        deferred.resolve({ error: null, data: [] });
                                    }
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getFolderProcessFreeFormData: function (freefromcode, folderrsn, processrsn) {
            try {

                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='folderprocessinspdetail'", [],
                            function (tx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    var syntax = "select * from folderprocessinspdetail  where folderprocessinspdetail.freeformcode=? and folderprocessinspdetail.folderrsn=? and folderprocessinspdetail.processrsn=?";
                                    tx.executeSql(syntax, [freefromcode, folderrsn, processrsn],
                                        function (itx, result) {
                                            var dt = [];
                                            var row = null;
                                            if (result.rows && result.rows.length > 0) {
                                                for (var i = 0; i < result.rows.length; i++) {
                                                    row = result.rows.item(i);
                                                    dt.push(row);
                                                }
                                            }
                                            deferred.resolve({ error: null, data: dt });
                                        },
                                        function (itx, error) {
                                            utilService.logtoConsole(error + " into function folderfreeform", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                } else {
                                    deferred.resolve({ error: null, data: [] });
                                }
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        insertFolderFreeFrom: function (data) {
            try {
                if (data != null && data != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            var syntax = "";
                            var colvalues = null;
                            if (data.parentname && data.parentname.toUpperCase() == "FOLDER") {
                                syntax = "insert into folderfreeform (freeformrsn,freeformcode,folderrsn,processrsn,formrow,comments," +
                                       "B01,B02,B03,B04,B05,B06,B07,B08,B09,B010,B011,B012,B013,B014,B015,B016,B017,B018,B019,B020," +
                                       "C01,C02,C03,C04,C05,C06,C07,C08,C09,C010,C011,C012,C013,C014,C015,C016,C017,C018,C019,C020," +
                                       "D01,D02,D03,D04,D05,D06,D07,D08,D09,D010,D011,D012,D013,D014,D015,D016,D017,D018,D019,D020," +
                                       "F01,F02,F03,F04,F05,F06,F07,F08,F09,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020," +
                                       "N01,N02,N03,N04,N05,N06,N07,N08,N09,N010,N011,N012,N013,N014,N015,N016,N017,N018,N019,N020," +
                                       "stampdate,stampuser,folderid, processid, isnew) values(?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?)";
                                colvalues = [
                                       data.freeformrsn, data.freeformcode, data.folderrsn, data.processrsn, data.formrow, data.comments,
                                        data.B01, data.B02, data.B03, data.B04, data.B05, data.B06, data.B07, data.B08, data.B09, data.B010, data.B011, data.B012, data.B013, data.B014, data.B015, data.B016, data.B017, data.B018, data.B019, data.B020,
                                        data.C01, data.C02, data.C03, data.C04, data.C05, data.C06, data.C07, data.C08, data.C09, data.C010, data.C011, data.C012, data.C013, data.C014, data.C015, data.C016, data.C017, data.C018, data.C019, data.C020,
                                        data.D01, data.D02, data.D03, data.D04, data.D05, data.D06, data.D07, data.D08, data.D09, data.D010, data.D011, data.D012, data.D013, data.D014, data.D015, data.D016, data.D017, data.D018, data.D019, data.D020,
                                        data.F01, data.F02, data.F03, data.F04, data.F05, data.F06, data.F07, data.F08, data.F09, data.F010, data.F011, data.F012, data.F013, data.F014, data.F015, data.F016, data.F017, data.F018, data.F019, data.F020,
                                        data.N01, data.N02, data.N03, data.N04, data.N05, data.N06, data.N07, data.N08, data.N09, data.N010, data.N011, data.N012, data.N013, data.N014, data.N015, data.N016, data.N017, data.N018, data.N019, data.N020,
                                        data.stampdate, data.stampuser, data.folderid, data.processid, data.isnew
                                ]
                            }
                            else if (data.parentname && data.parentname.toUpperCase() == "FOLDER_PROCESS") {
                                syntax = "insert into folderprocessinspdetail (inspdetailrsn,freeformcode,folderrsn,processrsn,comments," +
                                       "B01,B02,B03,B04,B05,B06,B07,B08,B09,B010,B011,B012,B013,B014,B015,B016,B017,B018,B019,B020," +
                                       "C01,C02,C03,C04,C05,C06,C07,C08,C09,C010,C011,C012,C013,C014,C015,C016,C017,C018,C019,C020," +
                                       "D01,D02,D03,D04,D05,D06,D07,D08,D09,D010,D011,D012,D013,D014,D015,D016,D017,D018,D019,D020," +
                                       "F01,F02,F03,F04,F05,F06,F07,F08,F09,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020," +
                                       "N01,N02,N03,N04,N05,N06,N07,N08,N09,N010,N011,N012,N013,N014,N015,N016,N017,N018,N019,N020," +
                                       "stampdate,stampuser,folderid, processid, isnew) values(?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?," +
                                       " ?,?,?,?,?)";
                                colvalues = [
                                        data.inspdetailrsn, data.freeformcode, data.folderrsn, data.processrsn, data.comments,
                                        data.B01, data.B02, data.B03, data.B04, data.B05, data.B06, data.B07, data.B08, data.B09, data.B010, data.B011, data.B012, data.B013, data.B014, data.B015, data.B016, data.B017, data.B018, data.B019, data.B020,
                                        data.C01, data.C02, data.C03, data.C04, data.C05, data.C06, data.C07, data.C08, data.C09, data.C010, data.C011, data.C012, data.C013, data.C014, data.C015, data.C016, data.C017, data.C018, data.C019, data.C020,
                                        data.D01, data.D02, data.D03, data.D04, data.D05, data.D06, data.D07, data.D08, data.D09, data.D010, data.D011, data.D012, data.D013, data.D014, data.D015, data.D016, data.D017, data.D018, data.D019, data.D020,
                                        data.F01, data.F02, data.F03, data.F04, data.F05, data.F06, data.F07, data.F08, data.F09, data.F010, data.F011, data.F012, data.F013, data.F014, data.F015, data.F016, data.F017, data.F018, data.F019, data.F020,
                                        data.N01, data.N02, data.N03, data.N04, data.N05, data.N06, data.N07, data.N08, data.N09, data.N010, data.N011, data.N012, data.N013, data.N014, data.N015, data.N016, data.N017, data.N018, data.N019, data.N020,
                                        data.stampdate, data.stampuser, data.folderid, data.processid, data.isnew
                                ]
                            }
                            tx.executeSql(syntax, colvalues,
                               function (itx, result) {
                                   if (result.rows && result.rowsAffected > 0) {
                                       deferred.resolve({ error: null, data: 'success' });
                                   } else {
                                       deferred.resolve({ error: null, data: 'no rows inserted' });
                                   }
                               },
                               function (itx, error) {
                                   utilService.logtoConsole(error + " into function folderfreeform", "error");
                                   deferred.resolve({ error: error, data: "failed" });
                               });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },

        updateFolderFreeFrom: function (data) {
            try {
                if (data != null && data != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT 1 FROM folderfreeform where folderrsn=? and freeformcode=? and freeformrsn=? ", [data.folderrsn, data.freeformcode, data.freeformrsn],
                                function (tx, result) {
                                    var syntax = "";
                                    var colvalues = null;
                                    if (result.rows && result.rows.length > 0) {
                                        syntax = "update  folderfreeform set " +
                                               "B01=?,B02=?,B03=?,B04=?,B05=?,B06=?,B07=?,B08=?,B09=?,B010=?,B011=?,B012=?,B013=?,B014=?,B015=?,B016=?,B017=?,B018=?,B019=?,B020=?," +
                                               "C01=?,C02=?,C03=?,C04=?,C05=?,C06=?,C07=?,C08=?,C09=?,C010=?,C011=?,C012=?,C013=?,C014=?,C015=?,C016=?,C017=?,C018=?,C019=?,C020=?," +
                                               "D01=?,D02=?,D03=?,D04=?,D05=?,D06=?,D07=?,D08=?,D09=?,D010=?,D011=?,D012=?,D013=?,D014=?,D015=?,D016=?,D017=?,D018=?,D019=?,D020=?," +
                                               "F01=?,F02=?,F03=?,F04=?,F05=?,F06=?,F07=?,F08=?,F09=?,F010=?,F011=?,F012=?,F013=?,F014=?,F015=?,F016=?,F017=?,F018=?,F019=?,F020=?," +
                                               "N01=?,N02=?,N03=?,N04=?,N05=?,N06=?,N07=?,N08=?,N09=?,N010=?,N011=?,N012=?,N013=?,N014=?,N015=?,N016=?,N017=?,N018=?,N019=?,N020=?," +
                                               "stampdate=?,stampuser=?,isedited=? where id=?"
                                        //colvalues = 
                                    } else {
                                        deferred.resolve({ error: null, data: null });
                                    }


                                    tx.executeSql(syntax, [
                                                data.B01, data.B02, data.B03, data.B04, data.B05, data.B06, data.B07, data.B08, data.B09, data.B010, data.B011, data.B012, data.B013, data.B014, data.B015, data.B016, data.B017, data.B018, data.B019, data.B020,
                                                data.C01, data.C02, data.C03, data.C04, data.C05, data.C06, data.C07, data.C08, data.C09, data.C010, data.C011, data.C012, data.C013, data.C014, data.C015, data.C016, data.C017, data.C018, data.C019, data.C020,
                                                data.D01, data.D02, data.D03, data.D04, data.D05, data.D06, data.D07, data.D08, data.D09, data.D010, data.D011, data.D012, data.D013, data.D014, data.D015, data.D016, data.D017, data.D018, data.D019, data.D020,
                                                data.F01, data.F02, data.F03, data.F04, data.F05, data.F06, data.F07, data.F08, data.F09, data.F010, data.F011, data.F012, data.F013, data.F014, data.F015, data.F016, data.F017, data.F018, data.F019, data.F020,
                                                data.N01, data.N02, data.N03, data.N04, data.N05, data.N06, data.N07, data.N08, data.N09, data.N010, data.N011, data.N012, data.N013, data.N014, data.N015, data.N016, data.N017, data.N018, data.N019, data.N020,
                                                data.stampdate, data.stampuser, data.isedited, data.id],
                                            function (itx, result) {
                                                if (result.rows && result.rowsAffected > 0) {
                                                    deferred.resolve({ error: null, data: 'success' });
                                                } else {
                                                    deferred.resolve({ error: null, data: 'no rows updated' });
                                                }

                                            },
                                            function (itx, error) {
                                                utilService.logtoConsole(error + " into function folderfreeform", "error");
                                                deferred.resolve({ error: error, data: null });
                                            });


                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        updateFolderProcessFreeFrom: function (data) {
            try {
                if (data != null && data != undefined) {
                    var db = dbInitService.getdatabase();
                    if (db != null) {
                        var deferred = $q.defer();
                        db.transaction(function (tx) {
                            tx.executeSql("SELECT 1 FROM folderprocessinspdetail where folderrsn=? and freeformcode=? and inspdetailrsn=? and processrsn=?", [data.folderrsn, data.freeformcode, data.inspdetailrsn, data.processrsn],
                                function (tx, result) {
                                    var syntax = "";
                                    var colvalues = null;
                                    if (result.rows && result.rows.length > 0) {
                                        syntax = "update  folderprocessinspdetail set " +
                                               "B01=?,B02=?,B03=?,B04=?,B05=?,B06=?,B07=?,B08=?,B09=?,B010=?,B011=?,B012=?,B013=?,B014=?,B015=?,B016=?,B017=?,B018=?,B019=?,B020=?," +
                                               "C01=?,C02=?,C03=?,C04=?,C05=?,C06=?,C07=?,C08=?,C09=?,C010=?,C011=?,C012=?,C013=?,C014=?,C015=?,C016=?,C017=?,C018=?,C019=?,C020=?," +
                                               "D01=?,D02=?,D03=?,D04=?,D05=?,D06=?,D07=?,D08=?,D09=?,D010=?,D011=?,D012=?,D013=?,D014=?,D015=?,D016=?,D017=?,D018=?,D019=?,D020=?," +
                                               "F01=?,F02=?,F03=?,F04=?,F05=?,F06=?,F07=?,F08=?,F09=?,F010=?,F011=?,F012=?,F013=?,F014=?,F015=?,F016=?,F017=?,F018=?,F019=?,F020=?," +
                                               "N01=?,N02=?,N03=?,N04=?,N05=?,N06=?,N07=?,N08=?,N09=?,N010=?,N011=?,N012=?,N013=?,N014=?,N015=?,N016=?,N017=?,N018=?,N019=?,N020=?," +
                                               "stampdate=?,stampuser=?,isedited=? where id=?"
                                        colvalues = [
                                                data.B01, data.B02, data.B03, data.B04, data.B05, data.B06, data.B07, data.B08, data.B09, data.B010, data.B011, data.B012, data.B013, data.B014, data.B015, data.B016, data.B017, data.B018, data.B019, data.B020,
                                                data.C01, data.C02, data.C03, data.C04, data.C05, data.C06, data.C07, data.C08, data.C09, data.C010, data.C011, data.C012, data.C013, data.C014, data.C015, data.C016, data.C017, data.C018, data.C019, data.C020,
                                                data.D01, data.D02, data.D03, data.D04, data.D05, data.D06, data.D07, data.D08, data.D09, data.D010, data.D011, data.D012, data.D013, data.D014, data.D015, data.D016, data.D017, data.D018, data.D019, data.D020,
                                                data.F01, data.F02, data.F03, data.F04, data.F05, data.F06, data.F07, data.F08, data.F09, data.F010, data.F011, data.F012, data.F013, data.F014, data.F015, data.F016, data.F017, data.F018, data.F019, data.F020,
                                                data.N01, data.N02, data.N03, data.N04, data.N05, data.N06, data.N07, data.N08, data.N09, data.N010, data.N011, data.N012, data.N013, data.N014, data.N015, data.N016, data.N017, data.N018, data.N019, data.N020,
                                                data.stampdate, data.stampuser, data.isedited, data.id

                                        ]
                                    } else {
                                        deferred.resolve({ error: null, data: null });
                                    }
                                    tx.executeSql(syntax, colvalues,
                                    function (itx, result) {
                                        if (result.rows && result.rowsAffected > 0) {
                                            deferred.resolve({ error: null, data: 'success' });
                                        } else {
                                            deferred.resolve({ error: null, data: 'no rows updated' });
                                        }
                                    },
                                    function (itx, error) {
                                        utilService.logtoConsole(error + " into function folderprocessinspdetail", "error");
                                        deferred.resolve({ error: error, data: null });
                                    });
                                });
                        });
                        return deferred.promise;
                    } else {
                        utilService.logtoConsole("Error while opening sqlite database", "error");
                    }
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getFolderFreeFormDataToUpload: function (data) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select freeformrsn as FreeformRSN,freeformcode as FreeformCode,folderrsn as FolderRSN,processrsn as ProcessRSN,formrow as FormRow,comments as Comments," +
                                       "B01,B02,B03,B04,B05,B06,B07,B08,B09,B010,B011,B012,B013,B014,B015,B016,B017,B018,B019,B020," +
                                       "C01,C02,C03,C04,C05,C06,C07,C08,C09,C010,C011,C012,C013,C014,C015,C016,C017,C018,C019,C020," +
                                       "D01,D02,D03,D04,D05,D06,D07,D08,D09,D010,D011,D012,D013,D014,D015,D016,D017,D018,D019,D020," +
                                       "F01,F02,F03,F04,F05,F06,F07,F08,F09,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020," +
                                       "N01,N02,N03,N04,N05,N06,N07,N08,N09,N010,N011,N012,N013,N014,N015,N016,N017,N018,N019,N020," +
                                       "stampdate as StampDate,stampuser as StampUser from folderfreeform " +
                                       "where folderfreeform.freeformrsn=0 and ((ifnull(folderfreeform.IsNew,'')='Y' and folderfreeform.folderid=?) OR (ifnull(folderfreeform.IsNew,'')!='Y' and folderfreeform.folderrsn=? ))";
                        tx.executeSql(syntax, [data.folderId, data.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderfreeform", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        getFolderProcessFreeFormDataToUpload: function (data) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select inspdetailrsn as InspDetailRSN,freeformcode as FreeformCode,folderrsn as FolderRSN,processrsn as ProcessRSN,comments as Comments," +
                                       "B01,B02,B03,B04,B05,B06,B07,B08,B09,B010,B011,B012,B013,B014,B015,B016,B017,B018,B019,B020," +
                                       "C01,C02,C03,C04,C05,C06,C07,C08,C09,C010,C011,C012,C013,C014,C015,C016,C017,C018,C019,C020," +
                                       "D01,D02,D03,D04,D05,D06,D07,D08,D09,D010,D011,D012,D013,D014,D015,D016,D017,D018,D019,D020," +
                                       "F01,F02,F03,F04,F05,F06,F07,F08,F09,F010,F011,F012,F013,F014,F015,F016,F017,F018,F019,F020," +
                                       "N01,N02,N03,N04,N05,N06,N07,N08,N09,N010,N011,N012,N013,N014,N015,N016,N017,N018,N019,N020," +
                                       "stampdate as StampDate,stampuser as StampUser from  folderprocessinspdetail  where folderrsn=? and processrsn=? ";
                        tx.executeSql(syntax, [data.folderRSN, data.processRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderfreeform", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },
        deleteFolderFreeForm: function (ids) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "delete from folderfreeform where folderfreeform.id in (" + ids + ") ";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result && result.rowsAffected > 0) {

                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderfreeform while deleting", "error");
                                deferred.resolve({ error: error, data: "failed" });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        deleteFolderProcessFreeForm: function (ids) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "delete from folderprocessinspdetail where folderprocessinspdetail.id in (" + ids + ") ";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result && result.rowsAffected > 0) {

                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderprocessinspdetail while deleting", "error");
                                deferred.resolve({ error: error, data: "failed" });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getFolderProcessList: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select  validprocess.processdesc,validprocessstatus.statusdesc,validprocessattemptresult.resultdesc,folderprocesslist.*  from folderprocesslist " +
                        " left join  validprocess on folderprocesslist.processcode=validprocess.processcode " +
                        " left join validprocessstatus on validprocessstatus.statuscode = folderprocesslist.statuscode " +

                        " left join validprocessattemptresult on folderprocesslist.resultcode= validprocessattemptresult.resultcode " +
                        " where folderprocesslist.folderrsn=?";
                        tx.executeSql(syntax, [inboxItem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderprocesslist while selecting", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getFolderCommentList: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from foldercomment where  foldercomment.folderrsn=?";
                        tx.executeSql(syntax, [inboxItem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function foldercomment while selecting", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getFolderFeeList: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from accountbillfee where  accountbillfee.folderrsn=?";
                        tx.executeSql(syntax, [inboxItem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function accountbillfee while selecting", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getFolderFixtureList: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select folderfixture.*,validfixture.callflag,validfixture.conversionflag,validfixture.fixturedesc,validfixture.fixturegroup " +
                            " from folderfixture left join validfixture on folderfixture.fixturecode=validfixture.fixturecode where folderfixture.folderrsn=?";
                        tx.executeSql(syntax, [inboxItem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function accountbillfee while selecting", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getFolderDocumentList: function (inboxItem) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from folderdocument " +
                        " where  folderdocument.folderrsn=? order by displayorder asc";
                        tx.executeSql(syntax, [inboxItem.folderRSN],
                            function (itx, result) {
                                var dt = [];
                                var row = null;
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        row = result.rows.item(i);
                                        dt.push(row);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function folderdocument while selecting", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        updateFolderPropertyLatLong: function (data) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update property set propx=?,propy=? where property.propertyrsn=?";
                        tx.executeSql(syntax, [data.propx, data.propy, data.propertyrsn],
                            function (itx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function updateFolderPropertyLatLong while updating", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getFolderProcessPriorityList: function () {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from folderprocess where folderprocess.ispriority='Y'";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getFolderProcessPriorityList", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        updateProcessPriority: function (inboxitem) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update folderprocess set priority=?,ispriority='Y' where folderprocess.processrsn=?";
                        tx.executeSql(syntax, [inboxitem.processPriority, inboxitem.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rowsAffected > 0) {
                                    deferred.resolve({ error: null, data: 'success' });
                                } else {
                                    deferred.resolve({ error: null, data: 'no rows updated' });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function updateProcessPriority", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        updateProcessInspMin: function (inboxitem) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update folderprocess set inspminute=?,ispriority='Y' where folderprocess.processrsn=?";
                        tx.executeSql(syntax, [inboxitem.processPriority, inboxitem.processRSN],
                            function (itx, result) {
                                if (result.rows && result.rowsAffected > 0) {
                                    deferred.resolve({ error: null, data: 'success' });
                                } else {
                                    deferred.resolve({ error: null, data: 'no rows updated' });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function updateProcessInspMin", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        moveToInbox: function (item) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var updatesyntax = '';

                        if (item.processRSN === 0)
                            item.processRSN = item.processId
                        if (item.folderRSN === 0)
                            item.folderRSN = item.folderId
                        updatesyntax = "update folderprocessattempt set attemptby=null, attemptdate=null, resultcode=null," +
                                      " attemptcomment=null,overtime=null, timeunit=null, unittype=null, expenseamount=null, mileageamount=null " +
                                      " where folderrsn=? and processrsn=?";
                        tx.executeSql(updatesyntax, [item.folderRSN, item.processRSN],
                            function (itx, result) {
                                if (result != null && result != "" && result != undefined) {
                                    console.log("Folder Process Attempt Table's updated for ProcessRSN: " + item.processRSN);
                                    var updateStatement = "";
                                    if (item.folderRSN === 0) {
                                        updateStatement = "update folderprocess set enddate=null, isedited=null, isreschedule=null,isfailed=null,reassigneduser=null, " +
                                            " scheduledate= (select CASE WHEN beforerescheduledate IS NULL THEN scheduledate ELSE  beforerescheduledate END from  folderprocess where folderprocess.processrsn=? limit 1 ) , beforerescheduledate=null, " +
                                            " scheduleenddate= (select CASE WHEN beforerescheduleenddate IS NULL THEN scheduleenddate ELSE beforerescheduleenddate END from  folderprocess where folderprocess.processrsn=? limit 1 ), beforerescheduleenddate = null " +
                                            " where " +
                                            " ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.folderid=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.folderrsn=? )) " +
                                            " and ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=? ))";
                                    } else {
                                        updateStatement = "update folderprocess set enddate=null, isedited=null , isreschedule=null,isfailed=null,reassigneduser=null, " +
                                             " scheduledate= (select CASE WHEN beforerescheduledate IS NULL THEN scheduledate ELSE  beforerescheduledate END from  folderprocess where folderprocess.processrsn=? limit 1 ) , beforerescheduledate=null, " +
                                             " scheduleenddate= (select CASE WHEN beforerescheduleenddate IS NULL THEN scheduleenddate ELSE beforerescheduleenddate END from  folderprocess where folderprocess.processrsn=? limit 1 ), beforerescheduleenddate = null " +
                                             " where " +
                                             " ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.folderid=? ) and (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.folderrsn=? )) " +
                                             " Or ((ifnull(folderprocess.IsNew,'')='Y' and folderprocess.id=? ) OR (ifnull(folderprocess.IsNew,'')!='Y' and folderprocess.processrsn=? ))";
                                    }
                                    itx.executeSql(updateStatement, [item.processRSN, item.processRSN, item.folderId, item.folderRSN, item.processId, item.processRSN],
                                        function (iitx, result) {
                                            if (result != null && result != "" && result != undefined) {
                                                console.log("Folder Process updated for ProcessRSN: " + item.processRSN);
                                            }
                                            deferred.resolve({ error: null, data: "success" });
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error + " into function moveToInbox", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });
                                }
                                deferred.resolve({ error: null, data: "success" });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function moveToInbox", "error");
                                deferred.resolve({ error: error, data: null });
                            });

                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        updateProcessCoordXY: function (dataTosave) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "update folderprocess set coordx=?,coordy=? where folderprocess.processrsn=?";
                        tx.executeSql(syntax, [dataTosave.lat, dataTosave.lng, dataTosave.processRSN],
                            function (itx, result) {
                                deferred.resolve({ error: null, data: 'success' });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function updateProcessCoordXY", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        getEaiHistory: function () {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select * from eaihistory";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                }
                                deferred.resolve({ error: null, data: dt });
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function getEaiHistory", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        deleteEaiHistory: function (item) {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "delete from eaihistory where id=?";
                        tx.executeSql(syntax, [item.Id],
                            function (itx, result) {
                                if (result.rows && result.rowsAffected > 0) {
                                    deferred.resolve({ error: null, data: 'success' });
                                } else {
                                    deferred.resolve({ error: null, data: 'no rows delete' });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function deleteEaiHistory", "error");
                                deferred.resolve({ error: error, data: null });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        checkIfInspectionHasSign: function (atemptid) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select 1 from folderprocessattemptsignature where signaturedata!='' and attemptid=?";
                        tx.executeSql(syntax, [atemptid],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    deferred.resolve({ error: null, data: true });
                                } else {
                                    deferred.resolve({ error: null, data: false });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function checkIfInspectionHasSign", "error");
                                deferred.resolve({ error: error, data: false });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },

        insertUpdateEaiHistory: function (datatoupdate) {
            try {
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var queryifexists = "select 1 from eaihistory where id=?"
                        tx.executeSql(queryifexists, [datatoupdate.eaiId],
                           function (itx, result) {
                               if (result.rows.length > 0) {
                                   var updateeaisyntax = "update eaihistory set response=? where id=?"
                                   itx.executeSql(updateeaisyntax, [datatoupdate.eaiResponse, datatoupdate.eaiId],
                                        function (iitx, result) {
                                            if (result.rowsAffected > 0) {
                                                deferred.resolve({ error: null, data: "success" });
                                            } else {
                                                deferred.resolve({ error: null, data: null });
                                            }
                                        },
                                        function (iitx, error) {
                                            utilService.logtoConsole(error, "error");
                                            utilService.logtoConsole(error.message + " into function insertUpdateEaiHistory", "error");
                                            deferred.resolve({ error: error, data: null });
                                        });

                               } else {
                                   var syntax = "insert into eaihistory (folderrsn,processrsn,request,response,stampdate) values(?,?,?,?,?)"
                                   itx.executeSql(syntax, [datatoupdate.folderRSN, datatoupdate.processRSN, datatoupdate.request, datatoupdate.eaiResponse, datatoupdate.stampdate],
                                   function (iitx, result) {
                                       if (result.rowsAffected > 0) {
                                           deferred.resolve({ error: null, data: result.insertId });
                                       } else {
                                           deferred.resolve({ error: null, data: null });
                                       }
                                   },
                                   function (iitx, error) {
                                       utilService.logtoConsole(error, "error");
                                       utilService.logtoConsole(error.message + " into function insertUpdateEaiHistory", "error");
                                       deferred.resolve({ error: error, data: null });
                                   });
                               }
                           },
                           function (itx, error) {
                               utilService.logtoConsole(error, "error");
                               utilService.logtoConsole(error.message + " into function insertUpdateEaiHistory", "error");
                               deferred.resolve({ error: error, data: null });
                           });


                    });
                    return deferred.promise;
                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }

        },

        getAllFolderRSNProcessRSN: function () {
            try {
                var dt = [];
                var db = dbInitService.getdatabase();
                if (db != null) {
                    var deferred = $q.defer();
                    db.transaction(function (tx) {
                        var syntax = "select folder.folderrsn,folderprocess.processrsn from folderprocess " +
                                     "left join folder on folder.folderrsn=folderprocess.folderrsn";
                        tx.executeSql(syntax, [],
                            function (itx, result) {
                                if (result.rows && result.rows.length > 0) {
                                    for (var i = 0; i < result.rows.length; i++) {
                                        var record = result.rows.item(i);
                                        dt.push(record);
                                    }
                                    deferred.resolve({ error: null, data: dt });
                                } else {
                                    deferred.resolve({ error: null, data: dt });
                                }
                            },
                            function (itx, error) {
                                utilService.logtoConsole(error + " into function checkIfInspectionHasSign", "error");
                                deferred.resolve({ error: error, data: dt });
                            });
                    });
                    return deferred.promise;

                } else {
                    utilService.logtoConsole("Error while opening sqlite database", "error");
                }
            } catch (e) {
                utilService.logtoConsole(e.message, "error");
            }
        },
        getAllValidUserId: function (un) {
            var db = dbInitService.getdatabase();
            var dt = [];
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "SELECT userid, username FROM validuser";
                    tx.executeSql(syntax, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    var record = result.rows.item(i);
                                    dt.push(record);
                                }
                                deferred.resolve({ error: null, data: dt });
                            } else {
                                deferred.resolve({ error: null, data: dt });
                            }
                        },
                        function (itx, error) {
                            deferred.resolve({ error: error, data: dt });
                        });
                });
                return deferred.promise;
            }
        },
        checkOutBoxInspections: function () {
            var db = dbInitService.getdatabase();
            var dt = [];
            if (db != null) {
                var deferred = $q.defer();
                db.transaction(function (tx) {
                    var syntax = "select  1  from folderprocess where nullif(enddate,'')!=''";
                    tx.executeSql(syntax, [],
                        function (itx, result) {
                            if (result.rows && result.rows.length > 0) {
                                for (var i = 0; i < result.rows.length; i++) {
                                    var record = result.rows.item(i);
                                    dt.push(record);
                                }
                                deferred.resolve({ error: null, data: dt });
                            } else {
                                deferred.resolve({ error: null, data: dt });
                            }
                        },
                        function (itx, error) {
                            deferred.resolve({ error: error, data: dt });
                        });
                });
                return deferred.promise;
            }
        },

    };
});

