'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Modal,
  ModalClose,
  Input,
  Typography,
  Sheet
} from '@mui/joy';
import { TextField } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function AddSongModal({
  isOpen,
  handleOpen,
  song,
  setlist,
  setSetlist,
  title,
}) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [segue, setSegue] = useState(false);
  const [transition, setTransition] = useState(false);
  const [addNoteField, setAddNoteField] = useState(false);
  const [note, setNote] = useState('');

  const resetForm = () => {
    setMinutes(0);
    setSeconds(0);
    setSegue(false);
    setTransition(false);
    setAddNoteField(false);
    setNote('');
  };

  const addSongToSetlist = () => {
    setSetlist({
      ...setlist,
      [title]: [...setlist[title], {
        song_name: song,
        minutes,
        seconds,
        segue,
        transition,
        ...(note.trim() ? { note: note.trim() } : {}),
      }],
    });
    resetForm();
    handleOpen(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => handleOpen(false)}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="outlined"
        sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          textColor="inherit"
          sx={{ fontWeight: 'lg', mb: 1 }}
        >
          Add {song} to {title}
        </Typography>
        <FormControl sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <FormLabel>Minutes</FormLabel>
              <Input
                size="sm"
                type="number"
                placeholder="Min"
                sx={{ width: 60 }}
                onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 0)}
                label="Minutes"
                value={minutes}
              />
            </Box>
            <Box>
              <FormLabel>Seconds</FormLabel>
              <Input
                size="sm"
                type="number"
                placeholder="Sec"
                sx={{ width: 60 }}
                onChange={(e) => setSeconds(parseInt(e.target.value, 10) || 0)}
                value={seconds}
              />
            </Box>
            <Checkbox
              label="Segue"
              value="segue"
              onChange={(e) => {
                const { checked } = e.target;
                if (checked) setTransition(false);
                setSegue(checked);
              }}
              checked={segue}
            />
            <Checkbox
              label="Transition"
              value="transition"
              onChange={(e) => {
                const { checked } = e.target;
                if (checked) setSegue(false);
                setTransition(checked);
              }}
              checked={transition}
            />
          </Box>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <AddCircleOutlineIcon
            onClick={() => setAddNoteField(true)}
            sx={{ cursor: 'pointer' }}
          />
          <Typography>Add Note</Typography>
        </Box>
        {addNoteField ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="Notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Box>
        ) : null}
        <Button sx={{ mt: 2 }} onClick={addSongToSetlist}>
          Add Song
        </Button>
      </Sheet>
    </Modal>
  );
}
