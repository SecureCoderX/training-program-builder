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
 * Create a new training module
 */
function createTrainingModule(moduleData) {
  return new Promise((resolve, reject) => {
    const { program_id, name, description, content, duration_minutes, is_required, order_index } = moduleData;
    
    db.run(
      `INSERT INTO training_modules 
       (program_id, name, description, content, duration_minutes, is_required, order_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [program_id, name, description, content || '', duration_minutes || 0, is_required ? 1 : 0, order_index || 0],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          id: this.lastID,
          program_id,
          name,
          description,
          content: content || '',
          duration_minutes: duration_minutes || 0,
          is_required: is_required ? 1 : 0,
          order_index: order_index || 0,
          created_date: new Date().toISOString()
        });
      }
    );
  });
}

/**
 * Get modules for a training program
 */
function getModulesByProgramId(programId) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM training_modules WHERE program_id = ? ORDER BY order_index, created_date',
      [programId],
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
 * Update module order
 */
function updateModuleOrder(moduleId, newOrder) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE training_modules SET order_index = ? WHERE id = ?',
      [newOrder, moduleId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: moduleId, order_index: newOrder });
      }
    );
  });
}

/**
 * Update training module
 */
function updateTrainingModule(moduleId, moduleData) {
  return new Promise((resolve, reject) => {
    const { name, description, content, duration_minutes, is_required } = moduleData;
    
    db.run(
      `UPDATE training_modules 
       SET name = ?, description = ?, content = ?, duration_minutes = ?, is_required = ?
       WHERE id = ?`,
      [name, description, content, duration_minutes, is_required ? 1 : 0, moduleId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: moduleId, ...moduleData });
      }
    );
  });
}

/**
 * Delete training module
 */
function deleteTrainingModule(moduleId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM training_modules WHERE id = ?',
      [moduleId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: moduleId });
      }
    );
  });
}

/**
 * Get training program with modules count
 */
function getTrainingProgramsWithModuleCounts() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        tp.*,
        COUNT(tm.id) as module_count
       FROM training_programs tp
       LEFT JOIN training_modules tm ON tp.id = tm.program_id
       WHERE tp.is_active = 1
       GROUP BY tp.id
       ORDER BY tp.created_date DESC`,
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
 * Create a new employee
 */
function createEmployee(employeeData) {
  return new Promise((resolve, reject) => {
    const { first_name, last_name, email, hire_date, department, position } = employeeData;
    
    db.run(
      `INSERT INTO employees (first_name, last_name, email, hire_date, department, position) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hire_date, department, position],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          id: this.lastID,
          first_name,
          last_name,
          email,
          hire_date,
          department,
          position,
          is_active: 1,
          created_date: new Date().toISOString()
        });
      }
    );
  });
}

/**
 * Get all employees
 */
function getEmployees() {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM employees WHERE is_active = 1 ORDER BY last_name, first_name',
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
 * Get employee by ID
 */
function getEmployeeById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM employees WHERE id = ? AND is_active = 1',
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
 * Update employee
 */
function updateEmployee(employeeId, employeeData) {
  return new Promise((resolve, reject) => {
    const { first_name, last_name, email, hire_date, department, position } = employeeData;
    
    db.run(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, email = ?, hire_date = ?, department = ?, position = ?
       WHERE id = ?`,
      [first_name, last_name, email, hire_date, department, position, employeeId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: employeeId, ...employeeData });
      }
    );
  });
}

/**
 * Delete employee (soft delete)
 */
function deleteEmployee(employeeId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE employees SET is_active = 0 WHERE id = ?',
      [employeeId],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: employeeId });
      }
    );
  });
}

/**
 * Assign training program to employee
 */
function assignTrainingToEmployee(employeeId, programId) {
  return new Promise((resolve, reject) => {
    // First, get all modules for this program
    getModulesByProgramId(programId)
      .then(modules => {
        if (modules.length === 0) {
          resolve({ message: 'No modules found in this program' });
          return;
        }

        // Create progress records for each module
        const insertPromises = modules.map(module => {
          return new Promise((resolveInsert, rejectInsert) => {
            db.run(
              `INSERT OR REPLACE INTO training_progress 
               (employee_id, module_id, program_id, status, started_date) 
               VALUES (?, ?, ?, 'not_started', datetime('now'))`,
              [employeeId, module.id, programId],
              function(err) {
                if (err) {
                  rejectInsert(err);
                } else {
                  resolveInsert(this.lastID);
                }
              }
            );
          });
        });

        Promise.all(insertPromises)
          .then(() => {
            resolve({ 
              employee_id: employeeId, 
              program_id: programId, 
              modules_assigned: modules.length 
            });
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

/**
 * Get employee training assignments
 */
function getEmployeeTrainingAssignments(employeeId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        tp.id as program_id,
        tp.name as program_name,
        tp.description as program_description,
        COUNT(tm.id) as total_modules,
        COUNT(CASE WHEN tprog.status = 'completed' THEN 1 END) as completed_modules,
        MIN(tprog.started_date) as assignment_date,
        MAX(tprog.completed_date) as last_completed_date,
        CASE 
          WHEN COUNT(CASE WHEN tprog.status = 'completed' THEN 1 END) = COUNT(tm.id) THEN 'completed'
          WHEN COUNT(CASE WHEN tprog.status IN ('in_progress', 'completed') THEN 1 END) > 0 THEN 'in_progress'
          ELSE 'not_started'
        END as overall_status
       FROM training_progress tprog
       JOIN training_programs tp ON tprog.program_id = tp.id
       JOIN training_modules tm ON tprog.module_id = tm.id
       WHERE tprog.employee_id = ? AND tp.is_active = 1
       GROUP BY tp.id, tp.name, tp.description
       ORDER BY assignment_date DESC`,
      [employeeId],
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
 * Get all employees with training progress summary
 */
function getEmployeesWithTrainingProgress() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        e.*,
        COUNT(DISTINCT tp.program_id) as assigned_programs,
        COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tp.program_id END) as completed_programs,
        COUNT(DISTINCT tm.id) as total_modules,
        COUNT(DISTINCT CASE WHEN tp.status = 'completed' THEN tm.id END) as completed_modules
       FROM employees e
       LEFT JOIN training_progress tp ON e.id = tp.employee_id
       LEFT JOIN training_modules tm ON tp.module_id = tm.id
       WHERE e.is_active = 1
       GROUP BY e.id
       ORDER BY e.last_name, e.first_name`,
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
 * Update training progress for a specific module
 */
function updateTrainingProgress(employeeId, moduleId, status, score = null) {
  return new Promise((resolve, reject) => {
    const updateData = [status];
    let updateQuery = 'UPDATE training_progress SET status = ?';

    if (status === 'in_progress' || status === 'completed') {
      updateQuery += ', started_date = COALESCE(started_date, datetime("now"))';
    }

    if (status === 'completed') {
      updateQuery += ', completed_date = datetime("now")';
      if (score !== null) {
        updateQuery += ', score = ?';
        updateData.push(score);
      }
    }

    updateQuery += ' WHERE employee_id = ? AND module_id = ?';
    updateData.push(employeeId, moduleId);

    db.run(updateQuery, updateData, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ 
        employee_id: employeeId, 
        module_id: moduleId, 
        status,
        score: score || null
      });
    });
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
  getTrainingProgramsWithModuleCounts,
  createTrainingModule,
  getModulesByProgramId,
  updateModuleOrder,
  updateTrainingModule,
  deleteTrainingModule,
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  assignTrainingToEmployee,
  getEmployeeTrainingAssignments,
  getEmployeesWithTrainingProgress,
  updateTrainingProgress,
  closeDatabase
};