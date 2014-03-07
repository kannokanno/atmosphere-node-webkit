'use strict';

var path = require('path');
var util = require('util');
var localStorage = localStorage || {};

var sessionId = {
  set: function (id) {
    localStorage.sessionId = id;
  },

  get: function () {
    return localStorage.sessionId || $.cookie('atmosphere-session-id') || '';
  }
};

function make_path(added) {
  return path.join('https://atmos.interprism.co.jp/atmos/', added);
}

var http = {
  request: function (apiPath, method, data) {
    return $.ajax({
             url: make_path(apiPath),
             type: method,
             dataType: 'text',
             data: data,
             headers: {
               'atmosphere-session-id': sessionId.get()
             },
             cache: false
           })
           .done(function (res, _, xhr) {
             sessionId.set(xhr.getResponseHeader('atmosphere-session-id'));
           })
           .fail(function (_, __, error) {
             console.log(error);
           });
  },

  get: function (apiPath, data) {
    return this.request(apiPath, 'GET', data);
  },

  post: function (apiPath, data) {
    return this.request(apiPath, 'POST', data);
  }
};

function applyTimeline($promise) {
  $promise
    .done(function (res) {
      var $scope = angular.element(('#timeline-controller')).scope();
      $scope.$apply(function () {
        $scope.messages = JSON.parse(res).results;
      });
    });
}

function LoginController($scope) {
  $scope.login = function () {
    http.post('auth/login', util.format('{"user_id": "%s", "password": "%s"}', $scope.id, $scope.password))
        .done(function (res) {
          if (JSON.parse(res).session_id) {
            $('#entrance').css('display', 'none');
            $('#content').show();
            applyTimeline(http.get('messages/search', util.format('count=%d', 50)));
          }
        });
  }
}

function SendController($scope) {
  $scope.send = function () {
    http.post('messages/send', util.format('{"message": "%s", "reply_to": ""}', $scope.message))
        .done(function () {
          applyTimeline(http.get('messages/search', util.format('count=%d', 50)));
        });
  };
}
function TimelineController($scope) {
  $scope.avatarUrl = function (message) {
    return make_path('user/avator') + util.format('?user_id=%s', message.created_by);
  };
}

function SearchController($scope) {
  $scope.search = function () {
    applyTimeline(http.get('messages/search', util.format('keywords=%s', $scope.keyword)));
  }
}
