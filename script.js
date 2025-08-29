let sessionData = {
    userEmail: '',
    messages: [],
    startTime: new Date(),
    messageCount: 1
};

let sessionTimer;

function startSession() {
    const email = document.getElementById('userEmail').value.trim();
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    sessionData.userEmail = email;
    sessionData.startTime = new Date();
    
    document.getElementById('emailForm').style.display = 'none';
    document.getElementById('chatInterface').style.display = 'flex';
    
    // Add initial message to session data
    sessionData.messages.push({
        sender: 'Aaradhya',
        message: '(adjusts dupatta, looks down) Hi... my family said I should come here to talk to someone.',
        timestamp: new Date()
    });
    
    // Display initial message
    addMessageToChat('Aaradhya', '(adjusts dupatta, looks down) Hi... my family said I should come here to talk to someone.', 'bot-message');
    
    startTimer();
    document.getElementById('messageInput').focus();
}

function startTimer() {
    sessionTimer = setInterval(() => {
        const elapsed = Math.floor((new Date() - sessionData.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('sessionTime').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('Therapist', message, 'user-message');
    
    // Add to session data
    sessionData.messages.push({
        sender: 'Therapist',
        message: message,
        timestamp: new Date()
    });
    
    // Clear input and show loading
    input.value = '';
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    try {
        // Send to API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: sessionData.messages.slice(-10) // Last 10 messages for context
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Add bot response
        addMessageToChat('Aaradhya', data.response, 'bot-message');
        
        // Add to session data
        sessionData.messages.push({
            sender: 'Aaradhya',
            message: data.response,
            timestamp: new Date()
        });
        
        // Update message count
        sessionData.messageCount++;
        document.getElementById('messageCount').textContent = `Messages: ${sessionData.messageCount}`;
        
        // Check if session should end (every 35 messages from Aaradhya)
        const aaradhyaMessages = sessionData.messages.filter(m => m.sender === 'Aaradhya').length;
        if (aaradhyaMessages >= 35 && aaradhyaMessages % 35 === 0) {
            setTimeout(() => {
                addMessageToChat('Aaradhya', 'Hey looks like the time is over, I need to go back home. Is it okay if we continue talking next week?', 'bot-message');
                sessionData.messages.push({
                    sender: 'Aaradhya',
                    message: 'Hey looks like the time is over, I need to go back home. Is it okay if we continue talking next week?',
                    timestamp: new Date()
                });
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('System', 'Sorry, there was an error. Please try again.', 'bot-message');
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
        input.focus();
    }
}

function addMessageToChat(sender, message, className) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> <span>${message}</span>`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function endSession() {
    if (confirm('Are you sure you want to end this session?')) {
        clearInterval(sessionTimer);
        
        // Send session data via email
        sendSessionEmail();
        
        // Reset UI
        document.getElementById('chatInterface').style.display = 'none';
        document.getElementById('emailForm').style.display = 'block';
        document.getElementById('userEmail').value = '';
        
        // Clear chat messages
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        // Reset session data
        sessionData = {
            userEmail: '',
            messages: [],
            startTime: new Date(),
            messageCount: 1
        };
    }
}

async function sendSessionEmail() {
    try {
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: sessionData.userEmail,
                sessionData: sessionData
            })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Session data has been sent to your email!');
        } else {
            console.error('Failed to send email:', result.error);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Enter key support for email input
    document.getElementById('userEmail').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startSession();
        }
    });
    
    // Enter key support for message input
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
