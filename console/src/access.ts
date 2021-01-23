// src/access.ts
import type {User} from "@/services/authentication";

export default function access(initialState: { currentUser?: User | undefined }) {
  const {currentUser} = initialState || {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
  };
}
