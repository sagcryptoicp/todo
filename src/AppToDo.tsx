import React, { useState, useEffect } from 'react';
import {createActor,  backend } from './declarations/backend';
import {AuthClient} from "@dfinity/auth-client";
import {HttpAgent} from "@dfinity/agent";


interface Todo {
  description: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

   async function fetchTodos() {
      const response : any = await  backend.getTodos();
      console.log(response);
      setTodos(response);
    }


  //create a addTodo function and append the value to the exisitng todos
  const addTodo = async () => {
    await backend.addTodo(newTodo);
    const updatedTodos = [...todos, { description: newTodo, completed: false }];
    setTodos(updatedTodos);
        //clear the input field
    setNewTodo('');
  };


  const completeTodo = async (id: number) => {
    await backend.completeTodo(BigInt(id));
    const updatedTodos = todos.map((todo, index) =>
      index === id ? { ...todo, completed: true } : todo
    );
    setTodos(updatedTodos);
  };

  const clearCompleted = async () => {
    await backend.clearCompleted();
    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos);
  };

  const login = async () => {
    // create an auth client
    const authClient = await AuthClient.create();
    const isLocalNetwork = process.env.DFX_NETWORK == 'local';

    authClient.login({
      identityProvider: "http://127.0.0.1:8080/?canisterId=a4tbr-q4aaa-aaaaa-qaafq-cai",
      onSuccess: async () => {},
    });

    const identity = await authClient.getIdentity();
    const principal = identity.getPrincipal().toString(); 

    const agent = new HttpAgent({ identity });
    let actor = backend;
    // Using the interface description of our webapp, we create an actor that we use to call the service methods.
     actor = createActor("asrmz-lmaaa-aaaaa-qaaeq-cai", {
      agent,
    });
    console.log("getTodos", await actor.getTodos());
     console.log("Authenticated as " + identity.getPrincipal().toString());
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
    <div className="App">   
        <button  onClick={login} id="login">Login!</button>
      <input
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
        placeholder="New Todo"
      />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos && todos.map((todo, index) => (
          <li key={index}>
            <span
              onClick={() => completeTodo(index)}
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            >
              {todo.description}
            </span>
          </li>
        ))}
      </ul>
      <button onClick={clearCompleted}>Clear Completed</button>
    </div>
  );
};

export default App;
