import OpenAI from 'openai';
import config from '../config/env.js';
import { CLASSIFICATION_GUIDE, getKBForCategory } from '../config/knowledgeBase.js';

/**
 * AI Service for ticket classification and draft response generation.
 * Uses OpenAI gpt-4o-mini for cost-effective AI features.
 * Degrades gracefully when the API is unavailable.
 */
class AIService {
  constructor() {
    this.client = null;
    this.model = 'gpt-4o-mini';

    if (config.openaiApiKey && config.openaiApiKey !== 'your-openai-api-key-here') {
      this.client = new OpenAI({ apiKey: config.openaiApiKey });
    }
  }

  /**
   * Classify a support ticket into a category and priority level.
   * @param {string} subject - Ticket subject line
   * @param {string} description - Ticket description/body
   * @returns {Promise<{category: string, priority: string}>}
   */
  async classifyTicket(subject, description) {
    if (!this.client) {
      return this._fallbackClassification(subject, description);
    }

    try {
      const prompt = `You are a support ticket classifier for BookLeaf Publishing, a self-publishing company.

${CLASSIFICATION_GUIDE}

Analyse the following support ticket and return a JSON object with exactly two fields:
- "category": one of ROYALTY_PAYMENTS, ISBN_METADATA, PRINTING_QUALITY, DISTRIBUTION_AVAILABILITY, BOOK_STATUS_PRODUCTION, GENERAL_INQUIRY
- "priority": one of CRITICAL, HIGH, MEDIUM, LOW

Ticket Subject: ${subject}
Ticket Description: ${description}

Respond ONLY with the JSON object, no other text.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 100,
      });

      const content = response.choices[0]?.message?.content?.trim();
      const parsed = JSON.parse(content);

      // Validate the returned values
      const validCategories = [
        'ROYALTY_PAYMENTS', 'ISBN_METADATA', 'PRINTING_QUALITY',
        'DISTRIBUTION_AVAILABILITY', 'BOOK_STATUS_PRODUCTION', 'GENERAL_INQUIRY',
      ];
      const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

      if (!validCategories.includes(parsed.category) || !validPriorities.includes(parsed.priority)) {
        return this._fallbackClassification(subject, description);
      }

      return { category: parsed.category, priority: parsed.priority };
    } catch (error) {
      console.warn('AI classification failed, falling back to rule-based classifier:', error.message);
      return this._fallbackClassification(subject, description);
    }
  }

  /**
   * Generate a draft response for a support ticket.
   * @param {object} ticket - The ticket object (subject, description, category, priority)
   * @param {object|null} bookDetails - Associated book details, if any
   * @param {object|null} authorInfo - Author information
   * @returns {Promise<string>} Draft response text
   */
  async generateDraftResponse(ticket, bookDetails, authorInfo) {
    if (!this.client) {
      return this._fallbackDraftResponse(ticket, bookDetails, authorInfo);
    }

    try {
      const categoryKB = getKBForCategory(ticket.category);

      let contextInfo = '';
      if (bookDetails) {
        contextInfo += `\nBook: "${bookDetails.title}" (${bookDetails.bookId}), ISBN: ${bookDetails.isbn}, Status: ${bookDetails.status}`;
        if (bookDetails.mrp) contextInfo += `, MRP: ₹${bookDetails.mrp}`;
        if (bookDetails.totalCopiesSold) contextInfo += `, Copies Sold: ${bookDetails.totalCopiesSold}`;
        if (bookDetails.royaltyPending) contextInfo += `, Royalty Pending: ₹${bookDetails.royaltyPending}`;
        if (bookDetails.royaltyPaid) contextInfo += `, Royalty Paid: ₹${bookDetails.royaltyPaid}`;
        if (bookDetails.printPartner) contextInfo += `, Print Partner: ${bookDetails.printPartner}`;
      }
      if (authorInfo) {
        contextInfo += `\nAuthor: ${authorInfo.name}`;
        if (authorInfo.city) contextInfo += ` from ${authorInfo.city}`;
      }

      const prompt = `You are a professional support agent for BookLeaf Publishing. Write a helpful, empathetic response to the following support ticket.

Relevant Policy:
${categoryKB}

Communication Guidelines:
- Be empathetic and professional
- Acknowledge the author's concern first
- Be specific with numbers, dates, and references
- Own mistakes and do not deflect
- Give clear, realistic timelines
- End with clear next steps

Ticket Details:
- Subject: ${ticket.subject}
- Description: ${ticket.description}
- Category: ${ticket.category}
- Priority: ${ticket.priority}
${contextInfo}

Write a response addressed to the author. Keep it concise but thorough. Do not include a subject line — start directly with the greeting.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content?.trim() || this._fallbackDraftResponse(ticket, bookDetails, authorInfo);
    } catch (error) {
      console.warn('AI draft generation failed, falling back to knowledge base template:', error.message);
      return this._fallbackDraftResponse(ticket, bookDetails, authorInfo);
    }
  }

  /**
   * Fallback rule-based classification when OpenAI is unavailable or rate-limited.
   * Uses domain heuristics based on the BookLeaf knowledge base.
   * @param {string} subject
   * @param {string} description
   * @returns {{category: string, priority: string}}
   */
  _fallbackClassification(subject = '', description = '') {
    const text = `${subject} ${description}`.toLowerCase();

    // 1. ISBN & Metadata
    if (text.includes('isbn') || text.includes('metadata') || text.includes('imprint') || text.includes('wrong book')) {
      const priority = (text.includes('wrong') || text.includes('different') || text.includes('error') || text.includes('duplicate'))
        ? 'CRITICAL'
        : 'HIGH';
      return { category: 'ISBN_METADATA', priority };
    }

    // 2. Printing & Quality
    if (text.includes('print') || text.includes('binding') || text.includes('blurry') || text.includes('misprint') || text.includes('defect') || text.includes('paper quality') || text.includes('reprint')) {
      const priority = (text.includes('terrible') || text.includes('blurry') || text.includes('defect') || text.includes('misaligned') || text.includes('bad quality'))
        ? 'HIGH'
        : 'MEDIUM';
      return { category: 'PRINTING_QUALITY', priority };
    }

    // 3. Distribution & Availability
    if (text.includes('unavailable') || text.includes('stock') || text.includes('out of stock') || text.includes('not showing') || text.includes('amazon') || text.includes('flipkart') || text.includes('listing')) {
      const priority = (text.includes('unavailable') || text.includes('pulled') || text.includes('missing'))
        ? 'HIGH'
        : 'MEDIUM';
      return { category: 'DISTRIBUTION_AVAILABILITY', priority };
    }

    // 4. Royalty & Payments
    if (text.includes('royalty') || text.includes('payment') || text.includes('payout') || text.includes('earnings') || text.includes('bank') || text.includes('payout') || text.includes('₹') || text.includes('rupees') || text.includes('paid')) {
      const priority = (text.includes('month') || text.includes('not received') || text.includes('haven’t received') || text.includes('havent received') || text.includes('never') || text.includes('delayed'))
        ? 'HIGH'
        : 'MEDIUM';
      return { category: 'ROYALTY_PAYMENTS', priority };
    }

    // 5. Book Status & Production Updates
    if (text.includes('typesetting') || text.includes('proofreading') || text.includes('cover design') || text.includes('editing') || text.includes('manuscript') || text.includes('stage') || text.includes('production')) {
      const priority = (text.includes('weeks') || text.includes('months') || text.includes('delayed') || text.includes('stuck'))
        ? 'HIGH'
        : 'MEDIUM';
      return { category: 'BOOK_STATUS_PRODUCTION', priority };
    }

    // 6. Urgency checks
    if (text.includes('urgent') || text.includes('immediately') || text.includes('asap') || text.includes('emergency')) {
      return { category: 'GENERAL_INQUIRY', priority: 'CRITICAL' };
    }

    return { category: 'GENERAL_INQUIRY', priority: 'LOW' };
  }

  /**
   * Fallback draft response generator based on BookLeaf policies when OpenAI is unavailable.
   * Matches the official response examples and guidelines.
   * @param {object} ticket
   * @param {object|null} bookDetails
   * @param {object|null} authorInfo
   * @returns {string}
   */
  _fallbackDraftResponse(ticket, bookDetails, authorInfo) {
    const authorName = authorInfo?.name || 'Author';
    const bookTitle = bookDetails?.title ? `"${bookDetails.title}"` : 'your book';

    switch (ticket.category) {
      case 'ROYALTY_PAYMENTS':
        return `Dear ${authorName},

Thank you for reaching out regarding your royalties for ${bookTitle}. I completely understand your concern and want to provide full clarity on your account.

At BookLeaf, we follow an 80/20 net profit royalty split (80% to the author). Net profit is calculated as the MRP minus printing costs, platform commissions (Amazon/Flipkart), and shipping charges. 

Our royalties are calculated on a quarterly schedule and disbursed within 45 days of the quarter ending, with a minimum payout threshold of ₹1,000. ${bookDetails?.royaltyPending ? `According to our records, your current pending royalty stands at ₹${bookDetails.royaltyPending.toLocaleString('en-IN')}.` : ''}

I am immediately checking your linked bank account status with our accounts team to ensure your payout is processed without delay. You will receive an update from us within 48 hours with the exact transaction details.

Warm regards,
BookLeaf Support Team`;

      case 'ISBN_METADATA':
        return `Dear ${authorName},

Thank you for bringing this ISBN and metadata discrepancy to our attention regarding ${bookTitle}. 

We treat all ISBN and platform listing errors as high-priority issues. We understand how critical accurate bibliographic metadata is for your book's discoverability and sales credibility.

I have escalated this directly to our production and distribution lead. We are verifying the ISBN registration under our imprint and cross-referencing platform feeds to resolve this within 48 hours.

We will notify you the moment the correction is confirmed across all listing platforms.

Warm regards,
BookLeaf Production & Support Team`;

      case 'PRINTING_QUALITY':
        return `Dear ${authorName},

I am truly sorry to hear that the print copies of ${bookTitle} did not meet our quality standards. We hold our printing facility and partner presses to strict benchmarks, and we deeply apologize for the disappointment caused.

BookLeaf guarantees free reprints for any defective copies. Could you kindly share a few clear photographs highlighting the print defects, binding issues, or page misalignment?

Once our quality assurance team verifies the photos, we will arrange a complimentary reprint and dispatch fresh copies to your address within 5–7 business days.

Warm regards,
BookLeaf Quality Team`;

      case 'DISTRIBUTION_AVAILABILITY':
        return `Dear ${authorName},

Thank you for contacting us regarding the availability of ${bookTitle}. 

When a published title shows as "Currently Unavailable" on Amazon or Flipkart, it is almost always a stock sync feed delay between the distributor and marketplace inventory caches.

I have triggered an immediate catalog and inventory re-sync with our distribution team. The listing should refresh and reflect live availability within 24 to 48 hours.

I will monitor this listing closely and confirm once it is accessible for purchase again.

Warm regards,
BookLeaf Operations Team`;

      case 'BOOK_STATUS_PRODUCTION':
        return `Dear ${authorName},

Thank you for checking in on the production progress of ${bookTitle}. We know how eager you are to see your work published, and we appreciate your patience.

${bookDetails?.status ? `Your book is currently in the "${bookDetails.status}" stage.` : 'Your book is actively moving through our production pipeline.'} Standard production progresses through manuscript editing, cover design, typesetting, and proofreading before final ISBN assignment and print proofing.

I have spoken with our formatting coordinator to prioritize your file. We will provide you with a milestone update and review proofs within the next 48 hours.

Warm regards,
BookLeaf Publishing Team`;

      case 'GENERAL_INQUIRY':
      default:
        return `Dear ${authorName},

Thank you for contacting BookLeaf Support regarding "${ticket.subject}".

We have received your query and our operations team is reviewing your account details. For general account updates and metadata modifications, changes typically reflect across our systems and distribution channels within 3–5 business days.

A support specialist has been assigned to your ticket and will provide you with a comprehensive update within 24 hours.

Warm regards,
BookLeaf Support Team`;
    }
  }
}

// Export a singleton instance
const aiService = new AIService();
export default aiService;
