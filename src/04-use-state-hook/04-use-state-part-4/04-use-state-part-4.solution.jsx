const { useState } = React;

function Counter({ initialCount }) {
    const [count, setCount] = useState(initialCount);
    const [isDisabled, setIsDisabled] = useState(false);

    return <div>
        <h1>Счетчик: {count}</h1>
        <button onClick={() => setCount(count + 1)} disabled={isDisabled}>Увеличить</button> 
        <button onClick={() => setCount(count + 2)} disabled={isDisabled}>Увеличить на 2</button>
        <button onClick={() => setCount(count * 2)} disabled={isDisabled}>Умножить на 2</button>
        <button onClick={() => setIsDisabled(!isDisabled)}>Блокировать/Разблокировать</button>
        <button onClick={() => setCount(0)}>Сбросить</button>
    </div>;
}

function App() {
    return (
        <>
            <Counter initialCount={1} />
            <Counter initialCount={2} />
            <Counter initialCount={3} />
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);