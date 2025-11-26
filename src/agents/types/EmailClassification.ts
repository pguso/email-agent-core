export interface EmailClassification {
    advert: boolean;
    category: "booking" | "inquiry" | "complaint" | "cancellation" | "other";
    priority: "urgent" | "high" | "medium" | "low";
    sentiment: "positive" | "neutral" | "negative";
    extractedInfo: {
        guestName?: string;
        checkIn?: string;
        checkOut?: string;
        roomType?: string;
        numberOfGuests?: number;
    };
    suggestedAction: string;
    confidence: number;
}