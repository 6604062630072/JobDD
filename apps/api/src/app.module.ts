import { Module } from '@nestjs/common';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { ResumesModule } from './resumes/resumes.module';
import { SearchModule } from './search/search.module';
import { UploadModule } from './upload/upload.module';
import { ApplicationsModule } from './applications/applications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { CookieConsentModule } from './cookie-consent/cookie-consent.module';

@Module({
  imports: [
    // Global config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core modules
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    JobsModule,
    CompaniesModule,
    ResumesModule,
    SearchModule,
    UploadModule,
    ApplicationsModule,
    NotificationsModule,
    AdminModule,
    CookieConsentModule,
    BookmarksModule,
  ],
})
export class AppModule { }
