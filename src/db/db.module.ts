import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbService } from './db.service';
import { LoggerModule } from 'src/common/logger/logger.module';

@Global()
@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb+srv://avez-taxlab:WMw2nFx5fDUQw0h4@cluster0.nwg85.mongodb.net/vat-db?retryWrites=true&w=majority&appName=Cluster0'),
        LoggerModule
    ],
    providers: [DbService],
    exports: [DbService],
})
export class DbModule { }
