const { AttachmentBuilder } = require('discord.js');

/**
 * Generates an HTML transcript from a Discord channel's messages.
 * @param {TextChannel} channel - The discord.js channel object
 * @param {Collection<string, Message>} messages - Collection of messages
 * @returns {Buffer} - The HTML buffer
 */
async function generateTranscript(channel, messages) {
    // Sort messages by timestamp
    const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transcript - #${channel.name}</title>
    <style>
        body {
            background-color: #36393f;
            color: #dcddde;
            font-family: "Whitney", "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 16px;
            margin: 0;
            padding: 20px;
        }
        .header {
            border-bottom: 1px solid #2f3136;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #fff;
            margin: 0;
            display: flex;
            align-items: center;
        }
        .message-group {
            margin-bottom: 20px;
            display: flex;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 16px;
            cursor: pointer;
        }
        .content {
            flex: 1;
        }
        .meta {
            margin-bottom: 4px;
        }
        .username {
            font-weight: 500;
            color: #fff;
            margin-right: 8px;
        }
        .timestamp {
            color: #72767d;
            font-size: 12px;
        }
        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.375rem;
        }
        .embed {
            background-color: #2f3136;
            border-left: 4px solid #202225;
            padding: 10px;
            margin-top: 5px;
            border-radius: 4px;
            max-width: 500px;
        }
        .attachment {
            margin-top: 10px;
        }
        .attachment a {
            color: #00b0f4;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>#${channel.name}</h1>
        <p>Transcript generated on ${new Date().toLocaleString()}</p>
        <p>Total Messages: ${sortedMessages.length}</p>
    </div>

    <div class="messages">
        ${sortedMessages.map(msg => {
        const avatarUrl = msg.author.displayAvatarURL({ extension: 'png', size: 64 });
        const date = msg.createdAt.toLocaleString();

        let contentHtml = `<div class="message-content">${msg.content
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
            }</div>`;

        if (msg.embeds.length > 0) {
            msg.embeds.forEach(embed => {
                contentHtml += `
                    <div class="embed" style="border-left-color: ${embed.hexColor || '#202225'}">
                        ${embed.title ? `<strong>${embed.title}</strong><br>` : ''}
                        ${embed.description || ''}
                    </div>`;
            });
        }

        if (msg.attachments.size > 0) {
            msg.attachments.forEach(att => {
                contentHtml += `
                    <div class="attachment">
                        <a href="${att.url}" target="_blank">📄 ${att.name}</a>
                    </div>`;
            });
        }

        return `
            <div class="message-group">
                <img src="${avatarUrl}" class="avatar" alt="Avatar">
                <div class="content">
                    <div class="meta">
                        <span class="username" style="color: ${msg.member?.displayHexColor !== '#000000' ? msg.member?.displayHexColor : '#fff'}">${msg.author.username}</span>
                        <span class="timestamp">${date}</span>
                    </div>
                    ${contentHtml}
                </div>
            </div>`;
    }).join('')}
    </div>
</body>
</html>`;

    return Buffer.from(htmlContent);
}

module.exports = { generateTranscript };
