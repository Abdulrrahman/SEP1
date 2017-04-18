angular.module('SimpleRESTIonic.services', [])

    .service('APIInterceptor', function ($rootScope, $q) {
        var service = this;

        service.responseError = function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return $q.reject(response);
        };
    })

    .service('ItemsModel', function ($http, Backand) {
        var service = this,
            baseUrl = '/1/objects/',
            objectName = 'Statistics/';

        function getUrl() {
            return Backand.getApiUrl() + baseUrl + objectName;
        }

        function getUrlForId(id) {
            return getUrl() + id;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (id) {
            return $http.get(getUrlForId(id));
        };

        service.create = function (object) {
            return $http.post(getUrl(), object);
        };

        service.update = function (id, object) {
            return $http.put(getUrlForId(id), object);
        };

        service.delete = function (id) {
            return $http.delete(getUrlForId(id));
        };
        service.do = function (id, object) {
            return $http.get(getUrlForId(id)).then(function (results) {
                if (object == 'A') {
                    results.data.A++;
                    return{'A':results.data.A};
                }
                else if (object == 'B') {
                    results.data.B++;
                    return{'B':results.data.B};
                }
                else if (object == 'C') {
                    results.data.C++;
                    return{'C':results.data.C};
                }
                else if (object == 'D') {
                    results.data.D++;
                    return{'D':results.data.D};
                }                 
            });
        }
    })

    .service('LoginService', function (Backand) {
        var service = this;

        service.signin = function (email, password, appName) {
            //call Backand for sign in
            return Backand.signin(email, password);
        };

        service.anonymousLogin = function () {
            // don't have to do anything here,
            // because we set app token att app.js
        }

        service.signout = function () {
            return Backand.signout();
        };
    });
