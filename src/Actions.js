const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    DISCONNECTED: 'disconnected',
    CODE_CHANGE: 'code-change',
    SYNC_CODE: 'sync-code',
    SEND_MESSAGE: 'send-message',
    NEW_MESSAGE: 'new-message',
    REPLY_TO_MESSAGE: 'reply-to-message',
    MESSAGE_REPLIED: 'message-replied',
    TERMINAL_INPUT: 'terminal-input',
    TERMINAL_OUTPUT: 'terminal-output',
    RUN_CODE: 'run-code',
    CODE_EXECUTION_RESULT: 'code-execution-result',
    STOP_EXECUTION: 'stop-execution',
};

const MESSAGE_TYPES = {
    GENERAL: 'general',
    FRONTEND_ISSUE: 'frontend-issue',
    BACKEND_ISSUE: 'backend-issue',
};

export default ACTIONS;
export { MESSAGE_TYPES };