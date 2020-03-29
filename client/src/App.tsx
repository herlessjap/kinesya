import React from 'react';
import Header from './views/Header';
import { CssBaseline } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Main from './views/Main';
import axios from 'axios';

let sections: {title: string, url: string} [] = [
  {title : "Login" , url : "#"},
  {title : "Clients", url : "#"},
  {title : "About", url : "#"}
]

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

export default function App() {
  
  return (
    <React.Fragment>
      <CssBaseline>
      <Container maxWidth="lg">
        <Header title="PK" sections={sections}></Header>
        <main>
          <Main></Main>
        </main>
    </Container>
    </CssBaseline>
    </React.Fragment>
  );
}
