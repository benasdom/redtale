import { Address } from "@src/types";
import { generateId } from "@src/utils/id";
import { mockDelay, USE_MOCKS } from "./apiClient";

let addressCache: Address[] = [
  {
    id: "addr_1",
    label: "Home",
    fullName: "User Name",
    line1: "412 Maple Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    phone: "+1 (512) 555-0142",
    isDefault: true,
  },
];

export async function fetchAddresses(): Promise<Address[]> {
  if (!USE_MOCKS) {
    // TODO(backend): GET /addresses
  }
  return mockDelay([...addressCache], 400);
}

export async function saveAddress(input: Omit<Address, "id">): Promise<Address> {
  if (!USE_MOCKS) {
    // TODO(backend): POST /addresses
  }
  const address: Address = { ...input, id: generateId("addr") };
  if (address.isDefault) {
    addressCache = addressCache.map((a) => ({ ...a, isDefault: false }));
  }
  addressCache = [address, ...addressCache];
  return mockDelay(address, 500);
}

export async function deleteAddress(id: string): Promise<void> {
  if (!USE_MOCKS) {
    // TODO(backend): DELETE /addresses/:id
  }
  addressCache = addressCache.filter((a) => a.id !== id);
  return mockDelay(undefined, 300);
}

export async function setDefaultAddress(id: string): Promise<Address[]> {
  addressCache = addressCache.map((a) => ({ ...a, isDefault: a.id === id }));
  return mockDelay([...addressCache], 300);
}
