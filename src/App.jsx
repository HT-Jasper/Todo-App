import TodoList from './TodoList.jsx';
import TodoForm from './TodoForm.jsx';
import './App.css'
import { useState } from 'react';

export default function App() {
  const [todoList, setTodoList] = useState([])

  function addTodo (todoTitle){
  const newTodo = {id: Date.now(), title: todoTitle};
  setTodoList((prev => [newTodo, ...prev]))
}

  return (
    <div>
        <h1>Todo List</h1>
        <TodoForm onAddTodo={addTodo} />
        <TodoList todoList={todoList} />       
    </div>
  )
}

