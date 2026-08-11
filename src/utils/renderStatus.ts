import { wa } from '@api/types/wa.types';

export const status: Record<number, wa.StatusMessage> = {
  0: 'ERROR',
  1: 'PENDING',
  2: 'SERVER_ACK',
  3: 'DELIVERY_ACK',
  4: 'READ',
  5: 'PLAYED',
};

export const getStatus = (statusCode: number | undefined): wa.StatusMessage => {
  if (statusCode === undefined) return 'ERROR';
  return status[statusCode] ?? 'ERROR';
};
