import { RELATED_BY_SECTION as cosmos } from './cosmosData';
import { RELATED_BY_SECTION as industrial } from './industrialData';
import { RELATED_BY_SECTION as evchain } from './evchainData';
import { RELATED_BY_SECTION as panel } from './panelData';
import { RELATED_BY_SECTION as scopeLab } from './scopeLabData';
import { RELATED_BY_SECTION as backup } from './backupData';

export const RELATED_BY_SECTION = {
  ...cosmos,
  ...industrial,
  ...evchain,
  ...panel,
  ...scopeLab,
  ...backup,
};
