type CalendarCellProps = {
    date: Date
    isSelected: boolean
    isDisabled: boolean
    isHalfHour: boolean
    mode: 'edit' | 'summary'
    availabilityPercentage?: number // only used in summary mode
    onMouseDown?: () => void
    onMouseEnter?: () => void
}
  
const CalendarCell: React.FC<CalendarCellProps> = ({
    date,
    isSelected,
    isDisabled,
    isHalfHour,
    mode,
    availabilityPercentage,
    onMouseDown,
    onMouseEnter
    }) => {
    const cellHeightClasses = "h-4 sm:h-4 md:h-5 lg:h-6 xl:h-7";

    if (isDisabled) {
        return (
        <div
            className={`${cellHeightClasses} bg-surface border-1 border-surface`}
            key={date.toISOString()}
        />
        );
    }


    let backgroundColor = 'bg-background hover:bg-surface/50';

    if (mode === 'edit') {
      backgroundColor = isSelected ? 'bg-primary-shift-green hover:bg-primary-shift-green/50' : 'bg-primary-shift-red hover:bg-primary-shift-red/50';
    }
  
    if (mode === 'summary' && availabilityPercentage !== undefined) {
      // Use different background intensity based on % available
      if (availabilityPercentage > 75) backgroundColor = 'bg-primary/5';
      else if (availabilityPercentage > 50) backgroundColor = 'bg-primary/25';
      else if (availabilityPercentage > 25) backgroundColor = 'bg-primary/50';
      else backgroundColor = 'bg-surface';
    }

    return (
        <div
        key={date.toISOString()}
        className={`
            ${cellHeightClasses}
            ${backgroundColor}
            border border-surface
            ${!isHalfHour ? '[border-bottom-style:dashed]' : '[border-top-style:dashed]'}
            ${mode === 'edit' ? 'cursor-pointer' : 'cursor-default'}
        `}
        onMouseDown={mode === 'edit' ? onMouseDown: undefined}
        onMouseEnter={mode === 'edit' ? onMouseEnter: undefined}
        />
    );
};

export default CalendarCell;
