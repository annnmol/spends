import type { ComponentType } from "react";

// All bank SVG assets — imported as React components via react-native-svg-transformer
import AbnAmro from "@root/assets/banks/ABN AMRO.svg";
import AbuDhabi from "@root/assets/banks/Abu Dhabi Commercial Bank.svg";
import Airtel from "@root/assets/banks/Airtel Payments Bank.svg";
import AmericanExpress from "@root/assets/banks/American Express.svg";
import AuSmallFinance from "@root/assets/banks/AU Small Finance Bank.svg";
import Anz from "@root/assets/banks/Australia and New Zealand Banking Group.svg";
import Axis from "@root/assets/banks/Axis bank.svg";
import Bandhan from "@root/assets/banks/Bandhan Bank.svg";
import Maybank from "@root/assets/banks/Bank Maybank Indonesia.svg";
import BankOfAmerica from "@root/assets/banks/Bank of America.svg";
import BankOfBahrain from "@root/assets/banks/Bank of Bahrain and Kuwait.svg";
import BankOfBaroda from "@root/assets/banks/Bank of Baroda.svg";
import BankOfCeylon from "@root/assets/banks/Bank of Ceylon.svg";
import BankOfChina from "@root/assets/banks/Bank of China.svg";
import BankOfIndia from "@root/assets/banks/Bank of India.svg";
import BankOfMaharashtra from "@root/assets/banks/Bank of Maharastra.svg";
import Barclays from "@root/assets/banks/Barclays Bank.svg";
import BnpParibas from "@root/assets/banks/BNP Paribas.svg";
import Canara from "@root/assets/banks/Canara Bank.svg";
import CentralBankOfIndia from "@root/assets/banks/Central Bank of India.svg";
import Citi from "@root/assets/banks/Citi Bank.svg";
import CityUnion from "@root/assets/banks/City Union Bank.svg";
import CreditSuisse from "@root/assets/banks/Credit Suisse.svg";
import CreditAgricole from "@root/assets/banks/Credit Agricole Corporate and Investment Bank.svg";
import Csb from "@root/assets/banks/CSB Bank.svg";
import Dbs from "@root/assets/banks/DBS Bank.svg";
import Dcb from "@root/assets/banks/DCB Bank.svg";
import Deutsche from "@root/assets/banks/Deutsche Bank.svg";
import Dhanlaxmi from "@root/assets/banks/Dhanlaxmi Bank.svg";
import Doha from "@root/assets/banks/Doha Bank.svg";
import EmiratesNbd from "@root/assets/banks/Emirates NBD.svg";
import Esaf from "@root/assets/banks/ESAF Small Finance Bank Ltd.svg";
import Fino from "@root/assets/banks/FINO Payments Bank.svg";
import FirstAbuDhabi from "@root/assets/banks/First Abu Dhabi Bank.svg";
import FirstRand from "@root/assets/banks/FirstRand Bank.svg";
import Hdfc from "@root/assets/banks/HDFC Bank.svg";
import Hsbc from "@root/assets/banks/HSBC Bank.svg";
import Icici from "@root/assets/banks/ICICI Bank.svg";
import Idbi from "@root/assets/banks/IDBI Bank.svg";
import Idfc from "@root/assets/banks/IDFC Bank.svg";
import IndiaPost from "@root/assets/banks/India Post Payments Bank.svg";
import IndianBank from "@root/assets/banks/Indian Bank.svg";
import IndianOverseas from "@root/assets/banks/Indian Overseas Bank.svg";
import IndusInd from "@root/assets/banks/Induslnd Bank.svg";
import Icbc from "@root/assets/banks/Industrial & Commercial Bank of China.svg";
import IndustrialBankKorea from "@root/assets/banks/Industrial Bank of Korea.svg";
import JkBank from "@root/assets/banks/Jammu & Kashmir Bank.svg";
import Jio from "@root/assets/banks/Jio Payments Bank.svg";
import Jpmorgan from "@root/assets/banks/JPMorgan Chase.svg";
import Karnataka from "@root/assets/banks/Karnataka Bank.svg";
import KebHana from "@root/assets/banks/KEB Hana Bank.svg";
import Kookmin from "@root/assets/banks/Kookmin Bank.svg";
import Kotak from "@root/assets/banks/Kotak Mahindra Bank.svg";
import KrungThai from "@root/assets/banks/Krung Thai Bank.svg";
import Mizuho from "@root/assets/banks/Mizuho Corporate Bank.svg";
import Mufg from "@root/assets/banks/MUFG Bank.svg";
import Nainital from "@root/assets/banks/Nainital Bank.svg";
import NatWest from "@root/assets/banks/NatWest Bank.svg";
import Paytm from "@root/assets/banks/Paytm Payments Bank.svg";
import PunjabSind from "@root/assets/banks/Punjab & Sind Bank.svg";
import Pnb from "@root/assets/banks/Punjab National Bank.svg";
import Qnb from "@root/assets/banks/Qatar National Bank.svg";
import Rbl from "@root/assets/banks/RBL Bank.svg";
import Sberbank from "@root/assets/banks/Sberbank.svg";
import Scotia from "@root/assets/banks/Scotia Bank.svg";
import Shinhan from "@root/assets/banks/Shinhan Bank.svg";
import SocieteGenerale from "@root/assets/banks/Societe Generale.svg";
import Sonali from "@root/assets/banks/Sonali Bank.svg";
import SouthIndian from "@root/assets/banks/South Indian Bank.svg";
import StandardChartered from "@root/assets/banks/Standard Chartered Bank.svg";
import Sbi from "@root/assets/banks/State Bank of India.svg";
import Smbc from "@root/assets/banks/Sumitomo Mitsui Banking Corporation.svg";
import TamilnadMercantile from "@root/assets/banks/Tamilnad Mercantile Bank.svg";
import Uco from "@root/assets/banks/UCO Bank.svg";
import Ujjivan from "@root/assets/banks/Ujjivan Small Finance Bank.svg";
import UnionBank from "@root/assets/banks/Union Bank.svg";
import Uob from "@root/assets/banks/United Overseas Bank.svg";
import Westpac from "@root/assets/banks/Westpac.svg";
import Woori from "@root/assets/banks/Woori Bank.svg";
import YesBank from "@root/assets/banks/Yes Bank.svg";

export type BankSvgComponent = ComponentType<{
  width?: number | string;
  height?: number | string;
}>;

// Multiple keywords can map to the same component
export const BANK_MAP: Record<string, BankSvgComponent> = {
  // A
  "abn amro": AbnAmro,
  abn: AbnAmro,
  "abu dhabi commercial": AbuDhabi,
  adcb: AbuDhabi,
  airtel: Airtel,
  "airtel payments": Airtel,
  "american express": AmericanExpress,
  amex: AmericanExpress,
  anz: Anz,
  "au small finance": AuSmallFinance,
  "au bank": AuSmallFinance,
  axis: Axis,
  // B
  bandhan: Bandhan,
  barclays: Barclays,
  bbk: BankOfBahrain,
  bnp: BnpParibas,
  "bnp paribas": BnpParibas,
  boa: BankOfAmerica,
  "bank of america": BankOfAmerica,
  "bank of baroda": BankOfBaroda,
  bob: BankOfBaroda,
  "bank of ceylon": BankOfCeylon,
  "bank of china": BankOfChina,
  boc: BankOfChina,
  "bank of india": BankOfIndia,
  boi: BankOfIndia,
  "bank of maharashtra": BankOfMaharashtra,
  "bank of maharastra": BankOfMaharashtra,
  bom: BankOfMaharashtra,
  // C
  canara: Canara,
  "central bank of india": CentralBankOfIndia,
  citi: Citi,
  citibank: Citi,
  "city union": CityUnion,
  cub: CityUnion,
  "credit agricole": CreditAgricole,
  cacib: CreditAgricole,
  "credit suisse": CreditSuisse,
  csb: Csb,
  // D
  dbs: Dbs,
  dcb: Dcb,
  deutsche: Deutsche,
  dhanlaxmi: Dhanlaxmi,
  doha: Doha,
  // E
  "emirates nbd": EmiratesNbd,
  enbd: EmiratesNbd,
  esaf: Esaf,
  // F
  fino: Fino,
  "first abu dhabi": FirstAbuDhabi,
  fab: FirstAbuDhabi,
  firstrand: FirstRand,
  // H
  hdfc: Hdfc,
  hsbc: Hsbc,
  // I
  icbc: Icbc,
  icici: Icici,
  idbi: Idbi,
  idfc: Idfc,
  "india post": IndiaPost,
  ippb: IndiaPost,
  "indian bank": IndianBank,
  iob: IndianOverseas,
  "indian overseas": IndianOverseas,
  indusind: IndusInd,
  induslnd: IndusInd,
  ibk: IndustrialBankKorea,
  // J
  "j&k": JkBank,
  jkb: JkBank,
  "jammu kashmir": JkBank,
  jio: Jio,
  jpmorgan: Jpmorgan,
  "jp morgan": Jpmorgan,
  chase: Jpmorgan,
  // K
  karnataka: Karnataka,
  "keb hana": KebHana,
  hana: KebHana,
  kookmin: Kookmin,
  kotak: Kotak,
  "kotak mahindra": Kotak,
  "krung thai": KrungThai,
  ktb: KrungThai,
  // M
  maybank: Maybank,
  mizuho: Mizuho,
  mufg: Mufg,
  "mitsubishi ufj": Mufg,
  // N
  nainital: Nainital,
  natwest: NatWest,
  // P
  paytm: Paytm,
  "punjab sind": PunjabSind,
  psb: PunjabSind,
  pnb: Pnb,
  "punjab national": Pnb,
  // Q
  qnb: Qnb,
  "qatar national": Qnb,
  // R
  rbl: Rbl,
  // S
  sberbank: Sberbank,
  sber: Sberbank,
  scotiabank: Scotia,
  scotia: Scotia,
  shinhan: Shinhan,
  "societe generale": SocieteGenerale,
  sg: SocieteGenerale,
  sonali: Sonali,
  "south indian": SouthIndian,
  sib: SouthIndian,
  "standard chartered": StandardChartered,
  scb: StandardChartered,
  sbi: Sbi,
  "state bank of india": Sbi,
  "state bank": Sbi,
  smbc: Smbc,
  "sumitomo mitsui": Smbc,
  // T
  "tamilnad mercantile": TamilnadMercantile,
  tmb: TamilnadMercantile,
  // U
  uco: Uco,
  ujjivan: Ujjivan,
  "union bank": UnionBank,
  ubi: UnionBank,
  uob: Uob,
  "united overseas": Uob,
  // W
  westpac: Westpac,
  woori: Woori,
  // Y
  "yes bank": YesBank,
  yes: YesBank,
};
