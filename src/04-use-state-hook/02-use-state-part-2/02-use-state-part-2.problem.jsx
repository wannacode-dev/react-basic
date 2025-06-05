/*
    Задание: Использование хука- useState (часть 2)
*/

const { useState } = React;

function App() {
    // Вам нужно вынести логику счетчика в отдельный компонент <Counter />
    const [count, setCount] = useState(0);

    // Из компонента вам нужно вернуть 3 счетчика
    return <div>
        <h1>Счетчик: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Увеличить</button> 
    </div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);