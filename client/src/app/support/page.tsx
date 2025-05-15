'use client';

export default function SupportPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Support</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">Frequently Asked Questions</h2>
        <p className="mb-2">Find answers to common questions below.</p>
        {/* Placeholder for FAQs */}
        <ul className="list-disc pl-5 mb-4">
          <li>How do I reset my password?</li>
          <li>How does the analysis work?</li>
          <li>What are the system requirements?</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Contact Support</h2>
        <p className="mb-2">If you can't find an answer in the FAQ, please reach out to our support team.</p>
        <p>Email: <a href="mailto:support@extemporeai.com" className="text-primary hover:underline">support@extemporeai.com</a></p>
        {/* Placeholder for a contact form or more details */}
      </div>
    </div>
  );
} 