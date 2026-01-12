import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme } from './styles/theme';
import { Layout } from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyles />
      <Layout />
    </ThemeProvider>
  );
}

export default App;
