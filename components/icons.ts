// Centralized icon imports for type safety
export { Ionicons } from "@expo/vector-icons";

// Extract the icon name type from Ionicons
export type IoniconsName = React.ComponentProps<typeof import("@expo/vector-icons").Ionicons>["name"];
