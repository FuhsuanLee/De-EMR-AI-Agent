const API_BASE_URL = 'https://api.meta-ai.com.tw';

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }
    return response.json();
};

const apiService = {
    getSessions: async () => {
        const result = await fetch(`${API_BASE_URL}/get_sessions/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        const response = await handleResponse(result);
        return response.result;
    },

    getMessages: async (session_id) => {
        const result = await fetch(`${API_BASE_URL}/get_messages/${session_id}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        const response = await handleResponse(result);
        return response.result;
    },

    deleteSession: async (session_id) => {
        const result = await fetch(`${API_BASE_URL}/delete_session/${session_id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
        });
        const response = await handleResponse(result);
        return response.result;
    },

    createSession: async (title) => {
        const result = await fetch(`${API_BASE_URL}/create_session/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                title: title
            }),
        });
        const response = await handleResponse(result);
        return response.result;
    },

    addMessage: async (session_id, content) => {
        const result = await fetch(`${API_BASE_URL}/add_message/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                session_id: session_id,
                content: content
            }),
        });
        const response = await handleResponse(result);
        if (response.result) {
            if (response.result.content && typeof response.result.content === 'string') {
                response.result.content = response.result.content
                    .replace(/```/g, '')
                    .replace(/markdown/gi, '');
            }
            return response.result;
        } else {
            console.error(`failed: add_message`, response.messages);
            return false;
        }
    },
};


export default apiService;
