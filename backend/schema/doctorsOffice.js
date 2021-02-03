const Ajv = require("ajv").default;
const ajv = new Ajv();
const addFormats = require("ajv-formats");
addFormats(ajv);

const doctorsOfficeSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		avatarId: {
			type: "string",
			pattern: "^[a-zA-Z0-9]+$"
		},
		pictureIds: {
			type: "array",
			items: {
				type: "string",
				pattern: "^[a-zA-Z0-9]+$"
			}
		},
		websiteUrl: {
			type: "string",
			format: "uri"
		},
		profileDescription: { type: "string" },
		address: { type: "string" },
		contactInfo: { type: "string" },
		openingHours: { type: "string" },
	},
	required: ["name"],
	additionalProperties: false,
};

module.exports = ajv.compile(doctorsOfficeSchema);
