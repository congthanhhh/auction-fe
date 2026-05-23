import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { userService } from "@/services/userService";
import type { PermissionResponse, RoleResponse, UserProfileResponse } from "@/types/user";

function isAdminRole(role?: string | null): boolean {
    if (!role) return false;
    const normalizedRole = role.trim().toUpperCase();
    return normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
}

export function useAdminAuth() {
    const { isAuthenticated, user } = useAuthStore();
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [hasProfileAdminRole, setHasProfileAdminRole] = useState(false);
    const [isCheckingProfile, setIsCheckingProfile] = useState(false);

    const hasTokenAdminRole = useMemo(() => isAdminRole(user?.role), [user?.role]);

    useEffect(() => {
        let isMounted = true;

        const checkProfileRoles = async () => {
            if (!isAuthenticated || hasTokenAdminRole) {
                setHasProfileAdminRole(false);
                setIsCheckingProfile(false);
                return;
            }

            try {
                setIsCheckingProfile(true);
                const profile = await userService.getMyProfile();
                const profileHasAdminRole = profile.roles?.some((role) => isAdminRole(role.name)) ?? false;

                if (isMounted) {
                    setProfile(profile);
                    setHasProfileAdminRole(profileHasAdminRole);
                }
            } catch {
                if (isMounted) {
                    setProfile(null);
                    setHasProfileAdminRole(false);
                }
            } finally {
                if (isMounted) {
                    setIsCheckingProfile(false);
                }
            }
        };

        void checkProfileRoles();

        return () => {
            isMounted = false;
        };
    }, [hasTokenAdminRole, isAuthenticated]);

    return {
        isAuthenticated,
        isCheckingAdmin: isCheckingProfile,
        isAdmin: isAuthenticated && (hasTokenAdminRole || hasProfileAdminRole),
        roles: (profile?.roles ?? []) as RoleResponse[],
        permissions: (profile?.roles?.flatMap((role) => role.permissions ?? []) ?? []) as PermissionResponse[],
        user,
    };
}
