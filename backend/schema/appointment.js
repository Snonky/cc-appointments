const Ajv = require("ajv").default;
const ajv = new Ajv();
const addFormats = require("ajv-formats");
addFormats(ajv);

const appointmentSchema = {
	type: "object",
	properties: {
		userId: {
			type: "string",
			pattern: "^[a-zA-Z0-9]+$"
		},
		dateTime: {
			type: "string",
			format: "date-time"
		},
		typeOfInsurance: {
			type: "string",
			enum: ["public", "private"]
		},
		reasonForVisit: { type: "string" },
	},
	required: ["userId", "dateTime", "typeOfInsurance", "reasonForVisit"],
	additionalProperties: false,
};

module.exports = ajv.compile(appointmentSchema);