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

    const getAvailabilityShade = (pct: number): string => {
        if (pct >= 80) return 'bg-primary';
        if (pct >= 60) return 'bg-primary-desaturated-1';
        if (pct >= 40) return 'bg-primary-desaturated-2';
        if (pct >= 20) return 'bg-primary-desaturated-3';
        if (pct == 0) return 'bg-primary-desaturated-5';
        return 'bg-primary-desaturated-4';
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
            ${mode === 'edit' ? 'cursor-pointer' : 'cursor-default'}
        `}
        onMouseDown={mode === 'edit' ? onMouseDown: undefined}
        onMouseEnter={mode === 'edit' ? onMouseEnter: undefined}
        />
    );
};

export default CalendarCell;
