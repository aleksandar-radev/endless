export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  // Fix shadowClone ID conflict between the regular rogue summon skill and the
  // SHADOWDANCER specialization passive skill. Both previously shared the id
  // 'shadowClone'. The specialization skill has been renamed to 'shadowClonePassive'
  // in the code, so we migrate any existing save data accordingly.
  if (data.skillTree && data.skillTree.specializationSkills) {
    if (data.skillTree.specializationSkills.shadowClone) {
      data.skillTree.specializationSkills.shadowClonePassive =
        data.skillTree.specializationSkills.shadowClone;
      delete data.skillTree.specializationSkills.shadowClone;
    }
  }

  return { data, result: true };
}
