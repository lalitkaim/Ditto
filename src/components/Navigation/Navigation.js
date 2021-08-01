import React, { Component } from 'react'
import ditto from '../../ditto.png'
import {BsSearch,BsFillPlusCircleFill,BsDot} from 'react-icons/bs'
import {RiCloseLine} from 'react-icons/ri'
import {IoMdImages} from 'react-icons/io'
import classes from './Navigation.module.css'
import {FaBars} from 'react-icons/fa'
import { initialize } from '../Config/Config'
import imageCompression from 'browser-image-compression'
import $ from 'jquery'


class Navigation extends Component{
    constructor(props) {
        super(props)
    
        this.state = {
             inputVal:this.props.query || '',
             isLoggedIn:null,
             username:null,
             profileUrl:null,
             email:'',
             password:'',
             imageTitle:'',
             myLabel:''
        }
    }

    myOwnFile=null;
    isUploading=false;

    inputChangeHandlerForLogin=(event)=>{
        this.setState({[event.target.name]:event.target.value})
    }

    searchHandler=(event)=>{
        event.preventDefault();
        if(!this.state.inputVal.trim().length)
            return
        const specialChars = "<>@!#$%^&*()+[]{}?:;|'\"\\,./~`-=";
        for(let i=0;i<specialChars.length;i++){
            if(this.state.inputVal.includes(specialChars[i])){
                alert("No special characters are allowed but underscore.")
                return
            }
        }
        window.location.href="/result/?q="+this.state.inputVal.trim()
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

    temp=true;
    toggleBarMenu=()=>{
        if(this.temp){
            document.getElementById("menuBarDiv").style.display="block"
        }
        else{
            document.getElementById("menuBarDiv").style.display="none"
        }
        this.temp=!this.temp;
    }
    toggleProMenu=()=>{
        if(this.temp){
            document.getElementById("menuProDiv").style.display="block"
        }
        else{
            document.getElementById("menuProDiv").style.display="none"
        }
        this.temp=!this.temp;
    }
    inputFocusIn(){
        document.getElementById("inputDiv").style.backgroundColor="white"
    }
    inputFocusOut(){
        document.getElementById("inputDiv").style.backgroundColor="#ccc"
    }
    inputChangeHandler=(event)=>{
        document.getElementById("clearInputIcon").style.display="block";
        this.setState({inputVal:event.target.value})
    }       
    clearInputHandler=()=>{
        this.setState({inputVal:''})
        document.getElementById("clearInputIcon").style.display="none";
    }
    goToLogin(){
        window.location.href="/login"
    }
    goToJoin(){
        window.location.href="/join"
    }

    goToHome(){
        if(window.location.href!==window.location.origin+"/")
            window.location.href="/"
    }

    logoutHandler(){
        localStorage.removeItem('user')
        initialize.auth().signOut();
        window.location.href="/"
    }
    originalHandler=()=>{
        $('#uploadDiv').css('display','block')
        $('#previewDiv').css('display','none')
        if(document.getElementById("uploadInput"))
            document.getElementById("uploadInput").value=""
    }

    previewPictureHandler=(event)=>{
        event.preventDefault()
        const myFile = event.target.files[0];
        this.myOwnFile = myFile;
        const myFileName = myFile.name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#uploadDiv').css('display','none')
            $('#previewDiv').css('display','block')
            $('#previewDiv').css("height",($("#imagePreviewDiv").innerHeight()-32))
            $('#image').attr('src', e.target.result);
            $('#image').attr('alt', myFileName);
            $('#image').attr('title', myFileName);
        };
        reader.readAsDataURL(myFile);
    }
    uploadPictureHandler=()=>{
        if(this.isUploading)
            return
        if(!this.myOwnFile){
            alert("Please select an image.")
            return
        }
        this.isUploading=true
        const random = Math.random().toString(16).substring(2,12);
        const extension = this.myOwnFile.name.substr(this.myOwnFile.name.lastIndexOf(".")+1,this.myOwnFile.name.length)
        const db = initialize.firestore();
        const storage = initialize.storage();
        const uid = initialize.auth().currentUser.uid
        $("#loaderMainDiv").css('display','flex')
        let ref = storage.ref("users/"+uid+"/collections/"+uid+random+"."+extension)
        const uploadTask = ref.put(this.myOwnFile)
        const options={
            maxSizeMb:0.3,
            maxWidthOrHeight: 500,
            useWebWorker: true
        }
        uploadTask.on('state_changed', function(snapshot0){
            var progress = (snapshot0.bytesTransferred / snapshot0.totalBytes) * 100;
            document.getElementById("progressMainDiv").style.display="block";
            document.getElementById("progressBar").style.width=progress+"%";
        }, function(error) {
            
        }, ()=>{
            imageCompression(this.myOwnFile, options)
            .then(res=>{
                let reff = storage.ref("users/"+uid+"/thumbnailcollections/"+uid+random+"."+extension)
                const uploadTask2 = reff.put(res)
                uploadTask2.on('state_changed', function(snapshot){
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById("progressMainDiv2").style.display="block";
                    document.getElementById("progressBar2").style.width=progress+"%";
                }, function(error) {
                    
                }, ()=>{
                    let myLableArray = this.state.myLabel.split(",")
                    for(let i=0;i<myLableArray.length;i++){
                        myLableArray[i]=myLableArray[i].trim().toLowerCase()
                    }
                    uploadTask2.snapshot.ref.getDownloadURL()
                    .then(url=>{
                        db.collection("collections").add({
                            imageTitle:this.state.imageTitle,
                            imageName:uid+random+"."+extension,
                            likes:0,
                            isValid:false,
                            time:new Date(),
                            label:myLableArray,
                            userId:uid,
                            thumbImageUrl:url
                        })
                        .then(()=>{
                            db.doc("users/f42CgVzxgHXjXc3E5BF49zglxDX2").get()
                            .then(ress=>{
                                this.sendMessageNotification(ress.data().token, ress.data().username, "Got new picture on Ditto.")
                                $("#loaderMainDiv").css('display','none')
                                document.getElementById("successupdate").style.display="block"
                                document.getElementById("progressMainDiv").style.display="none";
                                setTimeout(() => {  
                                    document.getElementById("successupdate").style.display="none"
                                    this.isUploading=false;
                                    alert("Your Image is under verification.")
                                    window.location.reload();
                                }, 1000);
                            })
                            .catch(err=>{
                                console.log(err)
                            })
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
        });
        
    }

    sendMessageNotification=(FCMToken, username, msg)=>{
        $.ajax({        
            type : 'POST',
            url : "https://fcm.googleapis.com/fcm/send",
            headers : {
                Authorization : 'key=' + 'AAAAHjQGhZ0:APA91bFnRpnZYC8xnb3QUm1gQOaYtQGXbKX_aqHXqAZJu2uhjhzJZgYzcxQ758ajjh-Hls1frP1NC1JTA-nQcdLAW5daUbIfDuIUS06FlVL2pA1nEJ01ZJtwcV0KIcfcBOBy5OVF7kkt'
            },
            contentType : 'application/json',
            dataType: 'json',
            data: JSON.stringify({"to": FCMToken, "notification": {"title":"Ditto", "body":msg, "icon":"https://firebasestorage.googleapis.com/v0/b/the-ditto.appspot.com/o/users%2Ff42CgVzxgHXjXc3E5BF49zglxDX2%2Fcollections%2Ff42CgVzxgHXjXc3E5BF49zglxDX22e83fe1b54.png?alt=media&token=c39e7c50-6f98-4fd9-b8db-cf0875602133", "requireInteraction": "true", "click_action":"/"+username}}),
            success : function(response) {
            },
            error : function(xhr, status, error) {
                console.log(xhr.error);      
            }
        });
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        initialize.auth().onAuthStateChanged(user=>{
            if(user){
                db.doc("users/"+initialize.auth().currentUser.uid).get()
                .then(res=>{
                    this.setState({username:res.data().username, profileUrl:res.data().profileUrl})
                })
                .catch(err=>{
                    console.log(err)
                })
            }
        })
        if(localStorage.getItem("user")){
            this.setState({isLoggedIn:true})
        }
        else{
            this.setState({isLoggedIn:false})
        }
        
        document.getElementById("app").onclick=()=>{
            if(document.getElementById("menuProDiv"))
                document.getElementById("menuProDiv").style.display="none"
            if(document.getElementById("menuBarDiv"))
                document.getElementById("menuBarDiv").style.display="none"
        }
    }   
    
    render(){
        return (
            <React.Fragment>
            <div className={"container-fluid "+classes.navDiv}>
                <div className="row">
                    <div className={classes.logo}  data-toggle="tooltip" title="Ditto Home">
                        <img src={ditto} alt="ditto logo" onClick={this.goToHome}/>
                    </div>
                    <div className={"col "+classes.inputDiv} id="inputDiv">
                        <BsSearch className={classes.inputIcon} size="20px" onClick={this.searchHandler}/>
                        <form onSubmit={this.searchHandler} style={{width:"100%"}}>
                            <input onFocus={this.inputFocusIn} onBlur={this.inputFocusOut} value={this.state.inputVal} onChange={this.inputChangeHandler} required className="form-control" id="myInput" type="text" placeholder="Feel free to search" data-toggle="tooltip" title="Ditto Search"/>
                        </form>
                        <RiCloseLine onClick={this.clearInputHandler} id="clearInputIcon" className={classes.inputIcon} style={{display:"none"}} size="25px"/>
                    </div>
                    <div className={classes.buttonDiv}>
                        <button className={"btn hvr-shadow "+classes.myBtn+" "+classes.uploadBtn} data-toggle="modal" data-target="#uploadModal" onClick={this.originalHandler} style={{border:"1px dashed #ccc"}}>Upload Picture</button>
                        {!this.state.isLoggedIn &&
                        <>
                            <button className={"btn hvr-shadow "+classes.myBtn+" "+classes.loginBtn} onClick={this.goToLogin}>Login</button>
                            <button className={"btn btn-info hvr-shadow "+classes.myBtn+" "+classes.joinBtn} onClick={this.goToJoin}>Join free</button>
                        </>
                        }
                    </div>
                    <div className={classes.barDiv}>
                        {
                            !this.state.isLoggedIn ? 
                            <button className={"btn hvr-shadow "+classes.myBtn+" "+classes.faBars} onClick={this.toggleBarMenu} onBlur={this.toggleBarMenuOff}><FaBars/></button> :
                            this.state.profileUrl &&
                            <img className={classes.userImage} onClick={this.toggleProMenu} src={this.state.profileUrl} alt="User Profile"/> 
                        }
                        {!this.state.isLoggedIn?
                        <div className={"animate__animated animate__bounceIn "+classes.menuBarDiv} id="menuBarDiv">
                            <div>
                                <div><button className={"btn hvr-shadow "+classes.myBtn} onClick={this.goToLogin} style={{border:"1px solid #ccc",color:"white"}}>Login</button></div>
                                <div><button className={"btn btn-info hvr-shadow "+classes.myBtn} onClick={this.goToJoin}>Join free</button></div>
                            </div>
                            <div><button className={"btn hvr-shadow "+classes.myBtn} data-toggle="modal" data-target="#uploadModal" onClick={this.originalHandler} style={{color:"white"}}>Uplaod Picture</button></div>
                            <div className={classes.pinDiv}></div>
                        </div>
                        :
                        <div className={"animate__animated animate__bounceIn "+classes.menuProDiv} id="menuProDiv">
                            <div><a href={"/"+this.state.username} className={"hvr-shadow "+classes.myBtn} style={{color:"white"}}>View Profile</a></div>
                            <div><a href="/settings" className={"hvr-shadow "+classes.myBtn} style={{color:"white"}}>Account Setting</a></div>
                            <div style={{padding:"8px"}}><button className={"btn hvr-shadow "+classes.myBtn+" "+classes.userUploadBtn} data-toggle="modal" data-target="#uploadModal" onClick={this.originalHandler} style={{color:"white",border:"1px dashed #ccc",width:"100%",margin:"auto",justifyContent:"center"}}>Uplaod Picture</button></div>
                            <div><a onClick={this.logoutHandler} className={"hvr-shadow "+classes.myBtn} style={{color:"white",borderTop:"1px solid white"}}>Logout</a></div>
                            <div className={classes.pinDiv}></div>
                        </div>
                        }
                    </div>  
                    {/* modal for upload and login */}
                    {this.state.isLoggedIn ?
                    <div className="modal fade" id="uploadModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className={"modal-dialog "+classes.uploadModalDialog}>
                            <div className={"modal-content "+classes.uploadModalContent}>
                                <div className="modal-header">
                                    <b style={{fontSize:"18px"}}>Publish to Ditto</b>
                                    <div type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </div>
                                </div>
                                <div style={{position:'relative'}}>
                                    <div className={classes.progressMainDiv} id="progressMainDiv"  style={{position:"absolute",width:"100%",top:"0"}}>
                                        <div className="progress">
                                            <div className="progress-bar bg-success" id="progressBar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                    <div className={classes.progressMainDiv} id="progressMainDiv2" style={{position:"absolute",width:"100%",top:"0"}}>
                                        <div className="progress">
                                            <div className="progress-bar bg-danger" id="progressBar2" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-body" id="imagePreviewDiv">
                                    <div className={classes.uploadDiv} id="uploadDiv">
                                        <div>
                                            <IoMdImages className={classes.ioMdImage}/>
                                            <BsFillPlusCircleFill className={classes.bsFillPlusImage}/>
                                        </div>

                                        <div className="row">
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Upload high quality photos</div>
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Only upload photos you own the rights to</div>
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Respect the intellectual property of others</div>
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Photos are clear & original</div>
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Zero tolerance for nudity, violence or hate</div>
                                            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12"><BsDot size="20px"/> Should not be copyright content</div>
                                        </div>
                                        <input type="file" accept="image/x-png,image/jpg,image/jpeg" onChange={this.previewPictureHandler} id="uploadInput"/>
                                    </div>
                                    <div className={classes.previewDiv} id="previewDiv">
                                        <img src="" id="image" data-toggle="tooltip" alt="profile"/>
                                        <div className="row m-0 p-0">
                                            <textarea value={this.state.imageTitle} name="imageTitle" onChange={this.inputChangeHandlerForLogin} className="form-control col-lg-7 col-md-12 col-sm-12 mb-1" rows="1" placeholder="Title"></textarea>
                                            <input type="text" value={this.state.myLabel} name="myLabel" onChange={this.inputChangeHandlerForLogin}  className="form-control col-lg-7 col-md-12 col-sm-12" placeholder="Label separate by comma ',' "/>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" onClick={this.uploadPictureHandler} className="btn btn-info">Publish to Ditto</button>
                                </div>
                            </div>
                        </div>
                    </div> :

                    <div className="modal fade" id="uploadModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className={"modal-dialog "+classes.uploadModalDialog}>
                            <div className={"modal-content "+classes.uploadModalContent}>
                                <div type="button" className="close float-right" data-dismiss="modal" aria-label="Close">
                                    <span className="p-3 float-right" aria-hidden="true">&times;</span>
                                </div>
                                <div className="container mt-2">
                                    <div className="row">
                                        <div className={"col-12 mb-3 "+classes.logoModal}>
                                            <img src={ditto} onClick={this.goToHome} alt="logo"/>
                                        </div>
                                        <h2 className="col-12 text-center mb-3">Login</h2>
                                        <p className="col-12 text-center">To submit a photo, login</p>
                                        <form className="col-lg-8 col-md-12 col-sm-12 m-auto" onSubmit={this.onLoginHandler}>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" name="email" value={this.state.email} onChange={this.inputChangeHandlerForLogin} className={"form-control "+classes.loginInputModal} aria-describedby="emailHelp"/>
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <a className="float-right" href="/forgotpassword">Forgot Password?</a>
                                                <input type="password" name="password" value={this.state.password} onChange={this.inputChangeHandlerForLogin} className={"form-control "+classes.loginInputModal}/>
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                                        </form>
                                        <div className="text-center w-100"><span>Don't have an account <a href="/join">Join</a></span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    }
                    {/* modal for uplaod login */}
                </div>
                <div className={classes.successUpdate} id="successupdate">
                    <div></div>
                    <div>
                        <h3 className="animate__animated animate__fadeInUp text-success" id="myHead">Successfully Uploaded</h3>
                    </div>
                </div>
            </div>
            <div className={classes.loaderMainDiv} id="loaderMainDiv">
                <div className={classes.loader}>Loading</div>
            </div>
            </React.Fragment>
        )
    }
}

export default Navigation
