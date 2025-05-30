const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Initialize the SQLite database
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'training_programs.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database at:', dbPath);
      createTables().then(resolve).catch(reject);
    });
  });
}

/**
 * Create necessary database tables
 */
function createTables() {
  return new Promise((resolve, reject) => {
    const queries = [
      // Training Programs table
      `CREATE TABLE IF NOT EXISTS training_programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`,
      
      // Training Modules table
      `CREATE TABLE IF NOT EXISTS training_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        content TEXT,
        duration_minutes INTEGER DEFAULT 0,
        is_required BOOLEAN DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES training_programs (id)
      )`,
      
      // Employees table
      `CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        hire_date DATE,
        department TEXT,
        position TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Training Progress table
      `CREATE TABLE IF NOT EXISTS training_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        module_id INTEGER,
        program_id INTEGER,
        status TEXT DEFAULT 'not_started',
        started_date DATETIME,
        completed_date DATETIME,
        score REAL,
        attempts INTEGER DEFAULT 0,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (module_id) REFERENCES training_modules (id),
        FOREIGN KEY (program_id) REFERENCES training_programs (id)
      )`
    ];

    let completed = 0;
    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === queries.length) {
          console.log('All database tables created successfully');
          resolve();
        }
      });
    });
  });
}

/**
 * Create a new training program
 */
function createTrainingProgram(programData) {
  return new Promise((resolve, reject) => {
    const { name, description } = programData;
    
    db.run(
      'INSERT INTO training_programs (name, description) VALUES (?, ?)',
      [name, description],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          id: this.lastID,
          name,
          description,
          created_date: new Date().toISOString()
        });
      }
    );
  });
}

/**
 * Get all training programs
 */
function getTrainingPrograms() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM training_programs WHERE is_active = 1 ORDER BY created_date DESC',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}

/**
 * Get training program by ID
 */
function getTrainingProgramById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM training_programs WHERE id = ? AND is_active = 1',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      }
    );
  });
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Handle app quit
if (app) {
  app.on('before-quit', closeDatabase);
}

module.exports = {
  initializeDatabase,
  createTrainingProgram,
  getTrainingPrograms,
  getTrainingProgramById,
  closeDatabase
};