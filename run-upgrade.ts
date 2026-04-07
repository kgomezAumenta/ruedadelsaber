import pool from './lib/db';

async function upgrade() {
    try {
        console.log('Upgrading participaciones...');
        await pool.query('ALTER TABLE participaciones ADD COLUMN IF NOT EXISTS punto_venta_id INT;');
        await pool.query('ALTER TABLE participaciones ADD COLUMN IF NOT EXISTS ubicacion_id INT;');
        console.log('Adding constraints...');
        
        try {
          await pool.query('ALTER TABLE participaciones ADD CONSTRAINT fk_puntoventa FOREIGN KEY (punto_venta_id) REFERENCES puntos_venta(id) ON DELETE SET NULL;');
        } catch (e: any) {
          if (!e.message.includes("Duplicate foreign key")) {
             console.error('Constraint fk_puntoventa issue:', e.message);
          }
        }
        
        try {
          await pool.query('ALTER TABLE participaciones ADD CONSTRAINT fk_ubicacion FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id) ON DELETE SET NULL;');
        } catch (e: any) {
          if (!e.message.includes("Duplicate foreign key")) {
             console.error('Constraint fk_ubicacion issue:', e.message);
          }
        }

        console.log('Upgrade complete');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

upgrade();
