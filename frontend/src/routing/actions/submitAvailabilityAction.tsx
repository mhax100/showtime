import { createUser } from "../../api/users";
import { createAvailability, editAvailability, deleteAvailabilityByUserID } from "../../api/availabilities";
import { createShowtimes } from "../../api/showtimes";
import { fetchEventByID } from "../../api/events";
import type { UserAvailability } from "../../types/availability";

export async function submitAvailabilityAction({ request }: { request: Request }) {

    const formData = await request.formData();
    const action_type = formData.get("action_type");
    const event_id = formData.get("event_id");

    if (typeof action_type !== 'string' || typeof event_id !== 'string') {
        throw new Error("Invalid form input");
    }

    // Handle delete action
    if (action_type === 'delete') {
        const user_id = formData.get("user_id");
        
        if (typeof user_id !== 'string') {
            throw new Error("Invalid form input for delete action");
        }

        await deleteAvailabilityByUserID(user_id, event_id);
        
        const event_data = await fetchEventByID(event_id);
        await createShowtimes(
            event_id,
            {
                location: event_data.location,
                movie: event_data.title,
                duration: 120
            }
        );

        // Return json response to trigger revalidation
        return Response.json({ success: true, action: 'delete' });
    }

    // Handle create/update action
    const name = formData.get("name");
    const availability = formData.get("availability_data");
    const editing_user_id = formData.get("editing_user_id");

    if (
        typeof name !== 'string' ||
        typeof availability !== 'string' ||
        typeof editing_user_id !== 'string'
    ) {
        throw new Error("Invalid form input for create/update action");
    }

    let parsedAvailability: string[];

    try {
        parsedAvailability = JSON.parse(availability) as string[]; // dates was sent as JSON.stringify([...])
    } catch {
        throw new Error("Could not parse dates");
    }

    let availability_id: UserAvailability;

    // Check if we're editing an existing availability
    if (editing_user_id && editing_user_id.trim() !== '') {
        // Edit existing availability
        availability_id = await editAvailability({
            user_id: editing_user_id,
            availability: parsedAvailability,
            role: "guest"
        }, event_id);

        const event_data = await fetchEventByID(event_id);
        await createShowtimes(
            event_id,
            {
                location: event_data.location,
                movie: event_data.title,
                duration: 120
            }
        );
    } else {
        // Create new availability
        const user_response = await createUser({
            name: name
        })

        availability_id = await createAvailability({
            event_id: event_id,
            user_id: user_response.data.id,
            availability: parsedAvailability,
            role: "guest"
        });

        const event_data = await fetchEventByID(event_id)

        await createShowtimes(
            event_id,
            {
                location: event_data.location,
                movie: event_data.title,
                duration: 120
            }
        )
    }


    // Return json response to trigger revalidation
    return Response.json({ success: true, availability_id })
}
  