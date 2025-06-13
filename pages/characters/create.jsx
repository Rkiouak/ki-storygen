import React, { useState } from 'react';
import Head from 'next/head';
import {
    Container, Typography, Box, TextField, Button, Paper, Grid,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

const CharacterRole = ["PROTAGONIST", "ANTAGONIST", "DEUTERAGONIST", "SUPPORTING_CHARACTER", "MENTOR", "FOIL"];
const MoralAlignment = ["LAWFUL_GOOD", "NEUTRAL_GOOD", "CHAOTIC_GOOD", "LAWFUL_NEUTRAL", "TRUE_NEUTRAL", "CHAOTIC_NEUTRAL", "LAWFUL_EVIL", "NEUTRAL_EVIL", "CHAOTIC_EVIL"];

export default function CreateCharacterPage() {
    const { token, handleUnauthorized } = useAuth();
    const router = useRouter();
    const [character, setCharacter] = useState({
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
        motivations: { alignment: 'ALIGNMENT_UNSPECIFIED' },
        clothing: { current_outfit: [] },
        possessions: { inventory: [], currency: {} }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setCharacter(prev => {
                const updated = { ...prev };
                let current = updated;
                for (let i = 0; i < keys.length - 1; i++) {
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return updated;
            });
        } else {
            setCharacter(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!token) {
            setError('You must be logged in to create a character.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/character/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(character)
            });

            if (response.status === 401) {
                handleUnauthorized();
                router.push('/login?sessionExpired=true');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create character.');
            }

            const newCharacter = await response.json();
            setSuccess(`Successfully created character: ${newCharacter.given_name}`);
            // Optionally redirect or clear form
            // router.push(`/characters/edit?id=${newCharacter.character_id}`);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Create Character - Ki Storygen</title>
            </Head>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Create a New Character
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField name="given_name" label="Given Name" value={character.given_name} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="family_name" label="Family Name" value={character.family_name} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="species" label="Species" value={character.species} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select name="role" label="Role" value={character.role} onChange={handleChange}>
                                    <MenuItem value="ROLE_UNSPECIFIED">Unspecified</MenuItem>
                                    {CharacterRole.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField name="description" label="Description" value={character.description} onChange={handleChange} fullWidth multiline rows={3} />
                        </Grid>
                    </Grid>

                    <Accordion sx={{ mt: 3 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Physical Attributes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><TextField name="physical_attributes.actual_age" label="Actual Age" type="number" onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.apparent_age" label="Apparent Age" onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.height_cm" label="Height (cm)" type="number" onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="physical_attributes.weight_kg" label="Weight (kg)" type="number" onChange={handleChange} fullWidth /></Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Mental Attributes</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><TextField name="mental_attributes.personality_summary" label="Personality Summary" onChange={handleChange} fullWidth multiline rows={2}/></Grid>
                                <Grid item xs={6}><TextField name="mental_attributes.iq" label="IQ" type="number" onChange={handleChange} fullWidth /></Grid>
                                <Grid item xs={6}><TextField name="mental_attributes.eq" label="EQ" type="number" onChange={handleChange} fullWidth /></Grid>
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
                                        <Select name="motivations.alignment" label="Moral Alignment" value={character.motivations.alignment} onChange={handleChange}>
                                            <MenuItem value="ALIGNMENT_UNSPECIFIED">Unspecified</MenuItem>
                                            {MoralAlignment.map(alignment => <MenuItem key={alignment} value={alignment}>{alignment.replace(/_/g, ' ')}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}><TextField name="motivations.primary_goal" label="Primary Goal" onChange={handleChange} fullWidth multiline rows={2}/></Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Save Character'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}