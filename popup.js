document.getElementById("generateBtn").addEventListener("click", () => {
    // Get the stored OpenAI API key
    chrome.storage.local.get("openaiKey", ({ openaiKey }) => {
      if (!openaiKey) {
        document.getElementById("output").innerText = "❌ API key not set. Click 'Set API Key' below.";
        return;
      }
      runOpenAIRequest(openaiKey);
    });
  });
  
  async function runOpenAIRequest(apiKey) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractRepo" }, async (repoData) => {
        if (!repoData) {
          document.getElementById("output").innerText = "❌ No repo data received.";
          return;
        }
  
        const prompt = `Write a concise, resume-ready description for the following GitHub project:\n\nName: ${repoData.name}\nDescription: ${repoData.description}\nTopics: ${repoData.topics}\nREADME: ${repoData.readme.substring(0, 1000)}\n\nBlurb:`;
  
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
              ],
              max_tokens: 150,
              temperature: 0.7
            })
          });
  
          const text = await response.text();
          console.log("🔍 OpenAI Response:", text);
  
          try {
            const data = JSON.parse(text);
            const result = data.choices?.[0]?.message?.content?.trim() || "❌ No content in response.";
            document.getElementById("output").innerText = result;
          } catch (err) {
            document.getElementById("output").innerText = "❌ Failed to parse OpenAI response.";
          }
  
        } catch (networkError) {
          console.error("❌ Fetch failed:", networkError);
          document.getElementById("output").innerText = "❌ Error: " + networkError.message;
        }
      });
    });
  }
  