import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const FunctionOptions = ({ options, messages, setMessages, apiPath }) => {
    const { session_id } = useParams();
    const handleOptionClick = async (option) => {
        
        const newUserMessage = {
            id: messages.length + 1,
            content: option.prompt,
            date_time: new Date().toISOString(),
            isUser: true
        };
        setMessages([...messages, newUserMessage]);

        
        const loadingMessageId = messages.length + 2;
        const loadingMessage = {
            id: loadingMessageId,
            content: null,
            date_time: new Date().toISOString(),
            isUser: false,
            isLoading: true
        };
        setMessages(prevMessages => [...prevMessages, loadingMessage]);

        try {
            
            const msg_result = await apiPath.addMessage(session_id, option.prompt);
            
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.id === loadingMessageId 
                    ? { ...msg, content: msg_result.content || '收到您的訊息', isLoading: false, date_time: msg_result.created_at }
                    : msg
            ));
        } catch (error) {
            console.error('API 呼叫失敗:', error);
            
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.id === loadingMessageId 
                    ? { ...msg, content: '抱歉，發生錯誤，請稍後再試', isLoading: false, date_time: msg_result.created_at }
                    : msg
            ));
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                maxWidth: '600px',
            }}
        >
            <Typography variant="h6" sx={{ mb: 2, color: '#666', textAlign: 'center' }}>
                您好！我可以幫您什麼嗎？
            </Typography>
            {options.map((option, index) => (
                <Button
                    key={index}
                    variant="outlined"
                    onClick={() => handleOptionClick(option)}
                    sx={{
                        width: '100%',
                        py: 1.5,
                        borderColor: '#e0e0e0',
                        color: '#181818',
                        backgroundColor: '#fafafa',
                        '&:hover': {
                            borderColor: '#444',
                            backgroundColor: '#ffffff',
                        },
                    }}
                >
                    {option.content}
                </Button>
            ))}
        </Box>
    );
};

export default FunctionOptions; 