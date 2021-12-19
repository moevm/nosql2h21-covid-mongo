import React from 'react';

import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import FunctionsIcon from '@mui/icons-material/Functions';


const menuTooltip = "Функции аггрегации"

const AggregationMenu = ({items={}, onMenuClick=()=>{}}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const paperProps = {
    elevation: 0,
    sx: {
      overflow: 'visible',
      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
      mt: 1.5,
      '& .MuiAvatar-root': {
        width: 32,
        height: 32,
        ml: -0.5,
        mr: 1,
      },
      '&:before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 14,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
      },
    },
  }

  return (
    <>
      <Tooltip title={menuTooltip} sx={{position: "absolute", top: 16, right: 16}}>
        <Button variant="outlined" onClick={handleClick}>
          <FunctionsIcon/>
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={paperProps}
        transformOrigin={{horizontal: "right", vertical: "top"}}
        anchorOrigin={{horizontal: "right", vertical: "bottom"}}
      >
        {Object.entries(items).map(([key, value]) => <MenuItem onClick={() => {onMenuClick(key, value)}} key={key}>{value}</MenuItem>)}
      </Menu>
    </>
  )
}

export default AggregationMenu
