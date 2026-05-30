import React from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import spec from "./swagger.json";

function App() {
  return (
    <div className="App">
      <SwaggerUI spec={spec} />
    </div>
  );
}

export default App;
