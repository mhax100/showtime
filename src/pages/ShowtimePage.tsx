import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@headlessui/react";
import { fetchShowtimeByID } from "../api/showtime";
import type { Showtime } from "../types/showtime";
import TimeTable from "../components/Calendar/Calendar";
import AvailabilitySideBar from "../components/AvailabilitySidebar";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import AvailabilitySubmissionModal from "../components/AvailabilitySubmissionModal";

function ShowtimePage() {
    const { showtimeID } = useParams();
    const [showtime, setShowtime] = useState<Showtime | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimes, setSelectedTimes] = useState<Date[]>([])
    const [numResponses] = useState(0)
    const [mode, setMode] = useState<'edit' | 'summary'>('summary')
    const [copied, setCopied] = useState(false)
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)

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

    const handleCopyClick = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    }

    const handleCancelClick = () => {
        setMode('summary')
        setSelectedTimes([])
    }

    const handleSubmitClick = () => {
        setIsSubmissionModalOpen(true)
    }

    const formatDateRanges = (dates: string[]): string => {
        if (!dates || dates.length === 0) return '';
        
        const dateFormat = 'M/d';
        const sortedDates = dates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
        const ranges: string[] = [];
        let rangeStart = sortedDates[0];
        let rangeEnd = sortedDates[0];
        
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = sortedDates[i];
            const prevDate = sortedDates[i - 1];
            
            if (currentDate.getTime() - prevDate.getTime() === 24 * 60 * 60 * 1000) {
                rangeEnd = currentDate;
            } else {
                if (rangeStart.getTime() === rangeEnd.getTime()) {
                    ranges.push(format(rangeStart, dateFormat));
                } else {
                    ranges.push(`${format(rangeStart, dateFormat)} - ${format(rangeEnd, dateFormat)}`);
                }
                rangeStart = currentDate;
                rangeEnd = currentDate;
            }
        }
        
        if (rangeStart.getTime() === rangeEnd.getTime()) {
            ranges.push(format(rangeStart, dateFormat));
        } else {
            ranges.push(`${format(rangeStart, dateFormat)} - ${format(rangeEnd, dateFormat)}`);
        }
        
        return ranges.join(', ');
    };


    return (
        <div className="flex flex-col items-start justify-start h-full pl-6 pr-6 m-2">
            <AvailabilitySubmissionModal 
                isOpen={isSubmissionModalOpen} 
                onClose={() => setIsSubmissionModalOpen(false)}
                selectedTimes={selectedTimes}    
            />
            <div className='flex items-center justify-between w-full p-4 py-2'>
                <div className='flex flex-col items-baseline'>
                    <h3 className='text-4xl font-light text-text-primary'>{showtime.title}</h3>
                    <p className='text-lg font-light text-text-secondary'>{showtime.location}</p>
                    <p className='text-lg font-light text-text-secondary'>{formatDateRanges(showtime.potential_dates)}</p>
                </div>
                <div className='flex gap-3 ml-auto'>
                    <Button
                        onClick={handleCopyClick} 
                        className='px-4 py-2 border rounded-md text-primary border-primary hover:bg-primary/10'>
                        {copied ? 'Copied!' : (<div className='flex items-center gap-1'> Copy Link <DocumentDuplicateIcon className='size-5'/></div>)}
                    </Button>
                    {mode === 'edit' ? 
                        (
                            <div className='flex gap-1.5'>
                                <Button
                                    onClick={handleCancelClick} 
                                    className='px-4 py-2 border rounded-md border-primary-shift-red text-primary-shift-red bg-background hover:bg-primary-shift-red/10'>Cancel</Button>
                                <Button 
                                    onClick={handleSubmitClick}
                                    className='px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-soft'>Save</Button>
                            </div>
                        ):
                        (
                            <Button 
                                onClick={onAddClick}
                                className='px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-soft'
                            >
                                Add availability
                            </Button>
                        )
                    }
                    
                </div>
            </div>
            <div className='flex flex-col items-center w-full gap-4 p-4 md:flex-row'>
                <div className='w-5/6 h-full'>
                    <TimeTable 
                        dates={(showtime.potential_dates ?? []).map((d: string) => new Date(d))}
                        selectedTimes={selectedTimes}
                        setSelectedTimes={setSelectedTimes}
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