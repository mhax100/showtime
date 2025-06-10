import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchShowtimeByID } from "../api/showtime";
import type { Showtime } from "../types/showtime";
import TimeTable from "../components/Calendar/Calendar";
import AvailabilitySideBar from "../components/AvailabilitySidebar";

function ShowtimePage() {
    const { showtimeID } = useParams();
    const [showtime, setShowtime] = useState<Showtime | null>(null);
    const [loading, setLoading] = useState(true);
    const [numResponses] = useState(0)
    const [mode, setMode] = useState<'edit' | 'summary'>('summary')

    useEffect(() => {
        async function getShowtime() {
            try {
                if (!showtimeID) {
                    return <p>No showtime selected.</p>;
                }
                const data = await fetchShowtimeByID(showtimeID)
                setShowtime(data)
            } catch (err) {
                console.error('Error fetching showtime:', err);
            } finally {
                setLoading(false);
            }
        }

        if (showtimeID) {
            getShowtime();
        }

    }, [showtimeID]);
      

    if (loading) return <p>Loading showtime...</p>;
    if (!showtime) return <p>Showtime not found</p>;
    
    const onAddClick = () => {
        setMode('edit');
    }


    return (
        <div className="flex flex-col items-start justify-start h-full pl-6 pr-6 m-2">
            <div className='flex flex-col items-baseline p-4 py-2'>
                <h3 className='text-4xl font-light text-text-primary'>{showtime.title}</h3>
                <h5 className='text-xl font-light text-text-secondary'>{showtime.location}</h5>
                <h5 className='text-xl font-light text-text-secondary'>{showtime.location}</h5>
            </div>
            <div className='flex flex-col items-center w-full gap-4 p-4 md:flex-row'>
                <div className='w-5/6 h-full'>
                    <TimeTable 
                        dates={(showtime.potential_dates ?? []).map((d: string) => new Date(d))}
                        mode={mode}
                        availabilityData={{}}    
                    />
                </div>
                <AvailabilitySideBar numResponses={numResponses} onAddClick={onAddClick} />
            </div>
        </div>
    )
}

export default ShowtimePage;