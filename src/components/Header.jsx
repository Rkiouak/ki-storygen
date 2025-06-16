import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useTheme, useMediaQuery
} from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuIcon from '@mui/icons-material/Menu'; // Hamburger Icon

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Use a breakpoint that suits your design, 'md' is a common choice

    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        router.push('/');
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose} component={NextLink} href="/profile">Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem component={NextLink} href="/characters" onClick={handleMenuClose}>
                <p>Characters</p>
            </MenuItem>
            <MenuItem component="a" href="https://musings-mr.net" target="_blank" rel="noopener noreferrer" onClick={handleMenuClose}>
                <p>Matt's Blog</p>
            </MenuItem>
            {!isAuthenticated && (
                [
                    <MenuItem key="login" component={NextLink} href="/login" onClick={handleMenuClose}>
                        <p>Login</p>
                    </MenuItem>,
                    <MenuItem key="signup" component={NextLink} href="/signup" onClick={handleMenuClose}>
                        <p>Sign Up</p>
                    </MenuItem>
                ]
            )}
        </Menu>
    );

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Logo */}
                <Box
                    component="img"
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        mr: 1,
                        height: 52,
                        width: 52,
                        borderRadius: '50%',
                        objectFit: 'cover',
                    }}
                    alt="Musings logo"
                    src={"/newfy.jpeg"}
                />

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <NextLink href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Ki Storygen
                    </NextLink>
                </Typography>

                {/* Desktop Menu Items */}
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Button color="inherit" component={NextLink} href="/characters">
                        Characters
                    </Button>
                    <Button
                        color="inherit"
                        href="https://musings-mr.net"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<LaunchIcon />}
                    >
                        Matt's Blog
                    </Button>
                    {isAuthenticated ? (
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    ) : (
                        <>
                            <Button color="inherit" component={NextLink} href="/login">Login</Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                component={NextLink}
                                href="/signup"
                                sx={{ ml: 1.5 }}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                </Box>

                {/* Mobile Menu Icon */}
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    {isAuthenticated && (
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    )}
                    <IconButton
                        size="large"
                        aria-label="show more"
                        aria-controls={mobileMenuId}
                        aria-haspopup="true"
                        onClick={handleMobileMenuOpen}
                        color="inherit"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
            </Toolbar>
            {renderMobileMenu}
            {renderMenu}
        </AppBar>
    );
}

export default Header;