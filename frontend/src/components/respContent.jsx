import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks'
import { CircleUserRound } from 'lucide-react';

const RespContent = ({ content, isLoading, date_time }) => {
    const time = new Date(date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return (
        <Paper
            elevation={0}
            sx={{
                display: 'grid',
                alignItems: 'center',
                backgroundColor: '#fafafa',
                alignSelf: 'flex-start',
                maxWidth: '90%',
                gap: '0.25rem',
                p: '0.75rem 1rem',
                mb: 2,
            }}
        >
            {isLoading ? (
                <Box sx={{ width: '20vw' }}>
                    <Skeleton animation="wave" height={10} width="50%" sx={{ height: 2, mt: 0.5 }} />
                    <Skeleton animation="wave" height={10} width="40%" sx={{ height: 2, mt: 0.5 }} />
                </Box>
            ) : (
                <Box sx={{ display: 'flex' }}>
                    <Box sx={{
                        width: '100%',
                        color: '#181818',
                        fontSize: '1rem',
                        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
                        '& ul, & ol': {
                            margin: '0.5em 0',
                            paddingLeft: '1.5em',
                            fontSize: '1rem',
                            fontFamily: 'inherit'
                        },
                        '& li': {
                            margin: '0.25em 0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            lineHeight: '1.5'
                        },
                        '& table': {
                            width: '50vw',
                            borderCollapse: 'collapse',
                            margin: '1em 0',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            display: 'table',
                            overflowX: 'auto'
                        },
                        '& th, & td': {
                            border: '1px solid #e0e0e0',
                            padding: '0.5em',
                            textAlign: 'left',
                            whiteSpace: 'nowrap'
                        },
                        '& th': {
                            backgroundColor: '#f5f5f5',
                            fontWeight: 'bold'
                        },
                        '& tr:nth-of-type(even)': {
                            backgroundColor: '#fafafa'
                        }
                    }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
                    </Box>
                </Box>
            )}
            <Typography
                sx={{
                    alignSelf: 'flex-end',
                    fontSize: '0.8rem',
                    color: '#666666',
                }}
            >
                {time}
            </Typography>
        </Paper>
    );
};

export default RespContent;
