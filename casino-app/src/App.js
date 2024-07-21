import React from 'react';
import './App.css';
import Sidebar from './components/SideBar';
import TopBar from './components/TopBar';
import GameArea from './components/GameArea';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <GameArea />
      </div>
    </div>
  );
}

export default App;
