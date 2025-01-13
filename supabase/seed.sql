-- Seed data for testing the Synapse knowledge management platform

-- Sample notes with different maturity states
INSERT INTO notes (id, title, content, maturity_state) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Introduction to Neural Networks', 'Neural networks are computing systems inspired by biological neural networks. They are the foundation of many modern AI systems.', 'MATURE'),
    ('22222222-2222-2222-2222-222222222222', 'Backpropagation Algorithm', 'Backpropagation is a method used to train neural networks by calculating gradients of the loss function.', 'GROWTH'),
    ('33333333-3333-3333-3333-333333333333', 'Activation Functions', 'Activation functions introduce non-linearity into neural networks. Common examples include ReLU, sigmoid, and tanh.', 'SAPLING'),
    ('44444444-4444-4444-4444-444444444444', 'Transformer Architecture', 'Transformers use self-attention mechanisms to process sequential data. They have revolutionized NLP.', 'MATURE'),
    ('55555555-5555-5555-5555-555555555555', 'Attention Mechanisms', 'Attention allows models to focus on relevant parts of the input data when producing output.', 'GROWTH'),
    ('66666666-6666-6666-6666-666666666666', 'Vision Transformers', 'Applying transformer architecture to computer vision tasks by treating images as sequences of patches.', 'SEED');

-- Sample version history
INSERT INTO note_versions (note_id, version_number, content) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 'Neural networks are computing systems that are inspired by biological neural networks.'),
    ('11111111-1111-1111-1111-111111111111', 2, 'Neural networks are computing systems inspired by biological neural networks. They are the foundation of many modern AI systems.'),
    ('44444444-4444-4444-4444-444444444444', 1, 'Transformers use self-attention mechanisms to process sequential data.'),
    ('44444444-4444-4444-4444-444444444444', 2, 'Transformers use self-attention mechanisms to process sequential data. They have revolutionized NLP.'); 