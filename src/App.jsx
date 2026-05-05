import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import './App.css'
import { useState } from 'react';

export default function App() {
  const [todoList, setTodoList] = useState([])

  function addTodo (todoTitle){
  const newTodo = {id: Date.now(), title: todoTitle, isCompleted: false};
  setTodoList((prev => [newTodo, ...prev]))
  }

  function completeTodo(id) {
    setTodoList(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, isCompleted: true } : todo
      )
    );
  }

  return (
    <div>
        <h1>Todo List</h1>
        <TodoForm onAddTodo={addTodo} />
        <TodoList todoList={todoList}  onCompleteTodo={completeTodo}/>       
    </div>
  )
}

