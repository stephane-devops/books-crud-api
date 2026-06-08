import React, { useState } from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import spec from "./swagger.json";
import { 
  AppBar, 
  Tabs, 
  Tab, 
  Box, 
  ThemeProvider, 
  createTheme, 
  CssBaseline 
} from '@mui/material';
import BookList from './components/BookList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="app tabs"
            textColor="inherit"
            indicatorColor="secondary"
            centered
          >
            <Tab label="Books App" />
            <Tab label="Swagger API Docs" />
          </Tabs>
        </AppBar>
        
        <TabPanel value={tabValue} index={0}>
          <BookList />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <SwaggerUI spec={spec} />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App;
