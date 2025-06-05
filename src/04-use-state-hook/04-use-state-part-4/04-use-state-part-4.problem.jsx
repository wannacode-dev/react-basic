/*
    Задание: Использование хука- useState (часть 4)
*/

const { useState } = React;

// Передавайте начальное значение счетчика через пропсы
function Counter() {
    const [count, setCount] = useState(0);
    // Добавьте кнопку которая будет блокировать кнопку увеличить
    // Добавьте кнопку которая будет разблокировать кнопку увеличить
    // Добавьте кнопку которая будет сбрасывать счетчик
    return <div>
        <h1>Счетчик: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Увеличить</button> 
        
    </div>;
}

function App() {
    return (
        <>
            <Counter />
            <Counter />
            <Counter />
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);