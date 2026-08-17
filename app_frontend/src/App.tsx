import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Story from './components/Story';
import Chat from './components/Chat';

function App() {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/story' element={<Story />} />
            <Route path='/chat' element={<Chat />} />
        </Routes>
    );
}

export default App;