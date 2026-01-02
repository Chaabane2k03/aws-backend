// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Built-in JSON parser (replaces body-parser)

// Create a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get a promise-based connection
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database!');
    connection.release();
});

// Endpoint to get details of all tasks
app.get('/allTasks', async (req, res) => {
    try {
        const [rows] = await promisePool.query('SELECT * FROM task');
        console.log('Retrieved tasks:', rows);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to delete a task with a specific ID
app.delete('/task/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const [result] = await promisePool.query('DELETE FROM task WHERE TaskID = ?', [taskId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        console.log('Task deleted successfully');
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to add a new task
app.post('/task', async (req, res) => {
    const { task_name } = req.body;
    
    if (!task_name) {
        return res.status(400).json({ error: 'Task name is required' });
    }
    
    console.log('Received task_name:', task_name);
    
    try {
        const [result] = await promisePool.query('INSERT INTO task(Task) VALUES(?)', [task_name]);
        console.log('Added task successfully');
        res.status(201).json({ 
            message: 'Added task successfully',
            taskId: result.insertId 
        });
    } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});