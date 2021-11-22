import React from 'react';
import { Routes, Route, Link} from 'react-router-dom';

import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ShowChartIcon from '@mui/icons-material/ShowChart';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import StorageIcon from '@mui/icons-material/Storage';

import Header from 'components/Header';
import Stats from 'pages/Stats';
import StatsCompare from 'pages/StatsCompare';
import DensityStats from 'pages/DensityStats';
import Data from 'pages/Data';
import NotFound from 'pages/NotFound';

const app_title = "Статистика COVID-19";

const ListItemWithIcon = ({icon, text, link, ...other}) => {
  const IconComponent = icon
  return (
    <ListItemButton component={Link} to={link} {...other}>
      <ListItemIcon>
        <IconComponent/>
      </ListItemIcon>
      <ListItemText primary={text}/>
    </ListItemButton>
  )
}

const pages = {
    stats:        {link: "/", title: "Заболеваемость и вакцинация"},
    statsCompare: {link: "/compare-stats", title: "Сравнение стран"},
    densityStats: {link: "/density-stats", title: "Заболевания и плотность населения"},
    data:         {link: "/data", title: "База данных"},
}

function App() {
  const initialPage = Object.values(pages).find(page => page.link === window.location.pathname)
  
  const [currentPage, setCurrentPage] = React.useState(initialPage?.title);

  console.log(currentPage)

  return (
    <>
      <Header title={app_title} subtitle={currentPage}>
        <List>
          <ListItemWithIcon icon={ShowChartIcon}         onClick={() => {setCurrentPage(pages.stats.title)}}        text={pages.stats.title}        link={pages.stats.link}/>
          <ListItemWithIcon icon={StackedLineChartIcon}  onClick={() => {setCurrentPage(pages.statsCompare.title)}} text={pages.statsCompare.title} link={pages.statsCompare.link}/>
          <ListItemWithIcon icon={QueryStatsRoundedIcon} onClick={() => {setCurrentPage(pages.densityStats.title)}} text={pages.densityStats.title} link={pages.densityStats.link}/>
          <ListItemWithIcon icon={StorageIcon}           onClick={() => {setCurrentPage(pages.data.title)}}         text={pages.data.title}         link={pages.data.link}/>
        </List>
      </Header>
      <Container maxWidth="lg">
        <Routes>
          <Route path={pages.stats.link} element={<Stats/>}/>
          <Route path={pages.statsCompare.link} element={<StatsCompare/>}/>
          <Route path={pages.densityStats.link} element={<DensityStats/>}/>
          <Route path={pages.data.link} element={<Data/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Container>
    </>
  );
}

export default App;
