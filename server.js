const express = require('express');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const { chapterTranslations } = require('./public/translations');

const app = express();
const port = 3000;

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Загрузка шаблонов
const taskTemplate = fs.readFileSync(path.join(__dirname, 'public', 'task-template.html'), 'utf-8');
const reactTemplate = fs.readFileSync(path.join(__dirname, 'public', 'react-template.html'), 'utf-8');

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Функция для рекурсивного сканирования директории
function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    const tasks = [];

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Проверяем, есть ли в директории файлы с .problem.
            const files = fs.readdirSync(fullPath);
            const problemFile = files.find(f => f.includes('.problem.'));
            
            if (problemFile) {
                // Нашли задание
                try {
                    const filePath = path.join(fullPath, problemFile);
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const relativePath = path.relative(path.join(__dirname, 'src'), filePath);
                    
                    // Получаем имя темы (родительская директория)
                    const pathParts = relativePath.split(path.sep);
                    const chapter = pathParts[0];
                    
                    // Извлекаем название задания (первая строка после "Задание:")
                    const nameMatch = content.match(/Задание:\s*([^\n]*)/);
                    const name = nameMatch ? nameMatch[1].trim() : item;

                    // Извлекаем полное описание задания
                    const descMatch = content.match(/\/\*\s*Задание:[\s\S]*?\*\//) || 
                                    content.match(/<!--\s*Задание:[\s\S]*?-->/) ||
                                    [null, ''];

                    tasks.push({
                        name: name,
                        description: descMatch[0] || '',
                        file: relativePath,
                        chapter: chapter
                    });
                } catch (error) {
                    console.error(`Ошибка чтения файла в ${fullPath}:`, error);
                }
            } else {
                // Если нет файлов с .problem., рекурсивно проверяем поддиректории
                tasks.push(...scanDirectory(fullPath));
            }
        }
    }

    return tasks;
}

// API для получения списка заданий
app.get('/api/tasks', (req, res) => {
    try {
        const srcPath = path.join(__dirname, 'src');
        
        if (!fs.existsSync(srcPath)) {
            console.log('Директория src не найдена');
            return res.json([]);
        }

        // Получаем все задания
        const allTasks = scanDirectory(srcPath);
        console.log('Найдено заданий:', allTasks.length);
        
        // Группируем задания по темам
        const chapters = {};
        allTasks.forEach(task => {
            if (!chapters[task.chapter]) {
                chapters[task.chapter] = {
                    chapter: chapterTranslations[task.chapter] || task.chapter,
                    originalChapter: task.chapter,
                    tasks: []
                };
            }
            chapters[task.chapter].tasks.push({
                name: task.name,
                description: task.description,
                file: task.file
            });
        });

        // Преобразуем объект в массив и сортируем темы по оригинальным названиям
        const result = Object.values(chapters)
            .sort((a, b) => a.originalChapter.localeCompare(b.originalChapter));

        console.log(`Найдено тем: ${result.length}`);
        res.json(result);
    } catch (error) {
        console.error('Ошибка при сканировании заданий:', error);
        res.status(500).json({ error: 'Ошибка при сканировании заданий' });
    }
});

// Маршрут для отображения задания
app.get('/task', (req, res) => {
    const taskPath = req.query.task;
    if (!taskPath) {
        return res.status(400).send('Не указан путь к заданию');
    }

    try {
        const filePath = path.join(__dirname, 'src', taskPath);
        
        // Проверяем существование файла
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('Задание не найдено');
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        // Определяем тип файла
        const isJsFile = taskPath.endsWith('.js');
        const isReactTask = content.includes('React.') || content.includes('ReactDOM.') || content.includes('JSX');

        if (isJsFile) {
            // Для JS файлов создаем HTML обертку
            let modifiedTemplate = reactTemplate;
            
            // Извлекаем комментарии с описанием задания
            const taskMatch = content.match(/\/\*\s*(Задание:[\s\S]*?)\*\//);
            const taskDescription = taskMatch ? taskMatch[1].split('\n')[0].replace('Задание:', '').trim() : '';
            
            // Создаем стили для отображения кода
            const styles = `
                <style>
                    .container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .title {
                        color: red;
                    }
                    .text {
                        color: blue;
                    }
                </style>
            `;

            // Создаем скрипт с кодом задания
            const script = `
                // Код задания
                ${content}

                // Рендерим React элементы
                ReactDOM.render(elements, document.getElementById('root'));
            `;

            modifiedTemplate = modifiedTemplate
                .replace('TASK_STYLES_PLACEHOLDER', styles)
                .replace('TASK_SCRIPT_PLACEHOLDER', script);

            res.setHeader('Content-Type', 'text/html');
            res.send(modifiedTemplate);
        } else if (isReactTask) {
            // Для HTML файлов с React
            const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
            const scriptMatch = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/);

            let modifiedTemplate = reactTemplate;

            if (styleMatch) {
                modifiedTemplate = modifiedTemplate.replace('TASK_STYLES_PLACEHOLDER', `<style>${styleMatch[1]}</style>`);
            } else {
                modifiedTemplate = modifiedTemplate.replace('TASK_STYLES_PLACEHOLDER', '');
            }

            if (scriptMatch) {
                modifiedTemplate = modifiedTemplate.replace('TASK_SCRIPT_PLACEHOLDER', scriptMatch[1]);
            }

            res.setHeader('Content-Type', 'text/html');
            res.send(modifiedTemplate);
        } else {
            // Для остальных файлов отправляем как есть
            res.setHeader('Content-Type', 'text/html');
            res.sendFile(filePath);
        }
    } catch (error) {
        console.error('Ошибка загрузки задания:', error);
        res.status(500).send('Ошибка при загрузке задания');
    }
});

// Маршрут для отображения решения
app.get('/solution', (req, res) => {
    const taskPath = req.query.task;
    if (!taskPath) {
        return res.status(400).send('Не указан путь к заданию');
    }

    try {
        const solutionPath = taskPath.replace('.problem.', '.solution.');
        const filePath = path.join(__dirname, 'src', solutionPath);
        
        // Проверяем существование файла
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('Решение не найдено');
        }

        // Отправляем файл с правильными заголовками
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Ошибка загрузки решения:', error);
        res.status(500).send('Ошибка при загрузке решения');
    }
});

const server = app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

// WebSocket сервер для hot reload
const wss = new WebSocket.Server({ server });
const watcher = chokidar.watch('src/**/*', {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

watcher.on('change', () => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('reload');
        }
    });
}); 