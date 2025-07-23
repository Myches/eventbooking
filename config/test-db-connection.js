// test-db-connection.ts
// Create this file to test your database connection

import db from "./db";

async function testConnection() {
    console.log('🔍 Testing database connection...\n');
    
    try {
        // Test basic connection
        const result = await db.query('SELECT NOW() as current_time, version()');
        console.log('✅ Database connected successfully!');
        console.log('⏰ Server time:', result.rows[0].current_time);
        console.log('🔧 PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        
        // List all your tables
        const tables = await db.query(`
            SELECT table_name, 
                   (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n📋 Tables found in database:');
        tables.rows.forEach((table, index) => {
            console.log(`${index + 1}. ${table.table_name} (${table.column_count} columns)`);
        });
        
        // Test a sample query (replace 'users' with one of your actual table names)
        try {
            const sampleQuery = await db.query('SELECT COUNT(*) as total FROM users LIMIT 1');
            console.log(`\n👥 Sample data - Users count: ${sampleQuery.rows[0].total}`);
        } catch (err) {
            console.log('\n💡 Replace "users" in test script with your actual table name');
        }
        
        console.log('\n🎉 Database is ready for production!');
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(error);
    } finally {
        // Close connection
        if ('end' in db) {
            await (db).end();
        }
        process.exit();
    }
}

testConnection();