const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getMasteringRecommendations = async (req, res) => {
  try {
    const { audioAnalysis, targetPlatform, genre } = req.body;

    const prompt = `As a professional mastering engineer, analyze this audio and provide mastering recommendations:

Audio Analysis:
- Current LUFS: ${audioAnalysis.lufs || 'N/A'}
- Dynamic Range: ${audioAnalysis.dynamicRange || 'N/A'}
- Peak Level: ${audioAnalysis.peak || 'N/A'}
- Frequency Balance: ${audioAnalysis.frequencyBalance || 'N/A'}

Target Platform: ${targetPlatform || 'Streaming (Spotify/Apple Music)'}
Genre: ${genre}

Provide specific recommendations for:
1. Target loudness (LUFS)
2. Dynamic range processing
3. EQ adjustments
4. Limiting/compression settings
5. Stereo width adjustments
6. Platform-specific considerations`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      temperature: 0.6,
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
    
    // Parse recommendations into structured format
    const recommendations = {
      success: true,
      advice: responseBody.content[0].text,
      suggestedSettings: parseMasteringSettings(responseBody.content[0].text, targetPlatform)
    };

    res.json(recommendations);

  } catch (error) {
    console.error('Mastering AI error:', error);
    res.status(500).json({ 
      error: 'Failed to get mastering recommendations',
      message: error.message 
    });
  }
};

const parseMasteringSettings = (text, platform) => {
  // Default settings based on platform
  const platformDefaults = {
    'streaming': { targetLUFS: -14, ceiling: -1.0 },
    'youtube': { targetLUFS: -13, ceiling: -1.0 },
    'podcast': { targetLUFS: -16, ceiling: -1.0 },
    'club': { targetLUFS: -8, ceiling: -0.3 },
    'vinyl': { targetLUFS: -18, ceiling: -2.0 }
  };

  const defaults = platformDefaults[platform?.toLowerCase()] || platformDefaults.streaming;

  // Try to extract LUFS value from text
  const lufsMatch = text.match(/-?\d+\.?\d*\s*LUFS/i);
  if (lufsMatch) {
    defaults.targetLUFS = parseFloat(lufsMatch[0]);
  }

  return defaults;
};

module.exports = {
  getMasteringRecommendations
};
