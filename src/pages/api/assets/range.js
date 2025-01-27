import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);

    const { collection, startAsset, endAsset } = req.body;

    const assets = await db
      .collection(collection)
      .find({
        assetnumber: {
          $gte: startAsset,
          $lte: endAsset,
        },
      })
      .sort({ assetnumber: 1 })
      .toArray();

    await client.close();
    res.status(200).json({ assets });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}