import { sql, db } from './db'

  try {
    // Point this to wherever your generated .sql files live
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log(`✅ Migrations completed successfully in ${Date.now() - start}ms!`);
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    process.exit(1);
  } finally {
    // Crucial: Close the connection so the script exits cleanly
    await sql.end();
    process.exit(0);
  }
};

runMigration();