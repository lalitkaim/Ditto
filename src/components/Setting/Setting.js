import React, { Component } from 'react'
import {MdHome} from 'react-icons/md'
import classes from './Setting.module.css'
import { initialize } from '../Config/Config'
import imageCompression from 'browser-image-compression'
import $ from 'jquery'

class Setting extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             fName:'',
             lName:'',
             username:'',
             spyUsername:'',
             site:'',
             bio:'',
             isLoggedIn:false,
             profileUrl:null
        }
    }

    usernameList=[]

    inputChangeHandler=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }

    formUpdateHandler=(event)=>{
        event.preventDefault()
        const exist = document.getElementById("exist")
        if(exist){
            alert("Username already exist.")
            return
        }
        const db = initialize.firestore();
        db.doc("users/"+initialize.auth().currentUser.uid).update({
            firstName:this.state.fName,
            lastName:this.state.lName,
            site:this.state.site,
            bio:this.state.bio,
            username:this.state.username
        })
        .then(res=>{
            this.setState({spyUsername:this.state.username})
            document.getElementById("successupdate").style.display="block"
            setTimeout(() => {  
                document.getElementById("successupdate").style.display="none"
            }, 1000);

        })
    }

    uploadProfileHandler=(event)=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        const myFile = event.target.files[0];
        const myFileName = myFile.name;
        $("#loaderMainDiv").css('display','flex')
        const extension = myFileName.substr(myFileName.lastIndexOf(".")+1,myFileName.length)
        const uid = initialize.auth().currentUser.uid
        let ref = storage.ref("users/"+uid+"/profile/"+"profile."+extension)
        const options={
            maxSizeMb:0.5,
            maxWidthOrHeight: 1280,
            useWebWorker: true
        }
        imageCompression(myFile, options)
        .then(res=>{
            const uploadTask = ref.put(res)
            uploadTask.on('state_changed', function(snapshot){
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById("progressMainDiv").style.display="block";
            document.getElementById("progressBar").style.width=progress+"%";
            }, function(error) {
                
            }, function() {
                uploadTask.snapshot.ref.getDownloadURL()
                .then(url=>{
                    db.doc("users/"+uid).set({
                        profileName : "profile."+extension,
                        profileUrl: url
                    },{merge:true})
                    .then(()=>{
                        $("#loaderMainDiv").css('display','none')
                        document.getElementById("successupdate").style.display="block"
                        document.getElementById("progressMainDiv").style.display="none";
                        setTimeout(() => {  
                            document.getElementById("successupdate").style.display="none"
                            window.location.reload();
                        }, 1000);
                    })
                    .catch(err=>{
                        alert(err)
                    })
                })
                .catch(err=>{
                    alert(err)
                })
            });
        })
        .catch(err=>{
            console.log(err)
        })
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        initialize.auth().onAuthStateChanged(user=>{
            if(user){
                db.doc("users/"+user.uid).get()
                .then(res=>{
                    this.setState({isLoggedIn:true,fName:res.data().firstName, lName:res.data().lastName, username:res.data().username, spyUsername:res.data().username, site:res.data().site, bio:res.data().bio, profileUrl:res.data().profileUrl})
                })
                .catch(err=>{
                    console.log(err)
                })
            }   
            else{
                this.setState({isLoggedIn:false})
                window.location.href="/"
            }
        })

        db.collection("users").get()
        .then(users=>{
            users.forEach(user=>{
                this.usernameList.push(user.data().username);
            })
        })
    }

    render() {
        if(!this.state.isLoggedIn){
            return null
        }
        if(this.state.spyUsername && this.usernameList)
            this.usernameList = this.usernameList.filter(el=>el!=this.state.spyUsername)
        return (
            <>
            <div className={classes.header}>
                <a href="/"><MdHome className={classes.home}/></a>
                <div className={classes.profileDiv}>
                    <img src={this.state.profileUrl} alt="Profile"/> :
                </div>
            </div>
            <div className={classes.progressMainDiv} id="progressMainDiv">
                <div className="progress">
                    <div className="progress-bar bg-success" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div className="container mt-4">
                <div className={classes.profileUploadDiv}>
                    <div>
                        <div className={classes.changeProfileDiv}>
                            <img src={this.state.profileUrl} alt="Profile"/> :
                        </div>
                        <p className="text-center text-primary mt-1">Change profile picture</p>
                        <input type="file" accept="image/x-png,image/jpg,image/jpeg" onChange={this.uploadProfileHandler} data-toggle="tooltip" title="Upload Profile Picture"/>
                    </div>
                </div>
                <form className="row" onSubmit={this.formUpdateHandler}>
                    <div className="form-group col-lg-4 col-md-6 col-sm-6 col-xs-6 ml-auto">
                        <label htmlFor="exampleInputEmail1">First Name</label>
                        <input type="text" name="fName" value={this.state.fName} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-4 col-md-6 col-sm-6 col-xs-6 mr-auto">
                        <label htmlFor="exampleInputEmail1">Last Name</label>
                        <input type="text" name="lName" value={this.state.lName} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label htmlFor="exampleInputEmail1">Username</label>
                        <input type="text" name="username" value={this.state.username} pattern="[A-Za-z0-9_]+" onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                        <p className="text-muted m-0" style={{fontSize:"12px"}}>Username must have at least one letter and contain only letters, digits, or underscores (no spaces)</p>
                        {
                            this.usernameList.includes(this.state.username)  ?
                            <small className="text-danger" id="exist">Username already exist.</small> :
                            this.state.username && <small className="text-success" id="accept">Username Accepted.</small>
                        }
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label>Personal site/portfolio</label>
                        <input type="text" name="site" value={this.state.site} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="form-group col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <label>Bio</label>
                        <textarea name="bio" value={this.state.bio} onChange={this.inputChangeHandler} className={"form-control "+classes.signupInput} id="exampleInputEmail1" aria-describedby="emailHelp"></textarea>
                    </div>
                    <div className="col-lg-8 col-md-12 col-sm-12 mx-auto">
                        <button type="submit" className="btn btn-primary w-100 mb-3">Update Profile</button>
                    </div>
                </form>
            </div>
            <div className={classes.successUpdate} id="successupdate">
                <div></div>
                <div>
                    <h3 className="animate__animated animate__fadeInUp text-success" id="myHead">Successfully Updated</h3>
                </div>
            </div>
            <div className={classes.loaderMainDiv} id="loaderMainDiv">
                <div className={classes.loader}>Loading</div>
            </div>
            </>
        )
    }
}

export default Setting
