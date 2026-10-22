import { getCardById, getBankById } from "./milesCalculator";
import type { ComparisonCountry } from "./rewardComparison";

export type CashbackCategory = "dining" | "groceries" | "online" | "transport" | "travel" | "ewallet" | "autobilling" | "petrol" | "bills" | "cinema" | "overseas" | "weekend" | "contactless" | "reduced" | "other";
/** Card-specific buckets: shown only for cards with a rule for them; never given another issuer's base rate. */
export const CARD_SPECIFIC_CATEGORIES: CashbackCategory[] = ["ewallet", "autobilling", "petrol", "bills", "cinema", "overseas", "weekend", "contactless", "reduced"];
export const CASHBACK_CATEGORIES: Record<CashbackCategory, string> = {
  dining: "Dining", groceries: "Groceries", online: "Online shopping", transport: "Transport", travel: "Travel", ewallet: "E-wallet transactions", autobilling: "Auto-billing", petrol: "Petrol", bills: "Mobile & utility bills", cinema: "Cinema", overseas: "Overseas (foreign currency)", weekend: "Weekend (Sat–Sun)", contactless: "Contactless purchases of RM100+", reduced: "UOB reduced-rate transactions", other: "Other eligible spending",
};
export interface CashbackRule {
  categories: CashbackCategory[];
  ratePercent: number;
  monthlyCap?: number;
  monthlySpendCap?: number;
  fallbackPercent: number;
  /** Category earns nothing unless its own monthly spend reaches this amount. */
  minimumCategorySpend?: number;
  /** Rate chosen by total eligible monthly spend (highest tier reached); overrides ratePercent. */
  tierRates?: { minimumMonthlySpend: number; ratePercent: number }[];
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
  rounding: "monthly_ringgit_down" | "monthly_cent_down" | "monthly_cent_nearest" | "category_cent_nearest" | "transaction_cent_down" | "transaction_cent_nearest";
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
    payoutNotes: "Terms effective 1 November 2025. With RM1,500+ eligible statement-cycle spending: 10% on online, dining (MCC 5811–5814), shopping & grocery and public transport (not online), each capped at RM10 cashback, then 0.2%. Other eligible spending 0.2%, unlimited. Below RM1,500 everything earns 0.2%. Statement cycles are approximated as calendar months. An online transaction with a dining, shopping & grocery or public transport merchant code earns only one 10% rebate: enter it in one category only. E-wallet and petrol spending are excluded, so leave them out of your monthly total.",
  },
  {
    id: "my-maybank-2-amex", name: "Maybank 2 Gold/Platinum American Express", bankId: "maybank", country: "MY", status: "verified", availability: "open",
    baseRatePercent: 0, minimumMonthlySpend: 0,
    rules: [{ categories: ["weekend"], ratePercent: 5, monthlyCap: 50, fallbackPercent: 0 }],
    exclusions: ["government bodies (MCC 9211, 9222, 9223, 9311, 9399, 9402, 9405), utilities (MCC 4900) and e-wallet reloads", "JomPAY, FPX and MyCDD", "EzyCash, EzyPay, EzyPay Plus, Cash Treats, cash advances, balance transfers and quasi-cash", "fees, profit and interest charges; refunded, disputed, unauthorised or fraudulent transactions; business spending"],
    requirements: [],
    sourceUrls: ["https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/cards/credit/maybank_2_platinum_card.page", "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/credit_cards/GRCC-CashBack-TnC.pdf", "https://www.maybank2u.com.my/iwov-resources/pdf/personal/cards/credit_cards/M2C-newbenefits_faq.pdf", "https://www.maybank2u.com.my/maybank2u/malaysia/en/personal/announcements/2026/january/tc-update-for-maybank-2-cards.page"],
    verifiedOn: "2026-10-22", rounding: "monthly_cent_nearest",
    payoutNotes: "5% cashback on eligible Saturday and Sunday spending, local or overseas, capped at RM50 per calendar month. No cashback on weekdays: weekday Amex spending earns TreatsPoints, which are not included here. No minimum spend; cashback is credited only once it reaches RM1. Enter weekend spending in the breakdown; without it the estimate is RM0. Earning rules unchanged in the January 2026 update. Weekend is judged by transaction date as described by Maybank; posting-date edge cases may differ.",
  },
  {
    id: "my-cimb-cash-rebate", name: "CIMB Cash Rebate Platinum", bankId: "cimb", country: "MY", status: "verified", availability: "open",
    baseRatePercent: 0.2, minimumMonthlySpend: 0,
    rules: [{ categories: ["groceries", "petrol", "cinema", "bills"], ratePercent: 2, tierRates: [{ minimumMonthlySpend: 0, ratePercent: 2 }, { minimumMonthlySpend: 3000, ratePercent: 5 }], monthlyCap: 30, fallbackPercent: 0 }],
    exclusions: ["instalment plans including CashLite, cash advances, balance transfers and conversions", "quasi-cash, betting and gaming; fees, late charges, reversals and fraudulent transactions", "charity (MCC 8398) and government (MCC 9211, 9222, 9223, 9311, 9399, 9402, 9405)", "JomPAY, FPX and DuitNow QR; general recurring payments and e-wallet MCC 6540 other than the petrol and bill payments the terms list as included", "business spending"],
    requirements: [],
    sourceUrls: ["https://www.cimb.com.my/en/personal/day-to-day-banking/cards/credit-card/cimb-cash-rebate-platinum-credit-card.html", "https://www.cimb.com.my/content/dam/cimb/personal/documents/tnc/cards/credit-card/conventional/cash-rebate-platinum-tnc.pdf"],
    verifiedOn: "2026-10-22", rounding: "monthly_ringgit_down",
    payoutNotes: "Terms version 18 September 2024. Groceries (MCC 5411/5422/5451), petrol (MCC 5541/5542, plus Setel), cinema (MCC 7832) and mobile/utility bills paid by standing instruction earn 2%, or 5% when the monthly statement balance is RM3,000 or more. The RM30 cap is shared by all four categories combined; spending beyond it earns nothing extra. Other eligible spending earns 0.2%, unlimited. Monthly cashback is rounded down to whole ringgit. Estimate assumption: your monthly spending stands in for your statement balance. The terms list recurring payments and e-wallet MCC 6540 as excluded but specifically include standing-instruction bills and Setel petrol; this estimate follows the specific inclusions.",
  },
  {
    id: "my-affin-duo-cashback", name: "AFFIN DUO Visa Cash Back", bankId: "affin", country: "MY", status: "verified",
    baseRatePercent: 0, minimumMonthlySpend: 0, monthlyCap: 30,
    rules: [
      { categories: ["online", "autobilling"], ratePercent: 3, fallbackPercent: 0 },
      { categories: ["ewallet"], ratePercent: 3, monthlyCap: 30, fallbackPercent: 0 },
    ],
    exclusions: ["government payments (MCC 9211, 9222, 9223, 9311, 9399, 9402, 9405) and charity (MCC 8398)", "online banking, JomPAY, FPX and MOTO payments", "refunds; voided, reversed, disputed, unauthorised, fraudulent or unlawful transactions including illegal betting", "monthly instalments (EPP, CIP, BTiP, FPP), cash advances, fees, finance and late charges, taxes and card repayments"],
    requirements: [],
    sourceUrls: ["https://www.affinalways.com/affin-duo", "https://www.affinalways.com/storage/AffinAlways%20Collaterals/Personal%20Collaterals/Cards%20Conventional/TnC/AFFIN-CreditCard-Generic-TnC-ENG.pdf"],
    verifiedOn: "2026-10-22", rounding: "transaction_cent_down",
    payoutNotes: "Generic credit-card terms version 31 (1 February 2026). 3% on online/e-commerce, e-wallet and auto-billing transactions; 0% on all other spending. E-wallet cashback is capped at RM30 within the overall cap. Overall cap is RM30 when the Visa Cash Back card's previous statement balance is below RM3,000 and RM50 at RM3,000 or more; this estimate conservatively uses RM30. Per-transaction amounts are truncated to two decimals, which monthly totals only approximate.",
  },
  {
    id: "my-pb-quantum-visa", name: "Public Bank Quantum Visa", bankId: "publicbank", country: "MY", status: "verified", availability: "open",
    baseRatePercent: 0, minimumMonthlySpend: 0,
    rules: [{ categories: ["contactless"], ratePercent: 1, monthlyCap: 20, fallbackPercent: 0 }],
    exclusions: ["e-wallet reloads, petrol (MCC 5541/5542/5172), insurance and takaful (MCC 5960/6300)", "casino (MCC 7995), quasi-cash (MCC 6050/6051), cash advances, balance transfers, Flexipay instalments and PB Easy Cash", "recurring payments, direct debits, Public Bank online/mobile-banking and ATM payments", "government (MCC 9211, 9222, 9223, 9311, 9399, 9402, 9405), charity (MCC 8398) and UTAR/TARC campus transactions"],
    requirements: [],
    sourceUrls: ["https://www.pbebank.com/en/cards/our-cards/pb-quantum-credit-cards-2/", "https://www.pbebank.com/media/rdvptenz/exclusion-list-for-card-rewards.pdf"],
    verifiedOn: "2026-10-22", rounding: "monthly_cent_nearest",
    payoutNotes: "1% cashback on eligible contactless transactions of at least RM100 each, capped at RM20 per statement cycle (principal and supplementary combined). Other spending earns VIP Points, not cashback, so it adds RM0 here. Enter only individual contactless purchases of RM100 or more in that category. Public Bank publishes no separate cashback rounding or refund rules; the rewards exclusion list (REV280725) applies.",
  },
  {
    id: "my-rhb-shell-visa", name: "RHB Shell Visa / Visa-i", bankId: "rhb", country: "MY", status: "verified", availability: "open",
    baseRatePercent: 0, minimumMonthlySpend: 1000, belowMinimumPercent: 0,
    rules: [
      { categories: ["petrol"], ratePercent: 3, tierRates: [{ minimumMonthlySpend: 1000, ratePercent: 3 }, { minimumMonthlySpend: 2000, ratePercent: 5 }, { minimumMonthlySpend: 3000, ratePercent: 12 }], monthlyCap: 30, fallbackPercent: 0 },
      { categories: ["groceries"], ratePercent: 1, tierRates: [{ minimumMonthlySpend: 1000, ratePercent: 1 }, { minimumMonthlySpend: 2000, ratePercent: 2 }, { minimumMonthlySpend: 3000, ratePercent: 5 }], minimumCategorySpend: 250, monthlyCap: 10, fallbackPercent: 0 },
      { categories: ["online", "ewallet"], ratePercent: 1, tierRates: [{ minimumMonthlySpend: 1000, ratePercent: 1 }, { minimumMonthlySpend: 2000, ratePercent: 2 }, { minimumMonthlySpend: 3000, ratePercent: 5 }], minimumCategorySpend: 500, monthlyCap: 10, fallbackPercent: 0 },
      { categories: ["bills"], ratePercent: 1, tierRates: [{ minimumMonthlySpend: 1000, ratePercent: 1 }, { minimumMonthlySpend: 2000, ratePercent: 2 }, { minimumMonthlySpend: 3000, ratePercent: 5 }], minimumCategorySpend: 250, monthlyCap: 10, fallbackPercent: 0 },
      { categories: ["overseas"], ratePercent: 1, tierRates: [{ minimumMonthlySpend: 1000, ratePercent: 1 }, { minimumMonthlySpend: 2000, ratePercent: 2 }, { minimumMonthlySpend: 3000, ratePercent: 5 }], minimumCategorySpend: 500, monthlyCap: 50, fallbackPercent: 0 },
      { categories: ["other", "dining", "transport", "travel"], ratePercent: 0.2, minimumCategorySpend: 500, fallbackPercent: 0 },
    ],
    exclusions: ["CashXcess, balance transfers, Dial-An-Instalment, balance conversions, instalment plans, cash advances and quasi-cash (excluded from total spend)", "fees, profit/finance charges, late charges and taxes (excluded from total spend)", "JomPAY, DuitNow, FPX, non-Shell petrol, charity (MCC 8398) and government (MCC 9211, 9222, 9223, 9311, 9399, 9402, 9405): count toward your tier but earn no cashback", "recurring, auto-debit and mail/telephone-order transactions do not earn the online rate"],
    requirements: [],
    sourceUrls: ["https://www.rhbgroup.com/personal/cards/credit-cards/rhb-shell-visa-credit-card/index.html", "https://www.rhbgroup.com/-/media/Files/personal/cards/credit-cards/overview/RHB-Shell-Visa-Credit-Card_Terms.pdf", "https://www.rhbgroup.com/islamic/cards/credit-cards/rhb-shell-visa-credit-card-i/index.html", "https://www.rhbgroup.com/-/media/Files/personal/cards/credit-cards/overview/RHB_Shell_VISA_Credit_Card_i_Terms.pdf"],
    verifiedOn: "2026-10-22", rounding: "category_cent_nearest",
    payoutNotes: "Terms effective 27 January 2026; the Visa and Visa-i tables are identical. Your total monthly eligible spend sets the tier: RM1,000–1,999.99, RM2,000–2,999.99, or RM3,000+. Below RM1,000 there is no tier and no cashback. Shell petrol 3% / 5% / 12% (cap RM30). Groceries, e-wallet top-ups plus online (one shared allowance), and utilities 1% / 2% / 5%, each capped at RM10. Overseas 1% / 2% / 5%, capped at RM50. Other spending 0.2%, unlimited. Each category needs its own minimum (groceries and utilities RM250; online/e-wallet, overseas and other RM500) or earns nothing; capped spending earns nothing further. An online grocery purchase counts once, under groceries. Shell petrol only: enter other petrol as excluded spending. Utilities here means telecoms, pay-TV and electricity bills.",
  },
];

export function cashbackName(product: CashbackProduct) {
  return (product.existingCardId ? getCardById(product.existingCardId)?.name : undefined) ?? product.name;
}
export function cashbackBank(product: CashbackProduct) {
  return getBankById(product.bankId)?.name ?? product.bankId;
}