import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@relicord/ui/components/item";
import { ModeToggle } from "@/components/mode-toggle";

export function PreferencesForm() {
	return (
		<div className="flex flex-col gap-3">
			<span className="font-semibold">Interface and theme</span>
			<ItemGroup className="gap-0">
				<Item variant={"muted"}>
					<ItemContent>
						<ItemTitle>Theme</ItemTitle>
						<ItemDescription>Select your theme</ItemDescription>
					</ItemContent>
					<ItemActions>
						<ModeToggle />
					</ItemActions>
				</Item>
			</ItemGroup>
		</div>
	);
}
