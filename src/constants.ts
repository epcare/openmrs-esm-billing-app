import { restBaseUrl } from '@openmrs/esm-framework';
import { mutate } from 'swr';
export const apiBasePath = `${restBaseUrl}/billing/`;

export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, {
    revalidate: true,
  });
};
