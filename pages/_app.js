import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Script from 'next/script';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';

import theme from '../src/theme';
import { AuthProvider } from '@/context/AuthContext';
import createEmotionCache from '../src/createEmotionCache';
import Layout from '../src/components/Layout';
import { GoogleAnalytics } from '@next/third-parties/google';

import '../src/styles/globals.css';

const clientSideEmotionCache = createEmotionCache();

export default function MyApp(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const useLayout = Component.useLayout !== false;

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" type="image/jpeg" href="/newf-head.jpeg" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {useLayout ? (
            <Layout>
              <Component {...pageProps} />
            </Layout>
          ) : (
            <Component {...pageProps} />
          )}
        </AuthProvider>
      </ThemeProvider>
        <GoogleAnalytics gaId={"G-0NWQCXZFW7"}/>
    </CacheProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
