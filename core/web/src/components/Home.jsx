import React from 'react';

import Navbar from '@components/navbar/Navbar';

import './Home.scss';

const Home = () => (
  <>
    <Navbar />
    <div className="Home">
      <div className="App">
        <header className="App-header">
          <img src="/static/logo.svg" className="App-logo" alt="logo" />
        </header>
      </div>
    </div>
  </>
);

export default Home;
