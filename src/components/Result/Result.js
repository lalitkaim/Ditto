import React, { Component } from 'react'
import Navigation from '../Navigation/Navigation'
import {MdPhotoLibrary} from 'react-icons/md'
import {FaUsers} from 'react-icons/fa'
import classes from "./Result.module.css";
import ResultPhotos from '../ResultPhotos/ResultPhotos';
import ResultUsers from '../ResultUsers/ResultUsers';

class Result extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
             query:'',
             isUsers:false,
             isPhotos:false
        }
    }

    query=''

    showPhotosHandler=()=>{
        const collection = document.getElementById("collection");
        const bookmark = document.getElementById("bookmark");
        collection.style.borderBottom="4px solid #535353";
        collection.style.borderTop="4px solid #fff";
        bookmark.style.color="#818181"
        collection.style.color="#000000"
        bookmark.style.borderBottom="none";
        bookmark.style.borderTop="none";
        this.setState({isPhotos:true,isUsers:false})
    }
    showUsersHandler=()=>{
        const collection = document.getElementById("collection");
        const bookmark = document.getElementById("bookmark");
        collection.style.borderBottom="none";
        collection.style.borderTop="none";
        collection.style.color="#818181"
        bookmark.style.color="#000000"
        bookmark.style.borderBottom="4px solid #535353";
        bookmark.style.borderTop="4px solid #fff";
        this.setState({isPhotos:false,isUsers:true})
    }

    componentDidMount=()=>{
        const collection = document.getElementById("collection");
        const bookmark = document.getElementById("bookmark");
        collection.style.borderBottom="4px solid #535353";
        collection.style.borderTop="4px solid #fff";
        bookmark.style.color="#818181"
        collection.style.color="#000000"
        bookmark.style.borderBottom="none";
        bookmark.style.borderTop="none";
        this.setState({isPhotos:true,isUsers:false})
        
    }

    render() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.query = urlParams.get('q')
        return (
            <React.Fragment>
                <Navigation query={this.query}/>
                <div className={"container-fluid "+classes.listDiv}>
                    <div id="collection" onClick={this.showPhotosHandler}>
                        <MdPhotoLibrary className="hvr-grow" size="20px"/>&nbsp;Photos
                    </div>
                    <div id="bookmark" onClick={this.showUsersHandler}>
                        <FaUsers className="hvr-grow" size="20px"/>&nbsp;Users
                    </div>
                </div>
                {this.state.isPhotos ? <ResultPhotos query={this.query}/> : null}
                {this.state.isUsers ? <ResultUsers query={this.query}/> : null}
            </React.Fragment>
        )
    }
}

export default Result
