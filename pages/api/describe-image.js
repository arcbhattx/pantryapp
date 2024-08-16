import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // Ensure your API key is correctly set
});

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Parse JSON body
      const { image } = req.body; // Extract the Base64-encoded image from the request body

      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Validate that the image is Base64 encoded and starts with the correct JPEG MIME type
      if (!image.startsWith('data:image/jpeg;base64,')) {
        return res.status(400).json({ error: 'Invalid image format. Please provide a JPEG image encoded in Base64.' });
      }

      // Interact with the OpenAI API to generate a description of the image
      const response = await client.chat.completions.create({
        model: 'gpt-4o', // Use the appropriate model; ensure it supports image descriptions
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'with one word can you describe the fruit or vegetable in the image'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image // Use the Base64 image directly
                }
              }
            ],
          },
        ],
        max_tokens: 100
      });

      // Log the entire response for debugging
      console.log('API Response:', response);

      // Extract the description message from the response
      const description = response.choices[0].message.content;

      res.status(200).json({ description });
    } catch (error) {
      console.error('Error processing the request:', error);
      res.status(500).json({ error: 'Error generating image description' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
