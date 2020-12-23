var suit = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10 ,10 ,10, 11];
var deck = suit.concat(suit, suit, suit);
var sixDeck = deck.concat(deck, deck, deck, deck, deck);
var deckUsage = .75;
var winLossTotal = 0;
var win = [0,0,0,0,0,0,0,0,0];
var attempt = [0,0,0,0,0,0,0,0,0];
var monitored = false;
var illustrious = [];
for (var i = 0; i<19; i++)
	illustrious.push(true);

// counters for illustrious results
var insuranceApplied = 0;
var insuranceWon = 0;
var insuranceLost = 0;
var gotHere = 0;
var splitTenVsFiveApplied = 0;
var splitTenVsSixApplied = 0;

var nonIllustriousWinnings = [48.867, 49.089, 49.39, 49.7, 49.954, 50.161, 50.496, 50.705, 51.061];
// need to implement https://wizardofodds.com/games/blackjack/card-counting/high-low/

// Fisher-Yates (aka Knuth) Shuffle from Stack Overflow
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


var count = 0;
var trueCount = 0;
var hands = 0;
var walks = 0;
var shuffledShoot = shuffle(sixDeck);
var betSize = 0;

// *** Driver *** //
while (hands < 1000000000){
	suit = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10 ,10 ,10, 11];
	deck = suit.concat(suit, suit, suit);
	sixDeck = deck.concat(deck, deck, deck, deck, deck);
	shuffledShoot = shuffle(sixDeck);
	//console.log("New Shoot\n\n");
	while (shuffledShoot.length > (6*52)*(1-deckUsage)) {
		monitored = false;
		var decksLeft = Math.round(shuffledShoot.length / 52);
		if (monitored)
			console.log(`Decks left: ${decksLeft}`);
		if (decksLeft<1) decksLeft = 1;
		trueCount = count / decksLeft;
		if (trueCount < -1){
			//console.log("Walk");
			walks = walks + 1;
			count = 0;
			break;
		}
		betSize = determineBetSize(trueCount);
		var prevCount = count;
		userHand = [drawAndCount(), drawAndCount()];
		dealerHand = [drawAndCount(), drawAndCount()];
		var result = userAlgorithm(userHand, dealerHand);

		if (hands % 1 === 0){
			var previous = winLossTotal;
			if (monitored)
				console.log(`Hand #: ${hands} || Count: ${prevCount} || True Count: ${Math.floor(trueCount)} || Hand: ${userHand[0]} and ${userHand[1]} vs ${dealerHand[0]} and hidden ${dealerHand[1]}`);
			winLossTotal = updateBankRoll(result, betSize);
			var change = winLossTotal - previous;
			cutoffTrueCount = Math.floor(trueCount);
			if (cutoffTrueCount < -1) cutoffTrueCount = -1;
			if (cutoffTrueCount > 7) cutoffTrueCount = 7;
			if (change !== 0){
				amountOfAttempts = Math.abs(change/betSize)
				attempt[cutoffTrueCount+1] = attempt[cutoffTrueCount+1] + amountOfAttempts;
			}
			if (change > 0){
				win[cutoffTrueCount+1] = win[cutoffTrueCount+1] + change/betSize;
			}
			if (monitored)
				console.log(`Result: ${result} || Win: ${change} || PayOut: ${change/betSize}\n`);
		}
		monitored = false;
	}
	
	count = 0;
}
//console.log('Leaving shoot');
console.log('\n');
console.log(`Hands: ${hands} || Win/Hand: ${Math.round(winLossTotal/hands*1000000)/1000000} || Hands/Table: ${Math.floor(hands/(walks+1))}`);
if (winLossTotal >=0) 
	console.log(`Average Money Won Per Hour Playing $25 Minimum Tables: $${Math.round(winLossTotal/hands*84*25*100)/100}`); // || Total Won: $${winLossTotal*25}
if (winLossTotal <0) 
	console.log(`Average Money Lost Per Hour Playing $25 Minimum Tables: $${Math.round(-1*winLossTotal/hands*84*25*100)/100}`); //  || Total Lost: $${-1*winLossTotal*25}
function getSum(total, num) {
  return total + Math.round(num); 
}
function createOutcome(win, attempt, decimal){
	var multiplier = Math.pow(10, decimal)
	return Math.round((win/attempt*100 + Number.EPSILON) * multiplier) / multiplier;
}
var totalAttempts = attempt.reduce(getSum, 0);
console.log(`Percent Winning: Weighted Average: ${Math.round((50+winLossTotal/hands*100)*1000)/1000}%`);
for (var i = 0; i < attempt.length; i++){
	if (i === 0)
		console.log(`True Count < ${i}: ${createOutcome(win[i], attempt[i], 3)} || ${createOutcome(attempt[i], totalAttempts, 2)}% of hands`);
	if (i === attempt.length-1)
		console.log(`True Count > ${i-1}: ${createOutcome(win[i], attempt[i], 3)} || ${createOutcome(attempt[i], totalAttempts, 2)}% of hands`);
	if (i > 0 && i<attempt.length-1)
		console.log(`True Count ${i-1}-${i}: ${createOutcome(win[i], attempt[i], 3)} || ${createOutcome(attempt[i], totalAttempts, 2)}% of hands`);
}
for (var i = 0; i<nonIllustriousWinnings.length; i++){
	if (i === 0)
		console.log(`Improvement < ${i}: ${Math.round((createOutcome(win[i], attempt[i], 3) - nonIllustriousWinnings[i])*1000)/1000}`);
	if (i === attempt.length-1)
		console.log(`Improvement > ${i-1}: ${Math.round((createOutcome(win[i], attempt[i], 3) - nonIllustriousWinnings[i])*1000)/1000}`);
	if (i > 0 && i<attempt.length-1)
		console.log(`Improvement ${i-1}-${i}: ${Math.round((createOutcome(win[i], attempt[i], 3) - nonIllustriousWinnings[i])*1000)/1000}`);

}

// Logging attempts of illustrious 18
console.log(`Insurance Applied: ${insuranceApplied} || Insurance Won: ${insuranceWon} || Got Here: ${gotHere}`);
console.log(`Tens Split Vs Five: ${splitTenVsFiveApplied}`);
console.log(`Tens Split Vs Six: ${splitTenVsSixApplied}`);

// *** Functions *** //

function userAlgorithm(userHand, dealerHand, splitLegal=true){
	//console.log('\n');
	hands = hands + 1;
	let userCard1 = userHand[0];
	let userCard2 = userHand[1];
	let dealerCard = dealerHand[0];
	let hiddenCard = dealerHand[1];
	if (illustrious[1] && trueCount >=0){
		var insurance = checkInsurance(userHand, dealerHand);
		if (insurance !== 'No') {
			monitored = false;
			insuranceApplied = insuranceApplied + 1;
			if (insurance === 'Insurance Won'){
				insuranceWon = insuranceWon + 1;
				winLossTotal = updateBankRoll('Insurance Won', betSize);
			}
			else {
				//console.log(`Win Loss Total before: ${winLossTotal}`)
				winLossTotal = updateBankRoll('Insurance Lost', betSize);
				//console.log(`Win Loss Total after: ${winLossTotal}`)
				insuranceLost = insuranceLost + 1;
			}
		}
	}
	if (illustrious[1] && trueCount >=0){
		gotHere = gotHere + 1;
	}
	var split = false;
	var blackjack = checkBlackjack(userCard1, userCard2, dealerCard, hiddenCard);
	if (blackjack !== 'No'){
		if (monitored)
			console.log(`${blackjack}: ${userCard1} and ${userCard2} versus ${dealerCard} and ${hiddenCard}`);
		return blackjack;
	}
	if (surrender(userCard1, userCard2, dealerCard)){
		if (monitored)
			console.log(`Surrendered: ${userCard1} and ${userCard2} versus ${dealerCard}`);
		return 'Surrender';
	} 
	if (userCard1 === userCard2){
		if (splitLegal){
			var split = checkSplit(userCard1, dealerCard);
		}
		if (split){
			if (monitored)
				console.log(`Split: ${userCard1} and ${userCard2} versus ${dealerCard}`)
		}
	}
	if (split) {
		var newCard1 = drawAndCount();
		var newCard2 = drawAndCount();
		var splitHand1 = [userCard1, newCard1];
		if (monitored){
			console.log(`Split 1 Got Second Card: ${newCard1} || New Total ${userCard1 + newCard1}`)
			console.log(`Split 2 Got Second Card: ${newCard2} || New Total ${userCard2 + newCard2}`)

		}
		var splitHand2 = [userCard2, newCard2];
		var result1 = userAlgorithm(splitHand1, dealerHand, false);
		var result2 = userAlgorithm(splitHand2, dealerHand, false);
		var x = splitCalc(result1, 1)
		var y = splitCalc(result2, 1)
		if (monitored)
			console.log(`Split: Result1: ${result1} || Result2: ${result2} || Pay Out: ${x+y}`);
			
		monitored = false;
		return x + y;
	} else {
		return playHand(userHand, dealerHand);
	}
}

function playHand(userHand, dealerHand){
	let dealerCard = dealerHand[0];
	let softHand = (userHand[0] === 11 || userHand[1] === 11);
	var playerTotal = userHand[0] + userHand[1];
	let doubled = checkDouble(playerTotal, dealerCard, softHand);
	if (doubled){
		playerTotal = playerTotal + drawAndCount();
		if (playerTotal > 21 && softHand)
			playerTotal = playerTotal - 10;
		if (monitored)
			console.log(`Player Doubled || New Total ${playerTotal}`);
		let dealerTotal = dealerAction(dealerHand);
		if (monitored)
			console.log(`Player Total: ${playerTotal} || Dealer Total: ${dealerTotal}`)
		if (playerTotal === dealerTotal)
			return 'Push';
		if (playerTotal > 21)
			return 'Double Loss';
		if (dealerTotal > 21)
			return 'Double Win';
		if (playerTotal > dealerTotal)
			return 'Double Win';
		else 
			return 'Double Loss'
	} 
	playerTotal = playerAction(playerTotal, dealerCard, softHand);
	if (playerTotal > 21){
		if (monitored)
			console.log('Bust');
		return 'Dealer Win';
	}
	let dealerTotal = dealerAction(dealerHand);
	if (monitored)
		console.log(`Player Total: ${playerTotal} || Dealer Total: ${dealerTotal}`)
	if (dealerTotal > 21 || (playerTotal > dealerTotal))
		return 'Player Win';
	if (dealerTotal > playerTotal)
		return 'Dealer Win';
	return 'Push';
}

function surrender(userCard1, userCard2, dealerCard){
	// don't surrender with aces
	if (userCard1 === 11 || userCard2 === 11)
		return false;
	// don't surrender pair of eights
	if(userCard1 === 8 && userCard2 === 8)
		return dealerCard === 11;
	if (userCard1 + userCard2 === 15)
		return dealerCard === 10;
	if (userCard1 + userCard2 === 16){
		return (dealerCard === 9 || dealerCard === 10 || dealerCard === 11);
	}
	else 
		return false;
}

function checkBlackjack(userCard1, userCard2, dealerCard, hiddenCard){
	let userTotal = userCard1 + userCard2;
	let dealerTotal = dealerCard + hiddenCard;
	if (userTotal === 21 && dealerTotal === 21)
		return 'Push';
	if (userTotal === 21)
		return 'Blackjack';
	if (dealerTotal === 21)
		return 'Dealer Win';
	return 'No';
}

function checkSplit(userCard, dealerCard){
	// split Aces
	if (userCard === 11)
		return true;
	if (trueCount > 7 && userCard === 10)
		return true;
	// split 9's unless dealer shows 7, 10, or Ace
	if (userCard === 9)
		return (!(dealerCard === 7 || dealerCard === 10 || dealerCard === 11));
	// split 8's if haven't surrendered them
	if (userCard === 8)
		return true;
	// split 7's, 3's, or 2's if dealer has 7 or lower
	if (userCard === 7 || userCard == 3 || userCard === 2)
		return (dealerCard < 8)
	// split 6's if dealer has 6 or lower
	if (userCard === 6)
		return (dealerCard < 7)
	// split 4's if dealer has 5 or 6
	if (userCard === 4)
		return (dealerCard === 5 || dealerCard === 6);
	if (illustrious[4] && trueCount > 5 && userCard === 10){
		splitTenVsFiveApplied = splitTenVsFiveApplied + 1;
		return (dealerCard===5);
	}
	if (illustrious[5] && trueCount > 4 && userCard === 10){
		splitTenVsSixApplied = splitTenVsSixApplied + 1;
		return (dealerCard===6);
	}
	return false;
}


function drawAndCount(){
	var card = shuffledShoot.pop();
	if (card < 7)
		count = count + 1;
	if (card > 9)
		count = count - 1;
	return card;
}

function updateBankRoll(result, betSize){
	if (result === 'Surrender')
		return winLossTotal - .5*betSize;
	if (result === 'Dealer Win')
		return winLossTotal - betSize;
	if (result === 'Blackjack')
		return winLossTotal + 1.5*betSize;
	if (result === 'Player Win') 
		return winLossTotal + betSize;
	if (result === 'Push')
		return winLossTotal;
	if (result === 'Insurance Lost')
		return winLossTotal - .5*betSize;
	if (result === 'Insurance Won')
		return winLossTotal + betSize;
	if (result === 'Double Win')
		return winLossTotal + 2*betSize;
	if (result === 'Double Loss')
		return winLossTotal - 2*betSize;
	else 
		return winLossTotal + result*betSize;
}

function splitCalc(result, betSize){
	if (result === 'Surrender')
		return .5*betSize;
	if (result === 'Dealer Win')
		return -1*betSize;
	if (result === 'Blackjack')
		return  1.5*betSize;
	if (result === 'Player Win') 
		return betSize;
	if (result === 'Push')
		return 0;
	if (result === 'Double Win')
		return 2*betSize;
	if (result === 'Double Loss')
		return  -2*betSize;
}

function checkDouble(playerTotal, dealerCard, softHand){
	if (playerTotal === 11)
		return dealerCard !== 11;
	if (playerTotal === 10)
		return (dealerCard < 10)
	if (playerTotal === 9)
		return (dealerCard > 2 && dealerCard < 7)
	if (softHand){
		if (dealerCard === 6 || dealerCard === 5)
			return (playerTotal < 19)
		if (dealerCard === 4)
			return (playerTotal < 19 && playerTotal > 14)
		if (dealerCard === 3)
			return (playerTotal === 18 || playerTotal === 17)
	}
	return false;
}

function playerAction(playerTotal, dealerCard, softHand){
	if (softHand){
		playSoftHand(playerTotal, dealerCard)
	}
	if (dealerCard === 4 || dealerCard === 5 || dealerCard === 6){
		while (playerTotal < 12){
			let draw = drawAndCount();
			playerTotal = playerTotal + draw;
			if (monitored)
				console.log(`Player Drew: ${draw} || New Total ${playerTotal}`);
			if (draw === 11){
				if (playerTotal > 21) {
					playerTotal = playerTotal - 10;
				} else {
					playSoftHand(playerTotal, dealerCard)
				}
			}
		}
		return playerTotal;
	}
	if (dealerCard === 2 || dealerCard === 3){
		while (playerTotal < 13){
			let draw = drawAndCount();
			playerTotal = playerTotal + draw;
			if (monitored)
				console.log(`Player Drew: ${draw} || New Total ${playerTotal}`);
			if (draw === 11){
				if (playerTotal > 21) {
					playerTotal = playerTotal - 10;
				} else {
					playSoftHand(playerTotal, dealerCard)
				}
			}
		}
		return playerTotal;
	}
	else {
		while (playerTotal < 17){
			let draw = drawAndCount();
			playerTotal = playerTotal + draw;
			if (monitored)
				console.log(`Player Drew: ${draw} || New Total ${playerTotal}`);
			if (draw === 11){
				if (playerTotal > 21) {
					playerTotal = playerTotal - 10;
				} else {
					playSoftHand(playerTotal, dealerCard)
				}
			}
		}
		return playerTotal;
	}


}

function playSoftHand(playerTotal, dealerCard){
	var softCards = 1;
	if (playerTotal > 18)
		return playerTotal;
	if (playerTotal < 18){
		while(playerTotal < 18 && softCards > 1){
			var draw = drawAndCount();
			playerTotal = playerTotal + draw;
			if (monitored)
				console.log(`Player Drew: ${draw} || New Total ${playerTotal}`);
			if (draw === 11)
				softCards = softCards + 1;
			if (playerTotal > 21 && softCards > 0){
				playerTotal = playerTotal - 10;
				softCards = softCards - 1;
			}
			if (softCards === 0)
				return playerAction(playerTotal, dealerCard, false);
		}
		return playerTotal;
	} 
	if (playerTotal === 18 && dealerCard < 9)
		return playerTotal;
	else {
		while(playerTotal < 19 && softCards > 0){
			var draw = drawAndCount();
			playerTotal = playerTotal + draw;
			if (monitored)
				console.log(`Player Drew: ${draw} || New Total ${playerTotal}`);
			if (draw === 11)
				softCards = softCards + 1;
			if (playerTotal > 21 && softCards > 0){
				playerTotal = playerTotal - 10;
				softCards = softCards - 1;
			}
			if (softCards === 0)
				return playerAction(playerTotal, dealerCard, false);
		}
	return playerTotal;
	}
}

function dealerAction(dealerHand){
	var softCards = 0;
	if (dealerHand[0] === 11){
		softCards = softCards + 1;
	}
	if (dealerHand[1] === 11){
		softCards = softCards + 1;
	}
	var dealerTotal = dealerHand[0] + dealerHand[1];
	if (softCards === 2) {
		dealerTotal = 12;
		softCards = 1;
	}	
	while(true) {
		if (softCards > 0){
			if (dealerTotal < 17){
				var draw = drawAndCount();
				dealerTotal = dealerTotal + draw;
				if (monitored)
					console.log(`Dealer Drew: ${draw} || New Total ${dealerTotal}`);
				if (draw === 11)
					softCards = softCards + 1;
				if (dealerTotal > 21 && softCards > 0){
					dealerTotal = dealerTotal - 10;
					softCards = softCards - 1;
				}
			} else {
				return dealerTotal;
			}
		} else {
			if (dealerTotal < 17){
				var draw = drawAndCount();
				dealerTotal = dealerTotal + draw;
				if (monitored)
					console.log(`Dealer Drew: ${draw} || New Total ${dealerTotal}`);
				if (draw === 11)
					softCards = softCards + 1;
				if (dealerTotal > 21 && softCards > 0){
					dealerTotal = dealerTotal - 10;
					softCards = softCards - 1;
				}
			} else {
				return dealerTotal;
			}
		}
	}
}

function determineBetSize(trueCount){
	if (trueCount < 2)
		return 1;
	if (trueCount < 3)
		return 1;
	if (trueCount < 4)
		return 1;
	if (trueCount < 5)
		return 1;
	if (trueCount < 6)
		return 1;
	if (trueCount < 7)
		return 1;
	if (trueCount >= 7)
		return 1;
}

function checkInsurance(userHand, dealerHand){
	if (userHand[0] + userHand[1] === 21)
		return 'No';
	if (dealerHand[0] === 11){
		if (dealerHand[1] === 10)
			return 'Insurance Won';
		else 
			return 'Insurance Lost';
	} else 
		return 'No';
}
