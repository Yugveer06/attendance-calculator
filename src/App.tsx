import AttendanceCalculator from "./Pages/AttendanceCalculator";
import { ThemeProvider } from "./components/theme-provider";
import { BackgroundBeams } from "./components/ui/background-beams";

function App() {
	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<BackgroundBeams />
			<AttendanceCalculator />
		</ThemeProvider>
	);
}

export default App;
