// src/components/StoryPreview.jsx
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DEFAULT_IMAGE_URL } from '@/utils/campfireUtils';

function StoryPreview({ story }) {
    const theme = useTheme();

    if (!story || !story.storyId || !story.storyTitle) {
        console.warn('StoryPreview: Skipping render due to missing story data or ID/title.', story);
        return null;
    }

    let imageUrl = DEFAULT_IMAGE_URL;
    if (story && story.displayImageUrl) {
        imageUrl = story.displayImageUrl;
    }

    // Updated link to the new public story page
    const storyUrl = `/experiments/campfire/public/${encodeURIComponent(story.storyTitle)}`;

    return (
        <Card sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: theme.transitions.create(['box-shadow', 'transform'], { duration: theme.transitions.duration.short }),
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[6],
            }
        }}>
            <Box sx={{ overflow: 'hidden', height: 180 }}>
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={`Preview for ${story.storyTitle}`}
                    sx={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.35s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        }
                    }}
                />
            </Box>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'medium', minHeight: '3.5em' }}>
                    {story.storyTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
                    By {story.username || 'Unknown Storyteller'}
                    {story.savedAt && ` on ${new Date(story.savedAt).toLocaleDateString()}`}
                </Typography>
            </CardContent>
            <CardActions sx={{ mt: 'auto', pt: 0, justifyContent: 'flex-start' }}>
                <Link href={storyUrl} passHref legacyBehavior>
                    <Button size="small" component="a">
                        View Story
                    </Button>
                </Link>
            </CardActions>
        </Card>
    );
}

export default StoryPreview;