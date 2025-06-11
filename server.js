const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./data.db');

// 查詢資料（根據起訖 yyyy-mm）
app.get('/api/data', (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: '缺少 start 或 end 日期參數' });
    }

    const sql = `
        SELECT * FROM records
        WHERE date >= ? AND date <= ?
        ORDER BY date ASC
    `;
    db.all(sql, [start, end], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: '資料查詢錯誤' });
        }
        res.json(rows);
    });
});

// 新增資料
app.post('/api/data', (req, res) => {
    const { date, value } = req.body;

    if (!date || typeof value !== 'number') {
        return res.status(400).json({ error: '請提供正確的 date（yyyy-mm）和 value（數值）' });
    }

    const sql = `INSERT INTO records (date, value) VALUES (?, ?)`;
    db.run(sql, [date, value], function (err) {
        if (err) {
            return res.status(500).json({ error: '新增資料失敗' });
        }
        res.json({ message: '新增成功', id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`✅ 伺服器運行中：http://localhost:${PORT}`);
});
