/* global google */
define(["app/app"], function () {
    app.controller('MapCtrl', function ($scope, $rootScope, $timeout, $filter, utilService, dataLayerService, CommonService, $cordovaNetwork, cfpLoadingBar) {
        $scope.markers = [];
        $scope.tempmarkers = [];
        $scope.markersSetByUser = [];
        $scope.tempmarkersSetByUser = [];
        $scope.markerEndPointSetByUser = [];
        $scope.tempmarkerEndPointSetByUser = [];
        $scope.directionsDisplay = null;
        $scope.directionsService = null;
        $scope.markerStartPoint = {};
        $scope.markerEndPoint = {
            location: null,
            address: null
        };
        $scope.mapBounds = null;
        var map;

        var inboxLoaded = $rootScope.$on('InboxLoaded', function (event, data) {

            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to create marker. Please connect to network and try again", 'error');
                return;
            }
            //clear inbox item markers
            for (var i = 0; i < $scope.markers.length; i++) {
                $scope.markers[i].setMap(null);
            }
            $scope.markers = [];
            $scope.tempmarkers = [];
            if (directionRenderers && directionRenderers.length > 0) {
                for (var i = 0; i < directionRenderers.length; i++) {
                    directionRenderers[i].setMap(null);
                    directionRenderers[i].directions.routes = [];
                }
            }
            if ($scope.customMarkersSetByUser && $scope.customMarkersSetByUser.length > 0) {
                for (var i = 0; i < $scope.customMarkersSetByUser.length; i++) {
                    $scope.customMarkersSetByUser[i].setMap(null);
                }
            }
            directionRenderers = [];
            $scope.nearbySearchEndPoint = null;
            $scope.customMarkersSetByUser = [];

            if ($scope.tempmarkersSetByUser.length > 0) {
                $scope.tempmarkersSetByUser[0].setMap($scope.map);
            }

            if ($scope.tempmarkerEndPointSetByUser.length > 0) {
                $scope.tempmarkerEndPointSetByUser[0].setMap($scope.map);
            }
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.setMap(null);
            }

            if (data && data.inboxitems && data.inboxitems.length > 0) {
                var folderids = $(data.inboxitems).map(function (cnt, it) {
                    return it.folderId;
                }).get();
                $scope.inboxItems = data.inboxitems;
                if (folderids.length > 0) {
                    if (data.defaultcountry === undefined || data.defaultcountry === null || data.defaultcountry === "") {
                        $scope.defaultCountry = ($rootScope.startPoint.country === undefined || $rootScope.startPoint.country === null || $rootScope.startPoint.country === "") ? "Canada" : $rootScope.startPoint.country;
                    }
                    else {
                        $scope.defaultCountry = data.defaultcountry;
                    }
                    var validsiteoptions = dataLayerService.getSiteOptions();
                    var checkifpropxyisrequired = $filter('filter')(validsiteoptions, { optionkey: "Use Property X, Y columns for Geobase" }, true);

                    dataLayerService.getPropertyAddresses(folderids).then(function (result) {
                        if (result) {
                            if (result.error == null) {
                                if (result.data) {
                                    var geocoder = new google.maps.Geocoder();
                                    var interval = 300;
                                    for (var i = 0; i < result.data.length; i++) {
                                        var row = result.data[i];
                                        var fomattedAddress = CommonService.getformattedAddress(row);
                                        if (fomattedAddress === "") {
                                            fomattedAddress = row.propertyname;
                                        }
                                        var compRest = { country: $scope.defaultCountry };
                                        if (row.proppostal && row.proppostal.length > 0) {
                                            compRest.postalCode = row.proppostal;
                                        };
                                        if (checkifpropxyisrequired.length > 0 && checkifpropxyisrequired[0].optionvalue.toLowerCase() === "yes" && (row.propx !== "" && row.propx !== null) && (row.propy !== "" && row.propy !== null)) {

                                            if ((row.propy <= 90 && row.propy >= -90) && (row.propx <= 180 && row.propx >= -180)) {
                                                var callback = utilService.bind($scope.geocodeLatLongCallback, { scope: $scope, row: row, address: fomattedAddress });
                                                if (callback) {
                                                    $timeout(function (faddress, cmprest, row, cb) {
                                                        cb.call(this, { data: row, address: faddress });
                                                    }, interval + (100 * i), false, fomattedAddress, compRest, row, callback);
                                                }
                                            }
                                            else {
                                                var callback = utilService.bind($scope.geocodeCallback, { scope: $scope, row: row, address: fomattedAddress });
                                                $timeout(function (faddress, cmprest, cb) {
                                                    geocoder.geocode({ 'address': faddress, componentRestrictions: cmprest }, cb);
                                                }, interval + (100 * i), false, fomattedAddress, compRest, callback);
                                            }

                                        }
                                        else {
                                            var callback = utilService.bind($scope.geocodeCallback, { scope: $scope, row: row, address: fomattedAddress });
                                            $timeout(function (faddress, cmprest, cb) {
                                                geocoder.geocode({ 'address': faddress, componentRestrictions: cmprest }, cb);
                                            }, interval + (100 * i), false, fomattedAddress, compRest, callback);
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        });
        $scope.geocodeLatLongCallback = function (results, status) {
            utilService.logtoConsole(String.format("address: {0}, status:{1}", this.address));
            if (results && results.data) {
                var location = new google.maps.LatLng(Number(results.data.propx), Number(results.data.propy));
                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: location,
                    title: this.address,
                    optimized: false,
                    clickable: true,
                    folderrsn: this.row.folderrsn === 0 ? this.row.folderid : this.row.folderrsn
                });


                $scope.markers.push(marker);
                $scope.tempmarkers.push(marker);
                marker.setMap($scope.map);

                if ($scope.bounds) {
                    //extend the bounds to include each marker's position
                    $scope.bounds.extend(marker.position);

                    //now fit the map to the newly inclusive bounds
                    $scope.map.setCenter($scope.bounds.getCenter());
                    $scope.map.fitBounds($scope.bounds);
                }
                var inboxItem = null;
                if (this.row.folderrsn === 0) {
                    inboxItem = $filter("filter")($scope.inboxItems, { folderId: Number(this.row.folderid) }, true);
                }
                else {
                    inboxItem = $filter("filter")($scope.inboxItems, { folderRSN: Number(this.row.folderrsn) }, true);
                }

                if (inboxItem.length > 0) {
                    // Set the location for all inspection related to one folderrsn
                    $.grep(inboxItem, function (item, i) {
                        item.location = location;
                    });
                    var onMarkerClick = utilService.bind($scope.selectInboxItem, {
                        inboxItem: inboxItem[0],
                        address: this.address,
                        marker: marker
                    });
                    google.maps.event.addListener(marker, "click", onMarkerClick);
                }
            }
        }
        $scope.geocodeCallback = function (results, status) {
            utilService.logtoConsole(String.format("address: {0}, status:{1}", this.address, status));
            if (status === google.maps.GeocoderStatus.OK) {

                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: results[0].formatted_address,
                    optimized: false,
                    clickable: true,
                    folderrsn: this.row.folderrsn === 0 ? this.row.folderid : this.row.folderrsn
                });
                $scope.markers.push(marker);
                $scope.tempmarkers.push(marker);
                marker.setMap($scope.map);
                //$scope.map.setZoom(10);
                if ($scope.bounds) {
                    //extend the bounds to include each marker's position
                    $scope.bounds.extend(marker.position);

                    //now fit the map to the newly inclusive bounds
                    $scope.map.setCenter($scope.bounds.getCenter());
                    $scope.map.fitBounds($scope.bounds);
                }
                var inboxItem = null;
                if (this.row.folderrsn === 0) {
                    inboxItem = $filter("filter")($scope.inboxItems, { folderId: Number(this.row.folderid) }, true);
                }
                else {
                    inboxItem = $filter("filter")($scope.inboxItems, { folderRSN: Number(this.row.folderrsn) }, true);
                }
                if (inboxItem.length > 0) {
                    // Set the location for all inspection related to one folderrsn
                    $.grep(inboxItem, function (item, i) {
                        item.location = results[0].geometry.location;
                    });
                    var onMarkerClick = utilService.bind($scope.selectInboxItem, {
                        inboxItem: inboxItem[0],
                        address: this.address,
                        marker: marker
                    });
                    google.maps.event.addListener(marker, "click", onMarkerClick);
                    var datatoupdate = {
                        propertyrsn: this.row.propertyrsn,
                        propx: results[0].geometry.location.lat(),
                        propy: results[0].geometry.location.lng(),
                    };
                    var validsiteoptions = dataLayerService.getSiteOptions();
                    var checkifpropxyisrequired = $filter('filter')(validsiteoptions, { optionkey: "Use Property X, Y columns for Geobase" }, true);
                    if (checkifpropxyisrequired.length > 0 && checkifpropxyisrequired[0].optionvalue.toLowerCase() === "yes") {
                        // The property table's propx and propy with lat and lng respectively
                        dataLayerService.updateFolderPropertyLatLong(datatoupdate).then(function (result) {

                        });
                    }
                }
            }
            else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                var interval = 300;
                var geocoder = new google.maps.Geocoder();
                var compRest = { country: $scope.defaultCountry };
                if (this.row.proppostal && this.row.proppostal.length > 0) {
                    compRest.postalCode = this.row.proppostal;
                };

                var callback = utilService.bind($scope.geocodeCallback, { scope: $scope, row: this.row, address: this.address });
                $timeout(function (faddress, cmprest, cb) {
                    geocoder.geocode({ 'address': faddress, componentRestrictions: cmprest }, cb);
                }, interval + (100), false, this.address, compRest, callback);
            } else {
                utilService.logtoConsole("Geocoder failed due to :" + status)
            }
        };
        var infowindow = new google.maps.InfoWindow();
        $scope.selectInboxItem = function () {
            // make selected for tapped marker in inbox list.
            infowindow.setContent(this.marker.title);
            infowindow.open($scope.map, this.marker);


            //var selecteditem = $filter("filter")($scope.inboxItems, { processRSN: Number(this.inboxItem.processRSN) }, true);
            //if (selecteditem.length > 0) {
            //    selecteditem[0].isInboxSelected = true;
            //}
            //// Send the all items to map menu controller to mark the checkbox and 
            //CommonService.broadcastInboxItemSelected({ data: $scope.inboxItems });
            //CommonService.broadcastCreateMarkerItemSelected();
            //$scope.$apply();
        };

        $scope.selectInboxItemForWindowsApp = function (inboxitem) {
            $('.activeRow').removeClass('activeRow');
            var id = "#inboxPanel_" + inboxitem.processRSN;
            $(id).addClass('activeRow');
            CommonService.broadcastInboxItemSelectedFromMarker(inboxitem);
        }
        var mapInitialized = $scope.$on('mapInitialized', function (event, map) {
            $scope.bounds = new google.maps.LatLngBounds();
            $rootScope.map = map;
            var isoffline = $cordovaNetwork.isOffline();
            if (isoffline) {
                utilService.showError("Unable to load map. Please connect to network and try again", 'error');
                return;
            }
            $rootScope.directionsDisplay = new google.maps.DirectionsRenderer();
            $rootScope.directionsService = new google.maps.DirectionsService();
            $rootScope.directionsDisplay.setMap(map);

            var endPointSettings = JSON.parse(localStorage.getItem("endPointSettings"));
            if (endPointSettings && endPointSettings.location) {
                $rootScope.endPoint.address = endPointSettings.address;
                $rootScope.endPoint.selectedCountry = $filter('filter')($rootScope.endPoint.countryList, { country: endPointSettings.country }, true);
                $scope.onSetEndPoint($scope.endPoint);
            }

            var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));
            if (startPointSettings && startPointSettings.location) {
                $rootScope.startPoint.address = startPointSettings.address;
                $rootScope.startPoint.selectedCountry = $filter('filter')($rootScope.startPoint.countryList, { country: startPointSettings.country }, true);
                $scope.onSetStartPoint($scope.startPoint);
            } else {
                var validsiteoptions = dataLayerService.getSiteOptions();
                var checkifdefaultAddress = $filter('filter')(validsiteoptions, { optionkey: "Default Start Point Address" }, true);
                if (checkifdefaultAddress && checkifdefaultAddress.length > 0 && checkifdefaultAddress[0].optionvalue !== "" && checkifdefaultAddress[0].optionvalue !== null) {
                    var defaultaddress = checkifdefaultAddress[0].optionvalue;
                    $rootScope.startPoint.selectedCountry = $filter('filter')($rootScope.startPoint.countryList, { country: $scope.defaultCountry }, true);
                    $rootScope.startPoint.address = defaultaddress;
                    $scope.onSetStartPoint($scope.startPoint);
                }
                else {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            $scope.getAddressFromLatLang(function (result) {
                                map.setCenter(pos);
                                var marker = new google.maps.Marker({
                                    map: $scope.map,
                                    position: pos,
                                    title: 'Your current location',
                                    label: "A",
                                    icon: $scope.pinSymbol('green')
                                });
                                $scope.markersSetByUser.push(marker);
                                $scope.tempmarkersSetByUser.push(marker);
                                $scope.markerStartPoint.location = { lat: pos.lat, lng: pos.lng };

                            }, position.coords.latitude, position.coords.longitude);


                        }, function (error) {
                            var infoWindow = new google.maps.InfoWindow({ map: map });
                            $scope.handleLocationError(true, infoWindow, map.getCenter());
                        });
                    } else {
                        // Browser doesn't support Geolocation
                        var infoWindow = new google.maps.InfoWindow({ map: map });
                        $scope.handleLocationError(false, infoWindow, map.getCenter());
                    }
                }
            }
            // Bind POI event on map
            $scope.POIClickEvent(map);
            //$('.gm-style-mtc').parent().append("<div class='manual-map-menu' ng-if='isItemSelected' ></div>");
        });


        $scope.POIClickEvent = function (map) {
            $scope.placesService = new google.maps.places.PlacesService(map);
            // Listen for clicks on the map.
            map.addListener('click', $scope.handleClick);
        };
        $scope.handleClick = function (event) {
            console.log('You clicked on: ' + event.latLng);
            // If the event has a placeId, use it.
            if (event.placeId) {
                console.log('You clicked on place:' + event.placeId);
                // Calling e.stop() on the event prevents the default info window from
                // showing.
                // If you call stop here when there is no placeId you will prevent some
                // other map click event handlers from receiving the event.
                event.stop();
                $scope.getPlaceInformation(event.placeId);
            }
        };

        $scope.getPlaceInformation = function (placeId) {
            $scope.placesService.getDetails({ placeId: placeId }, function (place, status) {
                if (status === 'OK') {
                    infowindow.setPosition(place.geometry.location)
                    infowindow.setContent("<div><img  src=" + place.icon + " height='16' width='16'><span style='font-weight: bold;'>" + place.name + "</span><br><span>" + place.formatted_address + "</span></div>");
                    infowindow.open($scope.map);
                }
            });
        };


        $scope.handleLocationError = function (browserHasGeolocation, infoWindow, pos) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
        };

        $scope.fodlerIds;
        $scope.markerEndPointArray = [];

        //var selectedRow = $scope.$on('selectedRow', function (event, inboxitem) {
        //    $scope.markerEndPoint = inboxitem.location;
        //    return false;
        //});


        $rootScope.startPoint = {
            address: '',
            location: '',
            country: '',
            selectedCountry: {},
            countryList: []
        };
        $rootScope.endPoint = {
            address: '',
            location: '',
            country: '',
            selectedCountry: {},
            countryList: []
        };


        $scope.getStartPointFormattedAddress = function () {
            var location = [];
            location[0] = $rootScope.startPoint.address;
            location[3] = ($rootScope.startPoint.selectedCountry === undefined || $rootScope.startPoint.selectedCountry === null) ? $scope.defaultCountry : $rootScope.startPoint.selectedCountry.country;
            return utilService.joinWith(location, ',');
        };
        $scope.getEndPointFormattedAddress = function () {
            var location = [];
            location[0] = $rootScope.endPoint.address;
            location[3] = ($rootScope.endPoint.selectedCountry === undefined || $rootScope.endPoint.selectedCountry === null) ? $scope.defaultCountry : $rootScope.endPoint.selectedCountry.country;
            return utilService.joinWith(location, ',');
        };

        var onOpenPopUpToAddStartPoint = $scope.$on('onOpenPOPUpToAddStartPoint', function (event, data) {
            if (data) {
                $rootScope.startPoint.address = data.address;
                var searchcountry = (data.selectedCountry || data.selectedCountry.country === undefined || data.selectedCountry.country === null) ? "" : data.selectedCountry.country;
                if (data.countryList.length > 0) {
                    var filteredCountry = $filter('filter')(data.countryList, { country: searchcountry }, true);
                    if (filteredCountry.length > 0) {
                        $rootScope.startPoint.selectedCountry = filteredCountry[0];
                    }
                }
                $rootScope.startPoint.country = data.country;
                $rootScope.startPoint.location = data.location;
                $rootScope.startPoint.countryList = data.countryList;
                $scope.markerStartPoint.address = $scope.getStartPointFormattedAddress();
            }

        });
        var onOpenPopUpToAddEndPoint = $scope.$on('onOpenPopUpToAddEndPoint', function (event, data) {
            if (data) {
                $rootScope.endPoint.address = data.address;
                var searchcountry = (data.selectedCountry || data.selectedCountry.country === undefined || data.selectedCountry.country === null) ? "" : data.selectedCountry.country;
                if (data.countryList.length > 0) {
                    var filteredCountry = $filter('filter')(data.countryList, { country: searchcountry }, true);
                    if (filteredCountry.length > 0) {
                        $rootScope.endPoint.selectedCountry = filteredCountry[0];
                    }
                }
                $rootScope.endPoint.country = data.country;
                $rootScope.endPoint.location = data.location;
                $rootScope.endPoint.countryList = data.countryList;
                $scope.markerEndPoint.address = $scope.getEndPointFormattedAddress();
            }

        });
        $scope.endPointSettings = {
            address: '',
            country: '',
            location: ''
        };
        var onClearRoute = $scope.$on('onClearRoute', function (event) {
            // Remove previous renderers
            for (var i = 0; i < directionRenderers.length; i++) {
                directionRenderers[i].setMap(null);
                directionRenderers[i].directions.routes = [];
            }
            for (var i = 0; i < $scope.customMarkersSetByUser.length; i++) {
                $scope.customMarkersSetByUser[i].setMap(null);
            }
            directionRenderers = [];
            $scope.nearbySearchEndPoint = null;
            $scope.customMarkersSetByUser = [];
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.getDirections().routes = [];
                $rootScope.directionsDisplay.setMap(null);

            }

            $scope.waypoints = [];
            $scope.wayptsorder = [];
            $scope.endpointviaroute = null;
            $scope.customwaypoints = [];
            if ($scope.selectedItems.length > 0) {
                $scope.itemSelectedMarker = [];
                $.map($scope.selectedItems, function (item, index) {

                    var filteredmarker = $filter('filter')($scope.markers, { folderrsn: item.folderRSN }, true);
                    if (filteredmarker.length > 0) {
                        var filterItemSelectedMarker = $filter('filter')($scope.itemSelectedMarker, { folderrsn: item.folderRSN }, true);
                        if (filterItemSelectedMarker.length === 0) {
                            // Store the selected inbox item's marker;
                            $scope.itemSelectedMarker.push(filteredmarker[0]);
                        }
                    }

                });

                for (var i = 0; i < $scope.itemSelectedMarker.length; i++) {
                    $scope.itemSelectedMarker[i].setMap($scope.map);
                }
            } else {
                $scope.markers = $scope.tempmarkers;
                for (var i = 0; i < $scope.markers.length; i++) {
                    $scope.markers[i].setMap($scope.map);
                }
            }
            $scope.markersSetByUser = $scope.tempmarkersSetByUser;
            $scope.markersSetByUser[0].setMap($scope.map);

            $scope.markerEndPointSetByUser = $scope.tempmarkerEndPointSetByUser
            if ($scope.markerEndPointSetByUser.length > 0) {
                $scope.markerEndPointSetByUser[0].setMap($scope.map);
            }

            $timeout(function () {
                if ($scope.inboxItems) {
                    $.map($scope.inboxItems, function (item, ind) {
                        item.isInboxDisabled = false;
                    });
                }
                if ($scope.listProjectView) {
                    $.map($scope.listProjectView, function (item, ind) {
                        item.isFolderDisabled = false;
                    });
                }
            }, 500);
            document.getElementById("directions-panel").innerHTML = "";

        });
        var onClearStartPoint = $scope.$on('onClearStartPoint', function (event) {
            $rootScope.startPoint.address = '';
            $rootScope.startPoint.country = '';
            $rootScope.startPoint.location = '';

            var filtercountry = $filter('filter')($rootScope.startPoint.countryList, { country: "" }, true);
            if (filtercountry.length > 0) {
                $rootScope.startPoint.selectedCountry = filtercountry[0];
            }
            else {
                $rootScope.startPoint.selectedCountry = {};
            }
            $scope.startPointSettings = {
                address: '',
                country: '',
                location: ''
            };
            localStorage.setItem('startPointSettings', JSON.stringify($scope.startPointSettings));

            for (var i = 0; i < $scope.markersSetByUser.length; i++) {
                $scope.markersSetByUser[i].setMap(null);

            }
            // Remove previous renderers
            for (var i = 0; i < directionRenderers.length; i++) {
                directionRenderers[i].setMap(null);
            }
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.getDirections().routes = [];
                $rootScope.directionsDisplay.setMap(null);
            }
            $scope.markersSetByUser = [];
            $scope.tempmarkersSetByUser = [];

            var selectedinboxitems = $filter("filter")($scope.inboxItems, { isInboxSelected: true }, true);
            if (selectedinboxitems.length > 0) {
                $.each(function (key) {
                    selectedinboxitems[key]["isInboxSelected"] = false;
                });
            }

            $scope.markerStartPoint = {};
            $scope.onSetStartPoint($rootScope.startPoint, 'fromClear');
        });
        var onClearEndPoint = $scope.$on('onClearEndPoint', function (event) {
            $rootScope.endPoint.address = '';
            $rootScope.endPoint.country = '';
            $rootScope.endPoint.location = '';

            var filtercountry = $filter('filter')($rootScope.endPoint.countryList, { country: "" }, true);
            if (filtercountry.length > 0) {
                $rootScope.endPoint.selectedCountry = filtercountry[0];
            }
            else {
                $rootScope.endPoint.selectedCountry = {};
            }
            $scope.endPointSettings = {
                address: '',
                country: '',
                location: ''
            };
            localStorage.setItem('endPointSettings', JSON.stringify($scope.endPointSettings));

            for (var i = 0; i < $scope.markerEndPointSetByUser.length; i++) {
                $scope.markerEndPointSetByUser[i].setMap(null);

            }
            // Remove previous renderers
            for (var i = 0; i < directionRenderers.length; i++) {
                directionRenderers[i].setMap(null);
            }
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.getDirections().routes = [];
                $rootScope.directionsDisplay.setMap(null);
            }
            $scope.markerEndPointSetByUser = [];
            $scope.tempmarkerEndPointSetByUser = [];

            var selectedinboxitems = $filter("filter")($scope.inboxItems, { isInboxSelected: true }, true);
            if (selectedinboxitems.length > 0) {
                $.each(function (key) {
                    selectedinboxitems[key]["isInboxSelected"] = false;
                });
            }

            $scope.markerEndPoint = {
                location: null,
                address: null
            };
            //$scope.onSetStartPoint($rootScope.startPoint, 'fromClear');
        });



        var onSetStartPoint = $scope.$on('onSetStartPoint', function (event, startpointaddress) {

            $scope.onSetStartPoint(startpointaddress);
        });
        $scope.onSetStartPoint = function (startpointaddress, fromwhere) {

            var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));

            $rootScope.startPoint.address = startpointaddress.address;
            $rootScope.startPoint.location = startpointaddress.location;
            $rootScope.startPoint.country = startpointaddress.country;
            $rootScope.startPoint.selectedCountry = startpointaddress.selectedCountry;
            $rootScope.startPoint.countryList = startpointaddress.countryList;


            var fomattedAddress = $scope.getStartPointFormattedAddress();
            if (fromwhere === "fromClear") {
                fomattedAddress = "";
            }
            if ((navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1 || navigator.userAgent.indexOf("Win32") != -1) && navigator.userAgent.indexOf("Chrome") == -1) {
                var dataToSend = { message: "setStartPoint", data: fomattedAddress, item: startpointaddress }
                window.top.postMessage(dataToSend, "ms-appx://" + document.location.host);
                return;
            }

            var geocoder = new google.maps.Geocoder();
            var country = '';
            $scope.markerStartPoint.address = fomattedAddress;
            if ($rootScope.startPoint.selectedCountry === undefined || $rootScope.startPoint.selectedCountry.country === undefined) {
                country = "";
            } else {
                country = $rootScope.startPoint.selectedCountry.country
            }
            $scope.startPointSettings = {
                address: $rootScope.startPoint.address,
                country: country
            };
            var callback = utilService.bind($scope.geocodeStartPointCallback, { scope: $scope, row: null, address: fomattedAddress, fromwhere: fromwhere });
            geocoder.geocode({ 'address': fomattedAddress }, callback);
        }
        $scope.geocodeStartPointCallback = function (results, status) {
            utilService.logtoConsole(String.format("Start address: {0}, status:{1}", this.address, status));
            for (var i = 0; i < $scope.markersSetByUser.length; i++) {
                $scope.markersSetByUser[i].setMap(null);

            }
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.getDirections().routes = [];
                $rootScope.directionsDisplay.setMap(null);
            }
            $scope.markersSetByUser = [];
            $scope.tempmarkersSetByUser = [];
            if (status === google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: this.address,
                    optimized: false,
                    label: "A",
                    icon: $scope.pinSymbol('green')

                });

                var pos = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                $scope.markerStartPoint.location = pos;
                $scope.startPointSettings.location = pos;
                localStorage.setItem('startPointSettings', JSON.stringify($scope.startPointSettings));
                // Setting default country selected on successfully geocode
                //$rootScope.startPoint.selectedCountry = $filter('filter')($rootScope.startPoint.countryList, { country: $scope.startPointSettings.country }, true)[0];
                $scope.markerStartPoint.location = pos;

                $scope.markersSetByUser.push(marker);
                $scope.tempmarkersSetByUser.push(marker)
                $rootScope.directionsDisplay.setMap($scope.map);

                //extend the bounds to include each marker's position
                $scope.bounds.extend(marker.position);

                //now fit the map to the newly inclusive bounds
                $scope.map.setCenter($scope.bounds.getCenter());
                $scope.map.fitBounds($scope.bounds);

            } else {
                if (this.fromwhere == "fromClear") {
                    // User does not provide any address so setting the current Geoloaction address
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (position) {
                            var pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            $scope.getAddressFromLatLang(function (result) {

                                var marker = new google.maps.Marker({
                                    map: $scope.map,
                                    position: pos,
                                    title: 'Your current location',
                                    label: "A",
                                    icon: $scope.pinSymbol('green')
                                });
                                $scope.markersSetByUser.push(marker);
                                $scope.tempmarkersSetByUser.push(marker)
                                $scope.markerStartPoint.location = { lat: pos.lat, lng: pos.lng };

                                //extend the bounds to include each marker's position
                                $scope.bounds.extend(marker.position);

                                //now fit the map to the newly inclusive bounds
                                $scope.map.setCenter($scope.bounds.getCenter());
                                $scope.map.fitBounds($scope.bounds);

                            }, position.coords.latitude, position.coords.longitude);


                        }, function () {
                            var infoWindow = new google.maps.InfoWindow({ map: $scope.map });
                            $scope.handleLocationError(true, infoWindow, $scope.map.getCenter());
                        });
                    } else {
                        // Browser doesn't support Geolocation
                        var infoWindow = new google.maps.InfoWindow({ map: $scope.map });
                        $scope.handleLocationError(false, infoWindow, $scope.map.getCenter());
                    }
                }
                // Setting the direction for dafult location
                $rootScope.directionsDisplay.setMap($scope.map);
            }
        };

        var onSetEndPoint = $scope.$on('onSetEndPoint', function (event, endpointaddress) {

            $scope.onSetEndPoint(endpointaddress);
        });
        $scope.onSetEndPoint = function (endpointaddress, fromwhere) {

            var endPointSettings = JSON.parse(localStorage.getItem("endPointSettings"));

            $rootScope.endPoint.address = endpointaddress.address;
            $rootScope.endPoint.location = endpointaddress.location;
            $rootScope.endPoint.country = endpointaddress.country;
            $rootScope.endPoint.selectedCountry = endpointaddress.selectedCountry;
            $rootScope.endPoint.countryList = endpointaddress.countryList;


            var fomattedAddress = $scope.getEndPointFormattedAddress();
            if (fromwhere === "fromClear") {
                fomattedAddress = "";
            }
            if ((navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1 || navigator.userAgent.indexOf("Win32") != -1) && navigator.userAgent.indexOf("Chrome") == -1) {
                var dataToSend = { message: "setStartPoint", data: fomattedAddress, item: endpointaddress }
                window.top.postMessage(dataToSend, "ms-appx://" + document.location.host);
                return;
            }

            var geocoder = new google.maps.Geocoder();
            var country = '';
            $scope.markerEndPoint.address = fomattedAddress;
            if ($rootScope.endPoint.selectedCountry === undefined || $rootScope.endPoint.selectedCountry.country === undefined) {
                country = "";
            } else {
                country = $rootScope.endPoint.selectedCountry.country
            }
            $scope.endPointSettings = {
                address: $rootScope.endPoint.address,
                country: country
            };
            var callback = utilService.bind($scope.geocodeEndPointCallback, { scope: $scope, row: null, address: fomattedAddress, fromwhere: fromwhere });
            geocoder.geocode({ 'address': fomattedAddress }, callback);
        }
        $scope.geocodeEndPointCallback = function (results, status) {
            utilService.logtoConsole(String.format("End address: {0}, status:{1}", this.address, status));
            for (var i = 0; i < $scope.markerEndPointSetByUser.length; i++) {
                $scope.markerEndPointSetByUser[i].setMap(null);

            }
            if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                $rootScope.directionsDisplay.getDirections().routes = [];
                $rootScope.directionsDisplay.setMap(null);
            }
            $scope.markerEndPointSetByUser = [];
            $scope.tempmarkerEndPointSetByUser = [];
            if (status === google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                    map: $scope.map,
                    position: results[0].geometry.location,
                    title: this.address,
                    optimized: false,
                    label: "D",
                });

                var pos = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
                $scope.markerEndPoint.location = pos;
                $scope.endPointSettings.location = pos;
                localStorage.setItem('endPointSettings', JSON.stringify($scope.endPointSettings));

                $scope.markerEndPointSetByUser.push(marker);
                $scope.tempmarkerEndPointSetByUser.push(marker);
                $rootScope.directionsDisplay.setMap($scope.map);

                //extend the bounds to include each marker's position
                $scope.bounds.extend(marker.position);

                //now fit the map to the newly inclusive bounds
                $scope.map.setCenter($scope.bounds.getCenter());
                $scope.map.fitBounds($scope.bounds);

            } else {
                utilService.showError("No address found due to below reason.</br>" + status + "</br> Please try again.");
            }
        };


        $scope.pinSymbol = function (color) {
            return {
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#000',
                strokeWeight: 1,
                scale: 1,
                labelOrigin: new google.maps.Point(0, -29)
            };
        };

        $scope.pinSymbolWithoutPath = function (color) {
            return {
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#000',
                strokeWeight: 1,
                scale: 1,
                labelOrigin: new google.maps.Point(0, -29)
            };
        };

        var onNavigate = $scope.$on("onNavigate", function (event, data) {
            try {
                if ($scope.markerStartPoint === undefined || $scope.markerStartPoint.location === undefined || $scope.markerStartPoint.location === "") {
                    var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));

                    $scope.markerStartPoint.location = startPointSettings.location;
                    $scope.markerStartPoint.address = startPointSettings.address;
                }

                if ($scope.markerStartPoint === undefined || $scope.markerStartPoint.location === undefined) {
                    utilService.showError("Please set your start point to navigate.", "info");
                    return;
                }
                var manualendpoint = null;
                if ($scope.markerEndPoint.location !== null && $scope.markerEndPoint.location !== undefined && $scope.markerEndPoint.location !== "") {
                    var manualendpoint = new google.maps.LatLng($scope.markerEndPoint.location.lat, $scope.markerEndPoint.location.lng);
                }
                var start = null;

                var request = {};
                data.selecteditems = CommonService.removeDuplicatesFromObjArray(data.selecteditems, "propertyRSN");
                $scope.selectedItems = data.selecteditems;
                start = new google.maps.LatLng($scope.markerStartPoint.location.lat, $scope.markerStartPoint.location.lng);

                var navigationurl = "";
                if ($scope.waypoints.length === 0) {
                    navigationurl = "http://www.google.com/maps/dir/?api=1&origin=" + start.lat() + "," + start.lng() + "&destination=" + $scope.endpointviaroute.lat() + ", " + $scope.endpointviaroute.lng();
                } else {
                    var pipeseparatewaypoints = "";
                    if (data.fromwhere === "hybrid") {
                        if ($scope.customwaypoints.length > 0) {
                            for (var i = 0; i < $scope.customwaypoints.length; i++) {
                                if ($scope.customwaypoints[i].position) {
                                    var lat = 0;
                                    var lng = 0;
                                    lat = $scope.customwaypoints[i].position.lat();
                                    lng = $scope.customwaypoints[i].position.lng();
                                    if (i < $scope.customwaypoints.length - 1) {
                                        pipeseparatewaypoints += lat + "," + lng + "+to:";
                                    }
                                    else {
                                        pipeseparatewaypoints += lat + "," + lng;
                                    }
                                }
                            }
                        }
                    } else {
                        if ($scope.wayptsorder.length === $scope.waypoints.length) {
                            for (var i = 0; i < $scope.waypoints.length; i++) {
                                if ($scope.waypoints[i].location) {
                                    var lat = 0;
                                    var lng = 0;
                                    lat = $scope.waypoints[$scope.wayptsorder[i]].location.lat();
                                    lng = $scope.waypoints[$scope.wayptsorder[i]].location.lng();
                                    if (i < $scope.waypoints.length - 1) {
                                        pipeseparatewaypoints += lat + "," + lng + "+to:";
                                    }
                                    else {
                                        pipeseparatewaypoints += lat + "," + lng;
                                    }
                                }
                            }
                        }
                    }
                    navigationurl = "http://maps.google.com/?saddr=" + "" + start.lat() + "," + start.lng() + "" + "&daddr=" + pipeseparatewaypoints + "+to:" + $scope.endpointviaroute.lat() + "," + $scope.endpointviaroute.lng() + "" + "&travelmode=driving" + "&dir_action=navigate";
                }
                navigationurl = encodeURI(navigationurl);
                if (navigationurl !== "") {
                    window.open(navigationurl, '_blank', 'location=no,closebuttoncaption=Back to Inspector App');
                } else {
                    utilService.showError("Can not navigate to this route.", "info");
                }
            } catch (e) {
                console.log(e);
            }
        });
        $scope.customMarkersSetByUser = [];
        $scope.nearbySearchEndPoint = null;
        $scope.waypoints = [];
        $scope.wayptsorder = [];
        $scope.endpointviaroute = null;
        $scope.customwaypoints = [];
        var directionRenderers = [];    // array for keeping track of renderers
        var onCalculateAndDisplayRoute = $scope.$on('onCalculateAndDisplayRoute', function (event, data) {

            if ((navigator.userAgent.indexOf("WOW64") != -1 || navigator.userAgent.indexOf("Win64") != -1 || navigator.userAgent.indexOf("Win32") != -1) && navigator.userAgent.indexOf("Chrome") == -1) {
                var dataToSend = { message: "calculateRoute" }
                window.top.postMessage(dataToSend, "ms-appx://" + document.location.host);
                return;
            }
            if ($scope.markerStartPoint === undefined || $scope.markerStartPoint.location === undefined || $scope.markerStartPoint.location === "") {
                var startPointSettings = JSON.parse(localStorage.getItem("startPointSettings"));
                $scope.markerStartPoint.location = startPointSettings.location;
                $scope.markerStartPoint.address = startPointSettings.address;
            }
            if ($scope.markerStartPoint === undefined || $scope.markerStartPoint.location === undefined) {
                utilService.showError("Please set your start point to get route.", "info");
                return;
            }
            var start, priorityend, prioritystart, nonePriorityend = null;
            var waypts = [];
            var request = {};
            var totalReq = [];

            start = new google.maps.LatLng($scope.markerStartPoint.location.lat, $scope.markerStartPoint.location.lng);

            if ($scope.markerEndPoint === undefined || $scope.markerEndPoint.location === undefined || $scope.markerEndPoint.location === "") {
                var endPointSettings = JSON.parse(localStorage.getItem("endPointSettings"));
                if (endPointSettings && endPointSettings !== null) {
                    $scope.markerEndPoint.location = endPointSettings.location;
                    $scope.markerEndPoint.address = endPointSettings.address;
                }

            }
            var manualendpoint = null;
            if ($scope.markerEndPoint.location !== undefined && $scope.markerEndPoint.location !== "" && $scope.markerEndPoint.location !== null) {
                var manualendpoint = new google.maps.LatLng($scope.markerEndPoint.location.lat, $scope.markerEndPoint.location.lng);
            }

            data.selecteditems = CommonService.removeDuplicatesFromObjArray(data.selecteditems, "propertyRSN");
            $scope.selectedItems = data.selecteditems;
           
            cfpLoadingBar.start();
            if (data.selecteditems.length > 0) {
                if (data.fromwhere === "hybrid") {
                    if (data.selecteditems.length === 1) {
                        priorityend = data.selecteditems[data.selecteditems.length - 1].location;
                        $scope.endpointviaroute = priorityend;
                        var req = {
                            origin: start,     // assume origin is an instance of google.maps.LatLng
                            destination: (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? priorityend : manualendpoint,
                            travelMode: google.maps.DirectionsTravelMode.DRIVING,
                            //requesttype:'priority'
                        };
                        req.optimizeWaypoints = true;
                        totalReq.push(req);
                    }
                    else if (data.selecteditems.length > 1) {
                        var priorityItems = $filter('filter')(data.selecteditems, { isPriority: true }, true);
                        if (priorityItems && priorityItems.length === 1) {
                            $scope.waypoints = [];
                            var waypoints = [];
                            for (var i = 0; i < priorityItems.length - 1; i++) {
                                if (priorityItems[i].location !== undefined && priorityItems[i].location !== null && priorityItems[i].location !== "") {
                                    waypoints.push({
                                        location: priorityItems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            priorityend = prioritystart = priorityItems[priorityItems.length - 1].location;

                            if (waypoints.length === 0) {
                                var req = {
                                    origin: start,
                                    destination: priorityend,
                                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                    //requesttype:'priority'
                                };
                            } else {
                                var req = {
                                    origin: start,
                                    destination: priorityend,
                                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                    waypoints: waypoints,
                                    //requesttype:'priority'
                                };
                            }
                            // Do not put it to upper as this is used only on navigation
                            waypoints.push({
                                location: priorityItems[i].location,
                                stopover: true
                            });
                            $scope.waypoints = waypoints;
                            totalReq.push(req);
                        }
                        else if (priorityItems && priorityItems.length > 1) {
                            var waypoints = [];
                            for (var i = 0; i < priorityItems.length - 1; i++) {
                                if (priorityItems[i].location !== undefined && priorityItems[i].location !== null && priorityItems[i].location !== "") {
                                    waypoints.push({
                                        location: priorityItems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            priorityend = prioritystart = priorityItems[priorityItems.length - 1].location;
                            if (waypoints.length === 0) {
                                var req = {
                                    origin: start,
                                    destination: priorityend,
                                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                    //requesttype:'priority'
                                };
                            } else {
                                var req = {
                                    origin: start,
                                    destination: priorityend,
                                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                    waypoints: waypoints,
                                    //requesttype:'priority'
                                };
                            }
                            $scope.waypoints = waypoints;
                            totalReq.push(req);
                        }
                        else {
                            prioritystart = start;
                        }

                        var nonePriorityItems = $filter('filter')(data.selecteditems, { isPriority: false }, true);
                        var waypoints = [];
                        if (nonePriorityItems && nonePriorityItems.length === 1) {
                            for (var i = 0; i < nonePriorityItems.length; i++) {
                                if (nonePriorityItems[i].location !== undefined && nonePriorityItems[i].location !== null && nonePriorityItems[i].location !== "") {
                                    waypoints.push({
                                        location: nonePriorityItems[i].location,
                                        stopover: true
                                    });
                                    $scope.waypoints.push({
                                        location: nonePriorityItems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            $scope.endpointviaroute = nonePriorityend = nonePriorityItems[nonePriorityItems.length - 1].location;
                        }
                        if (nonePriorityItems && nonePriorityItems.length > 1) {
                            for (var i = 0; i < nonePriorityItems.length; i++) {
                                if (nonePriorityItems[i].location !== undefined && nonePriorityItems[i].location !== null && nonePriorityItems[i].location !== "") {
                                    waypoints.push({
                                        location: nonePriorityItems[i].location,
                                        stopover: true
                                    });
                                    $scope.waypoints.push({
                                        location: nonePriorityItems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            $scope.endpointviaroute = nonePriorityend = nonePriorityItems[nonePriorityItems.length - 1].location;
                        }

                        if (nonePriorityend === "" || nonePriorityend === null || nonePriorityend === undefined) {
                            nonePriorityend = priorityend;
                            $scope.endpointviaroute = priorityend;
                        }

                        if (waypoints.length === 0) {
                            var req = {
                                origin: prioritystart,     // assume origin is an instance of google.maps.LatLng
                                destination: (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? nonePriorityend : manualendpoint,
                                travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                //requesttype:'nonepriority'
                            };
                        } else {
                            var req = {
                                origin: prioritystart,     // assume origin is an instance of google.maps.LatLng
                                destination: (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? nonePriorityend : manualendpoint,
                                travelMode: google.maps.DirectionsTravelMode.DRIVING,
                                waypoints: waypoints,
                                //requesttype:'nonepriority'
                            };
                        }
                        req.optimizeWaypoints = true;
                        totalReq.push(req);

                    }
                    if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                        $scope.endpointviaroute = manualendpoint;
                    }
                    // Remove previous renderers
                    for (var i = 0; i < directionRenderers.length; i++) {
                        directionRenderers[i].setMap(null);
                    }
                    // create a request for each destination
                    var coutomlocationtocreatemarker = [];

                    var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    $scope.customwaypoints = [];
                    $scope.totalResponse = [];
                    var totalreqlenght = totalReq.length;
                    for (var i = 0; i < totalReq.length; i++) {
                        (function (req, index, totalReq) {
                            var directionsService = new google.maps.DirectionsService();
                            directionsService.route(req, function (response, status) {
                                console.log(status);
                                totalreqlenght--;
                                if (status == google.maps.DirectionsStatus.OK) {
                                    // create a new DirectionsRenderer for this route
                                    var dirRenderer = new google.maps.DirectionsRenderer({ map: $scope.map, suppressMarkers: true });
                                    dirRenderer.setDirections(response);
                                    // track the renderers to clear on clear
                                    directionRenderers.push(dirRenderer);
                                    var requesttype = "";
                                    if (index == 0 && totalReq.length>1) {
                                        requesttype = 'priority'
                                    } else {
                                        requesttype = 'nonepriority'
                                    }
                                    $scope.totalResponse.push({ Index: index, Response: response, requesttype: requesttype });
                                    if (totalreqlenght === 0) {
                                       
                                      
                                        for (var i = 0; i < $scope.totalResponse.length; i++) {
                                            var leg = $scope.totalResponse[i].Response.routes[0].legs;
                                            if ($scope.totalResponse[i].Index === 0) {
                                                if (leg.length === 1) {
                                                    coutomlocationtocreatemarker.push(leg[0].start_location);
                                                    coutomlocationtocreatemarker.push(leg[0].end_location);
                                                } else {
                                                    for (var j = 0; j < leg.length; j++) {
                                                        if (j === 0) {
                                                            coutomlocationtocreatemarker.push(leg[j].start_location);
                                                            coutomlocationtocreatemarker.push(leg[j].end_location);
                                                        } else {
                                                            coutomlocationtocreatemarker.push(leg[j].end_location);
                                                        }
                                                    }
                                                }

                                            } else {
                                                for (var j = 0; j < leg.length; j++) {
                                                    coutomlocationtocreatemarker.push(leg[j].end_location);
                                                }
                                            }
                                        }

                                        $scope.totalResponse = $filter('orderBy')($scope.totalResponse, "Index", false);

                                        var priorityResponse = $filter('filter')($scope.totalResponse, { requesttype: 'priority' }, true);

                                        if (priorityResponse && priorityResponse.length > 0) {
                                            var route = priorityResponse[0].Response.routes[0];
                                            for (var i = route.legs.length - 1; i >= 0; i--) {
                                                dirRenderer.directions.routes[0].legs.unshift(route.legs[i]);
                                            }
                                        }
                                        dirRenderer.setPanel(document.getElementById("directions-panel"));


                                        for (var i = 0; i < $scope.markers.length; i++) {
                                            $scope.markers[i].setMap(null);
                                        }
                                        for (var i = 0; i < $scope.customMarkersSetByUser.length; i++) {
                                            $scope.customMarkersSetByUser[i].setMap(null);
                                        }
                                        if ($scope.markersSetByUser.length > 0) {
                                            $scope.markersSetByUser[0].setMap(null);
                                        }
                                        if ($scope.markerEndPointSetByUser.length > 0) {
                                            $scope.markerEndPointSetByUser[0].setMap(null);
                                        }
                                        if ($scope.inboxItems) {
                                            $timeout(function () {
                                                $.map($scope.inboxItems, function (item, ind) {
                                                    item.isInboxDisabled = true;
                                                });

                                            }, 500);
                                        }

                                        if ($scope.listProjectView) {
                                            $timeout(function () {
                                                $.map($scope.listProjectView, function (item, ind) {
                                                    item.isFolderDisabled = true;
                                                });
                                                $scope.$apply();
                                                var aa = "";
                                            }, 500);
                                        }

                                        for (var i = 0; i < coutomlocationtocreatemarker.length; i++) {
                                            if (i === 0) {
                                                var marker = new google.maps.Marker({
                                                    position: coutomlocationtocreatemarker[0],
                                                    map: $scope.map,
                                                    title: 'Start',
                                                    label: labels[i % labels.length],
                                                    icon: $scope.pinSymbolWithoutPath('green')
                                                   
                                                });
                                                $scope.customMarkersSetByUser.push(marker);

                                            } else {
                                                if (coutomlocationtocreatemarker.length - 1 === i) {
                                                    var marker = new google.maps.Marker({
                                                        position: coutomlocationtocreatemarker[i],
                                                        map: $scope.map,
                                                        label: labels[i % labels.length],
                                                        //icon: $scope.pinSymbolWithoutPath('red'),
                                                    });
                                                    $scope.customMarkersSetByUser.push(marker);
                                                } else {
                                                    var marker = new google.maps.Marker({
                                                        position: coutomlocationtocreatemarker[i],
                                                        map: $scope.map,
                                                        title: 'Midway',
                                                        label: labels[i % labels.length],
                                                        icon: $scope.pinSymbolWithoutPath('green'),
                                                       

                                                    });
                                                    $scope.customMarkersSetByUser.push(marker);
                                                    $scope.customwaypoints.push(marker);
                                                }
                                            }
                                        }
                                        //circle.setMap(null);
                                        cfpLoadingBar.complete();
                                    }
                                }
                                else {
                                    $rootScope.directionsDisplay.setMap($scope.map);
                                    document.getElementById("directions-panel").innerHTML = "";
                                    //$rootScope.directionsDisplay.setDirections(response);
                                    utilService.showError("No direction found with start point '" + $scope.markerStartPoint.address + "'", "info");
                                    $rootScope.$broadcast("NoDirectionFound");
                                    if ($scope.inboxItems) {
                                        $timeout(function () {
                                            $.map($scope.inboxItems, function (item, ind) {
                                                item.isInboxDisabled = false;
                                            });

                                        }, 500);
                                    }

                                    if ($scope.listProjectView) {
                                        $timeout(function () {
                                            $.map($scope.listProjectView, function (item, ind) {
                                                item.isFolderDisabled = false;
                                            });
                                            $scope.$apply();
                                            var aa = "";
                                        }, 500);
                                    }
                                    cfpLoadingBar.complete();
                                }

                            });
                        }(totalReq[i], i, totalReq));
                    }

                }
                else if (data.fromwhere === "optimized") {
                    if (data.selecteditems.length === 1) {
                        $scope.endpointviaroute = data.selecteditems[data.selecteditems.length - 1].location;
                    }
                    else if (data.selecteditems.length > 1) {
                        if (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) {
                            for (var i = 0; i < data.selecteditems.length - 1; i++) {
                                if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                    $scope.waypoints.push({
                                        location: data.selecteditems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            $scope.endpointviaroute = data.selecteditems[data.selecteditems.length - 1].location;
                        } else {
                            for (var i = 0; i < data.selecteditems.length; i++) {
                                if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                    $scope.waypoints.push({
                                        location: data.selecteditems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                        }
                    }
                    request.optimizeWaypoints = true;

                    if ($scope.waypoints.length === 0) {
                        request.origin = start;
                        request.destination = (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? $scope.endpointviaroute : manualendpoint;
                        request.travelMode = 'DRIVING';
                    } else {
                        request.origin = start;
                        request.destination = (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? $scope.endpointviaroute : manualendpoint;
                        request.waypoints = $scope.waypoints;
                        request.travelMode = 'DRIVING';
                    }
                    if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                        $scope.endpointviaroute = manualendpoint;
                    }

                    $rootScope.directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            $rootScope.directionsDisplay.setMap($scope.map);
                            $rootScope.directionsDisplay.setDirections(response);


                            $scope.wayptsorder = response.routes[0].waypoint_order;


                            for (var i = 0; i < $scope.markers.length; i++) {
                                $scope.markers[i].setMap(null);
                            }
                            if ($scope.markersSetByUser.length > 0) {
                                $scope.markersSetByUser[0].setMap(null);
                            }
                            if ($scope.markerEndPointSetByUser.length > 0) {
                                $scope.markerEndPointSetByUser[0].setMap(null);
                            }

                            if ($scope.inboxItems) {
                                $timeout(function () {
                                    $.map($scope.inboxItems, function (item, ind) {
                                        item.isInboxDisabled = true;
                                    });

                                }, 500);
                            }


                            if ($scope.listProjectView) {
                                $timeout(function () {
                                    $.map($scope.listProjectView, function (item, ind) {
                                        item.isFolderDisabled = true;
                                    });
                                    $scope.$apply();
                                    var aa = "";
                                }, 500);
                            }
                            $rootScope.directionsDisplay.setPanel(document.getElementById("directions-panel"));


                        } else {
                            $scope.wayptsorder = [];
                            document.getElementById("directions-panel").innerHTML = "";
                            $rootScope.directionsDisplay.setMap($scope.map);
                            $rootScope.directionsDisplay.setDirections(response);
                            utilService.showError("No direction found with start point '" + $scope.markerStartPoint.address + "'", "info");
                            $rootScope.$broadcast("NoDirectionFound");
                            if ($scope.inboxItems) {
                                $timeout(function () {
                                    $.map($scope.inboxItems, function (item, ind) {
                                        item.isInboxDisabled = false;
                                    });

                                }, 500);
                            }

                            if ($scope.listProjectView) {
                                $timeout(function () {
                                    $.map($scope.listProjectView, function (item, ind) {
                                        item.isFolderDisabled = false;
                                    });
                                    $scope.$apply();
                                    var aa = "";
                                }, 500);
                            }
                        }
                        cfpLoadingBar.complete();
                    });
                }
                else if (data.fromwhere === "priority") {
                    if (data.selecteditems.length === 1) {
                        $scope.endpointviaroute = data.selecteditems[data.selecteditems.length - 1].location;
                    }
                    else if (data.selecteditems.length > 1) {
                        if (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) {
                            for (var i = 0; i < data.selecteditems.length - 1; i++) {
                                if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                    $scope.waypoints.push({
                                        location: data.selecteditems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                            $scope.endpointviaroute = data.selecteditems[data.selecteditems.length - 1].location;
                        } else {
                            for (var i = 0; i < data.selecteditems.length; i++) {
                                if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                    $scope.waypoints.push({
                                        location: data.selecteditems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                        }
                    }
                    if ($scope.waypoints.length === 0) {
                        request.origin = start;
                        request.destination = (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? $scope.endpointviaroute : manualendpoint;
                        request.travelMode = 'DRIVING';
                    } else {
                        request.origin = start;
                        request.destination = (manualendpoint === "" || manualendpoint === null || manualendpoint === undefined) ? $scope.endpointviaroute : manualendpoint;
                        request.waypoints = $scope.waypoints;
                        request.travelMode = 'DRIVING';
                    }
                    if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                        $scope.endpointviaroute = manualendpoint;
                    }
                    $rootScope.directionsService.route(request, function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            $rootScope.directionsDisplay.setMap($scope.map);
                            $rootScope.directionsDisplay.setDirections(response);
                            $scope.wayptsorder = response.routes[0].waypoint_order;
                            for (var i = 0; i < $scope.markers.length; i++) {
                                $scope.markers[i].setMap(null);
                            }
                            if ($scope.markersSetByUser.length > 0) {
                                $scope.markersSetByUser[0].setMap(null);
                            }
                            if ($scope.markerEndPointSetByUser.length > 0) {
                                $scope.markerEndPointSetByUser[0].setMap(null);
                            }
                            if ($scope.inboxItems) {
                                $timeout(function () {
                                    $.map($scope.inboxItems, function (item, ind) {
                                        item.isInboxDisabled = true;
                                    });

                                }, 500);
                            }

                            if ($scope.listProjectView) {
                                $timeout(function () {
                                    $.map($scope.listProjectView, function (item, ind) {
                                        item.isFolderDisabled = true;
                                    });
                                    $scope.$apply();
                                    var aa = "";
                                }, 500);
                            }
                            $rootScope.directionsDisplay.setPanel(document.getElementById("directions-panel"));

                        } else {
                            $scope.wayptsorder = [];
                            document.getElementById("directions-panel").innerHTML = "";
                            $rootScope.directionsDisplay.setMap($scope.map);
                            $rootScope.directionsDisplay.setDirections(response);
                            utilService.showError("No direction found with start point '" + $scope.markerStartPoint.address + "'", "info");
                            $rootScope.$broadcast("NoDirectionFound");
                            if ($scope.inboxItems) {
                                $timeout(function () {
                                    $.map($scope.inboxItems, function (item, ind) {
                                        item.isInboxDisabled = false;
                                    });

                                }, 500);
                            }

                            if ($scope.listProjectView) {
                                $timeout(function () {
                                    $.map($scope.listProjectView, function (item, ind) {
                                        item.isFolderDisabled = false;
                                    });
                                    $scope.$apply();
                                    var aa = "";
                                }, 500);
                            }
                        }
                        cfpLoadingBar.complete();
                    });
                }
                else if (data.fromwhere === "optimizedreverse") {
                    if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                        if (data.selecteditems.length > 0) {
                            for (var i = 0; i < data.selecteditems.length; i++) {
                                if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                    $scope.waypoints.push({
                                        location: data.selecteditems[i].location,
                                        stopover: true
                                    });
                                }
                            }
                        }
                        request.optimizeWaypoints = true;
                        if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                            $scope.endpointviaroute = manualendpoint;
                        }
                        if ($scope.waypoints.length === 0) {
                            request.origin = start;
                            request.destination = ($scope.endpointviaroute === undefined || $scope.endpointviaroute === null || $scope.endpointviaroute === "") ? start : $scope.endpointviaroute;
                            request.travelMode = 'DRIVING';
                        } else {
                            request.origin = start;
                            request.destination = ($scope.endpointviaroute === undefined || $scope.endpointviaroute === null || $scope.endpointviaroute === "") ? start : $scope.endpointviaroute;
                            request.waypoints = $scope.waypoints;
                            request.travelMode = 'DRIVING';
                        }
                        $rootScope.directionsService.route(request, function (response, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                $rootScope.directionsDisplay.setMap($scope.map);
                                $rootScope.directionsDisplay.setDirections(response);
                                $scope.wayptsorder = response.routes[0].waypoint_order;
                                for (var i = 0; i < $scope.markers.length; i++) {
                                    $scope.markers[i].setMap(null);
                                }

                                if ($scope.markersSetByUser.length > 0) {
                                    $scope.markersSetByUser[0].setMap(null);
                                }
                                if ($scope.markerEndPointSetByUser.length > 0) {
                                    $scope.markerEndPointSetByUser[0].setMap(null);
                                }
                                if ($scope.inboxItems) {
                                    $timeout(function () {
                                        $.map($scope.inboxItems, function (item, ind) {
                                            item.isInboxDisabled = true;
                                        });

                                    }, 500);
                                }

                                if ($scope.listProjectView) {
                                    $timeout(function () {
                                        $.map($scope.listProjectView, function (item, ind) {
                                            item.isFolderDisabled = true;
                                        });
                                        $scope.$apply();
                                        var aa = "";
                                    }, 500);
                                }

                                $rootScope.directionsDisplay.setPanel(document.getElementById("directions-panel"));

                            } else {
                                $scope.wayptsorder = [];
                                document.getElementById("directions-panel").innerHTML = "";
                                $rootScope.directionsDisplay.setMap($scope.map);
                                $rootScope.directionsDisplay.setDirections(response);
                                utilService.showError("No direction found with start point '" + $scope.markerStartPoint.address + "'", "info");
                                $rootScope.$broadcast("NoDirectionFound");
                                if ($scope.inboxItems) {
                                    $timeout(function () {
                                        $.map($scope.inboxItems, function (item, ind) {
                                            item.isInboxDisabled = false;
                                        });

                                    }, 500);
                                }

                                if ($scope.listProjectView) {
                                    $timeout(function () {
                                        $.map($scope.listProjectView, function (item, ind) {
                                            item.isFolderDisabled = false;
                                        });
                                        $scope.$apply();
                                        var aa = "";
                                    }, 500);
                                }
                            }
                            cfpLoadingBar.complete();
                        });
                    } else {
                        var placeservice = new google.maps.places.PlacesService($scope.map);
                        placeservice.nearbySearch({
                            location: start,
                            radius: 50,
                        }, function (response, status) {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                $scope.endpointviaroute = response[0].geometry.location;
                                $scope.nearbySearchEndPoint = $scope.endpointviaroute;
                            }
                            if (data.selecteditems.length > 0) {
                                for (var i = 0; i < data.selecteditems.length; i++) {
                                    if (data.selecteditems[i].location !== undefined && data.selecteditems[i].location !== null && data.selecteditems[i].location !== "") {
                                        $scope.waypoints.push({
                                            location: data.selecteditems[i].location,
                                            stopover: true
                                        });
                                    }
                                }
                            }
                            request.optimizeWaypoints = true;
                            if (manualendpoint !== "" && manualendpoint !== null && manualendpoint !== undefined) {
                                $scope.endpointviaroute = manualendpoint;
                            }
                            if ($scope.waypoints.length === 0) {
                                request.origin = start;
                                request.destination = ($scope.endpointviaroute === undefined || $scope.endpointviaroute === null || $scope.endpointviaroute === "") ? start : $scope.endpointviaroute;
                                request.travelMode = 'DRIVING';
                            } else {
                                request.origin = start;
                                request.destination = ($scope.endpointviaroute === undefined || $scope.endpointviaroute === null || $scope.endpointviaroute === "") ? start : $scope.endpointviaroute;
                                request.waypoints = $scope.waypoints;
                                request.travelMode = 'DRIVING';
                            }
                            $rootScope.directionsService.route(request, function (response, status) {
                                if (status == google.maps.DirectionsStatus.OK) {
                                    $rootScope.directionsDisplay.setMap($scope.map);
                                    $rootScope.directionsDisplay.setDirections(response);
                                    $scope.wayptsorder = response.routes[0].waypoint_order;
                                    for (var i = 0; i < $scope.markers.length; i++) {
                                        $scope.markers[i].setMap(null);
                                    }

                                    $scope.markersSetByUser[0].setMap(null);
                                    if ($scope.inboxItems) {
                                        $timeout(function () {
                                            $.map($scope.inboxItems, function (item, ind) {
                                                item.isInboxDisabled = true;
                                            });

                                        }, 500);
                                    }

                                    if ($scope.listProjectView) {
                                        $timeout(function () {
                                            $.map($scope.listProjectView, function (item, ind) {
                                                item.isFolderDisabled = true;
                                            });
                                            $scope.$apply();
                                            var aa = "";
                                        }, 500);
                                    }

                                    $rootScope.directionsDisplay.setPanel(document.getElementById("directions-panel"));

                                } else {
                                    $scope.wayptsorder = [];
                                    document.getElementById("directions-panel").innerHTML = "";
                                    $rootScope.directionsDisplay.setMap($scope.map);
                                    $rootScope.directionsDisplay.setDirections(response);
                                    utilService.showError("No direction found with start point '" + $scope.markerStartPoint.address + "'", "info");
                                    $rootScope.$broadcast("NoDirectionFound");
                                    if ($scope.inboxItems) {
                                        $timeout(function () {
                                            $.map($scope.inboxItems, function (item, ind) {
                                                item.isInboxDisabled = false;
                                            });

                                        }, 500);
                                    }

                                    if ($scope.listProjectView) {
                                        $timeout(function () {
                                            $.map($scope.listProjectView, function (item, ind) {
                                                item.isFolderDisabled = false;
                                            });
                                            $scope.$apply();
                                            var aa = "";
                                        }, 500);
                                    }
                                }
                                cfpLoadingBar.complete();
                            });
                        });

                    }
                }

            }
            else {
                utilService.showError("Please select inspection to get route.", "info");
                return;
            }


        });
        $scope.itemSelectedMarker = [];
        var onCreateMarkerByItemSelected = $rootScope.$on('onCreateMarkerByItemSelected', function (event) {
            // Filter the selected inbox items
            var findSelectedFolder = $filter('filter')($scope.inboxItems, { isInboxSelected: true }, true);
            if (findSelectedFolder.length > 0) {
                // Remove all the markers first
                $scope.markers = $scope.tempmarkers;
                for (var i = 0; i < $scope.markers.length; i++) {
                    $scope.markers[i].setMap(null);
                }
                // Remove Direction if any
                if ($rootScope.directionsDisplay && $rootScope.directionsDisplay.getDirections() != undefined) {
                    $rootScope.directionsDisplay.getDirections().routes = [];
                    $rootScope.directionsDisplay.setMap(null);
                }
                for (var k = 0; k < findSelectedFolder.length; k++) {
                    var folderrsn = findSelectedFolder[k].folderRSN;
                    var filteredmarker = $filter('filter')($scope.markers, { folderrsn: folderrsn }, true);



                    if (filteredmarker.length > 0) {
                        for (var i = 0; i < filteredmarker.length; i++) {
                            //extend the bounds to include each marker's position
                            $scope.bounds.extend(filteredmarker[i].position);
                            //now fit the map to the newly inclusive bounds
                            $scope.map.setCenter($scope.bounds.getCenter());
                            $scope.map.fitBounds($scope.bounds);
                            filteredmarker[i].setMap($scope.map);

                            var filterItemSelectedMarker = $filter('filter')($scope.itemSelectedMarker, { folderrsn: folderrsn }, true);
                            if (filterItemSelectedMarker.length === 0) {
                                // Store the selected inbox item's marker;
                                $scope.itemSelectedMarker.push(filteredmarker[i]);
                            }
                        }
                    }
                }
            } else {
                // Reset When All selected inbox item un selected
                $scope.markers = $scope.tempmarkers;
                for (var i = 0; i < $scope.markers.length; i++) {
                    //extend the bounds to include each marker's position
                    $scope.bounds.extend($scope.markers[i].position);
                    //now fit the map to the newly inclusive bounds
                    $scope.map.setCenter($scope.bounds.getCenter());
                    $scope.map.fitBounds($scope.bounds);

                    $scope.markers[i].setMap($scope.map);
                }
            }


        });
        $scope.$on("$destroy", function () {
            onCalculateAndDisplayRoute();
            onSetStartPoint();
            onSetEndPoint();
            onClearEndPoint
            onClearStartPoint
            onOpenPopUpToAddStartPoint();
            onOpenPopUpToAddEndPoint();
            onNavigate();
            onClearRoute();
            inboxLoaded();
            mapInitialized();
            onCreateMarkerByItemSelected();
        });

        var validsiteoptions = dataLayerService.getSiteOptions();
        var defaultCountry = $filter('filter')(validsiteoptions, { optionkey: "Default Country" }, true);
        if (defaultCountry && defaultCountry.length > 0) {
            $scope.defaultCountry = defaultCountry[0].optionvalue;
        } else {
            $scope.defaultCountry = "Canada";
        }

        $scope.getAddressFromLatLang = function (callback, lat, lng) {
            var geocoder = new google.maps.Geocoder();
            var latLng = new google.maps.LatLng(lat, lng);
            geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                console.log("After getting address");
                console.log(results);
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        console.log(results[0].formatted_address);
                        //alert(results[1].formatted_address);
                        //return results[1];
                        var arrAddress = results[0].address_components;
                        var addressArray = [];
                        $rootScope.startPoint.address = "";
                        $.each(arrAddress, function (i, address_component) {
                            console.log('address_component:' + i);

                            if (address_component.types[0] == "route") {
                                console.log(i + ": route:" + address_component.long_name);
                                addressArray.push(address_component.long_name);
                            }

                            if (address_component.types[0] == "locality") {
                                console.log("town:" + address_component.long_name);
                                addressArray.push(address_component.long_name);
                            }
                            if (address_component.types[0] == "political") {
                                console.log("political area:" + address_component.long_name);
                                addressArray.push(address_component.long_name);
                            }

                            if (address_component.types[0] == "country") {
                                console.log("country:" + address_component.long_name);
                                $rootScope.startPoint.country = address_component.long_name;
                                $rootScope.startPoint.selectedCountry = { country: address_component.long_name, id: address_component.long_name };
                                $rootScope.startPoint.countryList.push($rootScope.startPoint.selectedCountry);
                            }

                            if (address_component.types[0] == "postal_code") {
                                console.log("pc:" + address_component.long_name);
                                addressArray.push(address_component.long_name);
                            }

                            if (address_component.types[0] == "street_number") {
                                console.log("street_number:" + address_component.long_name);
                                addressArray.push(address_component.long_name);
                            }
                        });
                        $rootScope.startPoint.location = { lat: lat, lng: lng };
                        $rootScope.startPoint.address = addressArray.join(", ");
                        localStorage.setItem('startPointSettings', JSON.stringify($scope.startPoint));
                        if (callback) {
                            callback.call();
                        }
                    }
                } else {
                    utilService.showError("Geocode was not successful for the following reason: " + status + "<br>Setting your current location as start point.", "info");
                    //alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }


    });
})
