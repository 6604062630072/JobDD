import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'นโยบายคุกกี้ (Cookie Policy) | JobSabuy',
  description: 'นโยบายคุกกี้ (Cookie Policy) ของเว็บไซต์ JobSabuy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <div className="mb-10 border-b border-gray-100 pb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 font-body">
            นโยบายคุกกี้ (Cookie Policy)
          </h1>
          <p className="text-gray-500 font-body">มีผลบังคับใช้ : วันที่ 1 สิงหาคม 2566</p>
        </div>

        <div className="prose prose-blue max-w-none prose-headings:font-body prose-p:font-body prose-li:font-body text-gray-700 space-y-8">
          <section>
            <p className="leading-relaxed">
              เว็บไซต์ <span className="font-semibold text-blue-600">JobSabuy</span>{' '}
              เราเคารพในสิทธิความเป็นส่วนตัวของท่าน
              และตระหนักถึงความคาดหวังของท่านว่าข้อมูลที่ท่านได้ให้ไว้กับเรา ผ่านเว็บไซต์{' '}
              <strong className="font-semibold text-gray-900">JobSabuy</strong>{' '}
              จะได้รับความคุ้มครองอย่างเหมาะสม ท่านสามารถศึกษารายละเอียดของการใช้คุกกี้ได้จาก
              นโยบายการใช้คุกกี้ของเรา
            </p>
            <p className="mt-4 leading-relaxed">
              ทั้งนี้หากท่านกดยอมรับคุกกี้ทั้งหมด
              จะหมายความว่าท่านยินยอมให้เราบันทึกและใช้คุกกี้ทั้งหมดจากอุปกรณ์ที่ท่านใช้ในการเข้าเว็บไซต์{' '}
              <strong className="font-semibold text-gray-900">JobSabuy</strong>{' '}
              เพื่อทำให้การเลื่อนสำรวจหน้าเว็บและการวิเคราะห์การใช้เว็บไซต์มีประสิทธิภาพยิ่งขึ้น
              เราจึงขอประกาศนโยบายการใช้คุกกี้สำหรับเว็บไซต์{' '}
              <strong className="font-semibold text-gray-900">JobSabuy</strong> ดังนี้
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">คุกกี้ คืออะไร</h2>
            <p className="leading-relaxed">
              คือ ไฟล์ข้อมูลขนาดเล็ก ซึ่งประกอบด้วยตัวอักษรและตัวเลข
              ที่ถูกจัดเก็บไว้บนเว็บเบราว์เซอร์ หรือฮาร์ดไดรฟ์ของคอมพิวเตอร์
              หรืออุปกรณ์ที่ใช้เชื่อมต่ออินเตอร์เน็ตของท่าน เช่น สมาร์ทโฟน แท็บเล็ต
              ซึ่งคุกกี้ทำหน้าที่ในการบันทึกข้อมูลหรือการตั้งค่าต่างๆ ของท่าน
              ช่วยให้ท่านสามารถใช้งานเว็บไซต์ได้อย่างต่อเนื่อง
              ทั้งยังช่วยเรารวบรวมและจดจำข้อมูลเกี่ยวกับประวัติการเข้าใช้งาน/ การเยี่ยมชมบนเว็บไซต์
              รวมถึงช่วยปรับปรุงการใช้งานออนไลน์ของท่านให้ดีขึ้น
              โดยคุกกี้ไม่ได้ทำให้เกิดอันตรายต่ออุปกรณ์ของท่านหรือความปลอดภัยของข้อมูลของท่าน
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">ประโยชน์ของคุกกี้</h2>
            <p className="leading-relaxed">
              คุกกี้ช่วยให้เราทราบว่าท่านเข้าใช้งานส่วนใดในเว็บไซต์{' '}
              <strong className="font-semibold text-gray-900">JobSabuy</strong> ของเรา
              เพื่อที่เราจะสามารถมอบประสบการณ์การใช้บริการที่ดีขึ้น
              เพื่อให้ท่านสามารถใช้บริการได้อย่างต่อเนื่องและตรงกับความต้องการของท่าน
              นอกจากนี้การบันทึกการตั้งค่าแรกของบริการด้วยคุกกี้
              จะช่วยให้ท่านเข้าถึงบริการด้วยค่าที่ตั้งไว้ทุกครั้งที่ใช้งาน
              ยกเว้นในกรณีที่คุกกี้ถูกลบซึ่งจะทำให้การตั้งค่าทุกอย่างกลับไปที่ค่าเริ่มต้น
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              วัตถุประสงค์ในการใช้คุกกี้และการจัดเก็บข้อมูลบนเครื่อง
            </h2>
            <ul className="list-disc pl-6 space-y-3 marker:text-blue-500">
              <li className="pl-2">
                เพื่อรวบรวมสถิติที่ไม่มีการระบุตัวตน
                ซึ่งจะช่วยให้เราสามารถเข้าใจพฤติกรรมผู้ใช้ในการใช้งานเว็บไซต์ของเรา
                และช่วยในการปรับปรุงเนื้อหาและโครงสร้างของเว็บไซต์ของเราให้มีประสิทธิภาพ
                ตอบโจทย์ผู้ใช้งานอย่างต่อเนื่อง
                โดยสถิตินี้อาจถูกรวบรวมและวิเคราะห์โดยผู้ให้บริการรายอื่น เช่น Google Tag Manager,
                Google Analytics, Facebook Pixel, Facebook Analytics, Huawei Analytics เป็นต้น
              </li>
              <li className="pl-2">
                เพื่อวิเคราะห์และนำเสนอโฆษณาที่เหมาะสมกับความต้องการของคุณ โดย Google Ad Manager
              </li>
              <li className="pl-2">เพื่อเชื่อมต่อกับเซสชั่น (Session) ของผู้ใช้ในการเข้าสู่ระบบ</li>
              <li className="pl-2">เพื่อจดจำการใช้งานหรือข้อมูลบางส่วนที่ผู้ใช้เคยระบุไว้บนระบบ</li>
              <li className="pl-2">
                เพื่ออำนวยความสะดวกในการใช้งานของผู้ใช้ เช่น
                การจำข้อมูลการกรอกประวัติแบบย่อและอัปโหลดไฟล์ที่ผู้ใช้กรอกล่าสุดทำให้ผู้ใช้ไม่ต้องกรอกใหม่ในครั้งต่อไป
                เป็นต้น
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">ประเภทของคุกกี้ที่ใช้</h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    1
                  </span>
                  คุกกี้ประเภทจำเป็นถาวร
                </h3>
                <p className="leading-relaxed text-gray-700">
                  คุกกี้ประเภทนี้มีความจำเป็นอย่างยิ่งต่อการทำงานของเว็บไซต์
                  เพื่อทำให้มั่นใจเรื่องความปลอดภัย ช่วยในด้านความง่ายในการใช้งาน
                  และความสมบูรณ์ของฟังก์ชันการใช้งาน อันได้แก่
                  คุกกี้ที่ทำให้เว็บไซต์สามารถทำหน้าที่ขั้นพื้นฐาน เช่น การเลื่อนสำรวจหน้าเว็บ
                  หรือช่วยให้ท่านเข้าสู่ระบบและสามารถเข้าถึงส่วนของเว็บไซต์ที่ถูกสงวนไว้ให้ใช้ได้เฉพาะสมาชิกเท่านั้น
                  เว็บไซต์จะไม่สามารถทำงานได้อย่างถูกต้องหากไม่มีการเก็บรวบรวมคุกกี้เหล่านี้
                  ทั้งนี้การจัดวางคุกกี้ประเภทนี้ลงในอุปกรณ์ของท่านจะไม่มีการจัดเก็บข้อมูลซึ่งสามารถระบุตัวตนของท่านได้อย่างเฉพาะเจาะจงแต่อย่างใด
                </p>
                <p className="mt-3 leading-relaxed text-gray-700">
                  คุกกี้ประเภทนี้จำเป็นสำหรับการทำงานของเว็บไซต์{' '}
                  <strong className="font-semibold text-gray-900">JobSabuy</strong>{' '}
                  เป็นคุกกี้ที่ทำให้ท่านสามารถเข้าถึงข้อมูลและใช้บริการในเว็บไซต์ของเราได้อย่างปลอดภัย
                  จึงไม่สามารถปิดการใช้คุกกี้ประเภทนี้ได้
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gray-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  คุกกี้ประเภทการวิเคราะห์ และวัดผลการทำงาน
                </h3>
                <p className="leading-relaxed text-gray-700">
                  คุกกี้ประเภทนี้จะช่วยอำนวยความสะดวกแก่ท่านในการใช้บริการ
                  โดยเราจะใช้เพื่อปรับปรุงการทำงานของเว็บไซต์ให้มีคุณภาพดีขึ้น มีความเหมาะสมมากขึ้น
                  ช่วยให้ท่านสามารถค้นหาสิ่งที่ต้องการได้อย่างง่ายดาย
                  และช่วยให้เราสามารถนับจำนวนผู้เข้าชมเว็บไซต์ และแหล่งที่มาของผู้เข้าชมเหล่านั้น
                  ตลอดจนช่วยให้เราทราบถึงความสนใจและพฤติกรรมในการเยี่ยมชมเว็บไซต์ของท่านมากยิ่งขึ้น
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gray-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  คุกกี้ประเภทการโฆษณา
                </h3>
                <p className="leading-relaxed text-gray-700">
                  คุกกี้ประเภทนี้จะจดจำการตั้งค่าของผู้ใช้บริการในการเข้าใช้งานหน้าเว็บไซต์
                  และนำไปใช้เป็นข้อมูลประกอบการปรับเปลี่ยนหน้าเว็บไซต์เพื่อนำเสนอโฆษณาที่เหมาะสมกับคุณมากที่สุดเท่าที่จะเป็นไปได้
                  เช่น การเลือกแสดงโฆษณาสินค้าที่คุณสนใจ
                  การป้องกันหรือการจำกัดจำนวนครั้งที่ท่านจะเห็นหน้าเว็บไซต์ของโฆษณาซ้ำ ๆ
                  เพื่อช่วยวัดความมีประสิทธิผลของโฆษณา
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="bg-gray-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                    4
                  </span>
                  คุกกี้ประเภทการทำงาน
                </h3>
                <p className="leading-relaxed text-gray-700">
                  คุกกี้ประเภทนี้ใช้ในการจดจำผู้ใช้บริการ เมื่อผู้ใช้บริการกลับมาที่เว็บไซต์อีกครั้ง
                  ทำให้เว็บไซต์สามารถจดจำชื่อผู้ใช้และรหัสผ่านได้
                  และยังช่วยให้เราปฏิบัติการตามความพึงพอใจของผู้ใช้บริการได้
                  โดยจดจำว่าผู้ใช้บริการเว็บไซต์เคยปรับแต่งการใช้หน้าเว็บอย่างไรบ้าง
                  เพื่อการแสดงผลหน้าเว็บในครั้งต่อไป รวมถึงจดจำการตั้งค่าของผู้ใช้บริการ
                  เรายังอาจแชร์ข้อมูลนี้กับบุคคลที่สามเพื่อวัตถุประสงค์ดังกล่าว
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              การเปลี่ยนหรือการลบการตั้งค่าคุกกี้ของคุณ
            </h2>
            <p className="leading-relaxed border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 rounded-r-lg">
              เว็บเบราว์เซอร์ (Web Browser) ส่วนมากจะถูกตั้งค่ายอมรับการใช้งานคุกกี้โดยอัตโนมัติ
              ซึ่งท่านสามารถปิดหรือควบคุมการใช้งานคุกกี้ด้วยการตั้งค่าเว็บเบราว์เซอร์
              ในกรณีที่ท่านไม่ต้องการให้คุกกี้ทำการรวบรวมข้อมูลบนเว็บไซต์ของเรา
              ท่านสามารถทำได้ด้วยการตั้งค่าในแถบเครื่องมือบนเว็บเบราว์เซอร์ที่ท่านใช้งาน
              แต่การดำเนินการถอนคำยินยอมดังกล่าวจะไม่ส่งผลกระทบต่อการประมวลผลข้อมูลที่ท่านได้ให้ความยินยอมไปแล้วโดยชอบด้วยกฎหมาย
              ทั้งนี้เมื่อท่านดำเนินการถอนคำยินยอมแล้ว
              อาจส่งผลให้ท่านไม่สามารถใช้บริการบางส่วนหรือทั้งหมดของเว็บไซต์{' '}
              <strong className="font-semibold text-gray-900">JobSabuy</strong> ได้
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              การปรับปรุงนโยบายการใช้คุกกี้
            </h2>
            <p className="leading-relaxed">
              เรามีการพิจารณาทบทวนและอาจแก้ไขเปลี่ยนแปลงนโยบายการใช้คุกกี้ฉบับนี้ตามความเหมาะสมอยู่เป็นระยะ
              เพื่อให้แน่ใจว่าข้อมูลส่วนบุคคลของท่านจะได้รับความคุ้มครองอย่างเหมาะสม
              ท่านสามารถตรวจสอบนโยบายการใช้คุกกี้ของเราเป็นประจำระหว่างการใช้บริการที่หน้าเว็บนี้
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
