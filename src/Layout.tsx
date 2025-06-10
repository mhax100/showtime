import { useState, useEffect } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import MovieFormModal from './components/MovieForm/MovieFormModal';

const Layout = () => {
    const [isMovieFormModalOpen, setIsMovieFormModalOpen] = useState(false)
    const navigation = useNavigation();
    const location = useLocation();
  
    // Close the modal when the navigation finishes and we're no longer on the page where the modal was opened
    useEffect(() => {
      if (navigation.state === 'idle') {
        setIsMovieFormModalOpen(false);
      }
    }, [navigation.state, location]);

    return (
        <div className='flex flex-col min-h-screen bg-background'>
            <TopBar handleCreateShowtimeClick={() => setIsMovieFormModalOpen(true)}/>
            <main className='flex-grow w-full'>
                <Outlet />
            </main>
            <MovieFormModal isOpen={isMovieFormModalOpen} onClose={() => setIsMovieFormModalOpen(false)} />
        </div>
    )
}

export default Layout;