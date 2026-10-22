import { getCardById, getBankById } from "./milesCalculator";
import type { ComparisonCountry } from "./rewardComparison";

export type CashbackCategory = "dining" | "groceries" | "online" | "transport" | "travel" | "reduced" | "other";
export const CASHBACK_CATEGORIES: Record<CashbackCategory, string> = {
  dining: "Dining", groceries: "Groceries", online: "Online shopping", transport: "Transport", travel: "Travel", reduced: "UOB reduced-rate transactions", other: "Other eligible spending",
};
export interface CashbackRule {
  categories: CashbackCategory[];
  ratePercent: number;
  monthlyCap?: number;
  monthlySpendCap?: number;
  fallbackPercent: number;
}
export interface CashbackProduct {
  id: string;
  /** Reuse canonical identity whenever the existing registry contains this product. */
  existingCardId?: string;
  name: string;
  bankId: string;
  country: ComparisonCountry;
  status: "verified" | "needs_review";
  baseRatePercent?: number;
  minimumMonthlySpend?: number;
  /** Rate on all eligible spending when the monthly minimum is not met. */
  belowMinimumPercent?: number;
  belowMinimumMonthlyCap?: number;
  availability?: "open" | "existing_cardholders";
  monthlyCap?: number;
  /** Reference data only; this rewards comparison excludes card annual fees. */
  annualFee?: number;
  rules: CashbackRule[];
  exclusions: string[];
  excludedMccs?: string[];
  excludedDescriptions?: string[];
  reducedRateMccs?: string[];
  requirements: string[];
  sourceUrls: string[];
  verifiedOn?: string;
  reviewNotes?: string;
  rounding: "monthly_cent_down" | "monthly_cent_nearest" | "category_cent_nearest" | "transaction_cent_down" | "transaction_cent_nearest";
  payoutNotes?: string;
}

export const cashbackProducts: CashbackProduct[] = [
  {
    id: "sg-uob-absolute", name: "UOB Absolute Cashback", bankId: "uob-sg", country: "SG", status: "verified",
    baseRatePercent: 1.7, minimumMonthlySpend: 0, annualFee: 196.2,
    rules: [{ categories: ["reduced"], ratePercent: 0.3, fallbackPercent: 0.3 }],
    reducedRateMccs: ["7911", "8211", "8220", "8241", "8244", "8249", "8299", "9311", "9399", "9402", "0742", "5047", "5122", "5912", "5975", "8011", "8021", "8041", "8042", "8043", "8049", "8062", "8071", "8099", "4900", "8398", "6513", "7261", "7278", "7311", "7361", "7392", "8999"],
    exclusions: ["NETS / NETS-related payments", "instalment plans / SmartPay unless specifically eligible", "cash advances, loans, balance or fund transfers", "bank fees and charges", "refunded / reversed / cancelled transactions", "UOB Payment Facility", "rolled-over balances"],
    requirements: [],
    sourceUrls: ["https://www.uob.com.sg/assets/pdfs/tncs-governing-uob-absolute-cashback-card.pdf", "https://www.uob.com.sg/personal/cards/services/annual-fees.page"],
    verifiedOn: "2026-10-22", rounding: "category_cent_nearest",
    payoutNotes: "No cashback cap. 0.3% applies to the listed education, government, medical, utilities, charity, rental and service MCCs, plus Grab wallet top-ups, locally and overseas. SimplyGo ABT earns 1.7%. Statement-month category totals round to nearest cent. Automatic next-statement bill credit, not withdrawable cash. Personal spending and good-standing account required. Temporary contactless bonuses excluded.",
  },
  {
    id: "sg-sc-simply-cash", name: "Standard Chartered Simply Cash", bankId: "sc-sg", country: "SG", status: "verified",
    baseRatePercent: 1.5, minimumMonthlySpend: 0, annualFee: 196.2, rules: [],
    exclusions: ["cash advances, funds transfers and EasyPay instalments", "AXS / SAM / ATM", "insurance", "recurring-authority and online-banking bill payments", "fees, interest and rolled balances", "refunded / reversed / fraudulent transactions", "betting", "prepaid top-ups", "excluded merchant codes and payment descriptions in the source"],
    excludedMccs: ["4829", "4900", "5047", "5199", "6012", "6050", "6051", "6540", "6211", "6513", "6529", "6530", "6534", "7299", "7349", "7511", "7523", "8062", "8211", "8220", "8241", "8244", "8249", "8299", "8398", "8651", "8661", "8999", "9211", "9222", "9223", "9311", "9399", "9402", "9405"],
    excludedDescriptions: ["EZ LINK", "EZ-LINK", "FLASHPAY ATU", "TRANSIT EZ LINK", "PAYPAL * BIZCONSULTA", "PAYPAL * CAPITALROYA", "TRANSIT LINK", "EZLINK", "SIMPLYGO", "TRANSITLINK"],
    requirements: [], sourceUrls: ["https://www.sc.com/sg/credit-cards/simply-cash-credit-card/", "https://www.sc.com/content/dam/sc/sg/en/documents/sg-simply-cash-card-terms-and-conditions.pdf", "https://www.sc.com/sg/terms-and-conditions/cc-retail-transaction-exclusions/"],
    verifiedOn: "2026-10-22", rounding: "transaction_cent_down",
    payoutNotes: "No cashback cap. Cashback truncates to cents per transaction; monthly-total estimates may be slightly higher than actual credits. First-year waiver not assumed; principal-card standard ongoing fee used. Current-statement earnings offset the next statement. Good-standing account and minimum payments required. Supplementary cards and acquisition offers are not modelled.",
  },
  {
    id: "sg-citi-cashback-plus", name: "Citi Cash Back+", bankId: "citi-sg", country: "SG", status: "verified", baseRatePercent: 1.6, minimumMonthlySpend: 0, annualFee: 196.2, rules: [], requirements: [], rounding: "transaction_cent_nearest", verifiedOn: "2026-10-22",
    exclusions: ["fees, interest, issuer GST charges, cash advances and instalment plans", "balance / fund transfers and bill payments", "education, government, insurance, financial institutions and nonprofits", "gambling and quasi-cash", "prepaid top-ups and transit", "refunds and reversals", "excluded merchant codes and descriptors in the official schedule"],
    excludedMccs: ["4829", "4900", "5199", "5960", "5993", "6012", "6050", "6051", "6211", "6300", "6513", "6529–6540", "7349", "7511", "7523", "7800", "7995", "8062", "8211–8299", "8398", "8651–8661", "9000–9999"],
    excludedDescriptions: ["AXS", "specified AMAZE-prefixed transactions", "BANC DE BINARY", "BUS/MRT", "EZ-link", "OANDA ASIA PAC", "SAM", "Saxo Cap Mkts", "SIMPLYGO", "SPL AUTO / ATU / ONLINE", "SKYFX.COM", "TL-ABT", "TRANSIT", "Transit Link", "Youtrip Singapore SG"],
    sourceUrls: ["https://www.citibank.com.sg/credit-cards/cashback/cashback-plus-card/pdf/cashback-plus-card-members-agreement.pdf", "https://www.citibank.com.sg/credit-cards/cashback/cashback-plus-card/pdf/information-sheet.pdf", "https://www.citibank.com.sg/credit-cards/pdf/rewards-exclusion-list.pdf", "https://www.citibank.com.sg/credit-cards/cash-rebate/pdf/sms-redemption-terms-and-conditions.pdf"],
    payoutNotes: "No cashback cap or earning minimum. Accrued cashback is estimated, not immediately received cash. SMS redemption has a verified S$10 minimum and S$10/S$20/S$50 options; the app minimum is unverified. Product-specific crediting allows approximately seven working days. Per-transaction nearest-cent rounding is approximated from monthly totals. No Citi Plus or acquisition bonus included. Personal principal card, full timely payment and good-standing account assumed.",
  },
  {
    id: "sg-ocbc-infinity", name: "OCBC INFINITY", bankId: "ocbc-sg", country: "SG", status: "verified", baseRatePercent: 1.6, minimumMonthlySpend: 0, annualFee: 196.2, rules: [], requirements: [], rounding: "monthly_cent_nearest", verifiedOn: "2026-10-22",
    exclusions: ["fees, interest, late charges and issuer GST charges", "balance transfers and instalment plans", "income tax, cash advances and internet-banking bill payments", "prepaid accounts / payment providers including EZ-Link, NETS FlashPay, eNETS, SAM, Transit Link, AXS, GrabPay, YouTrip, Shopee Pay and Singtel Dash", "excluded merchant codes in the official schedule", "refunded or reversed purchases"],
    excludedMccs: ["4784", "4829", "4900", "5047", "5199", "5960", "5993", "6010", "6012", "6051", "6211", "6300", "6513", "6540", "7349", "7523", "7995", "8062", "8211", "8220", "8241", "8244", "8249", "8299", "8398", "8651", "8661", "8675", "8699", "9211", "9222", "9223", "9311", "9399", "9402", "9405"],
    sourceUrls: ["https://www.ocbc.com/personal-banking/cards/infinity-unlimited-cashback-card", "https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tncs-governing-ocbc-infinity-cashback-card-programme.pdf", "https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/cards-fee-charge.pdf"],
    payoutNotes: "No cashback cap or minimum spending. Eligible posted calendar-month spending rounds to nearest cent; credited the following month. Principal personal card standard ongoing annual fee included; fee waivers and supplementary cards not modelled. Good-standing account and full timely payment assumed.",
  },
  {
    id: "sg-ocbc-365", name: "OCBC 365", bankId: "ocbc-sg", country: "SG", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "transaction_cent_down",
    sourceUrls: ["https://www.ocbc.com/personal-banking/cards/365-cashback-credit-card", "https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tncs-governing-365-cc-cashback-programme.pdf"], reviewNotes: "Tiered categories and upcoming November changes need a complete dated model; this card is not ranked.",
  },
  {
    id: "sg-hsbc-live-plus", name: "HSBC Live+", bankId: "hsbc-sg", country: "SG", status: "needs_review", baseRatePercent: 0.3, annualFee: 196.2, rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.hsbc.com.sg/credit-cards/products/liveplus/", "https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/liveplus/terms-and-conditions-cashback.pdf"], reviewNotes: "Quarterly qualification, issue-quarter rules and merchant-specific categories require a fuller model. The advertised introductory 8% is not applied to all spending.",
  },
  {
    id: "sg-dbs-live-fresh", name: "DBS Live Fresh", bankId: "dbs-sg", country: "SG", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.dbs.com.sg/personal/cards/credit-cards/live-fresh-dbs-visa-paywave-platinum-card"], reviewNotes: "Complete current category, payment-method and fee terms await verification.",
  },
  {
    id: "sg-maybank-barcelona", name: "Maybank FC Barcelona Visa Signature", bankId: "maybank-sg", country: "SG", status: "needs_review", baseRatePercent: 1.6, annualFee: 130.8, rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-fc-barcelona-visa-signature-card.page"], reviewNotes: "Full exclusions and rounding were not accessible for verification. The Malaysia product’s terms are not reused.",
  },
  {
    id: "my-ambank-cash-rebate", name: "AmBank Cash Rebate Visa Platinum", bankId: "ambank", country: "MY", status: "verified", availability: "open",
    baseRatePercent: 0.2, minimumMonthlySpend: 1500, belowMinimumPercent: 0.2,
    rules: [
      { categories: ["online"], ratePercent: 10, monthlyCap: 10, monthlySpendCap: 100, fallbackPercent: 0.2 },
      { categories: ["dining"], ratePercent: 10, monthlyCap: 10, monthlySpendCap: 100, fallbackPercent: 0.2 },
      { categories: ["groceries"], ratePercent: 10, monthlyCap: 10, monthlySpendCap: 100, fallbackPercent: 0.2 },
      { categories: ["transport"], ratePercent: 10, monthlyCap: 10, monthlySpendCap: 100, fallbackPercent: 0.2 },
    ],
    exclusions: ["Petrol (MCC 5541/5542) and e-wallet (MCC 6540) transactions, which also do not count toward the RM1,500 threshold", "government payments, charity, instalment plans, cash and quasi-cash, balance transfers, AmFlexi-Plus/QuickCash", "fees, interest and tax; internet-banking bill payments, JomPAY, FPX and DuitNow QR", "payments without a merchant code or with MCC 0000; reversed, fraudulent or disputed transactions", "recurring payments do not earn the online rate"],
    requirements: [],
    sourceUrls: ["https://www.ambank.com.my/cards/credit-cards/ambank-cash-rebate-visa-platinum-card", "https://www.ambank.com.my/docs/ambankretaillibraries/terms-and-conditions/ambank-cash-rebate-platinum-card-tnc.pdf?sfvrsn=475f8553_1"],
    verifiedOn: "2026-10-22", rounding: "category_cent_nearest",
    payoutNotes: "Terms effective 1 November 2025. With RM1,500+ eligible statement-cycle spending: 10% on online, dining (MCC 5811–5814), shopping & grocery and public transport (not online), each capped at RM10 cashback, then 0.2%. Other eligible spending 0.2%, unlimited. Below RM1,500 everything earns 0.2%. Statement cycles are approximated as calendar months.",
  },
  { id: "my-maybank-2-amex", name: "Maybank 2 Gold/Platinum American Express", bankId: "maybank", country: "MY", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit/maybank_2_platinum_card.page"], reviewNotes: "Weekend 5% cashback is capped at RM50 a month, but the weekday cashback rate and minimum-spend rule are not confirmed." },
  { id: "my-cimb-cash-rebate", name: "CIMB Cash Rebate Platinum", bankId: "cimb", country: "MY", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-card/cimb-cash-rebate-platinum-credit-card.html"], reviewNotes: "Category caps, the lower-tier category rate and exclusions are not confirmed in official terms." },
  { id: "my-affin-duo-cashback", name: "AFFIN DUO Visa Cash Back", bankId: "affin", country: "MY", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.affinalways.com/en/affin-duo"], reviewNotes: "The cashback rate on non-category spending and any minimum spend are not confirmed." },
  { id: "my-pb-quantum-visa", name: "Public Bank Quantum Visa", bankId: "publicbank", country: "MY", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.pbebank.com/en/cards/our-cards/pb-quantum-credit-cards-2/"], reviewNotes: "Cashback depends on contactless transactions of RM100 or more; exclusions and other-spend treatment are not confirmed." },
  { id: "my-rhb-shell-visa", name: "RHB Shell Visa / Visa-i", bankId: "rhb", country: "MY", status: "needs_review", rules: [], exclusions: [], requirements: [], rounding: "monthly_cent_nearest",
    sourceUrls: ["https://www.rhbgroup.com/personal/cards/credit-cards/rhb-shell-visa-credit-card/index.html"], reviewNotes: "Treatment below RM1,000, below category minimums and after caps, plus full exclusions, are not confirmed." },
];

export function cashbackName(product: CashbackProduct) {
  return (product.existingCardId ? getCardById(product.existingCardId)?.name : undefined) ?? product.name;
}
export function cashbackBank(product: CashbackProduct) {
  return getBankById(product.bankId)?.name ?? product.bankId;
}