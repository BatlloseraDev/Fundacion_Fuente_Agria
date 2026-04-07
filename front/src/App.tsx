import {  RouterProvider } from 'react-router';
import { appRouter } from './router/app.router';
import './App.css'
import { UserContextProvider } from './context/userContextProvider';

function App() {
  return (
    <>
     <UserContextProvider>
        <RouterProvider router={appRouter} />
     </UserContextProvider>
    </>
  )
}

export default App
