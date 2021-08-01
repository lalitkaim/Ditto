import React, { Component } from 'react'
import ditto from '../../ditto.png'
import classes from './Signup.module.css'
import { initialize } from '../Config/Config'
import profile from '../../profile.png'
import $ from 'jquery'
import imageCompression from 'browser-image-compression'

class Signup extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            fName:'',
            lName:'',
            email:'',
            username:'',
            password:''
        }
    }

    myProfile=null;
    myExtension = null;
    usernameList=[]

    inputChangeHandler=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }
    profilePreviewHandler=(event)=>{
        this.myProfile = event.target.files[0];
        this.myExtension  = this.myProfile.name.substr(this.myProfile.name.lastIndexOf(".")+1,this.myProfile.name.length)
        let reader = new FileReader();
        reader.onload = (e)=>{
            $('#profileImage').attr('src', e.target.result);
            $('#profileImage').attr('alt', this.myProfile.name);
            $('#profileImage').attr('title', this.myProfile.name);
        }
        reader.readAsDataURL(this.myProfile)
    }

    signupHandler=(event)=>{
        event.preventDefault()
        const db = initialize.firestore();
        const storage = initialize.storage();
        initialize.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then((user)=>{
                if(initialize.auth().currentUser){
                    $("#loaderMainDiv").css('display','flex')
                    const uid = initialize.auth().currentUser.uid;
                    localStorage.setItem('user',JSON.stringify(initialize.auth().currentUser.uid))
                    const options={
                        maxSizeMb:0.3,
                        maxWidthOrHeight: 720,
                        useWebWorker: true
                    }
                    imageCompression(this.myProfile, options)
                    .then((newProfile)=>{
                        let ref=storage.ref("users/"+uid+"/profile/profile."+this.myExtension)
                        const uploadTask = ref.put(newProfile)
                        uploadTask.on('state_changed', function(snapshot){
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        document.getElementById("progressMainDiv").style.display="block";
                        document.getElementById("progressBar").style.width=progress+"%";
                        }, function(error) {
                            
                        }, ()=>{
                            uploadTask.snapshot.ref.getDownloadURL()
                            .then(url=>{
                                db.collection("users").doc(uid).set({
                                    email: this.state.email,
                                    userId: uid,
                                    firstName : this.state.fName,
                                    lastName: this.state.lName,
                                    username : this.state.username,
                                    bio : "Download free, beautiful high-quality photos selected by "+this.state.fName+".",
                                    site:'',
                                    likesList:[],
                                    bookmarksList:[],
                                    profileName: "profile."+this.myExtension,
                                    profileUrl:url
                                })
                                .then(res=>{
                                    $("#loaderMainDiv").css('display','none')
                                    document.getElementById("successupdate").style.display="block"
                                    document.getElementById("progressMainDiv").style.display="none";
                                    setTimeout(() => {  
                                        document.getElementById("successupdate").style.display="none"
                                        window.location.href="/login"
                                    }, 1000);
                                })
                                .catch(err=>{
                                    console.log(err)
                                })
                            })
                            .catch(err=>{
                                console.log(err)
                            })
                        });
                    })
                    .catch(function(error){
                        console.log("error", error)
                    })
                }
                else{
                    alert("Server error : please try again.")
                }
            })
            .catch(function(error){
                alert("Please fill the correct input values.")
            })
    }
    goToHome(){
        window.location.href="/"
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        db.collection("users").get()
        .then(users=>{
            users.forEach(user=>{
                this.usernameList.push(user.data().username);
            })
        })
    }

    render() {
        return (
            <>
            <div className="container mt-5">
                <div className="row">
                    <div className={"col-12 mb-3 "+classes.logo}>
                        <img src={ditto} onClick={this.goToHome} alt="Image"/>
                    </div>
                    <h2 className="col-12 text-center mb-3">Join Ditto</h2>
                    <p className="col-12 text-center">Already have an account? <a href="/login">Login</a></p>
                </div>
                <form className="row" onSubmit={this.signupHandler}>
                    <div className="form-group col-lg-4 col-md-6 col-sm-6 col-xs-6 ml-auto">
                        <label>First Name</label>
                        <input type="text" name="fName" required value={this.state.fName} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-4 col-md-6 col-sm-6 col-xs-6 mr-auto">
                        <label>Last Name</label>
                        <input type="text" name="lName" required value={this.state.lName} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label>Email</label>
                        <input type="email" name="email" required value={this.state.email} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label>Username</label>
                        <input type="text" name="username" required value={this.state.username} pattern="[A-Za-z0-9_]+" onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} aria-describedby="emailHelp"/>
                        <p className="text-muted m-0" style={{fontSize:"12px"}}>Username must have at least one letter and contain only letters, digits, or underscores (no spaces)</p>
                        {
                            this.usernameList.includes(this.state.username)  ?
                            <small className="text-danger">Username already exist.</small> :
                            this.state.username && <small className="text-success">Username Accepted.</small>
                        }
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label>Password</label>
                        <input type="password" name="password" required value={this.state.password} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput}/>
                        <p className="text-muted m-0" style={{fontSize:"12px"}}>Password should be at least 6 characters.</p>
                    </div>
                    <div className={classes.profileDivMain}>
                        <div>
                            <div className={classes.profileDiv}>
                                <img src={profile} id="profileImage"/>
                            </div>
                            <p className="text-primary">Choose Picture</p>
                            <input type="file" onChange={this.profilePreviewHandler} id="profileInput" className={classes.profileInput} required/>
                        </div>
                    </div>
                    <div className="col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <button type="submit" className="btn btn-primary w-100 mb-3">Join</button>
                    </div>
                </form>
                <div className="row">
                    <small className="col-12 text-center text-muted mb-2">By joining, you agree to the <a href="/termsandpolicy"> Terms </a> and <a href="/termsandpolicy"> Privacy Policy </a>.</small>
                </div>
                <p className="text-center" style={{fontSize:"14px", color:"#818181", marginBottom:"2px"}}>&copy; 2020-Present Lalit, All rights reserved</p>
            </div>
            <div className={classes.progressMainDiv} id="progressMainDiv">
                <div className="progress">
                    <div className="progress-bar bg-success" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div className={classes.successUpdate} id="successupdate">
                <div></div>
                <div>
                    <h3 className="animate__animated animate__fadeInUp text-success" id="myHead">Joining successful.</h3>
                </div>
            </div>
            <div className={classes.loaderMainDiv} id="loaderMainDiv">
                <div className={classes.loader}>Loading</div>
            </div>
            </>
        )
    }
}

export default Signup
