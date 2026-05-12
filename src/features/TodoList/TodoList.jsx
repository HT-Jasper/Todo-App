import TodoListItem from './TodoListItem.jsx';

export default function TodoList({ todoList, onCompleteTodo }) {
   const filteredTodoList = todoList.filter(todo => !todo.isCompleted);

    return (
        filteredTodoList.length === 0 
        ? <p>Add todo above to get started</p> 
        :<ul>
            {filteredTodoList.map(todo => (
            <TodoListItem key={todo.id} todo={todo} onCompleteTodo={onCompleteTodo} />
            ))}
        </ul>
    );
}
