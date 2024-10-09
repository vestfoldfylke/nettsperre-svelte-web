/**
 * 
 * @param {String} blockType | The type of block [fullBlock, eksamen]
 */
export const prettyPrintBlock = (blockType) => {
   if(blockType === 'fullBlock') return 'Ingen internett'
   if(blockType === 'eksamen') return 'Eksamensperre'
  }
  