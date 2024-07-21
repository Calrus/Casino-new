import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import Blackjack from './components/Blackjack/Blackjack';

function App() {
  return (
    <Router>
      <div className="app">
        <SideBar />
        <div className="main-content">
          <TopBar />
          <Routes>
            <Route path="/blackjack" element={<Blackjack />} />
            {/* Add routes for other games here */}
            <Route path="/" element={<div>Select a game from the sidebar</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
