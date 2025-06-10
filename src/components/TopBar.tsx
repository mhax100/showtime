import React from 'react';
import { Button } from '@headlessui/react';
import SvgComponent from './ShowtimeLogoOutline';

const TopBar: React.FC = () => {

    return (
        <div className='flex items-center justify-between w-full p-4 pl-10 pr-10 mx-auto bg-background'>
            <div>
                <Button className='flex items-center gap-2 text-2xl text-text-primary'>
                    <SvgComponent className='size-10'/> showtime
                </Button>
            </div>
            <div className='flex justify-between gap-8'>
                <Button className='items-center gap-2 text-l text-text-primary'>
                    Create a showtime
                </Button>
                <Button className='items-center gap-2 text-l text-text-primary'>
                    Give feedback
                </Button>
                <Button className='items-center gap-2 text-l text-text-primary'>
                    Sign in
                </Button>
            </div>

        </div>
    );
};

export default TopBar;