import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FrontPage from './FrontPage';
import FileUpload from './FileUpload';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route exact path="/" element={<FrontPage/>} />
          <Route exact path="/file-upload" element={<FileUpload/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
