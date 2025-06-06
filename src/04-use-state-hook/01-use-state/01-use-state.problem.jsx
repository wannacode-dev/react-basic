/*
    Задание: Использование хука- useState
*/

const { useState } = React;

function App() {
    // Добавьте хук useState для создания переменной count
    // Инициализируйте ее значением 0
    // Добавьте функцию setCount для обновления значения count
    // const [переменная, функция для обновления переменной] = useState(значение);

    return <div>
        {/* Добавьте текст, который будет отображать значение: "Счетчик: 0" */}
        <h1>Счетчик</h1>
        {/* Добавьте кнопку, которая будет увеличивать значение count на 1 */}
        <button>Увеличить</button> 
    </div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);