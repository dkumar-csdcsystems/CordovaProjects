define(["angular", "toastr"], function (angular, toastr) {
    app.controller("LogoutCtrl", function ($scope, $rootScope, $location, $timeout, CommonService, utilService) {
        angular.element("body").addClass("body-background");
        $scope.Logout = function () {
            $("body").append('<div class="modal-backdrop fade in"></div>');
            $("body").addClass("modal-open");
            toastr.options = CommonService.getCustomToastrOptions();
            var html = "<div class='text-right'><button type='button' id='yesConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>Yes</button>&nbsp;&nbsp;<button type='button' id='noConfirm' class='btn clear' style='background-color: #2d3c4d;color: #fff;'>No</button></div>";
            toastr.info(html, 'Do you want to log off the Inspector App?', {
                allowHtml: true,
                onShown: function (html) {
                    $("#yesConfirm").on('click', function (event) {
                        $timeout(function () {
                            $("body").removeClass("modal-open");
                            $(".modal-backdrop").remove();
                            var storedUser = JSON.parse(localStorage.getItem("userSettings"));
                            if ($.isArray(storedUser) && storedUser.length > 0) {
                                $scope.username = (storedUser[0].validuser === undefined || storedUser[0].validuser === "" || storedUser[0].validuser === null) ? storedUser[0].username : storedUser[0].validuser;
                                $scope.password = "";
                            }
                            toastr.remove();
                            toastr.options = CommonService.getDefaultToastrOptions();
                            $location.path("/login");
                        }, 100);

                        utilService.showError("Logout successfully.", 'error');
                        
                    });
                    $("#noConfirm").on("click", function () {
                        $timeout(function () {
                            $("body").removeClass("modal-open");
                            $(".modal-backdrop").remove();
                            toastr.remove();
                            toastr.options = CommonService.getDefaultToastrOptions();
                            return false;
                        },100);
                        
                    });
                }
            });




        };

        $scope.QSDSync = function () {
            $rootScope.$broadcast("QuickSync");
        }
    });
});