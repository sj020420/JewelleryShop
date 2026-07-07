export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink gap-4">
      <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-24 h-24 rounded-full object-cover animate-pulse" />
      <div className="chain-divider"><span /><span /><span /><span /><span /></div>
      <p className="text-gold font-display italic tracking-wide text-sm">Loading elegance...</p>
    </div>
  );
}
