const ShowtimePeriod = ({ tooltip }: { tooltip?: string }) => (
    <div
      className={`absolute top-0 left-0 w-full h-full rounded-sm pointer-events-none opacity-70 bg-primary`}
      title={tooltip}
    />
)

export default ShowtimePeriod