import Groq from "groq-sdk";

export const generateGroqResponse = async ({ prompt, apikey, user }) => {
  try {
    if (!apikey) {
      throw new Error("API key missing. Please add Groq key in dashboard.");
    }

    const groq = new Groq({ apiKey: apikey });

    // Fetch available models
    const modelsList = await groq.models.list();
    const availableModels = modelsList.data.map(m => m.id);

    // Fallback default in case the list is empty for some reason
    let activeModel = "llama3-8b-8192";

    // Find the first model that has "llama" in the name, but isn't a restricted or special model
    const suitableModel = availableModels.find(model =>
      model.toLowerCase().includes("llama") &&
      !model.toLowerCase().includes("prompt-guard") // Skip prompt guards
    );

    if (suitableModel) {
      activeModel = suitableModel;
    } else if (availableModels.length > 0) {
      // If no llama model is found, try to find a qwen or generic model
      const fallback = availableModels.find(model =>
        !model.includes("whisper") &&
        !model.includes("orpheus") &&
        !model.includes("guard")
      );
      if (fallback) activeModel = fallback;
    }

    const safePrompt = prompt || "Hello";
    const finalPrompt = safePrompt + "\n\nImportant: Keep your answer very short, maximum 1 sentence. You are a fast voice assistant.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: finalPrompt }],
      model: activeModel,
      max_tokens: 50,
    });

    const text = chatCompletion.choices[0]?.message?.content;

    if (!text) {
      return "I heard you, but couldn't process the answer.";
    }

    if (user) {
      user.groqStatus = "active";
      await user.save();
    }

    return text.trim();

  } catch (error) {
    console.error("Groq Final Error:", error);

    if (user) {
      user.groqStatus = "invalid";
      await user.save();
    }

    return "AI Server is sleeping or API key is invalid!";
  }
};