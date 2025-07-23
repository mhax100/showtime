import { CELL_HEIGHT_CLASSES } from "../../constants/layout";

type CalendarCellProps = {
    date: Date
    isSelected: boolean
    isDisabled: boolean
    isHalfHour: boolean
    mode: 'edit' | 'summary'
    availabilityPercentage?: number // only used in summary mode
    onMouseDown?: () => void
    onMouseEnter?: () => void
    onTouchStart?: (e: React.TouchEvent) => void
    row?: number
    col?: number
}
  
const CalendarCell: React.FC<CalendarCellProps> = ({
    date,
    isSelected,
    isDisabled,
    isHalfHour,
    mode,
    availabilityPercentage,
    onMouseDown,
    onMouseEnter,
    onTouchStart,
    row,
    col
    }) => {

    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 80) return 'bg-available-100 hover:bg-available-100/50';
        if (pct >= 60) return 'bg-available-80 hover:bg-available-80/50';
        if (pct >= 40) return 'bg-available-60 hover:bg-available-60/50';
        if (pct >= 20) return 'bg-available-40 hover:bg-available-40/50';
        if (pct == 0) return 'bg-available-0 hover:bg-available-0/50';
        return 'bg-available-20 hover:bg-available-20/50';
    }

    if (isDisabled) {
        return (
        <div
            className={`${CELL_HEIGHT_CLASSES} bg-surface border-1 border-surface`}
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
      backgroundColor = getAvailabilityShade(availabilityPercentage)
    }

    return (
        <div
        key={date.toISOString()}
        className={`
            ${CELL_HEIGHT_CLASSES}
            ${backgroundColor}
            border border-surface
            ${!isHalfHour ? '[border-bottom-style:dashed]' : '[border-top-style:dashed]'}
            ${mode === 'edit' ? 'cursor-pointer touch-none' : 'cursor-default'}
        `}
        data-row={row}
        data-col={col}
        onMouseDown={mode === 'edit' ? onMouseDown: undefined}
        onMouseEnter={mode === 'edit' ? onMouseEnter: undefined}
        onTouchStart={mode === 'edit' ? onTouchStart: undefined}
        />
    );
};

export default CalendarCell;
