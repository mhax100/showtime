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
        if (pct >= 80) return 'bg-primary hover:bg-primary/50';
        if (pct >= 60) return 'bg-primary-desaturated-1 hover:bg-primary-desaturated-1/50';
        if (pct >= 40) return 'bg-primary-desaturated-2 hover:bg-primary-desaturated-2/50';
        if (pct >= 20) return 'bg-primary-desaturated-3 hover:bg-primary-desaturated-3/50';
        if (pct == 0) return 'bg-primary-desaturated-5 hover:bg-primary-desaturated-5/50';
        return 'bg-primary-desaturated-4 hover:bg-primary-desaturated-4/50';
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
