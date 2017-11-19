// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        jquery: 'jquery.min',
        angular: 'angular.min',
        bootstrap: 'bootstrap.min',
        shuffle: 'shufflemodernizr.min',
        loadingbar: 'loading-bar',
        toastr: 'toastr.min',
        //smoothScroll: 'smooth-scroll.min',
        angularroute: 'angular-route.min',
        ngstorage: 'ngStorage.min',
        schema: '../app/schema',
        ngMap: 'ng-map.min',
        controllers: '../app/controllers',
        services: '../app/services',
        scrollbar: 'mCustomScrollbar.min',
        modernizr: 'modernizr-2.8.3.min',
        jquerytablegrouping: 'jquery.dataTables.rowGrouping.min',
        jquerydataTables: 'jquery.dataTables.min',
        'jquery-ui': 'jquery-ui.min',
        'touch-punch': 'jquery.ui.touch-punch.min',
        'angular-sortable': 'sortable.min',
        uibootstrap: 'ui-bootstrap-tpls-0.14.3.min',
        calendar: 'fullcalendar.min',
        moment: 'moment.min',
        bootstrapdatetimepicker: 'bootstrap-datetimepicker.min',
        signature_pad: 'signature_pad.min'
       
    },
    shim: {
        'jquery': { 'exports': 'jquery.min' },
        'bootstrap': ['jquery'],
        'modernizr': { deps: ['jquery'], exports: 'Modernizr' },
        'shuffle': ['modernizr'],
        'angular': { deps: ['jquery'], exports: 'angular' },
        'app': ['angular'],
        'uibootstrap': ['angular'],
        'angularroute': ['angular'],
        'jquerydataTables': ['angular'],
        'jquerytablegrouping': ['angular'],
        'ngMap': { deps: ['angular'], exports: 'ngMap' },
        'scrollbar': ['jquery'],
        'jquery-ui': ['jquery'],
        //'smoothScroll': ['jquery'],
        'touch-punch': ['jquery-ui'],
        'angular-sortable': { deps: ['jquery-ui', 'angular'] },
        'calendar': ['angular'],
        'moment': ['angular'],
        'bootstrapdatetimepicker': { deps: ['bootstrap', 'moment'] },
        'loadingbar': ['angular'],
        'toastr': ['jquery'],
        'signature_pad': ['jquery'],
        waitSeconds: 30
    }
});

requirejs(['jquery', 'angular', 'bootstrap', 'angularroute', 'ngstorage', 
    'shuffle',  'modernizr', 'jquerytablegrouping', 'jquerydataTables',
    'jquery-ui', 'touch-punch', 'angular-sortable',
    'ngMap', 'scrollbar', 'uibootstrap', 'calendar', 'moment', 'loadingbar', 'toastr', 'bootstrapdatetimepicker', 'signature_pad', 'app/app'], function (jquery, angular) {

        requirejs(['app/loadservice', 'app/loadschema', 'app/loadcontroller' ], function () {
            var $html = angular.element(document.getElementsByTagName('html')[0]);
            angular.element().ready(function () {
                // bootstrap the app manually
                angular.bootstrap(document, ['Mobile7']);

            });
        });
    });
