/**
 * Header Component
 * Full-width header with search, filters, and navigation
 */

import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  InputAdornment,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useThemeMode } from '../../contexts/ThemeContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onFiltersClick?: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
}

export function Header({
  onSearch,
  onFiltersClick,
  showSearch = true,
  showFilters = true,
}: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/gallery');
    setMobileMenuOpen(false);
  };

  const handleMobileNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 0, py: 1, px: { xs: 2, sm: 3, md: 6 } }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/gallery"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            flexShrink: 0,
            letterSpacing: '-0.02em',
            mr: { xs: 2, sm: 4, md: 9 },
          }}
        >
          ChulasArts
        </Typography>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Search Bar - Desktop */}
        {showSearch && (
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'block' },
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search for free photos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" size="small" edge="end" aria-label="Search">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Mobile Search Overlay */}
        {showSearch && mobileSearchOpen && (
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              px: 2,
              gap: 1,
              zIndex: 1,
            }}
          >
            <TextField
              fullWidth
              autoFocus
              size="small"
              placeholder="Search for free photos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton
              onClick={() => setMobileSearchOpen(false)}
              size="small"
              aria-label="Close search"
              sx={{
                bgcolor: 'action.hover',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            alignItems: 'center',
            flexShrink: 0,
            ml: { xs: 1, sm: 2 },
          }}
        >
          {/* Mobile/Tablet Search Button */}
          {showSearch && (
            <IconButton
              onClick={() => setMobileSearchOpen(true)}
              size="small"
              aria-label="Search"
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                bgcolor: 'action.hover',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <SearchIcon />
            </IconButton>
          )}

          {showFilters && onFiltersClick && (
            <Button
              startIcon={<FilterListIcon />}
              onClick={onFiltersClick}
              variant="outlined"
              size="small"
              sx={{ display: 'none' }}
            >
              Filters
            </Button>
          )}

          <Button
            component={Link}
            to="/gallery"
            sx={{
              color: 'text.primary',
              display: { xs: 'none', md: 'inline-flex' },
              ...(location.pathname === '/gallery' && {
                fontWeight: 700,
                color: 'primary.main',
                borderBottom: 2,
                borderColor: 'primary.main',
                borderRadius: 0,
              }),
            }}
            size="small"
          >
            Gallery
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                component={Link}
                to="/"
                sx={{
                  color: 'text.primary',
                  display: { xs: 'none', md: 'inline-flex' },
                  ...(location.pathname === '/' && {
                    fontWeight: 700,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                  }),
                }}
                size="small"
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/bookmarks"
                sx={{
                  color: 'text.primary',
                  display: { xs: 'none', sm: 'inline-flex' },
                  ...(location.pathname === '/bookmarks' && {
                    fontWeight: 700,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                  }),
                }}
                size="small"
              >
                Bookmarks
              </Button>
              <Button
                onClick={handleLogout}
                sx={{ color: 'text.primary', display: { xs: 'none', md: 'inline-flex' } }}
                size="small"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: 'text.primary',
                  display: { xs: 'none', md: 'inline-flex' },
                  ...(location.pathname === '/login' && {
                    fontWeight: 700,
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    borderRadius: 0,
                  }),
                }}
                size="small"
              >
                Log in
              </Button>
              <Button component={Link} to="/signup" variant="contained" size="small">
                Join
              </Button>
            </>
          )}

          {/* Theme Toggle */}
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={toggleTheme} size="medium" aria-label="Toggle theme">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Mobile/Tablet Menu Button */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            size="medium"
            aria-label="Open menu"
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)} size="small" aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleMobileNavClick('/gallery')}
              selected={location.pathname === '/gallery'}
            >
              <ListItemText primary="Gallery" />
            </ListItemButton>
          </ListItem>
          {isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavClick('/')}
                  selected={location.pathname === '/'}
                >
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavClick('/bookmarks')}
                  selected={location.pathname === '/bookmarks'}
                >
                  <ListItemText primary="Bookmarks" />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavClick('/login')}
                  selected={location.pathname === '/login'}
                >
                  <ListItemText primary="Log in" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavClick('/signup')}
                  selected={location.pathname === '/signup'}
                >
                  <ListItemText primary="Sign up" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
