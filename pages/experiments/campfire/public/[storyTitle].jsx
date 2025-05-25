// pages/experiments/campfire/public/[storyTitle].jsx
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import PublicStoryDisplayView from '../../../../src/components/PublicStoryDisplayView';
import CommentList from '../../../../src/components/CommentList'; // Assuming this can be reused
import { processChatTurns, getStorytellerTurns } from '../../../../src/utils/campfireUtils';


// Fetches all public story titles for getStaticPaths
async function fetchPublicStoryTitles() {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/experiments/campfire/public/list`; // Endpoint for all public stories
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            console.error(`Failed to fetch public story list for paths: ${res.status}`);
            return [];
        }
        const data = await res.json();
        return data || [];
    } catch (error) {
        console.error('Error fetching public story list for paths:', error);
        return [];
    }
}

export async function getStaticPaths() {
    const publicStories = await fetchPublicStoryTitles();
    const paths = publicStories.map((story) => ({
        params: { storyTitle: String(story.storyTitle) }, // Ensure storyTitle is a string
    }));

    return { paths, fallback: false };
}

export async function getStaticProps(context) {
    const { storyTitle } = context.params;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/experiments/campfire/public?title=${encodeURIComponent(storyTitle)}`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) {
            if (res.status === 404) {
                return { notFound: true };
            }
            console.error(`Failed to fetch story ${storyTitle}: ${res.status}`);
            // throw new Error(`Failed to fetch story. Status: ${res.status}`);
            return { props: { error: `Failed to load story. Status: ${res.status}`, story: null } };
        }
        const storyData = await res.json();

        if (!storyData || !storyData.storyId) { // Basic validation
            return { notFound: true };
        }

        // Process turns to ensure consistency if needed (e.g. for StoryImageDisplay)
        const processedTurns = processChatTurns(storyData.chatTurns);
        const storytellerTurns = getStorytellerTurns(processedTurns);


        return {
            props: {
                story: {
                    ...storyData,
                    // Pass only storyteller turns if PublicStoryDisplayView expects that
                    // Or pass all chatTurns and let PublicStoryDisplayView filter
                    chatTurns: processedTurns, // Pass all processed turns
                },
                error: null,
            },
        };
    } catch (error) {
        console.error(`Error fetching story ${storyTitle}:`, error);
        return { props: { error: `Failed to load story. Reason: ${error.message}`, story: null } };
        // For "output: export", you might need to return { notFound: true } or handle error differently
        // if revalidate is not allowed. Given previous error, removing revalidate if build fails.
    }
}

export default function PublicStoryPage({ story, error }) {
    const router = useRouter();

    if (router.isFallback) {
        return (
            <Container sx={{ textAlign: 'center', py: 5 }}>
                <CircularProgress />
                <Typography>Loading story...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 3 }}> {/* Changed py to pt, pb */}
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!story) {
        return ( // Should be caught by notFound: true in getStaticProps ideally
            <Container sx={{ pt: 1, pb: 3 }}> {/* Changed py to pt, pb */}
                <Alert severity="warning">Story not found.</Alert>
            </Container>
        );
    }

    return (
        <>
            <Head>
                <title>{story.storyTitle || 'Public Story'} - Musings</title>
                <meta name="description" content={`Read the Ki Storygen adventure: ${story.storyTitle || 'A public story'}`} />
                <meta property="og:title" content={story.storyTitle || 'Public Story'} />
                <meta property="og:description" content={`An AI-generated story from Ki Storygen: ${story.storyContent ? story.storyContent.substring(0, 150) + '...' : 'Read this Ki Storygen adventure.'}`} />
                {story.chatTurns && story.chatTurns.length > 0 && story.chatTurns[0].imageUrl && (
                    <meta property="og:image" content={story.chatTurns[0].imageUrl} />
                )}
                <meta property="og:type" content="article" />
            </Head>
            {/* Changed Container padding from py:3 to pt:1, pb:3 */}
            <Container maxWidth="lg" sx={{ pt: 1, pb: 3 }}>
                <PublicStoryDisplayView story={story} />
                <Box sx={{ mt: 4, maxWidth: 'md', mx: 'auto' }}> {/* Centering comment list and limiting its width */}
                    <CommentList postId={story.storyId} />
                </Box>
            </Container>
        </>
    );
}