const sqlite3 = require('sqlite3').verbose();
const ExcelJS = require('exceljs');

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erreur lors de l’ouverture de la base de données', err);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

async function createTables() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        console.log('Début de la création des tables...');
        // Supprimer et créer la table adherents
       db.run(`DROP TABLE IF EXISTS adherents`, (err) => {
          if (err) {
            console.error('Erreur lors de la suppression de la table adherents', err);
            reject(err);
          } else {
            console.log('Table adherents supprimée.');
            db.run(`
              CREATE TABLE IF NOT EXISTS adherents (
                id INTEGER PRIMARY KEY,
                boolage TEXT,
                prenom TEXT,
                nom TEXT,
                email TEXT,
                datenaissance DATE,
                categorie TEXT,
                sexe TEXT,
                statut_paiement TEXT
              );
            `, (err) => {
              if (err) {
                console.error('Erreur lors de la création de la table adherents', err);
                reject(err);
              } else {
                console.log('Table adherents créée.');
                resolve();
              }
            });
          }
        });
      // Supprimer et créer la table administrateurs
      db.run(`DROP TABLE IF EXISTS administrateurs`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table administrateurs supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS administrateurs (
              id INTEGER PRIMARY KEY,
              prenom TEXT,
              nom TEXT,
              email TEXT,
              droits TEXT
            );
          `, (err) => {
              if (err) {
                console.error('Erreur lors de la création de la table adherents', err);
                reject(err);
              } else {
                console.log('Table administrateur créée.');
                resolve();
              }
            });
          }
      });

      // Supprimer et créer la table entraineurs
      db.run(`DROP TABLE IF EXISTS entraineurs`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table entraineurs supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS entraineurs (
              id INTEGER PRIMARY KEY,
              nom TEXT,
              prenom TEXT,
              email TEXT,
              listedecours TEXT
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table entraineurs créée.');
          });
        }
      });

      // Supprimer et créer la table evenements
      db.run(`DROP TABLE IF EXISTS evenements`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table evenements supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS evenements (
              id INTEGER PRIMARY KEY,
              nom TEXT,
              date date,
              categorie TEXT,
              sexe TEXT,
              description TEXT,
              cout INTEGER
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table evenements créée.');
          });
        }
      });

      // Supprimer et créer la table cours
      db.run(`DROP TABLE IF EXISTS cours`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table cours supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS cours (
            id INTEGER PRIMARY KEY,
            categorie TEXT,
            sexe TEXT,
            description TEXT,
            entraineur_id INTEGER,
            maxparticip INTEGER,
            date_cours INTEGER,
            FOREIGN KEY (entraineur_id) REFERENCES entraineurs(id)
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table cours créée.');
          });
        }
      });

      // Supprimer et créer la table participants_externes
      db.run(`DROP TABLE IF EXISTS participants_externes`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table participants_externes supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS participants_externes (
              id INTEGER PRIMARY KEY,
              prenom TEXT,
              nom TEXT,
              email TEXT,
              evenement_id INTEGER,
              FOREIGN KEY (evenement_id) REFERENCES evenements(id)
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table participants_externes créée.');
          });
        }
      });

      // Supprimer et créer la table inscriptions_cours
      db.run(`DROP TABLE IF EXISTS inscriptions_cours`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table inscriptions_cours supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS inscriptions_cours (
              id INTEGER PRIMARY KEY,
              adherent_id INTEGER,
              cours_id INTEGER,
              FOREIGN KEY (adherent_id) REFERENCES adherents(id),
              FOREIGN KEY (cours_id) REFERENCES cours(id)
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table inscriptions_cours créée.');
          });
        }
      });

      // Supprimer et créer la table inscriptions_evenements
      db.run(`DROP TABLE IF EXISTS inscriptions_evenements`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table inscriptions_evenements supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS inscriptions_evenements (
              id INTEGER PRIMARY KEY,
              adherent_id INTEGER,
              evenement_id INTEGER,
              FOREIGN KEY (adherent_id) REFERENCES adherents(id),
              FOREIGN KEY (evenement_id) REFERENCES evenements(id)
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table inscriptions_evenements créée.');
          });
        }
      });

      // Supprimer et créer la table paiements
      db.run(`DROP TABLE IF EXISTS paiements`, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Table paiements supprimée.');
          db.run(`
            CREATE TABLE IF NOT EXISTS paiements (
              id INTEGER PRIMARY KEY,
              adherent_id INTEGER,
              adherent BOOLEAN,
              type VARCHAR(10),
              montant INTEGER,
              date TEXT,
              methode TEXT,
              FOREIGN KEY (adherent_id) REFERENCES adherents(id)
            );
          `, (err) => {
            if (err) reject(err);
            else console.log('Table paiements créée.');
            resolve(); // Resolve the promise after all CREATE TABLE statements
          });
        }
      });
    });
  });
}

async function importTable(sheetName, tableName, columns) {
    console.log(`Début de l'importation des données pour la feuille ${sheetName} vers la table ${tableName}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./src/club_data_modified.xlsx');
    const sheet = workbook.getWorksheet(sheetName);
  
    if (sheet) {
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Ignorer l'en-tête
          const values = row.values.slice(1, columns.length + 1); // Assurez-vous que cela commence à 1 pour correspondre à votre structure de données
          if (values.length === columns.length) {
            const placeholders = new Array(values.length).fill('?').join(', ');
            const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            db.run(sql, values, (err) => {
              if (err) {
                console.error(`Erreur lors de l'insertion dans ${tableName} à la ligne ${rowNumber}:`, err);
              } else {
                console.log(`Insertion réussie pour la ligne ${rowNumber} dans ${tableName}`);
              }
            });
          } else {
            console.error(`Ligne ${rowNumber} a seulement ${values.length} valeurs, ${columns.length} attendues.`);
          }
        }
      });
    } else {
      console.log(`Feuille ${sheetName} introuvable`);
    }
  
    // Ajouter une requête SELECT pour vérifier les données insérées
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        console.error(`Erreur lors de la sélection des données de ${tableName}:`, err);
      } else {
        console.log(`Données insérées dans ${tableName}:`, rows);
      }
    });
  }
  
  async function importAllTables() {
    console.log('Début de l\'importation des tables...');
    await createTables();
    console.log('Création des tables terminée. Début de l\'importation des données...');
  
    await importTable('Adherents', 'adherents', [
      'id', 'boolage', 'prenom', 'nom', 'email', 'datenaissance', 'categorie', 'sexe', 'statut_paiement'
    ]);

    await importTable('Administrateurs', 'administrateurs', [
      'id', 'prenom', 'nom', 'email', 'droits'
  ]);
  
  await importTable('Entraineurs', 'entraineurs', [
      'id', 'nom', 'prenom', 'email', 'listedecours'
  ]);
  
  await importTable('Evenements', 'evenements', [
      'id', 'nom', 'date', 'categorie', 'sexe', 'description', 'cout'
  ]);
  
  await importTable('Cours', 'cours', [
    'id', 'categorie', 'sexe', 'description', 'entraineur_id', 'maxparticip','date_cours'
  ]);
  
  await importTable('ParticipantsExternes', 'participants_externes', [
      'id', 'nom', 'prenom', 'email', 'evenement_id'
  ]);
  
  await importTable('InscriptionCours', 'inscriptions_cours', [
      'id', 'adherent_id', 'cours_id'
  ]);
  
  await importTable('InscriptionEvenements', 'inscriptions_evenements', [
      'id', 'adherent_id', 'evenement_id'
  ]);
  
  await importTable('Paiements', 'paiements', [
      'id', 'adherent_id', 'adherent', 'type', 'montant', 'date', 'methode'
  ]);
  
 }

importAllTables().then(() => {
    console.log('Importation des tables terminée.');
    db.close((err) => {
      if (err) {
        console.error('Erreur lors de la fermeture de la base de données', err);
      } else {
        console.log('Connexion à la base de données fermée.');
      }
    });
  }).catch(err => {
    console.error('Erreur lors de l’importation des tables:', err);
    db.close();
  });
