import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { useAppStore } from "store";
import { Holiday } from "typings";
import { Separator } from "./ui/separator";

type DateRangeInfoModalProps = {
	date: DateRange | undefined;
	holidays: Holiday[];
	workingDays: number;
};

function DateRangeInfoModal({
	date,
	holidays,
	workingDays,
}: DateRangeInfoModalProps) {
	const [isOpen, setIsOpen] = useAppStore(state => [
		state.isDateRangeInfoModalOpen,
		state.setIsDateRangeInfoModalOpen,
	]);

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

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-2xl'>
						Date Range Details
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6 pt-4'>
					{date?.from && date?.to && (
						<p className='text-base font-medium'>
							Selected Period: {format(date.from, "dd MMM yyyy")}{" "}
							to {format(date.to, "dd MMM yyyy")}
						</p>
					)}

					{holidays.length > 0 && (
						<div>
							<h3 className='font-semibold mb-3'>
								Holidays in Selected Range:
							</h3>
							<div className='space-y-2'>
								{holidays.map((holiday, index) => (
									<div
										key={index}
										className='flex justify-between items-center bg-muted p-2 rounded-md'
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
									</div>
								))}
							</div>
						</div>
					)}

					<Separator />

					<div className='space-y-3'>
						<h3 className='font-semibold'>
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
								<span>Holidays (excluding Sundays):</span>
								<span>{totalHolidays} days</span>
							</div>
							<div className='flex justify-between'>
								<span>Working Days:</span>
								<span>{workingDays} days</span>
							</div>
							<div className='flex justify-between font-medium pt-2'>
								<span>Non-working Days:</span>
								<span>{totalDays - workingDays} days</span>
							</div>
						</div>
					</div>

					<p className='text-sm text-muted-foreground bg-muted p-3 rounded-md'>
						Note: Holidays that fall on Sundays are counted only
						once as non-working days.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default DateRangeInfoModal;
