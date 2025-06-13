import { createTheme } from '@mui/material/styles';

// A final, very subdued and neutral theme with an extremely light, earthy palette.
const calmAndNeutralTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#DDE2D5', // A very light, neutral green-grey, close to white.
            contrastText: '#000000', // Black text for maximum readability.
        },
        secondary: {
            main: '#D4CFC7', // A gentle, warm tan for accents.
            contrastText: '#000000',
        },
        background: {
            default: '#F8F6F2', // A very soft, warm off-white.
            paper: '#FFFFFF',
        },
        text: {
            primary: '#4a4a4a',   // Dark, warm grey for primary text.
            secondary: '#757575', // Medium grey for secondary text.
        },
        info: {
            main: '#81D4FA',
        },
        success: {
            main: '#A5D6A7',
        },
    },
    typography: {
        fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        h4: { fontWeight: 500 },
        h5: { fontWeight: 'bold' },
        h6: { fontWeight: 'bold' }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    // A very subtle gradient with the new light primary color.
                    background: 'linear-gradient(to bottom, #DDE2D5, #D2D8C8)',
                    // A soft border to give a slight definition.
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    // Ensure default text color in AppBar is black.
                    color: '#000000',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                // Style for buttons in the AppBar to ensure they inherit the correct color.
                root: ({ ownerState, theme }) => ({
                    ...(ownerState.color === 'inherit' && {
                        color: theme.palette.primary.contrastText,
                    }),
                }),
            }
        }
    },
});

export default calmAndNeutralTheme;