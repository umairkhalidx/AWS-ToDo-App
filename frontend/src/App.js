import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [rdsTables, setRdsTables] = useState([]);
  const [s3Files, setS3Files] = useState([]);
  const [backendUrl, setBackendUrl] = useState('http://15.206.233.210:5000');

  const fetchRdsTables = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/rds-tables`);
      setRdsTables(res.data.tables);
    } catch (err) {
      alert(`RDS Error: ${err.message}`);
    }
  };

  const fetchS3Files = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/s3-files`);
      setS3Files(res.data.files);
    } catch (err) {
      alert(`S3 Error: ${err.message}`);
    }
  };

  return (
    <div className="App">
      <h1>AWS Infrastructure Tester</h1>
      <div>
        <input 
          type="text" 
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          placeholder="Backend URL (http://15.206.233.210:5000)"
        />
      </div>
      <div className="buttons">
        <button onClick={fetchRdsTables}>Fetch RDS Tables</button>
        <button onClick={fetchS3Files}>Fetch S3 Files</button>
      </div>
      <div className="results">
        <h2>RDS Tables:</h2>
        <ul>{rdsTables.map((table, i) => <li key={i}>{table}</li>)}</ul>
        <h2>S3 Files:</h2>
        <ul>{s3Files.map((file, i) => <li key={i}>{file}</li>)}</ul>
      </div>
    </div>
  );
}

export default App;