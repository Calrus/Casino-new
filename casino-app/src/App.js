import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import Blackjack from './components/Blackjack/Blackjack';
import Login from './components/Account/Login';
import Register from './components/Account/Register';
import { AccountProvider } from './components/Account/AccountContext';

function App() {
  return (
    <AccountProvider>
      <Router>
        <div className="app">
          <SideBar />
          <div className="main-content">
            <TopBar />
            <Routes>
              <Route path="/blackjack" element={<Blackjack />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Add routes for other games here */}
              <Route path="/" element={<div>Select a game from the sidebar</div>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AccountProvider>
  );
}

export default App;
