import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import TermPolicy from './components/TermPolicy/TermPolicy';
import Setting from './components/Setting/Setting';
import Profile from './components/Profile/Profile';
import Home from './components/Home/Home';
import PageNotFound from './components/PageNotFound/PageNotFound';
import Result from './components/Result/Result';
import Admin from './components/Admin/Admin';

class App extends Component {

  render(){
    return (
      <div className="App" id="app">
        <Switch>
          <Route path="/" exact component={Home}/>
          <Route path="/login" component={Login}/>
          <Route path="/join" component={Signup}/>
          <Route path="/forgotpassword" component={ForgotPassword}/>
          <Route path="/termsandpolicy" component={TermPolicy}/>
          <Route path="/settings" component={Setting}/>
          <Route path="/result" component={Result}/>
          <Route path="/admin/owner" component={Admin}/>
          <Route path="/404" component={PageNotFound}/>
          <Route path="*" component={Profile}/>
        </Switch>
      </div>
    );
  }
}

export default App;
