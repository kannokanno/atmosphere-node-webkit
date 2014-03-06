'use strict';

var path = require('path');
var util = require('util');
var localStorage = localStorage || {};

function make_path(added) {
	return path.join('http://localhost:9999/', added);
}

var sessionId = {
	set: function(id) {
		localStorage.sessionId = id;
	},

	get: function() {
		return localStorage.sessionId || $.cookie('atmosphere-session-id') || '';
	}
};

var http = {
	request: function(apiPath, method, data) {
		return $.ajax({
							url: apiPath,
							type: method,
							dataType: 'text',
							data: data,
							headers: {
								'atmosphere-session-id': sessionId.get()
							},
							cache: false
						})
						.done(function(res, _, xhr) {
							sessionId.set(xhr.getResponseHeader('atmosphere-session-id'));
						})
						.fail(function(_, __, error) {
							console.log(error);
						});
	},

	get: function(apiPath, data) {
		return this.request(apiPath, 'GET', data);
	},

	post: function(apiPath, data) {
		return this.request(apiPath, 'POST', data);
	}
};


(function bind_login() {
	$('#login').on('click', function() {
		http.post(
			make_path('auth/login'),
			util.format('{"user_id": "%s", "password": "%s"}', $('#login-id').val(), $('#login-password').val())
		)
		.done(function(res) {
			if (JSON.parse(res).session_id) {
				$('#entrance').css('display', 'none');
				$('#content').show();
			}
		});
	});
})();

(function bind_search() {
	$('#search').on('click', function() {
		http.get(
			make_path('/messages/search'),
			util.format('keywords=%s', $('#search-text').val())
		)
		.done(function(res) {
			console.log(JSON.parse(res));
		});
	});
})();

(function bind_send() {
	$('#send').on('click', function() {
		http.post(
			make_path('/messages/send'),
			util.format('{"message": "%s", "reply_to": ""}', $('#send-text').val())
		)
		.done(function(res) {
			console.log(JSON.parse(res));
		});
	});
})();

function timelineController($scope) {
	// TODO タイミング
	http.post(make_path('auth/login'), '{"user_id": "bob", "password": "bob"}')
	.done(function() {
		http.get(make_path('messages/search'), util.format('count=%d', 50))
		.done(function(res) {
			$scope.$apply(function(){
				$scope.messages = JSON.parse(res).results;
			});
		});
	});

	$scope.avatarUrl = function(message) {
		return make_path('user/avator') + util.format('?user_id=%s', message.created_by);
	};
}
