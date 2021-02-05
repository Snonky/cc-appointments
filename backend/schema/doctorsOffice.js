const Ajv = require("ajv").default;
const ajv = new Ajv();
const addFormats = require("ajv-formats");
addFormats(ajv);

const doctorsOfficeSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        avatarUrl: {
            type: "string",
            format: "uri"
        },
        pictureUrls: {
            type: "array",
            items: {
                type: "string",
                format: "uri"
            }
        },
        websiteUrl: {
            type: "string",
            format: "uri"
        },
        profileDescription: { type: "string" },
        address: { type: "string" },
        contactInfo: { type: "string" },
        openingHours: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    dayOfWeek: {
                        type: "number",
                        enum: [0, 1, 2, 3, 4, 5, 6]
                    },
                    open: {
                        type: "string",
                        format: "date-time"
                    },
                    close: {
                        type: "string",
                        format: "date-time"
                    }
                },
                required: ["dayOfWeek", "open", "close"],
                additionalProperties: false,
            }
        },
        dayCount: {
            type: "number",
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        timeSlot: {
            type: "number",
            enum: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240],
        },
    },
    required: ["name"],
    additionalProperties: false,
};

module.exports = ajv.compile(doctorsOfficeSchema);
