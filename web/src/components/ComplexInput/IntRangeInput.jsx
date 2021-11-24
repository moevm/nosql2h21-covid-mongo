import React from 'react'

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';

const IntRangeInput = ({label="", value={from: null, to: null}, onChange}) => {
  onChange = onChange || (() => {})

  const [state, setState] = React.useState({
    from: null,
    to: null,
    ...value
  })

  React.useEffect(() => {
    onChange(state)
  }, [state, onChange])

  const handleFromChange = (event) => {
    const newValue = {from: event.target.value.replace(/[^0-9]/g, ""), to: state.to}
    setState(newValue)
  }

  const handleToChange = (event) => {
    const newValue = {from: state.from, to: event.target.value.replace(/[^0-9]/g, "")}
    setState(newValue)
  }

  return (
    <Box sx={{display: "flex", alignItems: "center"}}>
      <List subheader={<ListSubheader>{label}</ListSubheader>} sx={{width: "100%"}}>
        <ListItem>
          <TextField
            fullWidth
            value={state.from || ""}
            label="От"
            onChange={handleFromChange}
          />
        </ListItem>
        <ListItem>
          <TextField
            fullWidth
            value={state.to || ""}
            label="До"
            onChange={handleToChange}
          />
        </ListItem>
      </List>
    </Box>
  )
}

export default IntRangeInput
