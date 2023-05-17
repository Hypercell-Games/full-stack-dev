const mysql = require('mysql2/promise');
const redis = require('redis');
const waitPort = require('wait-port');

async function checkMysql() {
    const conn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS,
    });
    const [rows, _] = await conn.execute('SELECT 100 + 23 AS result');

    if (rows[0].result !== 123) {
        throw new Error('MySQL Error');
    }
    console.log('MySQL OK');

    await conn.end();
}

async function checkRedis() {
    const conn = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    await conn.connect();

    await conn.set('result', '123');
    const value = await conn.get('result');

    if (value !== '123') {
        throw new Error('Redis Error');
    }
    console.log('Redis OK');

    await conn.disconnect();
}

async function main() {
    await waitPort({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
    });
    await waitPort({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    });

    return Promise.all([
        checkMysql(),
        checkRedis(),
    ]);
}

main()
    .then(() => console.log('Done'))
    .catch((error) => console.log(`Error: ${error}`));
