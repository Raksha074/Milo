(function () {

    // userData
    const script = document.currentScript;
    const userId = script?.dataset?.userId
    const theme = "dark"
    let assistantConfig = null

    // load CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "/assistant.css"
    document.head.appendChild(link)

    // Create PopUp
    const popup = document.createElement("div")
    popup.className = `milo-popup theme-${theme}`
    popup.innerHTML = `
    <div class="milo-overlay"></div>
    <div class="milo-content">
       <div class="milo-top">
            <div class="milo-orb-wrap">
                <div class="milo-orb-glow"></div>
                <div class="milo-orb"></div>
            </div>

            <h2 class="milo-title">
                Hello! I'm Milo
            </h2>

            <p class="milo-sub">
                Your smart voice assistant.
                <br />
                Ask anything about your website.
            </p>

            <div class="milo-status">
                Tap button to Speak
            </div>

            <div class="milo-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <!-- User Text -->
            <div class="milo-user-text">
            </div>

            <!-- AI Text -->
            <div class="milo-ai-text">
            </div>
 
       </div>

        <div class="milo-bottom">
            <button class="milo-mic">
               <img src="/mic.svg" alt="mic" class="milo-mic-icon"/>
            </button>
        </div>
    </div>
    `;

    document.body.appendChild(popup);

    // floating Button
    const button = document.createElement("button")
    button.className = `milo-btn theme-${theme}`
    button.innerHTML = `
    <img 
    src="/logo.png"
    alt="logo"
    />`;
    document.body.appendChild(button)

    // toggle popup
    let open = false
    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";
    }

    // load Assistant
    const loadAssistant = async () => {
        try {
            if (!userId) return;
            const res = await fetch(`http://localhost:8000/api/assistant/config/${userId}`)
            if (!res.ok) {
                return;
            }

            const data = await res.json()

            if (data?.user) {
                assistantConfig = data.user
                applyConfig()
            }

        } catch (error) {
            console.log(
                "Assistant Load Error:",
                error
            );
        }
    }

    const applyConfig = () => {
        if (!assistantConfig) return;

        popup.className = `milo-popup theme-${assistantConfig.theme}`
        button.className = `milo-btn theme-${assistantConfig.theme}`

        const title = popup.querySelector(".milo-title")
        title.innerHTML = `Hello! I'm ${assistantConfig.assistantName}`;

        const subTitle = popup.querySelector(".milo-sub")
        subTitle.innerHTML = `
    Welcome to
    ${assistantConfig.businessName}.
    <br />
    Ask anything about your website.
  `;
    }

    loadAssistant()

    // Element
    const status = popup.querySelector(".milo-status");
    const wave = popup.querySelector(".milo-wave");
    const userText = popup.querySelector(".milo-user-text");
    const aiText = popup.querySelector(".milo-ai-text");
    const mic = popup.querySelector(".milo-mic");

    // text-speech
    const speak = (text) => {
        window.speechSynthesis.cancel();

        // Show AI response
        aiText.innerText = text;
        status.innerText = "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text)
        speech.lang = "hi-IN";
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        // Voice end
        speech.onend = () => {
            status.innerText = "Tap button to Speak";
            wave.style.opacity = "0";
        };

        // Start speaking
        window.speechSynthesis.speak(speech);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalTranscript = "";
        let silenceTimer = null; // ✅ Naya Timer

        mic.onclick = () => {
            finalTranscript = "";
            clearTimeout(silenceTimer); // Purana timer clear karein

            wave.style.opacity = "1";
            status.innerText = "Listening...";
            userText.innerText = "";
            aiText.innerText = "";

            try {
                recognition.start();
                // eslint-disable-next-line no-unused-vars
            } catch (e) {
                // Ignore
            }
        }

        recognition.onresult = (e) => {
            let interimTranscript = "";
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) {
                    finalTranscript += e.results[i][0].transcript;
                } else {
                    interimTranscript += e.results[i][0].transcript;
                }
            }
            userText.innerText = "You: " + (finalTranscript || interimTranscript);

            // ✅ JAISE HI USER KUCH BOLEGA, TIMER RESET HO JAYEGA
            clearTimeout(silenceTimer);

            // ✅ AGAR 2 SECOND TAK KUCH NAHI BOLA, TOH MIC BAND KARDO (2000 ms = 2 sec)
            silenceTimer = setTimeout(() => {
                recognition.stop();
            }, 2000); // Agar 3 second karna ho toh 2000 ki jagah 3000 kar dijiye
        };

        recognition.onend = async () => {
            clearTimeout(silenceTimer); // Safe side ke liye timer band karein
            wave.style.opacity = "0";

            const textToSent = finalTranscript.trim();

            if (!textToSent) {
                status.innerText = "Tap button to Speak";
                return;
            }

            status.innerText = "Thinking...";

            try {
                const res = await fetch("http://localhost:8000/api/assistant/ask", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: textToSent,
                        userId
                    })
                });

                const data = await res.json();
                console.log(data);

                if (data.success) {
                    if (data.action === "navigate") {
                        speak(data.response);
                        setTimeout(() => {
                            window.location.href = data.path;
                        }, 1500);
                    } else {
                        speak(data.aiResponse);
                    }
                } else {
                    speak("Response Error please Check your plan");
                }
            } catch (error) {
                console.log(error);
                speak("AI Server Error");
            }
        };

        recognition.onerror = () => {
            clearTimeout(silenceTimer);
            status.innerText = "Tap button to Speak";
            wave.style.opacity = "0";
        }
    }
    else {
        status.innerText = "Speech Recognition not supported";
    }
})();