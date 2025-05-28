//This is your root component.It wraps your entire app into one
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import InteractionPage from './pages/InteractionPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/interactions" replace />} />
            <Route path="/interactions" element={<InteractionPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;