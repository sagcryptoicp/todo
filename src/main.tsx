import React from 'react';
import ReactDOM from 'react-dom/client';
import AppNew from './AppToDoSag';
import './indexToDo.scss';
import { AuthProvider } from './use-auth-client';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AppNew />
    </AuthProvider>
  </React.StrictMode>,
);
