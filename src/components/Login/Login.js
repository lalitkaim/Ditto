import React, { Component } from 'react'
import ditto from '../../ditto.png'
import classes from './Login.module.css'
import { initialize } from '../Config/Config'

class Login extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             email:'',
             password:''
        }
    }
    
    inputChangeHandler=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }
    goToHome(){
        window.location.href="/"
    }
    onLoginHandler=(event)=>{
        event.preventDefault()
        initialize.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
        .then(res=>{
            localStorage.setItem('user',JSON.stringify(initialize.auth().currentUser.uid))
            window.location.href="/"
        })
        .catch(error => alert(error))
    }

    render() {
        return (
            <div className="container mt-5">
                <div className="row">
                    <div className={"col-12 mb-3 "+classes.logo}>
                        <img src={ditto} onClick={this.goToHome} alt="Image"/>
                    </div>
                    <h2 className="col-12 text-center mb-3">Login</h2>
                    <p className="col-12 text-center">Welcome Back</p>
                    <form className="col-lg-8 col-md-12 col-sm-12 m-auto" onSubmit={this.onLoginHandler}>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email</label>
                            <input type="email" name="email" value={this.state.email} onChange={this.inputChangeHandler} className={"form-control "+classes.loginInput} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Password</label>
                            <a className="float-right" href="/forgotpassword">Forgot Password?</a>
                            <input type="password" name="password" value={this.state.password} onChange={this.inputChangeHandler} className={"form-control "+classes.loginInput} id="exampleInputPassword1"/>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                    </form>
                    <div className="text-center w-100"><span>Don't have an account <a href="/join">Join</a></span></div>
                </div>
            </div>
        )
    }
}

export default Login
