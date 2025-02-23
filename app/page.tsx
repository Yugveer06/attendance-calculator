"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { Info } from "lucide-react";

import { ModeToggle } from "components/mode-toggle";
import { Calendar } from "components/ui/calendar";
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import DateRangeInfoModal from "components/DateRangeInfoModal";

import { AnimatePresence, motion as m } from "motion/react";

import { Holiday } from "typings";
import { useAppStore } from "store";
import { Separator } from "components/ui/separator";

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

	const [isDateRangeInfoModalOpen, setIsDateRangeInfoModalOpen] = useAppStore(
		state => [
			state.isDateRangeInfoModalOpen,
			state.setIsDateRangeInfoModalOpen,
		]
	);

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

	const calculateTotalDays = () => {
		if (!date?.from || !date?.to) return 0;
		const diffTime = Math.abs(date.to.getTime() - date.from.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
	};

	const calculateSundays = () => {
		if (!date?.from || !date?.to) return 0;
		let sundays = 0;
		let currentDate = new Date(date.from);

		while (currentDate <= date.to) {
			if (currentDate.getDay() === 0) sundays++;
			currentDate.setDate(currentDate.getDate() + 1);
		}
		return sundays;
	};

	const totalDays = calculateTotalDays();
	const totalSundays = calculateSundays();
	const totalHolidays = holidays.length;
	const workingDays = getWorkingDays(date?.from, date?.to).workingDays;

	return (
		<div className='z-50 bg-slate-100 border-slate-200 dark:border-slate-800 border-2 dark:bg-slate-900 rounded-xl  text-slate-950 dark:text-slate-200 p-4 m-4 w-5/6'>
			<header className='flex justify-between items-center gap-8'>
				<h1 className='text-2xl font-bold'>Attendance Calculator</h1>
				<ModeToggle />
			</header>
			<main className='mt-8 flex flex-col lg:flex-row gap-4'>
				<div className='w-full lg:w-auto'>
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
								initial={{
									opacity: 0,
									height: 0,
									marginTop: 0,
								}}
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
									{
										getWorkingDays(date.from, date.to)
											.workingDays
									}
								</h2>
								<Button
									className='lg:hidden p-2'
									variant='ghost'
									onClick={() =>
										setIsDateRangeInfoModalOpen(true)
									}
								>
									<Info size={20} />
								</Button>
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
							max={
								getWorkingDays(date?.from, date?.to).workingDays
							}
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
								initial={{
									opacity: 0,
									height: 0,
									marginTop: 0,
								}}
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
				</div>
				<div className='bg-slate-200 dark:bg-slate-800 p-4 rounded-lg flex-1 hidden lg:block'>
					{date && date.from && date.to ? (
						<div className='text-base font-medium'>
							Selected Period: {format(date.from, "dd MMM yyyy")}{" "}
							to {format(date.to, "dd MMM yyyy")}
						</div>
					) : (
						<div className='text-base font-medium'>
							Select a range of dates to view the details.
						</div>
					)}
					{date && date.from && date.to && (
						<>
							<div>
								<m.h3
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className='font-semibold mb-3'
								>
									Holidays in Selected Range:
								</m.h3>
								<div className='space-y-2 max-h-96 overflow-y-auto'>
									{holidays.map((holiday, index) => (
										<m.div
											initial={{
												opacity: 0,
												scale: 0.8,
											}}
											animate={{
												opacity: 1,
												scale: 1,
												transition: {
													delay: index * 0.05,
													ease: [0, 0.75, 0.25, 1],
												},
											}}
											exit={{
												opacity: 0,
												scale: 0.8,
											}}
											key={index}
											className='flex justify-between items-center bg-muted dark:bg-slate-900 p-2 rounded-md'
										>
											<span>{holiday.name}</span>
											<span className='text-sm text-muted-foreground'>
												{holiday.dates
													.map(date =>
														format(
															new Date(date),
															"dd MMM yyyy"
														)
													)
													.join(", ")}
											</span>
										</m.div>
									))}
								</div>
							</div>

							<div className='mt-8'>
								<h3 className='font-semibold mb-2'>
									Calculations Breakdown:
								</h3>
								<div className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<span>Total Days in Range:</span>
										<span>{totalDays} days</span>
									</div>
									<div className='flex justify-between'>
										<span>Sundays:</span>
										<span>{totalSundays} days</span>
									</div>
									<div className='flex justify-between'>
										<span>
											Holidays (excluding Sundays):
										</span>
										<span>{totalHolidays} days</span>
									</div>
									<div className='flex justify-between'>
										<span>Working Days:</span>
										<span>{workingDays} days</span>
									</div>
									<div className='flex justify-between font-medium pt-2'>
										<span>Non-working Days:</span>
										<span>
											{totalDays - workingDays} days
										</span>
									</div>
								</div>
							</div>

							<div className='text-sm text-muted-foreground bg-muted dark:bg-slate-900 mt-4 p-2 rounded-md'>
								Note: Holidays that fall on Sundays are counted
								only once as non-working days.
							</div>
						</>
					)}
				</div>
			</main>
			<DateRangeInfoModal
				date={date}
				holidays={getWorkingDays(date?.from, date?.to).holidayList}
				workingDays={getWorkingDays(date?.from, date?.to).workingDays}
			/>
		</div>
	);
};

export default AttendanceCalculator;
