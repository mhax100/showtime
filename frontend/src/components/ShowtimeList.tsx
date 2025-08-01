import React from "react"
import type { Showtime } from "../types/showtime"
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'


type ShowtimeListProps  = {
    showtimes: Showtime[];
    selectedUsers: string[];
    eventTimezone: string;
}

const ShowtimeList: React.FC<ShowtimeListProps> = ({showtimes, selectedUsers, eventTimezone}) => {
    if (showtimes.length == 0) {
        return (
            <div className="flex items-center justify-center">
                <h1 className="text-3xl text-center text-primary-shift-red md:text-4xl">Add user availabilities to see optimal showtimes.</h1>
            </div>
        )
    }
    
    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 80) return 'text-primary';
        if (pct >= 60) return 'text-primary-desaturated-1';
        if (pct >= 40) return 'text-primary-desaturated-2';
        if (pct >= 20) return 'text-primary-desaturated-3';
        return 'text-primary-desaturated-4';
    }

    

    // Calculate percentages and sort in one chain
    const sortedShowtimes = showtimes
        .map(showtime => {
            let percentAvailable = showtime.availability_percentage;
            if (selectedUsers.length > 0) {
                const filteredAvailableUsers = showtime.available_users.filter(userID => selectedUsers.includes(userID));
                percentAvailable = Math.round((filteredAvailableUsers.length / selectedUsers.length) * 100);
            }
            return { ...showtime, percentAvailable };
        })
        .sort((a, b) => b.percentAvailable - a.percentAvailable); // Sort descending by availability

    return (
        <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden gap-2 '>
            {sortedShowtimes.map(showtime => {
                return (
                    <div className="flex-col w-full p-2 rounded-md bg-surface hover:bg-surface/50">
                        <div className="flex justify-between gap-2">
                            <h1 className="text-2xl text-text-primary">{format(toZonedTime(new Date(showtime.start_time), eventTimezone), "MMMM d - h:mmaaa")}</h1>
                            <h1 className={`text-2xl ${getAvailabilityShade(showtime.percentAvailable)}`}>{showtime.percentAvailable + "% available"}</h1>
                        </div>
                        <h1 className="text-xl text-text-primary">{showtime.theater_name}</h1>
                        <h4 className="text-text-secondary">{showtime.theater_address}</h4>
                    </div>
                )
            })}
        </div>
    )
}

export default ShowtimeList