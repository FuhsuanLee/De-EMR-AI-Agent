import React from 'react';
import { Paper, Typography } from '@mui/material';

const UserContent = ({ content }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                alignSelf: 'flex-end',
                maxWidth: '90%',
                gap: '1em',
                p: '0.75rem 1rem',
                ml: 'auto',
                boxShadow: '0px 0px 10px rgba(24, 24, 24, 0.05)',
            }}
        >
            <Typography
                sx={{
                    color: '#181818',
                    fontSize: '1rem',
                }}
            >
                {content}
            </Typography>
        </Paper>
    );
};

export default UserContent;
