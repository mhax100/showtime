import { Outlet } from 'react-router-dom';
import TopBar from './components/TopBar';

const Layout = () => {
    return (
        <div className='flex flex-col min-h-screen bg-background'>
            <TopBar />
            <main className='flex-grow w-full'>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout;