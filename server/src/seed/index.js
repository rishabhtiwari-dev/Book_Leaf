import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

/**
 * Seed script for BookLeaf database.
 * Creates admin users, authors, and books from sample data.
 */
async function seed() {
  console.log('🌱 Starting BookLeaf database seeding...\n');

  try {
    // Clear existing data in correct order (respecting foreign keys)
    await prisma.internalNote.deleteMany();
    await prisma.ticketResponse.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ticketCounter.deleteMany();
    console.log('🗑️  Cleared existing data.');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const supportPassword = await bcrypt.hash('support123', 10);
    const authorPassword = await bcrypt.hash('author123', 10);

    // Create admin users
    const admin = await prisma.user.create({
      data: {
        email: 'admin@bookleaf.com',
        password: adminPassword,
        name: 'BookLeaf Admin',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin: admin@bookleaf.com / admin123`);

    const support = await prisma.user.create({
      data: {
        email: 'support@bookleaf.com',
        password: supportPassword,
        name: 'Support Team',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin: support@bookleaf.com / support123`);

    // Read sample data - try multiple paths
    let sampleData;
    const possiblePaths = [
      resolve(__dirname, '../../../../bookleaf_sample_data.json'),
      resolve(__dirname, '../../../bookleaf_sample_data.json'),
      resolve(__dirname, '../../bookleaf_sample_data.json'),
      resolve(process.cwd(), '../bookleaf_sample_data.json'),
      resolve(process.cwd(), 'bookleaf_sample_data.json'),
      'D:\\Bookleaf assign\\bookleaf_sample_data.json',
    ];

    let dataPath = null;
    for (const p of possiblePaths) {
      try {
        readFileSync(p, 'utf-8');
        dataPath = p;
        break;
      } catch {
        // Try next path
      }
    }

    if (!dataPath) {
      console.error('❌ Could not find bookleaf_sample_data.json');
      process.exit(1);
    }

    const rawData = readFileSync(dataPath, 'utf-8');
    sampleData = JSON.parse(rawData);
    console.log(`\n📖 Loaded sample data from: ${dataPath}`);

    // Create authors and their books
    console.log('\n--- Authors ---');
    for (const authorData of sampleData.authors) {
      const user = await prisma.user.create({
        data: {
          email: authorData.email,
          password: authorPassword,
          name: authorData.name,
          role: 'AUTHOR',
          phone: authorData.phone || null,
          city: authorData.city || null,
          authorId: authorData.author_id,
          joinedDate: authorData.joined_date ? new Date(authorData.joined_date) : null,
        },
      });
      console.log(`✅ Created author: ${authorData.name} (${authorData.email} / author123)`);

      // Create books for this author
      for (const bookData of authorData.books) {
        await prisma.book.create({
          data: {
            bookId: bookData.book_id,
            title: bookData.title,
            isbn: bookData.isbn,
            genre: bookData.genre,
            publicationDate: bookData.publication_date ? new Date(bookData.publication_date) : null,
            status: bookData.status,
            mrp: bookData.mrp ?? null,
            authorRoyaltyPerCopy: bookData.author_royalty_per_copy ?? null,
            totalCopiesSold: bookData.total_copies_sold || 0,
            totalRoyaltyEarned: bookData.total_royalty_earned || 0,
            royaltyPaid: bookData.royalty_paid || 0,
            royaltyPending: bookData.royalty_pending || 0,
            lastRoyaltyPayoutDate: bookData.last_royalty_payout_date
              ? new Date(bookData.last_royalty_payout_date)
              : null,
            printPartner: bookData.print_partner || null,
            availableOn: JSON.stringify(bookData.available_on || []),
            userId: user.id,
          },
        });
        console.log(`   📕 Book: ${bookData.title} (${bookData.book_id})`);
      }
    }

    // Create ticket counter
    await prisma.ticketCounter.create({
      data: { id: 'singleton', count: 4 },
    });
    console.log('\n✅ Created ticket counter.');

    // Seed realistic sample tickets matching the BookLeaf assignment document
    console.log('\n--- Seeding Initial Support Tickets ---');
    const priya = await prisma.user.findUnique({ where: { email: 'priya.sharma@email.com' } });
    const whispers = await prisma.book.findUnique({ where: { bookId: 'BK001' } });
    const rohit = await prisma.user.findUnique({ where: { email: 'rohit.kapoor@email.com' } });
    const codeKarma = await prisma.book.findUnique({ where: { bookId: 'BK003' } });
    const vikram = await prisma.user.findUnique({ where: { email: 'vikram.joshi@email.com' } });
    const debuggingLife = await prisma.book.findUnique({ where: { bookId: 'BK006' } });
    const diya = await prisma.user.findUnique({ where: { email: 'diya.chatterjee@email.com' } });
    const durgasDaughters = await prisma.book.findUnique({ where: { bookId: 'BK017' } });

    // Ticket 1: Open Royalty ticket
    await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-0001',
        subject: 'Royalty payout not received for Q3',
        description: 'I published my book 4 months ago and still haven’t received any royalty. What’s going on?',
        category: 'ROYALTY_PAYMENTS',
        priority: 'HIGH',
        status: 'OPEN',
        aiCategory: 'ROYALTY_PAYMENTS',
        aiPriority: 'HIGH',
        userId: priya.id,
        bookId: whispers.id,
      },
    });
    console.log('✅ Created Ticket TKT-0001 (Royalty - Open)');

    // Ticket 2: Critical ISBN ticket with internal note
    const tkt2 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-0002',
        subject: 'ISBN mismatch on Amazon listing',
        description: 'My book is showing a different ISBN on Amazon than what’s on the physical copy.',
        category: 'ISBN_METADATA',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        aiCategory: 'ISBN_METADATA',
        aiPriority: 'CRITICAL',
        userId: rohit.id,
        bookId: codeKarma.id,
        assignedToId: admin.id,
      },
    });
    await prisma.internalNote.create({
      data: {
        content: 'Escalated to Repro India distribution desk. Verifying imprint registration under 978-93-5XXXX-03-5.',
        ticketId: tkt2.id,
        userId: admin.id,
      },
    });
    console.log('✅ Created Ticket TKT-0002 (ISBN Mismatch - Critical, In Progress)');

    // Ticket 3: Printing Quality with Admin response
    const tkt3 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-0003',
        subject: 'Blurry images and misaligned binding in author copies',
        description: 'I received my author copies and the print quality is terrible. The images are blurry and pages are misaligned.',
        category: 'PRINTING_QUALITY',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        aiCategory: 'PRINTING_QUALITY',
        aiPriority: 'HIGH',
        userId: vikram.id,
        bookId: debuggingLife.id,
        assignedToId: support.id,
      },
    });
    await prisma.ticketResponse.create({
      data: {
        content: 'Dear Vikram,\n\nWe sincerely apologize for the quality issue on your author copies. BookLeaf guarantees free reprints for defective copies.\n\nCould you please reply with photos of the defective binding and blurred images? Once verified by our Delhi print facility QA team, we will dispatch a replacement print run within 5–7 business days.',
        ticketId: tkt3.id,
        userId: support.id,
        sentBy: 'ADMIN',
      },
    });
    console.log('✅ Created Ticket TKT-0003 (Printing Quality - In Progress with response)');

    // Ticket 4: Distribution resolved ticket
    const tkt4 = await prisma.ticket.create({
      data: {
        ticketNumber: 'TKT-0004',
        subject: 'Book showing Currently Unavailable on Amazon',
        description: 'My book is published but it’s showing as "Currently Unavailable" on Amazon.',
        category: 'DISTRIBUTION_AVAILABILITY',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        aiCategory: 'DISTRIBUTION_AVAILABILITY',
        aiPriority: 'MEDIUM',
        userId: diya.id,
        bookId: durgasDaughters.id,
        assignedToId: admin.id,
      },
    });
    await prisma.ticketResponse.create({
      data: {
        content: 'Dear Diya,\n\nThank you for reaching out. We have re-synced the inventory feed with Amazon India. The listing is now active and copies are available for ordering.\n\nPlease let us know if you need any further assistance!',
        ticketId: tkt4.id,
        userId: admin.id,
        sentBy: 'ADMIN',
      },
    });
    console.log('✅ Created Ticket TKT-0004 (Distribution - Resolved)');

    // Summary
    const userCount = await prisma.user.count();
    const bookCount = await prisma.book.count();
    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Users: ${userCount} (2 admins + ${userCount - 2} authors)`);
    console.log(`   Books: ${bookCount}`);
    console.log('\n--- Login Credentials ---');
    console.log('Admin:    admin@bookleaf.com / admin123');
    console.log('Support:  support@bookleaf.com / support123');
    console.log('Authors:  <author-email> / author123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
