import { toggleLoading } from "./navigation.js";

export async function fetchInventory() {
    try {
      toggleLoading(true);
      console.log('fetching...');
      const response = await fetch("/api/inventoryy");
      toggleLoading(false);
      if (!response.ok){
        throw error;
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return null;
    }
  }
  