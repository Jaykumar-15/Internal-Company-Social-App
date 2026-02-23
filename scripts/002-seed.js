/**
 * Seed script: creates demo users and messages.
 * Run with: node scripts/seed.mjs
 * 
 * Demo accounts (all use password: "password123"):
 * - alice@company.com (Engineering, Senior Software Engineer)
 * - bob@company.com (Design, UX Designer)
 * - carol@company.com (Engineering, Engineering Manager)
 * - david@company.com (Marketing, Content Strategist)
 * - eva@company.com (Product, Product Manager)
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

const PASSWORD = "password123";

const users = [
  {
    email: "alice@company.com",
    name: "Alice Johnson",
    department: "Engineering",
    title: "Senior Software Engineer",
    skills: "React,Node.js,TypeScript,GraphQL",
    bio: "Full-stack engineer passionate about developer experience and clean architecture.",
    show_email: true,
  },
  {
    email: "bob@company.com",
    name: "Bob Martinez",
    department: "Design",
    title: "UX Designer",
    skills: "Figma,User Research,Prototyping,Design Systems",
    bio: "Creating intuitive interfaces that users love. Previously at a design agency.",
    show_email: true,
  },
  {
    email: "carol@company.com",
    name: "Carol Chen",
    department: "Engineering",
    title: "Engineering Manager",
    skills: "Leadership,Agile,Python,System Design",
    bio: "Leading the platform team. I enjoy mentoring and building scalable systems.",
    show_email: true,
  },
  {
    email: "david@company.com",
    name: "David Kim",
    department: "Marketing",
    title: "Content Strategist",
    skills: "SEO,Copywriting,Analytics,Social Media",
    bio: "Crafting stories that resonate. Data-driven content is my thing.",
    show_email: false,
  },
  {
    email: "eva@company.com",
    name: "Eva Rossi",
    department: "Product",
    title: "Product Manager",
    skills: "Roadmapping,User Stories,A/B Testing,Analytics",
    bio: "Bridging the gap between engineering, design, and business goals.",
    show_email: true,
  },
];

async function seed() {
  console.log("Hashing password...");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  console.log("Creating users...");
  const userIds = {};
  for (const u of users) {
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, department, title, skills, bio, show_email)
      VALUES (${u.email}, ${passwordHash}, ${u.name}, ${u.department}, ${u.title}, ${u.skills}, ${u.bio}, ${u.show_email})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, email
    `;
    userIds[u.email] = rows[0].id;
    console.log(`  Created: ${u.name} (${u.email}) -> ID ${rows[0].id}`);
  }

  console.log("Creating demo messages...");
  const alice = userIds["alice@company.com"];
  const bob = userIds["bob@company.com"];
  const carol = userIds["carol@company.com"];
  const david = userIds["david@company.com"];
  const eva = userIds["eva@company.com"];

  const messages = [
    { sender: alice, receiver: bob, body: "Hey Bob! Do you have the mockups ready for the new dashboard?", minutesAgo: 120 },
    { sender: bob, receiver: alice, body: "Hi Alice! Yes, I just finished them. I'll share the Figma link in a few minutes.", minutesAgo: 105 },
    { sender: alice, receiver: bob, body: "Perfect, thank you! The team is excited about the new design direction.", minutesAgo: 90 },
    { sender: carol, receiver: alice, body: "Alice, can we sync on the sprint planning for next week?", minutesAgo: 300 },
    { sender: alice, receiver: carol, body: "Sure Carol! How about Tuesday at 10am?", minutesAgo: 270 },
    { sender: carol, receiver: alice, body: "Works for me. I will send a calendar invite.", minutesAgo: 260 },
    { sender: eva, receiver: david, body: "David, I need your help with the launch announcement copy. When are you free?", minutesAgo: 30 },
    { sender: david, receiver: eva, body: "I have a slot at 3pm today. Let me pull up the brief and we can review together.", minutesAgo: 20 },
  ];

  for (const m of messages) {
    await sql`
      INSERT INTO messages (sender_id, receiver_id, body, created_at)
      VALUES (${m.sender}, ${m.receiver}, ${m.body}, NOW() - ${m.minutesAgo + ' minutes'}::interval)
    `;
  }

  console.log(`  Created ${messages.length} messages.`);
  console.log("\nSeed complete! Demo accounts:");
  console.log("  Email: alice@company.com  Password: password123");
  console.log("  Email: bob@company.com    Password: password123");
  console.log("  Email: carol@company.com  Password: password123");
  console.log("  Email: david@company.com  Password: password123");
  console.log("  Email: eva@company.com    Password: password123");
}

seed().catch(console.error);
