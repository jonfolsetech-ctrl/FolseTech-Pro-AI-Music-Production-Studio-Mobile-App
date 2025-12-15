const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const generateMelody = async (req, res) => {
  try {
    const { prompt, genre, mood, tempo, duration = 16 } = req.body;

    const systemPrompt = `You are an expert music composer and MIDI programmer. Generate a melody based on the user's requirements.`;
    
    const userPrompt = `Create a ${genre} melody with a ${mood} mood at ${tempo} BPM for ${duration} bars. 
Description: ${prompt}

Return a JSON object with MIDI note data in this format:
{
  "notes": [
    {"note": "C4", "midiNote": 60, "start": 0, "duration": 0.5, "velocity": 100},
    ...
  ],
  "tempo": ${tempo},
  "duration": ${duration}
}`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: userPrompt
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
    
    // Extract the melody data from Claude's response
    const content = responseBody.content[0].text;
    
    // Try to parse JSON from the response
    let melodyData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        melodyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: generate a simple melody
      melodyData = generateFallbackMelody(tempo, duration);
    }

    res.json({
      success: true,
      message: 'Melody generated successfully',
      midiData: melodyData.notes,
      tempo: melodyData.tempo,
      duration: melodyData.duration,
      genre,
      mood
    });

  } catch (error) {
    console.error('Melody generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate melody',
      message: error.message 
    });
  }
};

const generateFallbackMelody = (tempo, duration) => {
  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10]
  };
  
  const scale = scales.major;
  const baseNote = 60; // C4
  const notes = [];
  const beatsPerBar = 4;
  const totalBeats = duration * beatsPerBar;

  for (let i = 0; i < totalBeats * 2; i++) {
    const scaleNote = scale[Math.floor(Math.random() * scale.length)];
    notes.push({
      note: `MIDI${baseNote + scaleNote}`,
      midiNote: baseNote + scaleNote,
      start: i * 0.5,
      duration: 0.5,
      velocity: 80 + Math.floor(Math.random() * 30)
    });
  }

  return { notes, tempo, duration };
};

module.exports = {
  generateMelody
};
