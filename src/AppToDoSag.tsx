import React, { useState, useEffect, CSSProperties } from 'react';
import { createActor, backend } from './declarations/backend';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
//import { useAuth } from './use-auth-client';
import { ClipLoader } from 'react-spinners';

interface Todo {
  description: string;
  completed: boolean;
}

const loaderStyle: CSSProperties = {
  margin: '20% auto',
  display: 'block',
};

const AppNew: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [loader, setLoader] = useState(true);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [actor, setActor] = useState<any | null>(backend);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 // const { login, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
          const isLocalNetwork = process.env.DFX_NETWORK == 'local';
    console.log('isLocalNetwork', isLocalNetwork);
      console.log('fetchTodos');
      setLoader(true);
      const response: any = await actor.getTodos();
      console.log(response);
      setTodos(response);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const addTodo = async () => {
    try {
      setLoader(true);
      const response: any = await actor.addTodo(newTodo);
      fetchTodos();
      setNewTodo('');
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const completeTodo = async (id: number) => {
    try {
      setLoader(true);
      await backend.completeTodo(BigInt(id));
      const updatedTodos = todos.map((todo, index) =>
        index === id ? { ...todo, completed: true } : todo,
      );
      setTodos(updatedTodos);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const clearCompleted = async () => {
    try {
      setLoader(true);
      // await fetch('/api/clearCompleted', { method: 'POST' });
      await actor.clearCompleted();
      const updatedTodos = todos.filter((todo) => !todo.completed);
      setTodos(updatedTodos);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const logout = async () => {

    await authClient?.logout();
    // once the user is logged out, update the state
    setIsAuthenticated(false);
  }

  const login = async () => {
    // create an auth client
    console.log(1);
    const authClient = await AuthClient.create();
    console.log('authClient', authClient);
    console.log(2);
    const isLocalNetwork = process.env.DFX_NETWORK == 'local';
    console.log('isLocalNetwork', isLocalNetwork);
    console.log(3);
    const identityProviderUrl = isLocalNetwork ?
        `http://127.0.0.1:8080/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}` :
        'https://identity.ic0.app/';

    console.log(process.env.CANISTER_ID_INTERNET_IDENTITY);
    authClient.login({
      identityProvider: identityProviderUrl,
      onSuccess: async () => {},
    });
    setAuthClient(authClient);

    const identity = await authClient.getIdentity();
    const principal = identity.getPrincipal().toString();

    const agent = new HttpAgent({ identity });
    // Using the interface description of our webapp, we create an actor that we use to call the service methods.
    let actor = createActor("n5pxz-hqaaa-aaaai-qpccq-cai", {
      agent,
    });
    
    setActor(actor);
    setIsAuthenticated(true);
    fetchTodos();
  
  };
  // const updateTodo = async (id: number, text: string) => {
  //   await fetch(`/api/updateTodo/${id}`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ text }),
  //   });
  //   const updatedTodos = todos.map(todo =>
  //     todo.id === id ? { ...todo, text } : todo
  //   );
  //   setTodos(updatedTodos);
  // };

  return (
    <>
      {loader ? (
        <ClipLoader
          cssOverride={loaderStyle}
          size="32px"
          color="blue"
          loading={loader}
        ></ClipLoader>
      ) : (
        <div className="App">
          {!isAuthenticated ? (
            <button onClick={login} id="login">
              Login!
            </button>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
          {isAuthenticated ? (
            <div>
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="New Todo"
              />
              <button onClick={addTodo}>Add Todo</button>
              <ul>
                {todos.map((todo, index) => (
                  <li key={index}>
                    <span
                      onClick={() => completeTodo(index)}
                      style={{
                        textDecoration: todo.completed
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {todo.description}
                    </span>
                  </li>
                ))}
              </ul>
              <button onClick={clearCompleted}>Clear Completed</button>
            </div>
          ) : (
            ''
          )}
        </div>
      )}
    </>
  );
};

export default AppNew;
