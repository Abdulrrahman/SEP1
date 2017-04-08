angular.module('SimpleRESTIonic.controllers', [])

    .controller('LoginCtrl', function (Backand, $state, $rootScope, LoginService) {
        var login = this;

        function signin() {
            LoginService.signin(login.email, login.password)
                .then(function () {
                    onLogin();
                }, function (error) {
                    console.log(error)
                })
        }

        function anonymousLogin() {
            LoginService.anonymousLogin();
            onLogin();
        }

        function onLogin() {
            $rootScope.$broadcast('authorized');
            login.email = '';
            login.password = '';
            $state.go('tab.dashboard');
        }

        function signout() {
            LoginService.signout()
                .then(function () {
                    //$state.go('tab.login');
                    login.email = '';
                    login.password = '';
                    $rootScope.$broadcast('logout');
                    $state.go($state.current, {}, { reload: true });
                })

        }

        login.signin = signin;
        login.signout = signout;
        login.anonymousLogin = anonymousLogin;
    })

    .controller('DashboardCtrl', function (ItemsModel, $rootScope) {
        var vm = this;

        function goToBackand() {
            window.location = 'http://docs.backand.com';
        }

        function getAll() {
            ItemsModel.all()
                .then(function (result) {
                    vm.data = result.data.data;
                });
        }

        function clearData() {
            vm.data = null;
        }

        function create(object) {
            ItemsModel.create(object)
                .then(function (result) {
                    cancelCreate();
                    getAll();
                });
        }

        function update(object) {
            ItemsModel.update(object.id, object)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function deleteObject(id) {
            ItemsModel.delete(id)
                .then(function (result) {
                    cancelEditing();
                    getAll();
                });
        }

        function initCreateForm() {
            vm.newObject = { name: '', description: '' };
        }

        function setEdited(object) {
            vm.edited = angular.copy(object);
            vm.isEditing = true;
        }

        function isCurrent(id) {
            return vm.edited !== null && vm.edited.id === id;
        }

        function cancelEditing() {
            vm.edited = null;
            vm.isEditing = false;
        }

        function cancelCreate() {
            initCreateForm();
            vm.isCreating = false;
        }

        vm.objects = [];
        vm.edited = null;
        vm.isEditing = false;
        vm.isCreating = false;
        vm.getAll = getAll;
        vm.create = create;
        vm.update = update;
        vm.delete = deleteObject;
        vm.setEdited = setEdited;
        vm.isCurrent = isCurrent;
        vm.cancelEditing = cancelEditing;
        vm.cancelCreate = cancelCreate;
        vm.goToBackand = goToBackand;
        vm.isAuthorized = false;

        $rootScope.$on('authorized', function () {
            vm.isAuthorized = true;
            getAll();
        });

        $rootScope.$on('logout', function () {
            clearData();
        });

        if (!vm.isAuthorized) {
            $rootScope.$broadcast('logout');
        }

        initCreateForm();
        getAll();

    })


    .controller('MainCtrl', function (ItemsModel, $rootScope, $state, $scope, $ionicViewSwitcher, $ionicModal, $timeout) {
        var mv = this;

        function changetoenglish()
        {
            mv.lang = "EN";
        }
        function changetoturkish()
        {
            mv.lang = "TR";
        }

        function timeout() {
            mv.q0 = 1;
            $scope.hi = "start";
            $scope.choice = [false, false, false, false];
            mv.result = [0, 0, 0, 0];
            $ionicViewSwitcher.nextDirection('back');
            $state.go($state.current, {}, { reload: true });
        }

        function is2selected() {
            var son = 0;
            for (var i = 0; i < 4; i++) {
                if ($scope.choice[i] == true) {
                    son++;
                }
            }
            if (son == 2 || son == 1) return true;
            else return false;
        }

        function calc() {
            var son = 0;
            while (son != 2) {
                for (var i = 0; i < 4; i++) {
                    if ($scope.choice[i] == true && son < 2) {
                        son++;
                        mv.result[i]++;
                    }
                }
            }
        }

        function start() {
            if (is2selected() == false && mv.q0 != 1) {
                $scope.choice = [false, false, false, false];
                $scope.sw1();
            }
            else {
                if (mv.q0 != 1)
                    calc();
                $scope.hi = "Soru : " + mv.q0;
                mv.q0 = mv.q0 + 1;
                $timeout.cancel(mv.starttimeer);
                mv.starttimeer = $timeout(timeout,5000);
                $scope.choice = [false, false, false, false];
                $ionicViewSwitcher.nextDirection('forward');
                $state.go($state.current, {}, { reload: true });
            }

        }

        mv.starttimeer = $timeout;
        mv.start = start;
        mv.q0 = 1;
        $scope.hi = "start";
        $scope.choice = [false, false, false, false];
        mv.result = [0, 0, 0, 0];
        mv.lang = "TR";
        mv.changetoenglish = changetoenglish;
        mv.changetoturkish = changetoturkish;

        $scope.sw1 = function (data) {
            //console.log(data);
            $scope.modal1.show();
            $timeout(function () {
                $scope.closesw1();
            }, 25000);
        };
        $ionicModal.fromTemplateUrl('templates/subtemplates/sub1.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal1 = modal;
        });

        $scope.closesw1 = function () {
            $scope.modal1.hide();
        };
    });

