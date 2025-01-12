import type { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  // Handle POST requests for creating new notes
  if (req.method === 'POST') {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title, content, maturity_state: 'SEED' }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create note' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
