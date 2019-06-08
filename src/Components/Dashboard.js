import React from 'react';
import {NavLink} from 'react-router-dom';

const Dashboard = () => {
  return(
    <>
      <h1>Dashboard</h1>
      <button><NavLink to='/create-invoice'>Create new Invoice</NavLink></button>
    </>
  )
}
export default Dashboard;