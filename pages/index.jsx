// pages/index.js (New Homepage)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import {
    Container, Typography, Box, List, ListItem, ListItemText, Paper,
    CircularProgress, Link as MuiLink, Divider, Button, Alert,
    TextField, IconButton, Grid, Accordion, AccordionSummary, AccordionDetails, useTheme, alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '@/context/AuthContext';
import StoryPreview from '@/components/StoryPreview'; // For public stories
import CookieConsent from 'react-cookie-consent';

// getStaticProps to fetch public stories (similar to your old pages/index.jsx)
export async function getStaticProps() {
    let publicStories = [];
    let storiesError = null;
    const storiesApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/experiments/campfire/public/list`;

    try {
        const storiesResponse = await fetch(storiesApiUrl, { headers: { Accept: 'application/json' } });
        if (!storiesResponse.ok) {
            storiesError = `Failed to load public stories. Status: ${storiesResponse.status}`;
        } else {
            const storiesData = await storiesResponse.json();
            publicStories = storiesData || [];
        }
    } catch (e) {
        storiesError = 'Failed to load public stories due to a network or fetch error.';
    }
    // Removed blog post fetching
    return { props: { publicStories, storiesError } };
}

export default function KiStorygenHomePage({ publicStories, storiesError }) {
    const router = useRouter();
    const theme = useTheme();
    const { isAuthenticated, isLoading: isAuthLoading, token, handleUnauthorized, user } = useAuth();
    const [myStories, setMyStories] = useState([]);
    const [isLoadingMyStories, setIsLoadingMyStories] = useState(false);
    const [myStoriesError, setMyStoriesError] = useState('');
    const [newStoryTitleInput, setNewStoryTitleInput] = useState('');
    const [isPublicStoriesExpanded, setIsPublicStoriesExpanded] = useState(false);
    const publicStoriesAccordionRef = useRef(null);

    const fetchMyStories = useCallback(async () => {
        if (isAuthenticated && token) {
            setIsLoadingMyStories(true);
            setMyStoriesError('');
            try {
                // This API endpoint is relative and should be handled by next.config.mjs rewrites
                const response = await fetch('/api/experiments/campfire/list', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                });
                if (!response.ok) { /* ... error handling ... */
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || `Failed to fetch your stories: ${response.status}`);
                }
                const data = await response.json();
                setMyStories(data.titles || []);
            } catch (err) { /* ... error handling ... */
                console.error("Error fetching your stories:", err);
                setMyStoriesError(err.message || "Could not load your stories.");
            } finally {
                setIsLoadingMyStories(false);
            }
        } else {
            setMyStories([]); // Clear stories if not authenticated
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        fetchMyStories();
    }, [fetchMyStories]);

    const handleDeleteStory = async (storyTitleToDelete) => {
        if (!token) { /* ... */ return; }
        if (!confirm(`Are you sure you want to delete the story: "${storyTitleToDelete}"?`)) return;
        setIsLoadingMyStories(true); setMyStoriesError('');
        try {
            const response = await fetch(`/api/experiments/campfire?title=${encodeURIComponent(storyTitleToDelete)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            });
            if (response.status === 401 || response.status === 403) { /* ... handleUnauthorized ... */ }
            if (!response.ok) { /* ... error handling ... */ }
            setMyStories(prev => prev.filter(title => title !== storyTitleToDelete));
        } catch (err) { /* ... error handling ... */ }
        finally { setIsLoadingMyStories(false); }
    };

    const newStoryLink = newStoryTitleInput.trim()
        ? `/experiments/campfire-storytelling?title=${encodeURIComponent(newStoryTitleInput.trim())}`
        : "/experiments/campfire-storytelling";

    const handlePublicAccordionChange = (event, isExpanded) => setIsPublicStoriesExpanded(isExpanded);
    useEffect(() => {
        if (isPublicStoriesExpanded && publicStoriesAccordionRef.current) {
            setTimeout(() => {
                publicStoriesAccordionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isPublicStoriesExpanded]);


    if (isAuthLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
    }

    return (
        <>
            <Head>
                <title>Ki Storygen - AI Storytelling Adventure</title>
                <meta name="description" content="Create, manage, and explore interactive AI-powered stories with Ki Storygen." />
            </Head>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                {!isAuthenticated && (<Paper elevation={4} sx={{ mb: 4 }}>
                    <Box sx={{ p: { xs: 2, sm: 3 }, backgroundColor: alpha(theme.palette.secondary.main, 0.08), border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`, borderRadius: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                            <Box component="img" src="/ki-storygen-logo.png" alt="Ki Storygen Logo" sx={{ height: 42, width: 42, mr: 1.5, borderRadius: '50%', objectFit: 'contain' }} />
                            <Typography variant="h5" component="h1" color="secondary.dark" sx={{fontWeight: 'medium'}}>Ki Storygen</Typography>
                        </Box>
                        <Typography variant="h6" gutterBottom component="p">Welcome to Ki Storygen!</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
                            Collaboratively craft unique tales in a natural back and forth conversation. Guide the narrative, make choices, and see what happens next.
                        </Typography>
                        <NextLink href="/experiments/campfire-storytelling" passHref legacyBehavior>
                            <Button variant="contained" color="secondary" size="large" sx={{ mb: 2.5, px: {xs: 3, sm:5}, py: {xs:1, sm:1.5} }}>
                                Start Your First Story
                            </Button>
                        </NextLink>

                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                <NextLink href="/signup" passHref legacyBehavior><MuiLink sx={{fontWeight:'bold', color: theme.palette.primary.main, cursor: 'pointer'}}>Sign up</MuiLink></NextLink> to save your stories and get 50 story turns with illustrations per day!
                            </Typography>
                    </Box>
                </Paper>)}

                {/* Authenticated User Section: Your Stories & Create New */}
                {isAuthenticated && (
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom>Your Stories</Typography>
                        {isLoadingMyStories && <CircularProgress size={24} />}
                        {myStoriesError && <Alert severity="error">{myStoriesError}</Alert>}
                        {!isLoadingMyStories && !myStoriesError && (
                            <List dense>
                                {myStories.length > 0 ? myStories.map((title, index) => (
                                    <React.Fragment key={`my-story-<span class="math-inline">\{title\}\-</span>{index}`}>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete story" onClick={() => handleDeleteStory(title)} disabled={isLoadingMyStories}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <NextLink href={`/experiments/campfire-storytelling?title=${encodeURIComponent(title)}`} passHref legacyBehavior>
                                                <MuiLink component="a" sx={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', p: 1.5, pr: 5, '&:hover': { backgroundColor: 'action.hover', borderRadius: 1 } }}>
                                                    <ListItemText primary={title} primaryTypographyProps={{variant: 'subtitle1'}} />
                                                </MuiLink>
                                            </NextLink>
                                        </ListItem>
                                        {index < myStories.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                )) : <Typography sx={{ fontStyle: 'italic', ml: 2, my: 2 }}>No past stories found. Start a new one below!</Typography>}
                            </List>
                        )}
                        <Divider sx={{my: 2}}/>
                        <Typography variant="h6" component="h3" sx={{ mb: 1.5, fontSize:'1.1rem' }}>
                            Create New Story:
                        </Typography>
                        <TextField fullWidth label="Enter a title for your new story (optional)" variant="outlined" value={newStoryTitleInput} onChange={(e)=> setNewStoryTitleInput(e.target.value)} size="small" sx={{ mb: 1.5 }} disabled={isLoadingMyStories} />
                        <NextLink href={newStoryLink} passHref legacyBehavior>
                            <Button variant="contained" color="primary" component="a" fullWidth sx={{ textTransform: 'none', p: 1.25, fontSize: '1rem' }} disabled={isLoadingMyStories}>
                                {newStoryTitleInput.trim() ? `Start Story: "${newStoryTitleInput.trim()}"` : "Start a New Untitled Story"}
                            </Button>
                        </NextLink>
                    </Paper>
                )}

                {/* Public Stories Section (from old pages/index.jsx) */}
                <Accordion expanded={isPublicStoriesExpanded} onChange={handlePublicAccordionChange} sx={{ mb: 2, backgroundColor: alpha(theme.palette.info.light, 0.08) }} ref={publicStoriesAccordionRef}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="public-stories-content" id="public-stories-header" sx={{ minHeight: 'auto', '& .MuiAccordionSummary-content': { my: 1 } }}>
                        <Typography variant="h5" component="h2" align="center" sx={{ fontWeight: 'medium', width: '100%' }}>
                            Explore Shared Stories
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: {xs: 1, sm: 2, md: 3}, pt: 2 }}>
                        {storiesError && <Alert severity="error" sx={{ my: 2 }}>{storiesError}</Alert>}
                        {!storiesError && (
                            <Grid container spacing={3}>
                                {publicStories.length > 0 ? publicStories.map((story) => (
                                    <Grid item key={story.storyId} xs={12} sm={6} md={4}>
                                        <StoryPreview story={story} />
                                    </Grid>
                                )) : <Grid item xs={12}><Typography align="center" sx={{py: 2, color: 'text.secondary'}}>No public stories available yet.</Typography></Grid>}
                            </Grid>
                        )}
                    </AccordionDetails>
                </Accordion>
                <CookieConsent
                    location="bottom"
                    buttonText="I Accept"
                    cookieName="ki-storygen.com-cookie-consent"
                    style={{ background: '#2B373B', zIndex: 1500 }}
                    buttonStyle={{ color: '#FFFFFF', background: theme.palette.primary.main, fontSize: '13px', borderRadius: '4px' }}
                    expires={150}
                    ariaAcceptLabel="Accept cookies"
                >
                    This website uses cookies to enhance user experience and analyze site traffic. By clicking &quot;I Accept&quot;, you consent to our use of cookies.
                </CookieConsent>
            </Container>
        </>
    );
}