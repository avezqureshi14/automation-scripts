import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { AppLoggerService } from '../common/logger/logger.service';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly logger: AppLoggerService,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing database connection...');
        this.connection.on('connected', () => this.logger.log('Database connected successfully.'));
        this.connection.on('error', (err) => this.logger.error('Database connection error', err));
        this.connection.on('disconnected', () => this.logger.warn('Database disconnected.'));
    }

    async onModuleDestroy() {
        this.logger.log('Closing database connection...');
        await this.connection.close();
        this.logger.log('Database connection closed.');
    }
}
