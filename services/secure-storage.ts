import * as SecureStore from "expo-secure-store";

const KEYS = {
  PIN: "watchlist_pin",
  PIN_SET: "watchlist_pin_set",
} as const;

export async function savePin(pin: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS.PIN, pin);
    await SecureStore.setItemAsync(KEYS.PIN_SET, "true");
  } catch (error) {
    console.error("Error saving PIN:", error);
    throw new Error("Failed to save PIN");
  }
}

export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const storedPin = await SecureStore.getItemAsync(KEYS.PIN);
    return storedPin === pin;
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return false;
  }
}

export async function isPinSet(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(KEYS.PIN_SET);
    return value === "true";
  } catch (error) {
    console.error("Error checking PIN status:", error);
    return false;
  }
}

export async function deletePin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS.PIN);
    await SecureStore.deleteItemAsync(KEYS.PIN_SET);
  } catch (error) {
    console.error("Error deleting PIN:", error);
  }
}
