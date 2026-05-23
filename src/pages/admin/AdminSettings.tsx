import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminEmptyState, AdminErrorState, AdminLoadingState, AdminNotice } from "@/components/admin/shared/AdminStates";
import { adminService } from "@/services/adminService";
import type { AdminSettingResponse, AdminSettingValue } from "@/types/admin";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error && "message" in error) return String(error.message);
    return fallback;
}

function normalizeSettings(
    settings: AdminSettingResponse[] | Record<string, AdminSettingValue>,
): AdminSettingResponse[] {
    if (Array.isArray(settings)) return settings;

    return Object.entries(settings).map(([key, value]) => ({
        key,
        value,
    }));
}

function stringifySettingValue(value: AdminSettingValue): string {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
}

function parseSettingValue(value: string): AdminSettingValue {
    const trimmed = value.trim();
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null") return null;
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);

    try {
        return JSON.parse(trimmed) as AdminSettingValue;
    } catch {
        return value;
    }
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<AdminSettingResponse[]>([]);
    const [editingSetting, setEditingSetting] = useState<AdminSettingResponse | null>(null);
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await adminService.getSettings();
            setSettings(normalizeSettings(response));
        } catch (err) {
            setError(getErrorMessage(err, "Settings endpoint is unavailable."));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    const openEditDialog = (setting: AdminSettingResponse) => {
        setEditingSetting(setting);
        setValue(stringifySettingValue(setting.value));
    };

    const valuePreview = useMemo(() => {
        if (!editingSetting) return "";
        const parsed = parseSettingValue(value);
        return stringifySettingValue(parsed);
    }, [editingSetting, value]);

    const submitSetting = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingSetting) return;

        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);
            await adminService.updateSetting(editingSetting.key, parseSettingValue(value));
            setSuccess(`${editingSetting.key} was updated.`);
            setEditingSetting(null);
            await loadSettings();
        } catch (err) {
            setError(getErrorMessage(err, "Could not update setting."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <AdminPageHeader
                title="Settings"
                description="Review and update documented admin settings. Complex values are shown as JSON."
                actions={
                    <Button variant="outline" onClick={() => void loadSettings()}>
                        <RefreshCw className="size-4" />
                        Refresh
                    </Button>
                }
            />

            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            <AdminNotice tone="success" message={success} />

            {isLoading ? (
                <AdminLoadingState title="Loading settings..." />
            ) : error && settings.length === 0 ? (
                <AdminErrorState description={error} onRetry={loadSettings} />
            ) : settings.length === 0 ? (
                <AdminEmptyState title="No settings found" />
            ) : (
                <div className="overflow-hidden rounded-md border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.map((setting) => (
                                <TableRow key={setting.key}>
                                    <TableCell className="font-medium">{setting.key}</TableCell>
                                    <TableCell className="max-w-md truncate">{stringifySettingValue(setting.value)}</TableCell>
                                    <TableCell>{setting.description ?? "N/A"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(setting)}>
                                            <Edit className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={Boolean(editingSetting)} onOpenChange={(open) => !open && setEditingSetting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit setting</DialogTitle>
                        <DialogDescription>
                            Values are parsed as boolean, null, number, JSON, or string before sending.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitSetting} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Key</Label>
                            <Input value={editingSetting?.key ?? ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="setting-value">Value</Label>
                            <textarea
                                id="setting-value"
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </div>
                        <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">Parsed preview: {valuePreview}</p>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingSetting(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
