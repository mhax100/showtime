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
        <div className='flex items-center justify-between w-full p-4 px-4 mx-auto overflow-x-hidden sm:px-6 md:px-10 bg-background'>
            <div className='flex items-center gap-2 shrink-0'>
                <Button 
                    onClick={() => navigate('/')}
                    className='flex items-center gap-2 text-xl sm:text-2xl text-text-primary'>
                    <SvgComponent className='size-8 sm:size-10'/>
                </Button>
                <h2 className="text-2xl text-text-primary">showtime</h2>
            </div>
            <div className='flex justify-between gap-2 sm:gap-4 md:gap-8'>
                <Button 
                    onClick={handleCreateShowtimeClick}
                    className='items-center gap-2 text-sm sm:text-base md:text-l data-hover:text-primary-soft text-text-primary whitespace-nowrap'>
                    Create a Showtime
                </Button>
            </div>

        </div>
    );
};

export default TopBar;