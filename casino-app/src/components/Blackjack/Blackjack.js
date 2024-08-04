import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
    const [isUpdating, setIsUpdating] = useState(false); // Track if the state is updating

    const handleBet = async () => {
        if (betAmount > account.balance) {
            alert('Insufficient balance to place the bet.');
            return;
        }
        setIsUpdating(true); // Disable buttons
        setPlayerBet(betAmount);
        await updateBalance(account.username, account.balance - betAmount);

        try {
            const response = await axios.post('http://localhost:3001/game/start-game', { betAmount }, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setGameStatus('playing');
            setResult('');
            setDealerSecondCardHidden(true);
        } catch (error) {
            console.error('Error starting game:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    const handleBetChange = (amount) => {
        setBetAmount(amount);
    };

    const handleHit = async () => {
        if (isUpdating) return; // Prevent quick successive clicks
        setIsUpdating(true); // Disable buttons

        try {
            const response = await axios.post('http://localhost:3001/game/hit', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            setPlayerHand(response.data.playerHand);
            if (response.data.result) {
                setResult(response.data.result);
                setGameStatus(response.data.gameStatus); // Use gameStatus from response
                setDealerHand(response.data.dealerHand); // Update dealer's hand to reveal second card
                setDealerSecondCardHidden(false); // Reveal the dealer's second card
            }
        } catch (error) {
            console.error('Error hitting:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    const handleDouble = async () => {
        if (isUpdating) return; // Prevent quick successive clicks
        setIsUpdating(true); // Disable buttons

        try {
            const response = await axios.post('http://localhost:3001/game/double', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setResult(response.data.result);
            setGameStatus('finished'); // Game should be finished after double
            setDealerSecondCardHidden(false); // Reveal the dealer's second card

            // Update balance after game ends
            const newBalance = response.data.newBalance;
            await updateBalance(account.username, newBalance);
        } catch (error) {
            console.error('Error doubling:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    const handleStand = async () => {
        if (isUpdating) return; // Prevent quick successive clicks
        setIsUpdating(true); // Disable buttons

        try {
            const response = await axios.post('http://localhost:3001/game/stand', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setResult(response.data.result);
            setGameStatus('finished');
            setDealerSecondCardHidden(false); // Reveal the dealer's second card

            // Update balance after game ends
            const newBalance = response.data.newBalance;
            await updateBalance(account.username, newBalance);
        } catch (error) {
            console.error('Error standing:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    useEffect(() => {
        if (gameStatus === 'finished') {
            setTimeout(() => {
                setGameStatus('betting');
            }, 2000); // Adjust the delay as needed
        }
    }, [gameStatus]);

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
                    onDouble={handleDouble}
                    onStand={handleStand}
                    onPlaceBet={handleBet}
                    betDisabled={gameStatus !== 'betting'}
                    actionDisabled={gameStatus !== 'playing' || isUpdating}
                    gameStatus={gameStatus}
                />
            </div>
            <GameArea
                playerHand={playerHand}
                dealerHand={dealerHand}
                result={result}
                dealerSecondCardHidden={dealerSecondCardHidden}
                gameStatus={gameStatus}
            />
        </div>
    );
};

export default Blackjack;
