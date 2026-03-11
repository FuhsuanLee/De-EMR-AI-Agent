import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';

import apiService from '../service/api';

import DialogAddSession from './dialogAddSession';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const Sidebar = ({ open, onClose, onToggle }) => {
    const [history, setHistory] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchSessions = async () => {
        const sessions = await apiService.getSessions();
        setHistory(sessions);
    };


    useEffect(() => {
        if (open) {
            fetchSessions();
        }
    }, [open]);


    const handleCreateSession = async (sessionName) => {
        try {
            const newSession = await apiService.createSession(sessionName);
            
            const sessions = await apiService.getSessions();
            setHistory(sessions);
            
            if (newSession && newSession.id) {
                navigate(`/session/${newSession.id}`);
            }
            
            setDialogOpen(false);
        } catch (error) {
            console.error('創建對話失敗:', error);
            setDialogOpen(false);
        }
    };

    const drawerWidth = 280;

    return (
        <Drawer
            variant="persistent"
            anchor="left"
            open={open}
            sx={{
                width: open ? drawerWidth : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid #e0e0e0',
                    transition: 'width 0.3s ease',
                },
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    bgcolor: '#eeeeee',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0px 0px 10px rgba(24, 24, 24, 0.05) inset',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" color="#181818">
                        對話紀錄
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="收合側邊欄">
                            <IconButton size="small" onClick={onToggle}>
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* History List */}
                <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => setDialogOpen(true)}
                            sx={{
                                py: 0.5,
                                px: 1.5,
                                fontSize: '0.8rem',
                                borderRadius: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: '#D9D9D9',
                                    color: '#181818',
                                },
                                textDecoration: 'none',
                            }}
                        >
                            <ListItemText
                                primary="新增對話"
                            />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    {history.length > 0 && history.map((item) => {
                        const isSelected = location.pathname === `/session/${item.id}`;
                        return (
                            <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    component={Link}
                                    to={`/session/${item.id}`}
                                    selected={isSelected}
                                    sx={{
                                        py: 0.5,
                                        px: 1.5,
                                        fontSize: '0.8rem',
                                        borderRadius: 1,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#D9D9D9',
                                            color: '#181818',
                                        },
                                        '&.Mui-selected': {
                                            bgcolor: '#cccccc',
                                            color: '#181818',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                bgcolor: '#B0B0B0',
                                            },
                                        },
                                        textDecoration: 'none',
                                    }}
                                >
                                    <ListItemText
                                        primary={item.title}
                                    />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
            </Box>

            {/* 新增對話 Dialog */}
            <DialogAddSession
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onCreate={handleCreateSession}
            />
        </Drawer>
    );
};

export default Sidebar;