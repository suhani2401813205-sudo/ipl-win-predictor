const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/predict', (req, res) => {
    const { team1, team2, venue, toss_winner, toss_decision } = req.body;

    const pythonCmd = process.platform === 'win32' ? 'py' : 'python3';
    const args = [
        path.join(__dirname, 'predict.py'),
        team1, team2, venue, toss_winner, toss_decision
    ];

    const python = spawn(pythonCmd, args);

    let result = '';
    let error = '';

    python.stdout.on('data', (data) => { result += data.toString(); });
    python.stderr.on('data', (data) => { error += data.toString(); });

    python.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: error });
        }
        try {
            const prediction = JSON.parse(result);
            res.json({ success: true, prediction });
        } catch (e) {
            res.status(500).json({ error: 'Parsing error' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});