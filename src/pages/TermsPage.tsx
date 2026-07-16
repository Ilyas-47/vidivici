import { FileText, AlertCircle } from 'lucide-react';

export function TermsPage() {
  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-normal tracking-[-1.5px] mb-8">Terms of Service</h1>

        <div className="space-y-12 text-[#666666]">
          <p className="leading-relaxed text-sm">
            Welcome to Summer Shop. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
          </p>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <FileText size={20} />
              1. General Conditions
            </h2>
            <p className="leading-relaxed text-sm">
              We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without express written permission by us.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4">2. Products and Pricing</h2>
            <p className="leading-relaxed text-sm mb-4">
              All prices are listed in Moroccan Dirham (MAD). Prices for our products are subject to change without notice. We reserve the right to modify or discontinue a product without notice at any time. We have made every effort to display as accurately as possible the colors and images of our products that appear on the store.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4">3. Orders and Payment</h2>
            <p className="leading-relaxed text-sm">
              We primarily operate on a "Cash on Delivery" basis. By placing an order, you commit to paying the full amount specified (including any applicable delivery fees) directly to the courier upon receipt of your items. Refusal to pay upon delivery may result in your account being restricted from making future purchases.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              4. Accuracy of Information
            </h2>
            <p className="leading-relaxed text-sm">
              You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and phone number, so that we can complete your transactions and contact you as needed.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
