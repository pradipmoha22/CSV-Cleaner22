import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import UploadPage from './components/UploadPage';
import CleaningPage from './components/CleaningPage';
import ProcessingPage from './components/ProcessingPage';
import ResultsPage from './components/ResultsPage';
import ErrorPage from './components/ErrorPage';
import EmptyFilePage from './components/EmptyFilePage';
import './App.css';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<UploadPage />} />
                        <Route path="/clean" element={<CleaningPage />} />
                        <Route path="/processing/:jobId?" element={<ProcessingPage />} />
                        <Route path="/results/:jobId?" element={<ResultsPage />} />
                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="/empty-file" element={<EmptyFilePage />} />
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
}

export default App;