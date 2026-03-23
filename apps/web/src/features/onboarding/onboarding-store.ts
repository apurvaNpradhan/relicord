import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingState {
	profileCompleted: boolean;
	name: string | null;
	slug: string | null;
	setProfileCompleted: (completed: boolean) => void;
	setName: (name: string) => void;
	setSlug: (slug: string) => void;
	reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set) => ({
			profileCompleted: false,
			name: null,
			slug: null,
			setProfileCompleted: (completed) => set({ profileCompleted: completed }),
			setName: (name) => set({ name }),
			setSlug: (slug) => set({ slug }),
			reset: () =>
				set({
					profileCompleted: false,
					name: null,
					slug: null,
				}),
		}),
		{
			name: "relicord-onboarding",
		},
	),
);
