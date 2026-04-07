import {  RouterProvider } from 'react-router';
import { appRouter } from './router/app.router';
import './App.css'
import { UserContextProvider } from './context/userContextProvider';
import { EditorContextProvider } from './context/editorContextProvider';

// A modo de testeo he puesto esto

function App() {
  return (
    <>
     <UserContextProvider>
      <EditorContextProvider>
        <RouterProvider router={appRouter} />
      </EditorContextProvider>
     </UserContextProvider>
    </>
  )
}

export default App
