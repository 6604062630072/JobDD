import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenAI, Type } from '@google/genai';
import { UploadService } from '../upload/upload.service';
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumesService {
    constructor(
        readonly prisma: PrismaService,
        readonly uploadService: UploadService,
    ) { }

    async create(userId: string, title: string) {
        return this.prisma.resume.create({
            data: {
                userId,
                title,
                isPrimary: true,
            },
        });
    }

    async findAllByUser(userId: string) {
        return this.prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        const resume = await this.prisma.resume.findUnique({ where: { id } });
        if (!resume) throw new NotFoundException('ไม่พบ Resume');
        return resume;
    }

    async uploadFile(userId: string, file: Express.Multer.File) {
        // Find or create resume for user
        let resume = await this.prisma.resume.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const uploadResult = await this.uploadService.uploadFile({
            file,
            folder: 'resumes',
            prefix: 'resume',
            ownerId: userId,
        });
        const fileUrl = uploadResult.url;

        if (resume) {
            if (resume.fileUrl) {
                await this.uploadService.deleteFileByUrl(resume.fileUrl);
            }

            resume = await this.prisma.resume.update({
                where: { id: resume.id },
                data: {
                    fileUrl,
                    title: file.originalname.replace(/\.pdf$/i, '') || 'My Resume',
                },
            });
        } else {
            resume = await this.prisma.resume.create({
                data: {
                    userId,
                    title: file.originalname.replace(/\.pdf$/i, '') || 'My Resume',
                    fileUrl,
                    isPrimary: true,
                },
            });
        }

        return resume;
    }



    async remove(id: string, userId: string) {
        const resume = await this.prisma.resume.findUnique({ where: { id } });
        if (!resume) throw new NotFoundException('ไม่พบ Resume');
        if (resume.userId !== userId) throw new ForbiddenException('ไม่มีสิทธิ์ลบ Resume นี้');

        if (resume.fileUrl) {
            await this.uploadService.deleteFileByUrl(resume.fileUrl);
        }

        await this.prisma.resume.delete({ where: { id } });
        return { message: 'ลบ Resume เรียบร้อยแล้ว' };
    }

    private async parseResumeText(text: string) {
        if (!text.trim()) {
            throw new BadRequestException('ไม่พบข้อความในไฟล์ PDF กรุณาตรวจสอบว่าไฟล์เรซูเม่มีเนื้อหาที่อ่านได้');
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new InternalServerErrorException('ระบบ AI Resume Parser ยังไม่ได้ตั้งค่า GEMINI_API_KEY');
        }

        const ai = new GoogleGenAI({ apiKey });

        const schema = {
            type: Type.OBJECT,
            properties: {
                firstName: { type: Type.STRING, description: "The candidate's first name in Thai or English" },
                lastName: { type: Type.STRING, description: "The candidate's last name in Thai or English" },
                email: { type: Type.STRING, description: "Candidate's email address" },
                phone: { type: Type.STRING, description: "Candidate's phone number, please format with no spaces or dashes e.g 0812345678" },
                nationality: { type: Type.STRING, description: "Candidate's nationality" },
                address: { type: Type.STRING, description: "Full street address if available" },
                province: { type: Type.STRING, description: "Province name in Thai" },
                district: { type: Type.STRING, description: "District/Amphoe name in Thai" },
                subDistrict: { type: Type.STRING, description: "Sub-district/Tambon name in Thai" },
                postalCode: { type: Type.STRING, description: "5 digit postal code" },
                skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of hard skills, technical skills, tools, programming languages, frameworks, or professional competencies found in the resume. Each item should be a concise skill name."
                },
                experienceYears: {
                    type: Type.NUMBER,
                    description: "Total years of work experience calculated from work history. If not determinable, omit."
                },
                expectedSalary: {
                    type: Type.NUMBER,
                    description: "Expected or desired monthly salary in Thai Baht if mentioned in the resume. Omit if not found."
                },
                currentPosition: {
                    type: Type.STRING,
                    description: "Current or most recent job title / desired position"
                },
            }
        };

        const prompt = `You are a professional resume parser. Extract all relevant information from the following resume text.
For the "skills" field, include ALL hard skills, technical tools, programming languages, frameworks, software, certifications, and professional competencies mentioned anywhere in the resume.
Output strict JSON only matching the requested schema. If a value is not found, omit the field.

Resume Text:
${text.substring(0, 15000)}
`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                }
            });

            if (!response.text) {
                throw new Error('AI returned empty response');
            }

            const parsedData = JSON.parse(response.text);

            return {
                ...parsedData,
                rawTextSnippet: text.substring(0, 500),
            };
        } catch (error) {
            console.error('Resume AI Parse Error:', error);
            throw new InternalServerErrorException('ระบบ AI ไม่สามารถวิเคราะห์เรซูเม่ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
        }
    }

    async parseResume(file: Express.Multer.File) {
        try {
            const data = await (pdfParse as any)(file.buffer);
            return await this.parseResumeText(data.text || '');
        } catch (error) {
            console.error('PDF Parse/AI Error:', error);
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new BadRequestException('ไม่สามารถดึงข้อมูลจากไฟล์ PDF ได้ โปรดลองใหม่อีกครั้ง หรือตรวจสอบไฟล์');
        }
    }

    async parseStoredResume(id: string, userId: string) {
        const resume = await this.prisma.resume.findUnique({ where: { id } });
        if (!resume) throw new NotFoundException('ไม่พบ Resume');
        if (resume.userId !== userId) throw new ForbiddenException('ไม่มีสิทธิ์วิเคราะห์ Resume นี้');
        if (!resume.fileUrl) throw new BadRequestException('Resume นี้ยังไม่มีไฟล์ PDF กรุณาอัพโหลดไฟล์ก่อน');

        try {
            const fileBuffer = await this.uploadService.downloadFileBuffer(resume.fileUrl);
            const data = await (pdfParse as any)(fileBuffer);
            return await this.parseResumeText(data.text || '');
        } catch (error) {
            console.error('Parse Stored Resume Error:', error);
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof InternalServerErrorException
            ) {
                throw error;
            }
            throw new BadRequestException('ไม่สามารถวิเคราะห์ไฟล์ Resume ได้ โปรดลองใหม่อีกครั้ง');
        }
    }

    // ใน resumes.service.ts
    async findAll(query: { categoryId?: string; search?: string }) {
        const { categoryId, search } = query;

        // 🚩 1. ประกาศ Array สำหรับเก็บเงื่อนไขก่อน
        const andConditions: any[] = [];

        // 🚩 2. จัดการเรื่องหมวดหมู่ (CategoryId)
        if (categoryId) {
            let searchKeyword = '';
            switch (categoryId) {
                case 'tech': searchKeyword = 'เทคโนโลยี'; break;
                case 'sales': searchKeyword = 'ขาย'; break;
                case 'food': searchKeyword = 'อาหาร'; break;
                case 'service': searchKeyword = 'บริการ'; break;
                case 'admin': searchKeyword = 'บริหาร'; break;
                case 'marketing': searchKeyword = 'การตลาด'; break;
                case 'accounting': searchKeyword = 'บัญชี'; break;
            }

            if (searchKeyword) {
                // ดันเงื่อนไขเข้าไปใน Array แทนการเขียน where.user 直接
                andConditions.push({
                    user: {
                        workHistories: {
                            some: {
                                businessType: {
                                    contains: searchKeyword,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                });
            } else {
                return [];
            }
        }

        // 🚩 3. จัดการเรื่องช่อง Search
        if (search) {
            andConditions.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' } },
                                { lastName: { contains: search, mode: 'insensitive' } },
                            ]
                        }
                    }
                ],
            });
        }

        // 🚩 4. ประกาศตัวแปร where ไว้ตรงนี้ (ก่อนจะเอาไปใช้ข้างล่าง)
        const where = andConditions.length > 0 ? { AND: andConditions } : {};

        // 🚩 5. เรียกใช้ Prisma
        return this.prisma.resume.findMany({
            where: where, // ตอนนี้ 'where' ถูกประกาศเรียบร้อยแล้ว และโครงสร้างถูกต้อง
            include: {
                user: {
                    include: {
                        workHistories: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // เพิ่มฟังก์ชันนี้เข้าไปที่ท้าย Class ResumesService
    async getHomepageCategories() {
        // ใช้ชื่อตารางให้ตรงกับ Prisma ของคุณ (ถ้าใน schema คือ workHistory หรือ work_histories)
        // สมมติว่าใช้ workHistory ตามโค้ดก่อนหน้าของคุณ
        const allWorkHistory = await this.prisma.workHistory.findMany({
            select: {
                businessType: true,
                userId: true,
            }
        });

        const countCategory = (keyword: string) => {
            const uniqueUsers = new Set(
                allWorkHistory
                    .filter(item =>
                        item.businessType &&
                        item.businessType.includes(keyword)
                    )
                    .map(item => item.userId)
            );
            return uniqueUsers.size;
        };

        const techCount = countCategory('เทคโนโลยี');
        const adminCount = countCategory('บริหาร') + countCategory('ธุรการ');
        const salesCount = countCategory('ขาย');
        const foodCount = countCategory('อาหาร');
        const serviceCount = countCategory('บริการ');

        return {
            sections: [
                {
                    id: 'storefront',
                    items: [
                        { id: 'sales', count: salesCount },
                        { id: 'food', count: foodCount },
                        { id: 'service', count: serviceCount },
                        { id: 'retail', count: 0 },
                    ],
                },
                {
                    id: 'office',
                    items: [
                        { id: 'tech', count: techCount },
                        { id: 'admin', count: adminCount },
                        { id: 'marketing', count: 0 },
                        { id: 'accounting', count: 0 },
                    ],
                },
            ],
        };
    }
}
