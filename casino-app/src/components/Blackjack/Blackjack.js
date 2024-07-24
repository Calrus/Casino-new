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

    useEffect(() => {
        const fetchCurrentHand = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:3001/game/current-hand', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlayerHand(response.data.playerHand);
                setDealerHand(response.data.dealerHand);
                setBetAmount(response.data.betAmount);
                setGameStatus('playing');
                setResult('');
                setDealerSecondCardHidden(true);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('No game in progress');
                } else {
                    console.error('Error fetching current hand:', error.response);
                }
            }
        };

        if (account && account.token) {
            fetchCurrentHand();
        }
    }, [account]);

    const resetGame = () => {
        console.log('Resetting game, setting gameStatus to betting');
        setPlayerHand([]);
        setDealerHand([]);
        setGameStatus('betting');
        setResult('');
        setDealerSecondCardHidden(true);
    };

    const handleBet = async () => {
        if (gameStatus === 'finished') {
            resetGame();
        }

        if (betAmount > account.balance) {
            alert('Insufficient balance to place the bet.');
            return;
        }
        setIsUpdating(true); // Disable buttons
        setPlayerBet(betAmount);
        await updateBalance(account.username, account.balance - betAmount);

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/game/start-game', { betAmount }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setGameStatus('playing');
            setResult('');
            setDealerSecondCardHidden(true);
        } catch (error) {
            console.error('Error starting game:', error.response);
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

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/game/hit', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlayerHand(response.data.playerHand);
            if (response.data.result) {
                setResult(response.data.result);
                console.log('Player hand result:', response.data.result);
                setGameStatus('finished');
                setDealerSecondCardHidden(false);
            }
        } catch (error) {
            console.error('Error hitting:', error.response);
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    const handleStand = async () => {
        if (isUpdating) return; // Prevent quick successive clicks
        setIsUpdating(true); // Disable buttons

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3001/game/stand', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Stand response:', response.data); // Log the response data
            setPlayerHand(response.data.playerHand);
            setDealerHand(response.data.dealerHand);
            setResult(response.data.result);
            if (response.data.newBalance !== undefined) {
                await updateBalance(account.username, response.data.newBalance);
            }
            setGameStatus('finished');
            setDealerSecondCardHidden(false);
        } catch (error) {
            console.error('Error standing:', error.response);
        } finally {
            setIsUpdating(false); // Enable buttons
        }
    };

    useEffect(() => {
        if (gameStatus === 'finished') {
            console.log('Game status is finished, re-enabling bet button');
            // Re-enable the bet button without clearing the hands
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
