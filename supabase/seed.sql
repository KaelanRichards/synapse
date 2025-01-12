-- Create a test user (password: test123)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'test@example.com',
    crypt('test123', gen_salt('bf')),
    now(),
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

-- Sample notes
INSERT INTO public.notes (id, title, content, maturity_state, user_id, created_at, updated_at)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Introduction to Graph Theory', 'Graph theory is the study of mathematical structures used to model pairwise relations between objects...', 'MATURE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now()),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Neural Networks Basics', 'Neural networks are computing systems inspired by biological neural networks...', 'GROWTH', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now()),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Knowledge Graphs', 'Knowledge graphs are a way of representing information using graph structures...', 'SAPLING', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Sample note versions
INSERT INTO public.note_versions (note_id, version_number, content, user_id, created_at)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Initial draft: Graph theory basics...', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now() - interval '2 days'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 'Graph theory is the study of mathematical structures used to model pairwise relations between objects...', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now()),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Neural networks are computing systems inspired by biological neural networks...', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now()),
    ('b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 'Knowledge graphs are a way of representing information using graph structures...', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now())
ON CONFLICT (id) DO NOTHING;

-- Sample connections
INSERT INTO public.connections (note_from, note_to, connection_type, strength, bidirectional, context, emergent, user_id, created_at)
VALUES
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'prerequisite', 0.8, true, 'Graph theory is fundamental to understanding knowledge graphs', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now()),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'related', 0.6, false, 'Neural networks can be used to analyze and generate knowledge graphs', true, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now())
ON CONFLICT (id) DO NOTHING;

-- Add some example tags/contexts
COMMENT ON TABLE public.notes IS 'Example contexts: AI, Mathematics, Computer Science, Knowledge Representation';

-- Create some sample clusters (via connections and related content)
INSERT INTO public.notes (id, title, content, maturity_state, user_id, created_at, updated_at)
VALUES
    ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Machine Learning Fundamentals', 'Basic concepts in machine learning including supervised and unsupervised learning...', 'GROWTH', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now()),
    ('b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Deep Learning Applications', 'Practical applications of deep learning in various domains...', 'SEED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create a cluster of related AI/ML notes
INSERT INTO public.connections (note_from, note_to, connection_type, strength, bidirectional, context, emergent, user_id, created_at)
VALUES
    ('b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'prerequisite', 0.9, true, 'Understanding ML basics is essential for neural networks', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now()),
    ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'refines', 0.7, false, 'Neural networks are a key component of deep learning', false, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now())
ON CONFLICT (id) DO NOTHING; 