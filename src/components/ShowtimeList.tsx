import React from "react"
import type { Showtime } from "../types/showtime"
import { format } from 'date-fns'


type ShowtimeListProps  = {
    showtimes: Showtime[];
    selectedUsers: string[];
}

const ShowtimeList: React.FC<ShowtimeListProps> = ({showtimes, selectedUsers}) => {
    if (showtimes.length == 0) {
        return (
            <div className="flex items-center justify-center">
                <h1 className="text-4xl text-primary">Add user availabilities to see optimal showtimes.</h1>
            </div>
        )
    }
    
    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 75) return 'text-primary';
        if (pct >= 50) return 'text-primary-desaturated-1';
        if (pct >= 25) return 'text-primary-desaturated-2';
        return 'text-primary-desaturated-3';
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
        <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden gap-2'>
            {sortedShowtimes.map(showtime => {
                return (
                    <div className="flex-col w-full p-2 rounded-md bg-surface">
                        <div className="flex justify-between gap-2">
                            <h1 className="text-2xl text-text-primary">{format(new Date(showtime.start_time), "MMMM d - h:mmaaa")}</h1>
                            <h1 className={`text-2xl ${getAvailabilityShade(showtime.percentAvailable)}`}>{showtime.percentAvailable + "% available"}</h1>
                        </div>
                        <h1 className="text-2xl text-text-primary">{showtime.theater_name}</h1>
                        <h4 className="text-text-secondary">{showtime.theater_address}</h4>
                    </div>
                )
            })}
        </div>
    )
}

export default ShowtimeList