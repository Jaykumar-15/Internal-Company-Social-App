-- Seed script: creates demo users and messages for testing.
-- All passwords are hashed with bcrypt (password: "password123")
-- The bcrypt hash below corresponds to "password123" with cost factor 12.

-- Demo users (all use @company.com email domain)
INSERT INTO users (email, password_hash, name, department, title, skills, bio, show_email)
VALUES
  ('alice@company.com', '$2a$12$LJ3m4ys3LzHKR8aR1C0uZOFKNGwhDBKdw1IlGNsYjxjMFE2mV6Dkq', 'Alice Johnson', 'Engineering', 'Senior Software Engineer', 'React,Node.js,TypeScript,GraphQL', 'Full-stack engineer passionate about developer experience and clean architecture.', true),
  ('bob@company.com', '$2a$12$LJ3m4ys3LzHKR8aR1C0uZOFKNGwhDBKdw1IlGNsYjxjMFE2mV6Dkq', 'Bob Martinez', 'Design', 'UX Designer', 'Figma,User Research,Prototyping,Design Systems', 'Creating intuitive interfaces that users love. Previously at a design agency.', true),
  ('carol@company.com', '$2a$12$LJ3m4ys3LzHKR8aR1C0uZOFKNGwhDBKdw1IlGNsYjxjMFE2mV6Dkq', 'Carol Chen', 'Engineering', 'Engineering Manager', 'Leadership,Agile,Python,System Design', 'Leading the platform team. I enjoy mentoring and building scalable systems.', true),
  ('david@company.com', '$2a$12$LJ3m4ys3LzHKR8aR1C0uZOFKNGwhDBKdw1IlGNsYjxjMFE2mV6Dkq', 'David Kim', 'Marketing', 'Content Strategist', 'SEO,Copywriting,Analytics,Social Media', 'Crafting stories that resonate. Data-driven content is my thing.', false),
  ('eva@company.com', '$2a$12$LJ3m4ys3LzHKR8aR1C0uZOFKNGwhDBKdw1IlGNsYjxjMFE2mV6Dkq', 'Eva Rossi', 'Product', 'Product Manager', 'Roadmapping,User Stories,A/B Testing,Analytics', 'Bridging the gap between engineering, design, and business goals.', true)
ON CONFLICT (email) DO NOTHING;

-- Demo messages between Alice (1) and Bob (2)
INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT a.id, b.id, 'Hey Bob! Do you have the mockups ready for the new dashboard?', NOW() - INTERVAL '2 hours'
FROM users a, users b WHERE a.email = 'alice@company.com' AND b.email = 'bob@company.com'
AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = a.id AND receiver_id = b.id);

INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT b.id, a.id, 'Hi Alice! Yes, I just finished them. I will share the Figma link in a few minutes.', NOW() - INTERVAL '1 hour 45 minutes'
FROM users a, users b WHERE a.email = 'alice@company.com' AND b.email = 'bob@company.com'
AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = b.id AND receiver_id = a.id);

INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT a.id, b.id, 'Perfect, thank you! The team is excited about the new design direction.', NOW() - INTERVAL '1 hour 30 minutes'
FROM users a, users b WHERE a.email = 'alice@company.com' AND b.email = 'bob@company.com'
AND (SELECT COUNT(*) FROM messages WHERE sender_id = a.id AND receiver_id = b.id) < 2;

-- Demo messages between Alice (1) and Carol (3)
INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT c.id, a.id, 'Alice, can we sync on the sprint planning for next week?', NOW() - INTERVAL '5 hours'
FROM users a, users c WHERE a.email = 'alice@company.com' AND c.email = 'carol@company.com'
AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = c.id AND receiver_id = a.id);

INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT a.id, c.id, 'Sure Carol! How about Tuesday at 10am?', NOW() - INTERVAL '4 hours 30 minutes'
FROM users a, users c WHERE a.email = 'alice@company.com' AND c.email = 'carol@company.com'
AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = a.id AND receiver_id = c.id);

-- Demo message between Eva (5) and David (4)
INSERT INTO messages (sender_id, receiver_id, body, created_at)
SELECT e.id, d.id, 'David, I need your help with the launch announcement copy. When are you free?', NOW() - INTERVAL '30 minutes'
FROM users e, users d WHERE e.email = 'eva@company.com' AND d.email = 'david@company.com'
AND NOT EXISTS (SELECT 1 FROM messages WHERE sender_id = e.id AND receiver_id = d.id);
