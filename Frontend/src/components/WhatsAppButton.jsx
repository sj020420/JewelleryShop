import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton({ number = '919423033383' }) {
  const message = encodeURIComponent('Hello, I am interested in your jewellery collection. Please share more details.');
  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
