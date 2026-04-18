// ข้อมูลที่อยู่ไทย: จังหวัด, อำเภอ, ตำบล, รหัสไปรษณีย์
// ที่มา: thailand-geography-json (earthchie/jquery.Thailand.js)
export interface ThaiAddress {
    district: string;   // ตำบล/แขวง
    amphoe: string;     // อำเภอ/เขต
    province: string;   // จังหวัด
    zipcode: number;    // รหัสไปรษณีย์
}

// ฟังก์ชัน helper
export function getProvinces(data: ThaiAddress[]): string[] {
    return [...new Set(data.map((d) => d.province))].sort((a, b) =>
        a.localeCompare(b, 'th')
    );
}

export function getAmphoes(data: ThaiAddress[], province: string): string[] {
    return [
        ...new Set(
            data.filter((d) => d.province === province).map((d) => d.amphoe)
        ),
    ].sort((a, b) => a.localeCompare(b, 'th'));
}

export function getDistricts(
    data: ThaiAddress[],
    province: string,
    amphoe: string
): string[] {
    return [
        ...new Set(
            data
                .filter((d) => d.province === province && d.amphoe === amphoe)
                .map((d) => d.district)
        ),
    ].sort((a, b) => a.localeCompare(b, 'th'));
}

export function getZipcode(
    data: ThaiAddress[],
    province: string,
    amphoe: string,
    district: string
): string {
    const found = data.find(
        (d) =>
            d.province === province &&
            d.amphoe === amphoe &&
            d.district === district
    );
    return found ? String(found.zipcode) : '';
}
