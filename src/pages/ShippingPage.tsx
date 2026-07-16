import { Truck, MapPin, Clock } from 'lucide-react';

export function ShippingPage() {
  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-normal tracking-[-1.5px] mb-8">Shipping Information</h1>
        
        <div className="space-y-12 text-[#666666]">
          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <Truck size={20} />
              Delivery Methods
            </h2>
            <p className="leading-relaxed text-sm">
              We offer delivery across Morocco. All our orders are shipped securely and require a signature upon delivery. You will receive a tracking link via email as soon as your order leaves our atelier.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <Clock size={20} />
              Delivery Times & Costs
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b pb-2">
                <span>Standard Delivery (Rabat)</span>
                <span className="text-black">20 MAD - 24 to 48 hours</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Standard Delivery (Other Cities)</span>
                <span className="text-black">20 to 50 MAD (depending on city) - 2 to 4 working days</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Cash on Delivery
            </h2>
            <p className="leading-relaxed text-sm">
              We currently offer "Cash on Delivery" as our primary payment method. You will pay the total amount of your order, including shipping fees, directly to the courier upon receiving your package. Please make sure to have the exact amount ready to facilitate the process.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
