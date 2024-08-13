import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { holidays } from "../../constants";

import { AnimatePresence, motion as m } from "framer-motion";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const AttendanceCalculator = () => {
	const [date, setDate] = useState<DateRange | undefined>();
	const [numberOfDaysAttended, setNumberOfDaysAttended] = useState(0);

	function countWorkingDays(
		fromDate: Date | undefined,
		toDate: Date | undefined
	): number {
		if (!fromDate || !toDate) return 0;

		const dayInMs = 1000 * 60 * 60 * 24;
		let count = 0;

		for (
			let date = new Date(fromDate);
			date <= toDate;
			date = new Date(date.getTime() + dayInMs)
		) {
			const dayOfWeek = date.getDay();

			if (
				dayOfWeek !== 0 &&
				!holidays.some(holiday => holiday.getTime() === date.getTime())
			) {
				count++;
			}
		}

		return count;
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
							className='flex flex-col gap-2'
						>
							<h2>
								Number of working days:{" "}
								{countWorkingDays(date.from, date.to)}
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
						max={countWorkingDays(date?.from, date?.to)}
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
										countWorkingDays(date.from, date.to)) *
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
