import React, { Component } from 'react'
import ditto from '../../ditto.png'
import {FiArrowLeftCircle} from 'react-icons/fi'
import classes from './ForgotPassword.module.css'

class ForgotPassword extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             email:''
        }
    }

    inputChangeHandler=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }
    goToHome(){
        window.location.href="/"
    }
    render() {
        return (
            <div className={"container "+classes.mainDiv}>
                <div className={classes.logo}>
                    <img src={ditto} onClick={this.goToHome} alt="Logo"/>
                </div>
                <h2 className="text-center mb-3">Forgot Your password?</h2>
                <p className="text-center col-lg-7 col-md-7 mx-auto">Enter the email address associated with your account and we’ll send you a link to reset your password.</p>
                <form className="row">
                    <div className="form-group col-lg-7 col-md-7 col-sm-12 mx-auto">
                        <label htmlFor="exampleInputEmail1">Email</label>
                        <input type="email" name="email" value={this.state.email} onChange={this.inputChangeHandler} className={"form-control "+classes.Input} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="col-lg-7 col-md-7 col-sm-12 mx-auto">
                        <button className="btn btn-primary w-100 mb-2">Send password reset link</button>
                    </div>
                    <a href="/login" className="col-lg-7 col-md-7 col-sm-12 mx-auto"><FiArrowLeftCircle size="30px" color="#676767" className="float-left"/></a>
                </form>
            </div>
        )
    }
}

export default ForgotPassword
