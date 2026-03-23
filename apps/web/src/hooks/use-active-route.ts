import { useRouterState } from "@tanstack/react-router";

export function useRouteActive() {
	const state = useRouterState();
	return (path: string) => {
		return state.location.pathname.startsWith(path);
	};
}
