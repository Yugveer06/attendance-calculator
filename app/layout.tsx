import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "components/theme-provider";

const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Attendance Calculator",
	description:
		"This is an attendance calculator app which helps you calculate the number of days you attended a course.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning={true}>
			<body className={jetbrains_mono.className}>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
