import React, { Component } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom'
import Category from './Category';
import Search from './Search';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Switch>
          <Route exact path='/' component={Search}/>
          <Route path='/' component={Category}/>
        </Switch>
      </div>
    );
  }
}

export default App;
