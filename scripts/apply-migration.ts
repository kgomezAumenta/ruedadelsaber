import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import pool from '../lib/db';

async function migrate() {
    console.log('Starting migration...');
    try {
        await pool.query('ALTER TABLE participaciones ADD COLUMN marca_bayer_id INT AFTER usuario_id');
        await pool.query('ALTER TABLE participaciones ADD CONSTRAINT fk_participacion_marca FOREIGN KEY (marca_bayer_id) REFERENCES marcas_bayer(id) ON DELETE SET NULL');
        console.log('Migration completed successfully!');
    } catch (error: any) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists, skipping primary migration.');
            try {
                await pool.query('ALTER TABLE participaciones ADD CONSTRAINT fk_participacion_marca FOREIGN KEY (marca_bayer_id) REFERENCES marcas_bayer(id) ON DELETE SET NULL');
                console.log('Foreign key added.');
            } catch (fkError: any) {
                console.log('May already have foreign key or other error:', fkError.message);
            }
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
