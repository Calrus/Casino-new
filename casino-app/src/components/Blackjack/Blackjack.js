import React, { useState, useEffect, useContext } from 'react';
import BetSection from './BetSection';
import ActionButtons from './ActionButtons';
import GameArea from './GameArea';
import TopBar from '../TopBar';
import AccountContext from '../Account/AccountContext';
import './Blackjack.css';

const Blackjack = () => {
    const { account, updateBalance } = useContext(AccountContext);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerBet, setPlayerBet] = useState(0);
    const [gameStatus, setGameStatus] = useState('betting'); // 'betting', 'playing', 'finished'
    const [betAmount, setBetAmount] = useState(0);
    const [result, setResult] = useState('');
    const [dealerSecondCardHidden, setDealerSecondCardHidden] = useState(true); // Track if dealer's second card is hidden

    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    const drawCard = () => {
        const suit = suits[Math.floor(Math.random() * suits.length)];
        const value = values[Math.floor(Math.random() * values.length)];
        return { suit, value };
    };

    const calculateHandValue = (hand) => {
        let value = 0;
        let numAces = 0;

        hand.forEach(card => {
            if (card.value === 'A') {
                numAces += 1;
                value += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                value += 10;
            } else {
                value += parseInt(card.value, 10);
            }
        });

        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces -= 1;
        }

        return value;
    };

    const dealInitialCards = () => {
        let playerCards = [drawCard(), drawCard()];
        let dealerCards = [drawCard(), drawCard()];
        setPlayerHand(playerCards);
        setDealerHand(dealerCards);
        setGameStatus('playing');
        setResult('');
        setDealerSecondCardHidden(true);
    };

    const handleBet = () => {
        if (betAmount > account.balance) {
            alert('Insufficient balance to place the bet.');
            return;
        }
        if (betAmount <= 0) {
            alert('Please enter a valid bet amount.');
            return;
        }
        setPlayerBet(betAmount);
        updateBalance(account.username, account.balance - betAmount);
        dealInitialCards();
    };

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleHit = () => {
        setPlayerHand((prevHand) => {
            const newHand = [...prevHand, drawCard()];
            return newHand;
        });
    };

    useEffect(() => {
        const playerHandValue = calculateHandValue(playerHand);
        console.log('Player Hand:', playerHand);
        console.log('Player Hand Value:', playerHandValue);
        if (playerHandValue > 21) {
            setResult('Player Busts!');
            setGameStatus('finished');
            setDealerSecondCardHidden(false); // Reveal dealer's second card
        }
    }, [playerHand]);

    useEffect(() => {
        if (gameStatus === 'finished') {
            // Re-enable betting after game is finished
            setGameStatus('betting');
        }
    }, [gameStatus]);

    const handleStand = () => {
        setDealerSecondCardHidden(false); // Reveal dealer's second card
        const dealerPlay = (currentHand) => {
            const dealerValue = calculateHandValue(currentHand);
            console.log('Dealer Hand:', currentHand);
            console.log('Dealer Hand Value:', dealerValue);
            if (dealerValue < 17) {
                const newHand = [...currentHand, drawCard()];
                setDealerHand(newHand);
                dealerPlay(newHand);
            } else {
                setDealerHand(currentHand);
                determineResult(currentHand);
            }
        };
        dealerPlay(dealerHand);
    };

    const determineResult = (finalDealerHand) => {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(finalDealerHand);

        console.log('Final Player Value:', playerValue);
        console.log('Final Dealer Value:', dealerValue);

        if (playerValue > 21) {
            setResult('Player Busts!');
        } else if (dealerValue > 21 || playerValue > dealerValue) {
            setResult('Player Wins!');
            updateBalance(account.username, account.balance + playerBet * 2);
        } else if (playerValue < dealerValue) {
            setResult('Dealer Wins!');
        } else {
            setResult('Push!');
            updateBalance(account.username, account.balance + playerBet);
        }
        setGameStatus('finished'); // Set game status to finished after determining result
    };

    return (
        <div className="blackjack">
            <TopBar balance={account ? account.balance : 0} />
            <div className="controls">
                <BetSection
                    betAmount={betAmount}
                    onBetChange={handleBetChange}
                    disabled={gameStatus !== 'betting'}
                />
                <ActionButtons
                    onHit={handleHit}
                    onStand={handleStand}
                    onPlaceBet={handleBet}
                    betDisabled={gameStatus !== 'betting'}
                    actionDisabled={gameStatus !== 'playing'}
                />
            </div>
            <GameArea
                playerHand={playerHand}
                dealerHand={dealerHand}
                playerHandValue={calculateHandValue(playerHand)}
                dealerHandValue={dealerHand.length ? calculateHandValue(dealerHand) : 0}
                result={result}
                dealerSecondCardHidden={dealerSecondCardHidden}
                calculateHandValue={calculateHandValue} // Pass the function to GameArea
            />
        </div>
    );
};

export default Blackjack;
