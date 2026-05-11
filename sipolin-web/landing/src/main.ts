import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceCard {
  id: string;
  image: string;
  name: string;
  tagline: string;
  description: string;
}

interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface SendCard {
  image: string;
  title: string;
  subtitle: string;
}

interface NavLink {
  label: string;
  href: string;
}

interface AnimationConfig {
  duration: number;
  ease: string;
  stagger: number;
}

// ─── Assets ───────────────────────────────────────────────────────────────────

const ASSETS = {
  logo: "/images/logo-polindra.svg",
  polrideHero: "/images/polride-rider-hero.png",
  polrideMini: "/images/polride-rider-mini.png",
  polsendPackaging: "/images/polsend-packaging.png",
  nitipBowl: "/images/nitip-bowl.png",
  nitipPlate: "/images/nitip-plate.png",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { label: "Layanan Kami", href: "#services" },
  { label: "Tutor", href: "#how-it-works" },
  { label: "Fitur", href: "#features" },
];

const SERVICES: ServiceCard[] = [
  {
    id: "pol-ride",
    image: ASSETS.polrideMini,
    name: "Pol-Ride",
    tagline: "Antar Jemput Lokal",
    description:
      "Antar jemput lokal untuk aktivitas harian di Indramayu. Cepat, aman, dan terpercaya.",
  },
  {
    id: "pol-send",
    image: ASSETS.polsendPackaging,
    name: "Pol-Send",
    tagline: "Kirim Barang & Paket",
    description:
      "Kirim barang, paket, dokumen, makanan, atau kebutuhan harian dengan cepat dan aman.",
  },
  {
    id: "nitip-apa-aja",
    image: ASSETS.nitipBowl,
    name: "Nitip Apa Aja",
    tagline: "Errand & Titip Beli",
    description:
      "Titip beli makanan atau barang dari restoran, warung, toko, atau lokasi mana pun.",
  },
];

const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    number: "01",
    title: "Pilih Layanan",
    description:
      "Pilih antara Pol-Ride, Pol-Send, atau Nitip Apa Aja sesuai kebutuhan kamu.",
  },
  {
    number: "02",
    title: "Tentukan Lokasi",
    description:
      "Atur titik jemput dan tujuan. Bisa custom lokasi dari mana saja di Indramayu.",
  },
  {
    number: "03",
    title: "Driver Jalan",
    description:
      "Driver terdekat langsung meluncur. Pantau posisi secara real-time di aplikasi.",
  },
];

const FEATURES: Feature[] = [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>`,
    title: "Real-time Tracking",
    description:
      "Pantau posisi driver secara langsung di peta. Tidak perlu tebak-tebakan kapan sampai.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
    title: "Direct Chat",
    description:
      "Komunikasi langsung dengan driver via in-app chat. Koordinasi jadi lebih mudah.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,
    title: "Local Trust",
    description:
      "Driver lokal Indramayu yang terverifikasi. Aman, dekat, dan paham jalanan setempat.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
    title: "Cepat & Tepat",
    description:
      "Estimasi waktu akurat. Driver langsung bergerak begitu order diterima.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
    title: "Harga Transparan",
    description:
      "Tarif jelas sebelum berangkat. Tidak ada biaya tersembunyi atau kejutan di akhir.",
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
    title: "Komunitas Lokal",
    description:
      "Dukung driver lokal Indramayu. Setiap order berkontribusi pada ekonomi daerah.",
  },
];

const SEND_CARDS: SendCard[] = [
  {
    image: ASSETS.nitipBowl,
    title: "Restoran Mana Aja",
    subtitle:
      "Dari warung pinggir jalan sampai resto hits, semua bisa dititipkan.",
  },
  {
    image: ASSETS.nitipPlate,
    title: "Makanan Favorit",
    subtitle:
      "Titip beli nasi, mie, kopi, camilan, atau menu favorit tanpa ribet.",
  },
  {
    image: ASSETS.polsendPackaging,
    title: "Paket & Barang Kecil",
    subtitle:
      "Kirim dokumen, oleh-oleh, barang kecil, atau kebutuhan harian dengan aman.",
  },
  {
    image: ASSETS.polrideMini,
    title: "Driver Lokal",
    subtitle:
      "Driver Sipolin siap bantu pickup, belanja, dan antar ke tujuan kamu.",
  },
];

const ANIM: AnimationConfig = {
  duration: 0.9,
  ease: "power3.out",
  stagger: 0.12,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobile = (): boolean => window.innerWidth < 768;

const downloadAndroidUrl = import.meta.env.VITE_DOWNLOAD_ANDROID_URL || "#";
const downloadIosUrl = import.meta.env.VITE_DOWNLOAD_IOS_URL || "#";

function imageTag(
  src: string,
  alt: string,
  className: string,
  loading: "lazy" | "eager" = "lazy"
): string {
  return `
    <img
      src="${src}"
      alt="${alt}"
      class="${className}"
      loading="${loading}"
      decoding="async"
    />
  `;
}

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildNavbar(): string {
  return `
<nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-3 font-black text-xl text-slate-900">
      <span class="brand-logo grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
        ${imageTag(ASSETS.logo, "Logo Polindra", "h-8 w-8 object-contain")}
      </span>
      <span>Sipolin</span>
    </a>

    <div class="hidden md:flex items-center gap-8">
      ${NAV_LINKS.map(
        (link) =>
          `<a href="${link.href}" class="text-slate-600 hover:text-emerald-600 font-semibold text-sm transition-colors duration-200">${link.label}</a>`
      ).join("")}
    </div>

    <a href="#download" class="magnetic-btn btn-primary text-sm">
      Download
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M8 2v8M5 7l3 3 3-3"/>
        <path d="M2 12h12"/>
      </svg>
    </a>

    <button id="menu-toggle" class="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
      <span class="w-5 h-0.5 bg-slate-900 transition-all"></span>
      <span class="w-5 h-0.5 bg-slate-900 transition-all"></span>
      <span class="w-5 h-0.5 bg-slate-900 transition-all"></span>
    </button>
  </div>

  <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
    ${NAV_LINKS.map(
      (link) =>
        `<a href="${link.href}" class="block text-slate-700 hover:text-emerald-600 font-semibold py-2">${link.label}</a>`
    ).join("")}
    <a href="#download" class="btn-primary w-full justify-center mt-2">Download</a>
  </div>
</nav>`;
}

function buildDriverStatusCard(): string {
  return `
<div class="floating-status absolute left-0 top-12 z-30 bg-white/95 backdrop-blur-sm rounded-[1.75rem] shadow-xl px-4 py-3 flex items-center gap-3 border border-slate-100">
  <div class="grid w-12 h-12 place-items-center rounded-2xl bg-emerald-500 overflow-hidden shadow-sm p-1">
    <div class="grid h-full w-full place-items-center overflow-hidden rounded-xl bg-white">
      ${imageTag(
        ASSETS.polrideMini,
        "Driver Sipolin",
        "h-9 w-9 object-contain"
      )}
    </div>
  </div>
  <div>
    <div class="text-[13px] font-black text-slate-800 leading-tight">Driver otw!</div>
    <div class="text-[11px] text-emerald-500 font-bold">2 menit lagi</div>
  </div>
</div>`;
}

function buildHero(): string {
  return `
<section id="hero" class="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-white">
  <div class="hero-noise"></div>
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(16,185,129,0.08),transparent_28%)] pointer-events-none"></div>

  <div class="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <div class="hero-label section-label mb-6">
        <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        Polindra dan sekitarnya
      </div>

      <h1 class="hero-headline text-[clamp(3.2rem,7vw,6.8rem)] font-black text-slate-900 leading-[0.95] tracking-[-0.07em] mb-7">
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-1 block">Sipolin:</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-2 block text-emerald-500">Solusi</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-3 block text-emerald-500">Mobilitas</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-4 block">Indramayu.</span>
        </span>
      </h1>

      <p class="hero-desc text-lg text-slate-500 leading-relaxed max-w-md mb-8">
        Layanan on-demand untuk antar jemput, kirim barang, dan titip kebutuhan harian warga Indramayu.
      </p>

      <div class="hero-cta flex flex-wrap gap-3">
        <a href="#download" class="magnetic-btn btn-primary text-base px-8 py-4">
          Download Now
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M9 2v9M6 8l3 3 3-3"/>
            <path d="M2 14h14"/>
          </svg>
        </a>
        <a href="#services" class="magnetic-btn btn-ghost text-base px-8 py-4">
          Lihat Layanan
        </a>
      </div>

      <div class="hero-trust flex items-center gap-6 mt-10 pt-8 border-t border-slate-100">
        <div>
          <div class="font-black text-2xl text-slate-900">Segera</div>
          <div class="text-xs text-slate-400 mt-0.5">Hadir</div>
        </div>
        <div class="w-px h-10 bg-slate-100"></div>
        <div>
          <div class="font-black text-2xl text-slate-900">Driver</div>
          <div class="text-xs text-slate-400 mt-0.5">Lokal</div>
        </div>
        <div class="w-px h-10 bg-slate-100"></div>
        <div>
          <div class="font-black text-2xl text-slate-900">IDM</div>
          <div class="text-xs text-slate-400 mt-0.5">Indramayu</div>
        </div>
      </div>
    </div>

    <div class="hero-phone relative flex items-center justify-center min-h-[460px] md:min-h-[560px]">
      <div class="absolute w-80 h-80 bg-emerald-100 rounded-full opacity-70 blur-3xl right-0 top-14 pointer-events-none"></div>
      <div class="absolute w-48 h-48 bg-emerald-200 rounded-full opacity-50 blur-2xl left-6 bottom-8 pointer-events-none"></div>

      <div class="hero-visual-card relative z-10 w-full max-w-[420px] rounded-[2.5rem] border border-slate-100 bg-white p-4 md:p-5 shadow-soft-xl overflow-hidden">
        ${imageTag(
          ASSETS.polrideHero,
          "Ilustrasi Driver Sipolin",
          "hero-rider-img w-full max-h-[360px] md:max-h-[460px] object-contain rounded-[2rem]",
          "eager"
        )}
      </div>

      ${buildDriverStatusCard()}

      <div class="floating-rating absolute right-0 bottom-16 z-30 bg-white/95 backdrop-blur-sm rounded-[1.5rem] shadow-xl px-4 py-3 border border-slate-100">
        <div class="text-[10px] text-slate-400 mb-1">Rating Driver</div>
        <div class="text-amber-400 text-xs tracking-tight">★★★★★</div>
        <div class="text-[11px] font-bold text-slate-800 mt-0.5">Budi S.</div>
      </div>
    </div>
  </div>
</section>`;
}

function buildTicker(): string {
  const items = [
    "Pol-Ride",
    "Pol-Send",
    "Nitip Apa Aja",
    "Cepat",
    "Aman",
    "Lokal",
    "Indramayu",
    "Terpercaya",
  ];

  const repeat = [...items, ...items];

  return `
<div class="py-5 bg-emerald-500 overflow-hidden">
  <div class="ticker-inner">
    ${repeat
      .map(
        (item) =>
          `<span class="text-white font-black text-sm px-6 opacity-95 uppercase tracking-[0.2em]">${item}</span><span class="text-emerald-200">•</span>`
      )
      .join("")}
  </div>
</div>`;
}

function buildServices(): string {
  return `
<section id="services" class="py-24 bg-slate-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Layanan Kami
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Tiga layanan,<br/><span class="text-emerald-500">satu aplikasi.</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      ${SERVICES.map(
        (service, index) => `
      <article class="card-service reveal-card group" style="--delay: ${index * 0.15}s">
        <div class="mb-5 grid h-24 w-24 place-items-center overflow-hidden rounded-[1.5rem] bg-emerald-50 border border-emerald-100">
          ${imageTag(
            service.image,
            service.name,
            "h-16 w-16 object-contain rounded-2xl bg-white p-1 transition-transform duration-500 group-hover:scale-110"
          )}
        </div>

        <div class="section-label text-xs mb-1">${service.tagline}</div>
        <h3 class="text-xl font-black text-slate-900 mb-2">${service.name}</h3>
        <p class="text-slate-500 text-sm leading-relaxed">${service.description}</p>

        <div class="mt-5 pt-4 border-t border-slate-100">
          <a href="#download" class="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Coba Sekarang
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </a>
        </div>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildHowItWorks(): string {
  return `
<section id="how-it-works" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <div class="section-label mb-6">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Cara Ngangoe
        </div>

        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mb-12">
          Semudah<br/><span class="text-emerald-500">tiga langkah.</span>
        </h2>

        <div class="space-y-10">
          ${HOW_IT_WORKS.map(
            (step, index) => `
          <div class="hiw-step flex gap-5 items-start" style="--i: ${index}">
            <div class="flex-shrink-0">
              <div class="text-6xl md:text-7xl font-black text-emerald-500 leading-none tracking-[-0.08em]">${step.number}</div>
            </div>
            <div class="pt-3">
              <h3 class="text-xl font-black text-slate-900 mb-1">${step.title}</h3>
              <p class="text-slate-500 leading-relaxed">${step.description}</p>
            </div>
          </div>
          ${index < HOW_IT_WORKS.length - 1 ? `<div class="ml-8 w-px h-8 bg-slate-200"></div>` : ""}`
          ).join("")}
        </div>
      </div>

      <div class="relative flex justify-center">
        <div class="absolute w-72 h-72 bg-emerald-100 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

        <div class="relative z-10 grid grid-cols-2 gap-4">
          <div class="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 col-span-2">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">1</div>
              <span class="font-black text-slate-800 text-sm">Pol-Ride dipilih</span>
              <span class="ml-auto text-emerald-500 text-xs font-bold">✓ Aktif</span>
            </div>
            <div class="h-1 w-full bg-slate-100 rounded-full">
              <div class="h-1 w-1/3 bg-emerald-500 rounded-full"></div>
            </div>
          </div>

          <div class="driver-mini-card relative overflow-hidden rounded-[2rem] bg-emerald-500 p-5 shadow-lg shadow-emerald-200">
  <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl"></div>
  <div class="absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-emerald-300/30 blur-2xl"></div>

  <div class="relative mb-4 h-24 w-full overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-white/60">
    <div class="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/40 to-white"></div>

    ${imageTag(
      ASSETS.polrideMini,
      "Driver Sipolin",
      "driver-mini-img absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain"
    )}
  </div>

  <div class="relative z-10 text-white font-black text-base leading-tight">Driver</div>
  <div class="relative z-10 mt-1 text-sm font-semibold text-emerald-100">2 menit lagi</div>
</div>

          <div class="bg-white rounded-3xl p-5 shadow-lg border border-slate-100">
            <div class="text-2xl mb-2">📍</div>
            <div class="text-slate-800 font-black text-sm">Lokasi</div>
            <div class="text-slate-400 text-xs">Indramayu Kota</div>
          </div>

          <div class="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 col-span-2">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-slate-400 text-xs mb-1">Estimasi tiba</div>
                <div class="text-slate-900 font-black">5 menit</div>
              </div>
              <div class="text-right">
                <div class="text-slate-400 text-xs mb-1">Tarif</div>
                <div class="text-emerald-500 font-black">Rp 8.000</div>
              </div>
              <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>`;
}

function buildStackingCards(): string {
  return `
<section id="showcase" class="py-24 bg-slate-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Showcase
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Semua ada,<br/><span class="text-emerald-500">semua bisa.</span>
      </h2>
    </div>

    <div id="stack-container" class="relative">
      ${SERVICES.map(
        (service, index) => `
      <article class="stack-card-item bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 mb-6 md:mb-0"
        style="top: ${120 + index * 20}px; z-index: ${10 + index}">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1">
            <div class="grid w-20 h-20 place-items-center overflow-hidden rounded-3xl bg-emerald-50 border border-emerald-100 mb-6">
              ${imageTag(service.image, service.name, "h-14 w-14 object-contain rounded-2xl bg-white p-1")}
            </div>
            <div class="section-label mb-2">${service.tagline}</div>
            <h3 class="text-3xl font-black text-slate-900 mb-3">${service.name}</h3>
            <p class="text-slate-500 leading-relaxed mb-6">${service.description}</p>
            <a href="#download" class="btn-primary inline-flex">Download App</a>
          </div>

          <div class="flex-shrink-0">
            <div class="w-56 h-56 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-white border border-emerald-100 flex items-center justify-center overflow-hidden p-4">
              ${imageTag(service.image, service.name, "w-40 h-40 object-contain rounded-[1.5rem] bg-white p-2")}
            </div>
          </div>
        </div>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildHorizontalScroll(): string {
  return `
<section id="nitip" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6 mb-10">
    <div class="section-label">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      Nitip Apa Aja
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Nitip apa aja,<br/><span class="text-emerald-500">dari mana aja.</span>
      </h2>
      <p class="text-slate-500 max-w-xs">
        Pesan dari restoran, warung, toko, kampus, rumah, atau titik custom manapun di Indramayu.
      </p>
    </div>
  </div>

  <div id="hscroll-outer" class="relative pl-6 md:pl-[calc((100vw-72rem)/2+1.5rem)] overflow-hidden">
    <div id="hscroll-track" class="horizontal-track flex gap-5">
      ${SEND_CARDS.map(
        (card) => `
      <article class="flex-shrink-0 w-72 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
        <div class="mb-5 grid h-32 w-full place-items-center overflow-hidden rounded-[1.75rem] bg-emerald-50 border border-emerald-100">
          ${imageTag(card.image, card.title, "h-24 w-24 object-contain rounded-2xl bg-white p-2")}
        </div>
        <h4 class="font-black text-slate-900 text-lg mb-2">${card.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${card.subtitle}</p>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildFeatures(): string {
  return `
<section id="features" class="py-24 bg-slate-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Fitur Unggulan
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Didesain untuk<br/><span class="text-emerald-500">kenyamanan kamu.</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-5">
      ${FEATURES.map(
        (feature, index) => `
      <article class="feature-card bg-white rounded-3xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-500 group cursor-default reveal-card" style="--delay: ${index * 0.1}s">
        <div class="w-11 h-11 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors duration-300 border border-emerald-100">
          ${feature.icon}
        </div>
        <h4 class="font-black text-slate-900 mb-2">${feature.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${feature.description}</p>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildPhoneMockup(content: string): string {
  return `
<div class="phone-mockup">
  <div class="phone-screen">
    ${content}
  </div>
</div>`;
}

function buildAppPreview(): string {
  const makePhone = (
    label: string,
    image: string,
    scale: string,
    rotate: string,
    zIndex: string
  ): string => `
    <div class="app-phone absolute" style="transform: ${rotate} scale(${scale}); z-index: ${zIndex};">
      ${buildPhoneMockup(`
        <div class="h-full bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center gap-4 px-5">
          <div class="grid h-28 w-28 place-items-center overflow-hidden rounded-[2rem] bg-white border border-emerald-100 shadow-lg shadow-emerald-100">
            ${imageTag(image, label, "h-20 w-20 object-contain rounded-[1.25rem] bg-white p-1")}
          </div>
          <div class="text-slate-800 font-black text-sm">${label}</div>
          <div class="flex gap-1">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div class="w-2 h-2 rounded-full bg-emerald-200"></div>
            <div class="w-2 h-2 rounded-full bg-emerald-200"></div>
          </div>
        </div>
      `)}
    </div>`;

  return `
<section id="app-preview" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-20">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Aplikasi
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Simpel dari genggaman,<br/><span class="text-emerald-500">kuat dalam layanan.</span>
      </h2>
    </div>

    <div class="relative flex justify-center items-center" style="height: 560px;">
      ${makePhone("Pol-Send", ASSETS.polsendPackaging, "0.8", "translateX(-180px) rotate(-8deg)", "1")}
      ${makePhone("Pol-Ride", ASSETS.polrideMini, "1", "translateX(0)", "3")}
      ${makePhone("Nitip Apa Aja", ASSETS.nitipBowl, "0.8", "translateX(180px) rotate(8deg)", "1")}
      <div class="absolute w-96 h-64 bg-emerald-200 rounded-full opacity-30 blur-3xl bottom-0 pointer-events-none"></div>
    </div>
  </div>
</section>`;
}

function buildDownloadCTA(): string {
  return `
<section id="download" class="relative py-24 bg-slate-900 overflow-hidden">
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.22),transparent_32%)] pointer-events-none"></div>

  <div class="relative max-w-4xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest mb-6">
      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
      Download Sekarang
    </div>

    <h2 class="text-4xl md:text-6xl font-black text-white tracking-[-0.06em] mb-6">
      Gerak lebih simpel<br/><span class="text-emerald-400">bersama Sipolin.</span>
    </h2>

    <p class="text-slate-400 text-lg max-w-md mx-auto mb-10">
      Satu aplikasi untuk mobilitas, pengiriman, dan kebutuhan harian warga Indramayu.
    </p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="${downloadAndroidUrl}"
        class="magnetic-btn store-btn group bg-white text-slate-900 hover:bg-slate-50"
        aria-label="Download Sipolin di Google Play"
      >
        <span class="store-icon bg-white">
          <svg viewBox="0 0 48 48" class="h-7 w-7" aria-hidden="true">
            <path fill="#00F076" d="M7.6 4.7c-.7.8-1.1 2-1.1 3.4v31.8c0 1.4.4 2.6 1.1 3.4L25.8 24 7.6 4.7z"/>
            <path fill="#00D6FF" d="M31.7 17.8 25.8 24 7.6 4.7c.9-.9 2.3-1 3.8-.2l20.3 13.3z"/>
            <path fill="#FFCE00" d="M31.7 30.2 25.8 24l5.9-6.2 7.2 4.7c2.1 1.4 2.1 3.6 0 5l-7.2 4.7z"/>
            <path fill="#FF3A44" d="M7.6 43.3 25.8 24l5.9 6.2-20.3 13.3c-1.5.8-2.9.7-3.8-.2z"/>
          </svg>
        </span>

        <span class="text-left leading-none">
          <span class="block text-[11px] font-bold text-slate-500 mb-1">GET IT ON</span>
          <span class="block text-lg font-black tracking-tight">Google Play</span>
        </span>
      </a>

      <a
        href="${downloadIosUrl}"
        class="magnetic-btn store-btn group bg-emerald-500 text-white hover:bg-emerald-400"
        aria-label="Download Sipolin di App Store"
      >
        <span class="store-icon bg-white/15">
          <svg viewBox="0 0 24 24" class="h-7 w-7 fill-white" aria-hidden="true">
            <path d="M17.05 12.56c-.03-3.01 2.46-4.45 2.57-4.52-1.4-2.05-3.58-2.33-4.36-2.36-1.85-.19-3.61 1.09-4.55 1.09-.94 0-2.39-1.06-3.93-1.03-2.02.03-3.88 1.17-4.92 2.98-2.1 3.64-.54 9.03 1.51 11.98 1 1.45 2.2 3.08 3.77 3.02 1.51-.06 2.08-.98 3.91-.98 1.82 0 2.34.98 3.94.95 1.63-.03 2.66-1.48 3.65-2.93 1.15-1.68 1.62-3.31 1.65-3.39-.04-.02-3.17-1.22-3.24-4.81z"/>
            <path d="M14.05 3.72c.83-1 1.39-2.39 1.24-3.78-1.2.05-2.66.8-3.52 1.8-.77.89-1.44 2.31-1.26 3.67 1.34.1 2.71-.68 3.54-1.69z"/>
          </svg>
        </span>

        <span class="text-left leading-none">
          <span class="block text-[11px] font-bold text-emerald-100 mb-1">DOWNLOAD ON THE</span>
          <span class="block text-lg font-black tracking-tight">App Store</span>
        </span>
      </a>
    </div>
  </div>
</section>`;
}

function buildFooter(): string {
  return `
<footer id="about" class="bg-slate-900 border-t border-slate-800 py-16">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-10 mb-12">
      <div class="md:col-span-1">
        <a href="/" class="flex items-center gap-3 font-black text-xl text-white mb-3">
          <span class="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-soft">
            ${imageTag(ASSETS.logo, "Logo Polindra", "h-8 w-8 object-contain")}
          </span>
          <span>Sipolin</span>
        </a>

        <p class="text-slate-400 text-sm leading-relaxed">
          Layanan on-demand lokal untuk warga Indramayu, Indonesia.
        </p>

        <div class="flex gap-3 mt-6">
          <a
            href="#"
            class="social-btn social-facebook"
            aria-label="Facebook Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M14.2 8.5V6.7c0-.8.5-1.1 1.2-1.1h1.8V2.4c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v1.4H6.6V12h3.1v9.7h3.8V12h3l.5-3.5h-2.8z"/>
            </svg>
          </a>

          <a
            href="#"
            class="social-btn social-instagram"
            aria-label="Instagram Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/>
              <circle cx="17.5" cy="6.5" r="1.3" fill="white"/>
            </svg>
          </a>

          <a
            href="#"
            class="social-btn social-tiktok"
            aria-label="TikTok Sipolin"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white" aria-hidden="true">
              <path d="M16.6 2.5c.4 2.5 1.8 4.2 4.1 4.5v3.3c-1.4.1-2.7-.3-4-1.1v5.9c0 4-2.7 6.4-6.3 6.4-3.3 0-5.9-2.3-5.9-5.5 0-3.5 2.8-5.8 6.5-5.4v3.5c-1.8-.3-3 .6-3 1.9 0 1.2 1 2 2.3 2 1.4 0 2.4-.8 2.4-2.8V2.5h3.9z"/>
            </svg>
          </a>
        </div>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Aplikasi</h5>
        <ul class="space-y-2">
          ${["Pol-Ride", "Pol-Send", "Nitip Apa Aja", "Routes"]
            .map(
              (link) =>
                `<li><a href="#" class="text-slate-400 hover:text-emerald-400 text-sm transition-colors">${link}</a></li>`
            )
            .join("")}
        </ul>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Perusahaan</h5>
        <ul class="space-y-2">
          ${["Tentang Kami", "Blog", "Karir", "Press"]
            .map(
              (link) =>
                `<li><a href="#" class="text-slate-400 hover:text-emerald-400 text-sm transition-colors">${link}</a></li>`
            )
            .join("")}
        </ul>
      </div>

      <div>
        <h5 class="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h5>
        <ul class="space-y-2">
          ${["Bantuan", "Kontak", "Kebijakan Privasi", "Syarat & Ketentuan"]
            .map(
              (link) =>
                `<li><a href="#" class="text-slate-400 hover:text-emerald-400 text-sm transition-colors">${link}</a></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>

    <div class="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-slate-500 text-sm">© ${new Date().getFullYear()} Sipolin. Hak cipta dilindungi.</p>
      <p class="text-slate-600 text-xs">Digawe ning Indramayu, Indonesia</p>
    </div>
  </div>
</footer>`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    ${buildNavbar()}
    <main>
      ${buildHero()}
      ${buildTicker()}
      ${buildServices()}
      ${buildHowItWorks()}
      ${buildStackingCards()}
      ${buildHorizontalScroll()}
      ${buildFeatures()}
      ${buildAppPreview()}
      ${buildDownloadCTA()}
    </main>
    ${buildFooter()}
  `;
}

// ─── Init Functions ───────────────────────────────────────────────────────────

function initNavbar(): void {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const toggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add(
        "bg-white/90",
        "backdrop-blur-md",
        "shadow-sm",
        "shadow-slate-200/50"
      );
    } else {
      navbar.classList.remove(
        "bg-white/90",
        "backdrop-blur-md",
        "shadow-sm",
        "shadow-slate-200/50"
      );
    }
  });

  toggle?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("hidden");
  });

  mobileMenu?.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", () => mobileMenu.classList.add("hidden"));
  });
}

function initMagneticButtons(): void {
  if (prefersReducedMotion() || isMobile()) return;

  document.querySelectorAll<HTMLElement>(".magnetic-btn").forEach((button) => {
    button.addEventListener("mousemove", (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.18,
        y: y * 0.18,
        duration: 0.35,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.45)",
      });
    });
  });
}

function initHeroAnimation(): void {
  if (prefersReducedMotion()) return;

  gsap.set(".hero-line-1, .hero-line-2, .hero-line-3, .hero-line-4", {
    yPercent: 110,
  });

  const timeline = gsap.timeline({
    defaults: { ease: ANIM.ease, duration: ANIM.duration },
  });

  timeline
    .from(".hero-label", { opacity: 0, y: 20, duration: 0.6 })
    .to(
      ".hero-line-1, .hero-line-2, .hero-line-3, .hero-line-4",
      { yPercent: 0, stagger: 0.08, duration: 1.05 },
      "-=0.2"
    )
    .from(".hero-desc", { opacity: 0, y: 30, duration: 0.7 }, "-=0.55")
    .from(".hero-cta", { opacity: 0, y: 20, duration: 0.6 }, "-=0.5")
    .from(".hero-trust", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
    .from(
      ".hero-visual-card",
      { opacity: 0, x: 48, scale: 0.94, duration: 1 },
      "-=1"
    )
    .from(
      ".floating-status, .floating-rating",
      { opacity: 0, y: 24, stagger: 0.12 },
      "-=0.5"
    );
}

function initHeroImageParallax(): void {
  if (prefersReducedMotion() || isMobile()) return;

  gsap.to(".hero-rider-img", {
    y: -12,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
}

function initRevealAnimations(): void {
  if (prefersReducedMotion()) return;

  gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((element) => {
    const delay = parseFloat(element.style.getPropertyValue("--delay") || "0");

    gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".hiw-step").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      x: -40,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        once: true,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".feature-card").forEach((element, index) => {
    gsap.from(element, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      delay: index * 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function initStackingCards(): void {
  if (isMobile() || prefersReducedMotion()) return;

  const items = document.querySelectorAll<HTMLElement>(".stack-card-item");

  items.forEach((card, index) => {
    card.classList.add("stack-card");

    if (index < items.length - 1) {
      gsap.to(card, {
        scale: 0.95,
        transformOrigin: "top center",
        ease: "none",
        scrollTrigger: {
          trigger: items[index + 1],
          start: "top 140px",
          end: "top 80px",
          scrub: true,
        },
      });
    }
  });
}

function initHorizontalScroll(): void {
  const track = document.getElementById("hscroll-track");
  const outer = document.getElementById("hscroll-outer");

  if (!track || !outer) return;

  if (isMobile() || prefersReducedMotion()) {
    track.classList.remove("horizontal-track");
    track.style.flexWrap = "wrap";
    track.style.width = "auto";
    return;
  }

  const getScrollDistance = (): number => {
    const distance = track.scrollWidth - window.innerWidth + 120;
    return Math.max(distance, 0);
  };

  gsap.to(track, {
    x: () => -getScrollDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: outer,
      start: "top center",
      end: () => `+=${getScrollDistance()}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

function initAppPreviewParallax(): void {
  if (prefersReducedMotion() || isMobile()) return;

  const phones = document.querySelectorAll<HTMLElement>(".app-phone");

  phones.forEach((phone, index) => {
    const direction = index === 0 ? -1 : index === 2 ? 1 : 0;
    const yAmount = index === 1 ? -30 : -15;

    gsap.to(phone, {
      y: yAmount,
      x: direction * 10,
      ease: "none",
      scrollTrigger: {
        trigger: "#app-preview",
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  });
}

function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector<HTMLElement>(href);

      if (target) {
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

function init(): void {
  render();
  initNavbar();
  initSmoothScroll();

  requestAnimationFrame(() => {
    initHeroAnimation();
    initHeroImageParallax();
    initMagneticButtons();
    initRevealAnimations();
    initStackingCards();
    initHorizontalScroll();
    initAppPreviewParallax();

    ScrollTrigger.refresh();
  });
}

document.addEventListener("DOMContentLoaded", init);