import React, {Component } from 'react'
import classe from './LandingPage.module.css'
import classes from '../Collection/Collection.module.css'
import {IoMdHeart,IoMdDownload} from 'react-icons/io'
import {BsBookmarks} from 'react-icons/bs'
import { initialize } from '../Config/Config'
import ditto from '../../ditto.png'
import $ from 'jquery'

class LandingPage extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            thumbnailcollections:[],
            imageOwnerUsername:[],
            imageOwnerProfileUrl:[],
            imageName:[],
            imageTitle:[],
            likesList:[],
            bookmarksList:[],
            likesCount:[]
        }
    }
    
    i=0;
    myInterval=null
    isLikeRunning=false;
    isBookmarkRunning=false;
    isUnmount=false;
    lastVisible=null;
    isFetching=false;

    goToProfileHandler=(username)=>{
        window.location.href=window.location.origin+"/"+username
    }
    
    downloadHandler=(name)=>{
        const storage = initialize.storage();
        const USERID = name.slice(0,28);
        storage.ref("users/"+USERID+"/collections/"+name).getDownloadURL()
        .then(url=>{
            const anchor = document.createElement("a");
            anchor.href=url;
            anchor.target="_blank"
            anchor.click()
        })
        .catch(err=>{
            console.log(err)
        })
    }

    likeHandler=(name)=>{
        if(this.isLikeRunning){
            return 
        }
        this.isLikeRunning=true
        const db = initialize.firestore();
        if(initialize.auth().currentUser){
            let tempArray1=[];
            let temp=[];
            db.doc("users/"+initialize.auth().currentUser.uid).get()
            .then(res=>{
                tempArray1=res.data().likesList;
                temp=res.data().likesList;
                if(tempArray1.includes(name)){
                    tempArray1=tempArray1.filter(el=>el!==name)
                }
                else{
                    tempArray1.push(name)
                }
                db.doc("users/"+initialize.auth().currentUser.uid).set({
                    likesList:tempArray1
                },{merge:true})
                .then(res=>{
                    this.setState({likesList:[...tempArray1]})
                    db.collection("collections").where("imageName","==",name).get()
                    .then(ress=>{
                        ress.forEach(doc=>{
                            if(doc.exists){
                                if(temp<tempArray1){
                                    db.doc("collections/"+doc.id).update({
                                        likes:doc.data().likes+1
                                    })
                                    .then(resss=>{
                                        this.isLikeRunning=false;
                                    })
                                    .catch(err=>{
                                        console.log(err)
                                    })
                                }
                                if(temp>tempArray1){
                                    db.doc("collections/"+doc.id).update({
                                        likes:doc.data().likes-1
                                    })
                                    .then(resss=>{
                                        this.isLikeRunning=false;
                                    })
                                    .catch(err=>{
                                        console.log(err)
                                    })
                                }
                                
                            }
                        })
                    })
                    .catch(err=>{
                        console.log(err)
                    })
                })
                .catch(err=>{
                    console.log(err)
                })
            })
            .catch(err=>{
                console.log(err)
            })
        }
        else{
            this.isLikeRunning=false;
            $("#secret").click()
            $("#secret0").click()
        }
    }

    bookmarkHandler=(name)=>{
        if(this.isBookmarkRunning){
            return 
        }
        this.isBookmarkRunning=true
        const db = initialize.firestore();
        if(initialize.auth().currentUser){
            let tempArray1=[];
            db.doc("users/"+initialize.auth().currentUser.uid).get()
            .then(res=>{
                tempArray1=res.data().bookmarksList;
                if(tempArray1.includes(name)){
                    tempArray1=tempArray1.filter(el=>el!==name)
                }
                else{
                    tempArray1.push(name)
                }
                db.doc("users/"+initialize.auth().currentUser.uid).set({
                    bookmarksList:tempArray1
                },{merge:true})
                .then(res=>{
                    this.isBookmarkRunning=false;
                    this.setState({bookmarksList:[...tempArray1]})
                })
                .catch(err=>{
                    console.log(err)
                })
            })
        }
        else{
            this.isBookmarkRunning=false;
            $("#secret").click()
            $("#secret0").click()
        }
    }

    showImage=(url, title, name, profileUrl, ownername)=>{
        this.setState({popImageTitle:title, popImageUrl:url, popImageName:name, popProfileUrl:profileUrl, popOwnerUsername:ownername})
    }   

    componentDidMount=()=>{
        console.log("object1")
        let speed = 50;
        this.myInterval = setInterval(this.typing ,speed)
        const db = initialize.firestore();
        let temp=[];
        let temp1=[];
        let arr1=[]
        let arr2=[]
        let arr3=[]
        let arr4=[]
        let arr5=[]
        let arr6=[]
        let first =db.collection("collections/").where("isValid","==",true).orderBy("likes","desc").limit(4)
        first.get()
        .then(result1=>{
            result1.forEach(doc=>{
                temp1.push(doc.data().imageName)
            })
            this.lastVisible = result1.docs[result1.docs.length-1]
            return temp1
        })
        .then(resss=>{
            for(let i=0;i<resss.length;i++){
                temp[i]=resss[i].slice(0,28)
                db.collection("collections/").where("imageName","==",resss[i]).get()
                .then(result=>{
                    result.forEach(doc=>{
                        db.doc("users/"+temp[i]).get()
                        .then(res=>{
                            arr1[i]=doc.data().thumbImageUrl
                            arr2[i]=doc.data().imageName
                            arr3[i]=doc.data().imageTitle
                            arr4[i]=res.data().username
                            arr5[i]=res.data().profileUrl
                            arr6[i]=doc.data().likes
                            console.log("object2")
                            if(!this.isUnmount)
                                this.setState({thumbnailcollections:[...arr1], imageName:[...arr2], imageTitle:[...arr3], imageOwnerUsername:[...arr4], imageOwnerProfileUrl:[...arr5], likesCount:[...arr6]})
                        })
                        .catch(err=>{
                            console.log(err)
                        })
                    })
                })
                .catch(err=>{
                    console.log(err)
                })
            }
        })
        .catch(err=>{
            console.log(err)
        })

        initialize.auth().onAuthStateChanged(user=>{
            if(user){
                db.doc("users/"+initialize.auth().currentUser.uid).get()
                .then(res=>{
                    if(!this.isUnmount)
                        this.setState({likesList:res.data().likesList, bookmarksList:res.data().bookmarksList})
                })
                .catch(err=>{
                    console.log(err)
                })
            }
        })
        
        $(window).scroll(()=>{
            if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
                if(!this.isFetching)
                    this.fetchNext()
            }
        });
    }

    fetchNext=()=>{
        this.isFetching=true
        const db = initialize.firestore();
        let temp=[];
        let temp1=[];
        let arr1=[]
        let arr2=[]
        let arr3=[]
        let arr4=[]
        let arr5=[]
        let arr6=[]
        if(!this.lastVisible){
            return
        }
        var next =db.collection("collections/").where("isValid","==",true).orderBy("likes","desc").startAfter(this.lastVisible).limit(4)
        next.get()
        .then(result1=>{
            result1.forEach(doc=>{
                temp1.push(doc.data().imageName)
            })
            this.lastVisible = result1.docs[result1.docs.length-1]
            return temp1
        })
        .then(resss=>{
            for(let i=0;i<resss.length;i++){
                temp[i]=resss[i].slice(0,28)
                db.collection("collections/").where("imageName","==",resss[i]).get()
                .then(result=>{
                    result.forEach(doc=>{
                        db.doc("users/"+temp[i]).get()
                        .then(res=>{
                            arr1[i]=doc.data().thumbImageUrl
                            arr2[i]=doc.data().imageName
                            arr3[i]=doc.data().imageTitle
                            arr4[i]=res.data().username
                            arr5[i]=res.data().profileUrl
                            arr6[i]=doc.data().likes
                            if(resss.length===arr1.filter(Boolean).length)
                            if(!this.isUnmount){
                                this.setState((state)=>({thumbnailcollections:[...state.thumbnailcollections,...arr1], imageName:[...state.imageName,...arr2], imageTitle:[...state.imageTitle,...arr3], imageOwnerUsername:[...state.imageOwnerUsername,...arr4], imageOwnerProfileUrl:[...state.imageOwnerProfileUrl,...arr5], likesCount:[...state.likesCount,...arr6]}),
                                    ()=>{
                                        this.isFetching=false
                                    }
                                )
                            }
                        })
                        .catch(err=>{
                            console.log(err)
                        })
                    })
                })
                .catch(err=>{
                    console.log(err)
                })
            }
        })
        .catch(err=>{
            console.log(err)
        })
    }

    componentWillUnmount(){
        this.isUnmount=true
    }

    typing=()=>{
        let text = "Everyone is photogenic | Let your true colors shine though.";
        if (this.i < text.length) {
            document.getElementById("myText").innerHTML += text.charAt(this.i);
            this.i++;
        }
        else{
            clearInterval(this.myInterval)
        }
    }
    
    render(){
        console.log("render")
        let collectionArray=[]
        let tempLikesCountAltered=[...this.state.likesCount]
        collectionArray = tempLikesCountAltered.map((item, index)=>{
            return(
                <div key={index} className={"col-lg-4 col-md-6 col-sm-12 col-xs-12 my-3"}>
                    <div className={classes.upperMobDiv}>
                        <div>
                            <img src={this.state.imageOwnerProfileUrl[index]} alt="Profile"/> :
                        </div>
                        <span className={classes.username} onClick={()=>this.goToProfileHandler(this.state.imageOwnerUsername[index])}>&nbsp;@{this.state.imageOwnerUsername[index]}</span>
                    </div>
                    <div className={classes.imageOuterDiv}>
                        <div className={classes.imageDiv} data-toggle="modal" data-target="#showImage" onClick={()=>this.showImage(this.state.thumbnailcollections[index], this.state.imageTitle[index], this.state.imageName[index], this.state.imageOwnerProfileUrl[index], this.state.imageOwnerUsername[index])}>
                            <img src={this.state.thumbnailcollections[index]} alt="Profile"/>
                        </div>
                        <div className={classes.heartBook+" "+classes.hoverDiv} >
                            {
                                this.state.likesList.includes(this.state.imageName[index]) ?
                                <IoMdHeart onClick={()=>this.likeHandler(this.state.imageName[index])} className={"hvr-grow "+classes.afterheart} size="30px"/> :
                                <IoMdHeart onClick={()=>this.likeHandler(this.state.imageName[index])} className={"hvr-grow "+classes.beforeheart} size="30px"/>
                            }
                            {
                                this.state.bookmarksList.includes(this.state.imageName[index]) ?
                                <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.imageName[index])} className={"hvr-grow "+classes.afterbookmark} size="30px"/> :
                                <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.imageName[index])} className={"hvr-grow "+classes.beforebookmark} size="30px"/>
                            }
                        </div>
                        <div className={classes.profileDiv+" "+classes.hoverDiv}>
                            <div>
                                <img src={this.state.imageOwnerProfileUrl[index]} alt="Profile"/> :
                            </div>
                            <span className={classes.username} onClick={()=>this.goToProfileHandler(this.state.imageOwnerUsername[index])}>&nbsp;@{this.state.imageOwnerUsername[index]}</span>
                        </div>
                        <IoMdDownload data-toggle="tooltip" title="Download the original image." onClick={()=>this.downloadHandler(this.state.imageName[index])} className={"hvr-hang "+classes.hoverDownload+" "+classes.hoverDiv+" "+classes.download} size="30px"/>
                    </div>
                    <div className={classes.lowerMobDiv}>
                        <div>
                            {
                                this.state.likesList.includes(this.state.imageName[index]) ?
                                <IoMdHeart onClick={()=>this.likeHandler(this.state.imageName[index])} className={"hvr-grow "+classes.afterheart} size="30px"/> :
                                <IoMdHeart onClick={()=>this.likeHandler(this.state.imageName[index])} className={"hvr-grow "+classes.beforeheart} size="30px"/>
                            }
                            {
                                this.state.bookmarksList.includes(this.state.imageName[index]) ?
                                <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.imageName[index])} className={"hvr-grow "+classes.afterbookmark} size="30px"/> :
                                <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.imageName[index])} className={"hvr-grow "+classes.beforebookmark} size="30px"/>
                            }
                        </div>
                        <IoMdDownload  data-toggle="tooltip" title="Download the original image." onClick={()=>this.downloadHandler(this.state.imageName[index])} className={"hvr-hang "+classes.download} size="30px"/>
                    </div>
                </div>
            )
        })
        return (
            <React.Fragment>
                <div className={classe.landingDiv}>
                    <div className={classe.hover}></div>
                    <div className={classe.textDiv}>
                        <h1>Ditto</h1>
                        <div>
                            <p id="myText"></p>
                            <div className={classe.cursor}>.</div>
                        </div>
                    </div>
                    <img className={classe.landingImg} src="https://images.unsplash.com/photo-1590799823377-764df51318d2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" alt="profile"/>
                </div>
                <div className={"container-fluid "+classes.collectionMainDiv}>
                    <div className="row" id="myRow">
                        {collectionArray}
                    </div>
                </div>
                <button id="secret0" data-toggle="modal" data-target="#showImage" style={{opacity:"0"}}></button>
                {/* showImage modal */}
                <div className="modal fade" id="showImage" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.uploadModalDialog}>
                        <div className={"modal-content "+classes.uploadModalContent}>
                            <div className="modal-header">
                                <div className={classes.showImageProfile}>
                                    <div>
                                        <img src={this.state.popProfileUrl} alt="Profile"/> :
                                    </div>
                                    <span className={classes.username} onClick={()=>this.goToProfileHandler(this.state.popOwnerUsername)}>&nbsp;@{this.state.popOwnerUsername}</span>
                                </div>
                                <div type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className={classes.popImageHeader}>
                                    <div>
                                        <h3>{this.state.popImageTitle}</h3>
                                    </div>
                                    <div>
                                        {
                                            this.state.likesList.includes(this.state.popImageName) ?
                                            <IoMdHeart onClick={()=>this.likeHandler(this.state.popImageName)} className={"hvr-grow "+classes.afterheart} size="30px"/> :
                                            <IoMdHeart onClick={()=>this.likeHandler(this.state.popImageName)} className={"hvr-grow "+classes.beforeheart} size="30px"/>
                                        }
                                        &nbsp;
                                        {
                                            this.state.bookmarksList.includes(this.state.popImageName) ?
                                            <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.popImageName)} className={"hvr-grow "+classes.afterbookmark} size="30px"/> :
                                            <BsBookmarks onClick={()=>this.bookmarkHandler(this.state.popImageName)} className={"hvr-grow "+classes.beforebookmark} size="30px"/>
                                        }
                                        &nbsp;
                                        <IoMdDownload data-toggle="tooltip" title="Download the original image." onClick={()=>this.downloadHandler(this.state.popImageName)} className={"hvr-hang "+classes.download} size="30px"/>
                                    </div>
                                </div>
                                <div className={classes.popImageDiv}>
                                    <img src={this.state.popImageUrl} alt="profile"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button id="secret" data-toggle="modal" data-target="#loginModal" style={{opacity:"0"}}></button>
            {/* login modal */}
                <div className="modal fade" id="loginModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.uploadModalDialog}>
                        <div className={"modal-content "+classes.uploadModalContent}>
                            <div type="button" className="close float-right" data-dismiss="modal" aria-label="Close">
                                <span className="p-3 float-right" aria-hidden="true">&times;</span>
                            </div>
                            <div className="container mt-2">
                                <div className="row">
                                    <div className={"col-12 mb-3 "+classes.logoModal}>
                                        <img src={ditto} onClick={this.goToHome} alt="profile"/>
                                    </div>
                                    <h2 className="col-12 text-center mb-3">Login</h2>
                                    <p className="col-12 text-center">To Like or Bookmark this photo, login</p>
                                    <form className="col-lg-8 col-md-12 col-sm-12 m-auto" onSubmit={this.onLoginHandler}>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputEmail1">Email</label>
                                            <input type="email" name="email" value={this.state.email} onChange={this.inputChangeHandlerForLogin} className={"form-control "+classes.loginInputModal} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="exampleInputPassword1">Password</label>
                                            <a className="float-right" href="/forgotpassword">Forgot Password?</a>
                                            <input type="password" name="password" value={this.state.password} onChange={this.inputChangeHandlerForLogin} className={"form-control "+classes.loginInputModal} id="exampleInputPassword1"/>
                                        </div>
                                        <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                                    </form>
                                    <div className="text-center w-100"><span>Don't have an account <a href="/join">Join</a></span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default LandingPage
