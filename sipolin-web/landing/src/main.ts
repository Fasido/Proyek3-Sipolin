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
  logo: "/images/logo1.png",
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
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>`,
    title: "Real-time Tracking",
    description:
      "Pantau posisi driver secara langsung di peta. Tidak perlu tebak-tebakan kapan sampai.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>`,
    title: "Direct Chat",
    description:
      "Komunikasi langsung dengan driver via in-app chat. Koordinasi jadi lebih mudah.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,
    title: "Local Trust",
    description:
      "Driver lokal Indramayu yang terverifikasi. Aman, dekat, dan paham jalanan setempat.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>`,
    title: "Cepat & Tepat",
    description:
      "Estimasi waktu akurat. Driver langsung bergerak begitu order diterima.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>`,
    title: "Harga Transparan",
    description:
      "Tarif jelas sebelum berangkat. Tidak ada biaya tersembunyi atau kejutan di akhir.",
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

function isValidDownloadUrl(url: string): boolean {
  if (!url || url.trim() === "" || url === "#") return false;

  if (url.startsWith("#download")) return true;

  return url.startsWith("http") || url.startsWith("/") || url.startsWith("./");
}

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
      onerror="this.style.opacity='0'"
    />
  `;
}

// ─── Page Loader ──────────────────────────────────────────────────────────────

function buildPageLoader(): string {
  return `
<div id="page-loader" class="page-loader" aria-hidden="true">
  <div class="page-loader-logo">
    <div class="page-loader-logo-icon">
      ${imageTag(ASSETS.logo, "Sipolin", "h-7 w-7 object-contain")}
    </div>
    <span>Sipolin</span>
  </div>
  <div class="page-loader-spinner" role="status" aria-label="Memuat..."></div>
  <div class="page-loader-text">Menyiapkan layanan...</div>
</div>`;
}

// ─── Download Modal ───────────────────────────────────────────────────────────

function buildDownloadModal(): string {
  return `
<div id="download-modal-backdrop" class="download-modal-backdrop" role="dialog" aria-modal="true" aria-label="Notifikasi Download">
  <div class="download-modal" id="download-modal">
    <button id="download-modal-close" class="download-modal-close" aria-label="Tutup">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M12 4L4 12M4 4l8 8"/>
      </svg>
    </button>

    <div class="download-modal-icon">🚀</div>

    <h3>Aplikasi Sipolin<br/>segera tersedia</h3>

    <p>File APK dan Play Store sedang disiapkan. Pantau terus website ini ya — kita bakal kasih kabar pertama kali.</p>

    <button class="download-modal-cta" id="download-modal-ok">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M13 4L6 11 3 8"/>
      </svg>
      Siap, pantau terus!
    </button>
  </div>
</div>`;
}

// ─── Builders ─────────────────────────────────────────────────────────────────

function buildNavbar(): string {
  return `
<nav id="navbar" class="fixed top-0 left-0 right-0 z-50">
  <div class="max-w-6xl mx-auto px-5 md:px-6 h-16 md:h-[70px] flex items-center justify-between gap-4">

    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 font-black text-lg text-slate-900 flex-shrink-0">
      <span class="brand-logo grid h-10 w-10 place-items-center rounded-[14px] overflow-hidden"
            style="background: linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%); border: 1px solid #A7F3D0; box-shadow: 0 4px 12px rgba(16,185,129,0.15);">
        ${imageTag(ASSETS.logo, "Logo Sipolin", "h-7 w-7 object-contain")}
      </span>
      <span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Sipolin</span>
    </a>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Desktop nav links -->
    <div class="hidden md:flex items-center gap-6 mr-6">
      ${NAV_LINKS.map(
        (link) =>
          `<a href="${link.href}" class="nav-link">${link.label}</a>`
      ).join("")}
    </div>

    <!-- Download button (desktop) -->
    <a
      href="#download"
      data-download-link
      class="magnetic-btn hidden md:inline-flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-full flex-shrink-0 transition-all duration-300"
      style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.3);"
    >
      Download
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <path d="M8 2v8M5 7l3 3 3-3"/>
        <path d="M2 12h12"/>
      </svg>
    </a>

    <!-- Hamburger (mobile) -->
    <button id="menu-toggle" class="md:hidden flex flex-col gap-[5px] p-2 -mr-1" aria-label="Buka menu" aria-expanded="false">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>
  </div>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden md:hidden bg-white/97 backdrop-blur-xl px-5 py-4 space-y-1 shadow-xl"
       style="border-top: 1px solid #E2E8F0;">
    ${NAV_LINKS.map(
      (link) =>
        `<a href="${link.href}" class="mobile-nav-link">${link.label}</a>`
    ).join("")}
    <div class="pt-3 pb-1">
      <a
        href="#download"
        data-download-link
        class="flex items-center justify-center gap-2 text-white font-bold text-sm px-5 py-3 rounded-full w-full transition-all duration-300"
        style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 6px 20px rgba(16,185,129,0.25);"
      >
        Download Sipolin
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M8 2v8M5 7l3 3 3-3"/>
          <path d="M2 12h12"/>
        </svg>
      </a>
    </div>
  </div>
</nav>`;
}

function buildDriverStatusCard(): string {
  return `
<div class="floating-status absolute left-0 top-12 z-30 bg-white/95 backdrop-blur-sm rounded-[1.75rem] shadow-xl px-4 py-3 flex items-center gap-3"
     style="border: 1px solid #A7F3D0;">
  <div class="grid w-12 h-12 place-items-center rounded-2xl overflow-hidden shadow-sm p-1"
       style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);">
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
    <div class="text-[11px] font-bold" style="color: #10B981;">2 menit lagi</div>
  </div>
</div>`;
}

function buildHero(): string {
  return `
<section id="hero" class="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
  <div class="hero-noise"></div>

  <div class="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center w-full">
    <div class="fade-up">
      <div class="hero-label section-label mb-6">
        <span class="w-2 h-2 rounded-full animate-ping" style="background: #10B981;"></span>
        <span class="ml-2">Polindra dan sekitarnya</span>
      </div>

      <h1 class="hero-headline font-black text-slate-900 leading-[0.92] tracking-[-0.07em] mb-7"
          style="font-size: clamp(3.2rem, 7vw, 6.8rem);">
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-1 block">Sipolin:</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-2 block" style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Solusi</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-3 block" style="background: linear-gradient(135deg, #059669, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Mobilitas</span>
        </span>
        <span class="hero-line block overflow-hidden">
          <span class="hero-line-4 block">Indramayu.</span>
        </span>
      </h1>

      <p class="hero-desc text-lg text-slate-500 leading-relaxed max-w-md mb-8">
        Layanan on-demand untuk antar jemput, kirim barang, dan titip kebutuhan harian warga Indramayu.
      </p>

      <div class="hero-cta flex flex-wrap gap-3">
        <a
          href="${downloadAndroidUrl}"
          data-download-link
          class="group magnetic-btn text-white px-8 py-4 rounded-full font-bold text-base inline-flex items-center gap-2 transition-all duration-300"
          style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 16px 48px rgba(16,185,129,0.32);"
        >
          Download Now
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="group-hover:translate-y-0.5 transition-transform">
            <path d="M9 2v9M6 8l3 3 3-3"/>
            <path d="M2 14h14"/>
          </svg>
        </a>
        <a href="#services" class="border-2 font-bold text-base px-8 py-4 rounded-full inline-flex items-center gap-2 transition-all duration-300"
           style="border-color: #A7F3D0; color: #059669; background: transparent;"
           onmouseover="this.style.background='#ECFDF5';this.style.borderColor='#10B981';"
           onmouseout="this.style.background='transparent';this.style.borderColor='#A7F3D0';">
          Lihat Layanan
        </a>
      </div>

      <div class="hero-trust flex items-center gap-6 mt-10 pt-8" style="border-top: 1px solid #E2E8F0;">
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">Segera</div>
          <div class="text-xs text-slate-400 mt-0.5">Hadir</div>
        </div>
        <div class="w-px h-10" style="background: #E2E8F0;"></div>
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">Driver</div>
          <div class="text-xs text-slate-400 mt-0.5">Lokal</div>
        </div>
        <div class="w-px h-10" style="background: #E2E8F0;"></div>
        <div class="group cursor-pointer">
          <div class="font-black text-2xl text-slate-900 transition-colors" style="transition: color 0.2s;">IDM</div>
          <div class="text-xs text-slate-400 mt-0.5">Indramayu</div>
        </div>
      </div>
    </div>

    <div class="hero-phone relative flex items-center justify-center min-h-[460px] md:min-h-[560px]">
      <div class="absolute w-72 h-72 rounded-full opacity-50 blur-3xl right-0 top-14 pointer-events-none"
           style="background: rgba(16, 185, 129, 0.18);"></div>
      <div class="absolute w-44 h-44 rounded-full opacity-40 blur-2xl left-6 bottom-8 pointer-events-none"
           style="background: rgba(5, 150, 105, 0.14);"></div>

      <div class="hero-visual-card relative z-10 w-full max-w-[420px] rounded-[2.5rem] p-4 md:p-5 overflow-hidden"
           style="border: 1px solid #A7F3D0; background: white; box-shadow: 0 32px 80px rgba(16,185,129,0.12), 0 0 0 1px rgba(167,243,208,0.4);">
        ${imageTag(
          ASSETS.polrideHero,
          "Ilustrasi Driver Sipolin",
          "hero-rider-img w-full max-h-[360px] md:max-h-[460px] object-contain rounded-[2rem]",
          "eager"
        )}
      </div>

      ${buildDriverStatusCard()}

      <div class="floating-rating absolute right-0 bottom-16 z-30 bg-white/95 backdrop-blur-sm rounded-[1.5rem] shadow-xl px-4 py-3"
           style="border: 1px solid #A7F3D0;">
        <div class="text-[10px] text-slate-400 mb-1">Rating Driver</div>
        <div class="flex gap-0.5 text-yellow-400 text-xs">★★★★★</div>
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
<div class="py-4 overflow-hidden" style="background: linear-gradient(90deg, #047857 0%, #059669 50%, #047857 100%);">
  <div class="ticker-inner whitespace-nowrap">
    ${repeat
      .map(
        (item) =>
          `<span class="inline-block text-white font-black text-sm mx-4 uppercase tracking-[0.2em] hover:scale-110 transition-transform duration-300">${item}</span><span class="inline-block mx-2" style="color: #A7F3D0;">✦</span>`
      )
      .join("")}
  </div>
</div>`;
}

function buildServices(): string {
  return `
<section id="services" class="py-24" style="background: linear-gradient(to bottom, #ffffff, #F8FAFC);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Layanan Kami</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Tiga layanan,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">satu aplikasi.</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6 md:gap-8">
      ${SERVICES.map(
        (service, index) => `
      <article class="card-service reveal-card group cursor-pointer" style="--delay: ${index * 0.15}s;">
        <div class="mb-5 grid h-24 w-24 place-items-center overflow-hidden rounded-2xl transition-all duration-500"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${imageTag(
            service.image,
            service.name,
            "h-16 w-16 object-contain rounded-xl bg-white p-2 transition-all duration-500 group-hover:scale-110"
          )}
        </div>

        <div class="section-label text-xs mb-1">${service.tagline}</div>
        <h3 class="text-xl font-black text-slate-900 mb-2">${service.name}</h3>
        <p class="text-slate-500 text-sm leading-relaxed">${service.description}</p>

        <div class="mt-5 pt-4" style="border-top: 1px solid #E2E8F0;">
          <a href="#download" data-download-link class="font-bold text-sm flex items-center gap-1 transition-all group" style="color: #059669;">
            Coba Sekarang
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="group-hover:translate-x-1 transition-transform">
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
      <div class="fade-right">
        <div class="section-label mb-6">
          <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
          <span class="ml-2">Cara Ngangoe</span>
        </div>

        <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mb-12">
          Semudah<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">tiga langkah.</span>
        </h2>

        <div class="space-y-8">
          ${HOW_IT_WORKS.map(
            (step, index) => `
          <div class="hiw-step flex gap-5 items-start group cursor-pointer" style="--i: ${index}">
            <div class="flex-shrink-0">
              <div class="font-black leading-none tracking-[-0.08em] group-hover:scale-110 transition-transform duration-300"
                   style="font-size: clamp(3rem, 5vw, 4.5rem); background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${step.number}</div>
            </div>
            <div class="pt-2">
              <h3 class="text-xl font-black text-slate-900 mb-1 transition-colors group-hover:text-emerald-600">${step.title}</h3>
              <p class="text-slate-500 leading-relaxed">${step.description}</p>
            </div>
          </div>
          ${index < HOW_IT_WORKS.length - 1 ? `<div class="ml-8 w-px h-8" style="background: linear-gradient(to bottom, #10B981, #A7F3D0);"></div>` : ""}`
          ).join("")}
        </div>
      </div>

      <div class="relative flex justify-center fade-left">
        <div class="absolute w-96 h-96 rounded-full opacity-40 blur-3xl pointer-events-none"
             style="background: radial-gradient(circle, rgba(16,185,129,0.2), rgba(5,150,105,0.1));"></div>

        <div class="relative z-10 grid grid-cols-2 gap-4 w-full max-w-md">
          <div class="bg-white rounded-3xl p-5 shadow-xl col-span-2 hover:shadow-2xl transition-shadow"
               style="border: 1px solid #A7F3D0;">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-8 h-8 rounded-xl text-white text-xs font-bold shadow-lg flex items-center justify-center"
                   style="background: linear-gradient(135deg, #059669, #10B981);">1</div>
              <span class="font-black text-slate-800 text-sm">Pol-Ride dipilih</span>
              <span class="ml-auto text-xs font-bold animate-pulse" style="color: #10B981;">✓ Aktif</span>
            </div>
            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full w-1/3 rounded-full animate-pulse" style="background: linear-gradient(90deg, #059669, #10B981);"></div>
            </div>
          </div>

          <div class="driver-mini-card relative overflow-hidden rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all group cursor-pointer"
               style="background: linear-gradient(135deg, #047857, #059669);">
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl group-hover:scale-150 transition-transform"></div>

            <div class="relative mb-4 h-24 w-full overflow-hidden rounded-xl bg-white shadow-lg">
              ${imageTag(
                ASSETS.polrideMini,
                "Driver Sipolin",
                "driver-mini-img absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain group-hover:scale-110 transition-transform duration-500"
              )}
            </div>

            <div class="relative z-10 text-white font-black text-base leading-tight">Driver Siap</div>
            <div class="relative z-10 mt-1 text-sm font-semibold" style="color: #A7F3D0;">2 menit lagi</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all" style="border: 1px solid #A7F3D0;">
            <div class="text-3xl mb-2">📍</div>
            <div class="text-slate-800 font-black text-sm">Lokasi</div>
            <div class="text-slate-400 text-xs">Indramayu Kota</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-xl col-span-2 hover:shadow-2xl transition-all" style="border: 1px solid #A7F3D0;">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-slate-400 text-xs mb-1">Estimasi tiba</div>
                <div class="text-slate-900 font-black text-lg">5 menit</div>
              </div>
              <div class="text-right">
                <div class="text-slate-400 text-xs mb-1">Tarif</div>
                <div class="font-black text-lg" style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Rp 8.000</div>
              </div>
              <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                   style="background: linear-gradient(135deg, #059669, #10B981);">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">
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
<section id="showcase" class="py-24" style="background: linear-gradient(to bottom, #F8FAFC, #ffffff);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Showcase</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Semua ada,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">semua bisa.</span>
      </h2>
    </div>

    <div id="stack-container" class="relative min-h-[600px]">
      ${SERVICES.map(
        (service, index) => `
      <article class="stack-card-item bg-white rounded-3xl p-8 md:p-12 shadow-xl mb-6 md:mb-0 hover:shadow-2xl transition-all duration-500"
        style="top: ${120 + index * 20}px; z-index: ${10 + index}; border: 1px solid #E2E8F0;">
        <div class="flex flex-col md:flex-row gap-8 items-center">
          <div class="flex-1">
            <div class="grid w-20 h-20 place-items-center overflow-hidden rounded-2xl mb-6"
                 style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);">
              ${imageTag(service.image, service.name, "h-14 w-14 object-contain rounded-xl bg-white p-2")}
            </div>
            <div class="section-label mb-2">${service.tagline}</div>
            <h3 class="text-3xl font-black text-slate-900 mb-3">${service.name}</h3>
            <p class="text-slate-500 leading-relaxed mb-6">${service.description}</p>
            <a href="#download" data-download-link class="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all hover:scale-105"
               style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.22);">
              Download App
            </a>
          </div>

          <div class="flex-shrink-0">
            <div class="w-64 h-64 rounded-3xl flex items-center justify-center overflow-hidden p-4 hover:scale-105 transition-transform duration-500"
                 style="background: linear-gradient(135deg, #ECFDF5, #ffffff, #ECFDF5); border: 2px solid #A7F3D0;">
              ${imageTag(service.image, service.name, "w-48 h-48 object-contain rounded-2xl bg-white p-3")}
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
      <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
      <span class="ml-2">Nitip Apa Aja</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em]">
        Nitip apa aja,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">dari mana aja.</span>
      </h2>
      <p class="text-slate-500 max-w-xs leading-relaxed">
        Pesan dari restoran, warung, toko, kampus, rumah, atau titik custom manapun di Indramayu.
      </p>
    </div>
  </div>

  <div id="hscroll-outer" class="relative pl-6 md:pl-[calc((100vw-72rem)/2+1.5rem)] overflow-hidden">
    <div id="hscroll-track" class="horizontal-track flex gap-6">
      ${SEND_CARDS.map(
        (card) => `
      <article class="flex-shrink-0 w-72 md:w-80 bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer"
               style="border: 2px solid #E2E8F0;"
               onmouseover="this.style.borderColor='#A7F3D0'"
               onmouseout="this.style.borderColor='#E2E8F0'">
        <div class="mb-5 grid h-36 w-full place-items-center overflow-hidden rounded-2xl transition-all duration-500"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${imageTag(card.image, card.title, "h-28 w-28 object-contain rounded-xl bg-white p-2 group-hover:scale-110 transition-transform duration-500")}
        </div>
        <h4 class="font-black text-slate-900 text-lg mb-2 transition-colors group-hover:text-emerald-600">${card.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${card.subtitle}</p>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildFeatures(): string {
  return `
<section id="features" class="py-24" style="background: linear-gradient(to bottom, #ffffff, #F8FAFC);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Fitur Unggulan</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Didesain untuk<br/>kenyamanan <span style="color: #10B981;">kamu</span>
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      ${FEATURES.map(
        (feature, index) => `
      <article class="feature-card bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-500 group cursor-pointer hover:-translate-y-1 reveal-card"
               style="--delay: ${index * 0.1}s; border: 1px solid #E2E8F0;"
               onmouseover="this.style.borderColor='#A7F3D0'"
               onmouseout="this.style.borderColor='#E2E8F0'">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110"
             style="background: linear-gradient(135deg, #ECFDF5, #A7F3D0);"
             onmouseover="this.style.background='linear-gradient(135deg,#059669,#10B981)'"
             onmouseout="this.style.background='linear-gradient(135deg,#ECFDF5,#A7F3D0)'">
          ${feature.icon}
        </div>
        <h4 class="font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">${feature.title}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">${feature.description}</p>
      </article>`
      ).join("")}
    </div>
  </div>
</section>`;
}

function buildPhoneMockup(content: string): string {
  return `
<div class="phone-mockup relative">
  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-6 rounded-b-xl z-10" style="background: #0F172A;"></div>
  <div class="phone-screen bg-white h-full overflow-hidden">
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
    <div class="app-phone absolute transition-all duration-500 hover:z-50" style="transform: ${rotate} scale(${scale}); z-index: ${zIndex};">
      ${buildPhoneMockup(`
        <div class="h-full flex flex-col items-center justify-center gap-4 px-5" style="background: linear-gradient(180deg, #ECFDF5, #ffffff);">
          <div class="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl shadow-xl"
               style="background: linear-gradient(135deg, #A7F3D0, #ECFDF5); border: 2px solid #A7F3D0;">
            ${imageTag(image, label, "h-24 w-24 object-contain rounded-xl bg-white p-2")}
          </div>
          <div class="text-slate-800 font-black text-base">${label}</div>
          <div class="flex gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse" style="background: #10B981;"></div>
            <div class="w-2 h-2 rounded-full" style="background: #A7F3D0;"></div>
            <div class="w-2 h-2 rounded-full" style="background: #BBF7D0;"></div>
          </div>
          <div class="mt-4 w-full">
            <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full w-2/3 rounded-full" style="background: linear-gradient(90deg, #059669, #10B981);"></div>
            </div>
          </div>
        </div>
      `)}
    </div>`;

  return `
<section id="app-preview" class="py-24 bg-white overflow-hidden">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-20">
      <div class="section-label justify-center">
        <span class="w-2 h-2 rounded-full" style="background: #10B981;"></span>
        <span class="ml-2">Aplikasi</span>
      </div>
      <h2 class="text-4xl md:text-5xl font-black text-slate-900 tracking-[-0.05em] mt-4">
        Simpel dari genggaman,<br/><span style="background: linear-gradient(135deg, #047857, #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">kuat dalam layanan.</span>
      </h2>
    </div>

    <div class="relative flex justify-center items-center" style="height: 560px;">
      ${makePhone("Pol-Send", ASSETS.polsendPackaging, "0.85", "translateX(-200px) rotate(-12deg)", "1")}
      ${makePhone("Pol-Ride", ASSETS.polrideMini, "1.1", "translateX(0) translateY(-20px)", "3")}
      ${makePhone("Nitip Apa Aja", ASSETS.nitipBowl, "0.85", "translateX(200px) rotate(12deg)", "1")}
      <div class="absolute w-96 h-96 rounded-full opacity-30 blur-3xl bottom-0 pointer-events-none"
           style="background: radial-gradient(circle, rgba(16,185,129,0.25), rgba(5,150,105,0.1));"></div>
    </div>
  </div>
</section>`;
}

function buildDownloadCTA(): string {
  return `
<section id="download" class="relative py-24 overflow-hidden" style="background: linear-gradient(135deg, #0F172A 0%, #064E3B 60%, #022c22 100%);">
  <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 50% -10%, rgba(16,185,129,0.2), transparent 50%);"></div>
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse" style="background: #10B981;"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse" style="background: #059669; animation-delay: 1s;"></div>
  </div>
  <div class="absolute inset-0 pointer-events-none opacity-[0.04]"
       style="background-image: linear-gradient(rgba(167,243,208,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(167,243,208,0.4) 1px, transparent 1px); background-size: 56px 56px;"></div>

  <div class="relative max-w-4xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest mb-6" style="color: #A7F3D0;">
      <span class="w-2 h-2 rounded-full animate-ping" style="background: #10B981;"></span>
      <span>Download Sekarang</span>
    </div>

    <h2 class="text-4xl md:text-6xl font-black text-white tracking-[-0.06em] mb-6">
      Gerak lebih simpel<br/><span style="background: linear-gradient(135deg, #10B981, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">bersama Sipolin.</span>
    </h2>

    <p class="text-lg max-w-md mx-auto mb-10 leading-relaxed" style="color: #94A3B8;">
      Satu aplikasi untuk mobilitas, pengiriman, dan kebutuhan harian warga Indramayu.
    </p>

    <div class="flex flex-col sm:flex-row gap-5 justify-center">
      <a
        href="${downloadAndroidUrl}"
        data-download-link
        class="group bg-white text-slate-900 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
        aria-label="Download Sipolin di Google Play"
        target="_blank"
      >
        <svg viewBox="0 0 48 48" class="h-8 w-8" aria-hidden="true">
          <path fill="#34A853" d="M7.6 4.7c-.7.8-1.1 2-1.1 3.4v31.8c0 1.4.4 2.6 1.1 3.4L25.8 24 7.6 4.7z"/>
          <path fill="#4285F4" d="M31.7 17.8 25.8 24 7.6 4.7c.9-.9 2.3-1 3.8-.2l20.3 13.3z"/>
          <path fill="#FBBC05" d="M31.7 30.2 25.8 24l5.9-6.2 7.2 4.7c2.1 1.4 2.1 3.6 0 5l-7.2 4.7z"/>
          <path fill="#EA4335" d="M7.6 43.3 25.8 24l5.9 6.2-20.3 13.3c-1.5.8-2.9.7-3.8-.2z"/>
        </svg>

        <div class="text-left leading-none">
          <div class="text-[10px] font-bold text-slate-500 mb-1">GET IT ON</div>
          <div class="text-base font-black tracking-tight">Google Play</div>
        </div>
      </a>

      <a
        href="${downloadIosUrl}"
        data-download-link
        class="group px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 inline-flex items-center gap-3 hover:scale-105"
        style="background: linear-gradient(135deg, #059669, #10B981); color: white; box-shadow: 0 16px 48px rgba(16,185,129,0.3);"
        aria-label="Download Sipolin di App Store"
        target="_blank"
      >
        <svg viewBox="0 0 24 24" class="h-8 w-8 fill-white" aria-hidden="true">
          <path d="M17.05 12.56c-.03-3.01 2.46-4.45 2.57-4.52-1.4-2.05-3.58-2.33-4.36-2.36-1.85-.19-3.61 1.09-4.55 1.09-.94 0-2.39-1.06-3.93-1.03-2.02.03-3.88 1.17-4.92 2.98-2.1 3.64-.54 9.03 1.51 11.98 1 1.45 2.2 3.08 3.77 3.02 1.51-.06 2.08-.98 3.91-.98 1.82 0 2.34.98 3.94.95 1.63-.03 2.66-1.48 3.65-2.93 1.15-1.68 1.62-3.31 1.65-3.39-.04-.02-3.17-1.22-3.24-4.81z"/>
          <path d="M14.05 3.72c.83-1 1.39-2.39 1.24-3.78-1.2.05-2.66.8-3.52 1.8-.77.89-1.44 2.31-1.26 3.67 1.34.1 2.71-.68 3.54-1.69z"/>
        </svg>

        <div class="text-left leading-none">
          <div class="text-[10px] font-bold mb-1" style="color: #A7F3D0;">DOWNLOAD ON THE</div>
          <div class="text-base font-black tracking-tight">App Store</div>
        </div>
      </a>
    </div>

    <div class="mt-12 text-sm" style="color: #64748B;">
      Tersedia untuk Android dan iOS
    </div>
  </div>
</section>`;
}

function buildFooter(): string {
  return `
<footer id="about" class="py-16" style="background: #0F172A; border-top: 1px solid rgba(16,185,129,0.12);">
  <div class="max-w-6xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-10 mb-12">
      <div class="md:col-span-1">
        <a href="/" class="flex items-center gap-3 font-black text-xl text-white mb-3">
          <span class="grid h-11 w-11 place-items-center rounded-2xl shadow-lg overflow-hidden"
                style="background: linear-gradient(135deg, #059669, #10B981); box-shadow: 0 8px 24px rgba(16,185,129,0.3);">
            ${imageTag(ASSETS.logo, "Logo Sipolin", "h-8 w-8 object-contain")}
          </span>
          <span style="background: linear-gradient(135deg, #10B981, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Sipolin</span>
        </a>

        <p class="text-sm leading-relaxed" style="color: #64748B;">
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
                `<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${link}</a></li>`
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
                `<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${link}</a></li>`
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
                `<li><a href="#" class="text-sm transition-colors hover:translate-x-1 inline-block" style="color: #64748B;" onmouseover="this.style.color='#10B981'" onmouseout="this.style.color='#64748B'">${link}</a></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>

    <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style="border-top: 1px solid rgba(255,255,255,0.06);">
      <p class="text-sm" style="color: #475569;">© ${new Date().getFullYear()} Sipolin. Hak cipta dilindungi.</p>
      <p class="text-xs" style="color: #334155;">Digawe ning Indramayu, Indonesia</p>
    </div>
  </div>
</footer>`;
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    ${buildPageLoader()}
    ${buildDownloadModal()}
    <div id="cursor-glow" class="cursor-glow" aria-hidden="true"></div>
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

function initPageLoader(): void {
  const loader = document.getElementById("page-loader");
  if (!loader) return;

  const hideLoader = () => {
    if (prefersReducedMotion()) {
      loader.style.display = "none";
      return;
    }

    gsap.to(loader, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut",
      delay: 0.6,
      onComplete: () => {
        loader.style.display = "none";
      },
    });
  };

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
    setTimeout(hideLoader, 3000);
  }
}

function initCursorGlow(): void {
  if (isMobile() || prefersReducedMotion()) return;

  const glow = document.getElementById("cursor-glow");
  if (!glow) return;

  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener("mousemove", (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.to(glow, {
      x: mouseX,
      y: mouseY,
      duration: 0.6,
      ease: "power2.out",
    });
  });

  document.addEventListener("mouseleave", () => {
    gsap.to(glow, { opacity: 0, duration: 0.3 });
  });

  document.addEventListener("mouseenter", () => {
    gsap.to(glow, { opacity: 1, duration: 0.3 });
  });
}

function initDownloadNotification(): void {
  const backdrop = document.getElementById("download-modal-backdrop");
  const closeBtn = document.getElementById("download-modal-close");
  const okBtn = document.getElementById("download-modal-ok");

  if (!backdrop) return;

  const openModal = () => {
    backdrop.classList.add("is-open");
  };

  const closeModal = () => {
    backdrop.classList.remove("is-open");
  };

  // Intercept all data-download-link elements
  document.querySelectorAll<HTMLAnchorElement>("[data-download-link]").forEach((el) => {
    el.addEventListener("click", (e: Event) => {
  const href = el.getAttribute("href") || "";

  if (href === "#download") {
    return;
  }

  if (!isValidDownloadUrl(href)) {
    e.preventDefault();
    openModal();
  }
});
  });

  closeBtn?.addEventListener("click", closeModal);
  okBtn?.addEventListener("click", closeModal);

  backdrop.addEventListener("click", (e: Event) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  });
}

function initNavbar(): void {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const toggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }, { passive: true });

  toggle?.addEventListener("click", () => {
    const isOpen = !mobileMenu?.classList.contains("hidden");

    if (isOpen) {
      mobileMenu?.classList.add("hidden");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      mobileMenu?.classList.remove("hidden");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  mobileMenu?.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      toggle?.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
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
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.4,
        ease: "power2.out",
      });
    });

    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
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
    y: -15,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.2,
    },
  });
}

function initRevealAnimations(): void {
  if (prefersReducedMotion()) return;

  gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((element) => {
    const delay = parseFloat(element.style.getPropertyValue("--delay") || "0");

    gsap.from(element, {
      opacity: 0,
      y: 60,
      duration: 0.9,
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
      x: -50,
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
      y: 50,
      duration: 0.8,
      delay: index * 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".fade-right").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      x: -60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        once: true,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".fade-left").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      x: 60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
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
        scale: 0.96,
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
    track.style.justifyContent = "center";
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
      scrub: 1.2,
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
    const yAmount = index === 1 ? -40 : -20;

    gsap.to(phone, {
      y: yAmount,
      x: direction * 15,
      rotation: index === 0 ? -2 : index === 2 ? 2 : 0,
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

function addCustomStyles(): void {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .animate-marquee {
      animation: marquee 20s linear infinite;
    }

    .delay-1000 {
      animation-delay: 1s;
    }

    .hover-lift {
      transition: all 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(16,185,129,0.12);
    }

    /* Smooth hero trust stat hover */
    .hero-trust > div:hover > div:first-child {
      color: #10B981 !important;
    }

    /* Feature icon color fix on hover */
    .feature-card:hover svg {
      stroke: white;
    }
  `;
  document.head.appendChild(style);
}

function init(): void {
  render();
  initPageLoader();
  initNavbar();
  initSmoothScroll();
  addCustomStyles();
  initCursorGlow();
  initDownloadNotification();

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