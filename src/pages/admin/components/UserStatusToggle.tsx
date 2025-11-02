import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/constants/api";

type UserStatusToggleProps = {
  classroomId: number;
  userId: number;
  initialIsActive: boolean;
  isBusy: boolean;
};

export const UserStatusToggle = ({ classroomId, userId, initialIsActive, isBusy }: UserStatusToggleProps) => {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsActive(initialIsActive);
  }, [initialIsActive]);

  const handleChange = async (nextIsActive: boolean) => {
    const originalIsActive = isActive;
    setIsActive(nextIsActive);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/classrooms/${classroomId}/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active: nextIsActive }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message ?? "Gagal memperbarui status user.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      // Revert on failure
      setIsActive(originalIsActive);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        className="h-5 w-5 rounded border-default-300 text-primary focus:ring-primary"
        type="checkbox"
        checked={isActive}
        disabled={isBusy}
        onChange={(e) => handleChange(e.target.checked)}
      />
      {error && <p className="mt-1 text-xs text-danger-500">{error}</p>}
    </div>
  );
};
