import { Shield, Lock, Eye } from 'lucide-react';

export function PrivacyPage() {
  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-normal tracking-[-1.5px] mb-8">Privacy Policy</h1>

        <div className="space-y-12 text-[#666666]">
          <p className="leading-relaxed text-sm">
            At Summer Shop, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <Eye size={20} />
              1. Information We Collect
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              We may collect personal information that you provide to us directly, such as:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Name and contact information (email address, phone number).</li>
              <li>Shipping and billing addresses.</li>
              <li>Account credentials (if you create an account).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <Shield size={20} />
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Process and fulfill your orders (including Cash on Delivery coordination).</li>
              <li>Communicate with you regarding your order status or inquiries.</li>
              <li>Improve our website and customer experience.</li>
              <li>Send marketing communications (only if you have opted in via our newsletter).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4 flex items-center gap-2">
              <Lock size={20} />
              3. Data Protection
            </h2>
            <p className="leading-relaxed text-sm">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We do not sell, trade, or rent your personal identification information to others.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-black font-medium mb-4">4. Your Rights</h2>
            <p className="leading-relaxed text-sm">
              You have the right to access, correct, or delete your personal data. If you wish to exercise any of these rights, please contact us at support@summershop.ma.
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
