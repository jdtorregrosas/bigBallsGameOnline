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
		loginButton : "#loginButton"
	};

	const playerVelocity = 5;
	let username;
	let tempSocket;

	function login(){
		if(isLoginFieldEmpty()){
			let socket = io(serverConfig.url + ":" + serverConfig.port);
			tempSocket = socket;
			socket.on('response', function(response){
			    createAllPlayers(response);
			});
			let randomX = Math.floor(Math.random() * $(window).width()) + 1;  
			let randomY = Math.floor(Math.random() * $(window).height()) + 1;  
			socket.emit('login', {
				username,
				posX : randomX,
				posY : randomY
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
			$(viewConfig.loginContainer).remove();
			$(viewConfig.gameContainer).slideDown();
		}, 1500);
	}
	function createAllPlayers(players){
		$(viewConfig.gameContainer).empty();
		for (var i = 0; i < players.length; i++) {
	    	createPlayer(players[i].username, players[i].posX, players[i].posY);
	    }
	}
	function createPlayer(username, posX, posY){
		$(viewConfig.gameContainer).append(createPlayerView(username, posX, posY));
	}
	function createPlayerView(username, posX, posY){
		let randomHexaColor = '#'+Math.floor(Math.random()*16777215).toString(16);
		let html = "<div id='player_"+ username +"' class='player' style='left: "+ posX +"px; top: "+ posY +"px;'>";
			html += "<i class='large material-icons' style='color: "+ randomHexaColor +"'>perm_identity</i>";
			html += "<span>"+ username +"</span>";
			html += "</div>";
		return html;
	}	
	/*
		Event listeners
	*/
	$(viewConfig.loginButton).on('click', (function(){
		username = $(viewConfig.usernameField).val();
		login();
	}));

	$('body').on('keydown', function(ev){
        if(ev.keyCode === 39) {
            $("#player_"+username).css("left", parseInt($("#player_"+username).css("left").replace("px", "")) + playerVelocity);
        }
        if(ev.keyCode === 37) {
            $("#player_"+username).css("left", parseInt($("#player_"+username).css("left").replace("px", "")) - playerVelocity);
        }
        if(ev.keyCode === 38) {
            $("#player_"+username).css("top", parseInt($("#player_"+username).css("top").replace("px", "")) - playerVelocity);
        }
        if(ev.keyCode === 40) {
            $("#player_"+username).css("top", parseInt($("#player_"+username).css("top").replace("px", "")) + playerVelocity);
        }
        tempSocket.emit('updatePosition', {
			username,
			posX : parseInt($("#player_"+username).css("left").replace("px", "")),
			posY :  parseInt($("#player_"+username).css("top").replace("px", ""))
		});
    });
})();