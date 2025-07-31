import { restBaseUrl } from '@openmrs/esm-framework';
import { mutate } from 'swr';
export const apiBasePath = `${restBaseUrl}/billing/`;

export const serviceConceptUuid = '609afe4f-d539-4dfe-896d-0b9897d0ee4a';

export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, {
    revalidate: true,
  });
};
