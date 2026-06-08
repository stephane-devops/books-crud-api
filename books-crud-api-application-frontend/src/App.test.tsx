import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

jest.mock('swagger-ui-react', () => {
  return function MockSwaggerUI() {
    return <div data-testid="swagger-ui">Mocked Swagger UI</div>;
  };
});

test('renders SwaggerUI without crashing', () => {
  render(<App />);
});
