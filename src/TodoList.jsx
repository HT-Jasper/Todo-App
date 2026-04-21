import TodoListItem from './TodoListItem.jsx';

export default function TodoList({todoList}) {

    return (
        <ul>
            {todoList.map(todo => (
            <TodoListItem key={todo.id} todo={todo} />
            ))}
        </ul>
    );
}
