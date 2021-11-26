import React from 'react'

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import LoadingButton from '@mui/lab/LoadingButton';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';

import { makeStyles } from '@material-ui/core/styles';

import DataCountries from 'components/DataCountries';
import DataCases from 'components/DataCases';
import DataVaccs from 'components/DataVaccs';

import useFetch from "../hooks/useFetch";
import {EXPORT_DB, IMPORT_DB, RESET_DB} from "../api/endpoints";
import api from "../api/api";

const tab_countries = "Countries";
const tab_cases = "Cases";
const tab_vaccinations = "Vaccinations";


const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    margin: theme.spacing(2, 0),
  },
  databaseButtons: {
    display: "flex"
  },
  topSelector: {
    margin: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}))

function TabPanel({children, value, index, ...other}) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && (
        <Box sx={{width: "100%", height: "100%"}}>
          {children}
        </Box>
      )}
    </div>
  )
}

const Data = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const [importSuccess, setImportSuccess] = React.useState(false);
  const [importFailure, setImportFailure] = React.useState(false);
  const [resetSuccess,  setResetSuccess] = React.useState(false);
  const [resetFailure,  setResetFailure] = React.useState(false);

  const snackbarOrigin = {vertical: "top", horizontal: "center"};

  const classes = useStyles()

  const [resetDB, performResetDB] = useFetch(RESET_DB);
  const [importDB, performImportDB] = useFetch(IMPORT_DB);

  React.useEffect(() => {
    if (!resetDB.loading) {
      if (resetDB.error) {
        setResetFailure(true);
      } else if (resetDB.data) {
        setResetSuccess(true);
      }
    }
  }, [resetDB])

  React.useEffect(() => {
    if (!importDB.loading) {
      if (importDB.error) {
        setImportFailure(true);
      } else if (importDB.data) {
        setImportSuccess(true);
      }
    }
  }, [importDB])

  const resetDataBase = () => {
    performResetDB();
  };

  const importDataBase = () => {
    upload.click();
  };

  function onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    performImportDB(file)
  }

  let upload = null;

  return (
    <Box className={classes.root}>
      <Box className={classes.topSelector}>
        <input id="myInput"
           type="file"
           ref={(ref) => upload = ref}
           style={{display: 'none'}}
           onChange={onChangeFile.bind(this)}
        />
        <Tabs value={currentTab} onChange={(_, val)=>{setCurrentTab(val)}}>
          <Tab className={classes.button} variant="outlined" label={tab_countries} id={0}/>
          <Tab className={classes.button} variant="outlined" label={tab_cases} id={1}/>
          <Tab className={classes.button} variant="outlined" label={tab_vaccinations} id={1}/>
        </Tabs>

        <Box>
          <Button sx={{m: 1}} startIcon={<DownloadIcon/>} component={Link} href={api.makeQueryLink(EXPORT_DB)} download> Скачать </Button>
          <LoadingButton sx={{m: 1}} startIcon={<UploadIcon/>} onClick={importDataBase} loading={importDB.loading || resetDB.loading} loadingPosition="start"> Импортировать </LoadingButton>
          <LoadingButton sx={{m: 1}} startIcon={<ReplayIcon/>} onClick={resetDataBase}  loading={resetDB.loading || importDB.loading} loadingPosition="start"> Сбросить </LoadingButton>
        </Box>

        <Snackbar anchorOrigin={snackbarOrigin} open={importSuccess} autoHideDuration={4000} onClose={()=>{setImportSuccess(false)}}>
          <Alert severity="success">База данных импортирована успешно!</Alert>
        </Snackbar>

        <Snackbar anchorOrigin={snackbarOrigin} open={importFailure} autoHideDuration={4000} onClose={()=>{setImportFailure(false)}}>
          <Alert severity="warning">Ошибка импорта базы данных! {importDB.error?.message}</Alert>
        </Snackbar>

        <Snackbar anchorOrigin={snackbarOrigin} open={resetSuccess} autoHideDuration={4000} onClose={()=>{setResetSuccess(false)}}>
          <Alert severity="success">База данных сброшена к исходной!</Alert>
        </Snackbar>

        <Snackbar anchorOrigin={snackbarOrigin} open={resetFailure} autoHideDuration={4000} onClose={()=>{setResetFailure(false)}}>
          <Alert severity="warning">Ошибка сброса базы данных! {resetDB.error?.message}</Alert>
        </Snackbar>
      </Box>

      <Paper sx={{position: "absolute", width: "100%"}}>
        <TabPanel value={currentTab} index={0}><DataCountries reset={resetSuccess || importSuccess} /></TabPanel>
        <TabPanel value={currentTab} index={1}><DataCases     reset={resetSuccess || importSuccess}/></TabPanel>
        <TabPanel value={currentTab} index={2}><DataVaccs     reset={resetSuccess || importSuccess}/></TabPanel>
      </Paper>
    </Box>
  )
}

export default Data
