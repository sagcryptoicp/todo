import React, { useState, useEffect, CSSProperties } from 'react';
import { backend } from './declarations/backend';
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
  const [loader, setLoader] = useState(false);
  const [actor, setActor] = useState<any | null>(backend);
  
  useEffect(() => {
   fetchTodos()
  }, []);

  const fetchTodos = async () => {
   
    try{
    setLoader(true);
    const todos = await actor.getTodos();
    console.log("todos  ", todos);
    setTodos(todos);
    setLoader(false);
    } 
    catch(e){
      console.error(e);
    }

  }

  const addTodo = async () => {
    try{
      setLoader(true);
      await actor.addTodo(newTodo);
      setNewTodo('');
      fetchTodos();
    }
    catch(e){
      console.error(e);
    }
  };

  const completeTodo = async (index: number) => {
    try{
      setLoader(true);
      await actor.completedById(index);
      fetchTodos();
    }
    catch(e){
      console.error(e);
    }
  }

  const clearCompleted = async () => {
    try{
      setLoader(true);
      await actor.clearCompleted();
      fetchTodos();
    }
    catch(e){
      console.error(e);
    }
  }


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
            <div>
              <input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="New Todo"
              />
              <button onClick={addTodo} >Add Todo</button>
              <ul>
                {todos.map((todo, index) => (
                    <li key={index}>
                    <span  onClick={() => completeTodo(index)} 
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
          
        </div>
      )}
    </>
  );
};

export default AppNew;
