import { promotions } from "@/data/promotions";
import type { Article } from "./types";

// Time-sensitive facts come from the verified promotion record rather than
// being hand-written into the article copy.
const promo = promotions.find((p) => p.id === "mh-enrich-10pct-2026")!;

const endDateLabel = "18 August 2026";

export const enrichBonusAugust2026: Article = {
  slug: "enrich-bank-points-bonus-august-2026",
  h1: `Enrich 10% Bank Points Bonus: What to Know Before ${endDateLabel}`,
  seoTitle: "Enrich 10% Bank Points Bonus: August 2026 Guide | Samral",
  metaDescription:
    "Enrich is offering 10% bonus points on eligible Malaysian bank-point conversions until 18 August 2026. See how it works and calculate what your points could become.",
  eyebrow: "GUIDE — MALAYSIA",
  summary: [
    `Qualifying conversions of Malaysian bank reward points into Enrich receive an extra 10% bonus Enrich Points. The promotion ends on ${endDateLabel}.`,
    "The bonus is calculated on the Enrich Points created by the conversion — not on your bank points, and not on the Enrich balance you already hold.",
  ],
  datePublished: "2026-08-12",
  dateModified: "2026-08-12",
  lastVerified: promo.verifiedAt ?? "2026-08-12",
  author: { name: "Samral", url: "https://www.samral.com/about" },
  promotion: {
    endDate: promo.endDate,
    endedNotice: `This promotion ended on ${endDateLabel}.`,
    endedFollowUp:
      "Use the Samral Miles Calculator to check current conversion rates and active promotions.",
  },
  blocks: [
    { type: "heading", level: 2, text: "How the 10% Enrich bonus works" },
    {
      type: "paragraph",
      text: "You convert your bank reward points to Enrich as normal. Your bank applies its own conversion ratio, which produces a number of Enrich Points. The promotion then adds 10% on top of that converted amount.",
    },
    {
      type: "keyNumbers",
      title: "Worked example",
      lines: [
        "25,000 base Enrich Points",
        "+ 2,500 bonus Enrich Points",
        "= 27,500 Enrich Points",
      ],
      note: "The 25,000 here is Enrich Points after the bank conversion — not 25,000 bank reward points.",
    },
    {
      type: "heading",
      level: 2,
      text: "Your existing Enrich balance does not get another 10%",
    },
    {
      type: "paragraph",
      text: "The bonus applies only to qualifying bank points newly converted during the promotion window. Enrich Points already sitting in your account are untouched: if you hold 60,000 Enrich Points and convert enough bank points for 20,000 more, the bonus is calculated on the 20,000, giving 2,000 bonus points — not on the 80,000 combined balance.",
    },
    {
      type: "heading",
      level: 2,
      text: "Your bank points are not the same as Enrich Points",
    },
    {
      type: "paragraph",
      text: "This is where most people misjudge the promotion. Malaysian banks differ in almost every respect that matters:",
    },
    {
      type: "list",
      items: [
        "Conversion ratios — how many bank points buy one Enrich Point.",
        "Conversion blocks — many banks only convert in fixed blocks, so partial blocks are left behind.",
        "Card-specific rates — the same bank can convert at different rates depending on which card earned the points.",
        "Limits — some banks cap how much you can convert per transaction or per period.",
        "Rewards currencies — a bank's points programme may be shared across cards, or separate.",
      ],
    },
    {
      type: "paragraph",
      text: "So knowing you have “100,000 credit-card points” tells you very little about how many Enrich Points you will actually receive, how many blocks convert cleanly, or how many points get stranded. That is the gap Samral exists to close: we hold the per-bank, per-card conversion rules for Malaysian cards and calculate the real outcome.",
    },
    {
      type: "cta",
      variant: "primary",
      title: "See what your bank points actually become",
      text: "Enter your real Malaysian credit-card point balances and Samral will calculate the full conversion blocks, leftover points and potential loyalty-programme balances.",
      buttonLabel: "Calculate My Miles",
      href: "/miles-calculator",
      destination: "miles_calculator",
    },
    { type: "heading", level: 2, text: "What does the promotion mean for your points?" },
    {
      type: "table",
      caption: "10% bonus applied to converted Enrich Points",
      columns: ["Base Enrich after conversion", "10% bonus", "Promotional total"],
      rows: [
        ["5,000", "500", "5,500"],
        ["10,000", "1,000", "11,000"],
        ["25,000", "2,500", "27,500"],
        ["50,000", "5,000", "55,000"],
        ["100,000", "10,000", "110,000"],
      ],
      note: "These figures illustrate the 10% Enrich promotion only. They are not bank conversion ratios — the left-hand column is what your bank conversion already produced in Enrich Points.",
    },
    {
      type: "heading",
      level: 2,
      text: "Should you transfer just because there is a bonus?",
    },
    {
      type: "paragraph",
      text: "Not necessarily. A 10% bonus is worth having, but only on points you were going to move anyway.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Two things to weigh first",
      text: "Bank-to-airline conversions are generally irreversible — once your points become Enrich Points, they stay Enrich Points. And holding enough points for an award does not guarantee award-seat availability on the dates, routes or cabins you want.",
    },
    {
      type: "paragraph",
      text: "Decide what you actually want to redeem before you move anything: a specific route, cabin and rough travel window. If the redemption you have in mind lives in a different programme, a bonus in this one is not a reason to send your points here.",
    },
    {
      type: "cta",
      variant: "secondary",
      title: "Not sure how many Enrich Points your cards would produce?",
      text: "Run your balances through the calculator before you decide — it shows full blocks, leftovers and the bonus applied to eligible routes.",
      buttonLabel: "Calculate My Miles",
      href: "/miles-calculator",
      destination: "miles_calculator",
    },
  ],
  activeOnlyBlocks: [],
  faqs: [
    {
      question: "Does my existing Enrich balance receive the 10% bonus?",
      answer:
        "No. The bonus is calculated only on qualifying Enrich Points created by a bank conversion during the promotion window. Points already in your Enrich account do not earn it.",
    },
    {
      question: "When does the promotion end?",
      answer: `The promotion runs until ${endDateLabel}. Your bank has to submit the conversion within the window, so leave time for processing rather than converting on the final day.`,
    },
    {
      question: "Does having enough Enrich Points guarantee an award seat?",
      answer:
        "No. Award seats are released at the airline's discretion and are limited on most routes and dates. Points are the price; availability is separate.",
    },
    {
      question: "Are bank reward points and Enrich Points the same thing?",
      answer:
        "No. Bank reward points are the bank's own currency. They only become Enrich Points after a conversion, at your bank's ratio and in your bank's conversion blocks — which vary by bank and often by card.",
    },
    {
      question: "Should I transfer my bank points just because there is a bonus?",
      answer:
        "Only if you already intend to redeem with Enrich. Conversions are generally irreversible, so a bonus is a good reason to act sooner on a plan you have, not a reason to make one.",
    },
  ],
  sources: [
    {
      label: promo.sourceName ?? "Enrich promotion terms and conditions",
      url: promo.officialSource,
      publisher: "Malaysia Airlines Enrich",
    },
  ],
  related: [],
};
