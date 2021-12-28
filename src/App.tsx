import { IonApp } from "@ionic/react";
import { ToDoList } from "./components/ToDoList";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { useEffect } from "react";

const App: React.FC = () => {
  useEffect(() => {
    // Add or remove the "dark" class based on if the media query matches
    const toggleDarkTheme = (shouldAdd: boolean) => {
      document.body.classList.toggle("dark", shouldAdd);
    };

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    toggleDarkTheme(prefersDark.matches);

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener("change", (mediaQuery) => toggleDarkTheme(mediaQuery.matches));
  }, []);

  return (
    <IonApp>
      <ToDoList />
    </IonApp>
  );
};

export default App;
