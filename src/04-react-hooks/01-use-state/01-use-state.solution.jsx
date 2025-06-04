/*
    Задание: Использование хука- useState
*/

const { useState } = React;

function App() {
    const [count, setCount] = useState(0);

    return <div>
        <h1>Счетчик: {count}</h1>
        <button onClick={() => setCount(count + 1)}>Увеличить</button> 
    </div>;
}

ReactDOM.render(<App />, document.getElementById('root'));