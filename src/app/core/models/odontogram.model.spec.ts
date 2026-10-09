import { quadrantsForDentition, toothAsset } from './odontogram.model';

describe('odontogram tooth layout', () => {
  it('places all adult FDI teeth in patient-oriented quadrants', () => {
    const quadrants = quadrantsForDentition('ADULT');
    expect(quadrants.map(quadrant => quadrant.codes)).toEqual([
      ['18', '17', '16', '15', '14', '13', '12', '11'],
      ['21', '22', '23', '24', '25', '26', '27', '28'],
      ['48', '47', '46', '45', '44', '43', '42', '41'],
      ['31', '32', '33', '34', '35', '36', '37', '38'],
    ]);
  });

  it('uses the twenty primary teeth and the existing tooth illustrations', () => {
    const codes = quadrantsForDentition('PEDIATRIC').flatMap(quadrant => quadrant.codes);
    expect(codes.length).toBe(20);
    expect(codes).toContain('55');
    expect(codes).toContain('71');
    expect(codes).not.toContain('16');
    expect(toothAsset('55', 'PEDIATRIC')).toBe('/odontogram-elements/segundo_molar.png');
  });
});
