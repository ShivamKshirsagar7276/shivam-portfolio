import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

// Remembers that the loading screen already finished once.
// It lives outside the component, so it survives going to /myworks and back,
// but it resets on a full page refresh (so a refresh still shows the loader).
let hasLoadedOnce = false;

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoadingState] = useState(() => {
    // Skip loading on mobile
    if (window.innerWidth <= 768) return false;
    // Skip loading when coming back from another page
    if (hasLoadedOnce) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);

  const setIsLoading = (state: boolean) => {
    if (!state) hasLoadedOnce = true;
    setIsLoadingState(state);
  };

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    // Auto-start animations on mobile (no 3D model) and when the loading
    // screen is skipped because the user is coming back from another page
    if (window.innerWidth <= 768 || hasLoadedOnce) {
      import("../components/utils/initialFX").then((module) => {
        if (module.initialFX) {
          setTimeout(() => {
            module.initialFX();
          }, 100);
        }
      });
    }
  }, []);

  useEffect(() => {}, [loading]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};