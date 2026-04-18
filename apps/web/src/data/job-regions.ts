export type RegionId =
  | 'bangkok'
  | 'central'
  | 'west'
  | 'east'
  | 'northeast'
  | 'north'
  | 'south';

export const REGION_LABELS: Record<RegionId, string> = {
  bangkok: 'กรุงเทพและปริมณฑล',
  central: 'ภาคกลาง',
  west: 'ภาคตะวันตก',
  east: 'ภาคตะวันออก',
  northeast: 'ภาคตะวันออกเฉียงเหนือ',
  north: 'ภาคเหนือ',
  south: 'ภาคใต้',
};

export function isRegionId(value: string): value is RegionId {
  return value in REGION_LABELS;
}
