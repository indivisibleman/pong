var width = 600;
var height = 400;

var FPS = 60;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var background;

var gradient;

var pOneY;
var pTwoY;

var pOneUp;
var pOneDown;
var pTwoUp;
var pTwoDown;

var score1;
var score2;

var ballX;
var ballY;

var ballVelX;
var ballVelY;

var beep;
var score;

var cpu;
var cpuSpeed;

var state;

var START = 0;
var PLAY = 1;
var PAUSE = 2;
var GAMEOVER = 3;

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback, element){
			window.setTimeout(callback, 1000 / FPS);
		};
})();

KeyDown = function(e) {
	if(state == START) {
		state = PLAY;
		ResetBall();
		score1 = 0;
		score2 = 0;
	} else if(state == PLAY) {
		switch(e.keyCode) {
		case 87:
			pOneUp = true;
			break;
		case 83:
			pOneDown = true;
			break;
		case 73:
			pTwoUp = true;
			break;
		case 75:
			pTwoDown = true;
			break;
		case 80:
			state = PAUSE;
			break;
		}
	} else if(state == PAUSE) {
		state = PLAY;
	} else if(state == GAMEOVER) {
		state = START;
	}
}

KeyUp = function(e) {
	switch(e.keyCode) {
	case 87:
		pOneUp = false;
		break;
	case 83:
		pOneDown = false;
		break;
	case 73:
		pTwoUp = false;
		break;
	case 75:
		pTwoDown = false;
		break;
	}
}

window.addEventListener('keydown', KeyDown, true);
window.addEventListener('keyup', KeyUp, true);

ResetBall = function() {
	ballX = 350 / 2 + 61;
	ballY = 270 / 2 + 51;
	
	var angle = Math.PI / 4;
	
	angle += Math.random() * Math.PI / 2;
	
	ballVelX = 1.5 * Math.sin(angle);
	ballVelY = 1.5 * Math.cos(angle);
	
	if(Math.random() > 0.5) {
		ballVelX *= -1;
	}
}

Initialise = function() {
	// Load background
	background = assetManager.getAsset('./background.jpg');
	
	beep = new Audio('./beep.mp3');
	score = new Audio('./score.wav');
	
	// Gradient so text has a shadow in chrome...
	gradient = ctx.createLinearGradient(0, 0, 0, 1);
	gradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
	gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
	
	pOneY = 166;
	pTwoY = 166;
	
	pOneUp = false;
	pOneDown = false;
	pTwoUp = false;
	pTwoDown = false;
	
	score1 = 0;
	score2 = 0;
	
	ctx.font = 'bold 24px "Courier New", "Courier", monospace';
	ctx.textBaseline = 'top';
	
	cpu = true;
	cpuSpeed = 1;
	
	ResetBall();
	
	state = START;
	
	GameLoop();
}

GameLoop = function() {
	// Update
	
	// Paddles
	if(state == PLAY) {
		if(pOneUp && !pOneDown) {
			pOneY -= 4;
		} else if(pOneDown && !pOneUp) {
			pOneY += 4;
		}
		
		if(pOneY < 60) {
			pOneY = 60;
		} else if(pOneY > 272) {
			pOneY = 272;
		}
		
		if(cpu) {
			if(ballY + 4 < pTwoY + 24) {
				if((pTwoY + 24) - (ballY + 4) < cpuSpeed) {
					pTwoY -= (pTwoY + 24) - (ballY + 4);
				} else {
					pTwoY -= cpuSpeed;
				}
			} else if(ballY + 4 > pTwoY + 24) {
				if((ballY + 4) - (pTwoY + 24) < cpuSpeed) {
					pTwoY += (ballY + 4) - (pTwoY + 24);
				} else {
					pTwoY += cpuSpeed;
				}
			}
		} else {
			if(pTwoUp && !pTwoDown) {
				pTwoY -= 4;
			} else if(pTwoDown && !pTwoUp) {
				pTwoY += 4;
			}
		}
		
		if(pTwoY < 60) {
			pTwoY = 60;
		} else if(pTwoY > 272) {
			pTwoY = 272;
		}
		
		// Ball
		ballX += ballVelX;
		ballY += ballVelY;
		
		if(ballY < 60) {
			ballY = 60 + (ballY - 60);
			ballVelY *= -1;
			
			beep.play();
		} else if(ballY > 312) {
			ballY = 312 - (ballY - 312);
			ballVelY *= -1;
			
			beep.play();
		}
		
		// Ball and paddles
		if(ballX > 62 && ballX < 78 && ballY > pOneY - 8 && ballY < pOneY + 48) {
			ballX = 78 + (ballX - 70);
			ballVelX *= -1.05;
			if(ballY < pOneY + 20) {
				ballVelY -= 0.2;
			} else if(ballY > pOneY + 36) {
				ballVelY += 0.2;
			}
			ballVelY *= 1.05;
			
			beep.play();
		} else if(ballX > 394 && ballX < 410 && ballY > pTwoY - 8 && ballY < pTwoY + 48) {
			ballX = 394 - ((8 + ballX) - 402);
			ballVelX *= -1.05;
			if(ballY < pTwoY + 20) {
				ballVelY -= 0.2;
			} else if(ballY > pTwoY + 36) {
				ballVelY += 0.2;
			}
			ballVelY *= 1.05;
			
			beep.play();
		}
	}
	
	if((score1 > 9 || score2 > 9) && state == PLAY) {
		state = GAMEOVER;
	}
	
	// Ball past paddles
	if(ballX < 57) {
		score2++;
		
		score.play();
		
		ResetBall();
	} else if(ballX > 415) {
		score1++;
		
		score.play();
		
		ResetBall();
	}
	
	// Rendering
	ctx.shadowBlur = 0;
	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.drawImage(background, 0, 0);
	
	// Game area - Debug use
	//ctx.fillRect(65, 55, 350, 270);
	
	// Game elements
	
	// Shadow, green
	ctx.shadowBlur = 6;
	ctx.shadowColor = 'rgba(50, 255, 50, 1)';
	
	// Whiter central parts
	ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	
	// Paddles, ball and central divider
	if(state == PLAY) {
		ctx.fillRect(70, pOneY, 8, 48);
		ctx.fillRect(402, pTwoY, 8, 48);
		
		ctx.fillRect(ballX, ballY, 8, 8);
		
		for(var i = 0; i < 9; i++) {
			ctx.fillRect(239, i * 30 + 60, 2, 20);
		}
	}
	
	// Horizontal divider
	if(state != PLAY) {
		for(var i = 0; i < 11; i++) {
			ctx.fillRect(i * 30 + 80, 86, 20, 2);
		}
	}
	
	// Scores
	ctx.fillStyle = gradient;
	ctx.textAlign = "center";
	
	if(state == PLAY || state == PAUSE) {
		ctx.fillText(score1, 350 / 4 + 65, 55);
		ctx.fillText(score2, 350 / 4 * 3 + 65, 55);
	}
	
	if(state == START) {
		ctx.fillText("Pong", 350 / 2 + 65, 55);
		
		ctx.fillText("Move your paddle with", 350 / 2 + 65, 95);
		ctx.fillText("the 'W' and 'S' keys.", 350 / 2 + 65, 125);
		ctx.fillText("The first player to ten", 350 / 2 + 65, 155);
		ctx.fillText("points wins.", 350 / 2 + 65, 185);
		ctx.fillText("'P' key to pause.", 350 / 2 + 65, 245);
		ctx.fillText("Press any key to continue.", 350 / 2 + 65, 275);
	}
	
	if(state == GAMEOVER) {
		ctx.fillText("Game Over", 350 / 2 + 65, 55);
		
		if(score1 > score2) {
			ctx.fillText("Player One wins!", 350 / 2 + 65, 125);
		} else {
			ctx.fillText("Player Two wins!", 350 / 2 + 65, 125);
		}
		
		ctx.fillText(score1 + " - " + score2, 350 / 2 + 65, 155);
		
		ctx.fillText("Press any key to continue.", 350 / 2 + 65, 215);
	}
	
	if(state == PAUSE) {
		ctx.fillText("Paused", 350 / 2 + 65, 55);
		
		ctx.fillText("Press any key to continue.", 350 / 2 + 65, 185);
	}
	
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 95);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 125);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 155);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 185);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 215);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 245);
	//ctx.fillText("Fillllllllllllllllllller.", 350 / 2 + 65, 275);
	// Max line length: 25 char at 24pt monospace
	
	// Code so game loops
	requestAnimFrame(GameLoop, canvas);
}

var assetManager = new AssetManager();

assetManager.queueImage('./background.jpg');

assetManager.downloadAll(function() {
	Initialise();
});