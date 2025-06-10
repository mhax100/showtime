import { redirect } from "react-router-dom";
import { createShowtime } from "../../api/showtime";

export async function newShowtimeAction({ request }: { request: Request }) {
    const formData = await request.formData();
    const movieName = formData.get("movieName");
    const location = formData.get("location");
    const dates = formData.get("dates")

    if (
        typeof movieName !== 'string' ||
        typeof location !== 'string' ||
        typeof dates !== 'string'
    ) {
        throw new Error("Invalid form input");
    }

    let parsedDates: string[];

    try {
        parsedDates = JSON.parse(dates) as string[]; // dates was sent as JSON.stringify([...])
    } catch {
        throw new Error("Could not parse dates");
    }

    const id = await createShowtime({
        title: movieName,
        creator_id: "3018bbb8-7238-47f9-abcf-b7dfad28be34",
        location: location,
        potential_dates: parsedDates
    })
  
    return redirect(`/showtime/${id}`);
}
  