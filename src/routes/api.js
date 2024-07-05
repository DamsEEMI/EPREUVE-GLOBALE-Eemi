const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database.sqlite');

// Route pour récupérer les données des adhérents
router.get('/adherents', (req, res) => {
  const query = 'SELECT categorie, sexe, COUNT(*) as count FROM adherents GROUP BY categorie, sexe';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Route pour récupérer les montants des événements et abonnements
router.get('/montants', (req, res) => {
  const query = 'SELECT type, SUM(montant) as total FROM paiements GROUP BY type';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Route pour récupérer les cours
router.get('/cours', (req, res) => {
  const query = 'SELECT * FROM cours';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Route pour récupérer les paiements
router.get('/paiements', (req, res) => {
  const query = 'SELECT date, montant FROM paiements ORDER BY date';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Route pour récupérer les inscriptions aux événements
router.get('/inscriptions_evenements', (req, res) => {
  const query = 'SELECT evenement_id FROM inscriptions_evenements';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

router.get('/adherents_cours', (req, res) => {
    const query = `
      SELECT adherents.categorie, COUNT(inscriptions_cours.id) AS nombre_de_cours, COUNT(adherents.id) AS nombre_d_adherents
      FROM adherents
      LEFT JOIN inscriptions_cours ON adherents.id = inscriptions_cours.adherent_id
      GROUP BY adherents.categorie
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des adhérents et cours:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log('Données pour adhérents_cours:', rows);
      res.json({ data: rows });
    });
  });
  

module.exports = router;
