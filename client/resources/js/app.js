(function(){
	'use strict';

	const serverConfig = {
		url : "http://192.168.1.87",
		port : "3000"
	};

	const viewConfig = {
		usernameField : "#username",
		gameContainer : "#gameContainer",
		loginContainer : "#loginContainer",
		loginButton : "#loginButton",
		sendMessageButton : "#sendMessageButton",
		messageInput : "#message"
	};

	const playerVelocity = 5;
	const sessionKey = "onlinesessionkey";
	let username;
	let tempSocket;
	let isLogged = false;

	validateSession();

	function validateSession(){
		if(localStorage.getItem(sessionKey)){
			username = localStorage.getItem(sessionKey);
			let socket = io(serverConfig.url + ":" + serverConfig.port);
			tempSocket = socket;
			socket.emit('login', {
				username,
				posX : null,
				posY : null,
				isLogged : true
			});
			setServerEvents();
			showGame();
			turnOnKeyboard();
		}
	}


	function login(){
		if(isLoginFieldEmpty()){
			let socket = io(serverConfig.url + ":" + serverConfig.port);
			tempSocket = socket;
			setServerEvents();
			let randomX = Math.floor(Math.random() * $(window).width()) + 1;  
			let randomY = Math.floor(Math.random() * $(window).height()) + 1;  
			socket.emit('login', {
				username,
				posX : randomX,
				posY : randomY
			});
			showGame();
			turnOnKeyboard();
			localStorage.setItem(sessionKey, username);
		}else{
			Materialize.toast('Wrong credentials.', 3000, 'rounded');
		}
	}
	function setServerEvents(){
		tempSocket.on('response', function(response){
		    createAllPlayers(response);
		});
		tempSocket.on('messageResponse', function(response){
		    Materialize.toast(response.username + ": " + response.message, 5000, 'rounded');
		});
	}
	function isLoginFieldEmpty(){
		return username.length > 0;
	}
	function showGame(){
		//Animation purpose only
		$(viewConfig.loginContainer).slideUp();
		setTimeout(function(){
			$(viewConfig.loginContainer).remove();
			$(viewConfig.gameContainer).slideDown();
		}, 1500);
	}
	function createAllPlayers(players){
		$(viewConfig.gameContainer).empty();
		for (var i = 0; i < players.length; i++) {
	    	createPlayer(players[i]);
	    }
	}
	function createPlayer(player){
		$(viewConfig.gameContainer).append(createPlayerView(player));
	}
	function createPlayerView(player){
		let html = "<div id='player_"+ player.username +"' class='player' style='left: "+ player.posX +"px; top: "+ player.posY +"px;'>";
			html += "<i class='large material-icons' style='color: "+ player.color +"'>perm_identity</i>";
			html += "<span>"+ player.username +"</span>";
			html += "</div>";
		return html;
	}	

	function sendMessage(){
		tempSocket.emit('sendMessage', {
			username,
			message : $(viewConfig.messageInput).val()
		});
		$(viewConfig.messageInput).val("");
	}
	/*
		Event listeners
	*/
	$(viewConfig.loginButton).on('click', (function(){
		username = $(viewConfig.usernameField).val();
		login();
	}));
	$(viewConfig.sendMessageButton).on('click', (function(){
		 sendMessage();
	}));
	function updatePlayerPosition(){
		tempSocket.emit('updatePosition', {
			username,
			posX : parseInt($("#player_"+username).css("left").replace("px", "")),
			posY :  parseInt($("#player_"+username).css("top").replace("px", ""))
		});
	}
	function turnOnKeyboard(){
		$('body').on('keydown', function(ev){
	        if(ev.keyCode === 39) {
	            $("#player_"+username).css("left", parseInt($("#player_"+username).css("left").replace("px", "")) + playerVelocity);
	        	updatePlayerPosition();
	        }
	        if(ev.keyCode === 37) {
	            $("#player_"+username).css("left", parseInt($("#player_"+username).css("left").replace("px", "")) - playerVelocity);
	        	updatePlayerPosition();
	        }
	        if(ev.keyCode === 38) {
	            $("#player_"+username).css("top", parseInt($("#player_"+username).css("top").replace("px", "")) - playerVelocity);
	        	updatePlayerPosition();
	        }
	        if(ev.keyCode === 40) {
	            $("#player_"+username).css("top", parseInt($("#player_"+username).css("top").replace("px", "")) + playerVelocity);
	        	updatePlayerPosition();
	        }
	    });
	}
})();