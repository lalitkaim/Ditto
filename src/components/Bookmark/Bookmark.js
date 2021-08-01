import React, { Component } from 'react'
import classes from '../Collection/Collection.module.css'
import {IoMdHeart,IoMdDownload} from 'react-icons/io'
import {BsBookmarks} from 'react-icons/bs'
import { initialize } from '../Config/Config'
import $ from 'jquery'

class Bookmark extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             thumbnailcollections:[],
             likesList:[],
             bookmarksList:[],
             imageName:[],
             imageTitle:[],
             imageOwnerUsername:[],
             imageOwnerProfileUrl:[],
             popImageTitle:'',
             popImageUrl:'',
             popImageName:'',
             popProfileUrl:'',
             popOwnerUsername:''
        }
    }

    isUnmount=false

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
        }
    }

    showImage=(url, title, name, profileUrl, ownername)=>{
        this.setState({popImageTitle:title, popImageUrl:url, popImageName:name, popProfileUrl:profileUrl, popOwnerUsername:ownername})
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        if(initialize.auth().currentUser){
            db.doc("users/"+initialize.auth().currentUser.uid).get()
            .then(res=>{
                return res.data().bookmarksList
            })
            .then(ress=>{
                let temp=[];
                let arr1=[]
                let arr2=[]
                let arr3=[]
                let arr4=[]
                let arr5=[]
                for(let i=0;i<ress.length;i++){
                    temp[i]=ress[i].slice(0,28);
                        db.collection("collections").where("isValid","==",true).where("imageName","==",ress[i]).get()
                        .then(result=>{
                            result.forEach(doc=>{
                                db.doc("users/"+temp[i]).get()
                                .then(resss=>{
                                    arr1[i]=doc.data().thumbImageUrl
                                    arr2[i]=ress[i]
                                    arr3[i]=doc.data().imageTitle
                                    arr4[i]=resss.data().username
                                    arr5[i]=resss.data().profileUrl
                                    if(!this.isUnmount)
                                        this.setState({thumbnailcollections:[...arr1], imageName:[...arr2], imageTitle:[...arr3], imageOwnerUsername:[...arr4], imageOwnerProfileUrl:[...arr5]})
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
        if(initialize.auth().currentUser){
            if(initialize.auth().currentUser.uid!==this.props.userId){
                return <div>Private</div>
            }
        }
        else{
            return <div>Private1</div>
        }
        let collectionArray = null;
        collectionArray = this.state.thumbnailcollections.map((item, index)=>{
                            return(
                                <div key={index} className={"col-lg-4 col-md-6 col-sm-12 col-xs-12 my-3"}>
                                    <div className={classes.upperMobDiv}>
                                        <div>
                                            <img src={this.state.imageOwnerProfileUrl[index]}/> :
                                        </div>
                                        <span className={classes.username} onClick={()=>this.goToProfileHandler(this.state.imageOwnerUsername[index])}>&nbsp;@{this.state.imageOwnerUsername[index]}</span>
                                    </div>
                                    <div className={classes.imageOuterDiv}>
                                        <div className={classes.imageDiv} data-toggle="modal" data-target="#showImage" onClick={()=>this.showImage(item, this.state.imageTitle[index], this.state.imageName[index], this.state.imageOwnerProfileUrl[index], this.state.imageOwnerUsername[index])}>
                                            <img src={item}/>
                                        </div>
                                        <div className={classes.heartBook+" "+classes.hoverDiv}>
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
                                                <img src={this.state.imageOwnerProfileUrl[index]}/> :
                                            </div>
                                            <span className={classes.username} onClick={()=>this.goToProfileHandler(this.state.imageOwnerUsername[index])}>&nbsp;@{this.state.imageOwnerUsername[index]}</span>
                                        </div>
                                        <IoMdDownload data-toggle="tooltip" title="Download the original image." onClick={()=>this.downloadHandler(this.state.imageName[index])} className={"hvr-hang "+classes.hoverDownload+" "+classes.hoverDiv} size="30px"/>
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
            <>
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
                                        <img src={this.state.popProfileUrl}/> :
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
                                    <img src={this.state.popImageUrl} alt="Image"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default Bookmark
