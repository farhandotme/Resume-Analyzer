const API_BASE_URL = 'http://localhost:3000';

type ChatApiData = {
    success?: boolean;
    answer?: string;
    retrieved_chunks?: string[];
};

export type ChatResponse = {
    success: boolean;
    data?: ChatApiData;
    error?: string;
};

type SendChatMessageParams = {
    pdfUrl?: string;
    message: string;
    sessionId: string;
};

export const sendChatMessage = async ({ pdfUrl, message, sessionId }: SendChatMessageParams): Promise<ChatResponse> => {
    if (!message.trim()) {
        throw new Error('Message cannot be empty');
    }

    if (!sessionId) {
        throw new Error('Chat session is missing. Please start a new chat.');
    }

    const payload = {
        ...(pdfUrl ? { pdfUrl } : {}),
        message,
        sessionId,
    };

    const response = await fetch(`${API_BASE_URL}/resume/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    let data: ChatResponse;

    try {
        data = (await response.json()) as ChatResponse;
    } catch {
        throw new Error('The server returned an invalid response.');
    }

    if (!response.ok || !data.success) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Unable to process your message.');
    }

    return data;
};
