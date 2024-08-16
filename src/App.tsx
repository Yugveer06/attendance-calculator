import AttendanceCalculator from "./Pages/AttendanceCalculator";
import { ThemeProvider } from "./components/theme-provider";

function App() {
	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<AttendanceCalculator />
		</ThemeProvider>
	);
}

export default App;
