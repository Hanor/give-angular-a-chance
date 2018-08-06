import express from 'express'
import morgan from 'morgan'      
import bodyParser from 'body-parser'
import methodOverride from 'method-override'

export class Server {
    constructor() {
        this.port = ( process.env.PORT || 8080 );
        this.app = express();
        this.app.listen( this.port )
        this.app.use('', express.static( '../interface/dist' ));
        this.app.use('*', express.static( '../interface/dist' ));
        this.app.use(morgan('dev'));
        this.app.use(bodyParser.urlencoded({'extended':'true'}));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.app.use(methodOverride())
    }
}
const server = new Server();