import Map "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class Backend() {
  
  type ToDo = {
    description: Text;
    completed: Bool;
  };

  func natHash(n : Nat) : Hash.Hash { 
    Text.hash(Nat.toText(n))
  };

  stable var entries : [(Nat, ToDo)] = [];
  var todos = Map.fromIter<Nat, ToDo>(entries.vals(), 10, Nat.equal, natHash);
  stable var nextId : Nat = 0;

  public query(msg) func getTodos() : async [ToDo] {
     Debug.print("Adding todo3:  " # Principal.toText(msg.caller));
    Iter.toArray(todos.vals());
  };

  // Returns the ID that was given to the ToDo item
  public shared(msg) func addTodo(description : Text) : async Nat {
    Debug.print("Adding todo3:  " # Principal.toText(msg.caller));
    let id = nextId;
    todos.put(id, { description = description; completed = false });
    nextId += 1;
    id
  };

  public func completeTodo(id : Nat) : async () {
    ignore do ? {
      let description = todos.get(id)!.description;
      todos.put(id, { description; completed = true });
    }
  };

  public func clearCompleted() : async () {
    todos := Map.mapFilter<Nat, ToDo, ToDo>(todos, Nat.equal, natHash, 
              func(_, todo) { if (todo.completed) null else ?todo });
  };

  system func preupgrade() {
    entries := Iter.toArray(todos.entries());
  };

  system func postupgrade() {
    entries := [];
  };
};
