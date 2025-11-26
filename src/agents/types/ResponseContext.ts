export interface ResponseContext {
    guestName?: string;
    requestType: "booking" | "inquiry" | "modification";
    checkInDate?: string;
    checkOutDate?: string;
    roomsAvailable: boolean;
    suggestedPrice?: number;
    hotelName: string;
    hotelPolicies: {
        cancellation: string;
        checkInTime: string;
        checkOutTime: string;
    };
}