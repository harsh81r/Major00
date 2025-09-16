import React from 'react'
import {BrowserRouter,Routes,Route} from'react-router-dom'
import Home from"./pages/Home.jsx"
import EditorPage from'./pages/EditorPage.jsx'
import './App.css';

function App() {
  return (
    
<>


<BrowserRouter>
<Routes>
<Route path='/' element={<Home/>}/>
<Route path='editor/:roomId' element={<EditorPage/>}/>

</Routes>
</BrowserRouter>

</>
  )
}

export default App