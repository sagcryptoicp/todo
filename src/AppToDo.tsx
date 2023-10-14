import React, { useState, useEffect, CSSProperties } from 'react';
import { createActor, backend } from './declarations/backend';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { useAuth } from './use-auth-client';
import { ClipLoader } from 'react-spinners';

interface Todo {
  description: string;
  completed: boolean;
}

const loaderStyle: CSSProperties = {
  margin: '20% auto',
  display: 'block',
};

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [loader, setLoader] = useState(true);
  const { login, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      console.log('fetchTodos');
      setLoader(true);
      const response: any = await backend.getTodos();
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
      const response: any = await backend.addTodo(newTodo);
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
      await backend.clearCompleted();
      const updatedTodos = todos.filter((todo) => !todo.completed);
      setTodos(updatedTodos);
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  const loginOld = async () => {
    // create an auth client
    console.log(1);
    const authClient = await AuthClient.create();
    console.log('authClient', authClient);
    console.log(2);
    const isLocalNetwork = process.env.DFX_NETWORK == 'local';
    console.log(3);
    // const identityProviderUrl = isLocalNetwork ?
    //     `http://127.0.0.1:8080/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}` :
    //     'https://identity.ic0.app/';

    console.log(4);
    authClient.login({
      identityProvider: 'https://identity.ic0.app/',
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      onSuccess: async () => {},
    });
    console.log('hi2222');

    const identity = await authClient.getIdentity();
    const principal = identity.getPrincipal().toString();

    const agent = new HttpAgent({ identity });
    // Using the interface description of our webapp, we create an actor that we use to call the service methods.
    let actor = createActor('bkyz2-fmaaa-aaaaa-qaaaq-cai', {
      agent,
    });
    console.log('getTodos', await actor.getTodos());
    //     const actor = Actor.createActor(idlFactory, {
    //   agent: new HttpAgent({
    //     identity,
    //   }),
    //   canisterId,
    // });
    // let authClient = await AuthClient.create();
    //  console.log("login authClient");
    // // start the login process and wait for it to finish
    //   await new Promise((resolve) => {
    //     authClient.login({
    //         identityProvider: "https://identity.ic0.app",
    //         onSuccess: resolve,
    //     });
    // });
    // console.log("login started");

    // // At this point we're authenticated, and we can get the identity from the auth client:
    // const identity = authClient.getIdentity();
    // // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
    // const agent = new HttpAgent({ identity });
    // // Using the interface description of our webapp, we create an actor that we use to call the service methods.
    // let actor = createActor("bkyz2-fmaaa-aaaaa-qaaaq-cai", {
    //   agent,
    // });

    //console.log("getTodos", await actor.getTodos());
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

export default App;
