import { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import { format } from "date-fns";
import { Button, Switch, Field, Label } from "@headlessui/react";
import type { Event } from "../types/event";
import type { Availability, UserAvailability } from "../types/availability";
import type { User } from "../types/user";
import type { Showtime } from "../types/showtime";
import Calendar from "../components/Calendar/Calendar";
import ShowtimeList from "../components/ShowtimeList";
import AvailabilitySideBar from "../components/AvailabilitySidebar";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import AvailabilitySubmissionModal from "../components/AvailabilitySubmissionModal";

function EventPage() {
    const { eventID } = useParams();
    const loaderData = useLoaderData() as {
        event: Event;
        availabilities: UserAvailability[];
        showtimes: Showtime[];
        users: User[];
        availabilitySummary: Availability[];
    };

    if (!eventID) {
        throw new Error("eventID param is required.");
    }

    const [event, setEvent] = useState<Event | null>(loaderData.event);
    const [availabilities, setAvailabilities] = useState<Availability[]>(loaderData.availabilitySummary);
    const [showtimes, setShowtimes] = useState<Showtime[]>(loaderData.showtimes);
    const [users, setUsers] = useState<User[]>(loaderData.users);

    const [selectedTimes, setSelectedTimes] = useState<Date[]>([])
    const [mode, setMode] = useState<'edit' | 'summary'>('summary')
    const [copied, setCopied] = useState(false)
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false)
    const [summaryMode, setSummaryMode] = useState(false)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

    // Update state when loader data changes (after revalidation)
    useEffect(() => {
        setEvent(loaderData.event);
        setAvailabilities(loaderData.availabilitySummary);
        setShowtimes(loaderData.showtimes);
        setUsers(loaderData.users);
    }, [loaderData]);


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

    const handleUserSelectionChange = (userId: string, checked: boolean) => {
        setSelectedUserIds(prev => 
            checked 
                ? [...prev, userId]
                : prev.filter(id => id !== userId)
        )
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
                    summaryMode ? 
                    <ShowtimeList 
                        showtimes={showtimes}
                        selectedUsers={selectedUserIds}
                    /> : 
                    <Calendar 
                        dates={(event.potential_dates ?? []).map((d: string) => new Date(d))}
                        selectedTimes={selectedTimes}
                        setSelectedTimes={setSelectedTimes}
                        mode={mode}
                        availabilityData={availabilities}
                        selectedUsers={selectedUserIds}    
                    />
                }
                </div>
                <AvailabilitySideBar 
                    userData={users} 
                    onAddClick={onAddClick} 
                    selectedUserIds={selectedUserIds}
                    onUserSelectionChange={handleUserSelectionChange}
                />
            </div>
        </div>
    )
}

export default EventPage;