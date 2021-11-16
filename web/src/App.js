import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { useSelector } from 'react-redux';

import Stats from 'components/Stats';

const app_title = "Статиcтика COVID-19";

function App() {
  const store = useSelector(store => store);
  console.log(store);

  return (
    <>
      <AppBar position="relative">
        <Toolbar>
          <Container>
            <Typography variant="h6" component="div">
              {app_title}
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Stats/>
      </Container>
    </>
  );
}

export default App;
