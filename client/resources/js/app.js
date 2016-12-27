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
		messageInput : "#message",
		gameContainerBoard : "#gameContainer .gameBoard",
		logoutButton : "#logoutButton",
		userBoard : '#userTag'
	};

	const playerVelocity = 5;
	const sessionKey = "onlinesessionkey";
	let username;
	let socket;
	let isLogged = false;

	validateSession();

	function validateSession(){
		if(localStorage.getItem(sessionKey)){
			username = localStorage.getItem(sessionKey);
			setServerConnection();
			socket.emit('login', {
				username,
				posX : null,
				posY : null,
				isLogged : true
			});
			setGameBoard();
		}
	}

	function setGameBoard(){
		showGame();
		turnOnKeyboard();
	}
	function setServerConnection(){
		socket = io(serverConfig.url + ":" + serverConfig.port);
		socket.on('response', function(response){
		    createAllPlayers(response);
		});
		socket.on('messageResponse', function(response){
		    Materialize.toast('<span style="color: '+ response.color +'">' + response.username + " : </span> " + response.message, 5000, 'rounded');
		});
	}
	function login(){
		if(isLoginFieldEmpty()){
			setServerConnection();
			let randomX = Math.floor(Math.random() * $(window).width()) + 1;  
			let randomY = Math.floor(Math.random() * $(window).height()) + 1;  
			socket.emit('login', {
				username,
				posX : randomX,
				posY : randomY
			});
			setGameBoard();
			localStorage.setItem(sessionKey, username);
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
			$(viewConfig.userBoard).empty().append(username);
		}, 1500);
	}
	function createAllPlayers(players){
		$(viewConfig.gameContainerBoard).empty();
		for (var i = 0; i < players.length; i++) {
	    	createPlayer(players[i]);
	    }
	}
	function createPlayer(player){
		$(viewConfig.gameContainerBoard).append(createPlayerView(player));
	}
	function createPlayerView(player){
		let html = "<div id='player_"+ player.username +"' class='player' style='left: "+ player.posX +"px; top: "+ player.posY +"px;'>";
			html += "<i class='large material-icons' style='color: "+ player.color +"'>perm_identity</i>";
			html += "<span>"+ player.username +"</span>";
			html += "</div>";
		return html;
	}	

	function sendMessage(){
		if($(viewConfig.messageInput).val().length > 0){
			socket.emit('sendMessage', {
				username,
				message : $(viewConfig.messageInput).val()
			});
			$(viewConfig.messageInput).val("");
		}
		else{
			$(viewConfig.messageInput).addClass('inputError');
			setTimeout(function(){
				$(viewConfig.messageInput).removeClass('inputError');
			}, 2000);
		}
	}
	function logout(){
		var response = confirm("Logout?");
		if(response){
			socket.emit('logout', username);
			localStorage.clear();
			$(viewConfig.loginContainer).slideDown();
			$(viewConfig.gameContainer).slideUp();
		}
	}
	/*
		Event listeners
	*/
	$(viewConfig.loginButton).on('click', (function(){
		username = $(viewConfig.usernameField).val().toLowerCase();
		login();
	}));
	$(viewConfig.sendMessageButton).on('click', (function(){
		 sendMessage();
	}));
	$(viewConfig.logoutButton).on('click', (function(){
		 logout();
	}));
	function updatePlayerPosition(){
		socket.emit('updatePosition', {
			username,
			posX : parseInt($("#player_"+username).css("left").replace("px", "")),
			posY :  parseInt($("#player_"+username).css("top").replace("px", ""))
		});
	}

	// Key board handler
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
	        if(ev.keyCode === 13) {
	            sendMessage();
	        }
	    });
	}
})();