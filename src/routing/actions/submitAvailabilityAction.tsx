import { createUser } from "../../api/users";
import { createAvailability } from "../../api/availabilities";

export async function submitAvailabilityAction({ request }: { request: Request }) {

    /*
    What needs to happen:
    Get the name from the submitted form
    Add an entry to the database where I create a new user with that name
    Add an entry to the database where I create a new availability with the user id, event id, and role
    Pull the new availability data from the database for the event id
    Display the data in the summary mode on the same page
    Display the new name in the availability side bar
    */
    const formData = await request.formData();
    const name = formData.get("name");
    const availability = formData.get("availability_data")
    const showtime_id = formData.get("showtime_id")

    if (
        typeof name !== 'string' ||
        typeof availability !== 'string' ||
        typeof showtime_id !== 'string'
    ) {
        throw new Error("Invalid form input");
    }

    let parsedAvailability: string[];

    try {
        parsedAvailability = JSON.parse(availability) as string[]; // dates was sent as JSON.stringify([...])
    } catch {
        throw new Error("Could not parse dates");
    }

    const user_response = await createUser({
        name: name
    })

    
    const availability_id = await createAvailability({
        event_id: showtime_id,
        user_id: user_response.data.id,
        availability: parsedAvailability,
        role: "guest"
    })

    return { success: true, availability_id}
}
  