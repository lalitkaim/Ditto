import React from 'react'
import {FaPage4,FaCreativeCommonsZero} from 'react-icons/fa'

function goHome(){
    window.location.href="/"
}

function PageNotFound() {
    const style={
        position:"fixed",
        minHeight:"100%",
        minWidth:"100%",
        top:"0",
        left:"0",
        border:"1px solid #ccc",
        backgroundColor:"#eee",
        zIndex:"-550"
    }
    return (
        <>
            <div className="container text-center mt-4">
                <h1 className="hvr-buzz" style={{fontSize:"5rem"}}>Page Not Found</h1>
                <div className="mt-5">
                    <FaPage4 className="hvr-buzz" size="100px"/>
                    <FaCreativeCommonsZero className="hvr-buzz" size="100px"/>
                    <FaPage4 className="hvr-buzz" size="100px"/>
                </div>
                <button className="btn btn-info mt-5" onClick={goHome}>Ditto</button>
            </div>
            <div style={style}>
            </div>
        </>
    )
}

export default PageNotFound
