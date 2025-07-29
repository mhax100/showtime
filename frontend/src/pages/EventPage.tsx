import { useState, useEffect } from "react";
import { useParams, useLoaderData } from "react-router-dom";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Button, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
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
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
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
        const eventTimezone = event?.timezone || 'UTC';
        
        // Convert UTC dates to event timezone for display
        const sortedDates = dates
            .map(d => toZonedTime(new Date(d), eventTimezone))
            .sort((a, b) => a.getTime() - b.getTime());
        
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
        <div className="flex flex-col items-center justify-start h-full m-2 md:pl-6 md:pr-6 md:items-start">
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
                eventTimezone={event?.timezone || 'UTC'}
            />
            <div className='flex flex-col items-center justify-between w-full p-4 py-2 lg:flex-row lg:items-center'>
                <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
                    <h3 className='text-2xl font-light md:text-4xl text-text-primary'>{event.title}</h3>
                    <p className='text-lg font-light text-text-secondary'>{event.location}</p>
                    <p className='text-lg font-light text-text-secondary'>{formatDateRanges(event.potential_dates)}</p>
                </div>
                <div className='flex flex-col gap-3 mt-4 lg:mt-0 lg:ml-auto md:flex-row'>
                    <div className='flex gap-3'>
                        <Button
                            onClick={handleCopyClick} 
                            className='flex items-center gap-1 px-4 py-2 text-sm border rounded-md sm:text-base text-primary border-primary hover:bg-primary/10'>
                            {copied ? 'Copied!' : (<>Copy Link <DocumentDuplicateIcon className='size-4 sm:size-5'/></>)}
                        </Button>
                        {mode === 'edit' && selectedTabIndex === 0 ? 
                            (
                                <div className='flex gap-1.5'>
                                    <Button
                                        onClick={handleCancelClick} 
                                        className='px-4 py-2 text-sm border rounded-md sm:text-base border-primary-shift-red text-primary-shift-red bg-background hover:bg-primary-shift-red/10'>Cancel</Button>
                                    <Button 
                                        onClick={handleSubmitClick}
                                        className='px-4 py-2 text-sm text-white rounded-md sm:text-base bg-primary hover:bg-primary-soft'>Save</Button>
                                </div>
                            ):
                            (
                                <Button 
                                    onClick={onAddClick}
                                    className='px-4 py-2 text-sm text-white rounded-md sm:text-base bg-primary hover:bg-primary-soft'
                                >
                                    Add availability
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>
            <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex} className='w-full'>
                <TabList className='flex gap-1 p-1 mx-auto rounded-lg bg-surface w-fit md:mx-4'>
                    <Tab className='px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary data-[selected]:border-3 data-[selected]:border-primary md:data-[selected]:bg-primary data-[selected]:text-white data-[hover]:bg-surface-hover data-[selected]:data-[hover]:bg-primary-soft'>
                        Calendar View
                    </Tab>
                    <Tab className='px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary data-[selected]:border-3 data-[selected]:border-primary md:data-[selected]:bg-primary data-[selected]:text-white data-[hover]:bg-surface-hover data-[selected]:data-[hover]:bg-primary-soft'>
                        Showtimes List
                    </Tab>
                </TabList>
                <TabPanels className='flex flex-col items-center w-full gap-4 p-4 md:flex-row md:items-start'>
                    <div className='flex-shrink-0 w-full max-w-5xl md:w-5/6 md:max-w-none'>
                        <TabPanel>
                            <Calendar 
                                dates={(event.potential_dates ?? []).map((d: string) => toZonedTime(new Date(d), event?.timezone || 'UTC'))}
                                selectedTimes={selectedTimes}
                                setSelectedTimes={setSelectedTimes}
                                mode={mode}
                                availabilityData={availabilities}
                                selectedUsers={selectedUserIds}
                                eventTimezone={event?.timezone || 'UTC'}
                            />
                        </TabPanel>
                        <TabPanel>
                            <ShowtimeList 
                                showtimes={showtimes}
                                selectedUsers={selectedUserIds}
                                eventTimezone={event?.timezone || 'UTC'}
                            />
                        </TabPanel>
                    </div>
                    <AvailabilitySideBar 
                        userData={users} 
                        onAddClick={onAddClick} 
                        selectedUserIds={selectedUserIds}
                        onUserSelectionChange={handleUserSelectionChange}
                    />
                </TabPanels>
            </TabGroup>
        </div>
    )
}

export default EventPage;