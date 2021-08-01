import React, { Component } from 'react'
import classes from './Collection.module.css'
import {IoMdHeart,IoMdDownload} from 'react-icons/io'
import {BsBookmarks} from 'react-icons/bs'
import { initialize } from '../Config/Config'
import ditto from '../../ditto.png'
import $ from 'jquery'

class Collection extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            thumbnailcollections:[],
            collections:[],
            imageName:[],
            likesList:[],
            bookmarksList:[],
            imageTitle:[],
            popImageUrl:'',
            popImageTitle:'',
            popImageName:''
        }
    }

    isLikeRunning=false;
    isBookmarkRunning=false;
    isUnmount=false;

    inputChangeHandlerForLogin=()=>[
        
    ]

    downloadHandler=(name)=>{
        const storage = initialize.storage();
        storage.ref("users/"+this.props.userId+"/collections/"+name).getDownloadURL()
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
            let temp=[];
            db.doc("users/"+initialize.auth().currentUser.uid).get()
            .then(res=>{
                tempArray1=res.data().bookmarksList;
                temp=res.data().bookmarksList;
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
        }
    }
    
    showImage=(url, title, name)=>{
        this.setState({popImageTitle:title, popImageUrl:url, popImageName:name})
    }

    componentDidMount=()=>{
        let temp=[]
        let temp2=[]
        let temp3=[]
        const db = initialize.firestore();
        db.collection("collections/").where("userId","==",this.props.userId).where("isValid","==",true).orderBy("time","desc").get()
        .then(res=>{
            let index=0
            res.forEach(doc=>{
                temp[index]=doc.data().thumbImageUrl;
                temp2[index]=doc.data().imageName;
                temp3[index]=doc.data().imageTitle;
                index++;
                if(!this.isUnmount)
                    this.setState({thumbnailcollections:[...temp], imageName:[...temp2], imageTitle:[...temp3]})
            })
        })
        .catch(err=>{
            console.log(err)
        })
        if(initialize.auth().currentUser){
            db.doc("users/"+initialize.auth().currentUser.uid).get()
            .then(res=>{
                if(!this.isUnmount)
                    this.setState({likesList:res.data().likesList, bookmarksList:res.data().bookmarksList})
            })
            .catch(err=>{
                console.log(err)
            })
        }
    }

    componentWillUnmount=()=>{
        this.isUnmount = true;
    }

    render() {
        let collectionArray = null;
        collectionArray = this.state.thumbnailcollections.map((item, index)=>{
                            return(
                                <div key={index} className={"col-lg-4 col-md-6 col-sm-12 col-xs-12 my-3"}>
                                    <div className={classes.upperMobDiv}>
                                        <div>
                                            <img src={this.props.profileUrl}/> :
                                        </div>
                                        <span className={classes.username}>&nbsp;@{this.props.username}</span>
                                    </div>
                                    <div className={classes.imageOuterDiv}>
                                        <div className={classes.imageDiv}  data-toggle="modal" data-target="#showImage" onClick={()=>this.showImage(item, this.state.imageTitle[index], this.state.imageName[index])}>
                                            <img src={item}/>
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
                                                <img src={this.props.profileUrl}/> :
                                            </div>
                                            <span className={classes.username}>&nbsp;@{this.props.username}</span>
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
                <div className={"container-fluid "+classes.collectionMainDiv}>
                    <div className="row">
                        {collectionArray}
                    </div>
                </div>
                <div className="modal fade" id="showImage" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className={"modal-dialog "+classes.uploadModalDialog}>
                        <div className={"modal-content "+classes.uploadModalContent}>
                            <div className="modal-header">
                                <div className={classes.showImageProfile}>
                                    <div>
                                        <img src={this.props.profileUrl}/> :
                                    </div>
                                    <span className={classes.username}>&nbsp;@{this.props.username}</span>
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
                                    <img src={this.state.popImageUrl} alt="Image"/>
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
                                        <img src={ditto} onClick={this.goToHome} alt="Image"/>
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

export default Collection
