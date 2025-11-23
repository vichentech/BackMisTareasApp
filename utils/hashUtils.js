/**
 * Genera un hash simple (tipo FNV-1a/cyrb53) a partir de una cadena.
 * Debe ser idéntico a la implementación del Frontend.
 */
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/**
 * Ordena las claves de un objeto recursivamente.
 * Crucial para que JSON.stringify sea determinista.
 */
const sortObjectKeys = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
        }, {});
};

/**
 * Genera el Hash de un día (DayData).
 * Debe limpiar/normalizar los datos exactamente igual que el frontend.
 */
const generateDayHash = (day) => {
    const cleanDay = {
        d: day.d,
        s: day.s,
        h: day.h,
        eh: day.eh,
        os: day.os,
        se: day.se,
        al: day.al,
        ma: day.ma,
    };

    if (day.t && day.t.length > 0) {
        cleanDay.t = day.t.map(task => {
            const { id, ...taskContent } = task;
            return { id, ...taskContent }; 
        });
    } else {
        cleanDay.t = [];
    }

    const sortedDay = sortObjectKeys(cleanDay);
    const jsonString = JSON.stringify(sortedDay);
    return cyrb53(jsonString).toString(16);
};

module.exports = { generateDayHash };