import React, {useState} from "react"
import type { Showtime } from "../types/showtime"
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Checkbox } from "@headlessui/react"


type ShowtimeListProps  = {
    showtimes: Showtime[];
    selectedUsers: string[];
    eventTimezone: string;
}

const ShowtimeList: React.FC<ShowtimeListProps> = ({showtimes, selectedUsers, eventTimezone}) => {
    const [selectedFormats, setSelectedFormats] = useState<string[]>([])

    if (showtimes.length == 0) {
        return (
            <div className="flex items-center justify-center">
                <h1 className="text-3xl text-center text-primary-shift-red md:text-4xl">Add user availabilities to see optimal showtimes.</h1>
            </div>
        )
    }

    const handleFormatSelectionChange = (selectedFormat: string, checked: boolean) => {
        setSelectedFormats(prev => 
            checked 
                ? [...prev, selectedFormat]
                : prev.filter(format => format !== selectedFormat)
        )
    }
    
    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 80) return 'text-primary';
        if (pct >= 60) return 'text-primary-desaturated-1';
        if (pct >= 40) return 'text-primary-desaturated-2';
        if (pct >= 20) return 'text-primary-desaturated-3';
        return 'text-primary-desaturated-4';
    }

    
    const formats:string[] = []

    // Calculate percentages and sort in one chain
    const sortedShowtimes = showtimes
        .map(showtime => {
            let percentAvailable = showtime.availability_percentage;
            if (selectedUsers.length > 0) {
                const filteredAvailableUsers = showtime.available_users.filter(userID => selectedUsers.includes(userID));
                percentAvailable = Math.round((filteredAvailableUsers.length / selectedUsers.length) * 100);
            }
            const format = showtime.showing_type
            if (!formats.includes(format)) {
                formats.push(format)
            }
            return { ...showtime, percentAvailable };
        })
        .filter(showtime => {
            // If no formats are selected, show all showtimes
            if (selectedFormats.length === 0) return true;
            // Otherwise, only show showtimes that match selected formats
            return selectedFormats.includes(showtime.showing_type);
        })
        .sort((a, b) => b.percentAvailable - a.percentAvailable); // Sort descending by availability

    return (
        <div className="flex flex-col gap-5">
            <div className='flex justify-around md:justify-start md:gap-3'>
                {formats.map(format => {
                    return (
                    <Checkbox 
                        checked={selectedFormats.includes(format)}
                        onChange={(isChecked) => handleFormatSelectionChange(format, isChecked)}
                        className='flex items-center gap-1 px-2 py-1 text-sm border rounded-md sm:text-base text-text-secondary border-text-secondary hover:bg-surface hover:cursor-pointer data-checked:text-primary data-checked:border-primary'
                    >
                        {format}
                    </ Checkbox>
                    )
                })}
            </div>
            <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden gap-2 '>
                {sortedShowtimes.map(showtime => {
                    return (
                        <div className="flex-col w-full p-2 rounded-md bg-surface hover:bg-surface/50">
                            <div className="flex justify-between gap-2">
                                <h1 className="text-xl md:text-2xl text-text-primary">{format(toZonedTime(new Date(showtime.start_time), eventTimezone), "MMMM d - h:mmaaa")}</h1>
                                <h1 className={`text-xl md:text-2xl ${getAvailabilityShade(showtime.percentAvailable)}`}>{showtime.percentAvailable + "% available"}</h1>
                            </div>
                            <h1 className="text-xl text-text-primary">{showtime.theater_name}</h1>
                            <h4 className="text-text-secondary">{showtime.theater_address}</h4>
                            <h4 className="text-text-secondary">{"Format: " + showtime.showing_type}</h4>
                        </div>
                    )
                })}
            </div>
        </div>  
    )    
}

export default ShowtimeList