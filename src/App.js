import React from 'react';
import Autocomplete from 'react-autocomplete';
import BootstrapTable from 'react-bootstrap-table-next';
import {Container, Button} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';


import TableGrid from './TableGrid.jsx';

import './App.css';

function App() {
  return (
    <div className="App">
      <Container fluid>
        <TableGrid/>
      </Container>
    </div>
  );
}

export default App;
