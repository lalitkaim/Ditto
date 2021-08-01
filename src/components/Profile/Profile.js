import React, { Component } from 'react'
import classes from './Profile.module.css'
import {IoMdImages} from 'react-icons/io'
import {BsBookmarks} from 'react-icons/bs'
import {FaGlobeAmericas} from 'react-icons/fa'
import Collection from '../Collection/Collection'
import Bookmark from '../Bookmark/Bookmark'
import { initialize } from '../Config/Config'
import Navigation from '../Navigation/Navigation'
import imageCompression from 'browser-image-compression'
import $ from 'jquery'


class Profile extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            isCollection:false,
            isBookmark:false,
            userId:null,
            name:'',
            username:'',
            bio:'',
            site:'',
            profileUrl:null,
            pending:0,
            noResult:false
        }
    }

    showCollectionHandler=()=>{
        const collection = document.getElementById("collection");
        const bookmark = document.getElementById("bookmark");
        collection.style.borderBottom="4px solid #535353";
        collection.style.borderTop="4px solid #fff";
        bookmark.style.color="#818181"
        collection.style.color="#000000"
        bookmark.style.borderBottom="none";
        bookmark.style.borderTop="none";
        this.setState({isCollection:true,isBookmark:false})
    }
    showBookmarkHandler=()=>{
        const collection = document.getElementById("collection");
        const bookmark = document.getElementById("bookmark");
        collection.style.borderBottom="none";
        collection.style.borderTop="none";
        collection.style.color="#818181"
        bookmark.style.color="#000000"
        bookmark.style.borderBottom="4px solid #535353";
        bookmark.style.borderTop="4px solid #fff";
        this.setState({isCollection:false,isBookmark:true})
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
            document.getElementById("progressMainDivP").style.display="block";
            document.getElementById("progressBarP").style.width=progress+"%";
            }, function(error) {
                
            }, function() {
                uploadTask.snapshot.ref.getDownloadURL()
                .then(url=>{
                    db.doc("users/"+uid).set({
                        profileName : "profile."+extension,
                        profileUrl:url
                    },{merge:true})
                    .then(()=>{
                        $("#loaderMainDiv").css('display','none')
                        document.getElementById("successupdate").style.display="block"
                        document.getElementById("progressMainDivP").style.display="none";
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
                    console.log(err)
                })
            });
        })
        .catch(err=>{
            console.log(err)
        })
    }

    adminHandler=()=>{
        window.location.href="/admin/owner";
    }

    componentDidMount=()=>{
        const db = initialize.firestore()
        const url = window.location.href;
        const userName = url.slice(url.lastIndexOf(window.location.origin)+window.location.origin.length+1,url.length)
        if(userName.length>0){
            db.collection("users/").where("username","==",userName).get()
            .then(res=>{
                if(res.docs.length>0){
                    res.forEach(doc=>{
                        this.setState({userId:doc.data().userId, name : doc.data().firstName+" "+doc.data().lastName, username:doc.data().username, bio:doc.data().bio, site:doc.data().site, profileUrl: doc.data().profileUrl})
                    })
                }
                else{
                    this.setState({noResult:true})
                }
            })
            .catch(err=>{
                console.log(err)
            })
        }
        let count=0;
        db.collection("collections/").where("isValid","==",false).get()
        .then(ress=>{
            ress.forEach(doc=>{
                count++
                this.setState({pending:count})
            })
        })
        .catch(err=>{
            console.log(err)
        })
    }
    render() {
        if(!this.state.userId && !this.state.noResult)
            return <Navigation/>;
        else if(this.state.noResult)
            return (<>
                        <Navigation/>
                        <h3 className="text-center mt-4">No result found:</h3>
                    </>)
        else
        return (
            <>
            <Navigation/>
            <div className={classes.progressMainDiv} id="progressMainDivP">
                <div className="progress">
                    <div className="progress-bar bg-success" id="progressBarP" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            <div className="container mt-4 position-relative">
                <div className="row">
                    {
                        initialize.auth().currentUser &&
                        initialize.auth().currentUser.uid==="f42CgVzxgHXjXc3E5BF49zglxDX2" &&
                        <button onClick={this.adminHandler} className={"btn btn-info "+classes.admin}>Admin <span className="badge badge-light">{this.state.pending}</span></button>
                    }
                    <div className="col-lg-3 col-md-4 col-sm-12">
                        <div className={classes.profileDiv}>
                            <img src={this.state.profileUrl} alt="Profile"/>
                            {
                            initialize.auth().currentUser &&
                            initialize.auth().currentUser.uid===this.state.userId &&
                            <input type="file" accept="image/x-png,image/jpg,image/jpeg" onChange={this.uploadProfileHandler}  data-toggle="tooltip" title="Upload Profile Picture"/>
                            }
                        </div>
                    </div>
                    <div className="col-lg-7 col-md-6 col-sm-12">
                        <h1>{this.state.name}</h1>
                        {
                            this.state.site ?
                            <p className="m-0"><FaGlobeAmericas/> <a href={this.state.site}> {this.state.site}</a></p> :
                            null
                        }
                        <p>{this.state.bio}</p>
                    </div>
                </div>
            </div>
            <div className={"container-fluid mt-4 "+classes.listDiv}>
                <div id="collection" onClick={this.showCollectionHandler}>
                    <IoMdImages className="hvr-grow" size="20px"/>&nbsp;Collections
                </div>
                <div id="bookmark" onClick={this.showBookmarkHandler}>
                    <BsBookmarks className="hvr-grow" size="20px"/>&nbsp;Bookmarks
                </div>
            </div>
            {this.state.isCollection ? <Collection userId={this.state.userId} profileUrl={this.state.profileUrl} username={this.state.username}/> : null}
            {this.state.isBookmark ? <Bookmark userId={this.state.userId}/> : null}
            <div className={classes.successUpdate} id="successupdate">
                <div></div>
                <div>
                    <h3 className="animate__animated animate__fadeInUp text-success" id="myHead">Uploaded Successfully</h3>
                </div>
            </div>
            <div className={classes.loaderMainDiv} id="loaderMainDiv">
                <div className={classes.loader}>Loading</div>
            </div>
            </>
        )
    }
}

export default Profile
