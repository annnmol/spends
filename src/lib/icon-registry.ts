import { BRAND_MAPPINGS } from "@mobile/lib/brandMappings";

export const ICON_REGISTRY: Record<string, ReturnType<typeof require>> = {
  // Banks - Private Sector
  hdfc: require("@/assets/brands/hdfc.png"),
  icici: require("@/assets/brands/icici.png"),
  axis: require("@/assets/brands/axis.png"),
  kotak: require("@/assets/brands/kotak.png"),
  yes: require("@/assets/brands/yes.png"),
  idfc: require("@/assets/brands/idfc.png"),
  indusind: require("@/assets/brands/indusind.png"),
  rbl: require("@/assets/brands/rbl.png"),
  federal: require("@/assets/brands/federal.png"),
  bandhan: require("@/assets/brands/bandhan.png"),
  au: require("@/assets/brands/au.png"),
  paytm: require("@/assets/brands/paytm.png"),
  idbi: require("@/assets/brands/idbi.png"),
  cityunion: require("@/assets/brands/cityunion.png"),
  dcb: require("@/assets/brands/dcb.png"),
  dhanlaxmi: require("@/assets/brands/dhanlaxmi.png"),
  jkbank: require("@/assets/brands/jkbank.png"),
  karnatakabank: require("@/assets/brands/karnatakabank.png"),
  nainital: require("@/assets/brands/nainitalbank.png"),
  southindian: require("@/assets/brands/southindianbank.png"),
  tmb: require("@/assets/brands/tmb.png"),

  // Banks - Public Sector
  sbi: require("@/assets/brands/sbi.png"),
  pnb: require("@/assets/brands/pnb.png"),
  bob: require("@/assets/brands/bob.png"),
  canara: require("@/assets/brands/canara.png"),
  union: require("@/assets/brands/union.png"),
  boi: require("@/assets/brands/boi.png"),
  bom: require("@/assets/brands/bom.png"),
  centralbank: require("@/assets/brands/centralbank.png"),
  indianbank: require("@/assets/brands/indianbank.png"),
  iob: require("@/assets/brands/iob.png"),
  psb: require("@/assets/brands/psb.png"),
  uco: require("@/assets/brands/uco.png"),

  // Small Finance Banks
  ujjivan: require("@/assets/brands/ujjivan.png"),

  // Payments Banks
  airtel: require("@/assets/brands/airtel.png"),
  jio: require("@/assets/brands/jio.png"),
  ippb: require("@/assets/brands/Ippb.png"),
  fino: require("@/assets/brands/fino.png"),

  // Wallets & UPI
  gpay: require("@/assets/brands/gpay.png"),
  phonepe: require("@/assets/brands/phonepe.png"),
  mobikwik: require("@/assets/brands/mobikwik.png"),
  freecharge: require("@/assets/brands/freecharge.png"),
  cred: require("@/assets/brands/cred.png"),
  whatsapp: require("@/assets/brands/whatsapp.png"),
  bhim: require("@/assets/brands/bhim.png"),

  // Food & Delivery
  swiggy: require("@/assets/brands/swiggy.png"),
  zomato: require("@/assets/brands/zomato.png"),
  zepto: require("@/assets/brands/zepto.png"),
  blinkit: require("@/assets/brands/blinkit.png"),

  // E-commerce
  amazon: require("@/assets/brands/amazon.png"),
  flipkart: require("@/assets/brands/flipkart.png"),
  meesho: require("@/assets/brands/meesho.png"),
  myntra: require("@/assets/brands/myntra.png"),
  jiomart: require("@/assets/brands/jimart.png"),
  tata1mg: require("@/assets/brands/tata1mg.png"),
  netmeds: require("@/assets/brands/netmeds.png"),

  // Ride & Travel
  ola: require("@/assets/brands/ola.png"),
  uber: require("@/assets/brands/uber.png"),
  rapido: require("@/assets/brands/rapido.png"),
  redbus: require("@/assets/brands/redbus.png"),
  makemytrip: require("@/assets/brands/makemytrip.png"),
  goibibo: require("@/assets/brands/goibibo.png"),
  yatra: require("@/assets/brands/yatra.png"),
  indigo: require("@/assets/brands/indigo.png"),
  airindia: require("@/assets/brands/airindia.png"),

  // Streaming & Entertainment
  netflix: require("@/assets/brands/netflix.png"),
  hotstar: require("@/assets/brands/hotstar.png"),
  prime: require("@/assets/brands/prime.png"),
  zee5: require("@/assets/brands/zee5.png"),
  sonyliv: require("@/assets/brands/sonyliv.png"),
  spotify: require("@/assets/brands/spotify.png"),
  youtube: require("@/assets/brands/youtube.png"),
  google: require("@/assets/brands/google.png"),
  bookmyshow: require("@/assets/brands/bookmyshow.png"),
  linkedIn: require("@/assets/brands/linkedin.png"),
  facebook: require("@/assets/brands/meta.png"),
  twitter: require("@/assets/brands/x.png"),

  // Finance & Investment
  groww: require("@/assets/brands/groww.png"),

  // Health
  apollo: require("@/assets/brands/apollo.png"),
  practo: require("@/assets/brands/practo.png"),
};

export function getIcon(
  iconKey?: string | null,
): ReturnType<typeof require> | null {
  if (!iconKey) return null;
  return ICON_REGISTRY[iconKey] ?? null;
}

export function resolveIconKeyFromSlugs(slugs: string[]): string | null {
  if (!slugs.length) return null;
  const lower = slugs?.map((s) => s?.toLowerCase());
  for (const [brand, brandSlugs] of Object.entries(BRAND_MAPPINGS)) {
    if (!(brand in ICON_REGISTRY)) continue;
    if (brandSlugs.some((bs) => lower.includes(bs.toLowerCase()))) return brand;
  }
  return null;
}

const AVATAR_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#be185d",
  "#4f7942",
];

export function getInitialAndColor(name: string): {
  letter: string;
  color: string;
} {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  const index = letter ? letter.charCodeAt(0) % AVATAR_COLORS?.length : 0;
  return { letter, color: AVATAR_COLORS[index] };
}
