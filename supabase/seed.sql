-- Seed data for testing the Synapse knowledge management platform

-- Insert default user settings
INSERT INTO user_settings (id, user_id, theme, font_size, line_spacing) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000000', 'dark', 16, 1.5);

-- Insert sample notes
INSERT INTO notes (id, user_id, title, content, display_order) VALUES
('11111111-1111-1111-1111-111111111111',
 '00000000-0000-0000-0000-000000000000',
 'Welcome to Synapse',
 '{"text": "Welcome to Synapse! This is your first note.", "editorState": {"type": "SynapseEditor", "content": {"root": {"children": [{"children": [], "direction": null, "format": "", "indent": 0, "type": "paragraph", "version": 1}], "direction": null, "format": "", "indent": 0, "type": "root", "version": 1}}}}',
 1000),
('22222222-2222-2222-2222-222222222222',
 '00000000-0000-0000-0000-000000000000',
 'Getting Started',
 '{"text": "Here are some tips to get you started...", "editorState": {"type": "SynapseEditor", "content": {"root": {"children": [{"children": [], "direction": null, "format": "", "indent": 0, "type": "paragraph", "version": 1}], "direction": null, "format": "", "indent": 0, "type": "root", "version": 1}}}}',
 2000),
('33333333-3333-3333-3333-333333333333',
 '00000000-0000-0000-0000-000000000000',
 'Features',
 '{"text": "Explore the features of Synapse...", "editorState": {"type": "SynapseEditor", "content": {"root": {"children": [{"children": [], "direction": null, "format": "", "indent": 0, "type": "paragraph", "version": 1}], "direction": null, "format": "", "indent": 0, "type": "root", "version": 1}}}}',
 3000); 