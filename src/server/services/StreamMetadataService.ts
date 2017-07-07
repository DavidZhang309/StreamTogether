import { IStreamItem, StreamType } from '../../common/interface/stream';

import * as http from 'http';
import * as https from 'https';
import * as urllib from 'url';

const ACCEPTED_MIME = ['Image', 'Audio', 'Video'];

export class StreamMetadataService {
    private getHttpStreamType(url: string): Promise<StreamType> {
        let urlObj = urllib.parse(url);
        let adapters = {
            'http:': http,
            'https:': https
        };
        return new Promise<StreamType>((resolve, reject) => {
            let request = adapters[urlObj.protocol].request({
                method: 'HEAD',
                host: urlObj.host,
                port: urlObj.port,
                path: urlObj.path
            }, (response: http.IncomingMessage) => {
                let mime = <string>response.headers['content-type'];
                let type = mime.charAt(0).toUpperCase() + mime.slice(1, mime.indexOf('/'));

                if (type in StreamType) {
                    resolve(StreamType[type]);
                } else {
                    reject(new Error('Bad content type'));
                }
            });
            request.on('error', (err) => {
                reject(err);
            });

            request.end();
        })
    }

    public getStreamInfo(url: string): Promise<IStreamItem> {
        return this.getHttpStreamType(url).then((streamType) => {
            return {
                url: url,
                type: streamType
            };
        });
    }
}