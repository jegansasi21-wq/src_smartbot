// ========================================
// SRC SMARTBOT - JAVASCRIPT
// ========================================

const API_URL = "http://127.0.0.1:5000/chat";

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const clearChatButton = document.getElementById("clearChat");

let isSending = false;


// ========================================
// SCROLL TO LATEST MESSAGE
// ========================================

function scrollToLatest() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}


// ========================================
// ADD MESSAGE TO CHAT
// ========================================

function addChatMessage(text, sender) {
    const row = document.createElement("div");

    row.className =
        sender === "user"
            ? "chat-message user-chat-message"
            : "chat-message bot-message";

    // Bot avatar
    if (sender === "bot") {
        const avatar = document.createElement("div");

        avatar.className = "chat-message-avatar";
        avatar.textContent = "S";

        row.appendChild(avatar);
    }

    // Message bubble
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    bubble.appendChild(paragraph);
    row.appendChild(bubble);

    chatMessages.appendChild(row);

    scrollToLatest();
}


// ========================================
// ENABLE / DISABLE SEND BUTTON
// ========================================

function setSendingState(sending) {
    isSending = sending;

    if (sendButton) {
        sendButton.disabled = sending;
    }

    if (messageInput) {
        messageInput.disabled = sending;
    }
}


// ========================================
// SEND MESSAGE TO PYTHON BACKEND
// ========================================

async function sendMessage(question) {

    if (!question || isSending) {
        return;
    }

    const cleanQuestion = question.trim();

    if (cleanQuestion.length === 0) {
        messageInput.focus();
        return;
    }

    // Display user message
    addChatMessage(cleanQuestion, "user");

    // Clear input
    messageInput.value = "";

    // Disable button while processing
    setSendingState(true);

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: cleanQuestion
            })
        });

        // Read server response
        const result = await response.json();

        // Check for errors
        if (!response.ok) {
            throw new Error(
                result.answer || "The server returned an error."
            );
        }

        // Display chatbot answer
        addChatMessage(
            result.answer || "Sorry, no answer was returned.",
            "bot"
        );

    } catch (error) {

        console.error("SRC SmartBot Error:", error);

        addChatMessage(
            "Sorry! I couldn't connect to the chatbot server. " +
            "Please make sure the Python Flask backend is running " +
            "at http://127.0.0.1:5000.",
            "bot"
        );

    } finally {

        // Enable input and button again
        setSendingState(false);

        if (messageInput) {
            messageInput.focus();
        }
    }
}


// ========================================
// SEND BUTTON AND ENTER KEY
// ========================================

if (chatForm) {

    chatForm.addEventListener("submit", function (event) {

        // Prevent page refresh
        event.preventDefault();

        // Send message
        sendMessage(messageInput.value);

    });

} else {
    console.error(
        "SRC SmartBot Error: chatForm was not found in index.html."
    );
}


// ========================================
// QUICK QUESTION BUTTONS
// ========================================

document.querySelectorAll("[data-question]").forEach(function (button) {

    button.addEventListener("click", function (event) {

        event.preventDefault();

        const question = button.dataset.question;

        if (question) {
            sendMessage(question);
        }

    });

});


// ========================================
// CLEAR CHAT BUTTON
// ========================================

if (clearChatButton) {

    clearChatButton.addEventListener("click", function () {

        // Remove previous messages
        chatMessages.replaceChildren();

        // Add chat heading
        const heading = document.createElement("div");

        heading.className = "chat-date";
        heading.textContent = "YOUR CAMPUS ASSISTANT";

        chatMessages.appendChild(heading);

        // Welcome message
        addChatMessage(
            "Hello! Welcome to SRC SmartBot. How can I help you today?",
            "bot"
        );

        messageInput.focus();

    });

}


// ========================================
// INITIALISE CHATBOT
// ========================================

console.log("SRC SmartBot JavaScript loaded successfully.");