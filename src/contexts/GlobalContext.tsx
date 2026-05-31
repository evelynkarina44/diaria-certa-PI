import { createContext, type ReactNode } from "react";

type GlobalContextValue = Record<string, never>;

export const GlobalContext = createContext<GlobalContextValue>({});

type GlobalProviderProps = {
	children: ReactNode;
};

export function GlobalProvider({ children }: GlobalProviderProps) {
	return (
		<GlobalContext.Provider value={{}}>
			{children}
		</GlobalContext.Provider>
	);
}
