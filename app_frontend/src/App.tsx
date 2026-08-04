import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Story from './components/Story';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/story' element={<Story />} />
        </Routes>
    );
}

export default App;
