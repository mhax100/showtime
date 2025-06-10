import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './components/TopBar';
import MovieFormModal from './components/MovieForm/MovieFormModal';

const Layout = () => {
    const [isMovieFormModalOpen, setisMovieFormModalOpen] = useState(false)

    return (
        <div className='flex flex-col min-h-screen bg-background'>
            <TopBar handleCreateShowtimeClick={() => setisMovieFormModalOpen(true)}/>
            <main className='flex-grow w-full'>
                <Outlet />
            </main>
            <MovieFormModal isOpen={isMovieFormModalOpen} onClose={() => setisMovieFormModalOpen(false)} />
        </div>
    )
}

export default Layout;