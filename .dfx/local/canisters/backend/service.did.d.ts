import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Backend {
  'addTodo' : ActorMethod<[string], bigint>,
  'clearCompleted' : ActorMethod<[], undefined>,
  'completeTodo' : ActorMethod<[bigint], undefined>,
  'getTodos' : ActorMethod<[], Array<ToDo>>,
}
export interface ToDo { 'completed' : boolean, 'description' : string }
export interface _SERVICE extends Backend {}
