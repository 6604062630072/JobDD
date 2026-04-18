import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(readonly searchService: SearchService) { }

    @Get('jobs')
    @ApiOperation({ summary: 'ค้นหางาน Full-Text Search (Thai + English)' })
    @ApiQuery({ name: 'q', required: false, description: 'คำค้นหา (ชื่องาน, คำอธิบาย, ชื่อบริษัท)', type: String })
    @ApiQuery({ name: 'jobType', required: false, enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'] })
    @ApiQuery({ name: 'workModel', required: false, enum: ['ONSITE', 'REMOTE', 'HYBRID'] })
    @ApiQuery({ name: 'province', required: false, description: 'จังหวัด', type: String })
    @ApiQuery({ name: 'region', required: false, description: 'ภูมิภาค', type: String })
    @ApiQuery({ name: 'salaryMin', required: false, description: 'เงินเดือนขั้นต่ำ', type: Number })
    @ApiQuery({ name: 'salaryMax', required: false, description: 'เงินเดือนสูงสุด', type: Number })
    @ApiQuery({ name: 'education', required: false, description: 'วุฒิการศึกษาขั้นต่ำ', enum: ['ต่ำกว่ามัธยมศึกษา', 'มัธยมศึกษา', 'ปวช/ปวส', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'] })
    @ApiQuery({ name: 'category', required: false, description: 'สาขาอาชีพ', type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async searchJobs(
        @Query('q') query?: string,
        @Query('jobType') jobType?: string,
        @Query('workModel') workModel?: string,
        @Query('province') province?: string,
        @Query('region') region?: string,
        @Query('salaryMin') salaryMin?: string,
        @Query('salaryMax') salaryMax?: string,
        @Query('education') education?: string,
        @Query('category') category?: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.searchService.searchJobs(
            query,
            {
                jobType,
                workModel,
                province,
                region,
                salaryMin: salaryMin ? Number(salaryMin) : undefined,
                salaryMax: salaryMax ? Number(salaryMax) : undefined,
                education,
                category,
            },
            Number(page),
            Number(limit),
        );
    }
}
