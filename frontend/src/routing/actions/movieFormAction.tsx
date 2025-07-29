import { redirect } from "react-router-dom";
import { createEvent } from "../../api/events";

export async function newShowtimeAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const movieName = formData.get("movieName");
    const location = formData.get("validatedCity");
    const chain = formData.get("chain");
    const dates = formData.get("dates");
    const timezone = formData.get("timezone");

    if (
        typeof movieName !== 'string' ||
        typeof location !== 'string' ||
        typeof chain !== 'string' ||
        typeof dates !== 'string' ||
        typeof timezone !== 'string'
    ) {
        throw new Error("Invalid form input");
    }

    let parsedDates: string[];

    try {
        parsedDates = JSON.parse(dates) as string[]; // dates was sent as JSON.stringify([...])
    } catch {
        throw new Error("Could not parse dates");
    }

    const event_id = await createEvent({
        title: movieName,
        location: location,
        chain: chain,
        potential_dates: parsedDates,
        timezone: timezone
    })
  
    return redirect(`/showtime/${event_id}`);
}
  