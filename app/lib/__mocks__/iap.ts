import * as iap from "~/lib/iap";

let currentIdentity: any = null;

export const getIdentity = async (request: Request) => {
  return currentIdentity;
};

export const setTestIdentity = (identity: iap.Identity | null = null) => {
  currentIdentity = identity;
};

export const setDefaultTestIdentity = () => {
  currentIdentity = DefaultTestIdentity;
};

export const DefaultTestIdentity = {
  email: "test-iap-user@example.com",
  id: "test-iap-user",
};