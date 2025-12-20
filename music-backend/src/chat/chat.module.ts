import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Message } from './message.entity';
import { ChatController } from './chat.controller';
import { User } from '../user/user.entity'; // Đảm bảo đúng đường dẫn tới file User entity của bạn

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]) // Thêm User vào đây
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}