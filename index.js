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
		return localStorage.sessionId || '';
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
							if ((res.status && res.status === 'ok') && xhr.status === 200) {
								sessionId.set(xhr.getResponseHeader('atmosphere-session-id'));
							}
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


(function login(id, password) {
	http.post(
		make_path('auth/login'),
		util.format('{"user_id": "%s", "password": "%s"}', id, password)
	);
})('bob', 'bob');

(function timeline(apiPath, count) {
	$('#timeline').on('click', function() {
		http.get(
			make_path(apiPath),
			util.format('&count=%d', count)
		)
		.done(function(res) {
			//console.log(JSON.parse(res));
		});
	});
})('messages/search', 50);

(function bind_search() {
	$('#search').on('click', function() {
		http.get(
			make_path('/messages/search'),
			util.format('&keywords=%s', $('#search-text').val())
		)
		.done(function(res) {
			console.log(JSON.parse(res));
		});
	});
})();

(function bind_send() {
	// TODO error
	$('#send').on('click', function() {
		http.post(
			make_path('/messages/send'),
			util.format('{"message": "%s", "reply_to": ""}:', $('#send-text').val())
		)
		.done(function(res) {
			console.log(JSON.parse(res));
		});
	});
})();
