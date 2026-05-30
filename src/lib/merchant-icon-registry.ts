// Static require() calls — Metro needs these at build time (no dynamic paths)
const MERCHANT_ASSETS = {
  airtel:      require("../../assets/merchants/airtel.webp"),
  amazon:      require("../../assets/merchants/amazon.webp"),
  bhim:        require("../../assets/merchants/bhim.webp"),
  blinkit:     require("../../assets/merchants/blinkit.webp"),
  bookmyshow:  require("../../assets/merchants/bookmyshow.webp"),
  chatgpt:     require("../../assets/merchants/chatgpt.webp"),
  claude:      require("../../assets/merchants/claude.webp"),
  cleartrip:   require("../../assets/merchants/cleartrip.webp"),
  cred:        require("../../assets/merchants/cred.webp"),
  flipkart:    require("../../assets/merchants/flipkart.webp"),
  googleone:   require("../../assets/merchants/google one.webp"),
  googlepay:   require("../../assets/merchants/google pay.webp"),
  groww:       require("../../assets/merchants/groww.webp"),
  hotstar:     require("../../assets/merchants/hotstar.webp"),
  jimart:      require("../../assets/merchants/jimart.webp"),
  jio:         require("../../assets/merchants/jio.webp"),
  linkedin:    require("../../assets/merchants/linkedin.webp"),
  magicpin:    require("../../assets/merchants/magicpin.webp"),
  makemytrip:  require("../../assets/merchants/makemytrip.webp"),
  meesho:      require("../../assets/merchants/meesho.webp"),
  meta:        require("../../assets/merchants/meta.webp"),
  myntra:      require("../../assets/merchants/myntra.webp"),
  netflix:     require("../../assets/merchants/netflix.webp"),
  ola:         require("../../assets/merchants/ola.webp"),
  paytm:       require("../../assets/merchants/paytm.webp"),
  phonepe:     require("../../assets/merchants/phonepe.webp"),
  prime:       require("../../assets/merchants/prime.webp"),
  rapido:      require("../../assets/merchants/rapido.webp"),
  redbus:      require("../../assets/merchants/redbus.webp"),
  swiggy:      require("../../assets/merchants/swiggy.webp"),
  uber:        require("../../assets/merchants/uber.webp"),
  whatsapp:    require("../../assets/merchants/whatsapp.webp"),
  x:           require("../../assets/merchants/x.webp"),
  youtube:     require("../../assets/merchants/youtube.webp"),
  zepto:       require("../../assets/merchants/zepto.webp"),
  zomato:      require("../../assets/merchants/zomato.webp"),
} as const;

type AssetKey = keyof typeof MERCHANT_ASSETS;
export type MerchantAssetSource = (typeof MERCHANT_ASSETS)[AssetKey];

// keyword (lowercase) → registry key — order matters: more specific entries first
const KEYWORD_MAP: { pattern: string; key: AssetKey }[] = [
  { pattern: "ubereats",       key: "uber" },
  { pattern: "uber eats",      key: "uber" },
  { pattern: "amazon prime",   key: "prime" },
  { pattern: "prime video",    key: "prime" },
  { pattern: "disney+ hotstar",key: "hotstar" },
  { pattern: "disney hotstar", key: "hotstar" },
  { pattern: "jiomart",        key: "jimart" },
  { pattern: "jio mart",       key: "jimart" },
  { pattern: "google one",     key: "googleone" },
  { pattern: "google pay",     key: "googlepay" },
  { pattern: "gpay",           key: "googlepay" },
  { pattern: "tez",            key: "googlepay" },
  { pattern: "phone pe",       key: "phonepe" },
  { pattern: "book my show",   key: "bookmyshow" },
  { pattern: "make my trip",   key: "makemytrip" },
  { pattern: "openai",         key: "chatgpt" },
  { pattern: "chat gpt",       key: "chatgpt" },
  { pattern: "facebook",       key: "meta" },
  { pattern: "instagram",      key: "meta" },
  { pattern: "ola cabs",       key: "ola" },
  { pattern: "twitter",        key: "x" },
  { pattern: "yt premium",     key: "youtube" },
  // Direct key matches (same spelling)
  { pattern: "airtel",         key: "airtel" },
  { pattern: "amazon",         key: "amazon" },
  { pattern: "bhim",           key: "bhim" },
  { pattern: "blinkit",        key: "blinkit" },
  { pattern: "bookmyshow",     key: "bookmyshow" },
  { pattern: "chatgpt",        key: "chatgpt" },
  { pattern: "claude",         key: "claude" },
  { pattern: "cleartrip",      key: "cleartrip" },
  { pattern: "cred",           key: "cred" },
  { pattern: "flipkart",       key: "flipkart" },
  { pattern: "groww",          key: "groww" },
  { pattern: "hotstar",        key: "hotstar" },
  { pattern: "jimart",         key: "jimart" },
  { pattern: "jio",            key: "jio" },
  { pattern: "linkedin",       key: "linkedin" },
  { pattern: "magicpin",       key: "magicpin" },
  { pattern: "makemytrip",     key: "makemytrip" },
  { pattern: "meesho",         key: "meesho" },
  { pattern: "meta",           key: "meta" },
  { pattern: "myntra",         key: "myntra" },
  { pattern: "netflix",        key: "netflix" },
  { pattern: "ola",            key: "ola" },
  { pattern: "paytm",          key: "paytm" },
  { pattern: "phonepe",        key: "phonepe" },
  { pattern: "prime",          key: "prime" },
  { pattern: "rapido",         key: "rapido" },
  { pattern: "redbus",         key: "redbus" },
  { pattern: "swiggy",         key: "swiggy" },
  { pattern: "uber",           key: "uber" },
  { pattern: "whatsapp",       key: "whatsapp" },
  { pattern: "zepto",          key: "zepto" },
  { pattern: "zomato",         key: "zomato" },
  { pattern: "x",              key: "x" },
  { pattern: "youtube",        key: "youtube" },
];

export function getMerchantAsset(
  name: string | null | undefined,
  slugs?: string[],
): MerchantAssetSource | null {
  const candidates = [name, ...(slugs ?? [])].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

  for (const raw of candidates) {
    const norm = raw.toLowerCase().trim();
    for (const { pattern, key } of KEYWORD_MAP) {
      if (norm === pattern || norm.includes(pattern) || pattern.includes(norm)) {
        return MERCHANT_ASSETS[key];
      }
    }
  }

  return null;
}
