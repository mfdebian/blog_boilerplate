const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET /api/authors - Obtener todos los autores
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM authors ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo autores:', error);
    res.status(500).json({ error: 'Error obteniendo autores' });
  }
});

// GET /api/authors/:id - Obtener un autor por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM authors WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo autor:', error);
    res.status(500).json({ error: 'Error obteniendo autor' });
  }
});

// POST /api/authors - Crear un nuevo autor
router.post('/', async (req, res) => {
  const { name, email, bio } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son requeridos' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING *',
      [name, email, bio || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando autor:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error creando autor' });
  }
});

// PUT /api/authors/:id - Actualizar un autor
router.put('/:id', async (req, res) => {
  const { name, email, bio } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE authors SET name = COALESCE($1, name), email = COALESCE($2, email), bio = COALESCE($3, bio) WHERE id = $4 RETURNING *',
      [name, email, bio, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando autor:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error actualizando autor' });
  }
});

// DELETE /api/authors/:id - Eliminar un autor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM authors WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Autor no encontrado' });
    }
    
    res.json({ message: 'Autor eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando autor:', error);
    res.status(500).json({ error: 'Error eliminando autor' });
  }
});

module.exports = router;