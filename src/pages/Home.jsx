// import React from 'react'
import { useState} from 'react';
import{v4 as uuidV4} from 'uuid';
// import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react'; // Import useEffect


function Home() {

  const navigate =useNavigate();
  

  const [roomId,setRoomId]=useState('');
  const[username,setUserName]=useState('');

  // Effect to set video playback rate
  useEffect(() => {
    const video = document.getElementById('background-video');
    if (video) {
      video.playbackRate = 0.5; // Set speed to half
    }
  }, []); // Empty dependency array means this runs once on mount


  const createNewRoom=(e)=>{
    e.preventDefault();
    const id=uuidV4();
    setRoomId(id)
    toast.success("Created a New Room");
    // console.log(id);
    


  }
  
const joinRoom = () =>{
  if(!roomId||!username){
    toast.error('Room id and username is required!')
    return;

  }


  //navigate redireact to the room

  navigate(`/Editor/${
    roomId
  }`,{
    state:{
    username,
    }})



}

const handleInputEnter=(e)=>{

  // console.log('event',e.code);
  if(e.code ==='Enter'){

    joinRoom();


  }

}

  
  return (

    <div className="homePageWrapper">
      <video autoPlay loop muted id="background-video" className="home-background-video">
        <source src="https://videos.pexels.com/video-files/3129576/3129576-hd_1920_1080_30fps.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="formWrapper">
<img src='/critic00.png' alt="logo" className="homePageLogo"/>
<h4 className="mainLabel"> Paste invitation ROOM ID


</h4>

<div className="inputGroup">
  <input type="text " placeholder="ROOM ID" value={roomId} onChange={(e)=>{setRoomId(e.target.value)}}  onKeyUp={handleInputEnter} className="inputBox"/>

 <input type="text " placeholder="USERNAME"  value={username} onChange={(e)=>{setUserName(e.target.value)}} onKeyUp={handleInputEnter} className="inputBox"/>

 <button className="btn joinBtn" onClick={joinRoom}>
Join
 </button>
 <span className="createInfo">
  if you don't have an invite then create &nbsp;
  <a onClick={createNewRoom} href="" className="createNewBtn">
    newroom
  </a>
 </span>

      </div>
      </div>


    <footer><h4> Build with &nbsp;by &nbsp;<a href="https://github.com/harsh81r">


      Harsh khare</a></h4></footer>

    </div>


  )
}

export default Home