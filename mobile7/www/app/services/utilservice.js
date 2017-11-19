define(["angular", "toastr"], function (angular, toastr) {
    if (toastr.options.showMethod === undefined || toastr.options.showMethod == null || toastr.options.showMethod === "") {
        toastr.options = {
            closeButton: false,
            positionClass: "toast-bottom-center",//"toast-bottom-center",//"toast-bottom-full-width","toast-top-right",
            showDuration: 100,
            hideDuration: 100,
            timeOut: 3000,
            extendedTimeOut: 1000,
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        }
    }
    app.factory("utilService", function () {
        return {

            /**
             * format
             * @param  {Date} target date object
             *         {String} pattern
             *  Y : A full numeric representation of a year, 4 digits
             *  y : A two digit representation of a year
             *  m : Numeric representation of a month, with leading zeros
             *  n : Numeric representation of a month, without leading zeros
             *  F : A full textual representation of a month, such as January or March
             *  M : A short textual representation of a month, three letters
             *  O : Japanese old month name
             *  d : Day of the month, 2 digits with leading zeros
             *  j : Day of the month without leading zeros
             *  w : Numeric representation of the day of the week
             *  l : A full textual representation of the day of the week
             *  D : A textual representation of a day, three letters
             *  N : ISO-8601 numeric representation of the day of the week
             *  J : A Japanese textual representation of the day of the week
             *  g : 12-hour format of an hour without leading zeros
             *  G : 24-hour format of an hour without leading zeros
             *  h : 12-hour format of an hour with leading zeros
             *  H : 24-hour format of an hour with leading zeros
             *  i : Minutes with leading zeros
             *  s : Seconds, with leading zeros
             *  a : Lowercase Ante meridiem and Post meridiem (am or pm)
             *  A : Uppercase Ante meridiem and Post meridiem ï¼ˆAM or PMï¼‰
             *  S : English ordinal suffix for the day of the month, 2 characters
             *  z : The day of the year (starting from 0)
             *  t : Number of days in the given month
             *  L : Whether it's a leap year
             *  Escape character is #. Example: DateFormatter.format(new Date(), "#Y#m#d #i#s Ymd");
             * @return {String} formatted date
             */
            dateformat: function (d, pattern) {
                if (typeof pattern != "string") return;
                var dYear = d.getFullYear();
                var dMonth = d.getMonth();
                var dDate = d.getDate();
                var dDay = d.getDay();
                var dHours = d.getHours();
                var dMinutes = d.getMinutes();
                var dSeconds = d.getSeconds();
                var res = "";
                for (var i = 0, len = pattern.length; i < len; i++) {
                    var c = pattern.charAt(i);
                    switch (c) {
                        case "#":
                            if (i == len - 1) break;
                            res += pattern.charAt(++i);
                            break;
                        case "Y":
                            res += dYear;
                            break;
                        case "y":
                            res += dYear.toString().substr(2, 2);
                            break;
                        case "m":
                            res += this.preZero(dMonth + 1);
                            break;
                        case "n":
                            res += dMonth + 1;
                            break;
                        case "d":
                            res += this.preZero(dDate);
                            break;
                        case "j":
                            res += dDate;
                            break;
                        case "w":
                            res += dDay;
                            break;
                        case "N":
                            res += this.isoDay(dDay);
                            break
                        case "l":
                            res += this.weekFullEn[dDay];
                            break;
                        case "D":
                            res += this.weekFullEn[dDay].substr(0, 3);
                            break;
                        case "J":
                            res += this.weekJp[dDay];
                            break;
                        case "F":
                            res += this.monthFullEn[dMonth];
                            break;
                        case "M":
                            res += this.monthFullEn[dMonth].substr(0, 3);
                            break;
                        case "O":
                            res += this.monthOldJp[dMonth];
                            break;
                        case "a":
                            res += this.ampm(dHours);
                            break;
                        case "A":
                            res += this.ampm(dHours).toUpperCase();
                            break;
                        case "H":
                            res += this.preZero(dHours);
                            break;
                        case "h":
                            res += this.preZero(this.from24to12(dHours));
                            break;
                        case "g":
                            res += this.from24to12(dHours);
                            break;
                        case "G":
                            res += dHours;
                            break;
                        case "i":
                            res += this.preZero(dMinutes);
                            break;
                        case "s":
                            res += this.preZero(dSeconds);
                            break;
                        case "t":
                            res += this.lastDayOfMonth(d);
                            break;
                        case "L":
                            res += this.isLeapYear(dYear);
                            break;
                        case "z":
                            res += this.dateCount(dYear, dMonth, dDate);
                            break;
                        case "S":
                            res += this.dateSuffix[dDate - 1];
                            break;
                        default:
                            res += c;
                            break;
                    }
                }
                return res;
            },

            weekFullEn: [
                "Sunday", "Monday", "Tuesday",
                "Wednesday", "Thursday", "Friday", "Saturday"
            ],

            weekJp: ["æ—¥", "æœˆ", "ç«", "æ°´", "æœ¨", "é‡‘", "åœŸ"],

            monthFullEn: [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],

            monthOldJp: [
                "ç¦æœˆ", "å¦‚æœˆ", "å¼¥ç”Ÿ", "å¯æœˆ", "çšæœˆ", "æ°´ç„¡æœˆ",
                "æ–‡æœˆ", "è‘‰æœˆ", "é•·æœˆ", "ç¥žç„¡æœˆ", "éœœæœˆ", "å¸«èµ°"
            ],

            dateSuffix: [
                "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th",
                "th", "th", "th", "th", "th", "th", "th", "th", "th", "th",
                "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th", "st"
            ],

            preZero: function (value) {
                return (parseInt(value) < 10) ? "0" + value : value;
            },

            from24to12: function (hours) {
                return (hours > 12) ? hours - 12 : hours;
            },

            ampm: function (hours) {
                return (hours < 12) ? "am" : "pm";
            },

            isoDay: function (day) {
                return (day == 0) ? "7" : day;
            },

            lastDayOfMonth: function (dateObj) {
                var tmp = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 1);
                tmp.setTime(tmp.getTime() - 1);
                return tmp.getDate();
            },

            isLeapYear: function (year) {
                var tmp = new Date(year, 0, 1);
                var sum = 0;
                for (var i = 0; i < 12; i++) {
                    tmp.setMonth(i);
                    sum += this.lastDayOfMonth(tmp);
                }
                return (sum == 365) ? "0" : "1";
            },

            dateCount: function (year, month, date) {
                var tmp = new Date(year, 0, 1);
                var sum = -1;
                for (var i = 0; i < month; i++) {
                    tmp.setMonth(i);
                    sum += this.lastDayOfMonth(tmp);
                }
                return sum + date;
            },

            uiblock: function (msg, close) {
                $.blockUI({
                    message: msg,
                    onUnblock: close,
                });
            },

            uiunblock: function () {
                setTimeout($.unblockUI, 100);
            },

            panel: function () {
                angular.element(".panel", this).click(function () {
                    angular.element(".overlay").animate({
                        left: "0px",
                    });
                });
            },

            clbtn: function () {
                angular.element(".clbtn").click(function () {
                    angular.element(".overlay").stop().show().animate({
                        left: "-100%",
                        display: "block",
                    });
                    return false;
                });
            },

            joinWith: function (array, joinChar) {
                for (var i = array.length - 1; i >= 0; i--) {
                    if (array[i] == null || array[i].trim() == "") {
                        array.splice(i, 1);
                    }
                }
                return array.join(joinChar);
            },

            bind: function (fn, scope) {
                return function () {
                    return fn.apply(scope, arguments);
                }
            },
            //Added by Shailendra
            timeDifference: function (date1, date2, diffType) {
                var difference = date1.getTime() - date2.getTime();
                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                difference -= daysDifference * 1000 * 60 * 60 * 24
                var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
                difference -= hoursDifference * 1000 * 60 * 60
                var minutesDifference = Math.floor(difference / 1000 / 60);
                difference -= minutesDifference * 1000 * 60
                var secondsDifference = Math.floor(difference / 1000);
                if (diffType == "day")
                    return daysDifference;
                else if (diffType == "hour")
                    return hoursDifference;
                else if (diffType == "minute")
                    return minutesDifference;
                else if (diffType == "second")
                    return secondsDifference;
                else {
                    var diff = '';
                    if (daysDifference > 0) {
                        diff += daysDifference + " day/s ";
                    }
                    if (hoursDifference > 0) {
                        diff += hoursDifference + " hour/s ";
                    }
                    if (minutesDifference > 0) {
                        diff += minutesDifference + " minute/s ";
                    }
                    if (secondsDifference > 0) {
                        diff += secondsDifference + " second/s ";
                    }
                    return diff;
                }

            },

            logtoConsole: function (logObject, level) {
                if (level === "error") {
                    console.error(logObject);
                }
                else if (level === "info") {
                    console.info(logObject);
                }
                else {
                    console.log(logObject);
                }
            },

            convertToDate: function (strdate) {
                var date = new Date(strdate);
                if (!date.getMonth()) {
                    date = new Date(strdate.replace(" ", "T"));
                    if (!date.getMonth()) {
                        return null;
                    }
                }
                return date;
            },

            confirm: function (content, title, uiCommandCallback) {
                var msgDialog = new Windows.UI.Popups.MessageDialog(content, title);
                var uiCommandOk = new Windows.UI.Popups.UICommand("Ok", null, "OK");
                msgDialog.commands.append(uiCommandOk);
                var uiCommandCancel = new Windows.UI.Popups.UICommand("Cancel", null, "CANCEL");
                msgDialog.commands.append(uiCommandCancel);
                msgDialog.showAsync().done(function (uiCommand) {
                    if (uiCommandCallback)
                        uiCommandCallback.call(this, { retuncommand: uiCommand });
                });

            },

            alert: function (content, title) {
                var messageDialog = new Windows.UI.Popups.MessageDialog(content, title);
                messageDialog.showAsync();
            },

            showError: function (msg, type) {
                var msg = msg;
                toastr.remove();
                if (msg.indexOf("Please wait") > -1) {
                    toastr.options = {
                        closeButton: false,
                        positionClass: "toast-bottom-center",//"toast-bottom-center",//"toast-bottom-full-width","toast-top-right",
                        showDuration: 100,
                        hideDuration: 100,
                        timeOut: 10000,
                        extendedTimeOut: 1000,
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut"
                    }
                }
                else {
                    toastr.options = {
                        closeButton: false,
                        positionClass: "toast-bottom-center",//"toast-bottom-center",//"toast-bottom-full-width","toast-top-right",
                        showDuration: 100,
                        hideDuration: 100,
                        timeOut: 3000,
                        extendedTimeOut: 1000,
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut"
                    }
                }
                if (type === undefined) {
                    type = "error";
                }
                toastr[type](msg);
            },

            removeToastr:function () {
                toastr.remove();
            },

            removeNullStrings: function (record) {
                if (record != null) {
                    for (f in record) {
                        if (record[f] === null || record[f] === "null") {
                            record[f] = "";
                        }
                    }
                }
                return record;
            }
        }
    });
});