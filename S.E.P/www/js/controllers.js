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

        function headlan() {
            if (mv.lang.tr == true) {
                if(mv.q0 == 1)
                    return "Kişilik Testi";
                if (mv.q0 == 17)
                    return "test sonucu";
                else
                    return "Soru : " + (mv.q0 - 1);
            }
            else
            {
                if(mv.q0 == 1)
                    return "Personality Test";
                if (mv.q0 == 17)
                    return "Your Personality Result(s)";
                else
                    return "Question : " + (mv.q0 - 1);
            }

        }

        function onTimeout() {
            if (mv.count === 0) {
                $timeout.cancel(mytimeout);
                return;
            }
            mv.count--;
            mytimeout = $timeout(onTimeout, 1000);
        }


        function psuresualts() {
            var res = mv.result[0];
            for (var i = 0; i < 4; i++) {
                if (mv.result[i] > res) {
                    res = mv.result[i];
                }
            }
            var ar = ['A','B','C','D'];
            for (var i = 0; i < 4; i++) {
                if (mv.result[i] == res) {
                    mv.presults.push(mv.presult[i]);
                    mv.epresults.push(mv.epresult[i]);
                    ItemsModel.do(1,ar[i]).then(function(result){
                        ItemsModel.update(1,result);
                    });
                }
            }
        }

        function changetoenglish() {
            mv.lang.tr = false;
            mv.lang.en = true;
            $scope.hi = headlan();
        }
        function changetoturkish() {
            mv.lang.tr = true;
            mv.lang.en = false;
            $scope.hi = headlan();
        }

        function timeout() {
            $timeout.cancel(mytimeout);
            mv.q0 = 1;
            $scope.choice = [false, false, false, false];
            mv.result = [0, 0, 0, 0];
            mv.count = 45;
            $scope.hi = headlan();
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
                if (mv.q0 == 16) {
                    psuresualts();
                    $timeout.cancel(mv.starttimeer);
                    $timeout.cancel(mytimeout);
                }
                else {
                    $timeout.cancel(mv.starttimeer);
                    $timeout.cancel(mytimeout);
                    mv.starttimeer = $timeout(timeout, 45000);
                    mytimeout = $timeout(onTimeout, 1000);
                }
                mv.count = 45;
                mv.q0 = mv.q0 + 1;
                $scope.hi = headlan();
                $scope.choice = [false, false, false, false];
                $ionicViewSwitcher.nextDirection('forward');
                $state.go($state.current, {}, { reload: true });
            }

        }
        mv.count = 45;
        mytimeout = $timeout;
        mv.starttimeer = $timeout;
        mv.start = start;
        mv.q0 = 16;
        $scope.choice = [false, false, false, false];
        mv.result = [0, 0, 0, 0];
        mv.lang = [{ tr: true }, { en: false }];
        mv.lang.tr = true;
        mv.lang.en = false;
        $scope.hi = headlan();
        mv.changetoenglish = changetoenglish;
        mv.changetoturkish = changetoturkish;
        mv.presult = [
            { src: "/img/a.png" }, { src: "/img/b.png" }, { src: "/img/c.png" }, { src: "/img/d.png" }
        ];
        mv.presults = [];
        mv.epresult = [
            { src: "/img/ae.png" }, { src: "/img/be.png" }, { src: "/img/ce.png" }, { src: "/img/de.png" }
        ];
        mv.epresults = [];

        $scope.sw1 = function (data) {
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
