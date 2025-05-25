// src/components/PublicStoryDisplayView.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Grid, Typography, Paper, IconButton, useTheme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { StoryImageDisplay } from './CampfireComponents';
import { DEFAULT_IMAGE_URL, DEFAULT_TURN_TEXT } from '@/utils/campfireUtils';

function PublicStoryDisplayView({ story }) {
    const theme = useTheme();
    const [storytellerTurns, setStorytellerTurns] = useState([]);
    const [currentStorytellerTurnIndex, setCurrentStorytellerTurnIndex] = useState(0);
    const [displayedImage, setDisplayedImage] = useState(DEFAULT_IMAGE_URL);
    const [displayedStoryText, setDisplayedStoryText] = useState(DEFAULT_TURN_TEXT);

    useEffect(() => {
        if (story && story.chatTurns) {
            const turns = story.chatTurns.filter(turn => turn.sender === 'Storyteller');
            setStorytellerTurns(turns);
            if (turns.length > 0) {
                setCurrentStorytellerTurnIndex(0);
            }
        }
    }, [story]);

    const updateDisplayedTurn = useCallback((index) => {
        if (storytellerTurns.length > 0 && index >= 0 && index < storytellerTurns.length) {
            const turn = storytellerTurns[index] || {};
            setDisplayedStoryText(turn.text || DEFAULT_TURN_TEXT);
            setDisplayedImage(turn.imageUrl || DEFAULT_IMAGE_URL);
        } else {
            setDisplayedStoryText(storytellerTurns.length > 0 ? DEFAULT_TURN_TEXT : "No story content available.");
            setDisplayedImage(DEFAULT_IMAGE_URL);
        }
    }, [storytellerTurns]);

    useEffect(() => {
        updateDisplayedTurn(currentStorytellerTurnIndex);
    }, [currentStorytellerTurnIndex, updateDisplayedTurn]);

    const handlePrevTurn = () => {
        setCurrentStorytellerTurnIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextTurn = () => {
        setCurrentStorytellerTurnIndex(prev => Math.min(storytellerTurns.length - 1, prev + 1));
    };

    if (!story) {
        return <Typography>Story not found.</Typography>;
    }

    return (
        <Paper elevation={2} sx={{
            p: { xs: 1, sm: 2 },
            bgcolor: theme.palette.background.default,
            maxHeight: '100%',
            overflowY: 'auto',
        }}>
            {/* Title Section */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pb: 1.5,
                mb: 2,
                flexShrink: 0,
                minHeight: '56px',
                borderBottom: `1px solid ${theme.palette.divider}`,
            }}>
                <Box
                    component="img"
                    src="/ki-storygen-logo.png"
                    alt="Ki Storygen"
                    sx={{ height: { xs: 32, sm: 40 }, width: { xs: 32, sm: 40 }, mr: 1.5, borderRadius: '50%', objectFit: 'contain' }}
                />
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        flexGrow: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                >
                    {story.storyTitle || "Untitled Story"}
                </Typography>
            </Box>

            {storytellerTurns.length === 0 && (
                <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                    This story has no content to display yet.
                </Typography>
            )}

            {storytellerTurns.length > 0 && (
                <Grid container spacing={{ xs: 1, sm: 2 }}> {/* Main container for content row and controls row */}
                    {/* Row 1: Content (Image and Text) */}
                    <Grid item xs={12}>
                        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'stretch' }}>
                            {/* Image Column */}
                            <Grid item size={{ xs:12, md:7 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center', // Center image vertically
                                        alignItems: 'center', // Center image horizontally
                                        overflow: 'hidden',
                                        p: 1,
                                        bgcolor: theme.palette.background.paper,
                                        minHeight: { xs: 250, sm: 350, md: 400 } // Ensure a minimum height for the image area
                                    }}
                                >
                                    <StoryImageDisplay src={displayedImage} alt={`Scene for ${story.storyTitle}`} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                </Paper>
                            </Grid>

                            {/* Text Column */}
                            <Grid item size={{ xs:12, md: 5}} sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Paper
                                    component="article"
                                    elevation={1}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflowY: 'auto',
                                        pt: { xs: 1.5, md: 1.5 },
                                        pb: { xs: 1.5, md: 2 },
                                        px: { xs: 1.5, md: 2 },
                                        bgcolor: theme.palette.background.paper,
                                        color: theme.palette.text.primary,
                                        minHeight: { xs: 200, sm: 350, md: 400 } // Match min height for text area
                                    }}
                                >
                                    <Box sx={{ flexGrow: 1 }}>
                                        {displayedStoryText.split('\n\n').map((paragraph, index, arr) => (
                                            <Typography component="p" key={`${index}-p-${story.storyId || 's'}`} sx={{
                                                mb: index === arr.length - 1 ? 0 : '1em',
                                                fontSize: 'inherit',
                                                lineHeight: 'inherit'
                                            }}>
                                                {paragraph.split('\n').map((line, lineIdx, lineArr) => (
                                                    <React.Fragment key={lineIdx}>
                                                        {line}
                                                        {lineIdx < lineArr.length - 1 && <br />}
                                                    </React.Fragment>
                                                ))}
                                            </Typography>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                        {/* Row 2: Navigation Controls */}
                        <Grid item size={{ xs:12 }} sx={{ mt: 1 }}> {/* Add some margin top for separation */}
                            <Paper elevation={1} sx={{ bgcolor: theme.palette.background.paper, p: 0.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                    <IconButton onClick={handlePrevTurn} disabled={currentStorytellerTurnIndex === 0} color="primary">
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary">
                                        Page {currentStorytellerTurnIndex + 1} of {storytellerTurns.length}
                                    </Typography>
                                    <IconButton onClick={handleNextTurn} disabled={currentStorytellerTurnIndex >= storytellerTurns.length - 1} color="primary">
                                        <ArrowForwardIcon />
                                    </IconButton>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
}

export default PublicStoryDisplayView;