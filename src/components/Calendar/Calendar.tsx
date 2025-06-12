import { Button } from '@headlessui/react'
import { getMinutes, addMinutes, isWeekend, isBefore, format, isSameMinute, isSameDay } from 'date-fns'
import { useState, useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import useMaxVisibleDays from '../../hooks/useMaxVisibleDays'
import CalendarCell from './CalendarCell'

type TimeTableProps = {
    dates: Date[]
    selectedTimes: Date[]
    setSelectedTimes: React.Dispatch<React.SetStateAction<Date[]>>
    mode: 'edit' | 'summary'
    availabilityData?: Record<string, number>
}

const TimeTable: React.FC<TimeTableProps> = ({ dates, selectedTimes, setSelectedTimes, mode, availabilityData }) => {
    const [startIndex, setStartIndex] = useState(0)
    const maxVisibleDays = useMaxVisibleDays()
    const visibleDates = dates.slice(startIndex, startIndex + maxVisibleDays)


    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7'
      }[Math.min(dates.length, maxVisibleDays)] || 'grid-cols-1';

    const cellHeightClasses = "h-4 sm:h-4 md:h-5 lg:h-6 xl:h-7"; 

    const isDragging = useRef(false)
    const dragStart = useRef<{row: number, col: number} | null>(null)
    const dragIntent = useRef<'add' | 'remove' | null>(null)
    const didDrag = useRef(false)
    
    const handleMouseDown = (rowIndex: number, colIndex: number) => {
        isDragging.current = true
        dragStart.current = { row: rowIndex, col: colIndex }
        const startDate = getDateFromPos(rowIndex, colIndex)
        dragIntent.current = selectedTimes.some(time => isSameMinute(time, startDate) && isSameDay(time, startDate)) ? 'remove' : 'add'
        updateSelection(rowIndex, colIndex)
    }

    const handleMouseEnter = (rowIndex: number, colIndex: number) => {
        if (isDragging.current && dragStart.current) {
            didDrag.current = true
            updateSelection(rowIndex, colIndex)
        }
    }

    const handleMouseUp = () => {
        isDragging.current = false
        dragStart.current = null
        dragIntent.current = null
        didDrag.current = false
    }

    const getDateFromPos = (rowIndex: number, colIndex: number) => {
        const date = dates[colIndex]
        const newDate = new Date(date)

        newDate.setHours(9, 0, 0, 0)
        newDate.setMinutes(rowIndex * 30)

        return newDate
    }

    const updateSelection = (endRow: number, endCol: number) => {
        if (!dragStart.current) return;
        if (!dragIntent.current) return;

        if (!didDrag) {
            handleTimeClick(getDateFromPos(endRow, endCol))
            return
        }

        const startRow = dragStart.current.row
        const startCol = dragStart.current.col

        const rowMin = Math.min(startRow, endRow);
        const rowMax = Math.max(startRow, endRow);
        const colMin = Math.min(startCol, endCol);
        const colMax = Math.max(startCol, endCol);

        const newDatesSet = new Set<string>();
        for (let col = colMin; col <= colMax; col++) {
            for (let row = rowMin; row <= rowMax; row++) {
                const date = getDateFromPos(row, col);
                newDatesSet.add(date.toISOString());
            }
        }

        setSelectedTimes((prev) => {
            const existing = prev || [];

            if (dragIntent.current === 'add') {
                // Combine and deduplicate
                const combined = [...existing, ...Array.from(newDatesSet, iso => new Date(iso))];
                const unique = Array.from(
                    new Map(combined.map(d => [d.toISOString(), d])).values()
                );
                return unique;
            } else {
                // Filter out anything in newDatesSet
                return existing.filter(
                    time => !newDatesSet.has(time.toISOString())
                );
            }
        });
/*
        for (let col = colMin; col <= colMax; col++) {
            for (let row = rowMin; row <= rowMax; row++) {
                const date = getDateFromPos(row, col)
                if (dragIntent.current == 'add') {
                    setSelectedTimes((prev) => {
                        const times = prev || []
                        return [...times, date]
                    })
                } else {
                    setSelectedTimes((prev) => {
                        const times = prev || []
                        return times.filter(time => !(isSameMinute(time, date) && isSameDay(time, date)))
                    })
                }
            }
        }
*/
    }

    const handleTimeClick = (currentTime: Date) => {
        setSelectedTimes((prev) => {
            const times = prev || []
            const exists = selectedTimes.some(time => isSameMinute(currentTime, time) && isSameDay(currentTime, time))

            if (exists) {
                return times.filter(time => !isSameMinute(time, currentTime))
            } else {
                return [...times, currentTime].sort((a, b) => a.getTime() - b.getTime())
            }
        })
    }



    const renderDay = (date: Date, colIndex: number) => {
        const start = new Date(date)
        const end = new Date(date)

        start.setHours(9, 0, 0, 0);
        end.setHours(24, 0, 0, 0);

        const disabledCutoff = new Date(date).setHours(isWeekend(date) ? 9 : 17, 0, 0, 0)

        const day = []

        let currentTime = start
        let rowIndex = 0
        while (isBefore(currentTime, end)) {
            const row = rowIndex
            const currentTimeCopy = currentTime
            const isSelected = selectedTimes && selectedTimes.some(time => isSameMinute(currentTimeCopy, time) && isSameDay(currentTimeCopy, time))
            const isDisabled = isBefore(currentTimeCopy, disabledCutoff)
            const isHalfHour = getMinutes(currentTimeCopy) == 30

            day.push(
                <CalendarCell
                    key={currentTimeCopy.toISOString()}
                    date={currentTimeCopy}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    isHalfHour={isHalfHour}
                    mode={mode}
                    availabilityPercentage={mode === 'summary' ? availabilityData?.[currentTimeCopy.toISOString()] : undefined}
                    onMouseDown={() => handleMouseDown(row, colIndex)}
                    onMouseEnter={() => handleMouseEnter(row, colIndex)}
                />    
            )

            currentTime = addMinutes(currentTime, 30)
            rowIndex += 1
        }

        return (
            <div className='grid grid-cols-1'>{day}</div>
        )
    }

    const renderHeader = (date: Date) => {
        return (
            <div className='h-16 text-center'>
                <h3 className='text-med text-text-secondary'>{format(date, 'EEE')}</h3>
                <h2 className='text-2xl text-text-secondary' key={date.toISOString()}>{format(date, 'd')}</h2>
            </div>
        )
    }

    const renderTimeStamps = () => {
        const start = new Date()
        start.setHours(9, 0, 0, 0)
        const end = new Date()
        end.setHours(24, 0, 0, 0)
        const stamps = []

        let time = start

        
        while (isBefore(time, end)) {
            const timeCopy = time

            stamps.push(
                    <h2 
                        key={timeCopy.toISOString()}
                        className={`${cellHeightClasses} text-sm text-text-secondary`}>{format(timeCopy, 'h a')}</h2>
            )
            stamps.push(<div className={`${cellHeightClasses}`}></div>)

            time = addMinutes(time, 60)
        }

        return (
            <div className='grid h-full grid-rows-30 min-w-12'>
                {stamps}
            </div>
        )
    }

    const renderPeriod = (curDates: Date[]) => {
        return (
            <div className='flex'>
                <div className={`w-full`}>
                    <div className='flex items-center'>
                        <div className='w-12 text-center'>
                            <Button
                                onClick={() => setStartIndex(prev => Math.max(0, prev - maxVisibleDays))}
                                disabled={startIndex == 0} 
                                className='text-center disabled:opacity-0'>
                                <ChevronLeftIcon className='size-10 text-text-primary'/>
                            </Button>
                        </div>
                        <div
                            onMouseLeave={handleMouseUp}
                            onMouseUp={handleMouseUp} 
                            className={`grid ${gridColsClass} w-full`}>
                            {curDates.map((date: Date) => 
                                <div key={date.toISOString()} className='flex flex-col'>
                                    {renderHeader(date)}
                                </div>
                            )}
                        </div>
                        <div className='w-12 text-center'>
                            <Button
                                onClick={() => setStartIndex(prev => Math.min(dates.length - maxVisibleDays, prev + maxVisibleDays))}
                                disabled={dates.length - maxVisibleDays <= startIndex}
                                className='text-center disabled:opacity-0'>
                                <ChevronRightIcon className='size-10 text-text-primary'/>
                            </Button>
                        </div>
                    </div>
                    <div className='flex flex-grow overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden'>
                        <div className="w-12 h-full">
                            {renderTimeStamps()}
                        </div>
                        <div
                            onMouseLeave={handleMouseUp}
                            onMouseUp={handleMouseUp} 
                            className={`grid ${gridColsClass} w-full`}>
                            {curDates.map((date: Date, index: number) => {
                                const calculatedIndex = index + startIndex
                                return (
                                    <div key={date.toISOString()} className='flex flex-col'>
                                        {renderDay(date, calculatedIndex)}
                                    </div>
                                )
                            }
                            )}
                        </div>
                        <div className='w-12'></div>
                    </div>
                </div>
            </div>
            
        )
    }

    return (
        <div className='flex flex-col w-full select-none'>
            {renderPeriod(visibleDates)}
        </div>
        
    )
}

export default TimeTable;