import { useState } from 'react';
import MovieFormModal from '../components/MovieForm/MovieFormModal';
import { Button } from '@headlessui/react';
import CalendarImage from '../assets/CalendarView.png';
import ListImage from '../assets/ListView.png';

function Home() {
    const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen">
            <div className="flex flex-col items-center justify-between gap-8 mt-15">
                <h1 className="text-3xl text-text-primary">Plan a movie night</h1>
                <h4 className="text-center text-text-secondary">Coordinate movies with friends without the back and forth. Confidently choose the best showtimes.</h4>
                <Button 
                    onClick={() => setIsMovieFormOpen(true)}
                    className='px-4 py-2 text-white rounded-md text-md sm:text-base bg-primary hover:bg-primary-soft'>
                    Create a Showtime
                </Button>
            </div>

            {/* Overlapping Image Section */}
            <div className="relative w-full mt-15 sm:mt-50">
                {/* Top black spacer */}
                <div className="h-40" />

                {/* Bottom colored background */}
                <div className="relative z-0 pb-10 pt-30 md:pt-80 bg-primary">
                    {/* Overlapping image */}
                    <img 
                    src={CalendarImage}
                    alt="Calendar View"
                    className="absolute z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-1/2"
                    />
                </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-8 mt-15">
                <h1 className="text-2xl text-text-primary">How it works</h1>
                <ol className="flex flex-col items-start gap-4 text-text-primary">
                    <li className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-center w-8 rounded-full aspect-square bg-primary ">
                            <h4 className="text-xl">1</h4>
                        </div>
                        <h4>Create a Showtime</h4>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-center w-8 rounded-full aspect-square bg-primary ">
                            <h4 className="text-xl">2</h4>
                        </div>
                        <h4>Share the link with your friends</h4>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-center w-8 rounded-full aspect-square bg-primary ">
                            <h4 className="text-xl">3</h4>
                        </div>
                        <h4>Collect availability data</h4>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                        <div className="flex items-center justify-center w-8 rounded-full aspect-square bg-primary ">
                            <h4 className="text-xl">4</h4>
                        </div>
                        <h4>Calculate the best showtime!</h4>
                    </li>
                </ol>
            </div>


            {/* Overlapping Image Section */}
            <div className="relative w-full mt-15 sm:mt-50">
                {/* Top black spacer */}
                <div className="h-40" />

                {/* Bottom colored background */}
                <div className="relative z-0 pb-10 pt-30 md:pt-80 bg-primary">
                    {/* Overlapping image */}
                    <img 
                    src={ListImage}
                    alt="Calendar View"
                    className="absolute z-10 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-1/2"
                    />
                </div>
            </div>

            <MovieFormModal 
                  isOpen={isMovieFormOpen} 
                  onClose={() => setIsMovieFormOpen(false)}
            />
        </div>
    )
}

export default Home