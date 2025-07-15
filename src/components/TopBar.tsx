import React from 'react';
import { Button } from '@headlessui/react';
import SvgComponent from './ShowtimeLogoOutline';
import { useNavigate } from "react-router-dom";

type TopBarProps = {
    handleCreateShowtimeClick: () => void
}

const TopBar: React.FC<TopBarProps> = ({handleCreateShowtimeClick}) => {
    const navigate = useNavigate()
    return (
        <div className='flex items-center justify-between w-full p-4 pl-10 pr-10 mx-auto bg-background'>
            <div>
                <Button 
                    onClick={() => navigate('/home')}
                    className='flex items-center gap-2 text-2xl text-text-primary'>
                    <SvgComponent className='size-10'/> showtime
                </Button>
            </div>
            <div className='flex justify-between gap-8'>
                <Button 
                    onClick={handleCreateShowtimeClick}
                    className='items-center gap-2 text-l data-hover:text-primary-soft text-text-primary'>
                    Create a showtime
                </Button>
                <Button className='items-center gap-2 text-l data-hover:text-primary-soft text-text-primary'>
                    Give feedback
                </Button>
                <Button className='items-center gap-2 text-l data-hover:text-primary-soft text-text-primary'>
                    Sign in
                </Button>
            </div>

        </div>
    );
};

export default TopBar;