import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const faqs = [
  { q: 'Do you offer online payment?', a: 'No, we do not process online payments. When you click "Buy Now", you will be connected directly with us on WhatsApp to discuss your purchase and complete it in-store.' },
  { q: 'What types of jewellery do you offer?', a: 'We offer a wide range of trendy, traditional, and fancy jewellery options, including 1 Gram Gold and fashion jewellery collections suitable for every occasion.' },
  { q: 'Do you have a physical store to see the collections?', a: 'Yes, you can visit our store to explore our complete collection in person, or contact us on WhatsApp for any inquiries.' },
  { q: 'Do you provide a warranty or exchange?', a: 'Yes, please ask our team in-store about our exchange policy for your specific purchase.' },
  { q: 'How do I check the price of an item?', a: 'Prices are listed on each product page. For exact quotes, bulk pricing, or availability, contact us on WhatsApp.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="container-shop py-16 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-ink">Frequently Asked Questions</h1>
        <div className="chain-divider mt-4"><span /><span /><span /><span /><span /></div>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="border border-gold/20 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-display text-lg text-ink">{f.q}</span>
              <FaChevronDown className={`text-gold-dark transition-transform ${open === i ? 'rotate-180' : ''}`} size={13} />
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-ink/60">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
