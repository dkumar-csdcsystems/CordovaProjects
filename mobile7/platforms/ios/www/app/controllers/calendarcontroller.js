define(["angular", "toastr"], function (angular, toastr) {
    app.controller('CalendarCtrl', function ($rootScope, $scope, $timeout, CommonService, $window, dataLayerService, utilService, $filter) {

        $scope.CalendarView = function (dataevent) {
            var docHeight = $(document).height();
            var topHeaderheight = angular.element("#topheader").outerHeight();
            var topcalendarHeaderheight = angular.element("#calendarHeader").outerHeight();
            var calendarSubHeaderHeight = angular.element("#calendarSubHeader").outerHeight();
            var fcHeaderHeight = angular.element(".fc-header").outerHeight();
            var footerHeight = 10;//angular.element("#footer").outerHeight();
            var heighttoset = docHeight - (topHeaderheight + topcalendarHeaderheight + calendarSubHeaderHeight + fcHeaderHeight + footerHeight + 30);

            var MobileCalendar = function () {
                // Create reference to this instance
                var o = this;
                // Initialize app when document is ready
                $(document).ready(function () {
                    o.initialize(dataevent);
                });
            };
            var p = MobileCalendar.prototype;
            p.initialize = function (dataevent) {
                this._enableEvents();
                this._initEventslist();
                this._initCalendar(dataevent);
                this._displayDate();
            };
            p._enableEvents = function () {
                var o = this;
                // Detaching the event 
                angular.element('#calender-prev').off();
                angular.element('#calender-next').off();
                angular.element('input[name="calendarMode"]').off();
                // Again attaching the event
                angular.element('#calender-prev').on('click', function (e) { o._handleCalendarPrevClick(e); });
                angular.element('#calender-next').on('click', function (e) { o._handleCalendarNextClick(e); });
                angular.element('input[name="calendarMode"]').on('change', function (e) { o._handleCalendarMode(e); });
            };
            p._handleCalendarPrevClick = function (e) {
                angular.element('#calendar').fullCalendar('prev');
                this._displayDate();
                //angular.element(".fc-scroller").mCustomScrollbar({
                //    setHeight: heighttoset,
                //    theme: "3d-dark",
                //});
            };
            p._handleCalendarNextClick = function (e) {
                angular.element('#calendar').fullCalendar('next');
                this._displayDate();
                //angular.element(".fc-scroller").mCustomScrollbar({
                //    setHeight: heighttoset,
                //    theme: "3d-dark",
                //});
            };
            p._handleCalendarMode = function (e) {
                angular.element('#calendar').fullCalendar('changeView', $(e.currentTarget).val());
                //
                //$('fc-time-grid').outerHeight()
                //setTimeout(function () {
                //    $('fc-time-grid-container').css('height', '')
                //} ,1000);
                //angular.element(".fc-scroller").mCustomScrollbar({
                //    setHeight: heighttoset,
                //    theme: "3d-dark",
                //});
            };
            p._displayDate = function () {
                var selectedDate = angular.element('#calendar').fullCalendar('getDate');
                angular.element('.selected-day').html(selectedDate.format("dddd"));
                angular.element('.selected-date').html(selectedDate.format("DD MMMM YYYY"));
                angular.element('.selected-year').html(selectedDate.format("YYYY"));
            };
            p._initEventslist = function () {
                if (!$.isFunction($.fn.draggable)) {
                    return;
                }
                var o = this;
                angular.element('.list-events .list-group-item').each(function () {
                    // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
                    // it doesn't need to have a start or end
                    var eventObject = {
                        title: $.trim($(this).text()) // use the element's text as the event title
                    };
                    // store the Event Object in the DOM element so we can get to it later
                    $(this).data('eventObject', eventObject);
                    // make the event draggable using jQuery UI
                    $(this).draggable({
                        zIndex: 999,
                        revert: true, // will cause the event to go back to its
                        revertDuration: 0  //  original position after the drag
                    });
                });
            };
            p._initCalendar = function (dataevent) {
                if (!$.isFunction($.fn.fullCalendar)) {
                    return;
                }
                for (var i = 0; i < dataevent.length; i++) {

                    dataevent[i].start = (dataevent[i].scheduleDate === "" || dataevent[i].scheduleDate === null || dataevent[i].scheduleDate === undefined) ? new Date() : dataevent[i].scheduleDate;// Checked scheduled date null because sometimes it was null comming from Amanda DB
                    dataevent[i].end = (dataevent[i].scheduleEndDate === "" || dataevent[i].scheduleEndDate === null || dataevent[i].scheduleEndDate === undefined) ? dataevent[i].scheduleDate : dataevent[i].scheduleEndDate;
                    dataevent[i].allDay = false;
                }


                angular.element('#calendar').fullCalendar('destroy');

                angular.element('#calendar').fullCalendar({
                    height: heighttoset,
                    header: false,
                    editable: true,
                    droppable: true,
                    resizable: true,
                    events: dataevent,
                    eventLimit: 2, // for all non-agenda views
                    views: {
                        agenda: {
                            eventLimit: 2 // adjust for agendaWeek/agendaDay
                        }
                    },
                    // Modified By Shailendra on 08-Jan-16
                    eventRender: function (event, element) {

                        element.find('.fc-content').html(

                                "<div class='col-sm-12 bold no-padding' onclick='event.preventDefault();event.stopPropagation();'> Folder Number:" + event.folderNumber + "</div>" +
                                "<div class='col-sm-12 no-padding'> Status:" + event.folderStatus + "</div>" +
                                //"<div class='col-sm-12 no-padding'>Schedule Date:" + event.scheduleDate + "</div>" +
                                "<div class='col-sm-12 no-padding'> Process Type:" + event.processType + "</div>" +
                                "<div class='col-sm-12 no-padding'>FolderRSN:" + event.folderRSN + "</div>" +
                                "<div class='col-sm-12 no-padding'>ProcessRSN:" + event.processRSN + "</div>"

                            );
                        //element.attr('href', 'javascript:void(0);');
                        element.click(function () {
                            $scope.SelectFolder(event);
                            $scope.CloseCalendarView();
                            //$(this).toggleClass('fc-event-select');
                        });



                    },
                    // Added this function By Shailendra on 11-Jan-16
                    eventResize: function (event, delta, revertFunc) {
                        var rescheduledefaultdate = new Date(new Date().setDate(new Date().getDate() + 1));
                        var validsiteoptions = dataLayerService.getSiteOptions();
                        var issignaturereq = $filter('filter')(validsiteoptions, { optionkey: "Allow same day inspection reschedule" }, true);
                        if (issignaturereq && issignaturereq.length > 0) {
                            if (issignaturereq[0].optionvalue.toLowerCase() === "yes") {
                                rescheduledefaultdate = new Date();
                            }
                        }
                        if (new Date(new Date(event.start).toDateString()) < new Date(rescheduledefaultdate.toDateString())) {
                            var dateformat = CommonService.getDateFormat();
                            utilService.showError('Re-schedule date can not be less than ' + moment(rescheduledefaultdate).format(dateformat), "info");
                            revertFunc();
                            return;
                        }
                        $timeout(function () {
                            var calendarEvt = event;
                            toastr.options = CommonService.getCustomToastrOptions();
                            var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Yes</button>&nbsp;&nbsp;<button type='button' id='noConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>No</button></div>";
                            toastr.info(html, 'Are you sure, You want to re-schedule ' + calendarEvt.folderNumber + " process <br/> from: " + moment(calendarEvt.start._i).format() + " to: " + moment(calendarEvt.start._d).format(), {
                                allowHtml: true,
                                onShown: function (html) {
                                    $("#yesConfirm").on('click', function (event) {
                                        $scope.ResizeDropEventHandler(calendarEvt);
                                    });
                                    $("#noConfirm").on("click", function () {
                                        $scope.revertDragDrop(revertFunc);
                                    });
                                }
                            });
                        }, 100, false);


                    },
                    // Added this function By Shailendra on 11-Jan-16
                    eventDrop: function (event, delta, revertFunc) {
                        var rescheduledefaultdate = new Date(new Date().setDate(new Date().getDate() + 1));
                        var validsiteoptions = dataLayerService.getSiteOptions();
                        var issignaturereq = $filter('filter')(validsiteoptions, { optionkey: "Allow same day inspection reschedule" }, true);
                        if (issignaturereq && issignaturereq.length > 0) {
                            if (issignaturereq[0].optionvalue.toLowerCase() === "yes") {
                                rescheduledefaultdate = new Date();
                            }
                        }


                        if (new Date(new Date(event.start).toDateString()) < new Date(rescheduledefaultdate.toDateString())) {
                            var dateformat = CommonService.getDateFormat();
                            utilService.showError('Re-schedule date can not be less than ' + moment(rescheduledefaultdate).format(dateformat), "info");
                            revertFunc();
                            return;
                        }

                        $timeout(function () {
                            var calendarEvt = event;
                            toastr.options = CommonService.getCustomToastrOptions();
                            var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Yes</button>&nbsp;&nbsp;<button type='button' id='noConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>No</button></div>";
                            toastr.info(html, 'Are you sure, You want to re-schedule ' + calendarEvt.folderNumber + " process <br/> from: " + moment(calendarEvt.start._i).format() + " to: " + moment(calendarEvt.start._d).format(), {
                                allowHtml: true,
                                onShown: function (html) {
                                    $("#yesConfirm").on('click', function (event) {
                                        $scope.ResizeDropEventHandler(calendarEvt);
                                    });
                                    $("#noConfirm").on("click", function () {
                                        $scope.revertDragDrop(revertFunc);
                                    });
                                }
                            });
                        }, 100, false);

                    }

                });
                // Changes By Shailendra on 08-Jan-16


                //angular.element('.scroll-6').mCustomScrollbar({
                //    setHeight: heighttoset,
                //    theme: "3d-dark"
                //});

                angular.element('.fc-widget-header').css('margin-right', '0px');
                angular.element('.fc-day-grid-container').css('margin-right', '0px');
                //End of changes
            };
            MobileCalendar = new MobileCalendar;

        }
        $scope.revertDragDrop = function (funcionCallback) {
            toastr.remove();
            toastr.options = CommonService.getDefaultToastrOptions();
            funcionCallback.call();
        }
        $scope.ResizeDropEventHandler = function (event) {
            toastr.remove();
            toastr.options = CommonService.getDefaultToastrOptions();
            var item = event;
            item.ReScheduleDate = moment(event.start._d).format("YYYY-MM-DD HH:mm:ss");
            //event.end is null in case of Month view 
            item.ReScheduleEndDate = moment(event.end == null ? event.start._d : event.end._d).format("YYYY-MM-DD HH:mm:ss");
            item.ProcessRSN = item.processRSN;
            item.FolderRSN = item.folderRSN;
            item.ProcessId = item.processId;
            item.FolderId = item.folderId;
            item.IsRescheduled = 'Y';
            dataLayerService.saveRescheduledInspection(item).then(function (result) {
                if (result.data != null && result.data.length > 0) {
                    $scope.listInboxCalendarView = $.grep($scope.listInboxCalendarView, function (e) { return e.processRSN != item.ProcessRSN });
                    $scope.CalendarView($scope.listInboxCalendarView);
                    $scope.listInbox = $scope.listInboxCalendarView;
                    if ($scope.currentview === "Outbox") {
                        $scope.showOutboxList();
                    }
                }
            });
        }
        $scope.CloseCalendarView = function () {
            angular.element('.overlayCalendarView').stop().show().animate({
                left: '-100%',
                display: 'block',
            }, 500);
        }
        var calendarView = $scope.$on('calendarView', function (event, data) {
            if (data) {
                $scope.CalendarView(data);
            }
            angular.element('.overlayCalendarView').stop().show().animate({
                left: '0px',
            }, 500);
        });
        $scope.$on("$destroy", function () {
            calendarView();
        });
    });
});