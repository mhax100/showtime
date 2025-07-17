import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Button, Switch, Field, Label } from "@headlessui/react";
import { fetchEventByID } from "../api/events";
import { fetchAvailabilitiesByID } from "../api/availabilities";
import type { Event } from "../types/event";
import type { Availability } from "../types/availability";
import type { User } from "../types/user";
import type { Showtime } from "../types/showtime";
import Calendar from "../components/Calendar/Calendar";
import ShowtimeList from "../components/ShowtimeList";
import AvailabilitySideBar from "../components/AvailabilitySidebar";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import AvailabilitySubmissionModal from "../components/AvailabilitySubmissionModal";
import { fetchUserByID } from "../api/users";
import { fetchShowtimesByID } from "../api/showtimes";

function EventPage() {
    const { eventID } = useParams();

    if (!eventID) {
        throw new Error("eventID param is required.");
    }

    const [event, setEvent] = useState<Event | null>(null);
    const [availabilities, setAvailabilities] = useState<Availability[]>([]);
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [loading, setLoading] = useState(true);
    const [selectedTimes, setSelectedTimes] = useState<Date[]>([])
    const [mode, setMode] = useState<'edit' | 'summary'>('summary')
    const [copied, setCopied] = useState(false)
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
    const [summaryMode, setSummaryMode] = useState(false)

    useEffect(() => {
        async function getEvent() {
            try {
                if (!eventID) {
                    return <p>No event selected.</p>;
                }
                const data = await fetchEventByID(eventID)
                setEvent(data)
            } catch (err) {
                console.error('Error fetching event:', err);
            } finally {
                setLoading(false);
            }
        }

        if (eventID) {
            getEvent();
        }

    }, [eventID]);

    useEffect(() => {
        let isMounted = true;

        async function getShowtimes() {
            try {
                if (!eventID) return;
                const data = await fetchShowtimesByID(eventID);

                if (isMounted && data.showtimes.length > 0) {
                    setShowtimes((prevShowtimes) => {
                        const merged = [...prevShowtimes]

                        data.showtimes.forEach((showtime) => {
                            const index = merged.findIndex((a) => a.id === showtime.id);
                            if (index !== -1) {
                                merged[index] = showtime; // Replace if already present
                            } else {
                                merged.push(showtime); // Append if new
                            }
                        })
                        
                        return merged
                    })
                }
            } catch (err) {
                console.error('Error fetching availabilities for event:', err);
            }
        }

        async function getAvailabilities() {
            try {
                if (!eventID) return;
                const data = await fetchAvailabilitiesByID(eventID);
                if (isMounted && data.length > 0) {
                    setAvailabilities((prevAvailabilities) => {
                        const merged = [...prevAvailabilities]

                        data.forEach((availability) => {
                            const index = merged.findIndex((a) => a.user_id === availability.user_id);
                            if (index !== -1) {
                                merged[index] = availability; // Replace if already present
                            } else {
                                merged.push(availability); // Append if new
                            }
                        })
                        
                        return merged
                    })


                    const newUsers = await Promise.all(
                        data.map((availability) => fetchUserByID(availability.user_id))
                    );
                    setUsers((prevUsers) => {
                        const merged = [...prevUsers];
                    
                        newUsers.forEach((user) => {
                            const index = merged.findIndex((u) => u.id === user.id);
                            if (index !== -1) {
                                merged[index] = user; // Replace if already present
                            } else {
                                merged.push(user); // Append if new
                            }
                        });
                    
                        return merged;
                    });

                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching availabilities for event:', err);
            }
        }

        // Fetch immediately
        getAvailabilities();
        getShowtimes();

        // Poll every 10 seconds
        const interval = setInterval(getAvailabilities, 10000);
        const interval2 = setInterval(getShowtimes, 10000);

        // Cleanup
        return () => {
            isMounted = false;
            clearInterval(interval);
            clearInterval(interval2)
        };
    }, [eventID])

      

    if (loading) return <p>Loading event...</p>;
    if (!event) return <p>Event not found</p>;
    
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
                key={isSubmissionModalOpen ? 'open' : 'closed'}
                isOpen={isSubmissionModalOpen} 
                onClose={
                    () => {
                        setMode('summary')
                        setSelectedTimes([])
                        setIsSubmissionModalOpen(false)
                    }
                }
                selectedTimes={selectedTimes}    
                eventID={eventID}
            />
            <div className='flex items-center justify-between w-full p-4 py-2'>
                <div className='flex flex-col items-baseline'>
                    <h3 className='text-4xl font-light text-text-primary'>{event.title}</h3>
                    <p className='text-lg font-light text-text-secondary'>{event.location}</p>
                    <p className='text-lg font-light text-text-secondary'>{formatDateRanges(event.potential_dates)}</p>
                </div>
                <div className='flex gap-3 ml-auto'>
                    <Field className='flex items-center border-b border-primary'>
                        <Label className='px-2 py-2 text-primary'>Summary View</Label>
                        <Switch
                            checked={summaryMode}
                            onChange={setSummaryMode}
                            className="inline-flex items-center h-6 mx-2 transition rounded-full bg-surface group w-11 data-checked:bg-primary"
                        >
                            <span className="transition translate-x-1 rounded-full bg-background size-4 group-data-checked:translate-x-6" />
                        </Switch>
                    </Field>
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
            <div className='flex flex-col items-start w-full gap-4 p-4 md:flex-row'>
                <div className='w-5/6 h-full'>
                {
                    summaryMode ? <ShowtimeList showtimes={showtimes}/> : 
                    <Calendar 
                        dates={(event.potential_dates ?? []).map((d: string) => new Date(d))}
                        selectedTimes={selectedTimes}
                        setSelectedTimes={setSelectedTimes}
                        mode={mode}
                        availabilityData={{}}    
                    />
                }
                </div>
                <AvailabilitySideBar userData={users} onAddClick={onAddClick} />
            </div>
        </div>
    )
}

export default EventPage;