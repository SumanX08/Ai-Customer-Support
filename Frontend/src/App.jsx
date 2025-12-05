import { Route, Routes } from "react-router-dom"
import LoginPage from "./Pages/LoginPage"
import SignupPage from "./Pages/SignupPage"
import ChatPage from "./Pages/ChatPage"
import Dashboard from "./Pages/Dashboard"
import ProtectedRoute from "./Components/ProtectedRoute.jsx"



function App() {

  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<SignupPage/>}/>
      <Route path="/" element={<ProtectedRoute><ChatPage/></ProtectedRoute>}/>
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
    </Routes> 
  )
}

export default App
