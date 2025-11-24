/**
 *
 * @param {String} blockType | The type of block [fullBlock, eksamen]
 */
export const prettyPrintBlock = (blockType) => {
	if (blockType === "fullBlock") return "Ingen internett"
	if (blockType === "eksamen") return "Eksamen med eksamenshjelpemidler"
	if (blockType === "forms") return import.meta.env.VITE_FORMS_OPTION_TEXT // VITE_FORMS_OPTION_TEXT
	if (blockType === "formsFile") return import.meta.env.VITE_FORMSFILE_OPTION_TEXT // VITE_FORMSFILE_OPTION_TEXT
}
