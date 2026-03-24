import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface HeaderContextType {
	header: React.ReactNode;
	setHeader: (header: React.ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [header, setHeader] = useState<React.ReactNode>(null);

	return (
		<HeaderContext.Provider value={{ header, setHeader }}>
			{children}
		</HeaderContext.Provider>
	);
};

export const useHeader = (header: React.ReactNode) => {
	const context = useContext(HeaderContext);
	if (!context) {
		throw new Error("useHeader must be used within a HeaderProvider");
	}

	useEffect(() => {
		context.setHeader(header);
		return () => context.setHeader(null);
	}, [header, context]);
};

export const TeleportHeader: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	useHeader(children);
	return null;
};

export const HeaderOutlet: React.FC = () => {
	const context = useContext(HeaderContext);
	if (!context) {
		return null;
	}
	return <>{context.header}</>;
};
