const redis = require('redis');
const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.connect().catch(console.error);

exports.getCache = async (key) => {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
};

exports.setCache = async (key, value, duration = 600) => {
    await client.setEx(key, duration, JSON.stringify(value));
};

exports.deleteCache = async (key) => {
    await client.del(key);
};
