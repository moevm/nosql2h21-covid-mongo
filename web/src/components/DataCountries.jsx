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

import useFetch from 'hooks/useFetch';
import {DATA_COUNTRIES} from 'api/endpoints';

import IntRangeInput from 'components/ComplexInput/IntRangeInput';
import FloatRangeInput from 'components/ComplexInput/FloatRangeInput';

const columns = [
    {field: "iso_code",           label: "ISO",        numeric: false},
    {field: "location",           label: "Country",    numeric: false},
    {field: "continent",          label: "Continent",  numeric: false},
    {field: "population",         label: "Population", numeric: true},
    {field: "population_density", label: "Density",    numeric: true},
    {field: "median_age",         label: "Median Age", numeric: true},
    {field: "aged_65_older",      label: ">65, %",     numeric: true},
    {field: "aged_70_older",      label: ">70, %",     numeric: true},
]

const DataCountriesFilter = ({value, onChange}) => {
  onChange = onChange || (() => {})

  const didMount = React.useRef(false);

  const [isoCode,           setIsoCode]           = React.useState(value?.iso_code || "");
  const [location,          setLocation]          = React.useState(value?.location || "");
  const [continent,         setContinent]         = React.useState(value?.continent || "");
  const [population,        setPopulation]        = React.useState(value?.population || "");
  const [populationDensity, setPopulationDensity] = React.useState(value?.population_density || "");
  const [medianAge,         setMedianAge]         = React.useState(value?.median_age || "");
  const [aged65Older,       setAged65Older]       = React.useState(value?.aged_65_older || "");
  const [aged70Older,       setAged70Older]       = React.useState(value?.aged_70_older || "");

  React.useEffect(() => {
    if (didMount.current === true) {
      const timeOutObject = setTimeout(()=>{
        const nulled = (value) => value.length > 0 ? value : null; 
        onChange({
          iso_code: nulled(isoCode),
          location: nulled(location),
          continent: nulled(continent),
          population: nulled(population),
          population_density: nulled(populationDensity),
          median_age: nulled(medianAge),
          aged_65_older: nulled(aged65Older),
          aged_70_older: nulled(aged70Older)  
        })
      }, 500);
      return () => clearTimeout(timeOutObject);
    }
    didMount.current = true;
  }, [
    isoCode,
    location,
    continent,
    population,
    populationDensity,
    medianAge,
    aged65Older,
    aged70Older,
    onChange
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
 
  return (
    <>
      <Divider/><Box sx={{m:1}}><TextField value={isoCode} label="ISO code"  onChange={createStringChanger(setIsoCode)}/></Box>
      <Divider/><Box sx={{m:1}}><TextField value={location} label="Location"  onChange={createStringChanger(setLocation)}/></Box>
      <Divider/><Box sx={{m:1}}><TextField value={continent} label="Continent" onChange={createStringChanger(setContinent)}/></Box>
      <Divider/><IntRangeInput label="Population" value={splitIntRange(population)} onChange={createNumericChanger(setPopulation)}/>
      <Divider/><FloatRangeInput label="Density" value={splitFloatRange(populationDensity)} onChange={createNumericChanger(setPopulationDensity)}/>
      <Divider/><FloatRangeInput label="Median Age" value={splitFloatRange(medianAge)} onChange={createNumericChanger(setMedianAge)}/>
      <Divider/><FloatRangeInput label=">65 Age" value={splitFloatRange(aged65Older)} onChange={createNumericChanger(setAged65Older)}/>
      <Divider/><FloatRangeInput label=">70 Age" value={splitFloatRange(aged70Older)} onChange={createNumericChanger(setAged70Older)}/>
    </>
  )
}

const DataCountries = () => {
  const [openFilters, setOpenFilters] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [dataLength, setDataLength] = React.useState(0);
  const [order, setOrder] = React.useState("");
  const [orderBy, setOrderBy] = React.useState("");

  const [filters, setFilters] = React.useState({});

  const [countries, performCountriesFetch] = useFetch(DATA_COUNTRIES);

  React.useEffect(() => {
    performCountriesFetch();
  }, [performCountriesFetch])

  React.useEffect(() => {
    if (countries.data?.data) {
      setDataLength(countries.data.data.length);
    }
  }, [countries])

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
                {row[column.field]}
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
                  <Button variant="outlined" startIcon={<ReplayIcon/>} onClick={()=>{performCountriesFetch()}}>Перезагрузить</Button>
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
        <DataCountriesFilter value={filters} onChange={(value)=>{setFilters(value)}}/>
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
      <TableContainer>
        <Table size="medium">
          <Head order={order} orderBy={orderBy} onSort={handleOnSort}/>
          <Body
            rows={countries.data?.data?.slice(page * rowsPerPage, (page+1) * rowsPerPage)}
            loading={countries.loading}
            error={countries.error}
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

export default DataCountries
