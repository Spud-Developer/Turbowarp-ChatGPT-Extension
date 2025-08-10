// Made by: Spud_Developer with help from ChatGPT-5

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('"ChatGPT" must be run unsandboxed.');
  }

  const vm = Scratch.vm;

  class ChatGPT {
    constructor() {
      this.apiKey = '';
      this.chatHistory = [];
      this.model = 'gpt-4o-mini';
    }

    getInfo() {
      return {
        id: 'chatgptAPI',
        name: 'ChatGPT',
        color1: '#10a37f',
        color2: '#0e8b6b',
        color3: '#0c7357',
        blocks: [
          {
            opcode: 'setApiKey',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set API key to [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'sk-...' } }
          },
          {
            opcode: 'sendMessage',
            blockType: Scratch.BlockType.REPORTER,
            text: 'send message [MSG]',
            arguments: { MSG: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello!' } }
          },
          {
            opcode: 'sendSystemMessage',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send message as system [MSG]',
            arguments: { MSG: { type: Scratch.ArgumentType.STRING, defaultValue: 'You are a helpful assistant.' } }
          },
          {
            opcode: 'resetChat',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset chatbot'
          },
          {
            opcode: 'exportChat',
            blockType: Scratch.BlockType.REPORTER,
            text: 'export chat'
          },
          {
            opcode: 'importChat',
            blockType: Scratch.BlockType.COMMAND,
            text: 'import chat [CHAT]',
            arguments: { CHAT: { type: Scratch.ArgumentType.STRING, defaultValue: '[]' } }
          }
        ]
      };
    }

    setApiKey(args) {
      this.apiKey = args.KEY.trim();
    }

    async sendMessage(args) {
      if (!this.apiKey) return 'Error: No API key set.';
      const userMsg = args.MSG.toString();
      this.chatHistory.push({ role: 'user', content: userMsg });

      return await this._sendToAPI();
    }

    sendSystemMessage(args) {
      const systemMsg = args.MSG.toString();
      this.chatHistory.push({ role: 'system', content: systemMsg });
    }

    async _sendToAPI() {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: this.chatHistory
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const reply = data.choices[0].message.content;
        this.chatHistory.push({ role: 'assistant', content: reply });
        return reply;
      } catch (e) {
        console.error(e);
        return `Error: ${e.message}`;
      }
    }

    resetChat() {
      this.chatHistory = [];
    }

    exportChat() {
      return JSON.stringify(this.chatHistory);
    }

    importChat(args) {
      try {
        const parsed = JSON.parse(args.CHAT);
        if (Array.isArray(parsed)) this.chatHistory = parsed;
      } catch (e) {
        console.error('Invalid chat JSON:', e);
      }
    }
  }

  Scratch.extensions.register(new ChatGPT());
})(Scratch);
