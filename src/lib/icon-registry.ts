import { BRAND_MAPPINGS } from "@mobile/lib/brandMappings";

export const ICON_REGISTRY: Record<string, ReturnType<typeof require>> = {
  // Banks - Private Sector
  hdfc: require("@root/assets/brands/hdfc.png"),
  icici: require("@root/assets/brands/icici.png"),
  axis: require("@root/assets/brands/axis.png"),
  kotak: require("@root/assets/brands/kotak.png"),
  yes: require("@root/assets/brands/yes.png"),
  idfc: require("@root/assets/brands/idfc.png"),
  indusind: require("@root/assets/brands/indusind.png"),
  rbl: require("@root/assets/brands/rbl.png"),
  // federal: require("@root/assets/brands/federal.png"),
  bandhan: require("@root/assets/brands/bandhan.png"),
  au: require("@root/assets/brands/au.png"),
  paytm: require("@root/assets/brands/paytm.png"),
  idbi: require("@root/assets/brands/idbi.png"),
  cityunion: require("@root/assets/brands/cityunion.png"),
  dcb: require("@root/assets/brands/dcb.png"),
  dhanlaxmi: require("@root/assets/brands/dhanlaxmi.png"),
  jkbank: require("@root/assets/brands/jkbank.png"),
  karnatakabank: require("@root/assets/brands/karnatakabank.png"),
  nainital: require("@root/assets/brands/nainitalbank.png"),
  southindian: require("@root/assets/brands/southindianbank.png"),
  tmb: require("@root/assets/brands/tmb.png"),

  // Banks - Public Sector
  sbi: require("@root/assets/brands/sbi.png"),
  pnb: require("@root/assets/brands/pnb.png"),
  bob: require("@root/assets/brands/bob.png"),
  canara: require("@root/assets/brands/canara.png"),
  union: require("@root/assets/brands/union.png"),
  boi: require("@root/assets/brands/boi.png"),
  bom: require("@root/assets/brands/bom.png"),
  centralbank: require("@root/assets/brands/centralbank.png"),
  indianbank: require("@root/assets/brands/indianbank.png"),
  iob: require("@root/assets/brands/iob.png"),
  psb: require("@root/assets/brands/psb.png"),
  uco: require("@root/assets/brands/uco.png"),

  // Small Finance Banks
  ujjivan: require("@root/assets/brands/ujjivan.png"),

  // Payments Banks
  airtel: require("@root/assets/brands/airtel.png"),
  jio: require("@root/assets/brands/jio.png"),
  ippb: require("@root/assets/brands/Ippb.png"),
  fino: require("@root/assets/brands/fino.png"),

  // Wallets & UPI
  gpay: require("@root/assets/brands/gpay.png"),
  phonepe: require("@root/assets/brands/phonepe.png"),
  mobikwik: require("@root/assets/brands/mobikwik.png"),
  freecharge: require("@root/assets/brands/freecharge.png"),
  cred: require("@root/assets/brands/cred.png"),
  whatsapp: require("@root/assets/brands/whatsapp.png"),
  bhim: require("@root/assets/brands/bhim.png"),

  // Food & Delivery
  swiggy: require("@root/assets/brands/swiggy.png"),
  zomato: require("@root/assets/brands/zomato.png"),
  zepto: require("@root/assets/brands/zepto.png"),
  blinkit: require("@root/assets/brands/blinkit.png"),

  // E-commerce
  amazon: require("@root/assets/brands/amazon.png"),
  flipkart: require("@root/assets/brands/flipkart.png"),
  meesho: require("@root/assets/brands/meesho.png"),
  myntra: require("@root/assets/brands/myntra.png"),
  jiomart: require("@root/assets/brands/jimart.png"),
  tata1mg: require("@root/assets/brands/tata1mg.png"),
  netmeds: require("@root/assets/brands/netmeds.png"),

  // Ride & Travel
  ola: require("@root/assets/brands/ola.png"),
  uber: require("@root/assets/brands/uber.png"),
  rapido: require("@root/assets/brands/rapido.png"),
  redbus: require("@root/assets/brands/redbus.png"),
  makemytrip: require("@root/assets/brands/makemytrip.png"),
  goibibo: require("@root/assets/brands/goibibo.png"),
  yatra: require("@root/assets/brands/yatra.png"),
  indigo: require("@root/assets/brands/indigo.png"),
  airindia: require("@root/assets/brands/airindia.png"),

  // Streaming & Entertainment
  netflix: require("@root/assets/brands/netflix.png"),
  hotstar: require("@root/assets/brands/hotstar.png"),
  prime: require("@root/assets/brands/prime.png"),
  zee5: require("@root/assets/brands/zee5.png"),
  sonyliv: require("@root/assets/brands/sonyliv.png"),
  spotify: require("@root/assets/brands/spotify.png"),
  youtube: require("@root/assets/brands/youtube.png"),
  google: require("@root/assets/brands/google.png"),
  bookmyshow: require("@root/assets/brands/bookmyshow.png"),
  linkedIn: require("@root/assets/brands/linkedin.png"),
  facebook: require("@root/assets/brands/meta.png"),
  twitter: require("@root/assets/brands/x.png"),

  // Finance & Investment
  groww: require("@root/assets/brands/groww.png"),

  // Health
  apollo: require("@root/assets/brands/apollo.png"),
  practo: require("@root/assets/brands/practo.png"),
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
