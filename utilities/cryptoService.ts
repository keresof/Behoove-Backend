import bcrypt from 'bcrypt';

export const hash = async (text: string, saltRounds: number = 10) =>{
    return await bcrypt.hash(text, saltRounds);
}

export const compare = async (text: string, hash: string) =>{
    return await bcrypt.compare(text, hash);
}

