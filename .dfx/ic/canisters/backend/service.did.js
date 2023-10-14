export const idlFactory = ({ IDL }) => {
  const ToDo = IDL.Record({ 'completed' : IDL.Bool, 'description' : IDL.Text });
  const Backend = IDL.Service({
    'addTodo' : IDL.Func([IDL.Text], [IDL.Nat], []),
    'clearCompleted' : IDL.Func([], [], []),
    'completeTodo' : IDL.Func([IDL.Nat], [], []),
    'getTodos' : IDL.Func([], [IDL.Vec(ToDo)], ['query']),
  });
  return Backend;
};
export const init = ({ IDL }) => { return []; };
