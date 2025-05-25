// pages/experiments/campfire-storytelling.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    Snackbar,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import {
    DEFAULT_PROMPT_FOR_USER,
    WAITING_FOR_TALE_TEXT,
    START_NEW_STORY_PROMPT_INPUT,
    processChatTurns,
    getStorytellerTurns,
    getChatInputPrompt,
    prepareSubmitPayload,
    DEFAULT_IMAGE_URL,
    DEFAULT_TURN_TEXT
} from '@/utils/campfireUtils';
import { ChatView, StoryDisplayView } from '@/components/CampfireComponents';

export default function CampfireStorytellingPage() {
    const router = useRouter();
    const theme = useTheme();
    const { isAuthenticated, isLoading: isAuthLoading, user, token, handleUnauthorized } = useAuth();

    const { title: titleQueryParam } = router.query;

    const [currentView, setCurrentView] = useState('storyDisplay');
    const [animatingOut, setAnimatingOut] = useState(false);

    const defaultPageTitle = titleQueryParam || "New Ki Story";
    const [currentStoryId, setCurrentStoryId] = useState(null); // Keep for other operations if needed, but make_public uses title
    const [storyTitle, setStoryTitle] = useState(defaultPageTitle);
    const [editableStoryTitle, setEditableStoryTitle] = useState(defaultPageTitle);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isStoryPublic, setIsStoryPublic] = useState(false);

    const [displayedStoryText, setDisplayedStoryText] = useState(WAITING_FOR_TALE_TEXT);
    const [displayedImage, setDisplayedImage] = useState(DEFAULT_IMAGE_URL);
    const [promptForNextTurnButton, setPromptForNextTurnButton] = useState(DEFAULT_PROMPT_FOR_USER);

    const [userInput, setUserInput] = useState('');
    const [allChatTurns, setAllChatTurns] = useState([]);
    const [storytellerTurns, setStorytellerTurns] = useState([]);
    const [currentStorytellerTurnIndex, setCurrentStorytellerTurnIndex] = useState(0);
    const [promptForChatInput, setPromptForChatInput] = useState(START_NEW_STORY_PROMPT_INPUT);

    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [isMakePublicDialogOpen, setIsMakePublicDialogOpen] = useState(false);
    const [isMakingPublic, setIsMakingPublic] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');


    const chatInputRef = useRef(null);
    const chatHistoryRef = useRef(null);
    const storyTextRef = useRef(null);
    const titleEditInputRef = useRef(null);

    const BASE_API_ENDPOINT = '/api/experiments/campfire';
    const headerHeight = typeof theme.mixins?.toolbar?.minHeight === 'number' ? theme.mixins.toolbar.minHeight : 64;
    const footerHeight = 57;

    useEffect(() => {
        if (router.isReady) {
            const newTitle = titleQueryParam || "New Ki Story";
            setStoryTitle(newTitle);
            setEditableStoryTitle(newTitle);
            if (!titleQueryParam) {
                setCurrentStoryId(null); // Still useful to clear ID for new stories
                setIsStoryPublic(false);
            }
        }
    }, [titleQueryParam, router.isReady]);

    const updateDisplayedStorytellerTurn = useCallback((index, currentStorytellerTurns) => {
        if (currentStorytellerTurns?.length > 0 && index >= 0 && index < currentStorytellerTurns.length) {
            const turn = currentStorytellerTurns[index] || {};
            setDisplayedStoryText(turn.text || DEFAULT_TURN_TEXT);
            setDisplayedImage(turn.imageUrl || DEFAULT_IMAGE_URL);
            setPromptForNextTurnButton(turn.promptForUser || DEFAULT_PROMPT_FOR_USER);
        } else {
            setDisplayedStoryText(WAITING_FOR_TALE_TEXT);
            setDisplayedImage(DEFAULT_IMAGE_URL);
            setPromptForNextTurnButton(DEFAULT_PROMPT_FOR_USER);
            if (!titleQueryParam) {
                setPromptForChatInput(START_NEW_STORY_PROMPT_INPUT);
            }
        }
    }, [titleQueryParam]);

    const fetchInitialData = useCallback(async (currentStoryTitleFromQuery) => {
        if (!token || !isAuthenticated) {
            setIsLoadingPage(false);
            return;
        }
        setIsLoadingPage(true);
        setError('');
        setCurrentStoryId(null);
        setIsStoryPublic(false);

        let endpoint = BASE_API_ENDPOINT;
        if (currentStoryTitleFromQuery) {
            endpoint = `${BASE_API_ENDPOINT}?title=${encodeURIComponent(currentStoryTitleFromQuery)}`;
        }

        try {
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            });

            if (response.status === 401 || response.status === 403) {
                handleUnauthorized();
                router.push(`/login?from=${encodeURIComponent(router.asPath)}&sessionExpired=true`);
                throw new Error("Unauthorized access to story data.");
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || `Error fetching story: ${response.statusText}`);
            }

            const data = await response.json() || {};
            setCurrentStoryId(data.id || null); // Keep ID if available, for other potential uses
            setIsStoryPublic(data.share_publicly || false);
            const processedTurns = processChatTurns(data.chatTurns);
            setAllChatTurns(processedTurns);
            const currentStorytellerTurns = getStorytellerTurns(processedTurns);
            setStorytellerTurns(currentStorytellerTurns);
            const effectiveTitle = data.storyTitle || currentStoryTitleFromQuery || "New Ki Story"; // Ensure title is set
            setStoryTitle(effectiveTitle);
            setEditableStoryTitle(effectiveTitle);

            if (currentStorytellerTurns.length > 0) {
                setCurrentStorytellerTurnIndex(currentStorytellerTurns.length - 1);
            } else {
                updateDisplayedStorytellerTurn(0, []);
            }
            const isNewStorySession = !currentStoryTitleFromQuery && !data.id;
            setPromptForChatInput(getChatInputPrompt(processedTurns, isNewStorySession));

            if (currentStoryTitleFromQuery || (data.id && currentStorytellerTurns.length > 0) || (data.hasActiveSessionToday && currentStorytellerTurns.length > 0) ) {
                setCurrentView('storyDisplay');
            } else {
                setCurrentView('chatInput');
                setTimeout(() => chatInputRef.current?.focus(), 0);
            }
        } catch (err) {
            console.error("Failed to fetch initial story data:", err);
            if (err.message !== "Unauthorized access to story data.") {
                setError(err.message || "Could not load the story.");
            }
            updateDisplayedStorytellerTurn(0, []);
            setPromptForChatInput(START_NEW_STORY_PROMPT_INPUT);
        } finally {
            setIsLoadingPage(false);
        }
    }, [token, isAuthenticated, updateDisplayedStorytellerTurn, router, handleUnauthorized]);

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            const fromPath = titleQueryParam ? `/experiments/campfire-storytelling?title=${titleQueryParam}` : '/experiments/campfire-storytelling';
            router.push(`/login?from=${encodeURIComponent(fromPath)}`);
        } else if (isAuthenticated && token && router.isReady) {
            fetchInitialData(titleQueryParam || storyTitle); // Ensure a title is passed if titleQueryParam is null for new stories
        } else if (!isAuthLoading && !token) {
            setIsLoadingPage(false);
        }
    }, [isAuthenticated, isAuthLoading, router, titleQueryParam, token, fetchInitialData, storyTitle]);


    useEffect(() => {
        updateDisplayedStorytellerTurn(currentStorytellerTurnIndex, storytellerTurns);
    }, [currentStorytellerTurnIndex, storytellerTurns, updateDisplayedStorytellerTurn]);

    useEffect(() => {
        if (chatHistoryRef.current && currentView === 'chatInput') {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [allChatTurns, currentView]);

    useEffect(() => {
        if (storyTextRef.current && currentView === 'storyDisplay') {
            storyTextRef.current.scrollTop = storyTextRef.current.scrollHeight;
        }
    }, [displayedStoryText, currentView]);

    const handleInputChange = (event) => setUserInput(event.target.value);

    const handleTransitionToChat = () => {
        setAnimatingOut(true);
        const currentStorytellerTurn = storytellerTurns[currentStorytellerTurnIndex];
        const nextPrompt = currentStorytellerTurn?.promptForUser ||
            [...allChatTurns].reverse().find(t => t.sender === "Storyteller" && t.promptForUser)?.promptForUser ||
            DEFAULT_PROMPT_FOR_USER;
        setPromptForChatInput(nextPrompt);
        setTimeout(() => {
            setCurrentView('chatInput');
            setAnimatingOut(false);
            setTimeout(() => chatInputRef.current?.focus(), 0);
        }, 300);
    };

    const handleTransitionToStoryDisplay = () => {
        if (storytellerTurns.length > 0) {
            setAnimatingOut(true);
            if (!titleQueryParam && currentStoryId) {
                setCurrentStorytellerTurnIndex(storytellerTurns.length - 1);
            }
            setTimeout(() => {
                setCurrentView('storyDisplay');
                setAnimatingOut(false);
            }, 300);
        } else {
            setError("There are no story parts to display yet.");
        }
    };

    const handleTitleEditStart = () => {
        if (isStoryPublic) return; // Prevent editing if story is public
        setEditableStoryTitle(storyTitle);
        setIsEditingTitle(true);
        setTimeout(() => titleEditInputRef.current?.focus(), 0);
    };

    const handleTitleEditSave = () => {
        const trimmedTitle = editableStoryTitle.trim();
        if (trimmedTitle) {
            setStoryTitle(trimmedTitle);
            // If the story ID exists, it means it's an existing story.
            // If there's no titleQueryParam, it's the "live" session story.
            // We should update the title for the "live" session.
            // If titleQueryParam exists, we are viewing a past story, and title edits might not be persisted
            // or might require a different API call if you want to allow renaming past stories.
            // For now, this primarily affects the current session's title if it's not a specifically loaded past story.
            if (currentStoryId && !titleQueryParam) {
                console.log("Live session story title changed to:", trimmedTitle, "for story ID:", currentStoryId);
                // Potentially call an API to update the title on the backend here if currentStoryId exists
                // For example: updateStoryTitleOnBackend(currentStoryId, trimmedTitle);
            } else if (!currentStoryId && !titleQueryParam) {
                console.log("New story title set to:", trimmedTitle);
            }
        }
        setIsEditingTitle(false);
    };
    const handleTitleEditCancel = () => {
        setIsEditingTitle(false);
        setEditableStoryTitle(storyTitle); // Revert to the current storyTitle
    };

    const handleSubmitTurn = async (event) => {
        event.preventDefault();
        if (!userInput.trim() || !token) {
            setError(!token ? "You must be logged in to continue the story." : "Input cannot be empty.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        // Use the current storyTitle for the payload, which might have been edited
        const payload = prepareSubmitPayload({ userInput, allChatTurns, storyTitle: storyTitle, currentStoryId });

        try {
            const response = await fetch(BASE_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.status === 401 || response.status === 403) {
                handleUnauthorized();
                router.push('/login?sessionExpired=true');
                throw new Error('Authorization failed.');
            }
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData?.detail || `Error submitting turn: ${response.status}`);
            }

            const data = await response.json() || {};
            if (data.id && !currentStoryId) setCurrentStoryId(data.id);

            // The backend should ideally return the definitive title, especially if it sanitized/modified it
            if (data.storyTitle) {
                setStoryTitle(data.storyTitle);
                setEditableStoryTitle(data.storyTitle); // Sync editable title
            }
            // If the API confirms the story's public status after submission (e.g., new story is not public)
            if (typeof data.share_publicly === 'boolean') {
                setIsStoryPublic(data.share_publicly);
            }


            const updatedProcessedAllTurns = processChatTurns(data.chatTurns);
            setAllChatTurns(updatedProcessedAllTurns);
            const updatedStorytellerTurns = getStorytellerTurns(updatedProcessedAllTurns);
            setStorytellerTurns(updatedStorytellerTurns);

            // If we were viewing by title query param, but now we've submitted a turn to this story,
            // it might imply we've "taken over" this story session or started a new one based on it.
            // Clear titleQueryParam by re-routing if the story ID from response matches and title also matches,
            // or if backend indicates a new session based on this. For simplicity, if titleQueryParam was present
            // and now we have a story ID and title from response, we might want to clear the query param.
            if (titleQueryParam && data.id && data.storyTitle && router.query.title) {
                // If a new turn is added to a story initially loaded by title,
                // we might want to remove the 'title' query param to reflect it's now an active session.
                // This depends on desired UX. For now, if title matches, remove query param.
                if (decodeURIComponent(titleQueryParam) === data.storyTitle) {
                    const newQuery = { ...router.query };
                    delete newQuery.title;
                    router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
                }
            }


            if (updatedStorytellerTurns.length > 0) {
                setCurrentStorytellerTurnIndex(updatedStorytellerTurns.length - 1);
            }
            setPromptForChatInput(getChatInputPrompt(updatedProcessedAllTurns, false));
            setAnimatingOut(true);
            setTimeout(() => {
                setUserInput('');
                setCurrentView('storyDisplay');
                setAnimatingOut(false);
            }, 300);
        } catch (err) {
            console.error("Failed to submit story turn:", err);
            if(err.message !== 'Authorization failed.') setError(err.message || "Could not submit your turn.");
        } finally {
            if (currentView !== 'storyDisplay') setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (currentView === 'storyDisplay' && !animatingOut && isSubmitting) {
            setIsSubmitting(false);
        }
    }, [currentView, animatingOut, isSubmitting]);

    const handlePrevTurn = () => setCurrentStorytellerTurnIndex(prev => Math.max(0, prev - 1));
    const handleNextTurn = () => setCurrentStorytellerTurnIndex(prev => Math.min(storytellerTurns.length - 1, prev + 1));

    const handleOpenMakePublicDialog = () => {
        if (!storyTitle || storyTitle.trim() === "New Ki Story" || storyTitle.trim() === "") { // Check for a meaningful title
            setToastMessage("Please set a valid story title before making it public.");
            setToastSeverity("warning");
            setToastOpen(true);
            return;
        }
        setIsMakePublicDialogOpen(true);
    };

    const handleCloseMakePublicDialog = () => {
        setIsMakePublicDialogOpen(false);
    };

    const handleConfirmMakePublic = async () => {
        if (!storyTitle || storyTitle.trim() === "" || !token) { // Use storyTitle
            setError("Missing story title or authentication token.");
            setToastMessage("Missing story title or authentication token.");
            setToastSeverity("error");
            setToastOpen(true);
            setIsMakePublicDialogOpen(false);
            return;
        }
        setIsMakingPublic(true);
        setError('');

        try {
            const response = await fetch(`${BASE_API_ENDPOINT}/make_public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ title: storyTitle }), // Send title instead of id
            });

            if (response.status === 401 || response.status === 403) {
                handleUnauthorized();
                setToastMessage("Authorization failed. Please log in again.");
                setToastSeverity("error");
                router.push('/login?sessionExpired=true');
                throw new Error("Auth failed for make public.");
            }

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.detail || `Failed to make story public: ${response.status}`);
            }

            setIsStoryPublic(true);
            setToastMessage(responseData.message || "Story successfully made public!");
            setToastSeverity("success");
        } catch (err) {
            console.error("Failed to make story public:", err);
            if (err.message !== "Auth failed for make public.") {
                setToastMessage(err.message || "Could not make the story public.");
                setToastSeverity("error");
            }
        } finally {
            setIsMakingPublic(false);
            setIsMakePublicDialogOpen(false);
            setToastOpen(true);
        }
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setToastOpen(false);
    };


    const pageContainerHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;

    if (isAuthLoading || isLoadingPage) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: pageContainerHeight, bgcolor: theme.palette.background.default }}>
                <CircularProgress color="primary"/>
                <Typography sx={{ml: 2, color: theme.palette.text.secondary }}>Loading Ki Storygen...</Typography>
            </Box>
        );
    }
    if (!isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: pageContainerHeight, bgcolor: theme.palette.background.default }}>
                <Typography sx={{ml: 2, color: theme.palette.text.secondary }}>Please log in to join the story.</Typography>
            </Box>
        );
    }

    const pageStyles = {
        display: 'flex',
        flexDirection: 'column',
        height: pageContainerHeight,
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        px: { xs: 1, sm: 2 },
        overflow: 'hidden',
        position: 'relative'
    };

    return (
        <>
            <Head>
                <title>{storyTitle || "Ki Storygen"} - Musings</title>
                <meta name="description" content="Interactive AI storytelling with Ki Storygen on Musings." />
                <meta name="robots" content="noindex" />
            </Head>
            <Box sx={pageStyles}>
                {error && (
                    <Alert
                        severity="error"
                        sx={{position: 'absolute', top: theme.spacing(1), left: theme.spacing(1), right: theme.spacing(1), zIndex: 1000, boxShadow: 3}}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {currentView === 'chatInput' && (
                    <ChatView
                        inProp={currentView === 'chatInput' && !animatingOut}
                        promptForChatInput={promptForChatInput}
                        allChatTurns={allChatTurns}
                        userInput={userInput}
                        handleInputChange={handleInputChange}
                        handleSubmitTurn={handleSubmitTurn}
                        handleTransitionToStoryDisplay={handleTransitionToStoryDisplay}
                        isSubmitting={isSubmitting}
                        chatInputRef={chatInputRef}
                        chatHistoryRef={chatHistoryRef}
                        storytellerTurns={storytellerTurns}
                        user={user}
                        storyTitle={storyTitle}
                        titleQueryParam={titleQueryParam}
                    />
                )}

                {currentView === 'storyDisplay' && (
                    <StoryDisplayView
                        inProp={currentView === 'storyDisplay' && !animatingOut}
                        storyTitle={storyTitle} // Pass storyTitle
                        editableStoryTitle={editableStoryTitle}
                        setEditableStoryTitle={setEditableStoryTitle}
                        isEditingTitle={isEditingTitle}
                        handleTitleEditStart={handleTitleEditStart}
                        handleTitleEditSave={handleTitleEditSave}
                        handleTitleEditCancel={handleTitleEditCancel}
                        titleEditInputRef={titleEditInputRef}
                        displayedImage={displayedImage}
                        storytellerTurns={storytellerTurns}
                        currentStorytellerTurnIndex={currentStorytellerTurnIndex}
                        handlePrevTurn={handlePrevTurn}
                        handleNextTurn={handleNextTurn}
                        storyTextRef={storyTextRef}
                        displayedStoryText={displayedStoryText}
                        handleTransitionToChat={handleTransitionToChat}
                        promptForNextTurnButton={promptForNextTurnButton}
                        currentStoryId={currentStoryId} // Keep for now if other parts use it
                        isLoadingPage={isLoadingPage}
                        titleQueryParam={titleQueryParam}
                        isSubmitting={isSubmitting}
                        isStoryPublic={isStoryPublic}
                        onOpenMakePublicDialog={handleOpenMakePublicDialog}
                        isMakePublicDialogOpen={isMakePublicDialogOpen}
                        onCloseMakePublicDialog={handleCloseMakePublicDialog}
                        onConfirmMakePublic={handleConfirmMakePublic}
                        isMakingPublic={isMakingPublic}
                    />
                )}
                <Snackbar
                    open={toastOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseToast}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }} variant="filled">
                        {toastMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
}