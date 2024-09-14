import { NextResponse } from "next/server";
import { Holiday } from "typings";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const startDate = url.searchParams.get("startDate");
	const endDate = url.searchParams.get("endDate");
	const apiKey = process.env.CALENDARIFIC_API_KEY as string;

	if (!startDate || !endDate) {
		return NextResponse.json(
			{ error: "Missing parameters" },
			{ status: 400 }
		);
	}

	const startYear = new Date(startDate).getFullYear();
	const endYear = new Date(endDate).getFullYear();
	let holidays: Holiday[] = [];

	// Fetch missing years from API
	for (let year = startYear; year <= endYear; year++) {
		const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=IN&year=${year}`;

		try {
			const response = await fetch(apiUrl);
			if (response.ok) {
				const data = await response.json();
				const fetchedHolidays = data.response.holidays as Array<{
					date: { iso: string };
					name: string;
					description: string;
				}>;

				const yearHolidays: Holiday[] = fetchedHolidays.map(
					holiday => ({
						name: holiday.name,
						dates: [holiday.date.iso],
						description: holiday.description,
					})
				);

				holidays = holidays.concat(yearHolidays);
			} else {
				throw new Error("Failed to fetch holidays");
			}
		} catch (error) {
			console.error("Error fetching holidays:", error);
		}
	}

	return NextResponse.json(holidays);
}
