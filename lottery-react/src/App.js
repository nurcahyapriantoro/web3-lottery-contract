import React, { useState, useEffect } from 'react';
import web3 from './web3';
import lottery from './lottery';
import './App.css';


const App = () => {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [showWinner, setShowWinner] = useState(false);
  const [winnerAddress, setWinnerAddress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      setManager(manager);
      setPlayers(players);
      setBalance(balance);
    };
    fetchData();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setMessage("Processing...");

    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(value, 'ether')
      });
      setMessage("You have been entered!");
    } catch (error) {
      setMessage("Transaction failed: " + error.message);
    }
  };

  const onPickWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    setMessage("Picking a winner...");

    try {
      const response = await lottery.methods.pickWinner().send({ from: accounts[0] });
      setWinnerAddress(response.events.Winner.returnValues.winner);
      setShowWinner(true);
      setMessage("A winner has been picked!");
    } catch (error) {
      setMessage("Failed to pick a winner: " + error.message);
    }
  };

  return (
    <div className="App">
      <h2>Lottery Contract</h2>
      <p>Managed by {manager}. Currently, {players.length} entrants competing for {web3.utils.fromWei(balance, 'ether')} ether.</p>
      <form onSubmit={onSubmit}>
        <h4>Want to try your luck?</h4>
        <select value={value} onChange={e => setValue(e.target.value)}>
          <option value="">Select Ether amount</option>
          <option value="0.001">0.001 ETH</option>
          <option value="0.01">0.01 ETH</option>
          <option value="0.1">0.1 ETH</option>
          <option value="1">1 ETH</option>
          <option value="custom">Custom</option>
        </select>
        {value === 'custom' && (
          <input
            type="text"
            placeholder="Enter custom amount"
            onChange={e => setValue(e.target.value)}
          />
        )}
        <button type="submit">Enter</button>
      </form>
      <button onClick={onPickWinner}>Pick a Winner</button>
      {showWinner && <div className="winner-announcement">
        <h1>Congratulations to the winner!</h1>
        <p>{winnerAddress}</p>
        <div className="fireworks">
          {/* Fireworks animation container */}
        </div>
      </div>}
      <h1>{message}</h1>
    </div>
  );
};

export default App;
