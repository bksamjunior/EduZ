import { Box } from '@mui/material';
import React from 'react';

const PageContainer: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Reserve space for AppBar (approx 64px) so vertical centering is visually centered
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 64px)" bgcolor="grey.100" sx={{ width: '100%', p: 2 }}>
      {children}
    </Box>
  );
};

export default PageContainer;
