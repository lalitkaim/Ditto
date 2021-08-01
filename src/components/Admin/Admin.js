import React, { Component } from 'react'
import { initialize } from '../Config/Config'
import classes from './Admin.module.css'
import $ from 'jquery'

class Admin extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             isAdmin:false,
             imageLabelList:[],
             imageTitleList:[],
             imageUrlList:[],
             imageNameList:[],
             usernameList:[],
             profileUrlList:[]
        }
    }

    goToProfileHandler=(username)=>{
        window.location.href=window.location.origin+"/"+username
    }

    showImage=(name)=>{
        const storage = initialize.storage();
        let temp = name.slice(0,28)
        storage.ref("users/"+temp+"/collections/"+name).getDownloadURL()
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

    onAcceptHandler=(name, username)=>{
        let temp = name.slice(0,28);
        const db = initialize.firestore();
        db.collection("collections/").where("imageName","==",name).get()
        .then(res=>{
            res.forEach(doc=>{
                db.doc("collections/"+doc.id).update({
                    isValid:true
                })
                .then(result=>{
                    db.doc("users/"+temp).get()
                    .then(ress=>{
                        this.sendMessageNotification(ress.data().token, username, "Your image is accepted by Ditto.")
                    })
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

    onRejectHandler=(name, username)=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        let temp = name.slice(0,28);
        db.collection("collections/").where("imageName","==",name).get()
        .then(res=>{
            res.forEach(doc=>{
                storage.ref("users/"+temp+"/thumbnailcollections/"+doc.data().imageName).delete()
                .then(ress=>{
                    storage.ref("users/"+temp+"/collections/"+doc.data().imageName).delete()
                    .then(resss=>{
                        db.doc("collections/"+doc.id).delete()
                        .then(ressss=>{
                            db.doc("users/"+temp).get()
                            .then(ress=>{
                                this.sendMessageNotification(ress.data().token, username, "Your image is rejected by Ditto.")
                            })
                            .catch(err=>{
                                console.log(err)
                            })
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
        })
        .catch(err=>{
            console.log(err)
        })
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
                window.location.reload();
            },
            error : function(xhr, status, error) {
                console.log(xhr.error);      
                window.location.reload();
            }
        });
    }

    componentDidMount=()=>{
        initialize.auth().onAuthStateChanged(user=>{
            if(user){
                if(user.uid==="f42CgVzxgHXjXc3E5BF49zglxDX2")
                    this.setState({isAdmin:true})
                else
                    window.location.href="/"
            }
            else{
                window.location.href="/"
            }
        }) 

        const db = initialize.firestore();
        let temp=[];
        let arr1=[]
        let arr2=[]
        let arr3=[]
        let arr4=[]
        let arr5=[]
        let arr6=[]
        let i=0
        db.collection("collections").where("isValid","==",false).get()
        .then(result=>{
            result.forEach(doc=>{
                temp[i]=doc.data().imageName.slice(0,28);
                db.doc("users/"+temp[i]).get()
                .then(resss=>{
                    arr1[i]=doc.data().thumbImageUrl
                    arr2[i]=doc.data().imageName
                    arr3[i]=doc.data().imageTitle
                    arr4[i]=resss.data().username
                    arr5[i]=resss.data().profileUrl
                    arr6[i]=doc.data().label.join(", ")
                    i++;
                    if(!this.isUnmount)
                        this.setState({imageUrlList:[...arr1], imageNameList:[...arr2], imageTitleList:[...arr3], usernameList:[...arr4], profileUrlList:[...arr5], imageLabelList:[...arr6]})
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

    render() {
        let imageList=[]
        imageList=this.state.imageUrlList.map((url, index)=>{
            return(
                <div className="col-lg-4 col-md-6 col-sm-12 mb-3" key={index}>
                    <div className={classes.mainDiv}>
                        <p className="m-0"><b>Title : </b>{this.state.imageTitleList[index]}</p>
                        <p className="m-0 mb-2"><b>Labels : </b>{this.state.imageLabelList[index]}</p>
                        <div className={classes.imageDiv} onClick={()=>this.showImage(this.state.imageNameList[index])}>
                            <img src={url} alt="Image"/>
                            <div className={classes.usernameDiv}>
                                <div>
                                    <img src={this.state.profileUrlList[index]} alt="profile"/>
                                </div>
                                <span onClick={()=>this.goToProfileHandler(this.state.usernameList[index])}>@ {this.state.usernameList[index]}</span>
                            </div>
                        </div>
                        <button className={"btn btn-info "+classes.accept} onClick={()=>this.onAcceptHandler(this.state.imageNameList[index], this.state.usernameList[index])}>Accept</button>
                        <button className={"btn btn-danger "+classes.reject} onClick={()=>this.onRejectHandler(this.state.imageNameList[index], this.state.usernameList[index])}>Reject</button>
                    </div>
                </div>
            )
        })

        if(this.state.isAdmin)
            return (
                <div className="container-fluid mt-3 mb-4">
                    <div className="row">
                        <h3 className="text-center col-12 mb-3">Owner's Authority</h3>
                        {imageList}
                    </div>
                </div>
            )
        else
            return null
    }
}

export default Admin
