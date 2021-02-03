const Ajv = require("ajv").default;
const ajv = new Ajv();
// const addFormats = require("ajv-formats");
// addFormats(ajv);

const userAppointmentSchema = {
	type: "object",
	properties: {
		appointmendId: {
			type: "string",
			pattern: "^[a-zA-Z0-9]+$"
		},
		doctorsOfficeId: {
			type: "string",
			pattern: "^[a-zA-Z0-9]+$"
		}
	},
	required: ["appointmendId", "doctorsOfficeId"],
	additionalProperties: false,
};

module.exports = ajv.compile(userAppointmentSchema);