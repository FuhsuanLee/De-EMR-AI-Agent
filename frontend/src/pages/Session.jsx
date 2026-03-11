import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';


import ReplayIcon from '@mui/icons-material/Replay';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';


import UserContent from '../components/userContent';
import RespContent from '../components/respContent';
import ChatInput from '../components/chatInput';
import FunctionOptions from '../components/functionOptions';
import Sidebar from '../components/sidebar';


import apiService from '../service/api';

function Session() {
    const { session_id } = useParams();
    const navigate = useNavigate();
    const options = [
        {
            content: '血紅素相關說明',
            prompt: '血紅素是甚麼'
        },
        {
            content: '血糖相關說明',
            prompt: '血糖是什麼'
        },
        {
            content: '肝臟相關說明',
            prompt: '肝臟疾病要看哪些指標'
        },
    ];

    const [messages, setMessages] = useState([]); 
    const [drawerOpen, setDrawerOpen] = useState(true); 
    const messagesEndRef = useRef(null); 

   
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };


    const fetchSession = async () => {
        const result = await apiService.getMessages(session_id);
        const cleanMessages = result.map((item) => ({
            id: item.turn_ordinal,
            content: item.content,
            date_time: item.created_at,
            isUser: item.role === 'user' ? true : false,
            isLoading: false,
        }));
        setMessages(cleanMessages);
    };


    const deleteSession = async () => {
        const result = await apiService.deleteSession(session_id);
        if (result) {
            navigate('/');
        }
        else {
            alert('刪除對話失敗');
        }
    };

    useEffect(() => {
        fetchSession();
    }, [session_id]);

    return (
        <Box sx={{ height: '100vh', display: 'flex', bgcolor: '#f5f5f5', overflow: 'hidden', width: '100vw' }}>
            {/* 側邊展開收合 */}
            <Sidebar
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)} 
                onToggle={toggleDrawer} 
            />

            {/* 主內容 */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'margin-left 0.3s ease',
                }}
            >
                {/* 標題與功能按鈕 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                        px: 3,
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                        {!drawerOpen && (
                            <Tooltip title="開啟側邊欄">
                                <IconButton
                                    aria-label="menu"
                                    size="small"
                                    onClick={toggleDrawer}
                                >
                                    <MenuIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Typography variant="h6" fontWeight="bold" color="#181818">
                            全新對話
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Tooltip title="刪除對話">
                            <IconButton
                                aria-label="reset"
                                size="small"
                                onClick={deleteSession}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="重新整理">
                            <IconButton
                                aria-label="reset"
                                size="small"
                                onClick={fetchSession}
                            >
                                <ReplayIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* 對話紀錄 */}
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    {/* 對話紀錄內容 */}
                    <Stack
                        sx={{
                            p: 2,
                            pt: 4,
                            mx: 1,
                            minHeight: 0,
                            height: '100%',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: '#C1C1C1',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent',
                            },
                        }}
                    >
                        <Container 
                            maxWidth="md"
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            {messages.length === 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                    }}
                                >
                                    <FunctionOptions options={options} messages={messages} setMessages={setMessages} apiPath={apiService} />
                                </Box>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        msg.id % 2 === 1 ? (
                                            <UserContent key={msg.id} content={msg.content} />
                                        ) : (
                                            <RespContent key={msg.id} content={msg.content} isLoading={msg.isLoading} date_time={msg.date_time} />
                                        )
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </Container>
                    </Stack>

                    {/* 輸入區 */}
                    <Container 
                        maxWidth="md"
                        sx={{
                            pb: 4,
                            pt: 2,
                            display: 'flex',
                            width: '100%',
                            flexShrink: 0,
                        }}
                    >
                        <ChatInput messages={messages} setMessages={setMessages} apiPath={apiService} />
                    </Container>
                </Stack>
            </Box>
        </Box>
    );
}

export default Session;
