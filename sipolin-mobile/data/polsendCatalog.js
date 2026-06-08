// sipolin-mobile/data/polsendCatalog.js
// Dataset lokal Batch 8A dari hasil riset Gemini + helper search Sipolin.
// Kamu boleh tambah/ubah data merchant/menu di RAW_POLSEND_MERCHANTS.
// Search sudah dibuat luas: ketik "geprek", "nasgor", "obat", "kopken", dll tetap muncul.

const RAW_POLSEND_CATEGORIES = [
  { id: "all", label: "Semua", icon: "grid" },
  { id: "seblak", label: "Seblak", icon: "bowl" },
  { id: "esteh", label: "Es Teh", icon: "cup" },
  { id: "geprek", label: "Geprek", icon: "flame" },
  { id: "nasigoreng", label: "Nasi Goreng", icon: "restaurant" },
  { id: "martabak", label: "Martabak", icon: "moon" },
  { id: "mie", label: "Mie", icon: "fast-food" },
  { id: "kopi", label: "Kopi", icon: "cafe" },
  { id: "minimarket", label: "Minimarket", icon: "cart" },
  { id: "obat", label: "Obat & Apotek", icon: "medkit" },
  { id: "warung", label: "Warung Nasi", icon: "home" },
  { id: "cafe", label: "Cafe & Nongkrong", icon: "cafe" }
];

const RAW_POLSEND_MERCHANTS = [
  {
    id: "mimi-krasak",
    name: "Warung Nasi Mimi Krasak",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "H7RP+FVJ, Teluk Bayur, RT.23/RW.05, Krasak, Kec. Jatibarang, Kabupaten Indramayu, Jawa Barat 45273",
    plusCode: "H7RP+FVJ",
    googleMapsQuery: "Warung Nasi Mimi Krasak H7RP+FVJ Teluk Bayur Krasak Jatibarang Indramayu",
    latitude: -6.408813,
    longitude: 108.287188,
    rating: 4.8,
    distanceLabel: "3.5 km",
    imageKey: "warung",
    tags: ["khas indramayu", "nasi rames", "populer"],
    menus: [
      { id: "mk-1", name: "Nasi Rames Mimi", price: 15000, imageKey: "warung", description: "Nasi rames lauk pauk lengkap", isPopular: true },
      { id: "mk-2", name: "Ayam Goreng Serundeng", price: 12000, imageKey: "warung", description: "Ayam goreng bumbu serundeng khas", isPopular: true },
      { id: "mk-3", name: "Pedesan Entog", price: 25000, imageKey: "warung", description: "Pedesan entog kuah gurih", isPopular: true },
      { id: "mk-4", name: "Es Teh Manis", price: 4000, imageKey: "esteh", description: "Es teh seduh", isPopular: false }
    ]
  },
  {
    id: "warung-meta",
    name: "Warung Meta",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "Area Lohbener",
    latitude: -6.442100,
    longitude: 108.281500,
    rating: 4.6,
    distanceLabel: "0.8 km",
    imageKey: "warung",
    tags: ["nongkrong", "murah", "kopi"],
    menus: [
      { id: "wm-1", name: "Indomie Rebus Telur", price: 10000, imageKey: "mie", description: "Indomie rebus pakai telur iris cabe", isPopular: true },
      { id: "wm-2", name: "Nasi Orek Tempe", price: 8000, imageKey: "warung", description: "Nasi putih dan orek tempe kering", isPopular: false },
      { id: "wm-3", name: "Sosis Bakar", price: 5000, imageKey: "warung", description: "Sosis sapi bakar bumbu BBQ", isPopular: false },
      { id: "wm-4", name: "Kopi Hitam", price: 4000, imageKey: "kopi", description: "Kopi seduh panas", isPopular: true }
    ]
  },
  {
    id: "esteh-ibukota",
    name: "Es Teh Ibukota",
    category: "esteh",
    categoryLabel: "Es Teh",
    address: "Jl. Raya Lohbener - Indramayu",
    latitude: -6.440000,
    longitude: 108.280000,
    rating: 4.7,
    distanceLabel: "1.0 km",
    imageKey: "esteh",
    tags: ["minuman", "segar", "hits"],
    menus: [
      { id: "ei-1", name: "Es Teh Original", price: 5000, imageKey: "esteh", description: "Es teh manis khas Ibukota", isPopular: true },
      { id: "ei-2", name: "Es Teh Kampul", price: 7000, imageKey: "esteh", description: "Es teh dengan irisan jeruk nipis", isPopular: true },
      { id: "ei-3", name: "Es Teh Leci", price: 10000, imageKey: "esteh", description: "Es teh rasa leci", isPopular: false },
      { id: "ei-4", name: "Milo Dinosaur", price: 12000, imageKey: "esteh", description: "Es milo dengan taburan bubuk milo tebal", isPopular: true }
    ]
  },
  {
    id: "dimsum-prince",
    name: "Dimsum Prince",
    category: "cafe",
    categoryLabel: "Cafe",
    address: "H7XM+93J, Jl. Raya Lohbener, Lohbener, Kec. Lohbener, Kabupaten Indramayu, Jawa Barat 45252",
    plusCode: "H7XM+93J",
    googleMapsQuery: "Dimsum Prince H7XM+93J Jl. Raya Lohbener Lohbener Indramayu",
    latitude: -6.401563,
    longitude: 108.282688,
    rating: 4.8,
    distanceLabel: "13.5 km",
    imageKey: "cafe",
    tags: ["dimsum", "jajanan", "hits"],
    menus: [
      { id: "dp-1", name: "Dimsum Ayam", price: 15000, imageKey: "cafe", description: "Isi 4 pcs, daging ayam padat", isPopular: true },
      { id: "dp-2", name: "Dimsum Udang", price: 18000, imageKey: "cafe", description: "Isi 4 pcs, udang utuh", isPopular: true },
      { id: "dp-3", name: "Lumpia Kulit Tahu", price: 15000, imageKey: "cafe", description: "Lumpia goreng isi ayam udang", isPopular: false },
      { id: "dp-4", name: "Hakau", price: 18000, imageKey: "cafe", description: "Kulit transparan isi udang", isPopular: false }
    ]
  },
  {
    id: "seblak-dalesh",
    name: "Seblak D'alesh",
    category: "seblak",
    categoryLabel: "Seblak",
    address: "Jl. Raya Lohbener",
    latitude: -6.445000,
    longitude: 108.283000,
    rating: 4.6,
    distanceLabel: "0.5 km",
    imageKey: "seblak",
    tags: ["pedas", "hits", "krupuk"],
    menus: [
      { id: "sd-1", name: "Seblak Original", price: 12000, imageKey: "seblak", description: "Kerupuk, makaroni, mie", isPopular: true },
      { id: "sd-2", name: "Seblak Baso Sosis", price: 13000, imageKey: "seblak", description: "Isian baso dan sosis", isPopular: true },
      { id: "sd-3", name: "Seblak Ceker", price: 15000, imageKey: "seblak", description: "Ceker empuk bumbu pedas", isPopular: true },
      { id: "sd-4", name: "Seblak Enoki", price: 17000, imageKey: "seblak", description: "Tambahan jamur enoki", isPopular: false }
    ]
  },
  {
    id: "seblak-barbar",
    name: "Seblak Bar Bar Jatibarang",
    category: "seblak",
    categoryLabel: "Seblak",
    address: "Jl. Letnan Joni, Jatibarang",
    latitude: -6.476823,
    longitude: 108.303721,
    rating: 4.7,
    distanceLabel: "6.2 km",
    imageKey: "seblak",
    tags: ["prasmanan", "bandung", "pedas"],
    menus: [
      { id: "sb-1", name: "Seblak Full Topping", price: 20000, imageKey: "seblak", description: "Tulang, ceker, batagor, kerupuk", isPopular: true },
      { id: "sb-2", name: "Seblak Mie", price: 12000, imageKey: "seblak", description: "Mie keriting bumbu kencur", isPopular: false },
      { id: "sb-3", name: "Seblak Seafood", price: 25000, imageKey: "seblak", description: "Dumpling keju, chikuwa, crabstick", isPopular: true },
      { id: "sb-4", name: "Es Jeruk", price: 5000, imageKey: "esteh", description: "Pereda pedas alami", isPopular: false }
    ]
  },
  {
    id: "geprek-jago",
    name: "Ayam Geprek Bang Jago",
    category: "geprek",
    categoryLabel: "Geprek",
    address: "Jl. Raya Arahan, Rambatan Kulon",
    latitude: -6.438000,
    longitude: 108.275000,
    rating: 4.7,
    distanceLabel: "1.2 km",
    imageKey: "geprek",
    tags: ["pedas", "makan siang"],
    menus: [
      { id: "gj-1", name: "Paket Nasi Geprek Biasa", price: 13000, imageKey: "geprek", description: "Nasi + Ayam Geprek Level 1-5", isPopular: true },
      { id: "gj-2", name: "Paket Geprek Keju", price: 17000, imageKey: "geprek", description: "Ayam Geprek + Keju Parut", isPopular: false },
      { id: "gj-3", name: "Geprek Mozzarella", price: 20000, imageKey: "geprek", description: "Ayam Geprek + Keju Lumer", isPopular: true },
      { id: "gj-4", name: "Jamur Crispy", price: 8000, imageKey: "geprek", description: "Jamur goreng krispi", isPopular: false }
    ]
  },
  {
    id: "geprek-gelby",
    name: "Ayam Geprek Gelby",
    category: "geprek",
    categoryLabel: "Geprek",
    address: "Jalur Lohbener-Cirebon",
    latitude: -6.440000,
    longitude: 108.280000,
    rating: 4.5,
    distanceLabel: "0.8 km",
    imageKey: "geprek",
    tags: ["malam", "ayam", "kampus"],
    menus: [
      { id: "gg-1", name: "Ayam Geprek Dada", price: 12000, imageKey: "geprek", description: "Ayam dada geprek tanpa nasi", isPopular: true },
      { id: "gg-2", name: "Ayam Geprek Paha Atas", price: 12000, imageKey: "geprek", description: "Paha atas geprek", isPopular: false },
      { id: "gg-3", name: "Nasi Putih", price: 4000, imageKey: "warung", description: "Nasi putih hangat", isPopular: true },
      { id: "gg-4", name: "Tahu Tempe Goreng", price: 4000, imageKey: "warung", description: "Seporsi tahu dan tempe", isPopular: false }
    ]
  },
  {
    id: "martabak-prapatan",
    name: "Martabak Prapatan Lohbener",
    category: "martabak",
    categoryLabel: "Martabak",
    address: "Simpang Prapatan Lohbener",
    latitude: -6.442500,
    longitude: 108.281000,
    rating: 5.0,
    distanceLabel: "0.4 km",
    imageKey: "martabak",
    tags: ["manis", "telor", "malam"],
    menus: [
      { id: "mp-1", name: "Martabak Coklat Kacang", price: 22000, imageKey: "martabak", description: "Martabak manis klasik loyang besar", isPopular: true },
      { id: "mp-2", name: "Martabak Keju Susu", price: 25000, imageKey: "martabak", description: "Full keju tebal", isPopular: true },
      { id: "mp-3", name: "Martabak Telor Spesial", price: 35000, imageKey: "martabak", description: "Isi daging sapi & 3 telor bebek", isPopular: true },
      { id: "mp-4", name: "Tipker Coklat", price: 15000, imageKey: "martabak", description: "Martabak tipis kering", isPopular: false }
    ]
  },
  {
    id: "martabak-bariklana",
    name: "Martabak Bariklana",
    category: "martabak",
    categoryLabel: "Martabak",
    address: "Pamayahan, Lohbener",
    latitude: -6.448000,
    longitude: 108.278000,
    rating: 4.4,
    distanceLabel: "1.1 km",
    imageKey: "martabak",
    tags: ["malam", "terjangkau"],
    menus: [
      { id: "mb-1", name: "Martabak 1/2 Keju 1/2 Coklat", price: 28000, imageKey: "martabak", description: "Dua rasa favorit", isPopular: true },
      { id: "mb-2", name: "Martabak Telor Ayam", price: 20000, imageKey: "martabak", description: "Pakai 2 telur ayam", isPopular: false },
      { id: "mb-3", name: "Martabak Pisang Keju", price: 24000, imageKey: "martabak", description: "Isian pisang dan keju parut", isPopular: false },
      { id: "mb-4", name: "Martabak Ketan Hitam", price: 20000, imageKey: "martabak", description: "Isian ketan hitam legit", isPopular: false }
    ]
  },
  {
    id: "depot-putri-jaya",
    name: "Depot Putri Jaya",
    category: "nasigoreng",
    categoryLabel: "Nasi Goreng",
    address: "Arah Jatibarang",
    latitude: -6.465000,
    longitude: 108.305000,
    rating: 4.1,
    distanceLabel: "5.5 km",
    imageKey: "nasigoreng",
    tags: ["chinese", "seafood", "porsi besar"],
    menus: [
      { id: "dpj-1", name: "Nasi Goreng Seafood", price: 22000, imageKey: "nasigoreng", description: "Nasgor cumi dan udang", isPopular: true },
      { id: "dpj-2", name: "Nasi Goreng Hongkong", price: 20000, imageKey: "nasigoreng", description: "Tanpa kecap manis", isPopular: false },
      { id: "dpj-3", name: "Capcay Kuah", price: 18000, imageKey: "warung", description: "Sayuran lengkap kuah gurih", isPopular: true },
      { id: "dpj-4", name: "Ayam Nanking", price: 30000, imageKey: "warung", description: "Ayam siram saus nanking", isPopular: false }
    ]
  },
  {
    id: "nasgor-mas-bro",
    name: "Nasi Goreng Mas Bro",
    category: "nasigoreng",
    categoryLabel: "Nasi Goreng",
    address: "Jl. Raya Lohbener",
    latitude: -6.446000,
    longitude: 108.285000,
    rating: 4.6,
    distanceLabel: "0.9 km",
    imageKey: "nasigoreng",
    tags: ["malam", "pinggir jalan", "enak"],
    menus: [
      { id: "nm-1", name: "Nasi Goreng Biasa", price: 12000, imageKey: "nasigoreng", description: "Pakai telor ceplok/dadar", isPopular: true },
      { id: "nm-2", name: "Nasi Goreng Ati Ampela", price: 15000, imageKey: "nasigoreng", description: "Nasgor bumbu rempah + ati ampela", isPopular: true },
      { id: "nm-3", name: "Mie Goreng Jawa", price: 12000, imageKey: "mie", description: "Mie tek-tek goreng", isPopular: false },
      { id: "nm-4", name: "Kwetiau Goreng", price: 15000, imageKey: "mie", description: "Kwetiau goreng gurih manis", isPopular: false }
    ]
  },
  {
    id: "miechat-lohbener",
    name: "Kedai Miechat Lohbener",
    category: "mie",
    categoryLabel: "Mie",
    address: "Area Kampus Lohbener",
    latitude: -6.443500,
    longitude: 108.281800,
    rating: 4.7,
    distanceLabel: "0.3 km",
    imageKey: "mie",
    tags: ["mie nyemek", "korean", "hits"],
    menus: [
      { id: "mc-1", name: "Mie Nyemek", price: 15000, imageKey: "mie", description: "Mie, telor, baso, sayur kuah nyemek", isPopular: true },
      { id: "mc-2", name: "Mie Special", price: 10000, imageKey: "mie", description: "Taburan ayam dan pangsit", isPopular: true },
      { id: "mc-3", name: "Tteokbokki Odeng", price: 10000, imageKey: "warung", description: "Kue beras korea dan odeng", isPopular: false },
      { id: "mc-4", name: "Sotteok", price: 7500, imageKey: "warung", description: "Sosis tteokbokki panggang", isPopular: false }
    ]
  },
  {
    id: "mie-gacoan",
    name: "Mie Gacoan Indramayu",
    category: "mie",
    categoryLabel: "Mie",
    address: "Jl. Panjaitan, Indramayu",
    latitude: -6.326800,
    longitude: 108.320000,
    rating: 4.9,
    distanceLabel: "14.5 km",
    imageKey: "gacoan",
    tags: ["pedas", "antri", "populer"],
    menus: [
      { id: "mg-1", name: "Mie Hompimpa", price: 10500, imageKey: "gacoan", description: "Mie pedas gurih level 1-8", isPopular: true },
      { id: "mg-2", name: "Mie Suit", price: 10500, imageKey: "gacoan", description: "Mie gurih tidak pedas", isPopular: false },
      { id: "mg-3", name: "Udang Keju", price: 9500, imageKey: "gacoan", description: "Dimsum udang isi keju lumer", isPopular: true },
      { id: "mg-4", name: "Udang Rambutan", price: 9500, imageKey: "gacoan", description: "Dimsum udang crispy", isPopular: true }
    ]
  },
  {
    id: "nasi-kuning-tinih",
    name: "Nasi Kuning Enyak Tinih",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "Jl. Tambak Bayar I, Pamayahan",
    latitude: -6.447000,
    longitude: 108.285500,
    rating: 4.7,
    distanceLabel: "1.0 km",
    imageKey: "warung",
    tags: ["malam", "nasi kuning", "sarapan"],
    menus: [
      { id: "nk-1", name: "Nasi Kuning Biasa", price: 10000, imageKey: "warung", description: "Orek tempe, bihun, telor suwir", isPopular: true },
      { id: "nk-2", name: "Nasi Kuning Ayam", price: 15000, imageKey: "warung", description: "Tambahan ayam bumbu kuning", isPopular: true },
      { id: "nk-3", name: "Gorengan Tempe", price: 1000, imageKey: "warung", description: "Mendoan anget", isPopular: false },
      { id: "nk-4", name: "Sate Telur Puyuh", price: 3000, imageKey: "warung", description: "Sate puyuh bumbu kecap", isPopular: false }
    ]
  },
  {
    id: "pedesan-entog-mimi",
    name: "Pedesan Entog Mimi Artisem",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "Larangan, Lohbener",
    latitude: -6.439000,
    longitude: 108.276000,
    rating: 4.8,
    distanceLabel: "1.3 km",
    imageKey: "warung",
    tags: ["khas indramayu", "pedas", "24 jam"],
    menus: [
      { id: "pe-1", name: "Pedesan Entog", price: 25000, imageKey: "warung", description: "Daging entog kuah rempah pedas", isPopular: true },
      { id: "pe-2", name: "Nasi Putih", price: 5000, imageKey: "warung", description: "Porsi kenyang", isPopular: true },
      { id: "pe-3", name: "Sate Entog", price: 20000, imageKey: "warung", description: "Sate entog daging empuk", isPopular: false },
      { id: "pe-4", name: "Kerupuk Kulit", price: 5000, imageKey: "warung", description: "Kerupuk rambak", isPopular: false }
    ]
  },
  {
    id: "linda-seafood",
    name: "Warung Lesehan LINDA Seafood",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "Jl. Nasional 7, Lohbener (Pantura)",
    latitude: -6.440000,
    longitude: 108.281500,
    rating: 4.5,
    distanceLabel: "0.6 km",
    imageKey: "warung",
    tags: ["malam", "seafood", "lesehan"],
    menus: [
      { id: "ls-1", name: "Cumi Saus Padang", price: 35000, imageKey: "warung", description: "Cumi segar pedas manis", isPopular: true },
      { id: "ls-2", name: "Udang Asam Manis", price: 35000, imageKey: "warung", description: "Udang ukuran sedang", isPopular: true },
      { id: "ls-3", name: "Cah Kangkung Polos", price: 10000, imageKey: "warung", description: "Sayur pelengkap", isPopular: false },
      { id: "ls-4", name: "Ikan Bakar Etong", price: 40000, imageKey: "warung", description: "Ikan etong bakar kecap (tergantung ukuran)", isPopular: false }
    ]
  },
  {
    id: "kedai-giprawi",
    name: "Kedai GIPRAWI Lohbener",
    category: "warung",
    categoryLabel: "Warung Nasi",
    address: "Lohbener, Indramayu",
    latitude: -6.442800,
    longitude: 108.282000,
    rating: 4.6,
    distanceLabel: "0.4 km",
    imageKey: "warung",
    tags: ["ayam", "ikan", "dimsum"],
    menus: [
      { id: "kg-1", name: "Ayam Gapit Madu", price: 20000, imageKey: "warung", description: "Ayam bakar madu manis gurih", isPopular: true },
      { id: "kg-2", name: "Ikan Etong Bakar", price: 40000, imageKey: "warung", description: "Ikan etong utuh bakar", isPopular: true },
      { id: "kg-3", name: "Siomay Udang", price: 20000, imageKey: "cafe", description: "Dimsum siomay udang kukus", isPopular: false },
      { id: "kg-4", name: "Kumis Naga", price: 15000, imageKey: "cafe", description: "Camilan renyah isi udang", isPopular: false }
    ]
  },
  {
    id: "indomaret-lohbener",
    name: "Indomaret Point Lohbener",
    category: "minimarket",
    categoryLabel: "Minimarket",
    address: "Dekat Kampus Lohbener",
    latitude: -6.443000,
    longitude: 108.282000,
    rating: 4.9,
    distanceLabel: "0.1 km",
    imageKey: "minimarket",
    tags: ["24 jam", "snack", "minuman"],
    menus: [
      { id: "il-1", name: "Aqua Botol 600ml", price: 3500, imageKey: "minimarket", description: "Air mineral", isPopular: true },
      { id: "il-2", name: "Indomie Goreng", price: 3500, imageKey: "minimarket", description: "Mie instan", isPopular: true },
      { id: "il-3", name: "Chitato Sapi Panggang", price: 11500, imageKey: "minimarket", description: "Keripik kentang", isPopular: false },
      { id: "il-4", name: "Yummy Coffee Cup", price: 12000, imageKey: "kopi", description: "Kopi susu dingin dari mesin", isPopular: false }
    ]
  },
  {
    id: "surya-toserba",
    name: "Surya Toserba Jatibarang",
    category: "minimarket",
    categoryLabel: "Minimarket",
    address: "Jl. Mayor Dasuki No.50",
    latitude: -6.472500,
    longitude: 108.310500,
    rating: 4.7,
    distanceLabel: "5.3 km",
    imageKey: "minimarket",
    tags: ["lengkap", "swalayan", "jajanan"],
    menus: [
      { id: "st-1", name: "Teh Pucuk Harum 350ml", price: 3500, imageKey: "minimarket", description: "Teh botol", isPopular: true },
      { id: "st-2", name: "Sari Roti Sobek Coklat", price: 16000, imageKey: "minimarket", description: "Roti sobek lembut", isPopular: true },
      { id: "st-3", name: "Pocky Chocolate", price: 8500, imageKey: "minimarket", description: "Biskuit stik coklat", isPopular: false },
      { id: "st-4", name: "Susu UHT Ultra 250ml", price: 6500, imageKey: "minimarket", description: "Susu coklat/full cream", isPopular: false }
    ]
  },
  {
    id: "apotek-k24",
    name: "Apotek K-24 Indramayu",
    category: "obat",
    categoryLabel: "Obat & Apotek",
    address: "Pusat Kota Indramayu",
    latitude: -6.325000,
    longitude: 108.315000,
    rating: 4.8,
    distanceLabel: "14.0 km",
    imageKey: "obat",
    tags: ["24 jam", "kesehatan"],
    menus: [
      { id: "ak-1", name: "Panadol Extra", price: 12000, imageKey: "obat", description: "Obat sakit kepala (Strip)", isPopular: true },
      { id: "ak-2", name: "Promag Tablet", price: 8500, imageKey: "obat", description: "Obat asam lambung (Strip)", isPopular: true },
      { id: "ak-3", name: "Tolak Angin Cair", price: 4000, imageKey: "obat", description: "Herbal masuk angin (Sachet)", isPopular: true },
      { id: "ak-4", name: "Minyak Telon Lang", price: 20000, imageKey: "obat", description: "Minyak telon bayi 60ml", isPopular: false }
    ]
  },
  {
    id: "apotek-lohbener-farma",
    name: "Apotek Lohbener Farma",
    category: "obat",
    categoryLabel: "Obat & Apotek",
    address: "Jl. Raya Lohbener",
    latitude: -6.444000,
    longitude: 108.284000,
    rating: 4.5,
    distanceLabel: "0.5 km",
    imageKey: "obat",
    tags: ["p3k", "vitamin"],
    menus: [
      { id: "af-1", name: "Paracetamol 500mg", price: 5000, imageKey: "obat", description: "Penurun panas generik", isPopular: true },
      { id: "af-2", name: "Bodrex", price: 4500, imageKey: "obat", description: "Pereda pusing", isPopular: true },
      { id: "af-3", name: "Vitamin C IPI", price: 6000, imageKey: "obat", description: "Vitamin C isi 45 tablet", isPopular: false },
      { id: "af-4", name: "Hansaplast Plester", price: 1000, imageKey: "obat", description: "Plester luka per pcs", isPopular: false }
    ]
  },
  {
    id: "kopi-kenangan",
    name: "Kopi Kenangan Mall Indramayu",
    category: "kopi",
    categoryLabel: "Kopi",
    address: "Mall Indramayu",
    latitude: -6.328000,
    longitude: 108.322000,
    rating: 4.8,
    distanceLabel: "14.2 km",
    imageKey: "kopken",
    tags: ["hits", "kopi susu"],
    menus: [
      { id: "kk-1", name: "Kopi Kenangan Mantan", price: 18000, imageKey: "kopken", description: "Kopi susu gula aren (R)", isPopular: true },
      { id: "kk-2", name: "Americano", price: 15000, imageKey: "kopken", description: "Espresso murni", isPopular: false },
      { id: "kk-3", name: "Matcha Latte", price: 24000, imageKey: "kopken", description: "Teh hijau susu", isPopular: true },
      { id: "kk-4", name: "Roti Coklat Klasik", price: 12000, imageKey: "kopken", description: "Roti lembut isi coklat", isPopular: false }
    ]
  },
  {
    id: "taste-coffee",
    name: "Taste Coffee",
    category: "cafe",
    categoryLabel: "Cafe",
    address: "Jl. Jenderal Sudirman, Lemahmekar",
    latitude: -6.331000,
    longitude: 108.321000,
    rating: 4.7,
    distanceLabel: "13.8 km",
    imageKey: "cafe",
    tags: ["nongkrong", "snack", "hits"],
    menus: [
      { id: "tc-1", name: "Cafe Latte", price: 22000, imageKey: "cafe", description: "Espresso & steamed milk", isPopular: true },
      { id: "tc-2", name: "Choco Hazelnut", price: 25000, imageKey: "cafe", description: "Minuman coklat hazelnut ice", isPopular: false },
      { id: "tc-3", name: "Cireng Bumbu Rujak", price: 15000, imageKey: "cafe", description: "Camilan renyah", isPopular: true },
      { id: "tc-4", name: "Kentang Goreng", price: 15000, imageKey: "cafe", description: "Porsi sharing", isPopular: false }
    ]
  },
  {
    id: "mixue-jatibarang",
    name: "Mixue Jatibarang",
    category: "esteh",
    categoryLabel: "Es Teh & Es Krim",
    address: "Pusat Jatibarang",
    latitude: -6.473000,
    longitude: 108.311500,
    rating: 4.8,
    distanceLabel: "5.5 km",
    imageKey: "esteh",
    tags: ["eskrim", "manis", "hits"],
    menus: [
      { id: "mx-1", name: "Boba Sundae", price: 16000, imageKey: "esteh", description: "Es krim vanilla + boba brown sugar", isPopular: true },
      { id: "mx-2", name: "Mi Sundae Mango", price: 16000, imageKey: "esteh", description: "Es krim + selai mangga", isPopular: true },
      { id: "mx-3", name: "Fresh Squeezed Lemonade", price: 10000, imageKey: "esteh", description: "Minuman lemon segar cup besar", isPopular: false },
      { id: "mx-4", name: "Strawberry Mi-Shake", price: 16000, imageKey: "esteh", description: "Teh dan es krim strawberry dikocok", isPopular: false }
    ]
  }
];


// ─────────────────────────────────────────────────────────────
// Normalizer, search helper, dan route helper untuk Sipolin.
// Dataset di atas boleh kamu ubah/tambah sendiri. Bagian bawah ini
// jangan dihapus karena dipakai oleh Home Search dan Pol-Send.
// ─────────────────────────────────────────────────────────────

const CATEGORY_META = {
  semua: { icon: "✨", emoji: "✨", accent: "#00AA5B", aliases: ["semua", "all", "rekomendasi"] },
  all: { icon: "✨", emoji: "✨", accent: "#00AA5B", aliases: ["semua", "all", "rekomendasi"] },
  seblak: { icon: "🌶️", emoji: "🌶️", accent: "#ef4444", aliases: ["seblak", "sblak", "pedas", "ceker", "kerupuk"] },
  esteh: { icon: "🧋", emoji: "🧋", accent: "#0ea5e9", aliases: ["es teh", "esteh", "teh", "minuman", "ice tea", "mixue", "es krim", "boba"] },
  geprek: { icon: "🍗", emoji: "🍗", accent: "#f97316", aliases: ["geprek", "gepek", "ayam geprek", "ayam", "sambal"] },
  nasigoreng: { icon: "🍛", emoji: "🍛", accent: "#d97706", aliases: ["nasgor", "nasi goreng", "nasi", "goreng", "kwetiau"] },
  nasgor: { icon: "🍛", emoji: "🍛", accent: "#d97706", aliases: ["nasgor", "nasi goreng", "nasi", "goreng", "kwetiau"] },
  martabak: { icon: "🥞", emoji: "🥞", accent: "#a16207", aliases: ["martabak", "martabk", "terang bulan", "telor", "telur", "manis", "keju"] },
  mie: { icon: "🍜", emoji: "🍜", accent: "#7c3aed", aliases: ["mie", "mi", "mii", "gacoan", "mie gacoan", "miechat", "nyemek", "hompimpa", "suit"] },
  kopi: { icon: "☕", emoji: "☕", accent: "#78350f", aliases: ["kopi", "kopken", "kopi kenangan", "coffee", "latte", "americano", "mantan"] },
  minimarket: { icon: "🛒", emoji: "🛒", accent: "#dc2626", aliases: ["minimarket", "mini market", "alfa", "alfamart", "indo", "indomaret", "surya", "toserba", "jajan", "snack"] },
  obat: { icon: "💊", emoji: "💊", accent: "#0284c7", aliases: ["obat", "apotek", "apotik", "farmasi", "vitamin", "paracetamol", "panadol", "promag", "bodrex"] },
  warung: { icon: "🍽️", emoji: "🍽️", accent: "#16a34a", aliases: ["warung", "warteg", "nasi rames", "rames", "makan", "ayam", "seafood", "lesehan", "entog"] },
  cafe: { icon: "☕", emoji: "☕", accent: "#8b5cf6", aliases: ["cafe", "kafe", "nongkrong", "coffee", "kopi", "snack", "dimsum"] },
  gacoan: { icon: "🍜", emoji: "🍜", accent: "#7c3aed", aliases: ["gacoan", "mie gacoan", "hompimpa", "suit", "dimsum"] },
  kopken: { icon: "☕", emoji: "☕", accent: "#78350f", aliases: ["kopken", "kopi kenangan", "kopi", "mantan"] },
};

const IMAGE_KEY_META = {
  seblak: { emoji: "🌶️", accent: "#ef4444" },
  esteh: { emoji: "🧋", accent: "#0ea5e9" },
  geprek: { emoji: "🍗", accent: "#f97316" },
  nasigoreng: { emoji: "🍛", accent: "#d97706" },
  nasgor: { emoji: "🍛", accent: "#d97706" },
  martabak: { emoji: "🥞", accent: "#a16207" },
  mie: { emoji: "🍜", accent: "#7c3aed" },
  gacoan: { emoji: "🍜", accent: "#7c3aed" },
  kopi: { emoji: "☕", accent: "#78350f" },
  kopken: { emoji: "☕", accent: "#78350f" },
  minimarket: { emoji: "🛒", accent: "#dc2626" },
  obat: { emoji: "💊", accent: "#0284c7" },
  warung: { emoji: "🍽️", accent: "#16a34a" },
  cafe: { emoji: "☕", accent: "#8b5cf6" },
};

export const normalizePolsendText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value = "") =>
  normalizePolsendText(value)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

const uniqueWords = (items = []) => {
  const words = items
    .flat(Infinity)
    .filter(Boolean)
    .join(" ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  return [...new Set(words)].join(" ");
};

const getCategoryId = (category) => {
  const raw = normalizePolsendText(category).replace(/\s+/g, "");
  if (raw === "all") return "semua";
  if (raw === "nasigoreng" || raw === "nasigorengspesial") return "nasigoreng";
  if (raw === "nasi" || raw === "nasgor") return "nasigoreng";
  if (raw === "apotek" || raw === "apotik") return "obat";
  return raw || "warung";
};

const getMeta = (merchantOrMenu = {}, fallbackCategory = "warung") => {
  const category = getCategoryId(merchantOrMenu.category || fallbackCategory);
  const imageKey = String(merchantOrMenu.imageKey || category || "").toLowerCase();
  return IMAGE_KEY_META[imageKey] || CATEGORY_META[category] || CATEGORY_META.warung;
};

const makeDeliveryTime = (distanceLabel = "") => {
  const number = Number(String(distanceLabel).replace(",", ".").match(/[\d.]+/)?.[0] || 1);
  if (number <= 1) return "10-20 min";
  if (number <= 4) return "15-30 min";
  if (number <= 8) return "25-45 min";
  return "35-60 min";
};

export const POLSEND_CATEGORIES = RAW_POLSEND_CATEGORIES.map((category) => {
  const id = getCategoryId(category.id);
  const meta = CATEGORY_META[id] || CATEGORY_META[category.id] || CATEGORY_META.warung;

  return {
    ...category,
    id,
    icon: meta.icon || meta.emoji || category.icon || "🍽️",
    emoji: meta.emoji || meta.icon || "🍽️",
    accent: meta.accent || "#00AA5B",
    aliases: uniqueWords([category.label, ...(meta.aliases || [])]),
  };
});

export const POLSEND_MERCHANTS = RAW_POLSEND_MERCHANTS.map((merchant) => {
  const category = getCategoryId(merchant.category);
  const meta = getMeta(merchant, category);
  const categoryMeta = CATEGORY_META[category] || CATEGORY_META.warung;
  const tags = Array.isArray(merchant.tags) ? merchant.tags : [];
  const deliveryTime = merchant.deliveryTime || makeDeliveryTime(merchant.distanceLabel);

  const normalizedMenus = (merchant.menus || []).map((menu) => {
    const menuMeta = getMeta(menu, category);

    const keywords = uniqueWords([
      menu.name,
      menu.description,
      menu.imageKey,
      merchant.name,
      merchant.categoryLabel,
      merchant.address,
      merchant.plusCode,
      merchant.googleMapsQuery,
      category,
      categoryMeta.aliases?.join(" "),
      tags.join(" "),
      menu.isPopular ? "populer rekomendasi favorite favorit best seller" : "",
    ]);

    return {
      ...menu,
      emoji: menu.emoji || menuMeta.emoji || meta.emoji || "🍽️",
      accent: menu.accent || menuMeta.accent || meta.accent || "#00AA5B",
      keywords,
      searchText: normalizePolsendText(keywords),
    };
  });

  const merchantKeywords = uniqueWords([
    merchant.name,
    merchant.category,
    merchant.categoryLabel,
    merchant.address,
    merchant.plusCode,
    merchant.googleMapsQuery,
    merchant.imageKey,
    tags.join(" "),
    categoryMeta.aliases?.join(" "),
    normalizedMenus.map((m) => `${m.name} ${m.description || ""}`).join(" "),
  ]);

  return {
    ...merchant,
    category,
    emoji: merchant.emoji || meta.emoji || "🍽️",
    accent: merchant.accent || meta.accent || "#00AA5B",
    deliveryTime,
    tags,
    googleMapsQuery: merchant.googleMapsQuery || `${merchant.name} ${merchant.address || ""} Indramayu`,
    googleImageQuery: merchant.googleImageQuery || `${merchant.name} ${merchant.categoryLabel || ""} Indramayu food photo`,
    menus: normalizedMenus,
    keywords: merchantKeywords,
    searchText: normalizePolsendText(merchantKeywords),
  };
});

export const flattenPolsendMenus = () =>
  POLSEND_MERCHANTS.flatMap((merchant) =>
    (merchant.menus || []).map((menu) => {
      const keywords = uniqueWords([
        menu.keywords,
        menu.name,
        menu.description,
        menu.imageKey,
        merchant.name,
        merchant.category,
        merchant.categoryLabel,
        merchant.address,
        merchant.plusCode,
        merchant.googleMapsQuery,
        merchant.tags?.join(" "),
        merchant.keywords,
      ]);

      return {
        ...menu,
        merchantId: merchant.id,
        resto: merchant.name,
        merchantName: merchant.name,
        category: merchant.category,
        categoryLabel: merchant.categoryLabel,
        address: merchant.address,
        plusCode: merchant.plusCode,
        googleMapsQuery: merchant.googleMapsQuery,
        googleImageQuery: `${menu.name} ${merchant.name} Indramayu food photo`,
        latitude: merchant.latitude,
        longitude: merchant.longitude,
        rating: merchant.rating,
        distanceLabel: merchant.distanceLabel,
        deliveryTime: merchant.deliveryTime,
        merchantEmoji: merchant.emoji,
        accent: menu.accent || merchant.accent,
        tag: keywords,
        keywords,
        searchText: normalizePolsendText(keywords),
        type: "menu",
      };
    })
  );

export const POLSEND_MENU_ITEMS = flattenPolsendMenus();

export const POLSEND_MERCHANT_SEARCH_ITEMS = POLSEND_MERCHANTS.map((merchant) => ({
  ...merchant,
  id: `merchant-${merchant.id}`,
  rawMerchantId: merchant.id,
  merchantId: merchant.id,
  type: "merchant",
  name: merchant.name,
  resto: merchant.categoryLabel || "Tempat makan",
  price: 0,
  imageKey: merchant.id,
  merchantImageKey: merchant.id,
  searchText: normalizePolsendText([
    merchant.searchText,
    merchant.name,
    merchant.category,
    merchant.categoryLabel,
    merchant.address,
    merchant.plusCode,
    merchant.googleMapsQuery,
    merchant.tags?.join(" "),
    merchant.menus?.map((menu) => `${menu.name} ${menu.description || ""}`).join(" "),
  ].filter(Boolean).join(" ")),
}));

export const POLSEND_SEARCH_ITEMS = [
  {
    id: "service-polride",
    type: "service",
    name: "Pol-Ride",
    resto: "Layanan antar jemput",
    price: 0,
    route: "/orders/create/pol_ride",
    emoji: "🏍️",
    tag: "polride pol ride ride antar jemput ojek motor driver kendaraan",
    searchText: "polride pol ride ride antar jemput ojek motor driver kendaraan",
  },
  {
    id: "service-polsend",
    type: "service",
    name: "Pol-Send",
    resto: "Titip beli makanan/barang",
    price: 0,
    route: "/orders/create/pol_send",
    emoji: "📦",
    tag: "polsend pol send kirim barang makanan titip jastip delivery food",
    searchText: "polsend pol send kirim barang makanan titip jastip delivery food",
  },
  {
    id: "service-ai",
    type: "service",
    name: "AI Sipolin",
    resto: "Tanya cara pakai aplikasi",
    price: 0,
    route: "/chatbot",
    emoji: "🤖",
    tag: "ai chatbot bantuan tanya sipolin cara pakai",
    searchText: "ai chatbot bantuan tanya sipolin cara pakai",
  },
  ...POLSEND_MERCHANT_SEARCH_ITEMS,
  ...POLSEND_MENU_ITEMS,
];

const TYPO_ALIASES = {
  geprek: ["geprek", "gepek", "geprekk", "ayamgeprek", "ayam geprek"],
  seblak: ["seblak", "sblak", "seblakkk", "ceker", "kerupuk"],
  nasigoreng: ["nasigoreng", "nasgor", "nasi goreng", "nasi", "goreng"],
  martabak: ["martabak", "martabk", "terang bulan", "telor", "telur"],
  mie: ["mie", "mi", "mii", "gacoan", "mie gacoan", "miechat", "nyemek", "hompimpa", "suit"],
  kopi: ["kopi", "coffee", "kopken", "kopi kenangan", "latte", "americano", "mantan"],
  esteh: ["esteh", "es teh", "teh", "minuman", "mixue", "es krim", "boba"],
  minimarket: ["minimarket", "mini market", "alfa", "alfamart", "indo", "indomaret", "toserba", "surya", "snack"],
  obat: ["obat", "apotek", "apotik", "farmasi", "vitamin", "paracetamol", "panadol", "promag", "bodrex"],
  warung: ["warung", "warteg", "nasi rames", "rames", "makan", "entog", "seafood", "lesehan"],
  cafe: ["cafe", "kafe", "nongkrong", "dimsum", "snack", "taste coffee"],
};

const getAliasGroup = (query = "") => {
  const q = normalizePolsendText(query).replace(/\s+/g, "");

  if (["nasgor", "nasigoreng", "nasigorengspesial"].includes(q)) return "nasigoreng";
  if (["ayamgeprek", "geprek", "gepek"].includes(q)) return "geprek";
  if (["kopken", "kopikenangan"].includes(q)) return "kopi";
  if (["gacoan", "miegacoan", "mie"].includes(q)) return "mie";
  if (["apotek", "apotik", "obat", "farmasi"].includes(q)) return "obat";
  if (["alfamart", "alfa", "indomaret", "indo"].includes(q)) return "minimarket";
  if (["esteh", "estea", "mixue"].includes(q)) return "esteh";

  return Object.keys(TYPO_ALIASES).find((key) => {
    const aliases = TYPO_ALIASES[key] || [];
    return aliases.some((alias) => normalizePolsendText(alias).replace(/\s+/g, "") === q);
  });
};

const levenshteinDistance = (a = "", b = "") => {
  const s = String(a);
  const t = String(b);

  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;

  const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));

  for (let i = 0; i <= s.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= t.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= s.length; i += 1) {
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[s.length][t.length];
};

const isWordMatch = (queryToken, hayWord) => {
  if (!queryToken || !hayWord) return false;

  // Kata pendek seperti "mie" harus exact/prefix, jangan fuzzy.
  // Ini mencegah "mie" nyasar ke "minimarket" / kata lain.
  if (queryToken.length <= 3) {
    return hayWord === queryToken || hayWord.startsWith(queryToken);
  }

  if (hayWord === queryToken) return true;
  if (hayWord.startsWith(queryToken)) return true;
  if (queryToken.startsWith(hayWord) && hayWord.length >= 4) return true;

  return levenshteinDistance(queryToken, hayWord) <= 1;
};

const expandedQueryTokens = (query = "") => {
  const q = normalizePolsendText(query);
  const baseTokens = tokenize(q);
  const aliasGroup = getAliasGroup(q);
  const aliasTokens = aliasGroup ? tokenize(TYPO_ALIASES[aliasGroup].join(" ")) : [];

  return [...new Set([...baseTokens, ...aliasTokens])];
};

const itemHaystack = (item = {}) =>
  normalizePolsendText([
    item.searchText,
    item.name,
    item.resto,
    item.merchantName,
    item.category,
    item.categoryLabel,
    item.address,
    item.plusCode,
    item.googleMapsQuery,
    item.tag,
    item.keywords,
    item.description,
    item.imageKey,
    item.id,
    item.rawMerchantId,
    item.merchantId,
  ].filter(Boolean).join(" "));

export const scorePolsendSearch = (item = {}, query = "") => {
  const q = normalizePolsendText(query);
  if (!q) return 1;

  const group = getAliasGroup(q);
  const tokens = expandedQueryTokens(q);
  const haystack = itemHaystack(item);
  const words = tokenize(haystack);

  const itemCategory = normalizePolsendText(item.category);
  const itemCategoryLabel = normalizePolsendText(item.categoryLabel);
  const itemName = normalizePolsendText(item.name);
  const restoName = normalizePolsendText(item.resto || item.merchantName);

  let score = 0;

  if (itemName.includes(q)) score += 120;
  if (restoName.includes(q)) score += 90;
  if (itemCategory === group || itemCategory === q || itemCategoryLabel.includes(q)) score += 85;
  if (haystack.includes(q)) score += 35;

  if (group) {
    if (itemCategory === group) score += 100;
    if (itemCategoryLabel.includes(group)) score += 40;
  }

  const originalTokens = tokenize(q);
  const allOriginalMatched = originalTokens.every((token) =>
    words.some((word) => isWordMatch(token, word))
  );

  const aliasMatched =
    group &&
    (
      itemCategory === group ||
      words.some((word) => tokenize(TYPO_ALIASES[group].join(" ")).some((aliasToken) => isWordMatch(aliasToken, word)))
    );

  if (!allOriginalMatched && !aliasMatched) return 0;

  tokens.forEach((token) => {
    if (words.includes(token)) score += 14;
    else if (words.some((word) => isWordMatch(token, word))) score += 6;
  });

  if (item.isPopular) score += 8;
  if (item.type === "service") score += 5;

  return score;
};

export const matchesPolsendSearch = (item = {}, query = "") => {
  return scorePolsendSearch(item, query) > 0;
};

export const getPolsendRouteParams = (item = {}) => {
  if (item.type === "service") return {};

  if (item.type === "merchant") {
    return {
      merchantId: item.merchantId || item.rawMerchantId || item.id || "",
      viewMode: "merchant",
    };
  }

  return {
    merchantId: item.merchantId || "",
    selectedMenuId: item.id || "",
    viewMode: "merchant",
    foodName: item.name || "",
    restaurantName: item.resto || item.merchantName || "",
    foodPrice: item.price ? String(item.price) : "",
    pickupLabel: item.resto || item.merchantName || "",
    pickupLat: item.latitude ? String(item.latitude) : "",
    pickupLng: item.longitude ? String(item.longitude) : "",
    pickupNote: item.address || "",
  };
};

export const findPolsendMenuByParams = ({ foodName, restaurantName }) => {
  const food = normalizePolsendText(foodName);
  const resto = normalizePolsendText(restaurantName);

  if (!food || !resto) return null;

  return POLSEND_MENU_ITEMS.find(
    (item) =>
      normalizePolsendText(item.name) === food &&
      normalizePolsendText(item.resto) === resto
  );
};

export default {
  categories: POLSEND_CATEGORIES,
  merchants: POLSEND_MERCHANTS,
  menus: POLSEND_MENU_ITEMS,
  searchItems: POLSEND_SEARCH_ITEMS,
};
