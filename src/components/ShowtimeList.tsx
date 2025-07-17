import React from "react"
import type { Showtime } from "../types/showtime"


type ShowtimeListProps  = {
    showtimes: Showtime[]
}

const ShowtimeList: React.FC<ShowtimeListProps> = ({showtimes}) => {

    return (
        <div className='flex flex-col items-start justify-around h-full overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden'>
            {showtimes.map(showtime => {
                return (
                    <div>{showtime.start_time}</div>
                )
            })}
        </div>
    )
}

export default ShowtimeList