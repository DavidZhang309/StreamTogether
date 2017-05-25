import { MongoClient, Db } from 'mongodb';
import * as config from '../config';

export abstract class BaseDataService {
    /**
     * Connects to DB with promise
     * 
     * @returns A promise of a db connection
     */
    protected connectToDB(): Promise<Db>  {
        return new Promise<Db>((resolve, reject) => {
            MongoClient.connect(config.appConfig.mongodb_connection, (err, db: Db) => {
                if (err) { reject(err) }
                else { resolve(db) }
            })
        })
    }
}