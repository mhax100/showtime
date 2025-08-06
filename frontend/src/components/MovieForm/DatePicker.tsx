import { format, isBefore, isSameDay, addDays, subDays, differenceInCalendarDays } from 'date-fns'
import { Button } from '@headlessui/react'

type DatePickerProps = {
    selectedDates: Date[]
    setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDates, setSelectedDates }) => {

    const renderHeader = () => {
        return (
            <div className='py-2'>
                <h3 className='text-xl font-light text-text-primary'>What dates might work?</h3>
                <h5 className='text-sm font-light text-text-secondary'>You can select multiple dates</h5>
            </div>
        )
    }

    const renderMonth = (month: Date) => {
        return (
            <div key={format(month, 'LLLL')} className='flex flex-col'>
                <div className='flex justify-center py-2'>
                    <div className='py-2 text-center rounded curor-pointer text-text-primary'>
                        {format(month, 'LLLL')}
                    </div>
                </div>
            </div>
        )
    }

    const renderWeekdays = (startDate: Date) => {
        const row  = []
        // I need to figure out what day the startofWeek of monthStart is
        
        let day = startDate
        for (let i = 0; i < 7; i++) {
            row.push(<div key={format(day, 'EEE')} className='py-2 text-center rounded curor-pointer text-text-secondary'>{format(day, 'EEE')}</div>)
            day = addDays(day, 1)
        }
        

        return <div key='weekdaysRow' className='grid grid-cols-7'>{row}</div>
    }

    const renderCells = () => {
        const handleDateClick = (clicked: Date) => {
            // Standardize the date to midnight UTC with no seconds/milliseconds
            const standardizedDate = new Date(clicked.getFullYear(), clicked.getMonth(), clicked.getDate(), 0, 0, 0, 0)
            
            setSelectedDates((prev: Date[]) => {
                const dates = prev || []
                const exists = selectedDates.some(date => isSameDay(date, standardizedDate))
                
                if (exists) {
                    return dates.filter(date => !isSameDay(date, standardizedDate))
                } else {
                    return [...dates, standardizedDate].sort((a, b) => a.getTime() - b.getTime())
                }
            })
        }

        const today = new Date()
        const startDate = today
        const difference = differenceInCalendarDays(today, startDate)
        const days = []
        let day = startDate

        const formattedDates = [renderMonth(startDate)]
        formattedDates.push(renderWeekdays(startDate))
        
        for (let i = 0; i < 7 + difference ; i++) {
            const currentDay = day
            const isSelected = selectedDates && selectedDates.some(date => isSameDay(date, currentDay))
            const isPrevSelected = selectedDates && selectedDates.some(date => isSameDay(date, subDays(currentDay, 1)))
            const isNextSelected = selectedDates && selectedDates.some(date => isSameDay(date, addDays(currentDay, 1)))
            const isDeactivated = isBefore(currentDay, subDays(today, 1))

            days.push(
                <div
                    key={format(currentDay, 'PP')}
                    className={`text-center aspect-square w-full text-text-primary
                    ${isSelected ? 'text-white' : ''}`
                }>
                    {
                        isDeactivated ? "" :
                        <Button 
                            onClick={() => handleDateClick(currentDay)}
                            className={
                                `w-full cursor-pointer size-9 text-text-primary data-hover:bg-background
                                ${isSelected && 'bg-background border border-primary-soft/50'}
                                ${isSelected && isPrevSelected && 'rounded-none border-l-0'}
                                ${isSelected && isNextSelected && 'rounded-none border-r-0'}
                                ${isSelected && !isPrevSelected && 'rounded-l-full'}
                                ${isSelected && !isNextSelected && 'rounded-r-full'}
                                ${!isSelected && 'rounded-full'}
                            `}
                        >
                            {format(currentDay, 'd')}
                        </Button>
                    }
                </div>
            )
            day = addDays(day, 1)
        }

        formattedDates.push(
            <div key='month2' className='grid grid-cols-7'>
                {days}
            </div>
        )
        
        return (
            <div className="flex flex-col">
                {formattedDates}
            </div>
            
      )
    }

    return (
        <div className='flex flex-col mb-2'>
            {renderHeader()}
            {renderCells()}
        </div>
    )
}

export default DatePicker;