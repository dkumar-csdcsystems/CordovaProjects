﻿app.factory('$cordovaNetwork', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

    /**
      * Fires offline a event
      */
    var offlineEvent = function () {
        var networkState = navigator.connection.type;
        $timeout(function () {
            $rootScope.$broadcast('$cordovaNetwork:offline', networkState);
        });
    };

    /**
      * Fires online a event
      */
    var onlineEvent = function () {
        var networkState = navigator.connection.type;
        $timeout(function () {
            $rootScope.$broadcast('$cordovaNetwork:online', networkState);
        });
    };

    document.addEventListener('deviceready', function () {
        if (navigator.connection) {
            document.addEventListener('offline', offlineEvent, false);
            document.addEventListener('online', onlineEvent, false);
        }
    });

    return {
        getNetwork: function () {
            return navigator.connection && navigator.connection.type;
        },

        isOnline: function () {
            var networkState = navigator.connection && navigator.connection.type;
            return networkState !== undefined && networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
        },

        isOffline: function () {
            var networkState = navigator.connection && navigator.connection.type;
            return networkState !== undefined && (networkState === Connection.UNKNOWN || networkState === Connection.NONE);
        },

        clearOfflineWatch: function () {
            document.removeEventListener('offline', offlineEvent);
            $rootScope.$$listeners['$cordovaNetwork:offline'] = [];
        },

        clearOnlineWatch: function () {
            document.removeEventListener('online', onlineEvent);
            $rootScope.$$listeners['$cordovaNetwork:online'] = [];
        }
    };
}]);