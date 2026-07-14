import Image from "next/image"

export default function AntiGridSection() {
  return (
    <section className="py-20 px-4 flex justify-center items-center w-full">
      {/* Outer container mirroring the image's bounding box */}
      <div className="w-full max-w-6xl p-6 md:p-8 border border-neutral-300 rounded-[2rem]">
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 md:gap-6">
          {/* Top Row */}
          {/* Box 1 (Team Overview placeholder) */}
          <div className="md:col-span-4 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[240px] relative overflow-hidden">
            <Image
              src="/impactPics/wideStreet.png"
              alt="Wide Street"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-start items-center text-center p-6 md:p-12">
              <div dir="rtl">
                <div className="text-5xl md:text-6xl font-bold mb-3 text-neutral-800">70%</div>
                <div className="text-xl md:text-2xl font-medium text-neutral-600">
                  خفضٌ في كلفة الصيانة الطارئة
                </div>
              </div>
            </div>
          </div>

          {/* Box 2 (New Users placeholder) */}
          <div className="md:col-span-2 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[240px] flex flex-col justify-center items-center text-center p-6 bg-white/50">
            <div className="text-5xl md:text-6xl font-bold mb-3 text-neutral-800">
              60%
            </div>
            <div
              className="text-lg md:text-xl text-neutral-600 font-medium leading-tight"
              dir="rtl"
            >
              شكاوى متكررة أقلّ
            </div>
          </div>

          {/* Box 3 (Conversion Rate placeholder) */}
          <div className="md:col-span-2 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[240px] flex flex-col justify-center items-center text-center p-6 bg-white/50">
            <div className="text-5xl md:text-6xl font-bold mb-3 text-neutral-800">
              90%
            </div>
            <div
              className="text-lg md:text-xl text-neutral-600 font-medium leading-tight"
              dir="rtl"
            >
              دقة الكشف التلقائي
            </div>
          </div>

          {/* Bottom Row */}
          {/* Box 6 (New Card to the left) */}
          <div className="md:col-span-2 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[280px] relative overflow-hidden">
            <Image
              src="/impactPics/Carscaner.png"
              alt="Car Scanner"
              fill
              className="object-cover scale-110 hover:scale-125 transition-transform duration-500"
            />
          </div>

          {/* Box 5 (Global Reach placeholder - People Photo) */}
          <div className="md:col-span-3 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[280px] relative overflow-hidden">
            <Image
              src="/impactPics/people.png"
              alt="Wide People"
              fill
              className="object-cover scale-110 hover:scale-125 transition-transform duration-500"
            />
          </div>

          {/* Box 4 (Active Projects placeholder - to the right) */}
          <div className="md:col-span-3 rounded-2xl border border-neutral-300 min-h-[200px] md:min-h-[280px] relative overflow-hidden">
            <Image
              src="/impactPics/fixer.png"
              alt="Fixer"
              fill
              className="object-cover scale-110 hover:scale-125 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
