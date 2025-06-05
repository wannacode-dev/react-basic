const { useState } = React;

function Counter() {
    const [count, setCount] = useState(0);

    return <div>
        <h1>Счетчик: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Увеличить</button> 
    </div>;
}

function App() {
    return (
        <div>
            <Counter />
            <Counter />
            <Counter />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);