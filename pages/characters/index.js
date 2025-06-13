import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import NextLink from 'next/link';
import {
    Container, Typography, Box, Button, Paper, Grid, CircularProgress, Alert,
    List, ListItem, ListItemText, Divider, IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function CharactersPage() {
    const { token, isAuthenticated, isLoading: isAuthLoading, handleUnauthorized } = useAuth();
    const router = useRouter();
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCharacters = useCallback(async () => {
        if (!isAuthenticated || !token) {
            if (!isAuthLoading) {
                router.push('/login?from=/characters');
            }
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/character/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.status === 401) {
                handleUnauthorized();
                router.push('/login?sessionExpired=true&from=/characters');
                throw new Error("Session expired. Please log in again.");
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to fetch characters: ${response.status}`);
            }

            const data = await response.json();
            setCharacters(data || []);
        } catch (err) {
            console.error("Error fetching characters:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, isAuthLoading, router, handleUnauthorized]);

    useEffect(() => {
        if (!isAuthLoading) {
            fetchCharacters();
        }
    }, [fetchCharacters, isAuthLoading]);

    return (
        <>
            <Head>
                <title>Your Characters - Ki Storygen</title>
                <meta name="description" content="View and manage your characters for Ki Storygen." />
            </Head>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h4" component="h1">
                            Your Characters
                        </Typography>
                        <NextLink href="/characters/create" passHref legacyBehavior>
                            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />}>
                                Create New Character
                            </Button>
                        </NextLink>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {characters.length > 0 ? characters.map((char, index) => (
                                <React.Fragment key={char.character_id}>
                                    <ListItem
                                        secondaryAction={
                                            <NextLink href={`/characters/edit/${char.character_id}`} passHref legacyBehavior>
                                                <a>  {/* This is the new anchor tag */}
                                                    <IconButton edge="end" aria-label="edit">
                                                        <EditIcon />
                                                    </IconButton>
                                                </a>
                                            </NextLink>
                                        }
                                    >
                                        <ListItemText
                                            primary={`${char.given_name} ${char.family_name || ''}`}
                                            secondary={char.description || 'No description available.'}
                                            primaryTypographyProps={{ variant: 'h6', component: 'div' }}
                                        />
                                    </ListItem>
                                    {index < characters.length - 1 && <Divider />}
                                </React.Fragment>
                            )) : (
                                <Typography sx={{ textAlign: 'center', my: 5, color: 'text.secondary' }}>
                                    You haven&#39;t created any characters yet.
                                </Typography>
                            )}
                        </List>
                    )}
                </Paper>
            </Container>
        </>
    );
}