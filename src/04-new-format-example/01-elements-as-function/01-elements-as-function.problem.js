/*
    Задание: React элементы как функции
    
    Вам нужно создать отдельную функцию для <h1>, <p> и <div>.
    Внутри функции нужно создать элементы для <h1>, <p> и <div>.
    В итоге получиться каждый элемент в отдельной функции.

    Как создать элемент с помощью JSX:
    https://ru.react.dev/reference/react/createElement#creating-an-element-without-jsx
*/

const h1Text = "Привет из React!";
const pText = "Этот текст будет синим";

// TODO: Создайте функцию h1, которая принимает text и возвращает JSX элемент <h1>
function h1(text) {
    return <h1 className="title">{text}</h1>;
}

// TODO: Создайте функцию p, которая принимает text и возвращает JSX элемент <p>
function p(text) {
    return <p className="text">{text}</p>;
}

// TODO: Создайте функцию container, которая принимает h1 и p элементы и возвращает div
function container(h1, p) {
    return <div className="container">{h1}{p}</div>;
}

// Используем функции
const h1Element = h1(h1Text);
const pElement = p(pText);
const elements = container(h1Element, pElement); 