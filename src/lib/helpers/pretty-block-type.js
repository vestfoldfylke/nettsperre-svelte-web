/**
 * 
 * @param {String} blockType | The type of block [fullBlock, eksamen]
 */
export const prettyPrintBlock = (blockType) => {
   if(blockType === 'fullBlock') return 'Ingen internett'
   if(blockType === 'eksamen') return 'Eksamen med eksamenshjelpemidler'
   if(blockType === 'forms') return 'Prøve i Forms uten filopplastning og uten eksamenshjelpemidle'
   if(blockType === 'formsFile') return 'Prøve i Forms med filopplastning og med eksamenshjelpemidler'
  }
  