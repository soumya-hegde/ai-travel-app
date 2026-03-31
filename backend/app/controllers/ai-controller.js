const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Key from .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const aiCtlr = {};

aiCtlr.generateSmartPlan = async (req, res) => {
  const { destination, days, attractions, travelDate, packagePrice } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


    const prompt = `
      Act as an expert travel planner. 
      Destination: ${destination}
      Duration: ${days} days
      Approximate Start Date: ${travelDate}
      Included Attractions: ${Array.isArray(attractions) ? attractions.join(", ") : attractions}
      Budget: ₹${packagePrice}

      Requirement:
      1. Create a detailed day-wise itinerary based on the weather for ${new Date(travelDate).toLocaleString('default', { month: 'long' })} in ${destination}.
      2. Ensure the locations mentioned in "Included Attractions" are covered.
      3. Suggest hidden gems and local food spots.
      4. Group locations logically to minimize travel time.
      
      IMPORTANT: Return ONLY a valid JSON object. 
      JSON Structure:
      {
        "itinerary": [
          { "day": 1, "title": "Day Title", "activities": "Brief description..." }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (remove markdown characters if any)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const finalPlan = JSON.parse(cleanJson);

    res.json(finalPlan);

  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "AI failed to generate a plan. Check API Key." });
  }
};

module.exports = aiCtlr;