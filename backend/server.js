const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, identifier, password, disabilityType } = req.body;

    if (!fullName || !identifier || !password || !disabilityType) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE identifier = ?',
      [identifier]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (full_name, identifier, password_hash, disability_type) VALUES (?, ?, ?, ?)',
      [fullName, identifier, hash, disabilityType]
    );

    return res.status(201).json({
      message: 'Usuario creado',
      user: { id: result.insertId, fullName, identifier, disabilityType },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE identifier = ?',
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json({
      message: 'Login correcto',
      user: {
        id: user.id,
        fullName: user.full_name,
        identifier: user.identifier,
        disabilityType: user.disability_type,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
