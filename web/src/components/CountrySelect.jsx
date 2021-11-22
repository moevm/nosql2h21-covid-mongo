import React from 'react';

import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import useFetch from 'hooks/useFetch';
import { COUNTRY_LIST } from 'api/endpoints';

const CountrySelect = ({value=null, onChange}) => {
  const [countries, performCountriesFetch] = useFetch(COUNTRY_LIST)

  React.useEffect(() => {
    performCountriesFetch();
  }, [performCountriesFetch])

  React.useEffect(() => {
    if (countries.error) {
      console.warn(countries.error);
      performCountriesFetch();
    }
  }, [countries, performCountriesFetch])

  const options = countries.data?.data || [];
  const dataNotLoaded = countries.data ? false : true;

  return (
    <Autocomplete
      value={value}
      sx={{width: 200}}
      options={options}
      autoHighlight
      getOptionLabel={(option) => option.location}
      renderOption={(props, option) => (
        <Box component="li"  {...props}>
          {option.location} ({option.iso_code})
        </Box>
      )}
      onChange={(event, newInputValue) => {onChange(newInputValue || null)}}
      loading={dataNotLoaded}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a country"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {dataNotLoaded ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  )
}

export default CountrySelect
