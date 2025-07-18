import { fetchEventByID } from "../../api/events";
import { fetchAvailabilitiesByID } from "../../api/availabilities";
import { fetchShowtimesByID } from "../../api/showtimes";
import { fetchUserByID } from "../../api/users";

export async function eventPageLoader({ params }: { params: { eventID?: string } }) {
    const { eventID } = params;
    
    if (!eventID) {
        throw new Error("Event ID is required");
    }

    const [event, availabilities, showtimesResponse] = await Promise.all([
        fetchEventByID(eventID),
        fetchAvailabilitiesByID(eventID),
        fetchShowtimesByID(eventID)
    ]);

    const users = await Promise.all(
        availabilities.map((availability) => fetchUserByID(availability.user_id))
    );

    return {
        event,
        availabilities,
        showtimes: showtimesResponse.showtimes || [],
        users
    };
}