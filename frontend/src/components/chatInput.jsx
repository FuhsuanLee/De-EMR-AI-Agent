import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Paper,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import SendIcon from '@mui/icons-material/Send';

export default function ChatInput({ messages, setMessages, apiPath }) {
    const [inputValue, setInputValue] = useState('');
    const { session_id } = useParams();

    const handleInputChange = (event) => {
        const value = event.target.value;
        const lineCount = (value.match(/\n/g) || []).length + 1;
        if (lineCount <= 5) {
            setInputValue(value);
        }
    };

    const handleSend = async () => {
        
        if (!inputValue.trim()) {
            alert('請輸入訊息');
            return;
        }

        const newUserMessage = {
            id: messages.length + 1,
            content: inputValue,
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
            const msg_result = await apiPath.addMessage(session_id, inputValue);
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.id === loadingMessageId 
                    ? { ...msg, content: msg_result.content || '已收到您的訊息，系統正在處理中，請稍後再試', isLoading: false, date_time: msg_result.created_at }
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

        setInputValue('');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                width: '100%',
            }}
        >
            <Paper
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    width: '100%',
                    borderRadius: 3,
                    p: 2,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0px 0px 10px rgba(24, 24, 24, 0.05)',
                    gap: 1.5,
                }}
            >
                {/* 輸入欄 */}
                <TextareaAutosize
                    placeholder="我可以幫你什麼嗎？"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    minRows={1}
                    maxRows={5}
                    style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        fontSize: '1rem',
                        color: '#000000',
                        fontFamily: 'inherit',
                        backgroundColor: 'transparent',
                        padding: '8px',
                    }}
                />

                {/* 右側送出 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 1,
                        ml: 1,
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={handleSend}
                        disabled={inputValue.trim() === ''}
                        sx={{
                            p: 1.2,
                            backgroundColor: '#444',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#666' },
                        }}
                    >
                        <SendIcon fontSize="16px" />
                    </IconButton>
                </Box>
            </Paper>
        </Box>
    );
}
