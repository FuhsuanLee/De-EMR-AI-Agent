import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';

const DialogAddSession = ({ open, onClose, onCreate }) => {
    const [sessionName, setSessionName] = useState('');

    useEffect(() => {
        if (open) {
            setSessionName('');
        }
    }, [open]);

    const handleClose = () => {
        setSessionName('');
        onClose();
    };

    const handleCreate = () => {
        if (sessionName.trim()) {
            onCreate(sessionName.trim());
            setSessionName('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && sessionName.trim()) {
            handleCreate();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>新增對話</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="對話名稱"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>取消</Button>
                <Button 
                    onClick={handleCreate} 
                    variant="contained"
                    disabled={!sessionName.trim()}
                >
                    建立
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogAddSession;

