import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI, Modality } from "@google/genai";
import { initializeApp } from "firebase-admin/app";
import * as crypto from "crypto";
initializeApp();
const FB_PIXEL_ID = "829073811611520";
/**
 * Hashes sensitive data using SHA256 as required by Facebook CAPI
 */
const hashData = (data) => {
    if (!data)
        return undefined;
    return crypto.createHash("sha256").update(String(data).trim().toLowerCase()).digest("hex");
};
export const trackCapiEvent = onCall({
    timeoutSeconds: 30,
    memory: "256MiB"
}, async (request) => {
    const { eventName, userData, customData, eventId } = request.data;
    const accessToken = process.env.FB_ACCESS_TOKEN;
    if (!accessToken) {
        logger.error("FB_ACCESS_TOKEN environment variable is not set.");
        throw new HttpsError("internal", "Server configuration error: FB Access Token is missing.");
    }
    // Hash sensitive fields if they exist
    const safeUserData = userData || {};
    const hashedUserData = {
        ...safeUserData,
        em: hashData(safeUserData.em),
        fn: hashData(safeUserData.fn),
        ln: hashData(safeUserData.ln),
        ph: hashData(safeUserData.ph),
        ge: hashData(safeUserData.ge),
        db: hashData(safeUserData.db),
        ct: hashData(safeUserData.ct),
        st: hashData(safeUserData.st),
        zp: hashData(safeUserData.zp),
        country: hashData(safeUserData.country),
        external_id: hashData(safeUserData.external_id),
    };
    // Clean up undefined values from hashedUserData
    Object.keys(hashedUserData).forEach(key => {
        if (hashedUserData[key] === undefined) {
            delete hashedUserData[key];
        }
    });
    const clientIp = request.rawRequest?.ip ||
        request.rawRequest?.headers?.["x-forwarded-for"]?.toString().split(",")[0].trim() ||
        "0.0.0.0";
    const clientUserAgent = request.rawRequest?.headers?.["user-agent"] || "Unknown";
    const payload = {
        data: [
            {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: "website",
                event_id: eventId,
                user_data: {
                    client_ip_address: clientIp,
                    client_user_agent: clientUserAgent,
                    ...hashedUserData
                },
                custom_data: customData || {}
            }
        ]
    };
    try {
        const url = `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${accessToken}`;
        logger.info(`Sending CAPI event: ${eventName}`, { eventId, payload });
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) {
            logger.error("Facebook CAPI Error Response:", result);
            throw new Error(`Facebook API error: ${JSON.stringify(result)}`);
        }
        logger.info(`CAPI event ${eventName} sent successfully`, { result });
        return { success: true, result };
    }
    catch (error) {
        logger.error("Error sending CAPI event:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to send event to Facebook.";
        throw new HttpsError("internal", errorMessage);
    }
});
export const generateAudio = onCall({
    timeoutSeconds: 120,
    memory: "512MiB"
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in to generate audio.");
    }
    const { text, voice } = request.data;
    if (!text || !voice) {
        throw new HttpsError("invalid-argument", "Text and voice are required.");
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.error("GEMINI_API_KEY environment variable is not set.");
        throw new HttpsError("internal", "Server configuration error: API Key is missing.");
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice.split('-')[0] },
                    },
                },
            },
        });
        let base64Audio = null;
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                base64Audio = part.inlineData.data;
                break;
            }
        }
        if (!base64Audio) {
            throw new Error('No audio data received from Gemini API');
        }
        return { audio: base64Audio };
    }
    catch (error) {
        logger.error("Error generating audio:", error);
        throw new HttpsError("internal", "Failed to generate audio.");
    }
});
//# sourceMappingURL=index.js.map