import "server-only";
import { requireIdentity } from "./server";
import { isTeamRole, isAdminRole } from "./team-policy";
import { notFound } from "next/navigation";
export async function requireTeam(path: string, admin = false) {
  const who=await requireIdentity(path);
  if (admin ? !isAdminRole(who.profile.role) : !isTeamRole(who.profile.role)) notFound();
  return who;
}
