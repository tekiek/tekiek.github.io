let years = ["1983-1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2002", "2003", "2004", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018"];
let era1 = ["1983-1987", "1988", "1989", "1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000"];
let era2 = ["2002", "2003", "2004"];
let era3 = ["2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018"];
let timer;
let bonusQueue = [];
let trackYear;
let timeCounter;
let gameScore = 0;
let gameRound = 0;
let els = {
	'startButton': document.getElementById("startButton"),
	'nextButton': document.getElementById("nextButton"),
	'highScoreButton': document.getElementById("highScoreButton"),
	'songDetails': document.getElementById("songDetails"),
	'highScores': document.getElementById('highScores'),
	'highScoresWrapper': document.getElementById('highScoresWrapper'),
	'submitScoreWrapper': document.getElementById('submitScoreWrapper'),
	'submitScore': document.getElementById('submitScore'),
	'buttonWrapper': document.getElementById("btnYears"),
	'countdownClock': document.getElementById("countdownClock"),
	'audioPlayer': document.getElementById("audioPlayer"),
	'gameScore': document.getElementById("gameScore"),
	'gameRound': document.getElementById("gameRound"),
	'scoreName': document.getElementById("scoreName"),
	'scoreBonus': document.getElementById('scoreBonus'),
	'yearButtons': []
};

els.startButton.addEventListener('click', init);
els.nextButton.addEventListener('click', startRound);

getScores();

function init() {
	els.highScoresWrapper.classList.add('xs-hide');
	els.highScoreButton.classList.add('xs-hide');
	els.startButton.classList.add('xs-hide');
	els.audioPlayer.classList.remove('xs-hide');
	els.buttonWrapper.style.display = 'block';

	createYearBtns();
	startRound();
}

function startRound() {
	els.gameRound.innerHTML = gameRound += 1;
	els.nextButton.classList.add('xs-hide');
	els.songDetails.classList.add('xs-hide');

	resetYearButtons();
	getRandomTrack();
}

/*
 * params:
 *	- yearSelected
 *  - correctYear
 *	- timeLeft
 */
function updateScore(params) {
	let score = 10;
	let yearDiff = Math.abs(years.indexOf(params.yearSelected) - years.indexOf(params.correctYear));
	console.log('params', params);

	// How close
	score = score - (2 * yearDiff);
	console.log('score: close', score);
	updatScoreEl(score);

	// Don't add bonus's
	if (score == 0) return;

	// Exact bonus
	if (params.yearSelected == params.correctYear) {
		score = score * 1.5;
		updatScoreEl(score);
		bonusQueue.push('Exact Year Bonus!');
	}
	console.log('score: exact', score);

	// Time left bonus
	score = score * ((params.timeLeft / 100) + 1);
	updatScoreEl(score);
	bonusQueue.push('Time Bonus!');
	console.log('score: time', score);

	// Era Bonus
	if (era1.indexOf(params.yearSelected) > -1 && era1.indexOf(params.correctYear) > -1) {
		score = score + 2;
		bonusQueue.push('1.0 Bonus!');
	} 
	else if (era2.indexOf(params.yearSelected) > -1 && era2.indexOf(params.correctYear) > -1){
		score = score + 5;
		bonusQueue.push('2.0 Bonus!');
	}
	else if (era3.indexOf(params.yearSelected) > -1 && era3.indexOf(params.correctYear) > -1) {
		score = score + 2;
		bonusQueue.push('3.0 Bonus!');
	}

	bonusUi();
}

function updatScoreEl(score) {
	score = Math.max(0, score);
	gameScore += (score.toFixed(1) * 10);
	els.gameScore.innerHTML = gameScore;
}

function bonusUi() {
	if (bonusQueue.length <= 0) return;

	console.log('bonusQueue[bonusQueue.length -1]', bonusQueue[bonusQueue.length -1]);
	console.log('els.scoreBonus.classList', els.scoreBonus.classList);

	//els.scoreBonus.classList.remove('xs-hide');
	els.scoreBonus.innerHTML = "";
	var poop = $("<div>" + bonusQueue[bonusQueue.length -1] + "</div>");
	$(els.scoreBonus).append(poop);

	//els.scoreBonus.innerHTML = $("<span>" + bonusQueue[bonusQueue.length -1];
	$(poop).addClass('fadeOutUp animated');
	
	
	setTimeout(function() {
		//els.scoreBonus.classList.add('xs-hide');
		// els.scoreBonus.classList.remove('animated', 'bounce');
		bonusQueue.pop();
		bonusUi();
	}, 1000)
}

function createYearBtns() {
	years.forEach(function(year) {
		let yearBtn = $("<button data-year=" + year + " class='yearBtn button xs-mr05 xs-mb05 xs-text-3'>" + year + "</button>");
		$(els.buttonWrapper).append(yearBtn);
		$(yearBtn).click({ 'el': yearBtn }, yearSelected);
		els.yearButtons.push(yearBtn);
	});
}

function resetYearButtons() {
	els.yearButtons.forEach(function(btn) {
		btn[0].classList.remove('button--disabled');
		btn[0].classList.remove('button--negative');
	})
}

function yearSelected(r) {
	let selectedBtn = r.data.el[0];
	let selectedYear = selectedBtn.dataset.year;
	let correctYearBtn = document.querySelectorAll("[data-year='" + trackYear + "']")[0];

	console.log('selectedYear', selectedYear);
	console.log('trackYear', trackYear);
	console.log('correctYearBtn', correctYearBtn);

	selectedBtn.classList.add('button--disabled');
	correctYearBtn.classList.add('button--negative');

	endRound();
	updateScore({
		'yearSelected': selectedYear,
		'correctYear': trackYear,
		'timeLeft': timeCounter
	});
}

function endRound() {
	els.audioPlayer.pause();
	els.songDetails.classList.remove('xs-hide');
	clearInterval(timer);

	if (gameRound < 3) {
		els.nextButton.classList.remove('xs-hide');
	}
	else {
		setTimeout(function() {
			sendScore();
			getScores();
		}, 2500)
	}
	
}

function getRandomTrack() {
	$.ajax("https://phish.in/api/v1/random-show").done(function(r) {
		let tracks = r.data.tracks;
		let rndTrack = tracks[Math.floor(Math.random() * tracks.length)];
		let trackSrc = rndTrack.mp3;
		
		trackYear = r.data.date.split('-')[0];
		if (trackYear <= 1987) trackYear = "1983-1987";

		console.log('r.data', r.data);
		console.log('date', trackYear);
		
		console.log('rndTrack', rndTrack);
		console.log('mp3Src', trackSrc);
		
		els.songDetails.innerHTML = rndTrack.title + " | " + r.data.date;

		playTrack(trackSrc);
  });
}

function playTrack(trackSrc) {
	els.audioPlayer.src = trackSrc;
	els.audioPlayer.currentTime = 10;
	els.audioPlayer.onplay = function() {
		els.audioPlayer.style.display = "none";
		els.audioPlayer.classList.add('xs-hide');
		countdown();
	}
	els.audioPlayer.play();
}

function timeRanOut() {
	endRound();

	updateScore({
		'yearSelected': '',
		'correctYear': trackYear,
		'timeLeft': 0
	});
}

function countdown() {
	timeCounter = 60;

	els.countdownClock.innerHTML = timeCounter;
	timer = setInterval(function() {
    els.countdownClock.innerHTML = timeCounter--;
    if (timeCounter == -1) timeRanOut();
	}, 1000);
}

/*********** SCORE STUFF ******************/

els.highScoreButton.addEventListener('click', getScores);
els.submitScore.addEventListener('click', sendScore);

function getScores() {
	els.highScoresWrapper.classList.remove('xs-hide');
	els.highScoreButton.classList.add('xs-hide');
	els.highScores.innerHTML = '';


	$.ajax("https://dreamlo.com/lb/5b61e48e191a8b0bcc77d341/json/10").done(function(r) {
		console.log('r.dreamlo.leaderboard', r.dreamlo.leaderboard);
		let highScores = r.dreamlo.leaderboard != null ? r.dreamlo.leaderboard.entry : [];
		console.log('r', r);
		console.log('highScores', highScores);

		highScores.forEach(function(hs) {
			console.log('hs', hs);
			let hsName = $("<div class='col xs-col-4 xs-p05'>" + hs.name + "</div>");
			let hsScore = $("<div class='col xs-col-4 xs-p05'>" + hs.score + "</div>");
			let hsDate = $("<div class='col xs-col-4 xs-p05'>" + hs.date.split(' ')[0]+ "</div>");

			$(els.highScores).append(hsName).append(hsScore).append(hsDate);
		});

		// Show Add your score
		if (highScores.length < 10 && gameScore > 0) {
			els.submitScoreWrapper.classList.remove('xs-hide');
		}
		//els.submitScoreWrapper.classList.remove('xs-hide');
		//if (gameScore >= hs) els.submitScoreWrapper.classList.remove('xs-hide');
	});
}

function sendScore() {
	let scoreRequest = document.createElement('img');
	
	// Add error UI
	if (els.scoreName.value.length < 2) {
		els.scoreName.parentElement.classList.add('form-fieldset--error');
		return;
	}
	else {
		els.scoreName.parentElement.classList.remove('form-fieldset--error');
	}
	
	scoreRequest.src = "https://dreamlo.com/lb/9DaAZX-cWECSuqpyTwN6Jw-gV6rPE3tkWpYMzWjfwErA/add/" + els.scoreName.value + "/" + gameScore;
	setTimeout(function() {
		// els.submitScoreWrapper.classList.remove('xs-hide');
		// getScores();
		location.reload();
	}, 500)
}

