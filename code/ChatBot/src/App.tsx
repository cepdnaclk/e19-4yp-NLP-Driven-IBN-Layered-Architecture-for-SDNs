import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import { IntentProvider } from './contexts/IntentContext'
import ChatPage from './pages/ChatPage'

function App() {
  const [count, setCount] = useState(0)

  return (
  <AuthProvider>
    <ChatProvider>
      <IntentProvider>
        <ChatPage/>
      </IntentProvider>  
    </ChatProvider>  
  </AuthProvider>
  )
}

export default App
