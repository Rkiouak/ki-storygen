import React, {useState} from 'react';
import {AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useTheme} from '@mui/material';
import NextLink from 'next/link';
import {useRouter} from 'next/router';
import {useAuth} from '@/context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LaunchIcon from '@mui/icons-material/Launch';

function Header() {
    const {user, isAuthenticated, logout} = useAuth();
    const router = useRouter();

    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        router.push('/');
    };

    const isCurrentPage = (path) => router.pathname.startsWith(path);

    return (
        <AppBar position="static">
            <Toolbar sx={{minHeight: '48px', '@media (min-width:600px)': {minHeight: '56px'}, py: 0.5}}>
                <Box
                    component="img"
                    sx={{
                        display: {xs: 'none', md: 'flex'},
                        mr: 1,
                        height: 52,
                        width: 52,
                        borderRadius: '50%',
                        objectFit: 'cover',
                    }}
                    alt="Musings logo"
                    src={"/newfy.jpeg"}
                />

                <Typography variant="h6" component="div" sx={{mr: 2}}>
                    <NextLink href="/" style={{textDecoration: 'none', color: 'inherit'}}>
                        Ki Storygen
                    </NextLink>
                </Typography>

                <Button
                    color="inherit"
                    component={NextLink}
                    href="/characters"
                    sx={{
                        backgroundColor: isCurrentPage('/characters') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    }}
                >
                    Characters
                </Button>

                <Box sx={{flexGrow: 1}}/>

                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Button
                        color="inherit"
                        component={NextLink}
                        href="https://musings-mr.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<LaunchIcon sx={{ fontSize: '1rem' }} />}
                        sx={{
                            whiteSpace: 'nowrap',
                            ml: 1,
                            '&:hover': {
                                backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                            },
                            color: theme.palette.text.secondary,
                        }}
                    >
                        Matt's Blog
                    </Button>
                    {isAuthenticated ? (
                        <>
                            <Button
                                color="inherit"
                                component={NextLink}
                                href="/"
                                sx={{
                                    mr: {xs: 0.5, sm: 1.5},
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    padding: '6px 12px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        '& .ki-logo, & .ki-text': {
                                            opacity: 0.85,
                                        }
                                    },
                                    backgroundColor: isCurrentPage('/experiments/campfire') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                }}
                            >
                                <Box
                                    className="ki-logo"
                                    component="img"
                                    src="/ki-storygen-logo.png"
                                    alt="Ki Storygen Logo"
                                    sx={{
                                        height: 38,
                                        width: 38,
                                        mr: 0.75,
                                        objectFit: 'contain',
                                        borderRadius: '50%',
                                        transition: 'opacity 0.2s ease-in-out',
                                    }}
                                />
                                <Typography component="span" className="ki-text"
                                            sx={{transition: 'opacity 0.2s ease-in-out'}}>
                                    Ki Storygen
                                </Typography>
                            </Button>

                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls="primary-search-account-menu"
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <AccountCircleIcon/>
                            </IconButton>
                            <Menu
                                id="primary-search-account-menu"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                    }
                                }}
                            >
                                <MenuItem component={NextLink} href="/profile" onClick={handleMenuClose}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={NextLink} href="/login" sx={{whiteSpace: 'nowrap'}}>
                                Login
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                component={NextLink}
                                href="/signup"
                                sx={{ml: 1.5, whiteSpace: 'nowrap'}}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;