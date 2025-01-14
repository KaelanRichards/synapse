-- Seed data for testing the Synapse knowledge management platform

-- Sample user settings
INSERT INTO user_settings (id, user_id, theme, font_size, line_spacing, default_maturity_state) VALUES
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000000', 'dark', 16, 1.5, 'SEED');

-- Sample notes with different maturity states
INSERT INTO notes (id, user_id, title, content, maturity_state, display_order) VALUES
    ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'Introduction to Neural Networks', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Neural networks are computing systems inspired by biological neural networks. They are the foundation of many modern AI systems.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'MATURE', 1000),
    
    ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'Backpropagation Algorithm', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Backpropagation is a method used to train neural networks by calculating gradients of the loss function.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'GROWTH', 2000),
    
    ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'Activation Functions', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Activation functions introduce non-linearity into neural networks. Common examples include ReLU, sigmoid, and tanh.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'SAPLING', 3000),
    
    ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'Transformer Architecture', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Transformers use self-attention mechanisms to process sequential data. They have revolutionized NLP.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'MATURE', 4000),
    
    ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'Attention Mechanisms', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Attention allows models to focus on relevant parts of the input data when producing output.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'GROWTH', 5000),
    
    ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'Vision Transformers', 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Applying transformer architecture to computer vision tasks by treating images as sequences of patches.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 
    'SEED', 6000);

-- Sample version history
INSERT INTO note_versions (note_id, version_number, content) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Neural networks are computing systems that are inspired by biological neural networks.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}'),
    
    ('11111111-1111-1111-1111-111111111111', 2, 
    '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Neural networks are computing systems inspired by biological neural networks. They are the foundation of many modern AI systems.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}');

-- Sample tags
INSERT INTO tags (id, user_id, name, color) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'Deep Learning', '#FF4444'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'Neural Networks', '#44FF44'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'Architecture', '#4444FF'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'Computer Vision', '#FF44FF');

-- Sample note tags
INSERT INTO note_tags (note_id, tag_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    ('44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('66666666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd');

-- Sample connections
INSERT INTO connections (note_from, note_to, connection_type, strength, bidirectional, context) VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'prerequisite', 8.0, true, 'Understanding neural networks is essential before learning backpropagation'),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'related', 6.0, true, 'Activation functions are a core component of neural networks'),
    ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'refines', 9.0, false, 'Attention mechanisms are a key innovation in transformer architecture'),
    ('44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'related', 7.0, true, 'Vision transformers adapt the transformer architecture for images'); 