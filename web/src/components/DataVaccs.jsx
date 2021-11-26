import React from 'react'

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ReplayIcon from '@mui/icons-material/Replay';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { formatISO, isValid } from 'date-fns';

import useFetch from 'hooks/useFetch';
import {DATA_VACCS} from 'api/endpoints';

import DateRangeInput from 'components/ComplexInput/DateRangeInput';
import IntRangeInput from 'components/ComplexInput/IntRangeInput';
import FloatRangeInput from 'components/ComplexInput/FloatRangeInput';

const columns = [
  {field: "date",                                  label: "Date",                 numeric: false, minWidth: 80},
  {field: "iso_code",                              label: "ISO",                  numeric: false, minWidth: 25},
  {field: "new_vaccinations",                      label: "New",                  numeric: true,  minWidth: 75},
  {field: "new_vaccinations_smoothed",             label: "New avg",              numeric: true,  minWidth: 85},
  {field: "new_vaccinations_smoothed_per_million", label: "New/Million avg",      numeric: true,  minWidth: 130},
  {field: "people_fully_vaccinated",               label: "Fully",                numeric: true,  minWidth: 75},
  {field: "people_fully_vaccinated_per_hundred",   label: "Fully/Hundred",        numeric: true,  minWidth: 100},
  {field: "people_vaccinated",                     label: "People",               numeric: true,  minWidth: 75},
  {field: "people_vaccinated_per_hundred",         label: "People/Hundred",       numeric: true,  minWidth: 100},
  {field: "total_vaccinations_per_hundred",        label: "Vaccines/Hundred",     numeric: true,  minWidth: 100},
]

const DataVaccsFilter = ({value, onChange}) => {
  onChange = onChange || (() => {})

  const didMount = React.useRef(false);

  const [date,                              setDate]                              = React.useState(value?.date || "");
  const [isoCode,                           setIsoCode]                           = React.useState(value?.iso_code || "");
  const [newVaccinations,                   setNewVaccinations]                   = React.useState(value?.new_vaccinations || "");
  const [newVaccinationsSmoothed,           setNewVaccinationsSmoothed]           = React.useState(value?.new_vaccinations_smoothed || "");
  const [newVaccinationsSmoothedPerMillion, setNewVaccinationsSmoothedPerMillion] = React.useState(value?.new_vaccinations_smoothed_per_million || "");
  const [peopleFullyVaccinated,             setPeopleFullyVaccinated]             = React.useState(value?.people_fully_vaccinated || "");
  const [peopleFullyVaccinatedPerHundred,   setPeopleFullyVaccinatedPerHundred]   = React.useState(value?.people_fully_vaccinated_per_hundred || "");
  const [peopleVaccinated,                  setPeopleVaccinated]                  = React.useState(value?.people_vaccinated || "");
  const [peopleVaccinatedPerHundred,        setPeopleVaccinatedPerHundred]        = React.useState(value?.people_vaccinated_per_hundred || "");
  const [totalVaccinationsPerHundred,       setTotalVaccinationsPerHundred]       = React.useState(value?.total_vaccinations_per_hundred || "");

  React.useEffect(() => {
    if (didMount.current === true) {
      const timeOutObject = setTimeout(()=>{
        const nulled = (value) => value.length > 0 ? value : null; 
        onChange({
          date: nulled(date),
          iso_code: nulled(isoCode),
          new_vaccinations: nulled(newVaccinations),
          new_vaccinations_smoothed: nulled(newVaccinationsSmoothed),
          new_vaccinations_smoothed_per_million: nulled(newVaccinationsSmoothedPerMillion),
          people_fully_vaccinated: nulled(peopleFullyVaccinated),
          people_fully_vaccinated_per_hundred: nulled(peopleFullyVaccinatedPerHundred),
          people_vaccinated: nulled(peopleVaccinated),
          people_vaccinated_per_hundred: nulled(peopleVaccinatedPerHundred),
          total_vaccinations_per_hundred: nulled(totalVaccinationsPerHundred)
        })
      }, 500);
      return () => clearTimeout(timeOutObject);
    }
    didMount.current = true;
  }, [
    onChange,
    date,
    isoCode,
    newVaccinations,
    newVaccinationsSmoothed,
    newVaccinationsSmoothedPerMillion,
    peopleFullyVaccinated,
    peopleFullyVaccinatedPerHundred,
    peopleVaccinated,
    peopleVaccinatedPerHundred,
    totalVaccinationsPerHundred
  ])

  const createStringChanger = (setter) => (event) => {
    const value = event.target.value;
    if (value.length > 0) setter(value);
    else setter("");
  }

  const createNumericChanger = (setter) => (newValue) => {
    const from = newValue.from || "";
    const to = newValue.to || "";
    const range = `${from}|${to}`;
    setter(range.length !== 1 ? range : "");
  }

  const createDateChanger = (setter) => (newDate) => {
    console.log(newDate)
    const from = newDate.dateFrom ? formatISO(newDate.dateFrom, {representation: "date"}) : "";
    const to = newDate.dateTo ? formatISO(newDate.dateTo, {representation: "date"}) : "";
    const range = `${from}|${to}`;
    setter(range.length !== 1 ? range : "");
  }

  const splitIntRange = (range) => {
    const [from, to] = (range.length !== 0 ? range : "|").split("|")
    return {
      from: parseInt(from) || null,
      to: parseInt(to) || null
    } 
  }

  const splitFloatRange = (range) => {
    const [from, to] = (range.length !== 0 ? range : "|").split("|")
    return {
      from: parseFloat(from) || null,
      to: parseFloat(to) || null
    }
  }

  const splitDateRange = (range) => {
    const [from, to] = (range.length !== 0 ? range : "|").split("|").map(date => new Date(date))
    return {
      dateFrom: isValid(from) ? from : null,
      dateTo: isValid(to) ? to : null 
    }
  }
 
  return (
    <>
      <Divider/><DateRangeInput value={splitDateRange(date)} onChange={createDateChanger(setDate)} label="Date" vertical/>
      <Divider/><Box sx={{m:2}}><TextField fullWidth value={isoCode} label="ISO code"  onChange={createStringChanger(setIsoCode)}/></Box>
      <Divider/><IntRangeInput   label="New"              value={splitIntRange(newVaccinations)} onChange={createNumericChanger(setNewVaccinations)}/>
      <Divider/><FloatRangeInput label="New avg"          value={splitFloatRange(newVaccinationsSmoothed)} onChange={createNumericChanger(setNewVaccinationsSmoothed)}/>
      <Divider/><FloatRangeInput label="New/Million avg"  value={splitFloatRange(newVaccinationsSmoothedPerMillion)} onChange={createNumericChanger(setNewVaccinationsSmoothedPerMillion)}/>
      <Divider/><IntRangeInput   label="Fully"            value={splitIntRange(peopleFullyVaccinated)} onChange={createNumericChanger(setPeopleFullyVaccinated)}/>
      <Divider/><FloatRangeInput label="Fully/Hundred"    value={splitFloatRange(peopleFullyVaccinatedPerHundred)} onChange={createNumericChanger(setPeopleFullyVaccinatedPerHundred)}/>
      <Divider/><IntRangeInput   label="People"           value={splitIntRange(peopleVaccinated)} onChange={createNumericChanger(setPeopleVaccinated)}/>
      <Divider/><FloatRangeInput label="People/Hundred"   value={splitFloatRange(peopleVaccinatedPerHundred)} onChange={createNumericChanger(setPeopleVaccinatedPerHundred)}/>
      <Divider/><FloatRangeInput label="Vaccines/Hundred" value={splitFloatRange(totalVaccinationsPerHundred)} onChange={createNumericChanger(setTotalVaccinationsPerHundred)}/>
    </>
  )
}

const DataVaccs = ({reset=false}) => {
  const [openFilters, setOpenFilters] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [dataLength, setDataLength] = React.useState(0);
  const [order, setOrder] = React.useState(null);
  const [orderBy, setOrderBy] = React.useState(null);

  const [filters, setFilters] = React.useState(columns.reduce((acc, column)=>({...acc, [column.field]: null}),{}));

  const [vaccs, performVaccsFetch] = useFetch(DATA_VACCS);

  React.useEffect(() => {
    performVaccsFetch({sort: order, order_by: orderBy, ...filters});
  }, [performVaccsFetch, filters, order, orderBy])

  React.useEffect(() => {
    if (vaccs.data?.data) {
      setDataLength(vaccs.data.data.length);
    }
  }, [vaccs])

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const handleOnSort = (field) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  }

  const handleFilterChange = (newFilters) => {
    if (Object.keys(filters).length !== Object.keys(newFilters).length) {
      setFilters(newFilters);
      return
    }

    for(const key in filters) {
      if (filters[key] !== newFilters[key]) {
        setFilters(newFilters);
        break;
      }
    }
  }

  const Head = ({order="", orderBy="", onSort}) => {
    if (!onSort) {
      onSort = (field, order) => {}
    }
    return (
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableCell
              key={column.field}
              align={column.numeric ? "right" : 'left'}
              padding="normal"
              sortDirection={orderBy === column.field ? order : false}
              style={{minWidth: column.minWidth}}
            >
              <TableSortLabel
                active={orderBy === column.field}
                direction={orderBy === column.field ? order : "asc"}
                onClick={() => onSort(column.field)}
              >
                {column.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    )
  }

  const Body = ({rows, rowsPerPage=10, loading=null, error=null}) => {
    rows = rows || []
    const emptyRows = (loading || error) ? 10 : rowsPerPage - rows.length
    return (
      <TableBody>
        {!loading && !error && rows.map((row, index) => (
          <TableRow hover key={index}>
            {columns.map(column => (
              <TableCell key={`${index}_${column.field}`} align={column.numeric ? "right" : 'left'}>
                {column.field !== "date" ? row[column.field] : formatISO(new Date(row[column.field]), {representation: "date"})}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {emptyRows > 0 && (
          <TableRow style={{ height: 53 * emptyRows }}>
            <TableCell colSpan={8}>
              {loading && (
                <Box sx={{display: "flex", width: "100%", height: "100%", justifyContent: "center", alignItems: "center"}}>
                  <CircularProgress size="5rem"/>
                </Box>
              )}
              {error && (
                <Box sx={{display: "flex", width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                  <SentimentVeryDissatisfiedIcon color="primary" style={{width: "10rem", height: "10rem"}}/>
                  <Typography variant="h6">{error.message}</Typography>
                  <Button variant="outlined" startIcon={<ReplayIcon/>} onClick={()=>{performVaccsFetch()}}>Перезагрузить</Button>
                </Box>
              )}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    )
  }

  return (
    <Box id="root-countries-box">
      <Drawer
        open={openFilters}
        onClose={() => {setOpenFilters(false)}}
        elevation={5}
        PaperProps={{ style: { opacity: 0.9, position: "absolute"} }}
        BackdropProps={{ style: { position: "absolute" } }}
        variant="temporary"
        ModalProps={{
          container: document.getElementById("root-countries-box"),
          style: { position: "absolute" },
        }}
      >
        <Box>
          <IconButton onClick={() => {setOpenFilters(false)}}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <DataVaccsFilter value={filters} onChange={handleFilterChange}/>
      </Drawer>

      <Box sx={{display: "flex"}}>
        <Button sx={{m: 1}} startIcon={<FilterAltIcon/>} onClick={() => {setOpenFilters(true)}}> Фильтры </Button>
        <TablePagination
          sx={{flexGrow: 1}}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={dataLength}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
      <Divider />
      <TableContainer sx={{overflowX: 'auto'}}>
        <Table size="medium">
          <Head order={order} orderBy={orderBy} onSort={handleOnSort}/>
          <Body
            rows={vaccs.data?.data?.slice(page * rowsPerPage, (page+1) * rowsPerPage)}
            loading={vaccs.loading}
            error={vaccs.error}
          />
        </Table>
      </TableContainer>
      <Box sx={{display: "flex"}}>
        <Button sx={{m: 1}} startIcon={<FilterAltIcon/>} onClick={() => {setOpenFilters(true)}}> Фильтры </Button>
        <TablePagination
          sx={{flexGrow: 1}}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={dataLength}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  )
}


export default DataVaccs
