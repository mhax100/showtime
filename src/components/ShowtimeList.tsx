import React from "react"
import type { Showtime } from "../types/showtime"
import { format } from 'date-fns'


type ShowtimeListProps  = {
    showtimes: Showtime[];
    selectedUsers: string[];
}

const ShowtimeList: React.FC<ShowtimeListProps> = ({showtimes, selectedUsers}) => {
    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 75) return 'text-primary';
        if (pct >= 50) return 'text-primary-desaturated-1';
        if (pct >= 25) return 'text-primary-desaturated-2';
        return 'text-primary-desaturated-3';
    }

    return (
        <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden gap-2'>
            {showtimes.map(showtime => {
                // the percent of people available for each movie is either the availability percentage in the case that selectedUsers length is 0
                // or it is
                // the showtimes availableUsers list filtered to only include selectedUsers / lengeth of selectedUsers
                let percentAvailable = showtime.availability_percentage
                if (selectedUsers.length > 0) {
                    const filteredAvailableUsers = showtime.available_users.filter(userID => selectedUsers.includes(userID))
                    percentAvailable = Math.round((filteredAvailableUsers.length / selectedUsers.length) * 100)
                }


                return (
                    <div className="flex-col w-full p-2 rounded-md bg-surface">
                        <div className="flex justify-between gap-2">
                            <h1 className="text-2xl text-text-primary">{format(new Date(showtime.start_time), "MMMM d - h:mmaaa")}</h1>
                            <h1 className={`text-2xl ${getAvailabilityShade(percentAvailable)}`}>{percentAvailable + "% available"}</h1>
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