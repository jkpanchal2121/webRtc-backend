const log = (type, message, data = {}) => {
    const ts = new Date().toISOString();
    const meta = Object.keys(data).length ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${ts}] [${type.toUpperCase()}] ${message}${meta}`);
};

export default log;
