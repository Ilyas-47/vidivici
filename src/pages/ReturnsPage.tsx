import { RefreshCcw, AlertCircle } from 'lucide-react';

export function ReturnsPage() {
  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-normal tracking-[-1.5px] mb-8">Returns & Exchanges</h1>
        
        <div className="space-y-12 text-[#666666]">
          <section>
            <div className="bg-[#f9f9f9] p-6 mb-8 border-l-4 border-black">
              <p className="font-medium text-black mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                5-Day Return Policy
              </p>
              <p className="text-sm leading-relaxed">
                Returns are completely free, but they must be requested within 5 days of receiving your order. After this 5-day period, no returns will be accepted under any circumstances.
              </p>
            </div>
            
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <RefreshCcw size={20} />
              Conditions for Return
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              To be eligible for a return, the item must be in its original condition:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Unworn, unwashed, and undamaged.</li>
              <li>With all original tags still attached.</li>
              <li>In its original packaging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4">How to initiate a return?</h2>
            <ol className="list-decimal pl-5 space-y-4 text-sm leading-relaxed">
              <li>Contact our support team via the Contact page within 5 days of delivery.</li>
              <li>Provide your order number and the reason for the return.</li>
              <li>We will schedule a courier to pick up the item from your address free of charge.</li>
              <li>Once we receive and inspect the item, we will process your refund or exchange.</li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
