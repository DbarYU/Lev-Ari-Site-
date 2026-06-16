import { getUserById, incrementCompletedCount, promoteUser } from "./userService";

export async function checkAndPromote(userId: string): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  if (user.isLevel0Locked || user.currentLevel === 0) return false;

  const newCount = await incrementCompletedCount(userId);

  if (newCount % 2 === 0) {
    const nextLevel = user.currentLevel + 1;
    await promoteUser(userId, nextLevel);
    // Admin is responsible for assigning the next program manually
    return true;
  }

  return false;
}
