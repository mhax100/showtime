import { Button } from '@headlessui/react'
import { getMinutes, addMinutes, isBefore, format, isSameMinute, isSameDay } from 'date-fns'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import useMaxVisibleDays from '../../hooks/useMaxVisibleDays'
import CalendarCell from './CalendarCell'
import { CELL_HEIGHT_CLASSES } from '../../constants/layout'
import type { Availability } from '../../types/availability'

type CalendarProps = {
    dates: Date[];
    selectedTimes: Date[];
    setSelectedTimes: React.Dispatch<React.SetStateAction<Date[]>>;
    mode: 'edit' | 'summary';
    availabilityData: Availability[];
    selectedUsers: string[];
}

const Calendar: React.FC<CalendarProps> = ({ dates, selectedTimes, setSelectedTimes, mode, availabilityData, selectedUsers }) => {
    const [startIndex, setStartIndex] = useState(0)
    const maxVisibleDays = useMaxVisibleDays()
    const visibleDates = dates.slice(startIndex, startIndex + maxVisibleDays)

    // Calculate percentages and sort in one chain
    const filteredAvailabilities = availabilityData
        .map(timeslot => {
            let percentAvailable = timeslot.availability_pct;
            if (selectedUsers.length > 0 && timeslot.available_user_ids) {
                const filteredAvailableUsers = timeslot.available_user_ids.filter(userID => selectedUsers.includes(userID));
                percentAvailable = Math.round((filteredAvailableUsers.length / selectedUsers.length) * 100);
            }
            return { ...timeslot, percentAvailable };
        })
    
    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7'
      }[Math.min(dates.length, maxVisibleDays)] || 'grid-cols-1';

    const isDragging = useRef(false)
    const dragStart = useRef<{row: number, col: number} | null>(null)
    const dragIntent = useRef<'add' | 'remove' | null>(null)
    const didDrag = useRef(false)

    // Prevent scrolling during touch drag
    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            if (isDragging.current) {
                e.preventDefault()
            }
        }

        // Add with passive: false to allow preventDefault
        document.addEventListener('touchmove', preventScroll, { passive: false })
        
        return () => {
            document.removeEventListener('touchmove', preventScroll)
        }
    }, [])
    
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

    const handleTouchStart = (e: React.TouchEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault() // Prevent scrolling
        isDragging.current = true
        dragStart.current = { row: rowIndex, col: colIndex }
        didDrag.current = false // Reset drag flag
        const startDate = getDateFromPos(rowIndex, colIndex)
        const isCurrentlySelected = selectedTimes.some(time => isSameMinute(time, startDate) && isSameDay(time, startDate))
        dragIntent.current = isCurrentlySelected ? 'remove' : 'add'
        // Apply intent to starting cell immediately
        updateSelection(rowIndex, colIndex)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault() // Prevent scrolling
        if (!isDragging.current || !dragStart.current) return

        const touch = e.touches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        if (element) {
            const cellElement = element.closest('[data-row][data-col]')
            if (cellElement) {
                const row = parseInt(cellElement.getAttribute('data-row') || '0')
                const col = parseInt(cellElement.getAttribute('data-col') || '0')
                didDrag.current = true
                updateSelection(row, col)
            }
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault()
        if (!isDragging.current || !dragStart.current) return
        
        // Reset all drag state
        isDragging.current = false
        dragStart.current = null
        dragIntent.current = null
        didDrag.current = false
    }

    const getDateFromPos = (rowIndex: number, colIndex: number) => {
        const date = dates[colIndex]
        const newDate = new Date(date)

        // Set to 9am PST which is 4pm UTC (during PDT it's 16:00 UTC)
        newDate.setUTCHours(16, 0, 0, 0)
        newDate.setUTCMinutes(rowIndex * 30)

        return newDate
    }

    const updateSelection = (endRow: number, endCol: number) => {
        if (!dragStart.current) return;
        if (!dragIntent.current) return;

        if (!didDrag.current) {
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
        // Create dates using to match database format
        const start = new Date(date)
        const end = new Date(date)

        start.setHours(9, 0, 0, 0);
        end.setHours(24, 0, 0, 0);

        const disabledCutoff = new Date(date).setHours(9, 0, 0, 0)
        const day = []

        let currentTime = start
        let rowIndex = 0
        while (isBefore(currentTime, end)) {
            const row = rowIndex
            const currentTimeCopy = currentTime
            const isSelected = selectedTimes && selectedTimes.some(time => isSameMinute(currentTimeCopy, time) && isSameDay(currentTimeCopy, time))
            const isDisabled = isBefore(currentTimeCopy, disabledCutoff)
            const isHalfHour = getMinutes(currentTimeCopy) == 30

            console.log(currentTimeCopy.toISOString())
            console.log(filteredAvailabilities.find(a => a.time_slot === currentTimeCopy.toISOString())?.percentAvailable)

            day.push(
                    <CalendarCell
                    date={currentTimeCopy}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    isHalfHour={isHalfHour}
                    mode={mode}
                    availabilityPercentage={
                        mode === 'summary'
                        ? filteredAvailabilities.find(a => a.time_slot === currentTimeCopy.toISOString())?.percentAvailable
                        : undefined
                    }
                    onMouseDown={() => handleMouseDown(row, colIndex)}
                    onMouseEnter={() => handleMouseEnter(row, colIndex)}
                    onTouchStart={(e) => handleTouchStart(e, row, colIndex)}
                    onTouchEnd={(e) => handleTouchEnd(e)}
                    row={row}
                    col={colIndex}
                    />
            )

            currentTime = addMinutes(currentTime, 30)
            rowIndex += 1
        }

        return (
            <div className='relative grid grid-cols-1'>
                {day}
            </div>
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
                        className={`${CELL_HEIGHT_CLASSES} text-sm text-text-secondary`}>{format(timeCopy, 'h a')}</h2>
            )
            stamps.push(<div className={`${CELL_HEIGHT_CLASSES}`}></div>)

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
                                <ChevronLeftIcon className='size-10 text-text-secondary'/>
                            </Button>
                        </div>
                        <div
                            onMouseLeave={handleMouseUp}
                            onMouseUp={handleMouseUp}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
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
                                <ChevronRightIcon className='size-10 text-text-secondary'/>
                            </Button>
                        </div>
                    </div>
                    <div className='flex flex-grow md:overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-hidden touch-pan-y'>
                        <div className="w-12 h-full">
                            {renderTimeStamps()}
                        </div>
                        <div
                            onMouseLeave={handleMouseUp}
                            onMouseUp={handleMouseUp}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
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

export default Calendar;