import { Button } from "@heroui/button";

type AdminHeaderProps = {
  classroomCount: number;
  totalUsers: number;
  onLogout: () => void;
};

export const AdminHeader = ({
  classroomCount,
  totalUsers,
  onLogout,
}: AdminHeaderProps) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-foreground dark:text-default-50">
        Admin Classroom
      </h1>
      <p className="text-sm text-foreground dark:text-default-200">
        Kelola data classroom, user, dan akun admin.
      </p>
      <p className="mt-1 text-xs text-foreground dark:text-default-300">
        Total classroom: {classroomCount} · Total user: {totalUsers}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <Button color="default" variant="flat" onPress={onLogout}>
        Keluar
      </Button>
    </div>
  </div>
);
