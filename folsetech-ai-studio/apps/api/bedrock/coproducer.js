const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getProducerAdvice = async (req, res) => {
  try {
    const { question, context } = req.body;

    const systemPrompt = `You are an expert music producer and audio engineer with decades of experience. 
Provide professional, actionable advice on music production, mixing, mastering, and creative decisions.
Be specific and technical when needed, but also explain concepts clearly.`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: question + (context ? `\n\nContext: ${context}` : '')
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({
      success: true,
      advice: responseBody.content[0].text,
      modelUsed: 'claude-3-sonnet'
    });

  } catch (error) {
    console.error('Co-producer error:', error);
    res.status(500).json({ 
      error: 'Failed to get production advice',
      message: error.message 
    });
  }
};

const analyzeArrangement = async (req, res) => {
  try {
    const { trackStructure, genre } = req.body;

    const prompt = `Analyze this song arrangement and provide professional feedback:

Genre: ${genre}
Structure: ${JSON.stringify(trackStructure, null, 2)}

Provide:
1. Overall assessment
2. Suggestions for improvement
3. Common issues to watch for
4. Genre-specific advice`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    res.json({
      success: true,
      analysis: responseBody.content[0].text
    });

  } catch (error) {
    console.error('Arrangement analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze arrangement',
      message: error.message 
    });
  }
};

module.exports = {
  getProducerAdvice,
  analyzeArrangement
};
