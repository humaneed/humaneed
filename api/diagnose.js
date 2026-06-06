// api/diagnose.js
export default async function handler(req, res) {
    // Nur POST-Anfragen zulassen
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { bio, vagal, cog, text } = req.body;
    
    // Systemkohärenz wird weiterhin deterministisch berechnet
    const coherence = Math.round((bio * 0.5) + (vagal * 0.3) + (cog * 0.2));

    // Der Master-Prompt: Hier ist deine Philosophie als Systemgesetz hinterlegt
    const systemPrompt = `
    Du bist die Diagnostik-Engine für 'HUMANEED'. Deine Architektur basiert auf der Polyvagal-Theorie, Epigenetik und kognitiver Integrität.
    Analysiere die folgenden Nutzerwerte und das Micro-Journaling. 
    Werte: Biologische Basis (Schlaf/Körper): ${bio}%, Vagal-Zustand (Stress): ${vagal}%, Kognitive Last: ${cog}%.
    
    REGELWERK:
    1. Wenn Biologie < 30% oder Kohärenz < 40%: Kritische Überlastung. Wähle "Setup 07 (Physiologischer Reset)".
    2. Wenn Kognition < 40% (fragmentiert): DMN überstimuliert. Wähle "Setup 04 & 11 (Kognitive Integrität)".
    3. Wenn Vagal < 40% (Sympathikus-Dominanz): Vorbereitung für glymphatisches System blockiert. Wähle "Setup 09 (Low-Light-Abend)".
    4. Wenn Text Ablenkung/Handy erwähnt: Setup 08 (Graustufen-Modus).
    5. Sonst: Setup 15 (Der klare Cut).
    
    OUTPUT:
    Du antwortest AUSSCHLIESSLICH in diesem exakten JSON-Format, ohne jeglichen anderen Text:
    {
      "kohärenz": ${coherence},
      "diagnose": "Eine 2-Satz philosophisch-neurologische Diagnose basierend auf den Werten und dem Text.",
      "titel": "Der Name des Setups (z.B. Der physiologische Reset)",
      "aktion": "Eine harte, präzise Handlungsanweisung in maximal 3 Sätzen."
    }
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Der geheime Schlüssel
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Das intelligenteste Modell für komplexe Logik
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Journal-Eintrag: "${text || 'Kein Eintrag.'}"` }
                ],
                temperature: 0.2, // Sehr niedrige Temperatur für klinische Präzision, keine Halluzinationen
                response_format: { type: "json_object" } // Zwingt OpenAI zu JSON
            })
        });

        const data = await response.json();
        const diagnosisJSON = JSON.parse(data.choices[0].message.content);
        
        return res.status(200).json(diagnosisJSON);

    } catch (error) {
        return res.status(500).json({ error: 'Systemausfall in der Diagnose-Engine.' });
    }
}
