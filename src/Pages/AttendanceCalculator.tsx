import { useState } from "react";
import { ModeToggle } from "../components/mode-toggle";
import { DateRange } from "react-day-picker";
import { Calendar } from "../components/ui/calendar";
import { holidays } from "../../constants";

import { AnimatePresence, motion as m } from "framer-motion";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Info } from "lucide-react";

const AttendanceCalculator = () => {
	const [date, setDate] = useState<DateRange | undefined>();
	const [numberOfDaysAttended, setNumberOfDaysAttended] = useState(0);

	type Holiday = {
		name: string;
		dates: string[];
	};

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

	console.log(getWorkingDays(date?.from, date?.to).holidayList);

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
