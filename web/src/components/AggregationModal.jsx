import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

import {format} from 'date-fns';


const useStyles = makeStyles((theme) => ({
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}))

const AggregationModal = ({header="Lorem ipsum dolor sit amet consectetur adipisicing elit.", datePeriod={from: null, to: null}, fetchState, open=false, onClose=()=>{}}) => {
  const classes = useStyles();

  const from = (datePeriod.from && format(datePeriod.from, "dd.MM.yyy")) || "начала пандемии";
  const to = (datePeriod.to && format(datePeriod.to, "dd.MM.yyy")) || "последнего дня наблюдений";

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{timeout: 500}}
    >
      <Fade in={open}>
        <Card className={classes.modal} sx={{minWidth: 300}}>
          <CardContent>
            <Typography variant="h4" component="div" align="center">{header}</Typography>
            <Typography variant="h5" component="div" align="center">{`За период с ${from} до ${to}`}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={()=>{onClose()}}>Закрыть</Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  )

}

export default AggregationModal
