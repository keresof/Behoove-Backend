import { Response } from "express";

export function toSeconds(timeString: string) {
    const validUnits = ['s', 'm', 'h', 'd', 'w'];
    const unit = timeString.substring(timeString.length - 1);

    if (!validUnits.includes(unit)) throw new Error('Invalid time unit');

    const num = Number(timeString.substring(0, timeString.length - 1));

    if (isNaN(num)) {
        throw new Error('Invalid number in time string');
    }

    // convert time unit to seconds
    switch (unit) {
        case 's':
            return num;
        case 'm':
            return num * 60;
        case 'h':
            return num * 3600;
        case 'd':
            return num * 86400;
        case 'w':
            return num * 604800;
    }
}

export async function asyncFind<T>(
    array: T[],
    predicate: (item: T) => Promise<boolean>
  ): Promise<T | undefined> {
    for (const item of array) {
      if (await predicate(item)) {
        return item;
      }
    }
    return undefined;
  }

export async function sendError(res: Response, error: unknown){
    const is_debug = process.env?.NODE_ENV === 'development';
    if(is_debug){
        console.error(error);
        res.status(500).json({message: 'An error has occured. Check server logs'});
    }else{
        res.status(500).json({message: 'An error has occured', error: (error as Error).message});
    }
}