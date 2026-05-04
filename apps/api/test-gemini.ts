import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
    const apiKey = "AIzaSyCHe0x5YKv_yGHLhq1sOyibnoGk8ITPs0Y";
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("🔍 กำลังดึงรายชื่อโมเดลที่ Key นี้ใช้งานได้...");

        // ใช้คำสั่ง listModels เพื่อดูว่าเรามีสิทธิ์ใช้ตัวไหนบ้าง
        // หมายเหตุ: SDK บางเวอร์ชันอาจต้องเรียกผ่าน fetch ถ้าฟังก์ชันนี้ไม่มี
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("✅ รายชื่อโมเดลที่คุณใช้ได้:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (รองรับ: ${m.supportedGenerationMethods.join(', ')})`);
            });

            // ลองหาตัวที่ใกล้เคียงที่สุดแล้วรันเทส
            const firstModel = data.models.find((m: any) => m.supportedGenerationMethods.includes('generateContent'));
            if (firstModel) {
                console.log(`\n🚀 จะลองทดสอบด้วยโมเดล: ${firstModel.name.split('/').pop()}`);
                const model = genAI.getGenerativeModel({ model: firstModel.name.split('/').pop() });
                const result = await model.generateContent("Hello");
                console.log("🎉 ผลลัพธ์: ", (await result.response).text());
            }
        } else {
            console.log("❌ ไม่พบโมเดลใดๆ: ", data);
        }

    } catch (e: any) {
        console.error("❌ พังเพราะ: ", e.message);
    }
}
test();