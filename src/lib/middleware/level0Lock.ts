import { getUserById } from "@/lib/services/userService";

export class Level0LockError extends Error {
  constructor() {
    super(
      "Account locked at Level 0. Complete your testing workout and wait for your coach to unlock your account."
    );
    this.name = "Level0LockError";
  }
}

export async function level0LockCheck(userId: string): Promise<void> {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  if (user.isLevel0Locked) throw new Level0LockError();
}
