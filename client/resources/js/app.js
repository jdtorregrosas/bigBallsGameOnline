
	'use strict';

	const serverConfig = {
		url : "http://192.168.1.87",
		port : "3000"
	};

	const viewConfig = {
		usernameField : "#username",
		gameContainer : "#gameContainer",
		loginContainer : "#loginContainer",
		loginButton : "#loginButton"
	};

	let username;

	function login(){
		if(isLoginFieldEmpty()){
			let socket = io(serverConfig.url + ":" + serverConfig.port);
			socket.on('response', function(response){
				debugger;
			    for (var i = 0; i < response.length; i++) {
			    	setUpPlayer(response[i].username, response[i].posX, response[i].posY);
			    }
			});
			let x = Math.floor(Math.random() * 800) + 1;  
			let y = Math.floor(Math.random() * 800) + 1;  
			socket.emit('login', {
				username,
				posX : x,
				posY : y
			});
			showGame();
		}else{
			Materialize.toast('Wrong credentials.', 3000, 'rounded');
		}
	}
	function isLoginFieldEmpty(){
		return username.length > 0;
	}
	function showGame(){
		//Animation purpose only
		$(viewConfig.loginContainer).slideUp();
		setTimeout(function(){
			$(viewConfig.gameContainer).slideDown();
		}, 1500);
	}

	function setUpPlayer(name, x,y){
		$(viewConfig.gameContainer).append("<div id='' class='player' style='left: "+ x +"px; top: "+ y +"px;'><span>"+ name +"</span><div>");
	}
	/*
		Event listeners
	*/
	$(viewConfig.loginButton).on('click', (function(){
		username = $(viewConfig.usernameField).val();
		login();
	}));
