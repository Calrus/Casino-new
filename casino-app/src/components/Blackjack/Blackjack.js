import React, { useState, useContext } from 'react';
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
            const response = await axios.post('http://localhost:3001/start-game', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            console.log('Start game response:', response.data); // Log the response for debugging
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

        console.log(account.token);

        try {
            const response = await axios.post('http://localhost:3001/hit', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            console.log('Hit response:', response.data); // Log the response for debugging
            setPlayerHand(response.data.playerHand);
            if (response.data.result) {
                setResult(response.data.result);
                setGameStatus('finished');
                setDealerSecondCardHidden(false);
            }
        } catch (error) {
            console.error('Error hitting:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    const handleStand = async () => {
        if (isUpdating) return; // Prevent quick successive clicks
        setIsUpdating(true); // Disable buttons

        try {
            const response = await axios.post('http://localhost:3001/stand', {}, {
                headers: { Authorization: `Bearer ${account.token}` },
            });
            console.log('Stand response:', response.data); // Log the response for debugging
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setResult(response.data.result);
            setGameStatus('finished');
        } catch (error) {
            console.error('Error standing:', error.response); // Log the error response
        } finally {
            setIsUpdating(false); // Enable buttons
        }
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
                    actionDisabled={gameStatus !== 'playing' || isUpdating}
                />
            </div>
            <GameArea
                playerHand={playerHand}
                dealerHand={dealerHand}
                result={result}
                dealerSecondCardHidden={dealerSecondCardHidden}
            />
        </div>
    );
};

export default Blackjack;
