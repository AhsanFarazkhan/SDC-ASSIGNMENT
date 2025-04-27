import pg from 'pg';
import 'dotenv/config';
const { Pool } = pg;

// Connect to your PostgreSQL database
const pool = new Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/schoolfees',
  ssl: false
});

async function addFeeStructure() {
  try {
    console.log('Adding fee structure to database...');
    
    // Add a fee structure for grade 1
    const result = await pool.query(`
      INSERT INTO fee_structures (name, amount, grade, description) 
      VALUES ('Grade 1 Term Fee', 500, 1, 'Standard fee for Grade 1 students')
      RETURNING id, name, amount, grade
    `);
    
    console.log('Fee structure added successfully:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error adding fee structure:', error.message);
  } finally {
    await pool.end();
  }
}

addFeeStructure();