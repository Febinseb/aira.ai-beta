// pages/_app.js
import "../styles/globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
