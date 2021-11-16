import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { useEffect } from 'react';

import Stats from 'components/Stats';
import useFetch from 'hooks/useFetch';
import { CASES_PER_DAY } from 'api/endpoints';


const app_title = "Статиcтика COVID-19";

function App() {
  const [response, performFetch] = useFetch(CASES_PER_DAY);

  useEffect(() => {
    performFetch()
  }, [performFetch])

  console.log(response);

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
