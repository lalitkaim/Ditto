import React, { Component } from 'react'
import classes from './ResultUsers.module.css'
import { initialize } from '../Config/Config'

class ResultUsers extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             profileUrl:[],
             name:[],
             username:[],
             isResult:true
        }
    }

    goToProfileHandler=(username)=>{
        window.location.href=window.location.origin+"/"+username
    }

    componentDidMount=()=>{
        const db = initialize.firestore();
        const storage = initialize.storage();
        let arr1=[]
        let arr2=[]
        let arr3=[]
        db.collection("users").where("username","<=",this.props.query).get()
        .then(users=>{
            let i=0
            if(users.empty)
                this.setState({isResult:false})
            else
                this.setState({isResult:true})
            users.forEach(user=>{
                arr1[i]=user.data().profileUrl;
                arr2[i]=user.data().firstName+" "+user.data().lastName;
                arr3[i]=user.data().username;
                i++
                this.setState({profileUrl:[...arr1], name:[...arr2], username:[...arr3]})
            })
        })
    }

    render() {
        let users=[]
        users = this.state.profileUrl.map((url, index)=>{
            return (
                    <div key={index} className="col-lg-4 col-md-6 col-sm-12 col-xs-12 my-3">
                        <div className={classes.userMainDiv}>
                            <div>
                                <img src={url} alt="User Image"/>
                            </div>
                            <div>
                                <h3 onClick={()=>this.goToProfileHandler(this.state.username[index])}>{this.state.name[index]}</h3>
                                <p>@ {this.state.username[index]}</p>
                            </div>
                        </div>
                    </div>
            )
        })
        return (
            <div className="container-fluid">
                <div className="row">
                    {
                        this.state.isResult ?
                        users :
                        <h3 className="m-auto">No result found:</h3>
                    }
                </div>
            </div>
        )
    }
}

export default ResultUsers
