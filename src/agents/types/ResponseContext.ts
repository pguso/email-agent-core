export interface ResponseContext {
    guestName?: string;
    requestType: "booking" | "inquiry" | "modification";
    checkInDate?: string;
    checkOutDate?: string;
    roomsAvailable: boolean;
    suggestedPrice?: number;
    hotelName: string;
    employeeName?: string;
    hotelPolicies: {
        cancellation: string;
        checkInTime: string;
        checkOutTime: string;
    };
}