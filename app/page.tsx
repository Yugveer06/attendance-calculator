"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { AnimatePresence, motion as m } from "framer-motion";

import { ModeToggle } from "components/mode-toggle";
import { Calendar } from "components/ui/calendar";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";

import { Holiday } from "typings";

const fetchHolidays = async (
	startDate: Date,
	endDate: Date
): Promise<Holiday[]> => {
	const startYear = startDate.getFullYear();
	const endYear = endDate.getFullYear();
	let holidays: Holiday[] = [];

	// Check local storage
	const cachedHolidays = localStorage.getItem("holidays");
	let cachedData: { [year: string]: Holiday[] } = {};

	if (cachedHolidays) {
		cachedData = JSON.parse(cachedHolidays);
	}

	// Check if all required years are in cache
	const missingYears: number[] = [];
	for (let year = startYear; year <= endYear; year++) {
		if (!cachedData[year]) {
			missingYears.push(year);
		} else {
			holidays = holidays.concat(cachedData[year]);
		}
	}

	// Fetch missing years from API
	for (const year of missingYears) {
		const response = await fetch(
			`/api/holidays?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
		);

		try {
			if (response.ok) {
				const fetchedHolidays = await response.json();
				// Add fetched holidays to the result and cache them
				holidays = holidays.concat(fetchedHolidays);
				cachedData[year] = fetchedHolidays;
			} else {
				throw new Error("Failed to fetch holidays");
			}
		} catch (error) {
			console.error("Error fetching holidays:", error);
		}
	}

	// Update local storage with new data
	localStorage.setItem("holidays", JSON.stringify(cachedData));

	// Filter holidays within the date range
	const filteredHolidays = holidays.filter(holiday =>
		holiday.dates.some(date => {
			const holidayDate = new Date(date);
			return holidayDate >= startDate && holidayDate <= endDate;
		})
	);

	return filteredHolidays;
};

const AttendanceCalculator = () => {
	const [date, setDate] = useState<DateRange | undefined>();
	const [numberOfDaysAttended, setNumberOfDaysAttended] = useState(0);
	const [holidays, setHolidays] = useState<Holiday[]>([]);

	useEffect(() => {
		if (date?.from && date?.to) {
			const fetchData = async () => {
				const holidaysData = await fetchHolidays(date.from!, date.to!);
				setHolidays(holidaysData);
			};

			fetchData();
		}
	}, [date]);

	function isHoliday(date: string, holidays: Holiday[]): boolean {
		return holidays.some(holiday => holiday.dates.includes(date));
	}

	function getWorkingDays(
		startDate: Date | undefined,
		endDate: Date | undefined
	): { workingDays: number; holidayList: Holiday[] } {
		if (!startDate || !endDate) return { workingDays: 0, holidayList: [] };

		let workingDays = 0;
		const holidayList: Holiday[] = [];

		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			const dateString = currentDate.toISOString().split("T")[0];

			// weekend
			if (currentDate.getDay() !== 0) {
				// holiday
				if (isHoliday(dateString, holidays)) {
					const holiday = holidays.find(h =>
						h.dates.includes(dateString)
					);
					if (holiday && !holidayList.includes(holiday)) {
						holidayList.push(holiday);
					}
				} else {
					workingDays++;
				}
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}

		return { workingDays, holidayList };
	}

	return (
		<div className='z-50 bg-slate-100 border-slate-200 dark:border-slate-800 border-2 dark:bg-slate-900 rounded-xl backdrop-blur-[1px]  text-slate-950 dark:text-slate-200 p-4 m-4'>
			<header className='flex justify-between items-center gap-8'>
				<h1 className='text-2xl font-bold'>Attendance Calculator</h1>
				<ModeToggle />
			</header>
			<main className='mt-8'>
				<div className='flex flex-col gap-2'>
					<h2>Select a range of dates:</h2>
					<Calendar
						className='flex items-center justify-center w-full bg-white dark:bg-slate-950 rounded-lg p-8'
						initialFocus
						mode='range'
						modifiers={{
							booked: getWorkingDays(date?.from, date?.to)
								.holidayList.map(e => e.dates)
								.flat()
								.map(e => new Date(e)),
						}}
						modifiersClassNames={{
							booked: "!border-2 !border-slate-300 dark:!border-slate-600",
						}}
						defaultMonth={date?.from}
						selected={date}
						onSelect={setDate}
						numberOfMonths={1}
					/>
				</div>
				<AnimatePresence>
					{date && date.from && date.to && (
						<m.div
							initial={{ opacity: 0, height: 0, marginTop: 0 }}
							animate={{
								opacity: 1,
								height: "auto",
								marginTop: "8px",
							}}
							exit={{ opacity: 0, height: 0, marginTop: 0 }}
							className='flex gap-2 justify-between items-center'
						>
							<h2>
								Number of working days:{" "}
								{getWorkingDays(date.from, date.to).workingDays}
							</h2>
						</m.div>
					)}
				</AnimatePresence>
				<div className='flex flex-col gap-2 mt-4'>
					<Label
						htmlFor='numberOfDaysAttended'
						className='text-base font-normal'
					>
						Enter number of days attended:
					</Label>
					<Input
						type='number'
						min={0}
						max={getWorkingDays(date?.from, date?.to).workingDays}
						id='numberOfDaysAttended'
						placeholder='(in number)'
						onFocus={e => e.target.select()}
						value={numberOfDaysAttended.toString()}
						onChange={e =>
							setNumberOfDaysAttended(Number(e.target.value))
						}
					/>
				</div>
				<AnimatePresence>
					{date && date.from && date.to && (
						<m.div
							initial={{ opacity: 0, height: 0, marginTop: 0 }}
							animate={{
								opacity: 1,
								height: "auto",
								marginTop: "8px",
							}}
							exit={{ opacity: 0, height: 0, marginTop: 0 }}
							className='flex flex-col gap-2'
						>
							<h2>
								You have{" "}
								{Math.round(
									(numberOfDaysAttended /
										getWorkingDays(date.from, date.to)
											.workingDays) *
										100
								)}
								% attendance.
							</h2>
						</m.div>
					)}
				</AnimatePresence>
			</main>
		</div>
	);
};

export default AttendanceCalculator;
