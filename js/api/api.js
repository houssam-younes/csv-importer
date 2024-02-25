import { toggleLoading } from "../navigation.js";

export async function fetchInventory() {
  try {
    toggleLoading(true);
    console.log('fetching...');
    const response = await fetch("/api/inventory");
    toggleLoading(false);
    if (!response.ok) {
      throw new Error("Failed - Could not fetch inventory");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return null;
  }
}
