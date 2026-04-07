import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPinHouse, Trash2 } from "lucide-react";
import { addressService } from "@/services/addressService";
import type { AddressRequest, AddressResponse } from "@/types/user";

const ProfileAddressSection = () => {
    const [addresses, setAddresses] = useState<AddressResponse[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);
    const [addressesError, setAddressesError] = useState<string | null>(null);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState<boolean>(false);

    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null);
    const [addressForm, setAddressForm] = useState<AddressRequest>({
        recipientName: "",
        phoneNumber: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        isDefault: false,
    });
    const [addressFormError, setAddressFormError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setAddressesError(null);
                setIsLoadingAddresses(true);
                const addressList = await addressService.getMyAddresses();
                setAddresses(addressList);
            } catch (error) {
                console.error("Failed to load addresses:", error);
                setAddressesError("Failed to load addresses.");
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    const resetAddressForm = () => {
        setAddressForm({
            recipientName: "",
            phoneNumber: "",
            street: "",
            ward: "",
            district: "",
            city: "",
            isDefault: false,
        });
        setAddressFormError(null);
        setEditingAddress(null);
    };

    const handleAddressInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setAddressForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSetDefaultAddress = async (id: number) => {
        try {
            setIsUpdatingAddress(true);
            await addressService.setDefaultAddress(id);
            setAddresses(prev =>
                prev.map(addr => ({
                    ...addr,
                    isDefault: addr.id === id,
                })),
            );
        } catch (error) {
            console.error("Failed to set default address:", error);
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleDeleteAddress = async (id: number) => {
        try {
            setIsUpdatingAddress(true);
            await addressService.deleteAddress(id);
            setAddresses(prev => prev.filter(addr => addr.id !== id));
        } catch (error) {
            console.error("Failed to delete address:", error);
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleAddNewAddressClick = () => {
        resetAddressForm();
        setIsAddressDialogOpen(true);
    };

    const handleEditAddressClick = (address: AddressResponse) => {
        setAddressForm({
            recipientName: address.recipientName,
            phoneNumber: address.phoneNumber,
            street: address.street,
            ward: address.ward,
            district: address.district,
            city: address.city,
            isDefault: address.isDefault,
        });
        setAddressFormError(null);
        setEditingAddress(address);
        setIsAddressDialogOpen(true);
    };

    const handleAddressDialogOpenChange = (open: boolean) => {
        setIsAddressDialogOpen(open);
        if (!open) {
            resetAddressForm();
        }
    };

    const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAddressFormError(null);

        if (!addressForm.recipientName.trim() || !addressForm.phoneNumber.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
            setAddressFormError("Please fill in all required fields.");
            return;
        }

        try {
            setIsUpdatingAddress(true);

            if (editingAddress) {
                const updated = await addressService.updateAddress(editingAddress.id, addressForm);
                setAddresses(prev =>
                    prev.map(addr => {
                        if (addr.id === updated.id) {
                            return updated;
                        }
                        if (updated.isDefault) {
                            return { ...addr, isDefault: false };
                        }
                        return addr;
                    }),
                );
            } else {
                const created = await addressService.createAddress(addressForm);
                setAddresses(prev => {
                    const updatedList = created.isDefault
                        ? prev.map(addr => ({ ...addr, isDefault: false }))
                        : prev;
                    return [...updatedList, created];
                });
            }

            setIsAddressDialogOpen(false);
            resetAddressForm();
        } catch (error) {
            console.error("Failed to save address:", error);
            setAddressFormError("Failed to save address. Please try again.");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    if (isLoadingAddresses) {
        return <p className="text-gray-600 dark:text-gray-400">Loading addresses...</p>;
    }

    if (addressesError) {
        return <p className="text-red-500 text-sm">{addressesError}</p>;
    }

    return (
        <>
            {addresses.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                    You have not added any shipping address yet.
                </p>
            ) : (
                <div className="space-y-3">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="rounded-lg border bg-white dark:bg-gray-900 p-3 flex flex-col gap-1"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="font-medium text-sm flex items-center gap-1">
                                        <MapPinHouse className="h-4 w-4 text-brand" />
                                        {addr.recipientName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {addr.phoneNumber}
                                    </p>
                                </div>
                                {addr.isDefault && (
                                    <span className="text-xs font-semibold text-green-600 border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-950 rounded-full px-2 py-0.5">
                                        Default
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                {addr.fullAddress || [
                                    addr.street,
                                    addr.ward,
                                    addr.district,
                                    addr.city,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <Button
                                    variant="outline"
                                    size="xs"
                                    disabled={addr.isDefault || isUpdatingAddress}
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                >
                                    Set default
                                </Button>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    disabled={isUpdatingAddress}
                                    onClick={() => handleEditAddressClick(addr)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950"
                                    disabled={isUpdatingAddress}
                                    onClick={() => handleDeleteAddress(addr.id)}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={handleAddNewAddressClick}
                disabled={isUpdatingAddress}
            >
                Add new address
            </Button>

            <Dialog open={isAddressDialogOpen} onOpenChange={handleAddressDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? "Edit address" : "Add new address"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress
                                ? "Update your shipping address details."
                                : "Add a new shipping address to your account."}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-3 mt-2" onSubmit={handleSubmitAddress}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="recipientName">Recipient name *</Label>
                                <Input
                                    id="recipientName"
                                    name="recipientName"
                                    value={addressForm.recipientName}
                                    onChange={handleAddressInputChange}
                                    placeholder="Full name"
                                    autoComplete="name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phoneNumber">Phone number *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={addressForm.phoneNumber}
                                    onChange={handleAddressInputChange}
                                    placeholder="e.g. 0901 234 567"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="street">Street / house number *</Label>
                            <Input
                                id="street"
                                name="street"
                                value={addressForm.street}
                                onChange={handleAddressInputChange}
                                placeholder="Street, house number, apartment, ..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="ward">Ward</Label>
                                <Input
                                    id="ward"
                                    name="ward"
                                    value={addressForm.ward}
                                    onChange={handleAddressInputChange}
                                    placeholder="Ward"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="district">District</Label>
                                <Input
                                    id="district"
                                    name="district"
                                    value={addressForm.district}
                                    onChange={handleAddressInputChange}
                                    placeholder="District"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="city">City / Province *</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={addressForm.city}
                                    onChange={handleAddressInputChange}
                                    placeholder="City or province"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                            <Label htmlFor="isDefault" className="gap-3">
                                <Checkbox
                                    id="isDefault"
                                    checked={addressForm.isDefault}
                                    onCheckedChange={checked =>
                                        setAddressForm(prev => ({
                                            ...prev,
                                            isDefault: checked === true,
                                        }))
                                    }
                                />
                                <span>Set as default shipping address</span>
                            </Label>
                        </div>

                        {addressFormError && (
                            <p className="text-xs text-red-500 mt-1">{addressFormError}</p>
                        )}

                        <DialogFooter className="mt-3 flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleAddressDialogOpenChange(false)}
                                disabled={isUpdatingAddress}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdatingAddress}>
                                {editingAddress ? "Save changes" : "Add address"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfileAddressSection;
