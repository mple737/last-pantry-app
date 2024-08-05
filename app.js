import React from 'react';
import ReactDOM from 'react-dom';
import './style.css'; // Import your global CSS
import ExpenseTracker from './ExpenseTracker';

ReactDOM.render(
  <React.StrictMode>
    <ExpenseTracker />
  </React.StrictMode>,
  document.getElementById('root')
);
