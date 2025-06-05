const { useState } = React;

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h1>Счетчик: {count}</h1>
            <button onClick={() => setCount(count + 1)}>Увеличить</button> 
        </div>
    );
}

function App() {
    const [counters, setCounters] = useState([0, 0, 0]);
    return (
        <>
            <button onClick={() => setCounters([...counters, 0])}>Добавить счетчик</button>
            <br />

            {
                counters.map((counter, index) => (
                    <Counter key={index} />
                ))
            }
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);