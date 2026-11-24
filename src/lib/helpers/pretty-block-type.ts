import type { BlockType } from "../types/api.js"

const blockTypeLabels: Record<BlockType, string | undefined> = {
  fullBlock: "Ingen internett",
  eksamen: "Eksamen med eksamenshjelpemidler",
  forms: import.meta.env.VITE_FORMS_OPTION_TEXT,
  formsFile: import.meta.env.VITE_FORMSFILE_OPTION_TEXT
}

const isBlockType = (value: string): value is BlockType => Object.hasOwn(blockTypeLabels, value)

export const prettyPrintBlock = (blockType: string): string | undefined => {
  if (!isBlockType(blockType)) {
    return undefined
  }

  return blockTypeLabels[blockType]
}
