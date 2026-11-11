"use server";

import {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminCredentials,
  ensureDefaultAdmin,
} from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: { email: string; password: string }) {
  await ensureDefaultAdmin();
  const res = await loginAdmin(formData.email, formData.password);
  if (res.success) {
    revalidatePath("/dashboard");
  }
  return res;
}

export async function logoutAction() {
  await logoutAdmin();
  revalidatePath("/");
  return { success: true };
}

export async function getAdminProfileAction() {
  return await getAdminProfile();
}

export async function updateAdminCredentialsAction(params: {
  newEmail: string;
  currentPassword: string;
  newPassword?: string;
  newName?: string;
}) {
  const res = await updateAdminCredentials(
    params.newEmail,
    params.currentPassword,
    params.newPassword,
    params.newName
  );
  if (res.success) {
    revalidatePath("/dashboard");
  }
  return res;
}
