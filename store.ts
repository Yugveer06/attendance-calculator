import { create } from "zustand";

interface AppState {
	isDateRangeInfoModalOpen: boolean;
	setIsDateRangeInfoModalOpen: (e: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
	isDateRangeInfoModalOpen: false,
	setIsDateRangeInfoModalOpen: e =>
		set(_ => ({
			isDateRangeInfoModalOpen: e,
		})),
}));
