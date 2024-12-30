import { Module } from '@nestjs/common';
import { LinodeService } from './linode.service';

@Module({
  providers: [LinodeService],
  exports: [LinodeService],
})
export class LinodeModule {}
