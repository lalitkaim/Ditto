import React from 'react'
import classes from './NavSlider.module.css'

function NavSlider() {
    return (
        <div className="container-fluid">
            <div className={classes.navList} id="navList">
                <div>
                    <a href="/result/?q=Nature">Nature</a>
                    <a href="/result/?q=Texture">Texture</a>
                    <a href="/result/?q=Wallpaper">Wallpaper</a>
                    <a href="/result/?q=People">People</a>
                    <a href="/result/?q=Business and Work">Business & Work</a>
                    <a href="/result/?q=Technology">Technology</a>
                    <a href="/result/?q=Animals">Animals</a>
                    <a href="/result/?q=Interiors">Interiors</a>
                    <a href="/result/?q=Architecture">Architecture</a>
                    <a href="/result/?q=Food and Drink">Food & Drink</a>
                    <a href="/result/?q=Athletics">Athletics</a>
                    <a href="/result/?q=Spirituality">Spirituality</a>
                    <a href="/result/?q=Health and Wellness">Health & Wellness</a>
                    <a href="/result/?q=Film">Film</a>
                    <a href="/result/?q=Fashion">Fashion</a>
                    <a href="/result/?q=Arts and Culture">Arts & Culture</a>
                    <a href="/result/?q=History">History</a>
                </div>
            </div>
        </div>
    )
}

export default NavSlider
