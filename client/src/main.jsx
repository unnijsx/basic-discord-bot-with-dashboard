import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './App.jsx';
import './index.css';
import './i18n'; // Initialize i18n
import { BrandingProvider, useBranding } from './context/BrandingContext.jsx';

const Root = () => {
  const { themeColor, loading } = useBranding();

  if (loading) return null; // Or a spinner

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: themeColor || '#5865F2',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif"
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrandingProvider>
      <Root />
    </BrandingProvider>
  </React.StrictMode>,
);
