/**
 * BookLeaf Knowledge Base
 *
 * Comprehensive reference material for AI-powered ticket classification
 * and response generation. Contains company policies, procedures, and
 * communication guidelines.
 */

export const BOOKLEAF_KNOWLEDGE_BASE = `
=== BOOKLEAF PUBLISHING — KNOWLEDGE BASE ===

## Company Overview
BookLeaf is a self-publishing company operating in India and the US. We process 1,200+ books monthly.
- Packages: Standard Free Package and Bestseller Breakthrough Package.
- Services: cover design, typesetting, ISBN allocation, printing, distribution, and royalty management.
- In-house printing facility in Delhi, with partner printers: Repro India and Epitome Books.

## Royalty Policy
- Revenue split: 80% to the author, 20% to BookLeaf.
- Net profit calculation: MRP − printing cost − platform commission − shipping charges.
- Royalties are calculated quarterly.
- Payment is issued within 45 days after the quarter ends.
- Minimum payout threshold: ₹1,000. If earnings are below this, they roll over to the next quarter.
- Payment method: direct bank transfer (NEFT/IMPS).
- Authors can view a full breakdown (copies sold, per-copy royalty, deductions) on their dashboard.

## ISBN Policy
- Each book receives a unique ISBN provided by BookLeaf at no extra cost.
- The ISBN is registered under the BookLeaf imprint.
- Authors may independently obtain their own ISBN if they prefer.
- ISBN errors (wrong title, wrong author name) are treated as high-priority issues and are escalated to the production team immediately.

## Printing & Quality
- Most books are printed at BookLeaf's in-house facility in Delhi.
- Overflow and specific requirements go to partner printers: Repro India or Epitome Books.
- Standard turnaround time: 5–7 business days from print approval.
- Quality issues (misprints, binding defects, colour problems): author must submit photographs as proof. After verification, BookLeaf provides a free reprint at no cost.

## Distribution Channels
- Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.
- New book listings take 7–10 business days to appear on platforms after publishing.
- If a book shows "Unavailable" on a platform, it is typically a stock-sync issue. BookLeaf re-syncs inventory within 24–48 hours upon request.

## Production Stages (in order)
1. Manuscript Received
2. Editing
3. Cover Design ← common delay point
4. Typesetting
5. Proofreading ← common delay point
6. ISBN Assignment
7. Printing
8. Distribution Setup
9. Published & Live

## Communication Tone Guidelines
- Always be empathetic and professional.
- Acknowledge the author's concern first before providing a solution.
- Be specific: include numbers, dates, and references where applicable.
- Own mistakes and do not deflect.
- Provide clear, realistic timelines.
- End every response with clear next steps so the author knows what to expect.
`;

/**
 * Condensed classification guide used in the AI classification prompt.
 * Kept short to minimise token usage.
 */
export const CLASSIFICATION_GUIDE = `
Category definitions:
- ROYALTY_PAYMENTS: questions or issues about royalty amounts, payment delays, payout calculations, missing payments, royalty breakdowns.
- ISBN_METADATA: ISBN errors, wrong metadata (title/author name), ISBN assignment requests.
- PRINTING_QUALITY: misprints, binding defects, colour issues, paper quality, reprint requests.
- DISTRIBUTION_AVAILABILITY: book not showing on Amazon/Flipkart/BookLeaf Store, listing delays, "unavailable" status, stock-sync problems.
- BOOK_STATUS_PRODUCTION: questions about production stage, delays in editing/cover design/typesetting/proofreading, publication timeline.
- GENERAL_INQUIRY: anything that does not clearly fit the above categories.

Priority rules:
- CRITICAL: financial loss, completely wrong ISBN/metadata already published, book pulled from all platforms.
- HIGH: payment delays > 30 days past due, significant quality defects, book unavailable on major platform for > 48h.
- MEDIUM: general royalty questions, minor metadata corrections, production stage inquiries, single-platform availability.
- LOW: informational questions, general inquiries, feature requests, feedback.
`;

/**
 * Returns category-specific KB excerpt for response generation.
 * @param {string} category - The ticket category
 * @returns {string} Relevant knowledge base section
 */
export function getKBForCategory(category) {
  const sections = {
    ROYALTY_PAYMENTS: `
Royalty Policy:
- 80/20 split (80% author). Net profit = MRP − printing cost − platform commission − shipping.
- Quarterly calculation, paid within 45 days. Minimum ₹1,000 threshold.
- Payment via bank transfer (NEFT/IMPS). Dashboard shows full breakdown.
`,
    ISBN_METADATA: `
ISBN Policy:
- Unique ISBN from BookLeaf, registered under BookLeaf imprint.
- Author can get own ISBN independently.
- ISBN errors are high-priority — escalated to production team immediately.
`,
    PRINTING_QUALITY: `
Printing & Quality:
- In-house facility in Delhi + partners Repro India, Epitome Books.
- 5–7 business days turnaround from print approval.
- Quality issues: author submits photos → verification → free reprint.
`,
    DISTRIBUTION_AVAILABILITY: `
Distribution:
- Channels: Amazon India, Flipkart, Amazon US, Amazon UK, BookLeaf Store.
- New listings: 7–10 business days after publishing.
- "Unavailable" = stock-sync issue → re-sync within 24–48 hours.
`,
    BOOK_STATUS_PRODUCTION: `
Production Stages:
1. Manuscript Received → 2. Editing → 3. Cover Design (common delay) → 4. Typesetting
→ 5. Proofreading (common delay) → 6. ISBN Assignment → 7. Printing → 8. Distribution Setup → 9. Published & Live
`,
    GENERAL_INQUIRY: `
BookLeaf is a self-publishing company in India and US. Packages: Standard Free, Bestseller Breakthrough.
Services: cover design, typesetting, ISBN, printing, distribution, royalty management.
`,
  };

  return sections[category] || sections.GENERAL_INQUIRY;
}
