import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hash = async (text: string, saltRounds: number = 10) =>{
    return await bcrypt.hash(text, saltRounds);
}

export const compare = async (text: string, hash: string) =>{
    return await bcrypt.compare(text, hash);
}

export const getRandomBytes = (length: number) =>{
    return crypto.randomBytes(length).toString('hex');
}

export const getDeterministicSelection = <T>(
    items: T[],
    seed: string,
    count: number
): T[] => {
    const seedBuffer = Buffer.from(seed, 'hex');
    
    const deterministicRandom = (index: number) => {
        const hash = crypto.createHash('sha256');
        hash.update(seedBuffer);
        hash.update(Buffer.from(index.toString()));
        return parseInt(hash.digest('hex'), 16) / Math.pow(2, 256);
    };

    return items
        .map((item, index) => ({ item, random: deterministicRandom(index) }))
        .sort((a, b) => a.random - b.random)
        .slice(0, count)
        .map(({ item }) => item);
}