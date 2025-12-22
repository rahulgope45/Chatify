import './App.css'
import Navbar from './components/Navbar'
import {Routes, Route, useNavigate, Navigate} from "react-router-dom"
import Home from './pages/Home'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import {Loader} from 'lucide-react'

function App() {
   const {authUser, checkAuth, isCheckingAuth } = useAuthStore();
   const navigate = useNavigate();
  //Checking user logged in in every refresh 
  useEffect(() => {
  checkAuth()
}, []);

  console.log({authUser});

  if(isCheckingAuth && !authUser){
    return(
      <div className='flex items-center justify-center h-screen '>
       <Loader className= "size-10 animate-spin " />
     </div>
    )
     
  }

  return (
    <>
    <Navbar/>
    <Routes>
     <Route  path='/' element={authUser ? <Home/> : <Navigate to='/login' /> }/>
     <Route  path='/signin' element={<SignupPage/>}/>
     <Route  path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/"/>}/>
     <Route  path='/profile' element={ authUser ? <ProfilePage/> : <Navigate to='/login' />}/>
     <Route  path='/settings' element={<SettingsPage/>}/>
    </Routes>
      
    </>
  )
}

export default App
