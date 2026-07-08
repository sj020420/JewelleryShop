import { FaGem, FaAward, FaUsers } from 'react-icons/fa';





export default function About() {
  return (
    <div>
      <section className="bg-ink py-20 text-center">
        <img src="/logo.jpg" alt="Saj by Anita Jewellery" className="w-20 h-20 rounded-full object-cover mx-auto mb-5" />
        <h1 className="font-display text-4xl text-white">About साज by Anita Jewellery</h1>
      </section>

      <div className="container-shop py-16 max-w-3xl mx-auto text-center">
        <p className="text-ink/70 leading-relaxed text-lg">
          साज by Anita Jewellery brings you handcrafted, traditional and contemporary jewellery designs,
          made with trust and passed-down craftsmanship. Every piece that leaves our workshop carries
          decades of experience, an eye for detail, and a promise of certified purity.
        </p>
      </div>

      <div className="bg-ivory py-16">
        <div className="container-shop grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: FaGem, title: 'Handcrafted Designs', desc: 'Every piece designed and finished by skilled artisans.' },
            { icon: FaAward, title: 'Certified Purity', desc: 'Hallmark certified gold and diamonds, always.' },
            { icon: FaUsers, title: 'Generations of Trust', desc: 'Serving families with honesty for decades.' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gold/15">
              <f.icon className="text-gold-dark mx-auto mb-4" size={30} />
              <h3 className="font-display text-xl text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
