import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

const templatePath =
  process.env.NODE_ENV === 'production'
    ? join(__dirname, '../../templates')  // build xong: dist/templates
    : join(__dirname, '..', 'templates'); // dev: src/templates

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'ayame004@gmail.com',
          pass: 'oglh ymsf qtne nlwx',
        },
      },
      defaults: {
        from: '"Lame Music Support" <noreply@lame.com>',
      },
      template: {
        dir: templatePath,
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
  ],
  exports: [MailerModule],
})
export class SharedModule {}
