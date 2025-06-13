import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Container, Typography, Box, TextField, Button, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/context/AuthContext';
import NextLink from 'next/link';

const CharacterRole = ["PROTAGONIST", "ANTAGONIST", "DEUTERAGONIST", "SUPPORTING_CHARACTER", "MENTOR", "FOIL"];
const MoralAlignment = ["LAWFUL_GOOD", "NEUTRAL_GOOD", "CHAOTIC_GOOD", "LAWFUL_NEUTRAL", "TRUE_NEUTRAL", "CHAOTIC_NEUTRAL", "LAWFUL_EVIL", "NEUTRAL_EVIL", "CHAOTIC_EVIL"];

const initialCharacterState = {
    given_name: '',
    family_name: '',
    species: 'Human',
    aliases: [],
    role: 'ROLE_UNSPECIFIED',
    description: '',
    physical_attributes: {},
    mental_attributes: {},
    skills: { known_skills: [] },
    relationships: { connection: [] },
    background: {},
    motivations: { alignment: 'ALIGNMENT_UNSPECIFIED', secondary_goals: [], core_values: [], desires: [] },
    clothing: { current_outfit: [] },
    possessions: { inventory: [], currency: {} }
};


export default function EditCharacterPage() {
    const { token, handleUnauthorized, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const { id: characterId } = router.query;

    const [character, setCharacter] = useState(initialCharacterState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCharacter = useCallback(async (id) => {
        if (!token) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/character/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (response.status === 401) {
                handleUnauthorized();
                router.push(`/login?sessionExpired=true&from=/characters/edit/${id}`);
                throw new Error("Session expired.");
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Character not found or error fetching: ${response.status}`);
            }
            const data = await response.json();
            // Ensure nested objects exist to prevent errors in form fields
            setCharacter(prev => ({
                ...initialCharacterState,
                ...data,
                physical_attributes: data.physical_attributes || {},
                mental_attributes: data.mental_attributes || {},
                motivations: data.motivations || { alignment: 'ALIGNMENT_UNSPECIFIED' },
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, router, handleUnauthorized]);

    useEffect(() => {
        if (router.isReady && characterId) {
            if (!isAuthLoading && !isAuthenticated) {
                router.push(`/login?from=/characters/edit/${characterId}`);
                return;
            }
            fetchCharacter(characterId);
        }
    }, [router.isReady, characterId, fetchCharacter, isAuthLoading, isAuthenticated, router]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');

        setCharacter(prev => {
            // Deep copy to avoid direct state mutation
            const updated = JSON.parse(JSON.stringify(prev));
            let current = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!token) {
            setError('You must be logged in to update a character.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/character/${characterId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(character)
            });

            if (response.status === 401) {
                handleUnauthorized();
                router.push(`/login?sessionExpired=true&from=/characters/edit/${characterId}`);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update character.');
            }

            const updatedCharacter = await response.json();
            setSuccess(`Successfully updated character: ${updatedCharacter.given_name}`);
            setCharacter(updatedCharacter); // Refresh state with potentially updated data from backend

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !character.character_id) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Loading Character...</Typography>
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
                <NextLink href="/characters" passHref legacyBehavior>
                    <Button sx={{mt: 2}}>Back to Characters</Button>
                </NextLink>
            </Container>
        )
    }

    return (
        <>
            <Head>
                <title>Edit {character.given_name || 'Character'} - Ki Storygen</title>
            </Head>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Edit: {character.given_name} {character.family_name}
                    </Typography>

                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField name="given_name" label="Given Name" value={character.given_name || ''} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="family_name" label="Family Name" value={character.family_name || ''} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="species" label="Species" value={character.species || ''} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select name="role" label="Role" value={character.role || 'ROLE_UNSPECIFIED'} onChange={handleChange}>
                                    <MenuItem value="ROLE_UNSPECIFIED">Unspecified</MenuItem>
                                    {CharacterRole.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="description" label="Description" value={character.description || ''} onChange={handleChange} fullWidth multiline rows={3} />
                        </Grid>
                    </Grid>

                    <Accordion sx={{ mt: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Physical Attributes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><TextField name="physical_attributes.actual_age" label="Actual Age" type="number" value={character.physical_attributes?.actual_age || ''} onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.apparent_age" label="Apparent Age" value={character.physical_attributes?.apparent_age || ''} onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.height_cm" label="Height (cm)" type="number" value={character.physical_attributes?.height_cm || ''} onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.weight_kg" label="Weight (kg)" type="number" value={character.physical_attributes?.weight_kg || ''} onChange={handleChange} fullWidth /></Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Mental Attributes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField name="mental_attributes.personality_summary" label="Personality Summary" value={character.mental_attributes?.personality_summary || ''} onChange={handleChange} fullWidth multiline rows={2}/></Grid>
                                <Grid item xs={6}><TextField name="mental_attributes.iq" label="IQ" type="number" value={character.mental_attributes?.iq || ''} onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="mental_attributes.eq" label="EQ" type="number" value={character.mental_attributes?.eq || ''} onChange={handleChange} fullWidth /></Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Motivations</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Moral Alignment</InputLabel>
                                        <Select name="motivations.alignment" label="Moral Alignment" value={character.motivations?.alignment || 'ALIGNMENT_UNSPECIFIED'} onChange={handleChange}>
                                            <MenuItem value="ALIGNMENT_UNSPECIFIED">Unspecified</MenuItem>
                                            {MoralAlignment.map(alignment => <MenuItem key={alignment} value={alignment}>{alignment.replace(/_/g, ' ')}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}><TextField name="motivations.primary_goal" label="Primary Goal" value={character.motivations?.primary_goal || ''} onChange={handleChange} fullWidth multiline rows={2}/></Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                        <NextLink href="/characters" passHref legacyBehavior>
                            <Button variant="outlined">Back to List</Button>
                        </NextLink>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}