import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { 
    getPaisByNombre, 
    getPuntoVentaByNombreAndPais, createPuntoVenta,
    getUbicacionByNombreAndPunto, createUbicacion 
} from '@/models/Catalogos';
import { getUserByEmail, createUser } from '@/models/Usuarios';

export async function POST(request: Request) {
    try {
        const { rows } = await request.json();

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ error: 'Formato de datos inválido. Se espera un array de filas.' }, { status: 400 });
        }

        let successCount = 0;
        let skipCount = 0;
        const errors: string[] = [];

        // Internal caches to avoid querying the DB for the same País/Punto/Ubicación multiple times
        const cachePaises = new Map<string, number>();
        const cachePuntoVentas = new Map<string, number>(); // key: `paisId-nombre`
        const cacheUbicaciones = new Map<string, number>(); // key: `puntoVentaId-nombre`

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const { pais, puntoVenta, ubicacion, nombreUsuario, email, password } = row;
            let rol = row.rol || 'promotor'; // Default role
            rol = rol.toLowerCase();

            if (!pais || !puntoVenta || !ubicacion || !nombreUsuario || !email || !password) {
                errors.push(`Fila ${i + 1}: Faltan campos obligatorios.`);
                continue;
            }

            try {
                // 1. Get País
                const paisKey = pais.toLowerCase().trim();
                let paisId = cachePaises.get(paisKey);
                if (!paisId) {
                    const dbPais = await getPaisByNombre(paisKey);
                    if (!dbPais) {
                        errors.push(`Fila ${i + 1}: País "${pais}" no encontrado en el sistema.`);
                        continue;
                    }
                    paisId = dbPais.id;
                    cachePaises.set(paisKey, paisId);
                }

                // 2. Get or Create Punto de Venta
                const puntoKey = `${paisId}-${puntoVenta.toLowerCase().trim()}`;
                let puntoVentaId = cachePuntoVentas.get(puntoKey);
                if (!puntoVentaId) {
                    const dbPunto = await getPuntoVentaByNombreAndPais(puntoVenta.trim(), paisId);
                    if (dbPunto) {
                        puntoVentaId = dbPunto.id;
                    } else {
                        puntoVentaId = await createPuntoVenta(puntoVenta.trim(), paisId);
                    }
                    cachePuntoVentas.set(puntoKey, puntoVentaId);
                }

                // 3. Get or Create Ubicación
                const ubiKey = `${puntoVentaId}-${ubicacion.toLowerCase().trim()}`;
                let ubicacionId = cacheUbicaciones.get(ubiKey);
                if (!ubicacionId) {
                    const dbUbi = await getUbicacionByNombreAndPunto(ubicacion.trim(), puntoVentaId);
                    if (dbUbi) {
                        ubicacionId = dbUbi.id;
                    } else {
                        ubicacionId = await createUbicacion(ubicacion.trim(), puntoVentaId);
                    }
                    cacheUbicaciones.set(ubiKey, ubicacionId);
                }

                // 4. Validate or Create User
                const existingUser = await getUserByEmail(email.trim());
                if (existingUser) {
                    skipCount++;
                    continue; // Skip if user exists
                }

                const password_hash = await bcrypt.hash(password.toString(), 10);

                await createUser({
                    nombre: nombreUsuario.trim(),
                    email: email.trim(),
                    password_hash,
                    rol: rol as 'admin' | 'promotor' | 'editor',
                    pais_id: paisId,
                    punto_venta_id: puntoVentaId,
                    ubicacion_id: ubicacionId
                });

                successCount++;
            } catch (err: any) {
                console.error(`Error processing row ${i + 1}:`, err);
                errors.push(`Fila ${i + 1}: Falló al importar debido a un error interno.`);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Importación completada: ${successCount} usuarios creados, ${skipCount} omitidos (email existente).`,
            errors: errors 
        });

    } catch (error) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: 'Error procesando la importación.' }, { status: 500 });
    }
}
