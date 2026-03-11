import React, { useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Stack,
    Button
} from '@mui/material';
import Sidebar from '../components/sidebar';

function Home() {
    const [drawerOpen, setDrawerOpen] = useState(true); 


    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

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

                {/* 對話紀錄 */}
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color="#181818">
                                歡迎使用
                            </Typography>
                            <Button variant="contained" size="small" onClick={toggleDrawer} color="" disabled={drawerOpen}>開啟側邊欄</Button>
                            <Typography variant="h6" fontWeight="bold" color="#181818">
                                查看紀錄 或 新增對話
                            </Typography>
                        </Box>
                    </Container>
                </Stack>
            </Box>
        </Box>
    );
}

export default Home;
