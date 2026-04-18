import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type StorageUploadInput = {
    file: Express.Multer.File;
    folder: string;
    prefix: string;
    ownerId?: string;
};

@Injectable()
export class UploadService {
    constructor(readonly configService: ConfigService) { }

    createFilename(prefix: string, originalName: string): string {
        const ext = originalName.split('.').pop() || '';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        return `${prefix}-${uniqueSuffix}.${ext.toLowerCase()}`;
    }

    async uploadFile({ file, folder, prefix, ownerId }: StorageUploadInput) {
        if (!file) {
            throw new NotFoundException('ไม่พบไฟล์ที่อัพโหลด');
        }

        const filename = this.createFilename(prefix, file.originalname);
        const objectPath = ownerId ? `${folder}/${ownerId}/${filename}` : `${folder}/${filename}`;
        const fileBytes = new Uint8Array(file.buffer);
        const response = await fetch(
            `${this.getSupabaseUrl()}/storage/v1/object/${this.getBucketName()}/${this.encodeObjectPath(objectPath)}`,
            {
                method: 'POST',
                headers: {
                    ...this.getSupabaseHeaders(),
                    'Content-Type': file.mimetype,
                    'x-upsert': 'false',
                },
                body: fileBytes,
            },
        );

        if (!response.ok) {
            throw new InternalServerErrorException(`อัปโหลดไฟล์ไม่สำเร็จ: ${await this.readErrorMessage(response)}`);
        }

        return {
            filename,
            path: objectPath,
            url: this.getPublicUrl(objectPath),
        };
    }

    getPublicUrl(objectPath: string): string {
        return `${this.getSupabaseUrl()}/storage/v1/object/public/${this.getBucketName()}/${this.encodeObjectPath(objectPath)}`;
    }

    async deleteFileByUrl(fileUrl?: string | null) {
        if (!fileUrl) {
            return;
        }

        const supabasePath = this.extractSupabasePath(fileUrl);
        if (supabasePath) {
            const response = await fetch(`${this.getSupabaseUrl()}/storage/v1/object/${this.getBucketName()}`, {
                method: 'DELETE',
                headers: {
                    ...this.getSupabaseHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prefixes: [supabasePath] }),
            });

            if (!response.ok) {
                const message = await this.readErrorMessage(response);
                if (!message.toLowerCase().includes('not found')) {
                    throw new InternalServerErrorException(`ลบไฟล์ไม่สำเร็จ: ${message}`);
                }
            }
            return;
        }
    }

    async downloadFileBuffer(fileUrl: string): Promise<Buffer> {
        const supabasePath = this.extractSupabasePath(fileUrl);
        if (supabasePath) {
            const response = await fetch(this.getPublicUrl(supabasePath));

            if (!response.ok) {
                throw new NotFoundException('ไม่พบไฟล์ใน Supabase Storage');
            }

            return Buffer.from(await response.arrayBuffer());
        }

        throw new NotFoundException('ไม่พบไฟล์ใน Supabase Storage กรุณาย้ายไฟล์ legacy ไปยัง Supabase ก่อน');
    }

    private getBucketName(): string {
        return this.configService.get<string>('SUPABASE_STORAGE_BUCKET') || 'jobsabuy-assets';
    }

    private getSupabaseUrl(): string {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        if (!supabaseUrl) {
            throw new InternalServerErrorException('Supabase Storage ยังไม่ได้ตั้งค่า');
        }

        return supabaseUrl.replace(/\/$/, '');
    }

    private getSupabaseHeaders(): Record<string, string> {
        const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        if (!serviceRoleKey) {
            throw new InternalServerErrorException('Supabase Storage ยังไม่ได้ตั้งค่า');
        }

        return {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
        };
    }

    private encodeObjectPath(objectPath: string): string {
        return objectPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    }

    private extractSupabasePath(fileUrl: string): string | null {
        try {
            const url = new URL(fileUrl);
            const markers = [
                `/storage/v1/object/public/${this.getBucketName()}/`,
                `/storage/v1/object/sign/${this.getBucketName()}/`,
            ];

            for (const marker of markers) {
                const index = url.pathname.indexOf(marker);
                if (index !== -1) {
                    return decodeURIComponent(url.pathname.slice(index + marker.length));
                }
            }
        } catch {
            return null;
        }

        return null;
    }

    private async readErrorMessage(response: Response): Promise<string> {
        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = await response.json() as Record<string, any>;
                return String(data.message || data.error || JSON.stringify(data));
            }

            return (await response.text()) || response.statusText;
        } catch {
            return response.statusText || 'Unknown Supabase error';
        }
    }
}
