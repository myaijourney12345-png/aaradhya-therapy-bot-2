export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { traineeEmail, startTime, endTime, duration, messageCount, conversation } = req.body;

        // Format conversation for email
        const formattedConversation = conversation.map(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            return `[${time}] ${msg.sender}: ${msg.message}`;
        }).join('\n\n');

        // Email content
        const emailSubject = `Therapy Training Session - ${new Date(startTime).toLocaleDateString()}`;
        const emailBody = `
THERAPY TRAINING SESSION SUMMARY

Trainee: ${traineeEmail}
Date: ${new Date(startTime).toLocaleDateString()}
Start Time: ${new Date(startTime).toLocaleTimeString()}
End Time: ${new Date(endTime).toLocaleTimeString()}
Duration: ${duration} minutes
Total Messages: ${messageCount}

FULL CONVERSATION:
${formattedConversation}

---
This is an automated summary from the Aaradhya Therapy Training Bot.
        `.trim();

        // For now, we'll prepare the email data and log it
        // You can later integrate with EmailJS, SendGrid, or another email service
        const emailData = {
            to_email: 'myaijourney12345@gmail.com',
            subject: emailSubject,
            message: emailBody,
            trainee_email: traineeEmail,
            session_date: new Date(startTime).toLocaleDateString(),
            duration: duration,
            message_count: messageCount
        };

        // Log the session data (you'll see this in Vercel function logs)
        console.log('=== THERAPY SESSION SUMMARY ===');
        console.log(`Trainee: ${traineeEmail}`);
        console.log(`Date: ${new Date(startTime).toLocaleDateString()}`);
        console.log(`Duration: ${duration} minutes`);
        console.log(`Messages: ${messageCount}`);
        console.log('Full conversation logged for review');

        return res.status(200).json({ 
            success: true, 
            message: 'Session summary prepared and logged' 
        });

    } catch (error) {
        console.error('Email preparation error:', error);
        return res.status(500).json({ error: 'Failed to prepare session summary' });
    }
}
