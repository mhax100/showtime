
import { createShowtime } from "../../api/showtime";

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

    if (
        typeof name !== 'string' ||
        typeof availability !== 'string'
    ) {
        throw new Error("Invalid form input");
    }

    let parsedAvailability: string[];

    try {
        parsedAvailability = JSON.parse(availability) as string[]; // dates was sent as JSON.stringify([...])
    } catch {
        throw new Error("Could not parse dates");
    }

    /*
    await createShowtime({
        
    })

    await create
    */
}
  